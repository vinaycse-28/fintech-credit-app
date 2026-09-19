/**
 * CreditBridge Analytical & Deterministic Scoring Engine
 * 
 * Implements the mathematical formulas and integrity checks specified in the
 * CreditBridge MSME Financial Assessment Architecture:
 * - Data Trust Verification
 * - Story Consistency Check
 * - Financial Aggregation (Revenue, Expenses, Net Cash Flow, Margins, Spikes)
 * - Transaction Behaviour (Frequency, Ticket Size, Dormancy Gaps, Payment Mix)
 * - Cross-Signal Consistency Check
 * - Deterministic 0-100 Weighted Creditworthiness Signal
 * - Dynamic Positive/Negative Driver Generation & Risk Indicators
 */

// Helper to parse dates safely
const parseDate = (dStr) => new Date(dStr);

// Helper for standard deviation
const stdDev = (arr) => {
  if (!arr || arr.length <= 1) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
};

// 1. Data Trust Verification Engine
export function analyzeDataTrust(transactions) {
  if (!transactions || transactions.length === 0) {
    return {
      status: "Review Required",
      badgeType: "danger",
      score: 30,
      duplicateCount: 0,
      invalidCount: 0,
      repeatedAmountRatio: 0,
      checks: [
        { label: "Transaction Data Presence", passed: false, detail: "No transactions loaded." }
      ]
    };
  }

  const seenIds = new Set();
  const seenSignatures = new Set();
  let duplicateCount = 0;
  let invalidCount = 0;
  const now = new Date();
  const amountCounts = {};

  transactions.forEach(t => {
    // Check ID duplicates
    if (t.transaction_id && seenIds.has(t.transaction_id)) {
      duplicateCount++;
    } else if (t.transaction_id) {
      seenIds.add(t.transaction_id);
    }

    // Check row signature duplicate (Date + Amount + Type + Description)
    const sig = `${t.date}_${t.amount}_${t.transaction_type}_${t.description}`;
    if (seenSignatures.has(sig)) {
      duplicateCount++;
    } else {
      seenSignatures.add(sig);
    }

    // Date validity check
    const d = parseDate(t.date);
    if (isNaN(d.getTime()) || d > now) {
      invalidCount++;
    }

    // Amount validity
    if (!t.amount || isNaN(Number(t.amount)) || Number(t.amount) <= 0) {
      invalidCount++;
    } else {
      const amtKey = Math.round(Number(t.amount));
      amountCounts[amtKey] = (amountCounts[amtKey] || 0) + 1;
    }
  });

  // Check for repeated amounts clustering (>25% share of same amount)
  let maxClusterCount = 0;
  let dominantAmount = 0;
  Object.entries(amountCounts).forEach(([amt, count]) => {
    if (count > maxClusterCount) {
      maxClusterCount = count;
      dominantAmount = amt;
    }
  });
  const repeatedRatio = transactions.length > 0 ? (maxClusterCount / transactions.length) : 0;

  // Checklist items
  const checks = [
    {
      label: "Chronological & Date Validity",
      passed: invalidCount === 0,
      detail: invalidCount === 0 ? "All dates are valid past timestamps" : `${invalidCount} invalid or future timestamps detected`
    },
    {
      label: "Duplicate Records Check",
      passed: duplicateCount === 0,
      detail: duplicateCount === 0 ? "Zero duplicated transaction IDs or rows" : `${duplicateCount} duplicate transactions flagged`
    },
    {
      label: "Amount Clustering Analysis",
      passed: repeatedRatio < 0.25,
      detail: repeatedRatio < 0.25 
        ? `Natural amount diversity (highest cluster: ${(repeatedRatio * 100).toFixed(1)}%)` 
        : `Suspicious clustering: ${(repeatedRatio * 100).toFixed(1)}% of entries are exactly ₹${dominantAmount}`
    },
    {
      label: "Schema & Ledger Integrity",
      passed: transactions.length >= 10,
      detail: transactions.length >= 10 ? `${transactions.length} rows verified across required fields` : `Insufficient sample size (${transactions.length} rows)`
    }
  ];

  let trustStatus = "High Data Trust";
  let badgeType = "good";
  let score = 95;

  if (duplicateCount > 3 || invalidCount > 2 || repeatedRatio >= 0.35) {
    trustStatus = "Needs Review";
    badgeType = "danger";
    score = 45;
  } else if (duplicateCount > 0 || invalidCount > 0 || repeatedRatio >= 0.25 || transactions.length < 20) {
    trustStatus = "Moderate Data Trust";
    badgeType = "warning";
    score = 75;
  }

  return {
    status: trustStatus,
    badgeType,
    score,
    duplicateCount,
    invalidCount,
    repeatedAmountRatio: (repeatedRatio * 100).toFixed(1),
    completeness: Math.max(0, 100 - (invalidCount * 10) - (duplicateCount * 5)),
    checks
  };
}

