import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Disclaimer from './components/layout/Disclaimer';

// Home Views
import Hero from './components/home/Hero';
import Benefits from './components/home/Benefits';
import Comparison from './components/home/Comparison';

// Auth Views
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/common/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Onboarding Views
import BusinessProfileForm from './components/onboarding/BusinessProfileForm';
import FinancialDataUpload from './components/onboarding/FinancialDataUpload';
import ProcessingScreen from './components/onboarding/ProcessingScreen';

// Dashboard Tabs
import OverviewTab from './components/dashboard/OverviewTab';
import FinancialAnalysisTab from './components/dashboard/FinancialAnalysisTab';
import TransactionBehaviourTab from './components/dashboard/TransactionBehaviourTab';
import TrustConsistencyTab from './components/dashboard/TrustConsistencyTab';
import ScoreExplanationTab from './components/dashboard/ScoreExplanationTab';
import TransactionHistoryTab from './components/dashboard/TransactionHistoryTab';
import CreditReportTab from './components/dashboard/CreditReportTab';
import UpdateDataTab from './components/dashboard/UpdateDataTab';
import ScoreSimulatorTab from './components/dashboard/ScoreSimulatorTab';
import LoanReadinessTab from './components/dashboard/LoanReadinessTab';

// API Service
import { 
  getCurrentProfile, 
  getSavedBusinessId,
  getBusinessProfile,
  loadDemoBusiness, 
  createBusinessProfile, 
  uploadTransactions, 
  addTransaction, 
  analyzeBusiness,
  getDashboard,
  getFinancialAnalysis,
  getTransactionBehaviour,
  getTrustAnalysis,
  getScoreExplanation
} from './services/api';
import { DEMO_TRANSACTIONS } from './services/mockData';

