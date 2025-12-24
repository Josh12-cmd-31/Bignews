
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
import Logo from './components/Logo';
import { generateArticleContent, identifyTrendingTopic } from './services/geminiService';
import { Menu, Shield, Search, LogOut, Lock, Settings, Heart, Bookmark, User as UserIcon } from 'lucide-react';

const SESSION_TIMEOUT_MS = 15 * 60 * 1000; 

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

  const [videos, setVideos] = useState<Video[]>(MOCK_VIDEOS);
  const [selectedCategory, setSelectedCategory] = useState<Category>('For You');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    fontSize: 'medium'
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

  useEffect(() => { localStorage.setItem('bigNewsArticles', JSON.stringify(articles)); }, [articles]);
  useEffect(() => { localStorage.setItem('bigNewsWallet', JSON.stringify(wallet)); }, [wallet]);
  useEffect(() => { localStorage.setItem('bigNewsBookmarks', JSON.stringify(bookmarks)); }, [bookmarks]);
  useEffect(() => { localStorage.setItem('bigNewsUserProfile', JSON.stringify(userProfile)); }, [userProfile]);

  const toggleBookmark = (articleId: string) => {
    if (!userProfile) {
      setIsProfileModalOpen(true);
      return;
    }
    setBookmarks(prev => prev.includes(articleId) ? prev.filter(id => id !== articleId) : [...prev, articleId]);
  };

  const runAutomationTask = useCallback(async () => {
    if (automation.isCurrentlyRunning) return;
    setAutomation(prev => ({ ...prev, isCurrentlyRunning: true }));
    try {
      const { topic, category } = await identifyTrendingTopic(automation.autoCategories as string[]);
      const generated = await generateArticleContent(topic, 'automation');
      
      // FIXED IMAGE SEED: Using timestamp as seed so it NEVER changes for this article
      const fixedSeed = Date.now();
      
      const newArticle: Article = {
        id: `auto-${fixedSeed}`,
        title: generated.title,
        subject: generated.subject,
        summary: generated.summary,
        content: generated.content,
        category: (generated.category as Category) || (category as Category),
        author: 'Big News AI Bot',
        imageUrl: `https://picsum.photos/seed/${fixedSeed}/1600/900`,
        publishedAt: new Date().toISOString(),
        isAiGenerated: true,
        isBreaking: Math.random() > 0.7,
        tags: generated.tags || [],
        views: 0,
        likes: 0,
        comments: 0,
        userComments: []
      };
      setArticles(prev => [newArticle, ...prev]);
      setAutomationLogs(prev => [{ id: Date.now().toString(), timestamp: new Date().toISOString(), status: 'success', articleTitle: newArticle.title, message: 'Auto-published' }, ...prev].slice(0, 50));
      setAutomation(prev => ({ ...prev, lastRunAt: new Date().toISOString(), isCurrentlyRunning: false }));
    } catch (error) {
      setAutomationLogs(prev => [{ id: Date.now().toString(), timestamp: new Date().toISOString(), status: 'error', message: 'AI connection error' }, ...prev].slice(0, 50));
      setAutomation(prev => ({ ...prev, isCurrentlyRunning: false }));
    }
  }, [automation]);

  useEffect(() => {
    if (!automation.enabled) return;
    const intervalId = setInterval(() => {
      const now = Date.now();
      const lastRun = automation.lastRunAt ? new Date(automation.lastRunAt).getTime() : 0;
      const threshold = automation.intervalMinutes * 60 * 1000;
      if (now - lastRun >= threshold) runAutomationTask();
    }, 10000);
    return () => clearInterval(intervalId);
  }, [automation.enabled, automation.lastRunAt, automation.intervalMinutes, runAutomationTask]);

  const filteredArticles = articles.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.summary.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedCategory === 'Bookmarks') return bookmarks.includes(a.id) && matchesSearch;
    if (selectedCategory === 'For You') return matchesSearch;
    if (selectedCategory === 'Videos') return false;
    return a.category === selectedCategory && matchesSearch;
  }).sort((a, b) => {
    if (selectedCategory === 'For You') return 0;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const currentArticles = filteredArticles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${preferences.theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <BreakingNewsBanner articles={articles} onArticleClick={setSelectedArticle} />
      <header className={`sticky top-0 z-40 border-b transition-all ${preferences.theme === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'} backdrop-blur-md`}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2"><Menu size={24} /></button>
             <Logo isDark={preferences.theme === 'dark'} />
          </div>
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" size={18} />
              <input type="text" placeholder="Search news..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full pl-10 pr-4 py-2 rounded-full border ${preferences.theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'}`} />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setIsDonationModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-xs font-bold transition-all shadow-md active:scale-95">
              <Heart size={14} className="fill-current" />
              <span className="hidden sm:inline">Support Us</span>
            </button>
            <button onClick={() => setIsProfileModalOpen(true)} className="flex items-center gap-2 p-1 rounded-full border border-slate-200 hover:border-blue-400 transition-colors">
              {userProfile ? (
                <div className={`w-8 h-8 rounded-full ${userProfile.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                  {userProfile.name.charAt(0)}
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <UserIcon size={18} />
                </div>
              )}
            </button>
            {isAuthenticated ? (
              <button onClick={() => setShowAdminDashboard(!showAdminDashboard)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs uppercase flex items-center gap-1"><Shield size={16} /> Dashboard</button>
            ) : (
              <button onClick={() => setIsLoginModalOpen(true)} className="p-2 text-slate-400"><Lock size={20} /></button>
            )}
          </div>
        </div>
        {!showAdminDashboard && (
          <div className="max-w-[1600px] mx-auto px-4 py-2">
            <nav className="flex items-center space-x-1 overflow-x-auto no-scrollbar pb-1">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }} className={`px-4 py-2 text-xs font-bold uppercase rounded-lg whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  {cat === 'Bookmarks' && <Bookmark size={12} className="inline mr-1" />}
                  {cat}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {showAdminDashboard ? (
          <div>
            <div className="flex justify-between items-center mb-10">
              <h1 className="text-3xl font-black">Dashboard</h1>
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {['publisher', 'videos', 'automation', 'analytics', 'monetization'].map(tab => (
                  <button key={tab} onClick={() => setAdminTab(tab as any)} className={`px-4 py-2 text-xs font-bold uppercase rounded-lg ${adminTab === tab ? 'bg-white dark:bg-slate-700 shadow text-blue-600' : 'text-slate-500'}`}>{tab}</button>
                ))}
              </div>
            </div>
            {adminTab === 'publisher' && <AdminEditor onPublish={newA => setArticles([newA, ...articles])} videos={videos} />}
            {adminTab === 'analytics' && <AnalyticsDashboard articles={articles} wallet={wallet} onWithdrawal={(a, e) => {}} />}
            {adminTab === 'automation' && <AutomationPanel config={automation} onUpdate={setAutomation} logs={automationLogs} />}
            {adminTab === 'monetization' && <MonetizationPanel config={monetization} onUpdate={setMonetization} />}
            {adminTab === 'videos' && <VideoManager videos={videos} onUpdateVideos={setVideos} />}
          </div>
        ) : (
          <div>
             {selectedCategory === 'Videos' ? <VideoFeed videos={videos} /> : (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                 {currentArticles.map(a => (
                   <NewsCard 
                    key={a.id} 
                    article={a} 
                    onClick={setSelectedArticle} 
                    preferences={preferences} 
                    onUpdateArticle={u => setArticles(articles.map(o => o.id === u.id ? u : o))} 
                    isBookmarked={bookmarks.includes(a.id)}
                    onToggleBookmark={() => toggleBookmark(a.id)}
                   />
                 ))}
               </div>
             )}
             {selectedCategory === 'Bookmarks' && bookmarks.length === 0 && (
               <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                  <Bookmark size={64} className="mx-auto text-slate-200 mb-4" />
                  <h2 className="text-2xl font-black font-serif">Your reading list is empty</h2>
                  <p className="text-slate-500 max-w-md mx-auto mt-2">Start saving stories you want to read later by clicking the bookmark icon on any article.</p>
               </div>
             )}
          </div>
        )}
      </main>

      <ArticleModal 
        article={selectedArticle} 
        onClose={() => setSelectedArticle(null)} 
        preferences={preferences} 
        onUpdateArticle={u => { setArticles(articles.map(o => o.id === u.id ? u : o)); setSelectedArticle(u); }} 
        onOpenDonation={() => setIsDonationModalOpen(true)}
        isBookmarked={selectedArticle ? bookmarks.includes(selectedArticle.id) : false}
        onToggleBookmark={() => selectedArticle && toggleBookmark(selectedArticle.id)}
      />
      
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        userProfile={userProfile} 
        onUpdateProfile={setUserProfile} 
        isDark={preferences.theme === 'dark'} 
      />

      <DonationModal isOpen={isDonationModalOpen} onClose={() => setIsDonationModalOpen(false)} onSuccess={() => {}} isDark={preferences.theme === 'dark'} />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={() => setIsAuthenticated(true)} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} preferences={preferences} onUpdatePreferences={setPreferences} />
      <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />
    </div>
  );
};

export default App;