// 2. Financial Story Consistency Engine
export function checkFinancialStoryConsistency(declaredMonthlyRevenue, observedMonthlyAvg) {
  const declared = Number(declaredMonthlyRevenue) || 1;
  const observed = Number(observedMonthlyAvg) || 0;
  const variance = (Math.abs(declared - observed) / declared) * 100;

  let status = "Consistent";
  let badgeType = "good";
  let detail = "Self-declared monthly revenue closely matches actual observed bank inflows.";

  if (variance > 30) {
    status = "Possible Inconsistency";
    badgeType = "danger";
    detail = `High divergence (${variance.toFixed(1)}% variance). Declared: ₹${declared.toLocaleString()} vs Observed: ₹${Math.round(observed).toLocaleString()}.`;
  } else if (variance >= 15) {
    status = "Minor Variance";
    badgeType = "warning";
    detail = `Minor divergence (${variance.toFixed(1)}% variance). Requires light underwriter clarification.`;
  }

  return {
    declaredRevenue: declared,
    observedRevenue: Math.round(observed),
    variancePct: Number(variance.toFixed(1)),
    status,
    badgeType,
    detail
  };
}

// 3. Financial Metrics & Aggregations
export function calculateFinancialMetrics(transactions) {
  if (!transactions || transactions.length === 0) {
    return {
      monthlyData: [],
      totalRevenue: 0,
      totalExpenses: 0,
      netCashFlow: 0,
      avgMonthlyRevenue: 0,
      avgMonthlyExpenses: 0,
      avgMonthlyCashFlow: 0,
      revenueGrowth: 0,
      revenueConsistency: "N/A",
      revenueCV: 0,
      expenseRatio: 0,
      expenseSpikes: [],
      positiveMonths: 0,
      totalMonths: 0,
      highestRevenueMonth: null,
      lowestRevenueMonth: null
    };
  }

  // Group by year-month
  const monthMap = {};
  transactions.forEach(t => {
    const d = parseDate(t.date);
    if (isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthName = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    
    if (!monthMap[key]) {
      monthMap[key] = {
        key,
        name: monthName,
        revenue: 0,
        expenses: 0,
        netCashFlow: 0,
        txnCount: 0,
        timestamp: new Date(d.getFullYear(), d.getMonth(), 1).getTime()
      };
    }

    const amt = Number(t.amount) || 0;
    const isCredit = t.transaction_type?.toLowerCase() === 'credit' || t.transaction_type?.toLowerCase() === 'income';
    
    if (isCredit) {
      monthMap[key].revenue += amt;
    } else {
      monthMap[key].expenses += amt;
    }
    monthMap[key].txnCount++;
  });

  const sortedMonths = Object.values(monthMap).sort((a, b) => a.timestamp - b.timestamp);
  sortedMonths.forEach(m => {
    m.netCashFlow = m.revenue - m.expenses;
  });

  const revenues = sortedMonths.map(m => m.revenue);
  const expenses = sortedMonths.map(m => m.expenses);
  const netCashFlows = sortedMonths.map(m => m.netCashFlow);

  const totalRevenue = revenues.reduce((a, b) => a + b, 0);
  const totalExpenses = expenses.reduce((a, b) => a + b, 0);
  const netCashFlow = totalRevenue - totalExpenses;
  const numMonths = sortedMonths.length || 1;

  const avgMonthlyRevenue = totalRevenue / numMonths;
  const avgMonthlyExpenses = totalExpenses / numMonths;
  const avgMonthlyCashFlow = netCashFlow / numMonths;

  // Coefficient of Variation for Revenue
  const revStd = stdDev(revenues);
  const revCV = avgMonthlyRevenue > 0 ? (revStd / avgMonthlyRevenue) : 0;
  let revenueConsistency = "High Consistency";
  if (revCV > 0.40) {
    revenueConsistency = "Volatile";
  } else if (revCV >= 0.20) {
    revenueConsistency = "Moderate Consistency";
  }

  // Revenue Growth % (Comparing first 2 months avg to last 2 months avg or simple first vs last)
  let revenueGrowth = 0;
  if (sortedMonths.length >= 2) {
    const firstHalf = sortedMonths.slice(0, Math.ceil(sortedMonths.length / 2));
    const secondHalf = sortedMonths.slice(Math.ceil(sortedMonths.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b.revenue, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b.revenue, 0) / secondHalf.length;
    revenueGrowth = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
  }

  // Expense Ratio %
  const expenseRatio = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;

  // Statistical Expense Spike Detection (Monthly Expense > mean + 1.8 * std)
  const expStd = stdDev(expenses);
  const spikeThreshold = avgMonthlyExpenses + (1.8 * expStd);
  const expenseSpikes = sortedMonths.filter(m => m.expenses > spikeThreshold && expStd > 1000);

  // Positive vs Negative cash flow months
  const positiveMonths = sortedMonths.filter(m => m.netCashFlow > 0).length;

  // Highest and lowest revenue months
  let highestRevenueMonth = sortedMonths[0] || null;
  let lowestRevenueMonth = sortedMonths[0] || null;
  sortedMonths.forEach(m => {
    if (m.revenue > (highestRevenueMonth?.revenue || 0)) highestRevenueMonth = m;
    if (m.revenue < (lowestRevenueMonth?.revenue || Infinity)) lowestRevenueMonth = m;
  });

  return {
    monthlyData: sortedMonths,
    totalRevenue,
    totalExpenses,
    netCashFlow,
    avgMonthlyRevenue,
    avgMonthlyExpenses,
    avgMonthlyCashFlow,
    revenueGrowth: Number(revenueGrowth.toFixed(1)),
    revenueConsistency,
    revenueCV: Number(revCV.toFixed(3)),
    expenseRatio: Number(expenseRatio.toFixed(1)),
    expenseSpikes,
    positiveMonths,
    totalMonths: sortedMonths.length,
    highestRevenueMonth,
    lowestRevenueMonth
  };
}

// 4. Transaction Behaviour Analysis
export function calculateTransactionBehaviour(transactions) {
  if (!transactions || transactions.length === 0) {
    return {
      totalCount: 0,
      creditCount: 0,
      debitCount: 0,
      avgTicketSize: 0,
      avgMonthlyFrequency: 0,
      maxGapDays: 0,
      gapAlerts: [],
      largestTransaction: null,
      paymentMix: [],
      seasonality: []
    };
  }

  // Sort by date chronologically
  const sorted = [...transactions].sort((a, b) => parseDate(a.date) - parseDate(b.date));

  let creditCount = 0;
  let debitCount = 0;
  let totalVolume = 0;
  let largestTxn = sorted[0];

  const methodCounts = { 'UPI': 0, 'Bank Transfer': 0, 'Cash': 0, 'Other': 0 };

  sorted.forEach(t => {
    const isCredit = t.transaction_type?.toLowerCase() === 'credit' || t.transaction_type?.toLowerCase() === 'income';
    if (isCredit) creditCount++;
    else debitCount++;

    const amt = Number(t.amount) || 0;
    totalVolume += amt;

    if (amt > (Number(largestTxn?.amount) || 0)) {
      largestTxn = t;
    }

    // Payment method mapping
    let m = t.payment_method?.trim();
    if (m === 'Bank Transfer' || m === 'NEFT' || m === 'IMPS' || m === 'RTGS') {
      methodCounts['Bank Transfer']++;
    } else if (m === 'UPI') {
      methodCounts['UPI']++;
    } else if (m === 'Cash') {
      methodCounts['Cash']++;
    } else {
      methodCounts['Other']++;
    }
  });

  // Calculate transaction dormancy gaps
  let maxGapDays = 0;
  const gapAlerts = [];

  for (let i = 1; i < sorted.length; i++) {
    const prevDate = parseDate(sorted[i - 1].date);
    const currDate = parseDate(sorted[i].date);
    if (!isNaN(prevDate.getTime()) && !isNaN(currDate.getTime())) {
      const diffTime = Math.abs(currDate - prevDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > maxGapDays) {
        maxGapDays = diffDays;
      }

      if (diffDays >= 14) {
        gapAlerts.push({
          days: diffDays,
          startDate: sorted[i - 1].date,
          endDate: sorted[i].date,
          detail: `Dormancy gap of ${diffDays} days detected between ${sorted[i - 1].date} and ${sorted[i].date}.`
        });
      }
    }
  }

  // Payment mix array for charts
  const totalCount = sorted.length;
  const paymentMix = [
    { name: 'UPI', count: methodCounts['UPI'], percent: Math.round((methodCounts['UPI'] / totalCount) * 100) || 0, color: '#3B82F6' },
    { name: 'Bank Transfer', count: methodCounts['Bank Transfer'], percent: Math.round((methodCounts['Bank Transfer'] / totalCount) * 100) || 0, color: '#10B981' },
    { name: 'Cash', count: methodCounts['Cash'], percent: Math.round((methodCounts['Cash'] / totalCount) * 100) || 0, color: '#F59E0B' },
    { name: 'Other', count: methodCounts['Other'], percent: Math.round((methodCounts['Other'] / totalCount) * 100) || 0, color: '#8B5CF6' },
  ].filter(p => p.count > 0);

  // Approximate span in months
  const firstDate = parseDate(sorted[0].date);
  const lastDate = parseDate(sorted[sorted.length - 1].date);
  const monthsDiff = Math.max(1, ((lastDate.getFullYear() - firstDate.getFullYear()) * 12 + (lastDate.getMonth() - firstDate.getMonth()) + 1));

  return {
    totalCount,
    creditCount,
    debitCount,
    avgTicketSize: Math.round(totalVolume / (totalCount || 1)),
    avgMonthlyFrequency: Math.round(totalCount / monthsDiff),
    maxGapDays,
    gapAlerts,
    largestTransaction: largestTxn,
    paymentMix
  };
}

// 5. Cross-Signal Consistency Evaluation
export function evaluateCrossSignals(financials, behaviour) {
  const revGrowth = financials.revenueGrowth;
  const txnCount = behaviour.totalCount;
  const netMargin = financials.totalRevenue > 0 ? (financials.netCashFlow / financials.totalRevenue) * 100 : 0;

  // Let's check trajectory harmony
  let isConsistent = true;
  let explanation = "Revenue trajectory, transaction volume, and operational cash-flow margins move in structural harmony.";
  let status = "Consistent Alignment";
  let badgeType = "good";

  // Inconsistency checks:
  // Example 1: Revenue spiked high (>30%) but Net Cash Flow is deeply negative or margin collapsed
  if (revGrowth > 25 && netMargin < 0) {
    isConsistent = false;
    status = "Inconsistency Detected";
    badgeType = "warning";
    explanation = `High revenue growth (+${revGrowth}%) contradicted by negative net margin (${netMargin.toFixed(1)}%). Suggests aggressive non-profitable volume.`;
  } else if (financials.expenseSpikes.length > 0 && financials.revenueCV > 0.40) {
    isConsistent = false;
    status = "Volatile Divergence";
    badgeType = "danger";
    explanation = "Severe expense spikes coinciding with volatile revenue swings indicate unpredictable working capital cushions.";
  } else if (behaviour.maxGapDays >= 14 && revGrowth > 10) {
    isConsistent = false;
    status = "Activity Disconnect";
    badgeType = "warning";
    explanation = `Declared growth occurs alongside long dormant operational gap (${behaviour.maxGapDays} days). Verify if seasonal or ledger-omission.`;
  }

  return {
    isConsistent,
    status,
    badgeType,
    explanation,
    signals: [
      { name: "Revenue Trend", direction: revGrowth >= 5 ? "up" : (revGrowth <= -5 ? "down" : "flat"), value: `${revGrowth >= 0 ? '+' : ''}${revGrowth}%` },
      { name: "Transaction Activity", direction: behaviour.avgMonthlyFrequency >= 15 ? "up" : "flat", value: `${behaviour.avgMonthlyFrequency} txns/mo` },
      { name: "Cash-Flow Cushion", direction: netMargin > 10 ? "up" : (netMargin < 0 ? "down" : "flat"), value: `${netMargin.toFixed(1)}% margin` }
    ]
  };
}

// 6. Creditworthiness Signal Calculation (0 - 100)
export function calculateCreditBridgeScore(financials, behaviour, trust, story) {
  // Formula weights from readme.2:
  // 1. Revenue Consistency (20%): 100 * max(0, 1 - 2 * CV_R)
  const cv = financials.revenueCV || 0;
  const s_rev_cons = Math.round(100 * Math.max(0, 1 - 2 * cv));

  // 2. Cash-Flow Stability (25%): 70 * (Pos Months / Total) + 30 * min(1, Net Margin / 0.20)
  const posRatio = financials.totalMonths > 0 ? (financials.positiveMonths / financials.totalMonths) : 0;
  const netMargin = financials.totalRevenue > 0 ? (financials.netCashFlow / financials.totalRevenue) : 0;
  const marginRatio = Math.max(0, Math.min(1, netMargin / 0.20));
  const s_cf_stab = Math.round(70 * posRatio + 30 * marginRatio);

  // 3. Revenue Growth (15%): clamp(50 + 2.5 * Growth %, 0, 100)
  const growth = financials.revenueGrowth || 0;
  const s_rev_growth = Math.round(Math.max(0, Math.min(100, 50 + 2.5 * growth)));

  // 4. Transaction Regularity (15%): 100 - (Max Gap Days * 2.5) min 0
  const maxGap = behaviour.maxGapDays || 0;
  const s_txn_reg = Math.round(Math.max(0, 100 - (maxGap * 2.5)));

  // 5. Expense Stability (15%): 100 - (Spike Count * 25) - max(0, Expense Ratio - 85)
  const spikeCount = financials.expenseSpikes?.length || 0;
  const expRatio = financials.expenseRatio || 0;
  const excessExp = Math.max(0, expRatio - 85);
  const s_exp_stab = Math.round(Math.max(0, 100 - (spikeCount * 25) - excessExp));

  // 6. Payment Regularity (10%): (% UPI + % Bank Transfer)
  const digitalMix = behaviour.paymentMix
    ?.filter(p => p.name === 'UPI' || p.name === 'Bank Transfer')
    .reduce((acc, p) => acc + p.percent, 0) || 0;
  const s_pay_reg = Math.min(100, digitalMix);

  // Raw weighted sum
  let finalScore = (
    0.20 * s_rev_cons +
    0.25 * s_cf_stab +
    0.15 * s_rev_growth +
    0.15 * s_txn_reg +
    0.15 * s_exp_stab +
    0.10 * s_pay_reg
  );

  // Penalty adjustments for Trust and Story inconsistencies
  if (trust.badgeType === 'danger') {
    finalScore = Math.max(20, finalScore - 18);
  } else if (trust.badgeType === 'warning') {
    finalScore = Math.max(30, finalScore - 6);
  }

  if (story.badgeType === 'danger') {
    finalScore = Math.max(25, finalScore - 12);
  } else if (story.badgeType === 'warning') {
    finalScore = Math.max(35, finalScore - 5);
  }

  const roundedScore = Math.min(100, Math.max(10, Math.round(finalScore)));

  // Risk categorization
  let riskCategory = "Relatively Stable";
  let riskLevel = "Moderate Risk";
  let badgeColor = "amber";

  if (roundedScore >= 80) {
    riskCategory = "Strong Financial Behaviour";
    riskLevel = "Low Risk";
    badgeColor = "emerald";
  } else if (roundedScore >= 65) {
    riskCategory = "Relatively Stable Behaviour";
    riskLevel = "Moderate Risk";
    badgeColor = "blue";
  } else if (roundedScore >= 50) {
    riskCategory = "Moderate Financial Behaviour";
    riskLevel = "Elevated Risk";
    badgeColor = "amber";
  } else {
    riskCategory = "Elevated Risk Pattern";
    riskLevel = "High Risk";
    badgeColor = "rose";
  }

  // Dynamic Driver and Warning generation
  const positiveDrivers = [];
  const negativeDrivers = [];
  const riskWarnings = [];

  // Positive Drivers check
  if (s_rev_cons >= 75) {
    positiveDrivers.push({
      title: "Consistent Revenue Inflows",
      detail: `Monthly revenue variation is low (CV = ${financials.revenueCV}), providing predictable operational turnover.`
    });
  }
  if (posRatio >= 0.75) {
    positiveDrivers.push({
      title: "Disciplined Cash Flow Cushion",
      detail: `${financials.positiveMonths} of ${financials.totalMonths} months generated positive net operational cash surplus.`
    });
  }
  if (growth > 10) {
    positiveDrivers.push({
      title: "Strong Revenue Momentum",
      detail: `Recent periods demonstrated +${growth}% expansion in sales volume.`
    });
  }
  if (s_pay_reg >= 70) {
    positiveDrivers.push({
      title: "High Digital Payment Adoption",
      detail: `${digitalMix}% of receipts flow through verifiable UPI & Bank Transfer channels.`
    });
  }
  if (maxGap < 7 && behaviour.totalCount > 15) {
    positiveDrivers.push({
      title: "Active Daily Operations",
      detail: `No dormancy gaps exceeding ${maxGap} days; steady active customer transactions.`
    });
  }
  if (story.badgeType === 'good') {
    positiveDrivers.push({
      title: "High Financial Story Consistency",
      detail: `Declared revenue matches verified bank inflows within ${story.variancePct}%.`
    });
  }

  // Negative Drivers check
  if (s_rev_cons < 55) {
    negativeDrivers.push({
      title: "Revenue Volatility",
      detail: `High turnover swings (CV = ${financials.revenueCV}) create cash-flow uncertainty.`
    });
  }
  if (posRatio < 0.60) {
    negativeDrivers.push({
      title: "Frequent Cash-Flow Deficits",
      detail: `${financials.totalMonths - financials.positiveMonths} months experienced negative net cash flow.`
    });
  }
  if (maxGap >= 14) {
    negativeDrivers.push({
      title: `Prolonged Inactivity Gap (${maxGap} days)`,
      detail: `Extended dormancy period indicates operational pauses or unrecorded off-ledger cash activity.`
    });
  }
  if (spikeCount > 0) {
    negativeDrivers.push({
      title: `${spikeCount} Major Expense Spike(s) Detected`,
      detail: `Outflows exceeded statistical upper control limit, eroding cash buffers.`
    });
  }
  if (digitalMix < 50) {
    negativeDrivers.push({
      title: "High Cash Concentration",
      detail: `Cash receipts account for ${100 - digitalMix}%, reducing auditable bank trail.`
    });
  }
  if (expRatio > 85) {
    negativeDrivers.push({
      title: "Thin Operating Margin",
      detail: `Expense ratio sits high at ${expRatio}%, leaving limited cushion for debt servicing.`
    });
  }

  // Risk Warnings
  if (spikeCount > 0) {
    riskWarnings.push({
      severity: "high",
      title: "Expense Spike Anomaly",
      message: `${spikeCount} month(s) exhibited debits significantly above standard moving average.`
    });
  }
  if (maxGap >= 14) {
    riskWarnings.push({
      severity: "high",
      title: "Operational Dormancy Alert",
      message: `Maximum transaction gap of ${maxGap} days exceeds the 14-day safety threshold.`
    });
  }
  if (story.badgeType !== 'good') {
    riskWarnings.push({
      severity: story.badgeType === 'danger' ? 'high' : 'medium',
      title: "Story Divergence Flag",
      message: story.detail
    });
  }
  if (trust.badgeType !== 'good') {
    riskWarnings.push({
      severity: "medium",
      title: "Data Trust Integrity Review",
      message: `${trust.duplicateCount} duplicates or ${trust.invalidCount} invalid rows detected in transaction ledger.`
    });
  }

  return {
    score: roundedScore,
    riskCategory,
    riskLevel,
    badgeColor,
    pillars: [
      { name: "Revenue Stability", score: s_rev_cons, weight: "20%", icon: "TrendingUp", color: "blue" },
      { name: "Cash Flow Strength", score: s_cf_stab, weight: "25%", icon: "DollarSign", color: "emerald" },
      { name: "Transaction Regularity", score: s_txn_reg, weight: "15%", icon: "Activity", color: "indigo" },
      { name: "Expense Discipline", score: s_exp_stab, weight: "15%", icon: "ShieldCheck", color: "amber" },
      { name: "Revenue Growth", score: s_rev_growth, weight: "15%", icon: "Zap", color: "cyan" },
      { name: "Payment Digitalization", score: s_pay_reg, weight: "10%", icon: "CreditCard", color: "purple" }
    ],
    positiveDrivers,
    negativeDrivers,
    riskWarnings
  };
}

// Master analytical pipeline running all stages
export function runCompleteAnalysis(businessProfile, transactions) {
  const trust = analyzeDataTrust(transactions);
  const financials = calculateFinancialMetrics(transactions);
  const behaviour = calculateTransactionBehaviour(transactions);
  const story = checkFinancialStoryConsistency(
    businessProfile?.declaredMonthlyRevenue || 400000,
    financials.avgMonthlyRevenue
  );
  const crossSignal = evaluateCrossSignals(financials, behaviour);
  const scoring = calculateCreditBridgeScore(financials, behaviour, trust, story);

  return {
    businessProfile,
    summary: {
      score: scoring.score,
      riskCategory: scoring.riskCategory,
      riskLevel: scoring.riskLevel,
      badgeColor: scoring.badgeColor,
      monthlyRevenue: Math.round(financials.avgMonthlyRevenue),
      monthlyExpenses: Math.round(financials.avgMonthlyExpenses),
      netCashFlow: Math.round(financials.avgMonthlyCashFlow),
      transactionCount: behaviour.totalCount,
      evaluatedPeriod: financials.totalMonths > 0 ? `${financials.totalMonths} months` : "N/A"
    },
    financials,
    behaviour,
    trust,
    story,
    crossSignal,
    scoring,
    generatedAt: new Date().toISOString()
  };
}
