/**
 * CreditBridge API Client Service Layer
 *
 * Routes all requests to the FastAPI backend when VITE_BACKEND_URL is set.
 * Persists only the active `business_id` in localStorage, keeping the SQLite
 * database as the sole source of truth across browser refresh, frontend restart,
 * and FastAPI restart.
 */

import { DEMO_PROFILES, DEMO_TRANSACTIONS } from './mockData';
import { runCompleteAnalysis } from './engine';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '';
const USE_REMOTE_API = Boolean(API_BASE_URL);

// In-memory cache for fast UI updates
let currentBusinessId = null;
let currentProfile = null;
let currentTransactions = [];
let currentAnalysis = null;

export function getSavedToken() {
  try {
    return localStorage.getItem('creditbridge_token') || null;
  } catch {
    return null;
  }
}

export function setSavedToken(token) {
  try {
    if (token) {
      localStorage.setItem('creditbridge_token', token);
    } else {
      localStorage.removeItem('creditbridge_token');
    }
  } catch (e) {
    console.warn('Could not update creditbridge_token in localStorage', e);
  }
}

// Initialize session state from localStorage
try {
  const savedBizId = localStorage.getItem('creditbridge_business_id');
  if (savedBizId) {
    currentBusinessId = savedBizId;
    if (savedBizId.startsWith('demo_')) {
      const demoId = savedBizId.replace('demo_', '');
      const foundProfile = DEMO_PROFILES.find(p => p.id === demoId) || DEMO_PROFILES[0];
      currentProfile = { ...foundProfile, id: savedBizId };
      currentTransactions = [...(DEMO_TRANSACTIONS[demoId] || DEMO_TRANSACTIONS.apex_logistics || [])];
      currentAnalysis = runCompleteAnalysis(currentProfile, currentTransactions);
    }
  }
} catch (e) {
  console.warn('Could not restore session from localStorage', e);
}

/**
 * Retrieve saved business_id identifier from localStorage
 */
export function getSavedBusinessId() {
  try {
    return localStorage.getItem('creditbridge_business_id') || currentBusinessId;
  } catch {
    return currentBusinessId;
  }
}

/**
 * Persist in-memory state across tab navigation without polluting localStorage with raw datasets
 */
export function persistLocalSession(profile, txns) {
  try {
    if (profile) {
      currentProfile = profile;
    }
    if (txns && txns.length) {
      currentTransactions = txns;
    }
  } catch (e) {
    console.warn('Could not persist session locally', e);
  }
}

/**
 * Set or clear the saved business_id in localStorage
 */
export function setSavedBusinessId(bizId) {
  currentBusinessId = bizId;
  try {
    if (bizId) {
      localStorage.setItem('creditbridge_business_id', bizId);
    } else {
      localStorage.removeItem('creditbridge_business_id');
    }
  } catch (e) {
    console.warn('Could not update creditbridge_business_id in localStorage', e);
  }
}

/**
 * Retrieve cached dashboard analysis data for a specific business ID from localStorage
 */
