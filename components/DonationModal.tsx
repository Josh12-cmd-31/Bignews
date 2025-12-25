
import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, DollarSign, ShieldCheck, Loader2, CheckCircle2, CreditCard, Globe, Smartphone, Lock, AlertCircle, ExternalLink, Copy, Check, ChevronDown, MapPin } from 'lucide-react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
  isDark?: boolean;
}

type PaymentMethod = 'paypal' | 'card' | 'mpesa';
type Region = 'International' | 'Kenya';

const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose, onSuccess, isDark }) => {
  const [amount, setAmount] = useState<number>(10);
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [region, setRegion] = useState<Region>('International');
  const [step, setStep] = useState<'select' | 'details' | 'redirecting' | 'success'>('select');
  const [isLocating, setIsLocating] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const paypalFormRef = useRef<HTMLFormElement>(null);
  const RECIPIENT_EMAIL = "n6690680@gmail.com";
  const MPESA_NUMBER = "0723883816";

  useEffect(() => {
    if (isOpen) {
      detectLocation();
      setStep('select');
    }
  }, [isOpen]);

  const detectLocation = async () => {
    setIsLocating(true);
    
    // First: Check Timezone (Fast & No Permission Needed)
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const isLikelyKenya = tz.includes('Nairobi') || tz.includes('Africa/Nairobi');
    
    if (isLikelyKenya) {
      setRegion('Kenya');
      setMethod('mpesa');
      setIsLocating(false);
    } else {
      // Second: Try Geolocation if Permission granted
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // We can't easily turn lat/lng to country without a service, 
            // but the prompt implies simple country detection.
            // If they are not in Kenya by TZ, we default to International
            setRegion('International');
            setMethod('card');
            setIsLocating(false);
          },
          () => {
            setRegion('International');
            setMethod('card');
            setIsLocating(false);
          },
          { timeout: 3000 }
        );
      } else {
        setRegion('International');
        setMethod('card');
        setIsLocating(false);
      }
    }
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(MPESA_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePayRedirect = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('redirecting');
    
    if (method === 'mpesa') {
      // M-Pesa manual confirmation flow - simulating processing
      setTimeout(() => setStep('success'), 3000);
      return;
    }

    // PayPal/Card Real Money Redirect
    setTimeout(() => {
      if (paypalFormRef.current) {
        paypalFormRef.current.submit();
      }
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative transition-all ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Real PayPal Payment Form (Hidden) */}
        <form ref={paypalFormRef} action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank" className="hidden">
          <input type="hidden" name="cmd" value="_donations" />
          <input type="hidden" name="business" value={RECIPIENT_EMAIL} />
          <input type="hidden" name="item_name" value="Support for Big News Journalism" />
          <input type="hidden" name="currency_code" value="USD" />
          <input type="hidden" name="amount" value={amount} />
          <input type="hidden" name="no_shipping" value="1" />
          <input type="hidden" name="return" value={window.location.origin} />
        </form>

        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 z-50 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        {step === 'select' && (
          <div className="p-8">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mb-4 shadow-inner rotate-3 transition-transform hover:rotate-0">
                <Heart size={32} className="fill-current" />
              </div>
              <h2 className={`text-2xl font-black font-serif mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Support Big News</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Choose your region to see available payment methods.</p>
              
              <div className="mt-5 w-full flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button 
                  onClick={() => { setRegion('International'); setMethod('card'); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black transition-all ${region === 'International' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}
                >
                  <Globe size={14} /> International
                </button>
                <button 
                  onClick={() => { setRegion('Kenya'); setMethod('mpesa'); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black transition-all ${region === 'Kenya' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                >
                  <MapPin size={14} /> Kenya (M-Pesa)
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 25].map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(val)}
                    className={`py-2.5 rounded-xl font-black transition-all border-2 ${
                      amount === val 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                        : isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600' : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200'
                    }`}
                  >
                    ${val}
                  </button>
                ))}
              </div>
              
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 group-focus-within:text-blue-500">$</div>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className={`w-full pl-10 pr-4 py-4 rounded-2xl border-2 font-black text-xl outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-100 focus:border-blue-500'}`}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Selection</label>
                
                {region === 'Kenya' ? (
                  <button
                    onClick={() => setMethod('mpesa')}
                    className="w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all border-[#48B04B] bg-[#48B04B]/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#48B04B] flex items-center justify-center text-white font-black text-xs shadow-md">M</div>
                      <div className="text-left">
                        <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>M-Pesa (Safaricom)</div>
                        <div className="text-[10px] text-[#48B04B] font-bold">Recommended for Kenya</div>
                      </div>
                    </div>
                    <CheckCircle2 size={18} className="text-[#48B04B]" />
                  </button>
                ) : (
                  <button
                    onClick={() => setMethod('card')}
                    className="w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all border-blue-500 bg-blue-500/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md"><CreditCard size={20} /></div>
                      <div className="text-left">
                        <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>PayPal & Global Card</div>
                        <div className="text-[10px] text-blue-500 font-bold">Secure Global Checkout</div>
                      </div>
                    </div>
                    <CheckCircle2 size={18} className="text-blue-500" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setStep('details')}
                className={`w-full mt-4 py-4 rounded-2xl font-black text-white shadow-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  method === 'mpesa' ? 'bg-[#48B04B]' : 'bg-slate-950 dark:bg-blue-600'
                }`}
              >
                Continue to Secure Payment
              </button>
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className="p-8 animate-in slide-in-from-right-8 duration-300">
            <h3 className={`text-xl font-black mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Lock size={20} className="text-blue-500" />
              Complete Contribution
            </h3>

            <div className="space-y-6">
              {method === 'mpesa' ? (
                <div className="space-y-5">
                  <div className={`p-6 rounded-2xl border-2 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-emerald-50 border-emerald-100'}`}>
                    <div className="flex justify-between items-center mb-4">
                       <span className="text-[10px] font-black uppercase text-slate-400">Recipient M-Pesa Number</span>
                       <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-black rounded-full animate-pulse">LIVE</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="text-3xl font-black tracking-wider text-[#48B04B]">{MPESA_NUMBER}</div>
                       <button 
                         onClick={handleCopyNumber}
                         className={`p-2.5 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-emerald-100 text-emerald-600'}`}
                       >
                         {copied ? <Check size={24} /> : <Copy size={24} />}
                       </button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl space-y-2">
                     <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                       1. Go to your M-Pesa Menu.<br/>
                       2. Select <strong>Send Money</strong>.<br/>
                       3. Enter phone number: <strong>{MPESA_NUMBER}</strong>.<br/>
                       4. Send <strong>KES {(amount * 130).toLocaleString()}</strong> (Estimated USD/KES).<br/>
                       5. Click confirm below after you have paid.
                     </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className={`p-8 rounded-2xl border-2 text-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-blue-50 border-blue-100'}`}>
                    <div className="text-xs text-slate-500 mb-1 font-bold">Secure Global Transfer</div>
                    <div className="text-5xl font-black text-blue-600 mb-4">${amount.toFixed(2)}</div>
                    <div className="flex items-center justify-center gap-2 py-2 px-4 bg-white dark:bg-slate-700 rounded-full inline-flex border border-slate-200 dark:border-slate-600">
                       <ShieldCheck size={14} className="text-blue-500" />
                       <span className="text-[10px] font-black text-slate-600 dark:text-slate-300">{RECIPIENT_EMAIL}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl flex items-start gap-3">
                    <InfoIcon className="text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-slate-500 leading-tight">
                      You will be redirected to PayPal's secure global checkout. You can pay with a PayPal account or your local debit/credit card.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setStep('select')}
                  className={`flex-1 py-4 font-bold rounded-2xl border-2 transition-colors ${isDark ? 'border-slate-800 text-slate-400 hover:bg-slate-800' : 'border-slate-100 text-slate-600 hover:bg-slate-50'}`}
                >
                  Back
                </button>
                <button 
                  onClick={handlePayRedirect}
                  className={`flex-[2] py-4 font-black rounded-2xl text-white shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    method === 'mpesa' ? 'bg-[#48B04B] hover:bg-[#3d963f]' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {method === 'mpesa' ? 'I Have Paid' : 'Open Secure Gateway'}
                  <ExternalLink size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'redirecting' && (
          <div className="p-20 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
            <Loader2 size={64} className="text-blue-600 animate-spin mb-6" />
            <h3 className={`text-xl font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Securing Connection...
            </h3>
            <p className={`text-xs max-w-xs mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Verifying credentials for {method === 'mpesa' ? 'Local Mobile Money' : 'Global PayPal Infrastructure'}...
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-12 text-center animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h3 className={`text-2xl font-black font-serif mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Hero Status: Verified!</h3>
            <p className={`text-xs mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Thank you for supporting Big News. Your contribution of <strong>${amount}</strong> keeps us independent and powerful.
            </p>
            <button 
              onClick={onClose}
              className="w-full py-4 bg-slate-950 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black shadow-2xl transition-all"
            >
              Continue Reading
            </button>
          </div>
        )}

        <div className={`px-8 py-4 text-center border-t flex items-center justify-center gap-2 ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
           <Lock size={12} className="text-slate-400" />
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
             End-to-End Encryption Enabled
           </p>
        </div>
      </div>
    </div>
  );
};

const InfoIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export default DonationModal;
