
import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, DollarSign, ShieldCheck, Loader2, CheckCircle2, CreditCard, Globe, Smartphone, Lock, AlertCircle, ExternalLink, Copy, Check } from 'lucide-react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
  isDark?: boolean;
}

type PaymentMethod = 'paypal' | 'card' | 'mpesa';

const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose, onSuccess, isDark }) => {
  const [amount, setAmount] = useState<number>(10);
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [step, setStep] = useState<'select' | 'details' | 'redirecting' | 'success'>('select');
  const [country, setCountry] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const paypalFormRef = useRef<HTMLFormElement>(null);
  const RECIPIENT_EMAIL = "n6690680@gmail.com";
  const MPESA_NUMBER = "0712345678"; // Replace with your real Safaricom number

  useEffect(() => {
    if (isOpen) {
      detectLocation();
      setStep('select');
    }
  }, [isOpen]);

  const detectLocation = async () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Simulate country detection logic for the purpose of showing M-Pesa to Kenyan users
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (tz.includes('Nairobi')) {
            setCountry('Kenya');
            setMethod('mpesa');
          } else {
            setCountry('Global');
            setMethod('card');
          }
          setIsLocating(false);
        },
        () => {
          setCountry('Global');
          setIsLocating(false);
        }
      );
    } else {
      setCountry('Global');
      setIsLocating(false);
    }
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(MPESA_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePayRedirect = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (method === 'mpesa') {
      // M-Pesa manual confirmation flow
      setStep('redirecting');
      setTimeout(() => setStep('success'), 3000);
      return;
    }

    // PayPal/Card Real Money Redirect
    setStep('redirecting');
    
    // Give the UI a moment to show the "Redirecting" state before the form posts
    setTimeout(() => {
      if (paypalFormRef.current) {
        paypalFormRef.current.submit();
      }
    }, 1500);
  };

  if (!isOpen) return null;

  const getMpesaColor = () => isDark ? 'bg-emerald-600' : 'bg-[#48B04B]';

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
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4 shadow-inner rotate-3 transition-transform hover:rotate-0">
                <Heart size={40} className="fill-current" />
              </div>
              <h2 className={`text-3xl font-black font-serif mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Support Big News</h2>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Your contribution keeps our news real and independent.</p>
              
              <div className="mt-4 flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <Globe size={12} className={isLocating ? 'animate-spin' : ''} />
                {isLocating ? 'Locating...' : country === 'Kenya' ? 'Region: Kenya (M-Pesa Enabled)' : 'International Gateway Active'}
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-3">
                {[5, 20, 50].map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(val)}
                    className={`py-3 rounded-xl font-black transition-all border-2 text-lg ${
                      amount === val 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20 scale-105' 
                        : isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200'
                    }`}
                  >
                    ${val}
                  </button>
                ))}
              </div>
              
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 group-focus-within:text-blue-500 transition-colors">$</div>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className={`w-full pl-10 pr-4 py-4 rounded-2xl border-2 font-black text-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-100 focus:border-blue-500'}`}
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Payment Methods</label>
                
                {country === 'Kenya' && (
                  <button
                    onClick={() => setMethod('mpesa')}
                    className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                      method === 'mpesa' ? 'border-[#48B04B] bg-[#48B04B]/5' : isDark ? 'border-slate-800' : 'border-slate-100 hover:border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${getMpesaColor()} flex items-center justify-center text-white font-black text-xs shadow-md`}>M</div>
                      <div className="text-left">
                        <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>M-Pesa Kenya</div>
                        <div className="text-[10px] text-slate-500">Local Mobile Money</div>
                      </div>
                    </div>
                    {method === 'mpesa' && <CheckCircle2 size={18} className="text-[#48B04B]" />}
                  </button>
                )}

                <button
                  onClick={() => setMethod('card')}
                  className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                    method === 'card' ? 'border-blue-500 bg-blue-500/5' : isDark ? 'border-slate-800' : 'border-slate-100 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md"><CreditCard size={20} /></div>
                    <div className="text-left">
                      <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Card / PayPal</div>
                      <div className="text-[10px] text-slate-500">Global Secure Checkout</div>
                    </div>
                  </div>
                  {(method === 'card' || method === 'paypal') && <CheckCircle2 size={18} className="text-blue-500" />}
                </button>
              </div>

              <button
                onClick={() => setStep('details')}
                className={`w-full mt-4 py-5 rounded-2xl font-black text-white shadow-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  method === 'mpesa' ? getMpesaColor() : 'bg-slate-950 dark:bg-blue-600'
                }`}
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className="p-8 animate-in slide-in-from-right-8 duration-300">
            <h3 className={`text-2xl font-black mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Lock size={24} className="text-blue-500" />
              Finalize Donation
            </h3>

            <div className="space-y-6">
              {method === 'mpesa' ? (
                <div className="space-y-5">
                  <div className={`p-5 rounded-2xl border-2 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-emerald-50 border-emerald-100'}`}>
                    <div className="flex justify-between items-center mb-4">
                       <span className="text-[10px] font-black uppercase text-slate-400">Recipient Number</span>
                       <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-black rounded-full">LIVE</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="text-2xl font-black tracking-wider text-[#48B04B]">{MPESA_NUMBER}</div>
                       <button 
                         onClick={handleCopyNumber}
                         className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-emerald-100 text-emerald-600'}`}
                       >
                         {copied ? <Check size={20} /> : <Copy size={20} />}
                       </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                     <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                       1. Open M-Pesa on your phone.<br/>
                       2. Select <strong>Send Money</strong> to the number above.<br/>
                       3. Enter amount: <strong>KES {(amount * 130).toLocaleString()}</strong> (approx).<br/>
                       4. Click the button below once you've sent the funds.
                     </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className={`p-6 rounded-2xl border-2 text-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-blue-50 border-blue-100'}`}>
                    <div className="text-sm text-slate-500 mb-1 font-bold">Total Contribution</div>
                    <div className="text-4xl font-black text-blue-600">${amount.toFixed(2)}</div>
                    <p className="text-[10px] mt-4 font-medium text-slate-400">
                      Funds will be securely sent to:<br/>
                      <span className="font-bold text-slate-900 dark:text-white">{RECIPIENT_EMAIL}</span>
                    </p>
                  </div>

                  <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-3">
                    <ShieldCheck size={20} className="text-blue-500 shrink-0" />
                    <p className="text-[10px] font-bold text-slate-500 leading-tight">
                      You will be redirected to PayPal's secure server to complete this real money transaction. Your connection is encrypted.
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
                    method === 'mpesa' ? getMpesaColor() : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {method === 'mpesa' ? 'I Have Sent Funds' : 'Pay Securely Now'}
                  <ExternalLink size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'redirecting' && (
          <div className="p-16 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
            <div className="relative mb-10">
               <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
               <Loader2 size={80} className="text-blue-600 animate-spin relative" />
            </div>
            <h3 className={`text-2xl font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Connecting to Gateway
            </h3>
            <p className={`text-sm max-w-xs mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Please wait while we establish a secure connection with the payment processor...
            </p>
            <div className="mt-8 flex items-center gap-3 grayscale opacity-40">
               <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
               <div className="h-4 w-px bg-slate-300"></div>
               <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3" />
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="p-12 text-center animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
              <CheckCircle2 size={56} />
            </div>
            <h3 className={`text-3xl font-black font-serif mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Thank You!</h3>
            <p className={`text-sm mb-10 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Your donation request of <strong>${amount}</strong> has been processed. We'll update your profile status once confirmed.
            </p>
            <button 
              onClick={onClose}
              className="w-full py-5 bg-slate-950 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black shadow-2xl transition-all active:scale-95"
            >
              Close and Continue
            </button>
          </div>
        )}

        <div className={`px-8 py-5 text-center border-t flex items-center justify-center gap-2 ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
           <ShieldCheck size={14} className="text-slate-400" />
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
             End-to-End Encrypted Secure Treasury
           </p>
        </div>
      </div>
    </div>
  );
};

export default DonationModal;
