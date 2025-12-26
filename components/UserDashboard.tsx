
import React, { useState } from 'react';
/* Added Bot to lucide-react imports */
import { X, User, Save, CheckCircle2, Bookmark, BarChart3, Clock, MessageSquare, TrendingUp, Sparkles, Phone, MessageCircle, Bot } from 'lucide-react';
import { UserProfile } from '../types';

interface UserDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onUpdateProfile: (profile: UserProfile) => void;
  isDark: boolean;
  onOpenChatter: () => void;
  stats: {
    articlesRead: number;
    bookmarks: number;
    comments: number;
  };
}

const AVATAR_COLORS = [
  'bg-blue-600', 'bg-red-600', 'bg-emerald-600', 'bg-amber-600', 'bg-indigo-600', 'bg-rose-600', 'bg-purple-600', 'bg-slate-700'
];

const UserDashboard: React.FC<UserDashboardProps> = ({ isOpen, onClose, userProfile, onUpdateProfile, isDark, onOpenChatter, stats }) => {
  const [name, setName] = useState(userProfile?.name || '');
  const [color, setColor] = useState(userProfile?.avatarColor || AVATAR_COLORS[0]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onUpdateProfile({
      name: name.trim(),
      avatarColor: color,
      joinedAt: userProfile?.joinedAt || new Date().toISOString()
    });

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div 
        className={`w-full max-w-4xl h-[85vh] rounded-[2.5rem] shadow-[0_32px_128px_-12px_rgba(0,0,0,0.8)] overflow-hidden relative flex flex-col md:flex-row transition-all border border-white/10 ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar Nav */}
        <div className={`w-full md:w-64 border-b md:border-b-0 md:border-r p-8 flex flex-col ${isDark ? 'bg-slate-950/50 border-white/5' : 'bg-slate-50/50 border-slate-100'}`}>
          <div className="flex items-center gap-3 mb-10">
             <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white text-xl font-black shadow-lg`}>
                {name.charAt(0) || <User size={24} />}
             </div>
             <div className="min-w-0">
                <h2 className="font-black text-lg truncate leading-tight">{name || 'Guest User'}</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Member since 2024</p>
             </div>
          </div>

          <nav className="space-y-2 flex-1">
             <button 
               onClick={() => setActiveTab('overview')}
               className={`w-full p-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-blue-500/10 text-slate-500'}`}
             >
                <TrendingUp size={18} /> Overview
             </button>
             <button 
               onClick={() => setActiveTab('settings')}
               className={`w-full p-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-blue-500/10 text-slate-500'}`}
             >
                <User size={18} /> My Profile
             </button>
          </nav>

          <button 
            onClick={onClose}
            className="w-full p-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all hover:bg-red-500/10 text-red-500"
          >
             <X size={18} /> Close Panel
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 no-scrollbar">
          {activeTab === 'overview' ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
               <div>
                  <h1 className="text-4xl font-black font-serif mb-2">My Dashboard</h1>
                  <p className="text-slate-500">Track your journalism engagement and insights.</p>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className={`p-6 rounded-[2rem] border transition-all ${isDark ? 'bg-white/5 border-white/5' : 'bg-blue-50 border-blue-100'}`}>
                     <div className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2">Articles Read</div>
                     <div className="text-4xl font-black mb-1">{stats.articlesRead}</div>
                     <div className="text-[10px] font-bold text-slate-400">Lifetime Progress</div>
                  </div>
                  <div className={`p-6 rounded-[2rem] border transition-all ${isDark ? 'bg-white/5 border-white/5' : 'bg-rose-50 border-rose-100'}`}>
                     <div className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-2">Saved Stories</div>
                     <div className="text-4xl font-black mb-1">{stats.bookmarks}</div>
                     <div className="text-[10px] font-bold text-slate-400">In your library</div>
                  </div>
                  <div className={`p-6 rounded-[2rem] border transition-all ${isDark ? 'bg-white/5 border-white/5' : 'bg-emerald-50 border-emerald-100'}`}>
                     <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Total Comments</div>
                     <div className="text-4xl font-black mb-1">{stats.comments}</div>
                     <div className="text-[10px] font-bold text-slate-400">Engagement Score</div>
                  </div>
               </div>

               {/* Chatter AI Promo Card */}
               <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                     <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                           <Sparkles size={18} className="text-blue-200" />
                           <span className="text-xs font-black uppercase tracking-widest text-blue-100">AI Co-Pilot Available</span>
                        </div>
                        <h2 className="text-3xl font-black font-serif mb-4 leading-tight">Need a professional news summary?</h2>
                        <p className="text-blue-100/80 text-sm mb-8 max-w-sm">Talk to Chatter, your personal AI journalist. I can write reports, research topics, or just chat with you like a human friend.</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                           <button 
                             onClick={onOpenChatter}
                             className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                           >
                              <Phone size={18} /> Voice Call
                           </button>
                           <button 
                             onClick={onOpenChatter}
                             className="px-8 py-4 bg-blue-500/30 text-white border border-white/20 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-500/50 transition-all flex items-center gap-2"
                           >
                              <MessageCircle size={18} /> Chat Box
                           </button>
                        </div>
                     </div>
                     <div className="hidden lg:block w-48 h-48 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/20 p-8 flex items-center justify-center rotate-6 scale-110">
                        <Bot size={80} className="text-white opacity-80" />
                     </div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="max-w-md animate-in fade-in slide-in-from-right-4 duration-500">
               <h1 className="text-4xl font-black font-serif mb-2">Profile Settings</h1>
               <p className="text-slate-500 mb-10">Customize your public appearance on Big News.</p>

               <form onSubmit={handleSubmit} className="space-y-8">
                  {showSuccess && (
                     <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-500 text-sm font-black">
                        <CheckCircle2 size={20} /> Changes saved successfully!
                     </div>
                  )}

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Display Name</label>
                     <input 
                       type="text" 
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                       placeholder="Enter your name"
                       maxLength={20}
                       className={`w-full px-6 py-4 rounded-2xl border-2 focus:ring-4 focus:ring-blue-500/20 outline-none font-black text-lg ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}
                     />
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Avatar Signature</label>
                     <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                        {AVATAR_COLORS.map(c => (
                           <button
                             key={c}
                             type="button"
                             onClick={() => setColor(c)}
                             className={`aspect-square rounded-xl ${c} transition-all relative ${color === c ? 'ring-4 ring-blue-500 ring-offset-4 dark:ring-offset-slate-900 scale-110' : 'hover:scale-105 opacity-60'}`}
                           >
                              {color === c && <CheckCircle2 size={16} className="absolute -top-1 -right-1 text-white bg-blue-500 rounded-full" />}
                           </button>
                        ))}
                     </div>
                  </div>

                  <button
                     type="submit"
                     className="w-full py-5 bg-slate-900 dark:bg-blue-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                     <Save size={18} /> Update Profile
                  </button>
               </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
