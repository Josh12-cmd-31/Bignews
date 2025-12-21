
import React, { useState } from 'react';
import { X, Heart, DollarSign, ArrowRight, ShieldCheck, Loader2, CheckCircle2, CreditCard } from 'lucide-react';
import Logo from './Logo';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
  isDark?: boolean;
}

const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose, onSuccess, isDark }) => {
  const [amount, setAmount] = useState<number>(5);
  const [customValue, setCustomValue] = useState('');
  const [step, setStep] = useState<'select' | 'processing' | 'success'>('select');
  const [isCustom, setIsCustom] = useState(false);

  if (!isOpen) return null;

  const handlePresetClick = (val: number) => {
    setAmount(val);
    setIsCustom(false);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomValue(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) setAmount(parsed);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 1) return;
    setStep('processing');
    
    // Simulate PayPal Checkout
    setTimeout(() => {
      onSuccess(amount);
      setStep('success');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative transition-all ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        {step === 'select' && (
          <div className="p-8">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <Heart size={32} className="animate-pulse fill-current" />
              </div>
              <h2 className={`text-2xl font-black font-serif mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Support Big News</h2>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Independent journalism needs your support. Help us keep the news free and AI-powered.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {[5, 10, 25, 50].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handlePresetClick(val)}
                    className={`py-3 rounded-xl font-bold transition-all border-2 ${
                      !isCustom && amount === val 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                        : isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600' : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-blue-50/30'
                    }`}
                  >
                    ${val}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setIsCustom(true)}
                  className={`w-full py-3 rounded-xl font-bold transition-all border-2 text-sm ${
                    isCustom 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'
                  }`}
                >
                  Other Amount
                </button>
                
                {isCustom && (
                  <div className="relative animate-in slide-in-from-top-2">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={customValue}
                      onChange={handleCustomChange}
                      placeholder="Enter amount (Min $1.00)"
                      className={`w-full pl-10 pr-4 py-4 rounded-xl border-2 focus:ring-4 focus:ring-blue-500/20 outline-none font-bold text-lg ${
                        isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                      autoFocus
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={amount < 1}
                className="w-full py-4 bg-[#0070ba] hover:bg-[#003087] text-white rounded-xl font-black shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <div className="flex flex-col items-center">
                   <span className="flex items-center gap-1.5 leading-none">
                     <CreditCard size={18} />
                     Pay with <span className="italic font-bold tracking-tight">PayPal</span>
                   </span>
                </div>
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                 <ShieldCheck size={12} />
                 Encrypted & Secure Transaction
              </div>
            </form>
          </div>
        )}

        {step === 'processing' && (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="relative mb-8">
               <Loader2 size={64} className="text-[#0070ba] animate-spin" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <span className="italic font-black text-xs text-[#0070ba] pb-1">PP</span>
               </div>
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Securing Payment</h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Connecting to PayPal’s secure gateway...</p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-10 text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle2 size={48} />
            </div>
            <h3 className={`text-3xl font-black font-serif mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Thank You!</h3>
            <p className={`text-slate-500 dark:text-slate-400 mb-8`}>
              Your contribution of <span className="font-bold text-slate-900 dark:text-white">${amount.toFixed(2)}</span> was successful. You're now a Big News Supporter.
            </p>
            <button 
              onClick={onClose}
              className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-bold shadow-lg"
            >
              Continue Reading
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationModal;