export default function App() {
  const { user, businesses, currentBusinessId, selectBusiness, refreshBusinesses } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Active Business & Cockpit Data State
  const [profile, setProfile] = useState(getCurrentProfile());
  const [transactions, setTransactions] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [financials, setFinancials] = useState({});
  const [behaviour, setBehaviour] = useState({});
  const [trustData, setTrustData] = useState({});
  const [scoring, setScoring] = useState({});
  const [loading, setLoading] = useState(false);

  // Load analytical data for a specific business ID
  const loadAnalysisData = async (targetBizId = null) => {
    const bizId = targetBizId || currentBusinessId || getSavedBusinessId();
    if (!bizId) return null;

    try {
      setLoading(true);
      const [dash, fin, beh, tru, sco] = await Promise.all([
        getDashboard(bizId),
        getFinancialAnalysis(bizId),
        getTransactionBehaviour(bizId),
        getTrustAnalysis(bizId),
        getScoreExplanation(bizId)
      ]);
      setDashboardData(dash);
      setFinancials(fin || {});
      setBehaviour(beh || {});
      setTrustData(tru || {});
      setScoring(sco || {});
      if (dash?.profile) {
        setProfile(dash.profile);
      }
      return dash;
    } catch (err) {
      console.warn("Notice loading dashboard data:", err?.message || err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Restore dashboard data whenever currentBusinessId changes
  useEffect(() => {
    if (currentBusinessId) {
      loadAnalysisData(currentBusinessId);
    }
  }, [currentBusinessId]);

  // Handler to switch between 4 synthetic MSME demo businesses
  const handleSelectDemo = async (demoId) => {
    setLoading(true);
    try {
      const res = await loadDemoBusiness(demoId);
      setProfile(res.profile);
      setTransactions(DEMO_TRANSACTIONS[demoId] || []);
      selectBusiness(res.business_id);
      await loadAnalysisData(res.business_id);
      navigate('/dashboard');
    } catch (e) {
      console.error("Failed to load demo", e);
    } finally {
      setLoading(false);
    }
  };

  // Switch between real user businesses
  const handleSelectBusiness = async (bizId) => {
    selectBusiness(bizId);
    await loadAnalysisData(bizId);
  };

  // Step 1: Save Business Profile & Proceed to Data Upload
  const handleSaveProfile = async (formData) => {
    try {
      const res = await createBusinessProfile(formData);
      setProfile(res.profile);
      selectBusiness(res.business_id);
      await refreshBusinesses();
      navigate('/financial-data');
    } catch (e) {
      console.error("Error saving profile", e);
    }
  };

  // Step 2: Handle Transactions Upload
  const handleUploadTransactions = async (newTxns) => {
    try {
      await uploadTransactions(newTxns, currentBusinessId);
      setTransactions(newTxns);
    } catch (e) {
      console.error("Error uploading transactions", e);
      alert("Failed to upload transactions. Please check format and try again.");
    }
  };

  // Step 2b: Handle Single Transaction Append
  const handleAddSingleTransaction = async (txn) => {
    try {
      const res = await addTransaction(txn, currentBusinessId);
      setTransactions(prev => [res.transaction, ...prev]);
      await loadAnalysisData(currentBusinessId);
    } catch (e) {
      console.error("Error adding transaction", e);
      alert("Failed to add transaction. Please verify data.");
    }
  };

  // Trigger Analysis Pipeline
  const handleStartAnalysis = () => {
    navigate('/processing');
  };

  // Complete Analysis & Land in Dashboard
  const handleAnalysisComplete = async () => {
    await analyzeBusiness(currentBusinessId);
    await loadAnalysisData(currentBusinessId);
    navigate('/dashboard');
  };

  // Re-Analyze from within Dashboard
  const handleReAnalyze = async () => {
    navigate('/processing');
  };

  // Extract current dashboard tab from URL
  const currentPath = location.pathname;
  let activeTab = 'overview';
  if (currentPath.includes('/dashboard/financial-analysis')) activeTab = 'financial-analysis';
  else if (currentPath.includes('/dashboard/transaction-behaviour')) activeTab = 'transaction-behaviour';
  else if (currentPath.includes('/dashboard/trust')) activeTab = 'trust';
  else if (currentPath.includes('/dashboard/score')) activeTab = 'score';
  else if (currentPath.includes('/dashboard/transactions')) activeTab = 'transactions';
  else if (currentPath.includes('/dashboard/report')) activeTab = 'report';
  else if (currentPath.includes('/dashboard/update-data')) activeTab = 'update-data';
  else if (currentPath.includes('/dashboard/simulator')) activeTab = 'simulator';
  else if (currentPath.includes('/dashboard/loan-readiness')) activeTab = 'loan-readiness';

  const handleTabSelect = (tabId) => {
    if (tabId === 'overview') navigate('/dashboard');
    else navigate(`/dashboard/${tabId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white font-sans text-slate-900">
      
      {/* Global Fintech Navbar */}
      <Navbar
        currentProfile={profile}
        onSelectDemo={handleSelectDemo}
        onSelectBusiness={handleSelectBusiness}
      />

      {/* Main Content Router */}
      <main className="flex-1 flex flex-col">
        <Routes>
          
          {/* SCREEN 1: HOME PAGE */}
          <Route path="/" element={
            <div className="animate-fade-in flex-1">
              <Hero
                onStartOnboarding={() => navigate('/create-business')}
                onViewDemo={() => handleSelectDemo('demo_1')}
              />
              <Benefits onSelectDemo={handleSelectDemo} />
              <Comparison onSelectDemo={handleSelectDemo} />
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <Disclaimer />
              </div>
            </div>
          } />

          {/* AUTH ROUTES */}
          <Route path="/login" element={<Login onSelectDemo={handleSelectDemo} />} />
          <Route path="/register" element={<Register />} />

          {/* SCREEN 2: CREATE BUSINESS PROFILE */}
          <Route path="/create-business" element={
            <ProtectedRoute>
              <div className="animate-fade-in flex-1">
                <BusinessProfileForm
                  initialProfile={profile}
                  onSubmit={handleSaveProfile}
                  onBack={() => navigate(-1)}
                />
              </div>
            </ProtectedRoute>
          } />
          {/* Legacy route alias */}
          <Route path="/create-profile" element={<Navigate to="/create-business" replace />} />

          {/* SCREEN 3: ADD FINANCIAL DATA */}
          <Route path="/financial-data" element={
            <ProtectedRoute>
              <div className="animate-fade-in flex-1">
                <FinancialDataUpload
                  transactions={transactions}
                  onUploadTransactions={handleUploadTransactions}
                  onAddTransaction={handleAddSingleTransaction}
                  onAnalyze={handleStartAnalysis}
                  onBack={() => navigate('/create-business')}
                />
              </div>
            </ProtectedRoute>
          } />
          {/* Legacy route alias */}
          <Route path="/upload-data" element={<Navigate to="/financial-data" replace />} />

          {/* SCREEN 4: PROCESSING SCREEN */}
          <Route path="/processing" element={
            <div className="animate-fade-in flex-1">
              <ProcessingScreen onComplete={handleAnalysisComplete} />
            </div>
          } />

          {/* SCREEN 5: BUSINESS DASHBOARD (Cockpit with all tabs) */}
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <div className="flex-1 flex flex-col md:flex-row">
                
                {/* Sidebar Navigation */}
                <Sidebar
                  currentTab={activeTab}
                  onSelectTab={handleTabSelect}
                  warningCount={scoring?.riskWarnings?.length || dashboardData?.warnings?.length || 0}
                />

                {/* Dashboard Content Canvas */}
                <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                  
                  {loading && !dashboardData ? (
                    <div className="flex items-center justify-center min-h-[50vh]">
                      <div className="text-center p-8 bg-white rounded-2xl border border-slate-200">
                        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-xs text-slate-600 font-semibold">Loading Underwriter Cockpit...</p>
                      </div>
                    </div>
                  ) : (!currentBusinessId && businesses.length === 0) ? (
                    <div className="text-center max-w-md mx-auto py-16 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 font-bold">
                        1
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-1">No Business Registered Yet</h3>
                      <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                        Create your first business profile and upload transactions to evaluate cash flow and generate an explainable credit signal.
                      </p>
                      <button
                        onClick={() => navigate('/create-business')}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                      >
                        Register First Business
                      </button>
                    </div>
                  ) : (
                    <>
                      {activeTab === 'overview' && (
                        <OverviewTab
                          profile={profile}
                          dashboardData={dashboardData}
                          onNavigateTab={handleTabSelect}
                        />
                      )}

                      {activeTab === 'financial-analysis' && (
                        <FinancialAnalysisTab financials={financials} />
                      )}

                      {activeTab === 'transaction-behaviour' && (
                        <TransactionBehaviourTab behaviour={behaviour} financials={financials} />
                      )}

                      {(activeTab === 'trust' || activeTab === 'trust-consistency') && (
                        <TrustConsistencyTab trustData={trustData} />
                      )}

                      {(activeTab === 'score' || activeTab === 'score-explanation') && (
                        <ScoreExplanationTab scoring={scoring} />
                      )}

                      {activeTab === 'simulator' && (
                        <ScoreSimulatorTab
                          currentScore={dashboardData?.summary?.score || 78}
                          businessId={currentBusinessId}
                        />
                      )}

                      {activeTab === 'loan-readiness' && (
                        <LoanReadinessTab
                          dashboardData={dashboardData}
                          profile={profile}
                        />
                      )}

                      {(activeTab === 'transactions' || activeTab === 'transaction-history') && (
                        <TransactionHistoryTab businessId={currentBusinessId} />
                      )}

                      {(activeTab === 'report' || activeTab === 'credit-report') && (
                        <CreditReportTab
                          profile={profile}
                          analysis={dashboardData}
                          financials={financials}
                          behaviour={behaviour}
                          trustData={trustData}
                          scoring={scoring}
                          onBack={() => handleTabSelect('overview')}
                        />
                      )}

                      {activeTab === 'update-data' && (
                        <UpdateDataTab
                          onUploadTransactions={handleUploadTransactions}
                          onAddTransaction={handleAddSingleTransaction}
                          onReAnalyze={handleReAnalyze}
                          transactionCount={transactions.length}
                        />
                      )}
                    </>
                  )}

                  {/* Regulatory Disclaimer */}
                  <div className="mt-8">
                    <Disclaimer compact />
                  </div>
                </div>

              </div>
            </ProtectedRoute>
          } />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </main>

      {/* Global Minimal Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 px-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} CreditBridge &bull; Explainable MSME Credit Intelligence</span>
          <span className="text-[11px] text-slate-400">
            Decision Support Only &bull; Human-in-the-Loop &bull; SQLite Persistence
          </span>
        </div>
      </footer>

    </div>
  );
}
