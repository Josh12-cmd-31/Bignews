import React, { useState } from 'react';
import { Article, WalletState } from '../types';
import { BarChart3, TrendingUp, Users, Heart, MessageSquare, Globe, Smartphone, Monitor, Tablet, Clock, MousePointerClick, Activity, Wallet, DollarSign, ArrowUpRight, CreditCard, Lock, History, ChevronRight, Gem } from 'lucide-react';
import WithdrawalModal from './WithdrawalModal';

interface AnalyticsDashboardProps {
  articles: Article[];
  wallet: WalletState;
  onWithdrawal: (amount: number, email: string) => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ articles, wallet, onWithdrawal }) => {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);
  const totalLikes = articles.reduce((sum, article) => sum + (article.likes || 0), 0);
  const totalComments = articles.reduce((sum, article) => sum + (article.comments || 0), 0);
  
  // Real stats calculation based on content
  const todayViews = Math.round(totalViews * 0.15); 
  const CPM = 2.50;
  const todayEarnings = (todayViews / 1000) * CPM;
  
  // Net Worth Calculation: Lifetime Earnings + Brand Valuation ($0.05 per view)
  const brandValuation = totalViews * 0.05;
  const netWorth = wallet.lifetimeEarnings + brandValuation;
  
  const estimatedVisitors = Math.round(totalViews / 2.5); 
  
  const topArticles = [...articles].sort((a, b) => {
    const engagementA = (a.likes || 0) + (a.comments || 0);
    const engagementB = (b.likes || 0) + (b.comments || 0);
    return engagementB - engagementA;
  }).slice(0, 5);

  const viewsByCategory: Record<string, number> = {};
  articles.forEach(article => {
    if (!viewsByCategory[article.category]) {
      viewsByCategory[article.category] = 0;
    }
    viewsByCategory[article.category] += article.views || 0;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Real Wallet Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-2xl shadow-xl border border-slate-700 relative overflow-hidden">
         <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20"></div>
         <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-20"></div>

         <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
               <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                     <Wallet className="text-emerald-400" />
                     Publisher Wallet
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">Managed revenue and brand valuation from content performance.</p>
               </div>
               <button 
                onClick={() => setIsWithdrawModalOpen(true)}
                disabled={wallet.balance < 10}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:grayscale text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2"
               >
                  <CreditCard size={18} /> Withdraw to PayPal
               </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="bg-white/5 backdrop-blur-md rounded-xl p-5 border border-white/10 group hover:border-emerald-500/30 transition-all">
                  <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Active Balance</div>
                  <div className="text-3xl font-black tracking-tight text-emerald-400">${wallet.balance.toFixed(2)}</div>
                  <div className="mt-2 text-[10px] text-slate-400">Min. payout: $10.00</div>
               </div>

               <div className="bg-white/5 backdrop-blur-md rounded-xl p-5 border border-white/10 group hover:border-blue-500/30 transition-all">
                  <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Estimated Today</div>
                  <div className="text-3xl font-black tracking-tight">${todayEarnings.toFixed(2)}</div>
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-green-400 font-bold">
                    <TrendingUp size={10} /> +12% performance
                  </div>
               </div>

               <div className="bg-white/5 backdrop-blur-md rounded-xl p-5 border border-white/10 group hover:border-slate-500/30 transition-all">
                  <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Lifetime Earnings</div>
                  <div className="text-3xl font-black tracking-tight text-slate-200">${wallet.lifetimeEarnings.toFixed(2)}</div>
                  <div className="mt-2 text-[10px] text-slate-400">Cumulative revenue</div>
               </div>

               {/* New Net Worth Card */}
               <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 backdrop-blur-md rounded-xl p-5 border border-blue-500/20 group hover:border-blue-400/50 transition-all relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Gem size={80} />
                  </div>
                  <div className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Gem size={12} />
                    Net Worth
                  </div>
                  <div className="text-3xl font-black tracking-tight text-white">${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className="mt-2 text-[10px] text-blue-400/80 font-bold">Market Cap Valuation</div>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistics Column */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <BarChart3 className="text-blue-600" />
                Performance Metrics
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-1">Views</span>
                        <div className="text-2xl font-black text-slate-900">{totalViews.toLocaleString()}</div>
                    </div>
                    <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                        <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block mb-1">Engagement</span>
                        <div className="text-2xl font-black text-slate-900">{(totalLikes + totalComments).toLocaleString()}</div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Top Content</h3>
                    {topArticles.map((article, index) => (
                        <div key={article.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                            <span className="w-6 text-xs font-bold text-slate-400">#0{index + 1}</span>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-slate-900 truncate">{article.title}</h4>
                            </div>
                            <div className="text-xs font-bold text-blue-600">{article.views.toLocaleString()} views</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Transaction History Column */}
        <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <History className="text-indigo-600" />
                    Transfers
                </h2>

                <div className="space-y-4">
                    {wallet.history.length > 0 ? (
                        wallet.history.map((tx) => (
                            <div key={tx.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-sm font-bold text-slate-900">${tx.amount.toFixed(2)}</div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        tx.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                                        tx.status === 'Processing' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        {tx.status}
                                    </span>
                                </div>
                                <div className="text-[10px] text-slate-500 font-medium truncate">{tx.email}</div>
                                <div className="text-[9px] text-slate-400 mt-1">{new Date(tx.timestamp).toLocaleString()}</div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center">
                            <CreditCard size={40} className="mx-auto text-slate-200 mb-3" />
                            <p className="text-xs text-slate-400 font-medium">No withdrawal history.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      <WithdrawalModal 
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        balance={wallet.balance}
        onConfirm={onWithdrawal}
      />
    </div>
  );
};

export default AnalyticsDashboard;