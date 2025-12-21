
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Article, Category, UserPreferences, MonetizationConfig, Video, AutomationConfig, AutomationLog, WalletState, Transaction } from './types';
import { MOCK_ARTICLES, CATEGORIES, MOCK_VIDEOS } from './constants';
import AdminEditor from './components/AdminEditor';
import NewsCard from './components/NewsCard';
import ArticleModal from './components/ArticleModal';
import BreakingNewsBanner from './components/BreakingNewsBanner';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import LoginModal from './components/LoginModal';
import FeedbackModal from './components/FeedbackModal';
import SettingsModal from './components/SettingsModal';
import MonetizationPanel from './components/MonetizationPanel';
import AutomationPanel from './components/AutomationPanel';
import DonationModal from './components/DonationModal';
import AdUnit from './components/AdUnit';
import VideoManager from './components/VideoManager';
import VideoFeed from './components/VideoFeed';
import Logo from './components/Logo';
import { generateArticleContent, identifyTrendingTopic } from './services/geminiService';
import { Newspaper, LayoutGrid, Menu, X, Shield, Search, BarChart3, PenTool, ChevronLeft, ChevronRight, LogOut, Lock, MessageSquarePlus, Settings, DollarSign, Film, Bot, Heart } from 'lucide-react';

// Security constant: Auto-logout after 15 minutes of inactivity
const SESSION_TIMEOUT_MS = 15 * 60 * 1000; 

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  
  // Admin Navigation State: 'publisher' | 'analytics' | 'monetization' | 'videos' | 'automation'
  const [adminTab, setAdminTab] = useState<'publisher' | 'analytics' | 'monetization' | 'videos' | 'automation'>('publisher');

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  
  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem('bigNewsArticles');
    return saved ? JSON.parse(saved) : MOCK_ARTICLES;
  });
  const [videos, setVideos] = useState<Video[]>(MOCK_VIDEOS);
  
  const [selectedCategory, setSelectedCategory] = useState<Category>('For You');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Personalization & Pagination state
  const [userInterests, setUserInterests] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Preferences State
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    fontSize: 'medium'
  });

  // Wallet Management
  const [wallet, setWallet] = useState<WalletState>(() => {
    const saved = localStorage.getItem('bigNewsWallet');
    if (saved) return JSON.parse(saved);
    
    const initialViews = MOCK_ARTICLES.reduce((sum, a) => sum + (a.views || 0), 0);
    const initialBalance = (initialViews / 1000) * 2.50; 
    return {
      balance: initialBalance,
      lifetimeEarnings: initialBalance,
      history: []
    };
  });

  // Automation State
  const [automation, setAutomation] = useState<AutomationConfig>(() => {
    const saved = localStorage.getItem('bigNewsAutomationConfig');
    return saved ? JSON.parse(saved) : {
      enabled: false,
      intervalMinutes: 60,
      autoCategories: ['Technology', 'Business', 'Science', 'Politics'],
      isCurrentlyRunning: false
    };
  });

  const [automationLogs, setAutomationLogs] = useState<AutomationLog[]>(() => {
    const saved = localStorage.getItem('bigNewsAutomationLogs');
    return saved ? JSON.parse(saved) : [];
  });

  // Monetization Config
  const [monetization, setMonetization] = useState<MonetizationConfig>({
    adsenseId: '',
    monetagId: '',
    adsenseEnabled: false,
    monetagEnabled: false
  });

  useEffect(() => {
    localStorage.setItem('bigNewsArticles', JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem('bigNewsWallet', JSON.stringify(wallet));
  }, [wallet]);

  useEffect(() => {
     const totalViews = articles.reduce((sum, a) => sum + a.views, 0);
     const earnedAmount = (totalViews / 1000) * 2.50;
     const currentWithdrawals = wallet.history.filter(tx => tx.amount < 0 && tx.status !== 'Failed').reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
     const currentDonations = wallet.history.filter(tx => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0);
     
     setWallet(prev => ({
        ...prev,
        balance: Math.max(0, earnedAmount + currentDonations - currentWithdrawals),
        lifetimeEarnings: earnedAmount + currentDonations
     }));
  }, [articles, wallet.history.length]);

  useEffect(() => {
    localStorage.setItem('bigNewsAutomationConfig', JSON.stringify(automation));
  }, [automation]);

  useEffect(() => {
    localStorage.setItem('bigNewsAutomationLogs', JSON.stringify(automationLogs));
  }, [automationLogs]);

  const runAutomationTask = useCallback(async () => {
    if (automation.isCurrentlyRunning) return;
    setAutomation(prev => ({ ...prev, isCurrentlyRunning: true }));
    try {
      const { topic, category } = await identifyTrendingTopic(automation.autoCategories);
      const generated = await generateArticleContent(topic, 'automation');
      const newArticle: Article = {
        id: `auto-${Date.now()}`,
        title: generated.title,
        summary: generated.summary,
        content: generated.content,
        category: (generated.category as Category) || (category as Category),
        author: 'Big News AI Bot',
        imageUrl: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
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

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      if (isAuthenticated) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setIsAuthenticated(false);
          setShowAdminDashboard(false);
        }, SESSION_TIMEOUT_MS);
      }
    };
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    resetTimer();
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      clearTimeout(timeoutId);
    };
  }, [isAuthenticated]);

  const handleWithdrawal = (amount: number, email: string) => {
    const tx: Transaction = { id: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, amount: -amount, method: 'PayPal', email, timestamp: new Date().toISOString(), status: 'Processing' };
    setWallet(prev => ({ ...prev, balance: prev.balance - amount, history: [tx, ...prev.history] }));
    setTimeout(() => {
      setWallet(prev => ({ ...prev, history: prev.history.map(t => t.id === tx.id ? { ...t, status: 'Completed' } : t) }));
    }, 5000);
  };

  const handleDonationSuccess = (amount: number) => {
    const tx: Transaction = { id: `DON-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, amount: amount, method: 'PayPal', email: 'Community Supporter', timestamp: new Date().toISOString(), status: 'Completed' };
    setWallet(prev => ({ ...prev, balance: prev.balance + amount, history: [tx, ...prev.history], lifetimeEarnings: prev.lifetimeEarnings + amount }));
  };

  const filteredArticles = articles.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.summary.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedCategory === 'For You') return matchesSearch;
    if (selectedCategory === 'Videos') return false;
    return a.category === selectedCategory && matchesSearch;
  }).sort((a, b) => {
    if (selectedCategory === 'For You') {
      const scoreA = userInterests[a.category] || 0;
      const scoreB = userInterests[b.category] || 0;
      if (scoreA !== scoreB) return scoreB - scoreA;
    }
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const currentArticles = filteredArticles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${preferences.theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
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
            <button 
              onClick={() => setIsDonationModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Heart size={14} className="fill-current" />
              <span className="hidden sm:inline">Support Us</span>
            </button>
            <button onClick={() => setIsSettingsModalOpen(true)} className="p-2"><Settings size={22} /></button>
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button onClick={() => setShowAdminDashboard(!showAdminDashboard)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs uppercase"><Shield size={16} /> Dashboard</button>
                <button onClick={() => setIsAuthenticated(false)} className="p-2 text-red-500"><LogOut size={22} /></button>
              </div>
            ) : (
              <button onClick={() => setIsLoginModalOpen(true)} className="px-4 py-2 bg-slate-900 text-white rounded-full font-bold text-xs uppercase"><Lock size={14} /> Admin</button>
            )}
          </div>
        </div>
        {!showAdminDashboard && (
          <div className="max-w-[1600px] mx-auto px-4 py-2">
            <nav className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }} className={`px-4 py-2 text-xs font-bold uppercase rounded-lg ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}>{cat}</button>
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
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                {['publisher', 'videos', 'automation', 'analytics', 'monetization'].map(tab => (
                  <button key={tab} onClick={() => setAdminTab(tab as any)} className={`px-4 py-2 text-xs font-bold uppercase rounded-lg ${adminTab === tab ? 'bg-white shadow' : 'text-slate-500'}`}>{tab}</button>
                ))}
              </div>
            </div>
            {adminTab === 'publisher' && <AdminEditor onPublish={newA => setArticles([newA, ...articles])} videos={videos} />}
            {adminTab === 'analytics' && <AnalyticsDashboard articles={articles} wallet={wallet} onWithdrawal={handleWithdrawal} />}
            {adminTab === 'automation' && <AutomationPanel config={automation} onUpdate={setAutomation} logs={automationLogs} />}
            {adminTab === 'monetization' && <MonetizationPanel config={monetization} onUpdate={setMonetization} />}
            {adminTab === 'videos' && <VideoManager videos={videos} onUpdateVideos={setVideos} />}
          </div>
        ) : (
          <div>
             {selectedCategory === 'Videos' ? <VideoFeed videos={videos} /> : (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                 {currentArticles.map(a => <NewsCard key={a.id} article={a} onClick={setSelectedArticle} preferences={preferences} onUpdateArticle={u => setArticles(articles.map(o => o.id === u.id ? u : o))} />)}
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
      />
      <DonationModal 
        isOpen={isDonationModalOpen} 
        onClose={() => setIsDonationModalOpen(false)} 
        onSuccess={handleDonationSuccess} 
        isDark={preferences.theme === 'dark'} 
      />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={() => setIsAuthenticated(true)} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} preferences={preferences} onUpdatePreferences={setPreferences} />
      <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />
    </div>
  );
};

export default App;
