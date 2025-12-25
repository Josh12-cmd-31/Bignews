import React, { useState, useEffect, useCallback } from 'react';
import { Article, Category, UserPreferences, MonetizationConfig, Video, AutomationConfig, AutomationLog, WalletState, Transaction, UserProfile } from './types';
import { MOCK_ARTICLES, CATEGORIES, MOCK_VIDEOS } from './constants';
import AdminEditor from './components/AdminEditor';
import NewsCard from './components/NewsCard';
import ArticleModal from './components/ArticleModal';
import BreakingNewsBanner from './components/BreakingNewsBanner';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import LoginModal from './components/LoginModal';
import FeedbackModal from './components/FeedbackModal';
import SettingsModal from './components/SettingsModal';
import ProfileModal from './components/ProfileModal';
import MonetizationPanel from './components/MonetizationPanel';
import AutomationPanel from './components/AutomationPanel';
import DonationModal from './components/DonationModal';
import VideoManager from './components/VideoManager';
import VideoFeed from './components/VideoFeed';
import BackgroundJournalist from './components/BackgroundJournalist';
import Logo from './components/Logo';
import { Menu, Shield, Search, LogOut, Lock, Settings, Heart, Bookmark, User as UserIcon, Activity, X, ChevronRight, ChevronLeft, LayoutDashboard, PenLine, DollarSign, Film, Bot } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [adminTab, setAdminTab] = useState<'publisher' | 'analytics' | 'monetization' | 'videos' | 'automation'>('publisher');

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem('bigNewsArticles');
    return saved ? JSON.parse(saved) : MOCK_ARTICLES;
  });
  
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem('bigNewsBookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('bigNewsUserProfile');
    return saved ? JSON.parse(saved) : null;
  });

  const [videos, setVideos] = useState<Video[]>(() => {
    const saved = localStorage.getItem('bigNewsVideos');
    return saved ? JSON.parse(saved) : MOCK_VIDEOS;
  });

  const [selectedCategory, setSelectedCategory] = useState<Category>('For You');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('bigNewsPreferences');
    return saved ? JSON.parse(saved) : { theme: 'light', fontSize: 'medium' };
  });

  const [wallet, setWallet] = useState<WalletState>(() => {
    const saved = localStorage.getItem('bigNewsWallet');
    if (saved) return JSON.parse(saved);
    const initialViews = MOCK_ARTICLES.reduce((sum, a) => sum + (a.views || 0), 0);
    const initialBalance = (initialViews / 1000) * 2.50; 
    return { balance: initialBalance, lifetimeEarnings: initialBalance, history: [] };
  });

  const [automation, setAutomation] = useState<AutomationConfig>(() => {
    const saved = localStorage.getItem('bigNewsAutomationConfig');
    return saved ? JSON.parse(saved) : { enabled: false, intervalMinutes: 10, autoCategories: ['Technology', 'Business', 'Science', 'Politics'], isCurrentlyRunning: false };
  });

  const [automationLogs, setAutomationLogs] = useState<AutomationLog[]>(() => {
    const saved = localStorage.getItem('bigNewsAutomationLogs');
    return saved ? JSON.parse(saved) : [];
  });

  const [monetization, setMonetization] = useState<MonetizationConfig>({ adsenseId: '', monetagId: '', adsenseEnabled: false, monetagEnabled: false });

  // Persistence Effects
  useEffect(() => { localStorage.setItem('bigNewsArticles', JSON.stringify(articles)); }, [articles]);
  useEffect(() => { localStorage.setItem('bigNewsWallet', JSON.stringify(wallet)); }, [wallet]);
  useEffect(() => { localStorage.setItem('bigNewsBookmarks', JSON.stringify(bookmarks)); }, [bookmarks]);
  useEffect(() => { localStorage.setItem('bigNewsUserProfile', JSON.stringify(userProfile)); }, [userProfile]);
  useEffect(() => { localStorage.setItem('bigNewsAutomationConfig', JSON.stringify(automation)); }, [automation]);
  useEffect(() => { localStorage.setItem('bigNewsAutomationLogs', JSON.stringify(automationLogs)); }, [automationLogs]);
  useEffect(() => { localStorage.setItem('bigNewsVideos', JSON.stringify(videos)); }, [videos]);
  useEffect(() => { localStorage.setItem('bigNewsPreferences', JSON.stringify(preferences)); }, [preferences]);

  const toggleBookmark = (articleId: string) => {
    if (!userProfile) {
      setIsProfileModalOpen(true);
      return;
    }
    setBookmarks(prev => prev.includes(articleId) ? prev.filter(id => id !== articleId) : [...prev, articleId]);
  };

  const handleNewBackgroundArticle = (article: Article) => {
    setArticles(prev => [article, ...prev]);
  };

  const handleNewBackgroundLog = (log: AutomationLog) => {
    setAutomationLogs(prev => [log, ...prev].slice(0, 50));
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

  const filteredArticles = articles.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         a.summary.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedCategory === 'Bookmarks') return bookmarks.includes(a.id) && matchesSearch;
    if (selectedCategory === 'For You') return matchesSearch;
    if (selectedCategory === 'Videos') return false;
    return a.category === selectedCategory && matchesSearch;
  }).sort((a, b) => {
    if (selectedCategory === 'For You') return 0; // Natural order (latest first usually)
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const currentArticles = filteredArticles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const isDark = preferences.theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <BackgroundJournalist 
        config={automation}
        onUpdateConfig={setAutomation}
        onNewArticle={handleNewBackgroundArticle}
        onNewLog={handleNewBackgroundLog}
        isAuthenticated={isAuthenticated}
      />

      <BreakingNewsBanner articles={articles} onArticleClick={setSelectedArticle} />
      
      <header className={`sticky top-0 z-40 border-b transition-all ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'} backdrop-blur-md`}>
        <div className="max-w-[1600px] mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
            >
              <Menu size={24} />
            </button>
            <div onClick={() => { setShowAdminDashboard(false); setSelectedCategory('For You'); }} className="cursor-pointer">
              <Logo isDark={isDark} />
            </div>
          </div>

          <div className="hidden lg:flex flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search news, topics, or insights..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-full border transition-all focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Prominent Donation Button */}
            <button 
              onClick={() => setIsDonationModalOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-black text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-rose-500/20 active:scale-95 group ${isDark ? 'bg-rose-600 text-white hover:bg-rose-500' : 'bg-rose-500 text-white hover:bg-rose-600'}`}
            >
              <Heart size={16} className="fill-current group-hover:animate-pulse" />
              <span className="hidden md:inline">Support Us</span>
            </button>

            <button 
              onClick={() => setIsSettingsModalOpen(true)}
              className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
            >
              <Settings size={20} />
            </button>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowAdminDashboard(!showAdminDashboard)}
                  className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${showAdminDashboard ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                >
                  <LayoutDashboard size={18} />
                  {showAdminDashboard ? 'News Feed' : 'Dashboard'}
                </button>
                <button 
                  onClick={() => setIsAuthenticated(false)}
                  className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-2 text-sm font-bold p-2 hover:text-blue-600 transition-colors"
              >
                <Lock size={18} />
                <span className="hidden sm:inline">Admin Access</span>
              </button>
            )}

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>

            {userProfile ? (
              <button 
                onClick={() => setIsProfileModalOpen(true)}
                className={`flex items-center gap-2 p-1 pr-3 rounded-full border transition-all hover:shadow-md ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
              >
                <div className={`w-8 h-8 rounded-full ${userProfile.avatarColor} flex items-center justify-center text-white font-black text-xs`}>
                  {userProfile.name.charAt(0)}
                </div>
                <span className="text-xs font-bold hidden md:block">{userProfile.name}</span>
              </button>
            ) : (
              <button 
                onClick={() => setIsProfileModalOpen(true)}
                className={`p-2 rounded-full ${isDark ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'}`}
              >
                <UserIcon size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Categories Bar */}
        <nav className={`border-t overflow-x-auto no-scrollbar ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
          <div className="max-w-[1600px] mx-auto px-4 flex items-center gap-1">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => { setSelectedCategory(category); setShowAdminDashboard(false); setCurrentPage(1); }}
                className={`px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all relative group`}
              >
                <span className={selectedCategory === category ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}>
                  {category}
                </span>
                {selectedCategory === category && (
                  <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
                )}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 py-6 sm:py-10">
        {showAdminDashboard ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-wrap items-center gap-2 mb-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl inline-flex">
              {[
                { id: 'publisher', label: 'Publisher', icon: <PenLine size={16} /> },
                { id: 'analytics', label: 'Analytics', icon: <Activity size={16} /> },
                { id: 'monetization', label: 'Monetization', icon: <DollarSign size={16} /> },
                { id: 'videos', label: 'Videos', icon: <Film size={16} /> },
                { id: 'automation', label: 'Automation', icon: <Bot size={16} /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id as any)}
                  className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${adminTab === tab.id ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {adminTab === 'publisher' && <AdminEditor onPublish={(a) => setArticles([a, ...articles])} videos={videos} />}
            {adminTab === 'analytics' && <AnalyticsDashboard articles={articles} wallet={wallet} onWithdrawal={handleWithdrawal} />}
            {adminTab === 'monetization' && <MonetizationPanel config={monetization} onUpdate={setMonetization} />}
            {adminTab === 'videos' && <VideoManager videos={videos} onUpdateVideos={setVideos} />}
            {adminTab === 'automation' && <AutomationPanel config={automation} onUpdate={setAutomation} logs={automationLogs} />}
          </div>
        ) : selectedCategory === 'Videos' ? (
          <div className="animate-in fade-in duration-500">
            <div className="mb-10 text-center max-w-2xl mx-auto">
               <h2 className="text-4xl font-black font-serif mb-4">Big Shorts</h2>
               <p className="text-slate-500">Dive into the latest visual stories from around the globe.</p>
            </div>
            <VideoFeed videos={videos} onUpload={(v) => setVideos([v, ...videos])} />
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-3xl sm:text-4xl font-black font-serif flex items-center gap-3">
                 {selectedCategory}
                 {selectedCategory === 'Bookmarks' && <span className="text-sm font-sans font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{bookmarks.length}</span>}
               </h2>
               <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Showing {currentArticles.length} of {filteredArticles.length}
               </div>
            </div>

            {currentArticles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                  {currentArticles.map((article, idx) => (
                    <div key={article.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                      <NewsCard 
                        article={article} 
                        onClick={setSelectedArticle} 
                        preferences={preferences}
                        onUpdateArticle={updateArticle}
                        isBookmarked={bookmarks.includes(article.id)}
                        onToggleBookmark={() => toggleBookmark(article.id)}
                      />
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-16 flex justify-center items-center gap-4">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-3 rounded-full border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <div className="flex gap-2">
                       {Array.from({ length: totalPages }).map((_, i) => (
                         <button
                           key={i}
                           onClick={() => setCurrentPage(i + 1)}
                           className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}
                         >
                           {i + 1}
                         </button>
                       ))}
                    </div>
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-3 rounded-full border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-32 text-center">
                 <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-600">
                    <Search size={40} />
                 </div>
                 <h3 className="text-xl font-bold text-slate-500">No stories found here yet.</h3>
                 <p className="text-slate-400 mt-2 max-w-xs mx-auto">Try a different category or update your bookmarks to see content.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className={`py-12 border-t ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'}`}>
         <div className="max-w-[1600px] mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-4">
               <Logo isDark={isDark} />
               <p className="text-xs text-slate-400 max-w-sm text-center md:text-left leading-relaxed">
                 Big News is a cutting-edge journalism platform powered by Mova AI. 
                 © {new Date().getFullYear()} Big News Inc. All rights reserved.
               </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
               <button onClick={() => setIsFeedbackModalOpen(true)} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">Feedback</button>
               <button onClick={() => setIsDonationModalOpen(true)} className="text-xs font-bold uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors">Support Us</button>
               <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Privacy</span>
               <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Terms</span>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-[10px] font-black uppercase tracking-tighter">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  Live Servers Stable
               </div>
            </div>
         </div>
      </footer>

      {/* Modals */}
      <ArticleModal 
        article={selectedArticle} 
        onClose={() => setSelectedArticle(null)} 
        preferences={preferences}
        onUpdateArticle={updateArticle}
        onOpenDonation={() => setIsDonationModalOpen(true)}
        isBookmarked={selectedArticle ? bookmarks.includes(selectedArticle.id) : false}
        onToggleBookmark={() => selectedArticle && toggleBookmark(selectedArticle.id)}
      />

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLogin={() => { setIsAuthenticated(true); setShowAdminDashboard(true); }} 
      />

      <FeedbackModal 
        isOpen={isFeedbackModalOpen} 
        onClose={() => setIsFeedbackModalOpen(false)} 
      />

      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
        preferences={preferences} 
        onUpdatePreferences={setPreferences} 
      />

      <DonationModal 
        isOpen={isDonationModalOpen} 
        onClose={() => setIsDonationModalOpen(false)} 
        onSuccess={(amt) => { setIsDonationModalOpen(false); alert(`Thank you for donating $${amt}!`); }} 
        isDark={isDark}
      />

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        userProfile={userProfile} 
        onUpdateProfile={setUserProfile} 
        isDark={isDark} 
      />

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl animate-in fade-in duration-300 flex flex-col p-8">
           <div className="flex justify-between items-center mb-12">
              <Logo isDark={true} />
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-white"><X size={32} /></button>
           </div>
           <div className="flex flex-col gap-6">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => { setSelectedCategory(cat); setIsMobileMenuOpen(false); setShowAdminDashboard(false); }}
                  className={`text-2xl font-black font-serif text-left transition-colors ${selectedCategory === cat ? 'text-blue-400' : 'text-slate-400'}`}
                >
                  {cat}
                </button>
              ))}
           </div>
           <div className="mt-auto flex flex-col gap-4">
              <button onClick={() => { setIsDonationModalOpen(true); setIsMobileMenuOpen(false); }} className="w-full py-4 bg-rose-500 text-white rounded-xl font-black text-xl shadow-lg">Support Big News</button>
              <button onClick={() => { setIsSettingsModalOpen(true); setIsMobileMenuOpen(false); }} className="w-full py-4 bg-slate-800 text-white rounded-xl font-black text-xl">Settings</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;