
import React, { useState, useEffect, useRef } from 'react';
import { Article, Category, UserPreferences, MonetizationConfig, Video } from './types';
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
import AdUnit from './components/AdUnit';
import VideoManager from './components/VideoManager';
import VideoFeed from './components/VideoFeed';
import Logo from './components/Logo';
import { Newspaper, LayoutGrid, Menu, X, Shield, Search, BarChart3, PenTool, ChevronLeft, ChevronRight, LogOut, Lock, MessageSquarePlus, Settings, DollarSign, Film } from 'lucide-react';

// Security constant: Auto-logout after 15 minutes of inactivity
const SESSION_TIMEOUT_MS = 15 * 60 * 1000; 

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  
  // Admin Navigation State: 'publisher' | 'analytics' | 'monetization' | 'videos'
  const [adminTab, setAdminTab] = useState<'publisher' | 'analytics' | 'monetization' | 'videos'>('publisher');

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  const [articles, setArticles] = useState<Article[]>(MOCK_ARTICLES);
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

  // Monetization Config
  const [monetization, setMonetization] = useState<MonetizationConfig>({
    adsenseId: '',
    monetagId: '',
    adsenseEnabled: false,
    monetagEnabled: false
  });

  // Track session for auto-logout
  useEffect(() => {
    let timeoutId: number;
    const resetTimer = () => {
      if (isAuthenticated) {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          setIsAuthenticated(false);
          setShowAdminDashboard(false);
          alert('Session expired for security. Please log in again.');
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

  // Handle Theme Preference
  useEffect(() => {
    if (preferences.theme === 'dark') {
      document.body.classList.add('bg-slate-900', 'text-slate-100');
      document.body.classList.remove('bg-slate-50', 'text-slate-900');
    } else {
      document.body.classList.add('bg-slate-50', 'text-slate-900');
      document.body.classList.remove('bg-slate-900', 'text-slate-100');
    }
  }, [preferences.theme]);

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    // Track interest for personalization
    setUserInterests(prev => ({
      ...prev,
      [article.category]: (prev[article.category] || 0) + 1
    }));
  };

  const filteredArticles = articles
    .filter(a => {
      const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.summary.toLowerCase().includes(searchQuery.toLowerCase());
      if (selectedCategory === 'For You') return matchesSearch;
      if (selectedCategory === 'Videos') return false;
      return a.category === selectedCategory && matchesSearch;
    })
    .sort((a, b) => {
       if (selectedCategory === 'For You') {
         // Sort by interest score, then date
         const scoreA = userInterests[a.category] || 0;
         const scoreB = userInterests[b.category] || 0;
         if (scoreA !== scoreB) return scoreB - scoreA;
       }
       return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const currentArticles = filteredArticles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${preferences.theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
      
      <BreakingNewsBanner articles={articles} onArticleClick={handleArticleClick} />

      {/* Navigation Header */}
      <header className={`sticky top-0 z-40 border-b transition-all ${preferences.theme === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'} backdrop-blur-md`}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
               className={`lg:hidden p-2 rounded-lg ${preferences.theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
             >
               {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
             </button>
             <Logo isDark={preferences.theme === 'dark'} />
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className={`relative w-full ${preferences.theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" size={18} />
              <input
                type="text"
                placeholder="Search headlines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-full border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                    preferences.theme === 'dark' 
                      ? 'bg-slate-900 border-slate-700 placeholder-slate-600 focus:bg-slate-800' 
                      : 'bg-slate-100 border-slate-200 placeholder-slate-400 focus:bg-white'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setIsSettingsModalOpen(true)}
              className={`p-2 rounded-full transition-colors ${preferences.theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
              title="Reading Settings"
            >
              <Settings size={22} />
            </button>
            <button 
               onClick={() => setIsFeedbackModalOpen(true)}
               className={`hidden sm:flex p-2 rounded-full transition-colors ${preferences.theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
               title="Send Feedback"
            >
              <MessageSquarePlus size={22} />
            </button>
            <div className={`w-px h-6 mx-1 ${preferences.theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAdminDashboard(!showAdminDashboard)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                    showAdminDashboard 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : (preferences.theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
                  }`}
                >
                  <Shield size={16} />
                  Dashboard
                </button>
                <button
                  onClick={() => { setIsAuthenticated(false); setShowAdminDashboard(false); }}
                  className={`p-2 rounded-full text-red-500 transition-colors ${preferences.theme === 'dark' ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}`}
                  title="Logout"
                >
                  <LogOut size={22} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${
                    preferences.theme === 'dark'
                      ? 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                      : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md'
                }`}
              >
                <Lock size={14} />
                Admin
              </button>
            )}
          </div>
        </div>

        {/* Categories Bar */}
        {!showAdminDashboard && (
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-2 -mb-px">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={`whitespace-nowrap px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : `hover:bg-slate-100 ${preferences.theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500'}`
                  }`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
           <div className={`absolute left-0 top-0 bottom-0 w-4/5 max-w-xs shadow-2xl animate-in slide-in-from-left duration-300 ${preferences.theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
              <div className="p-6">
                 <div className="flex justify-between items-center mb-10">
                    <Logo isDark={preferences.theme === 'dark'} />
                    <button onClick={() => setIsMobileMenuOpen(false)} className={preferences.theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                       <X size={24} />
                    </button>
                 </div>
                 
                 <div className="space-y-1">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setCurrentPage(1);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition-all ${
                          selectedCategory === cat
                            ? 'bg-blue-600 text-white'
                            : (preferences.theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100')
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                 </div>

                 <hr className={`my-8 ${preferences.theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`} />
                 
                 <div className="space-y-2">
                    <button 
                       onClick={() => { setIsMobileMenuOpen(false); setIsFeedbackModalOpen(true); }}
                       className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${preferences.theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                       <MessageSquarePlus size={20} /> Feedback
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {showAdminDashboard ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Admin Header with Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
               <h1 className="text-3xl font-black font-serif flex items-center gap-3">
                 Admin Dashboard
               </h1>
               
               <div className={`p-1 rounded-xl flex items-center ${preferences.theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <button 
                    onClick={() => setAdminTab('publisher')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${adminTab === 'publisher' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <PenTool size={16} /> Publisher
                  </button>
                  <button 
                    onClick={() => setAdminTab('videos')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${adminTab === 'videos' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Film size={16} /> Videos
                  </button>
                  <button 
                    onClick={() => setAdminTab('analytics')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${adminTab === 'analytics' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <BarChart3 size={16} /> Analytics
                  </button>
                  <button 
                    onClick={() => setAdminTab('monetization')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${adminTab === 'monetization' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <DollarSign size={16} /> Monetization
                  </button>
               </div>
            </div>

            {adminTab === 'publisher' && (
              <AdminEditor 
                onPublish={(newArticle) => setArticles([newArticle, ...articles])} 
                videos={videos}
              />
            )}
            {adminTab === 'analytics' && <AnalyticsDashboard articles={articles} />}
            {adminTab === 'monetization' && (
               <MonetizationPanel 
                  config={monetization} 
                  onUpdate={setMonetization} 
               />
            )}
            {adminTab === 'videos' && (
               <VideoManager 
                  videos={videos} 
                  onUpdateVideos={setVideos} 
               />
            )}
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header for Category */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-6 border-slate-200 dark:border-slate-800">
               <div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-serif mb-2">
                    {selectedCategory}
                  </h1>
                  <p className={`text-sm md:text-base font-medium max-w-xl ${preferences.theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {selectedCategory === 'For You' 
                      ? "Your personalized morning briefing, curated by Big News AI based on your reading habits." 
                      : `The latest headlines and exclusive coverage from the world of ${selectedCategory.toLowerCase()}.`}
                  </p>
               </div>
               
               {/* Search (Mobile/Tablet) */}
               <div className="md:hidden w-full relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                  <input
                    type="text"
                    placeholder="Search news..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                        preferences.theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                    }`}
                  />
               </div>
            </div>

            {selectedCategory === 'Videos' ? (
              <VideoFeed 
                 videos={videos} 
                 onUpload={(v) => setVideos([v, ...videos])} 
              />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {currentArticles.map((article) => (
                    <NewsCard 
                      key={article.id} 
                      article={article} 
                      onClick={handleArticleClick}
                      preferences={preferences}
                      onUpdateArticle={(updated) => setArticles(articles.map(a => a.id === updated.id ? updated : a))}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 py-12 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={`p-3 rounded-full transition-all border ${
                        currentPage === 1 
                          ? 'opacity-30 cursor-not-allowed border-slate-200' 
                          : 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                      }`}
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-10 h-10 rounded-full font-bold transition-all ${
                            currentPage === i + 1
                              ? 'bg-blue-600 text-white shadow-lg'
                              : `hover:bg-slate-100 ${preferences.theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500'}`
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className={`p-3 rounded-full transition-all border ${
                        currentPage === totalPages 
                          ? 'opacity-30 cursor-not-allowed border-slate-200' 
                          : 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                      }`}
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>
                )}
                
                {/* News Feed Ad Injection */}
                {monetization && (monetization.adsenseEnabled || monetization.monetagEnabled) && currentArticles.length >= 6 && (
                   <div className="w-full">
                      <AdUnit 
                        type={monetization.monetagEnabled ? 'monetag' : 'adsense'} 
                        id={monetization.monetagEnabled ? monetization.monetagId : monetization.adsenseId}
                        preferences={preferences}
                        label="Sponsored Content"
                      />
                   </div>
                )}

                {currentArticles.length === 0 && (
                  <div className="text-center py-40 animate-in zoom-in duration-300">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-6 text-slate-300 dark:text-slate-600">
                       <LayoutGrid size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-serif mb-2">No headlines found</h3>
                    <p className="text-slate-500 max-w-xs mx-auto">Try adjusting your search or selecting a different category.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Article Reader Modal */}
      <ArticleModal 
        article={selectedArticle} 
        allArticles={articles}
        onClose={() => setSelectedArticle(null)}
        onSelectArticle={handleArticleClick}
        preferences={preferences}
        onUpdateArticle={(updated) => {
          setArticles(articles.map(a => a.id === updated.id ? updated : a));
          setSelectedArticle(updated);
        }}
        monetization={monetization}
        videos={videos}
      />

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLogin={() => setIsAuthenticated(true)} 
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

      {/* Sub Footer Ad */}
      {!showAdminDashboard && monetization && (monetization.monetagEnabled) && (
         <div className="hidden sm:block">
            <AdUnit 
               type="monetag" 
               id={monetization.monetagId} 
               preferences={preferences} 
               label="Trending" 
            />
         </div>
      )}

      {/* Footer */}
      <footer className={`mt-auto border-t py-12 px-4 transition-colors ${preferences.theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          