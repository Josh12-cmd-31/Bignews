import React, { useState, useEffect } from 'react';
import { Article, Category, UserPreferences, MonetizationConfig, Video, WalletState, Transaction, UserProfile } from './types';
import { MOCK_ARTICLES, CATEGORIES, MOCK_VIDEOS } from './constants';
import AdminEditor from './components/AdminEditor';
import NewsCard from './components/NewsCard';
import ArticleModal from './components/ArticleModal';
import BreakingNewsBanner from './components/BreakingNewsBanner';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import LoginModal from './components/LoginModal';
import FeedbackModal from './components/FeedbackModal';
import SettingsModal from './components/SettingsModal';
import UserDashboard from './components/UserDashboard';
import MonetizationPanel from './components/MonetizationPanel';
import DonationModal from './components/DonationModal';
import VideoManager from './components/VideoManager';
import VideoFeed from './components/VideoFeed';
import LegalModal from './components/LegalModal';
import Chatter from './components/Chatter';
import Logo from './components/Logo';
import { Menu, Search, LogOut, Settings, User as UserIcon, Activity, X, ChevronRight, ChevronLeft, PenLine, DollarSign, Film, Flame, BrainCircuit, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [adminTab, setAdminTab] = useState<'publisher' | 'analytics' | 'monetization' | 'videos'>('publisher');

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isUserDashboardOpen, setIsUserDashboardOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [isChatterOpen, setIsChatterOpen] = useState(false);
  const [legalType, setLegalType] = useState<'terms' | 'privacy'>('terms');
  
  const [secretClicks, setSecretClicks] = useState(0);

  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const saved = localStorage.getItem('bigNewsArticles');
      return saved ? JSON.parse(saved) : MOCK_ARTICLES;
    } catch(e) { return MOCK_ARTICLES; }
  });
  
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bigNewsBookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch(e) { return []; }
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('bigNewsUserProfile');
      return saved ? JSON.parse(saved) : null;
    } catch(e) { return null; }
  });

  const [videos, setVideos] = useState<Video[]>(() => {
    try {
      const saved = localStorage.getItem('bigNewsVideos');
      return saved ? JSON.parse(saved) : MOCK_VIDEOS;
    } catch(e) { return MOCK_VIDEOS; }
  });

  const [selectedCategory, setSelectedCategory] = useState<Category>('For You');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem('bigNewsPreferences');
      return saved ? JSON.parse(saved) : { theme: 'light', fontSize: 'medium' };
    } catch(e) { return { theme: 'light', fontSize: 'medium' }; }
  });

  const [wallet, setWallet] = useState<WalletState>(() => {
    try {
      const saved = localStorage.getItem('bigNewsWallet');
      if (saved) return JSON.parse(saved);
      const initialViews = MOCK_ARTICLES.reduce((sum, a) => sum + (a.views || 0), 0);
      const initialBalance = (initialViews / 1000) * 2.50; 
      return { balance: initialBalance, lifetimeEarnings: initialBalance, history: [] };
    } catch(e) { return { balance: 0, lifetimeEarnings: 0, history: [] }; }
  });

  const [monetization, setMonetization] = useState<MonetizationConfig>({ adsenseId: '', monetagId: '', adsenseEnabled: false, monetagEnabled: false });

  useEffect(() => { localStorage.setItem('bigNewsArticles', JSON.stringify(articles)); }, [articles]);
  useEffect(() => { localStorage.setItem('bigNewsWallet', JSON.stringify(wallet)); }, [wallet]);
  useEffect(() => { localStorage.setItem('bigNewsBookmarks', JSON.stringify(bookmarks)); }, [bookmarks]);
  useEffect(() => { localStorage.setItem('bigNewsUserProfile', JSON.stringify(userProfile)); }, [userProfile]);
  useEffect(() => { localStorage.setItem('bigNewsVideos', JSON.stringify(videos)); }, [videos]);
  useEffect(() => { localStorage.setItem('bigNewsPreferences', JSON.stringify(preferences)); }, [preferences]);

  const toggleBookmark = (articleId: string) => {
    if (!userProfile) {
      setIsUserDashboardOpen(true);
      return;
    }
    setBookmarks(prev => prev.includes(articleId) ? prev.filter(id => id !== articleId) : [...prev, articleId]);
  };

  const handleWithdrawal = (amount: number, email: string) => {
    const newTx: Transaction = {
      id: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      amount,
      method: 'PayPal',
      email,
      timestamp: new Date().toISOString(),
      status: 'Processing'
    };
    setWallet(prev => ({
      ...prev,
      balance: prev.balance - amount,
      history: [newTx, ...prev.history]
    }));
  };

  const updateArticle = (updated: Article) => {
    setArticles(prev => prev.map(a => a.id === updated.id ? updated : a));
    if (selectedArticle?.id === updated.id) setSelectedArticle(updated);
  };

  const handleSecretTrigger = () => {
    setSecretClicks(prev => {
      const newVal = prev + 1;
      if (newVal >= 5) {
        setIsLoginModalOpen(true);
        return 0;
      }
      return newVal;
    });
    setTimeout(() => setSecretClicks(0), 2000);
  };

  const filteredArticles = articles.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (a.summary && a.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    if (selectedCategory === 'Bookmarks') return bookmarks.includes(a.id) && matchesSearch;
    if (selectedCategory === 'For You') return matchesSearch;
    if (selectedCategory === 'Trending') return matchesSearch; 
    if (selectedCategory === 'Videos') return false;
    return a.category === selectedCategory && matchesSearch;
  }).sort((a, b) => {
    if (selectedCategory === 'Trending') {
      const scoreA = (a.views || 0) + ((a.likes || 0) * 10) + ((a.comments || 0) * 20);
      const scoreB = (b.views || 0) + ((b.likes || 0) * 10) + ((b.comments || 0) * 20);
      return scoreB - scoreA;
    }
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const currentArticles = filteredArticles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const isDark = preferences.theme === 'dark';

  const openLegal = (type: 'terms' | 'privacy') => {
    setLegalType(type);
    setIsLegalModalOpen(true);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 relative ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <BreakingNewsBanner articles={articles} onArticleClick={setSelectedArticle} />
      <header className={`sticky top-0 z-40 border-b transition-all ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'} backdrop-blur-md`}>
        <div className="max-w-[1600px] mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden">
              <Menu size={24} />
            </button>
            <div onClick={() => { setShowAdminDashboard(false); setSelectedCategory('For You'); }} className="cursor-pointer scale-90 sm:scale-100">
              <Logo isDark={isDark} />
            </div>
          </div>
          <div className="hidden lg:flex flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search news..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full pl-10 pr-4 py-2 rounded-full border transition-all focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setIsChatterOpen(true)} className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all border group relative overflow-hidden ${isDark ? 'border-blue-500/60 text-blue-400 bg-blue-900/30' : 'border-blue-200 text-blue-700 bg-white hover:bg-blue-50'}`}>
              <BrainCircuit size={16} className="hidden sm:block" />
              <span>AI CHAT</span>
            </button>
            <button onClick={() => setIsSettingsModalOpen(true)} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}><Settings size={20} /></button>
            {isAuthenticated && (<button onClick={() => setIsAuthenticated(false)} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors hidden sm:block" title="Logout"><LogOut size={20} /></button>)}
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>
            <button onClick={() => setIsUserDashboardOpen(true)} className={`flex items-center gap-2 p-1 sm:pr-3 rounded-full border transition-all ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className={`w-8 h-8 rounded-full ${userProfile?.avatarColor || 'bg-slate-200'} flex items-center justify-center text-white font-black text-xs`}>{userProfile?.name?.charAt(0) || <UserIcon size={16} className="text-slate-400" />}</div>
              <span className="text-xs font-bold hidden md:block">{userProfile?.name || 'Guest'}</span>
            </button>
          </div>
        </div>
        <nav className={`border-t overflow-x-auto no-scrollbar scroll-smooth ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
          <div className="max-w-[1600px] mx-auto px-4 flex items-center">
            {CATEGORIES.map(category => (
              <button key={category} onClick={() => { setSelectedCategory(category); setShowAdminDashboard(false); setCurrentPage(1); }} className={`px-4 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all relative group flex items-center gap-2`}>
                {category === 'Trending' && <Flame size={12} className={selectedCategory === 'Trending' ? 'text-orange-500' : 'text-slate-400'} />}
                <span className={selectedCategory === category ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}>{category}</span>
                {selectedCategory === category && (<div className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-600 dark:bg-blue-400"></div>)}
              </button>
            ))}
          </div>
        </nav>
      </header>
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 py-6 sm:py-10">
        {showAdminDashboard ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-wrap items-center gap-2 mb-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl inline-flex w-full sm:w-auto">
              {[{ id: 'publisher', label: 'Publisher', icon: <PenLine size={16} /> }, { id: 'analytics', label: 'Analytics', icon: <Activity size={16} /> }, { id: 'monetization', label: 'Monetization', icon: <DollarSign size={16} /> }, { id: 'videos', label: 'Videos', icon: <Film size={16} /> }].map(tab => (
                <button key={tab.id} onClick={() => setAdminTab(tab.id as any)} className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${adminTab === tab.id ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                  {tab.icon}<span className="hidden xs:inline">{tab.label}</span>
                </button>
              ))}
            </div>
            {adminTab === 'publisher' && <AdminEditor onPublish={(a) => {setArticles([a, ...articles]); setShowAdminDashboard(false);}} videos={videos} />}
            {adminTab === 'analytics' && <AnalyticsDashboard articles={articles} wallet={wallet} onWithdrawal={handleWithdrawal} />}
            {adminTab === 'monetization' && <MonetizationPanel config={monetization} onUpdate={setMonetization} />}
            {adminTab === 'videos' && <VideoManager videos={videos} onUpdateVideos={setVideos} />}
          </div>
        ) : selectedCategory === 'Videos' ? (
          <VideoFeed videos={videos} onUpload={isAuthenticated ? (v) => setVideos([v, ...videos]) : undefined} />
        ) : (
          <div className="animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl sm:text-4xl font-black font-serif flex items-center gap-3">{selectedCategory}{selectedCategory === 'Bookmarks' && <span className="text-xs font-sans font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{bookmarks.length}</span>}</h2>
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">{filteredArticles.length} stories found</div>
            </div>
            {currentArticles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
                  {currentArticles.map((article, idx) => (
                    <div key={article.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                      <NewsCard article={article} onClick={setSelectedArticle} preferences={preferences} onUpdateArticle={updateArticle} isBookmarked={bookmarks.includes(article.id)} onToggleBookmark={() => toggleBookmark(article.id)} />
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-16 flex justify-center items-center gap-2 sm:gap-4">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 sm:p-3 rounded-full border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all"><ChevronLeft size={20} /></button>
                    <div className="flex gap-1 sm:gap-2 overflow-x-auto no-scrollbar max-w-[200px] sm:max-w-none">
                       {Array.from({ length: totalPages }).map((_, i) => (
                         <button key={i} onClick={() => setCurrentPage(i + 1)} className={`min-w-[32px] sm:min-w-[40px] h-8 sm:h-10 rounded-full font-bold text-[10px] sm:text-sm transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}>{i + 1}</button>
                       ))}
                    </div>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 sm:p-3 rounded-full border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all"><ChevronRight size={20} /></button>
                  </div>
                )}
              </>
            ) : (<div className="py-20 text-center"><h3 className="text-xl font-bold text-slate-400">No stories found.</h3></div>)}
          </div>
        )}
      </main>
      <footer className={`py-12 border-t mt-auto ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'}`}>
         <div className="max-w-[1600px] mx-auto px-4 flex flex-col items-center gap-8">
            <div className={`w-full max-w-4xl border-b ${isDark ? 'border-slate-800' : 'border-slate-100'} pb-10 mb-2`}>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-center text-slate-400 mb-8">Strategic Partners</p>
               <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-6 md:gap-x-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                  <div className="flex items-center gap-2 font-black text-xs tracking-tighter"><div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-[10px] text-white shadow-sm font-sans">M</div>MOVA AI</div>
                  <div className="flex items-center gap-2 font-black text-xs tracking-tighter"><div className={`w-7 h-7 ${isDark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'} rounded-lg flex items-center justify-center text-[10px] font-serif shadow-sm`}>G</div>GLOBAL PRESS</div>
                  <div className="flex items-center gap-2 font-black text-xs tracking-tighter"><div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center text-[10px] text-white italic font-serif shadow-sm">T</div>TECHFLOW</div>
                  <div className="flex items-center gap-2 font-black text-xs tracking-tighter"><div className="w-7 h-7 bg-rose-600 rounded-lg flex items-center justify-center text-[10px] text-white shadow-sm">S</div>SPORTSGRID</div>
                  <div className="flex items-center gap-2 font-black text-xs tracking-tighter"><div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-[10px] text-white shadow-sm font-sans italic">P</div>PURE INSIGHT</div>
               </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
               <button onClick={() => setIsFeedbackModalOpen(true)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">Feedback</button>
               <button onClick={() => openLegal('privacy')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">Privacy</button>
               <button onClick={() => openLegal('terms')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">Terms</button>
            </div>
            <div className="flex flex-col items-center gap-6">
               {isAuthenticated && (<button onClick={() => { setShowAdminDashboard(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="px-8 py-3 bg-blue-600/10 text-blue-600 border border-blue-600/20 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95"><ShieldCheck size={16} />mova group</button>)}
               <p onClick={handleSecretTrigger} className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] cursor-pointer select-none active:scale-95 transition-transform hover:text-slate-600">© {new Date().getFullYear()} Big News Inc.</p>
            </div>
         </div>
      </footer>
      <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} preferences={preferences} onUpdateArticle={updateArticle} userProfile={userProfile} onOpenDonation={() => setIsDonationModalOpen(true)} isBookmarked={selectedArticle ? bookmarks.includes(selectedArticle.id) : false} onToggleBookmark={() => selectedArticle && toggleBookmark(selectedArticle.id)} />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={() => { setIsAuthenticated(true); setShowAdminDashboard(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
      <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} preferences={preferences} onUpdatePreferences={setPreferences} />
      <DonationModal isOpen={isDonationModalOpen} onClose={() => setIsDonationModalOpen(false)} onSuccess={() => setIsDonationModalOpen(false)} isDark={isDark} />
      <UserDashboard isOpen={isUserDashboardOpen} onClose={() => setIsUserDashboardOpen(false)} userProfile={userProfile} onUpdateProfile={setUserProfile} isDark={isDark} onOpenChatter={() => { setIsUserDashboardOpen(false); setIsChatterOpen(true); }} stats={{ articlesRead: 24, bookmarks: bookmarks.length, comments: 4 }} />
      <LegalModal isOpen={isLegalModalOpen} onClose={() => setIsLegalModalOpen(false)} type={legalType} isDark={isDark} />
      <Chatter isOpen={isChatterOpen} onClose={() => setIsChatterOpen(false)} isDark={isDark} userName={userProfile?.name} />
      {isMobileMenuOpen && (<div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl animate-in fade-in duration-300 flex flex-col p-8"><div className="flex justify-between items-center mb-12"><Logo isDark={true} /><button onClick={() => setIsMobileMenuOpen(false)} className="text-white"><X size={32} /></button></div><div className="flex flex-col gap-6 overflow-y-auto no-scrollbar">{CATEGORIES.map(cat => (<button key={cat} onClick={() => { setSelectedCategory(cat); setIsMobileMenuOpen(false); setShowAdminDashboard(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`text-2xl font-black font-serif text-left transition-colors ${selectedCategory === cat ? 'text-blue-400' : 'text-slate-400'}`}>{cat}</button>))}</div></div>)}
    </div>
  );
};

export default App;