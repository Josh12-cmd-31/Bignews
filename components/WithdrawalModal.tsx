
import React, { useState } from 'react';
import { X, Send, CreditCard, AlertCircle, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { Transaction } from '../types';
import Logo from './Logo';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  onConfirm: (amount: number, email: string) => void;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ isOpen, onClose, balance, onConfirm }) => {
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState<number>(Math.min(balance, 50));
  const [step, setStep] = useState<'form' | 'confirm' | 'processing' | 'success'>('form');
  const MIN_WITHDRAWAL = 10;

  if (!isOpen) return null;

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < MIN_WITHDRAWAL) return;
    if (!isValidEmail(email)) return;
    setStep('confirm');
  };

  const handleFinalConfirm = () => {
    setStep('processing');
    // Simulate payment gateway processing
    setTimeout(() => {
      onConfirm(amount, email);
      setStep('success');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10">
          <X size={24} />
        </button>

        {step === 'form' && (
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <CreditCard size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-serif">Withdraw Funds</h2>
                <p className="text-xs text-slate-500">Fast transfers to your PayPal account.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Available Balance</div>
                <div className="text-2xl font-black text-slate-900">${balance.toFixed(2)}</div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">PayPal Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="account@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Amount to Withdraw (USD)</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[10, 20, 50].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      disabled={balance < val}
                      className={`py-2 rounded-lg text-sm font-bold border transition-all ${
                        amount === val ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30'
                      }`}
                    >
                      ${val}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={MIN_WITHDRAWAL}
                  max={balance}
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg font-bold"
                />
                {amount < MIN_WITHDRAWAL && (
                  <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                    <AlertCircle size={10} /> Minimum withdrawal is ${MIN_WITHDRAWAL}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={amount < MIN_WITHDRAWAL || !isValidEmail(email) || amount > balance}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-xl hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                Request Transfer
                <Send size={18} />
              </button>
            </form>
          </div>
        )}

        {step === 'confirm' && (
          <div className="p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-serif mb-2">Confirm Withdrawal</h2>
            <p className="text-slate-500 mb-8">
              You are about to transfer <span className="font-bold text-slate-900">${amount.toFixed(2)}</span> to <span className="font-bold text-slate-900">{email}</span>.
            </p>
            
            <div className="flex gap-3">
              <button onClick={() => setStep('form')} className="flex-1 py-3 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={handleFinalConfirm} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold shadow-lg hover:bg-blue-700">
                Confirm
              </button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-6">
            <Loader2 size={64} className="text-blue-600 animate-spin" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">Processing Payment</h2>
              <p className="text-slate-500">Validating transaction with PayPal servers...</p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="p-8 text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-serif mb-2">Transfer Initiated!</h2>
            <p className="text-slate-500 mb-8">
              The funds have been scheduled for transfer. Most PayPal payments arrive within 1-2 hours, but can take up to 24 hours.
            </p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-8 text-left">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-400">Ref ID:</span>
                <span className="font-mono font-bold">TXN-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Target:</span>
                <span className="font-bold">{email}</span>
              </div>
            </div>
            <button onClick={onClose} className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold">
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawalModal;
