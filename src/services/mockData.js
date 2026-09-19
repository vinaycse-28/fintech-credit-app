// Pre-loaded realistic synthetic MSME demo profiles and ledgers
// Designed to represent:
// 1. Shree Retail Traders: Stable, consistent retail grocery (~80/100, High Trust)
// 2. Urban Foods: Fast-growing cloud kitchen (~86/100, Strong Growth)
// 3. Metro Electronics: Volatile electronics repair shop with expense spike & dormancy gap (~46/100, Elevated Risk)

export const DEMO_PROFILES = [
  {
    id: "shree_retail",
    name: "Shree Retail Traders",
    industry: "Retail & FMCG",
    location: "Indiranagar, Bengaluru, Karnataka",
    age: "4 years",
    employees: "6",
    declaredMonthlyRevenue: 480000,
    existingMonthlyEmi: 28000,
    primaryPaymentMethods: ["UPI", "Bank Transfer", "Cash"],
    description: "Neighbourhood retail grocery and daily essentials store operating since 2022 with steady walk-in footfall and digital supplier disbursements.",
    tag: "Stable Behaviour",
    tagColor: "emerald",
    highlight: "Steady revenue, 7/8 positive cash flow months, 82% digital payments, zero long gaps."
  },
  {
    id: "urban_foods",
    name: "Urban Foods Cloud Kitchen",
    industry: "Food & Beverage",
    location: "Bandra West, Mumbai, Maharashtra",
    age: "2 years",
    employees: "9",
    declaredMonthlyRevenue: 350000,
    existingMonthlyEmi: 15000,
    primaryPaymentMethods: ["UPI", "Bank Transfer"],
    description: "Fast-casual cloud kitchen specializing in delivery orders via Zomato/Swiggy and direct digital ordering counter.",
    tag: "High Growth",
    tagColor: "indigo",
    highlight: "Accelerating +28% QoQ revenue, 91% UPI payments, disciplined 71% expense ratio."
  },
  {
    id: "metro_electronics",
    name: "Metro Electronics & Services",
    industry: "Consumer Electronics & Repairs",
    location: "Chandni Chowk, Delhi",
    age: "1.5 years",
    employees: "3",
    declaredMonthlyRevenue: 550000,
    existingMonthlyEmi: 42000,
    primaryPaymentMethods: ["Cash", "UPI", "Bank Transfer"],
    description: "Electronics spare parts, mobile repairs, and refurbished accessories retailer experiencing supply volatility.",
    tag: "Elevated Risk",
    tagColor: "rose",
    highlight: "Erratic cash flow, Month 4 inventory spike, 18-day dormancy gap, 38% cash share."
  }
];

