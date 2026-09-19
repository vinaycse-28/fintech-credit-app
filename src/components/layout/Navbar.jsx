import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Building2, 
  ChevronDown, 
  Sparkles, 
  PlusCircle, 
  BarChart3, 
  LogOut,
  User as UserIcon,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_PROFILES } from '../../services/mockData';

export default function Navbar({ 
  currentProfile, 
  onSelectDemo, 
  onSelectBusiness 
}) {
  const { user, businesses, currentBusinessId, selectBusiness, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [bizDropdownOpen, setBizDropdownOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const bizDropdownRef = useRef(null);
  const demoDropdownRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (bizDropdownRef.current && !bizDropdownRef.current.contains(e.target)) {
        setBizDropdownOpen(false);
      }
      if (demoDropdownRef.current && !demoDropdownRef.current.contains(e.target)) {
        setDemoDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activePath = location.pathname;

  // Selected business name
  const activeBusiness = businesses.find(b => b.id === currentBusinessId);
  const businessDisplayName = activeBusiness?.business_name || activeBusiness?.name || currentProfile?.name || 'Select Business';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center gap-6">
            <Link 
              to="/"
              className="flex items-center gap-3 text-left group transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-slate-900 tracking-tight">CreditBridge</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    MSME Intelligence
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 -mt-0.5">Explainable Creditworthiness</p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 border-l border-slate-200 pl-6">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activePath === '/'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Overview
              </Link>
              <Link
                to="/create-business"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activePath === '/create-business' || activePath === '/financial-data'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Intake Engine
              </Link>
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activePath.startsWith('/dashboard')
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                Lender Cockpit
              </Link>
            </nav>
          </div>

          {/* Right: Business Selector, Demo Switcher, & Auth Actions */}
          <div className="flex items-center gap-3">
            
            {/* PART 1 & 6: PRIMARY BUSINESS SELECTOR — "MY BUSINESSES" */}
            <div className="relative" ref={bizDropdownRef}>
              <button
                onClick={() => setBizDropdownOpen(!bizDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-all shadow-2xs"
                title="Select from your registered SQLite businesses"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-semibold text-slate-900 max-w-[140px] sm:max-w-[180px] truncate">
                  {businessDisplayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {bizDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in">
                  <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      My Businesses
                    </span>
                    <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded">
                      {businesses.length} Total
                    </span>
                  </div>

                  <div className="max-h-64 overflow-y-auto py-1">
                    {businesses.length === 0 ? (
                      <div className="p-4 text-center">
                        <Building2 className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-600 font-medium">No businesses registered yet</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Add your first enterprise to evaluate cash flow.</p>
                      </div>
                    ) : (
                      businesses.map((b) => {
                        const isSelected = currentBusinessId === b.id;
                        return (
                          <button
                            key={b.id}
                            onClick={() => {
                              selectBusiness(b.id);
                              if (onSelectBusiness) onSelectBusiness(b.id);
                              setBizDropdownOpen(false);
                              navigate('/dashboard');
                            }}
                            className={`w-full text-left px-3.5 py-2.5 transition-colors flex items-start justify-between ${
                              isSelected ? 'bg-blue-50/70 border-l-3 border-blue-600' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div>
                              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                {b.business_name || b.name}
                                <span className="text-[10px] font-medium px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                                  {b.business_type || b.industry || 'Enterprise'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {b.location || 'India'} &bull; Turnover: ₹{(b.declared_monthly_revenue || 0).toLocaleString()}
                              </p>
                            </div>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Create New Business CTA */}
                  <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                    <button
                      onClick={() => {
                        setBizDropdownOpen(false);
                        navigate('/create-business');
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Create New Business</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PART 1 & 25: SEPARATE OPTIONAL "TRY DEMO" FEATURE */}
            <div className="relative" ref={demoDropdownRef}>
              <button
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition-all shadow-2xs"
                title="Explore synthetic MSME demo datasets"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Try Demo</span>
                <ChevronDown className="w-3.5 h-3.5 text-amber-500 ml-0.5" />
              </button>

              {demoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-700">
                      <Sparkles className="w-3 h-3" />
                      <span>Preloaded Demo Datasets</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Optional test scenarios for judges & underwriters
                    </p>
                  </div>

                  <div className="py-1">
                    {DEMO_PROFILES.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          if (onSelectDemo) onSelectDemo(p.id);
                          setDemoDropdownOpen(false);
                          navigate('/dashboard');
                        }}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 transition-colors flex items-start justify-between border-b border-slate-50 last:border-0"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                            {p.name}
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                              p.tagColor === 'emerald' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              p.tagColor === 'indigo' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                              'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {p.tag}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{p.highlight}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200">
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 hidden sm:inline max-w-[100px] truncate">
                    {user?.full_name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.full_name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          navigate('/create-business');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                        <span>Add New Business</span>
                      </button>

                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                          navigate('/login');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
