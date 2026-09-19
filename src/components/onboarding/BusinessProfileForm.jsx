import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Users, 
  Calendar, 
  IndianRupee, 
  CreditCard, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Info 
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export default function BusinessProfileForm({ 
  initialProfile, 
  onSubmit, 
  onBack 
}) {
  const [formData, setFormData] = useState({
    name: initialProfile?.name || '',
    industry: initialProfile?.industry || 'Retail & FMCG',
    location: initialProfile?.location || '',
    age: initialProfile?.age || '3 years',
    employees: initialProfile?.employees || '5',
    declaredMonthlyRevenue: initialProfile?.declaredMonthlyRevenue || 450000,
    existingMonthlyEmi: initialProfile?.existingMonthlyEmi || 25000,
    primaryPaymentMethods: initialProfile?.primaryPaymentMethods || ['UPI', 'Bank Transfer'],
    description: initialProfile?.description || ''
  });

  const [errors, setErrors] = useState({});

  const industries = [
    'Retail & FMCG',
    'Food & Beverage / Cloud Kitchen',
    'Consumer Electronics & Repairs',
    'Textiles & Apparel',
    'Light Manufacturing & Hardware',
    'Automotive & Spare Parts',
    'Healthcare & Pharmacy',
    'Professional & Local Services'
  ];

  const paymentOptions = ['UPI', 'Bank Transfer', 'Cash', 'Card / PoS', 'Cheque'];

  const togglePaymentMethod = (method) => {
    setFormData(prev => {
      const exists = prev.primaryPaymentMethods.includes(method);
      if (exists) {
        return { ...prev, primaryPaymentMethods: prev.primaryPaymentMethods.filter(m => m !== method) };
      } else {
        return { ...prev, primaryPaymentMethods: [...prev.primaryPaymentMethods, method] };
      }
    });
  };

  const handlePreFill = () => {
    setFormData({
      name: 'Indira Provision Stores',
      industry: 'Retail & FMCG',
      location: 'Malleshwaram, Bengaluru, Karnataka',
      age: '4 years',
      employees: '6',
      declaredMonthlyRevenue: 480000,
      existingMonthlyEmi: 28000,
      primaryPaymentMethods: ['UPI', 'Bank Transfer', 'Cash'],
      description: 'Daily provisions and grocery retailer servicing residential apartments with recurring customer UPI orders.'
    });
    setErrors({});
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Business name is required';
    if (!formData.location.trim()) errs.location = 'Location is required';
    if (!formData.declaredMonthlyRevenue || Number(formData.declaredMonthlyRevenue) <= 0) {
      errs.declaredMonthlyRevenue = 'Please specify valid declared monthly revenue';
    }
    if (formData.primaryPaymentMethods.length === 0) {
      errs.primaryPaymentMethods = 'Select at least one payment method';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Onboarding Stepper Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</span>
            <h2 className="text-xl font-bold text-slate-900">Create Business Profile</h2>
          </div>
          <button
            type="button"
            onClick={handlePreFill}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pre-fill Sample MSME</span>
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Capture essential firmographic context. This data is cross-examined against uploaded ledgers to assess financial story consistency.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Row 1: Name & Industry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Business Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Shree Retail Traders"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                    errors.name ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
                  }`}
                />
              </div>
              {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Business Type / Industry <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {industries.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Location & Age */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Business Location (City, State) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Indiranagar, Bengaluru, Karnataka"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                    errors.location ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
                  }`}
                />
              </div>
              {errors.location && <p className="text-[11px] text-rose-500 mt-1">{errors.location}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Business Age (Vintage)
                </label>
                <input
                  type="text"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="e.g. 4 years"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Employees
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.employees}
                  onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                  placeholder="e.g. 5"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Declared Revenue & EMI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Declared Monthly Revenue (₹) <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-slate-400 font-normal">Used for Story Check</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  step="1000"
                  value={formData.declaredMonthlyRevenue}
                  onChange={(e) => setFormData({ ...formData, declaredMonthlyRevenue: e.target.value })}
                  placeholder="480000"
                  className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 ${
                    errors.declaredMonthlyRevenue ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
                  }`}
                />
              </div>
              {errors.declaredMonthlyRevenue && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.declaredMonthlyRevenue}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Existing Monthly EMI Obligations (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  step="500"
                  value={formData.existingMonthlyEmi}
                  onChange={(e) => setFormData({ ...formData, existingMonthlyEmi: e.target.value })}
                  placeholder="28000"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Primary Payment Methods */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Primary Payment Collection Methods <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2.5">
              {paymentOptions.map((method) => {
                const isSelected = formData.primaryPaymentMethods.includes(method);
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => togglePaymentMethod(method)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    <span>{method}</span>
                  </button>
                );
              })}
            </div>
            {errors.primaryPaymentMethods && (
              <p className="text-[11px] text-rose-500 mt-1.5">{errors.primaryPaymentMethods}</p>
            )}
          </div>

          {/* Business Description / Operational Summary */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Operational Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief summary of business nature, key suppliers, or seasonal trends..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>

          {/* Navigation Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:shadow-lg"
            >
              <span>Save and Continue to Financial Data</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </form>
      </Card>
    </div>
  );
}