// Helper to generate realistic transaction history for Shree Retail Traders (8 months)
const generateShreeTransactions = () => {
  const txns = [];
  let id = 1;
  const months = [
    { year: 2026, month: 1, name: "Jan 2026", inBase: 440000, outBase: 340000 },
    { year: 2026, month: 2, name: "Feb 2026", inBase: 420000, outBase: 330000 },
    { year: 2026, month: 3, name: "Mar 2026", inBase: 450000, outBase: 355000 },
    { year: 2026, month: 4, name: "Apr 2026", inBase: 435000, outBase: 345000 },
    { year: 2026, month: 5, name: "May 2026", inBase: 460000, outBase: 360000 },
    { year: 2026, month: 6, name: "Jun 2026", inBase: 450000, outBase: 350000 },
    { year: 2026, month: 7, name: "Jul 2026", inBase: 475000, outBase: 370000 },
    { year: 2026, month: 8, name: "Aug 2026", inBase: 485000, outBase: 375000 },
  ];

  months.forEach(m => {
    // 5 credits per month
    const daysCredit = [3, 8, 14, 21, 27];
    daysCredit.forEach((d, idx) => {
      const amt = Math.round((m.inBase / 5) * (0.92 + idx * 0.04));
      const payMethod = idx === 4 ? "Cash" : (idx % 2 === 0 ? "UPI" : "Bank Transfer");
      txns.push({
        transaction_id: `TXN-SRT-${String(id++).padStart(4, '0')}`,
        date: `${m.year}-${String(m.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        amount: amt,
        transaction_type: "credit",
        category: "Sales Revenue",
        payment_method: payMethod,
        description: `Customer batch sales & counter receipts`
      });
    });

    // 4 debits per month
    const daysDebit = [5, 12, 19, 26];
    daysDebit.forEach((d, idx) => {
      const amt = Math.round((m.outBase / 4) * (0.94 + idx * 0.03));
      const payMethod = idx === 3 ? "Cash" : (idx === 0 ? "Bank Transfer" : "UPI");
      const cats = ["Inventory Purchase", "Rent & Utilities", "Supplier Settlement", "Operational Expenses"];
      txns.push({
        transaction_id: `TXN-SRT-${String(id++).padStart(4, '0')}`,
        date: `${m.year}-${String(m.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        amount: amt,
        transaction_type: "debit",
        category: cats[idx],
        payment_method: payMethod,
        description: `${cats[idx]} payout`
      });
    });
  });

  return txns;
};

// Helper for Urban Foods (Growing cloud kitchen, 6 months)
const generateUrbanFoodsTransactions = () => {
  const txns = [];
  let id = 1;
  const months = [
    { year: 2026, month: 3, name: "Mar 2026", inBase: 260000, outBase: 190000 },
    { year: 2026, month: 4, name: "Apr 2026", inBase: 290000, outBase: 210000 },
    { year: 2026, month: 5, name: "May 2026", inBase: 330000, outBase: 235000 },
    { year: 2026, month: 6, name: "Jun 2026", inBase: 370000, outBase: 260000 },
    { year: 2026, month: 7, name: "Jul 2026", inBase: 410000, outBase: 285000 },
    { year: 2026, month: 8, name: "Aug 2026", inBase: 460000, outBase: 315000 },
  ];

  months.forEach(m => {
    // 6 credits (high frequency digital)
    const daysCredit = [2, 6, 11, 16, 22, 28];
    daysCredit.forEach((d, idx) => {
      const amt = Math.round((m.inBase / 6) * (0.90 + idx * 0.04));
      txns.push({
        transaction_id: `TXN-UF-${String(id++).padStart(4, '0')}`,
        date: `${m.year}-${String(m.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        amount: amt,
        transaction_type: "credit",
        category: "Delivery Payouts",
        payment_method: idx === 5 ? "Bank Transfer" : "UPI",
        description: `Food delivery partner automated settlement`
      });
    });

    // 4 debits
    const daysDebit = [4, 12, 18, 26];
    daysDebit.forEach((d, idx) => {
      const amt = Math.round((m.outBase / 4) * (0.95 + idx * 0.03));
      const cats = ["Raw Material & Groceries", "Commercial Kitchen Lease", "Staff Payroll", "Packaging Supplies"];
      txns.push({
        transaction_id: `TXN-UF-${String(id++).padStart(4, '0')}`,
        date: `${m.year}-${String(m.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        amount: amt,
        transaction_type: "debit",
        category: cats[idx],
        payment_method: "UPI",
        description: `${cats[idx]} settlement`
      });
    });
  });

  return txns;
};

// Helper for Metro Electronics (Volatile, gap in April, expense spike in June)
const generateMetroElectronicsTransactions = () => {
  const txns = [];
  let id = 1;
  const months = [
    { year: 2026, month: 1, inBase: 510000, outBase: 420000 },
    { year: 2026, month: 2, inBase: 380000, outBase: 410000 }, // Neg cash flow
    { year: 2026, month: 3, inBase: 590000, outBase: 440000 },
    { year: 2026, month: 4, inBase: 310000, outBase: 360000, hasGap: true }, // Long gap (April 6 to April 25)
    { year: 2026, month: 5, inBase: 640000, outBase: 480000 },
    { year: 2026, month: 6, inBase: 420000, outBase: 780000, hasSpike: true }, // Major expense spike: ₹7.8L out
    { year: 2026, month: 7, inBase: 530000, outBase: 460000 },
    { year: 2026, month: 8, inBase: 470000, outBase: 450000 },
  ];

  months.forEach(m => {
    if (m.hasGap) {
      // Intentionally create 19-day gap between April 5 and April 24
      txns.push({
        transaction_id: `TXN-ME-${String(id++).padStart(4, '0')}`,
        date: `2026-04-04`,
        amount: 140000,
        transaction_type: "credit",
        category: "Sales Revenue",
        payment_method: "Cash",
        description: "Retail hardware components cash sale"
      });
      txns.push({
        transaction_id: `TXN-ME-${String(id++).padStart(4, '0')}`,
        date: `2026-04-05`,
        amount: 180000,
        transaction_type: "debit",
        category: "Vendor Payment",
        payment_method: "Bank Transfer",
        description: "Wholesale component vendor payment"
      });
      // Long gap here! Next is April 24
      txns.push({
        transaction_id: `TXN-ME-${String(id++).padStart(4, '0')}`,
        date: `2026-04-24`,
        amount: 170000,
        transaction_type: "credit",
        category: "Sales Revenue",
        payment_method: "UPI",
        description: "Repair service payments"
      });
      txns.push({
        transaction_id: `TXN-ME-${String(id++).padStart(4, '0')}`,
        date: `2026-04-26`,
        amount: 180000,
        transaction_type: "debit",
        category: "Rent & Utilities",
        payment_method: "Cash",
        description: "Shop space lease rental"
      });
      return;
    }

    // Normal or spike month
    const daysCredit = [4, 11, 18, 25];
    daysCredit.forEach((d, idx) => {
      const amt = Math.round((m.inBase / 4) * (0.88 + idx * 0.08));
      const payMethod = idx % 2 === 0 ? "Cash" : (idx === 1 ? "UPI" : "Bank Transfer");
      txns.push({
        transaction_id: `TXN-ME-${String(id++).padStart(4, '0')}`,
        date: `${m.year}-${String(m.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        amount: amt,
        transaction_type: "credit",
        category: "Sales Revenue",
        payment_method: payMethod,
        description: `Electronics wholesale & consumer sales`
      });
    });

    const daysDebit = [6, 14, 21, 28];
    daysDebit.forEach((d, idx) => {
      let amt = Math.round((m.outBase / 4) * (0.92 + idx * 0.05));
      let cat = "Inventory Restocking";
      let desc = "Spare parts & screen inventory";
      if (m.hasSpike && idx === 1) {
        amt = 420000; // Single massive spike!
        cat = "Emergency Bulk Inventory Purchase";
        desc = "Unplanned bulk purchase of premium displays";
      }
      const payMethod = idx === 0 ? "Cash" : "Bank Transfer";
      txns.push({
        transaction_id: `TXN-ME-${String(id++).padStart(4, '0')}`,
        date: `${m.year}-${String(m.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        amount: amt,
        transaction_type: "debit",
        category: cat,
        payment_method: payMethod,
        description: desc
      });
    });
  });

  return txns;
};

export const DEMO_TRANSACTIONS = {
  shree_retail: generateShreeTransactions(),
  urban_foods: generateUrbanFoodsTransactions(),
  metro_electronics: generateMetroElectronicsTransactions()
};