export function getCachedAnalysisData(bizId) {
  try {
    if (!bizId) return null;
    const raw = localStorage.getItem(`creditbridge_cache_${bizId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Persist cached dashboard analysis data to localStorage for instantaneous restoration
 */
export function setCachedAnalysisData(bizId, data) {
  try {
    if (bizId && data) {
      localStorage.setItem(`creditbridge_cache_${bizId}`, JSON.stringify(data));
    }
  } catch (e) {
    console.warn('Could not cache analysis data locally', e);
  }
}

// Simulate network delay for local offline fallback
const delay = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms));

// Generic API fetch helper with Bearer token authentication
const apiFetch = async (path, options = {}) => {
  const token = getSavedToken();
  const headers = {
    ...(options.headers || {})
  };
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    let errDetail = res.statusText;
    try {
      const body = await res.json();
      errDetail = body.error || body.detail || res.statusText;
    } catch (_) {}
    throw new Error(`API Error (${res.status}): ${errDetail}`);
  }
  return res.json();
};

// Resilient API fetch that falls back to client engine if backend is offline
const safeApiFetch = async (path, options = {}) => {
  try {
    return await apiFetch(path, options);
  } catch (err) {
    console.warn(`[API] Remote call to ${path} unavailable:`, err?.message || err);
    return null;
  }
};

/**
 * AUTH APIs
 */
export async function registerUser(payload) {
  const data = await apiFetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (data?.access_token) {
    setSavedToken(data.access_token);
  }
  return data;
}

export async function loginUser(email, password) {
  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (data?.access_token) {
    setSavedToken(data.access_token);
  }
  return data;
}

export async function getAuthMe() {
  const token = getSavedToken();
  if (!token) return null;
  return await safeApiFetch('/api/auth/me');
}

export async function getUserBusinesses() {
  const data = await safeApiFetch('/api/businesses');
  return data?.businesses || [];
}

export async function runScoreSimulator(params) {
  const bizId = params.business_id || getSavedBusinessId();
  return await safeApiFetch('/api/score-simulator', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      business_id: bizId,
      revenue_change_pct: params.revenue_change_pct || 0,
      expense_change_pct: params.expense_change_pct || 0,
      payment_consistency: params.payment_consistency || 50,
      transaction_consistency: params.transaction_consistency || 50
    })
  });
}

export async function getScoreHistory(businessId = null) {
  const bizId = businessId || getSavedBusinessId();
  return await safeApiFetch(`/api/score-history/${bizId || ''}`);
}

/**
 * 1. Create or update the business profile in SQLite
 */
export async function createBusinessProfile(profileData) {
  const id = profileData.id || `biz_${Date.now()}`;
  if (USE_REMOTE_API) {
    const data = await safeApiFetch('/api/business-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    if (data) {
      if (data.business_id) setSavedBusinessId(data.business_id);
      if (data.profile) currentProfile = { ...data.profile };
      persistLocalSession(currentProfile, currentTransactions);
      return data;
    }
  }

  await delay(120);
  currentProfile = {
    ...profileData,
    id,
  };
  setSavedBusinessId(id);
  persistLocalSession(currentProfile, currentTransactions);
  return { success: true, business_id: id, profile: currentProfile };
}

/**
 * 1b. Fetch business profile by ID from SQLite
 */
export async function getBusinessProfile(businessId = null) {
  const bizId = businessId || getSavedBusinessId();
  if (!bizId) return currentProfile;

  if (USE_REMOTE_API) {
    const data = await safeApiFetch(`/api/business-profile/${bizId}`);
    if (data && data.id) {
      currentProfile = data;
      setSavedBusinessId(data.id);
      persistLocalSession(currentProfile, currentTransactions);
      return data;
    }
  }

  return currentProfile;
}

/**
 * 2. Upload transaction dataset to SQLite (supports JSON array or CSV)
 */
export async function uploadTransactions(transactions, businessId = null) {
  const bizId = businessId || getSavedBusinessId();
  if (USE_REMOTE_API) {
    const data = await safeApiFetch('/api/upload-transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions, business_id: bizId }),
    });
    if (data) {
      currentTransactions = [...transactions];
      persistLocalSession(currentProfile, currentTransactions);
      return data;
    }
  }

  await delay(200);
  if (!Array.isArray(transactions) || transactions.length === 0) {
    throw new Error('Invalid transaction payload: Expected non-empty array of records.');
  }
  currentTransactions = [...transactions];
  persistLocalSession(currentProfile, currentTransactions);
  return {
    success: true,
    count: currentTransactions.length,
    sample: currentTransactions.slice(0, 5),
    transactions_saved: currentTransactions.length,
    total_rows: currentTransactions.length,
    valid_rows: currentTransactions.length,
    invalid_rows: 0,
    duplicate_rows: 0,
  };
}

/**
 * 2b. Upload CSV file directly using multipart/form-data
 */
export async function uploadTransactionCSV(file, businessId = null) {
  const bizId = businessId || getSavedBusinessId();
  if (USE_REMOTE_API) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (bizId) {
        formData.append('business_id', bizId);
      }
      const res = await fetch(`${API_BASE_URL}/api/upload-transactions`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        return res.json();
      }
    } catch (e) {
      console.warn('Remote CSV upload unavailable, falling back:', e);
    }
  }

  throw new Error('CSV upload requires the backend server. Please upload manual transactions or select a demo business.');
}

/**
 * 3. Add single manual transaction to SQLite
 */
export async function addTransaction(transaction, businessId = null) {
  const bizId = businessId || getSavedBusinessId();
  if (USE_REMOTE_API) {
    const url = bizId ? `/api/transactions?business_id=${bizId}` : '/api/transactions';
    const data = await safeApiFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
    if (data) {
      currentTransactions = [transaction, ...currentTransactions];
      persistLocalSession(currentProfile, currentTransactions);
      return data;
    }
  }

  await delay(100);
  const newTxn = {
    transaction_id: transaction.transaction_id || `TXN-MAN-${Date.now().toString().slice(-6)}`,
    date: transaction.date,
    amount: Number(transaction.amount),
    transaction_type: transaction.transaction_type,
    category: transaction.category || 'General',
    payment_method: transaction.payment_method || 'UPI',
    description: transaction.description || 'Manual transaction entry',
  };
  currentTransactions = [newTxn, ...currentTransactions];
  persistLocalSession(currentProfile, currentTransactions);
  return { success: true, transaction: newTxn, totalCount: currentTransactions.length };
}

/**
 * 4. Run analytical pipeline and persist AnalysisResult in SQLite
 */
export async function analyzeBusiness(businessId = null) {
  const bizId = businessId || getSavedBusinessId();
  if (USE_REMOTE_API && bizId) {
    const data = await safeApiFetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ business_id: bizId }),
    });
    if (data) {
      currentAnalysis = data;
      return currentAnalysis;
    }
  }

  await delay(300);
  currentAnalysis = runCompleteAnalysis(currentProfile, currentTransactions);
  return currentAnalysis;
}

/**
 * 5. Get top-level dashboard overview from SQLite
 */
export async function getDashboard(businessId = null) {
  const bizId = businessId || getSavedBusinessId();
  if (USE_REMOTE_API && bizId) {
    const data = await safeApiFetch(`/api/dashboard/${bizId}`);
    if (data) {
      if (data?.profile) currentProfile = data.profile;
      return data;
    }
  }

  await delay(80);
  if (!currentProfile) {
    if (bizId && bizId.startsWith('demo_')) {
      const demoId = bizId.replace('demo_', '');
      currentProfile = DEMO_PROFILES.find(p => p.id === demoId) || DEMO_PROFILES[0];
      currentTransactions = DEMO_TRANSACTIONS[demoId] || DEMO_TRANSACTIONS.apex_logistics || [];
    } else {
      currentProfile = DEMO_PROFILES[0];
      currentTransactions = DEMO_TRANSACTIONS.apex_logistics;
    }
    persistLocalSession(currentProfile, currentTransactions);
  }
  if (!currentAnalysis) {
    currentAnalysis = runCompleteAnalysis(currentProfile, currentTransactions);
  }
  return {
    profile: currentProfile,
    summary: currentAnalysis.summary,
    scoring: currentAnalysis.scoring,
    financials: currentAnalysis.financials,
    behaviour: currentAnalysis.behaviour,
    trust: currentAnalysis.trust,
    story: currentAnalysis.story,
    monthlyPreview: currentAnalysis.financials?.monthlyData?.slice(-6) || [],
    trustStatus: currentAnalysis.trust?.status,
    trustBadgeType: currentAnalysis.trust?.badgeType,
    storyStatus: currentAnalysis.story?.status,
    crossSignal: currentAnalysis.crossSignal,
  };
}

/**
 * 6. Get detailed financial analysis from SQLite
 */
export async function getFinancialAnalysis(businessId = null) {
  const bizId = businessId || getSavedBusinessId();
  if (USE_REMOTE_API && bizId) {
    const data = await safeApiFetch(`/api/financial-analysis/${bizId}`);
    if (data) return data;
  }

  await delay(80);
  if (!currentAnalysis) currentAnalysis = runCompleteAnalysis(currentProfile, currentTransactions);
  return currentAnalysis.financials;
}

/**
 * 7. Get transaction behaviour insights from SQLite
 */
export async function getTransactionBehaviour(businessId = null) {
  const bizId = businessId || getSavedBusinessId();
  if (USE_REMOTE_API && bizId) {
    const data = await safeApiFetch(`/api/transaction-behaviour/${bizId}`);
    if (data) return data;
  }

  await delay(80);
  if (!currentAnalysis) currentAnalysis = runCompleteAnalysis(currentProfile, currentTransactions);
  return currentAnalysis.behaviour;
}

/**
 * 8. Get trust and story consistency analysis from SQLite
 */
export async function getTrustAnalysis(businessId = null) {
  const bizId = businessId || getSavedBusinessId();
  if (USE_REMOTE_API && bizId) {
    const data = await safeApiFetch(`/api/trust-analysis/${bizId}`);
    if (data) return data;
  }

  await delay(80);
  if (!currentAnalysis) currentAnalysis = runCompleteAnalysis(currentProfile, currentTransactions);
  return {
    trust: currentAnalysis.trust,
    story: currentAnalysis.story,
    crossSignal: currentAnalysis.crossSignal,
  };
}

/**
 * 9. Get explainable score breakdown and drivers from SQLite
 */
export async function getScoreExplanation(businessId = null) {
  const bizId = businessId || getSavedBusinessId();
  if (USE_REMOTE_API && bizId) {
    const data = await safeApiFetch(`/api/score-explanation/${bizId}`);
    if (data) return data;
  }

  await delay(80);
  if (!currentAnalysis) currentAnalysis = runCompleteAnalysis(currentProfile, currentTransactions);
  return currentAnalysis.scoring;
}



/**
 * 10. Get searchable & filterable transaction history from SQLite
 */
export async function getTransactions({ search = '', type = 'all', category = 'all', year = 'all', month = 'all', page = 1, pageSize = 15, businessId = null } = {}) {
  const bizId = businessId || getSavedBusinessId();
  if (USE_REMOTE_API && bizId) {
    const params = new URLSearchParams({ search, type, category, year, month, page, pageSize });
    const data = await safeApiFetch(`/api/transactions/${bizId}?${params}`);
    if (data) return data;
  }

  await delay(60);
  let filtered = [...currentTransactions];

  if (type !== 'all') {
    filtered = filtered.filter(t => t.transaction_type?.toLowerCase() === type.toLowerCase());
  }
  if (category !== 'all') {
    filtered = filtered.filter(t => t.category?.toLowerCase() === category.toLowerCase());
  }
  if (year !== 'all' && String(year).trim()) {
    const yStr = String(year).trim();
    filtered = filtered.filter(t => {
      if (!t.date) return false;
      const d = new Date(t.date);
      if (!isNaN(d.getTime())) {
        return d.getFullYear().toString() === yStr;
      }
      return String(t.date).startsWith(yStr);
    });
  }
  if (month !== 'all' && String(month).trim()) {
    const mStr = String(month).trim();
    const monthNum = !isNaN(parseInt(mStr, 10)) 
      ? parseInt(mStr, 10) 
      : new Date(`${mStr} 1, 2000`).getMonth() + 1;

    filtered = filtered.filter(t => {
      if (!t.date) return false;
      const d = new Date(t.date);
      if (!isNaN(d.getTime())) {
        return (d.getMonth() + 1) === monthNum;
      }
      const parts = String(t.date).split('-');
      if (parts.length >= 2) {
        return parseInt(parts[1], 10) === monthNum;
      }
      return false;
    });
  }
  if (search.trim()) {
    const s = search.toLowerCase();
    filtered = filtered.filter(t =>
      t.description?.toLowerCase().includes(s) ||
      t.transaction_id?.toLowerCase().includes(s) ||
      t.payment_method?.toLowerCase().includes(s) ||
      t.category?.toLowerCase().includes(s)
    );
  }

  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  const total = filtered.length;
  const startIndex = (page - 1) * pageSize;
  const items = filtered.slice(startIndex, startIndex + pageSize);
  const categories = Array.from(new Set(currentTransactions.map(t => t.category).filter(Boolean)));

  const yearsSet = new Set();
  currentTransactions.forEach(t => {
    if (t.date) {
      const d = new Date(t.date);
      if (!isNaN(d.getTime())) {
        yearsSet.add(d.getFullYear().toString());
      } else if (String(t.date).split('-')[0]?.length === 4) {
        yearsSet.add(String(t.date).split('-')[0]);
      }
    }
  });
  const years = Array.from(yearsSet).sort((a, b) => b - a);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
    categories,
    years
  };
}

/**
 * 11. Generate full credit assessment report from SQLite
 */
export async function generateCreditReport(businessId = null) {
  const bizId = businessId || getSavedBusinessId();
  if (USE_REMOTE_API) {
    const url = bizId ? `/api/credit-report/${bizId}` : '/api/credit-report';
    const data = await safeApiFetch(url);
    if (data) return data;
  }

  await delay(100);
  if (!currentAnalysis) currentAnalysis = runCompleteAnalysis(currentProfile, currentTransactions);
  return {
    reportId: `CB-REP-${Date.now().toString().slice(-8)}`,
    generatedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    profile: currentProfile,
    analysis: currentAnalysis,
  };
}

export const getCreditReport = generateCreditReport;

/**
 * 12. Helper to switch between the 3 preloaded MSME demo profiles
 */
export async function loadDemoBusiness(demoId) {
  const profile = DEMO_PROFILES.find(p => p.id === demoId) || DEMO_PROFILES[0];
  const txns = DEMO_TRANSACTIONS[demoId] || DEMO_TRANSACTIONS.shree_retail;
  const bizId = `demo_${demoId}`;

  if (USE_REMOTE_API) {
    const createRes = await safeApiFetch('/api/business-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...profile,
        id: bizId,
      }),
    });

    if (createRes) {
      setSavedBusinessId(bizId);

      await safeApiFetch('/api/upload-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: txns, business_id: bizId }),
      });

      const analysis = await safeApiFetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_id: bizId }),
      });

      currentProfile = createRes.profile || profile;
      currentAnalysis = analysis;
      currentTransactions = [...txns];
      persistLocalSession(currentProfile, currentTransactions);

      return {
        business_id: bizId,
        profile: currentProfile,
        analysis: currentAnalysis,
        transactionCount: txns.length,
      };
    }
  }

  currentProfile = { ...profile, id: bizId };
  currentTransactions = [...txns];
  currentAnalysis = runCompleteAnalysis(currentProfile, currentTransactions);
  setSavedBusinessId(bizId);
  persistLocalSession(currentProfile, currentTransactions);

  await delay(150);
  return {
    business_id: bizId,
    profile: currentProfile,
    analysis: currentAnalysis,
    transactionCount: currentTransactions.length,
  };
}

/**
 * Get currently active business profile
 */
export function getCurrentProfile() {
  return currentProfile;
}

/**
 * Reset application data
 */
export function resetToDefault() {
  setSavedBusinessId(null);
  currentProfile = null;
  currentTransactions = [];
  currentAnalysis = null;
  try {
    localStorage.removeItem('creditbridge_screen');
    localStorage.removeItem('creditbridge_business_id');
    localStorage.removeItem('creditbridge_profile');
    localStorage.removeItem('creditbridge_transactions');
  } catch (_) {}
  return { success: true };
}
