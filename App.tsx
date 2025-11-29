
import React, { useState, useEffect } from 'react';
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
import { Newspaper, LayoutGrid, Menu, X, Shield, Search, BarChart3, PenTool, ChevronLeft, ChevronRight, LogOut, Lock, MessageSquarePlus, Settings, DollarSign, Film } from 'lucide-react';

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

  // Monetization State
  const [monetizationConfig, setMonetizationConfig] = useState<MonetizationConfig>({
    adsenseId: '',
    monetagId: '',
    adsenseEnabled: false,
    monetagEnabled: false
  });

  // Load from local storage on mount
  useEffect(() => {
    const savedArticles = localStorage.getItem('bigNewsArticles');
    if (savedArticles) {
      setArticles(JSON.parse(savedArticles));
    }

    const savedVideos = localStorage.getItem('bigNewsVideos');
    if (savedVideos) {
      setVideos(JSON.parse(savedVideos));
    }

    const savedInterests = localStorage.getItem('bigNewsUserInterests');
    if (savedInterests) {
      try {
        setUserInterests(JSON.parse(savedInterests));
      } catch (e) {
        console.error("Failed to parse user interests");
      }
    }

    const savedPreferences = localStorage.getItem('bigNewsPreferences');
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (e) {
        console.error("Failed to parse preferences");
      }
    }

    const savedMonetization = localStorage.getItem('bigNewsMonetization');
    if (savedMonetization) {
      try {
        setMonetizationConfig(JSON.parse(savedMonetization));
      } catch (e) {
        console.error("Failed to parse monetization config");
      }
    }
  }, []);

  // Update body class for dark mode
  useEffect(() => {
    if (preferences.theme === 'dark') {
      document.body.classList.add('bg-slate-900');
      document.body.classList.remove('bg-slate-50');
    } else {
      document.body.classList.add('bg-slate-50');
      document.body.classList.remove('bg-slate-900');
    }
    // Persist changes
    localStorage.setItem('bigNewsPreferences', JSON.stringify(preferences));
  }, [preferences]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowAdminDashboard(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowAdminDashboard(false);
    setSelectedCategory('For You');
  };

  const handlePublish = (article: Article) => {
    const updatedArticles = [article, ...articles];
    setArticles(updatedArticles);
    localStorage.setItem('bigNewsArticles', JSON.stringify(updatedArticles));
  };

  const handleUpdateArticle = (updatedArticle: Article) => {
    const updatedArticles = articles.map(a => a.id === updatedArticle.id ? updatedArticle : a);
    setArticles(updatedArticles);
    localStorage.setItem('bigNewsArticles', JSON.stringify(updatedArticles));
    
    // Also update selectedArticle if it matches to ensure modal stays in sync
    if (selectedArticle && selectedArticle.id === updatedArticle.id) {
      setSelectedArticle(updatedArticle);
    }
  };

  const handleUpdateVideos = (updatedVideos: Video[]) => {
    setVideos(updatedVideos);
    localStorage.setItem('bigNewsVideos', JSON.stringify(updatedVideos));
  };

  const handleUpdateMonetization = (config: MonetizationConfig) => {
    setMonetizationConfig(config);
    localStorage.setItem('bigNewsMonetization', JSON.stringify(config));
  };

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    
    // Update user interests for personalization
    const newInterests = { 
      ...userInterests, 
      [article.category]: (userInterests[article.category] || 0) + 1 
    };
    setUserInterests(newInterests);
    localStorage.setItem('bigNewsUserInterests', JSON.stringify(newInterests));
    
    // Increment views locally
    const updatedArticles = articles.map(a => 
      a.id === article.id ? { ...a, views: (a.views || 0) + 1 } : a
    );
    setArticles(updatedArticles);
    localStorage.setItem('bigNewsArticles', JSON.stringify(updatedArticles));
  };

  const getProcessedArticles = () => {
    let result = articles;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(article => 
        article.title.toLowerCase().includes(query) || 
        article.content.toLowerCase().includes(query) ||
        article.summary.toLowerCase().includes(query) ||
        (article.tags && article.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    if (selectedCategory !== 'For You' && selectedCategory !== 'Videos') {
      result = result.filter(article => article.category === selectedCategory);
    }

    result = [...result].sort((a, b) => {
      if (a.isBreaking && !b.isBreaking) return -1;
      if (!a.isBreaking && b.isBreaking) return 1;

      if (selectedCategory === 'For You') {
        const interestA = userInterests[a.category] || 0;
        const interestB = userInterests[b.category] || 0;
        const scoreA = (interestA * 1000) + (a.views || 0);
        const scoreB = (interestB * 1000) + (b.views || 0);
        return scoreB - scoreA;
      } else {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
    });

    return result;
  };

  const processedArticles = getProcessedArticles();
  const totalPages = Math.ceil(processedArticles.length / ITEMS_PER_PAGE);
  const paginatedArticles = processedArticles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  const isDark = preferences.theme === 'dark';

  return (
    <div className={`min-h-screen relative transition-colors duration-300 ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Watermark */}
      <div className="fixed bottom-0 right-0 p-4 sm:p-10 pointer-events-none z-0 opacity-[0.03] select-none overflow-hidden">
        <span className={`text-[12vw] font-black leading-none tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>BIG NEWS</span>
      </div>

      <BreakingNewsBanner articles={articles} onArticleClick={handleArticleClick} />

      {/* Navigation Bar */}
      <nav className={`sticky top-0 z-40 border-b shadow-sm transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-2">
            
            {/* Left: Logo & Mobile Menu */}
            <div className="flex items-center gap-2 shrink-0">
              <button 
                className={`md:hidden p-2 rounded-lg transition-colors active:bg-slate-200/20 ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
              
              <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  if (isAuthenticated) {
                    setShowAdminDashboard(false);
                  }
                  setSelectedCategory('For You');
                  setSearchQuery('');
                  setAdminTab('publisher');
                }}
              >
                <div className={`${isDark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'} p-1.5 rounded-lg shrink-0`}>
                  <Newspaper size={20} className="sm:w-6 sm:h-6" />
                </div>
                <span className={`text-lg sm:text-2xl font-black tracking-tight font-serif hidden xs:inline-block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Big<span className="text-blue-600">News</span>
                </span>
              </div>
            </div>

            {/* Center: Search Bar (Responsive) */}
            <div className="flex-1 max-w-lg flex items-center justify-end md:justify-center px-1 sm:px-4">
              <div className="relative w-full max-w-[200px] sm:max-w-full group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className={`transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`block w-full pl-9 pr-3 py-2 sm:py-2 border rounded-full text-sm leading-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:bg-slate-700' 
                      : 'bg-slate-100 border-transparent text-slate-900 placeholder-slate-500 focus:bg-white focus:border-slate-300'
                  }`}
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className={`p-2 rounded-full transition-colors active:scale-95 ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                title="Settings"
                aria-label="Settings"
              >
                <Settings size={22} />
              </button>

              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setShowAdminDashboard(!showAdminDashboard)}
                    className={`flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 ${
                      showAdminDashboard 
                        ? 'bg-blue-600 text-white' 
                        : isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title="Dashboard"
                  >
                    <Shield size={20} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">
                       {showAdminDashboard ? 'Dashboard Active' : 'Dashboard'}
                    </span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className={`p-2 sm:px-3 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 active:scale-95 ${
                      isDark 
                        ? 'text-slate-400 hover:bg-red-900/20 hover:text-red-400' 
                        : 'text-slate-600 hover:bg-red-50 hover:text-red-600'
                    }`}
                    title="Logout"
                  >
                    <LogOut size={20} />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className={`flex items-center gap-2 p-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow active:scale-95 ${
                    isDark 
                      ? 'bg-slate-100 text-slate-900 hover:bg-white' 
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                  title="Admin Login"
                >
                  <Lock size={18} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Login</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
           <div className="fixed inset-0 z-50 flex md:hidden">
             <div 
               className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
               onClick={() => setIsMobileMenuOpen(false)}
             />
             <div className={`relative w-4/5 max-w-xs h-full shadow-2xl flex flex-col ${isDark ? 'bg-slate-900 border-r border-slate-800' : 'bg-white border-r border-slate-200'} animate-in slide-in-from-left duration-300`}>
                <div className="p-4 border-b border-slate-100/10 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className={`${isDark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'} p-1 rounded`}>
                        <Newspaper size={16} />
                      </div>
                      <span className={`font-bold font-serif ${isDark ? 'text-white' : 'text-slate-900'}`}>Menu</span>
                   </div>
                   <button 
                     onClick={() => setIsMobileMenuOpen(false)}
                     className={`p-2 rounded-md ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
                   >
                      <X size={20} />
                   </button>
                </div>
                
                <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                   {isAuthenticated && (
                     <div className="mb-4 pb-4 border-b border-slate-100/10">
                        <div className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Admin</div>
                        <button
                          onClick={() => {
                            setShowAdminDashboard(!showAdminDashboard);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`flex items-center gap-3 w-full px-3 py-3 text-sm font-medium rounded-lg ${showAdminDashboard ? 'bg-blue-600 text-white' : (isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50')}`}
                        >
                          <Shield size={18} />
                          {showAdminDashboard ? 'Switch to Reader' : 'Admin Dashboard'}
                        </button>
                     </div>
                   )}
                   
                   <div className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Categories</div>
                   {CATEGORIES.map(cat => (
                     <button
                       key={cat}
                       onClick={() => {
                         setSelectedCategory(cat);
                         setIsMobileMenuOpen(false);
                         setShowAdminDashboard(false);
                       }}
                       className={`flex items-center gap-3 w-full px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                         selectedCategory === cat && !showAdminDashboard
                           ? (isDark ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-700')
                           : (isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50')
                       }`}
                     >
                       <span className="w-5 text-center flex justify-center">
                          {cat === 'Videos' ? <Film size={18} /> : <LayoutGrid size={18} className="opacity-0" />}
                       </span>
                       {cat}
                     </button>
                   ))}
                </div>
                
                <div className={`p-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                   <p className={`text-xs text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                     &copy; 2024 Big News Inc.
                   </p>
                </div>
             </div>
           </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar (Desktop) */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              {isAuthenticated && showAdminDashboard ? (
                // Admin Sidebar
                <div className="space-y-1">
                  <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Admin Tools
                  </h3>
                  {[
                    { id: 'publisher', label: 'Publisher', icon: PenTool },
                    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                    { id: 'videos', label: 'Short Videos', icon: Film },
                    { id: 'monetization', label: 'Monetization', icon: DollarSign },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setAdminTab(item.id as any)}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                        adminTab === item.id
                          ? (isDark ? 'bg-slate-800 text-blue-400 shadow-sm ring-1 ring-slate-700' : 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200')
                          : (isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-100' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                      }`}
                    >
                      <item.icon size={18} />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                // Reader Sidebar
                <div className="space-y-1">
                  <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Sections
                  </h3>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setShowAdminDashboard(false);
                      }}
                      className={`flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                        selectedCategory === cat && !showAdminDashboard
                          ? (isDark ? 'bg-slate-800 text-blue-400 shadow-sm ring-1 ring-slate-700' : 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200')
                          : (isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-100' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {cat === 'Videos' && <Film size={16} />}
                        {cat}
                      </span>
                      {cat === 'For You' && <LayoutGrid size={16} />}
                    </button>
                  ))}
                  
                  {/* Sidebar Ad Slot */}
                  {(monetizationConfig.adsenseEnabled || monetizationConfig.monetagEnabled) && (
                    <div className="pt-6 px-1">
                       <AdUnit 
                         type={monetizationConfig.monetagEnabled ? 'monetag' : 'adsense'} 
                         id={monetizationConfig.monetagEnabled ? monetizationConfig.monetagId : monetizationConfig.adsenseId}
                         preferences={preferences}
                         label="Sponsored"
                       />
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {isAuthenticated && showAdminDashboard ? (
               // Admin View
               <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
                 {/* Mobile Tab Switcher for Admin */}
                 <div className="md:hidden flex mb-6 bg-slate-200 dark:bg-slate-800 p-1 rounded-lg overflow-x-auto no-scrollbar">
                    {[
                      { id: 'publisher', label: 'Publisher' },
                      { id: 'analytics', label: 'Analytics' },
                      { id: 'videos', label: 'Videos' },
                      { id: 'monetization', label: 'Monetize' },
                    ].map((tab) => (
                      <button 
                        key={tab.id}
                        onClick={() => setAdminTab(tab.id as any)}
                        className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                          adminTab === tab.id 
                            ? (isDark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white shadow-sm text-slate-900') 
                            : (isDark ? 'text-slate-400' : 'text-slate-500')
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                 </div>

                 {adminTab === 'publisher' && (
                    <AdminEditor onPublish={handlePublish} videos={videos} />
                 )}
                 {adminTab === 'analytics' && (
                    <AnalyticsDashboard articles={articles} />
                 )}
                 {adminTab === 'monetization' && (
                    <MonetizationPanel config={monetizationConfig} onUpdate={handleUpdateMonetization} />
                 )}
                 {adminTab === 'videos' && (
                    <VideoManager videos={videos} onUpdateVideos={handleUpdateVideos} />
                 )}
               </div>
            ) : (
              // Reader View
              <div className="animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-2">
                  <div>
                     <h2 className={`text-2xl sm:text-3xl font-bold font-serif ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        {selectedCategory === 'For You' ? 'Top Stories For You' : selectedCategory}
                     </h2>
                     <p className={`text-sm sm:text-base mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {selectedCategory === 'For You' 
                          ? 'Curated based on your interests' 
                          : `Latest updates in ${selectedCategory}`}
                     </p>
                  </div>
                  <div className={`self-start sm:self-auto text-xs sm:text-sm font-medium px-3 py-1 rounded-full ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                    {selectedCategory === 'Videos' ? `${videos.length} Videos` : `${processedArticles.length} Articles`}
                  </div>
                </div>

                {/* Conditional Rendering: Video Feed or Article Feed */}
                {selectedCategory === 'Videos' ? (
                   <VideoFeed videos={videos} />
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {paginatedArticles.map((article, index) => (
                        <React.Fragment key={article.id}>
                           <NewsCard 
                              article={article} 
                              onClick={handleArticleClick} 
                              preferences={preferences}
                              onUpdateArticle={handleUpdateArticle}
                           />
                           {/* Inject Ad after every 4th article */}
                           {(index + 1) % 4 === 0 && (monetizationConfig.adsenseEnabled || monetizationConfig.monetagEnabled) && (
                              <div className="sm:col-span-2">
                                 <AdUnit 
                                   type={monetizationConfig.monetagEnabled ? 'monetag' : 'adsense'} 
                                   id={monetizationConfig.monetagEnabled ? monetizationConfig.monetagId : monetizationConfig.adsenseId}
                                   preferences={preferences}
                                 />
                              </div>
                           )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Empty State */}
                    {paginatedArticles.length === 0 && (
                      <div className="text-center py-20 px-4">
                        <p className="text-slate-500 text-lg">No articles found matching your criteria.</p>
                        <button 
                          onClick={() => {setSearchQuery(''); setSelectedCategory('For You');}}
                          className="mt-4 text-blue-600 hover:underline font-medium"
                        >
                          Clear filters
                        </button>
                      </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-8 sm:mt-12 flex justify-center items-center gap-2 sm:gap-4 pb-8">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`p-2.5 rounded-lg border transition-all active:scale-95 ${
                            currentPage === 1 
                              ? 'opacity-50 cursor-not-allowed border-transparent' 
                              : isDark 
                                ? 'border-slate-700 hover:bg-slate-800 text-slate-300' 
                                : 'border-slate-300 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <ChevronLeft size={20} />
                        </button>
                        
                        <div className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Page {currentPage} of {totalPages}
                        </div>

                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className={`p-2.5 rounded-lg border transition-all active:scale-95 ${
                            currentPage === totalPages 
                              ? 'opacity-50 cursor-not-allowed border-transparent' 
                              : isDark 
                                ? 'border-slate-700 hover:bg-slate-800 text-slate-300' 
                                : 'border-slate-300 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Footer Feedback Button - Positioned safe from bottom bars */}
      <div className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-30">
        <button
          onClick={() => setIsFeedbackModalOpen(true)}
          className={`flex items-center gap-2 px-3 py-3 sm:px-4 rounded-full shadow-lg shadow-black/20 transition-all transform active:scale-95 ${
            isDark 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
          aria-label="Give Feedback"
        >
          <MessageSquarePlus size={20} />
          <span className="font-medium hidden sm:inline">Feedback</span>
        </button>
      </div>

      {/* Modals */}
      <ArticleModal 
        article={selectedArticle} 
        onClose={() => setSelectedArticle(null)} 
        preferences={preferences}
        onUpdateArticle={handleUpdateArticle}
        monetization={monetizationConfig}
        videos={videos}
      />
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLoginSuccess}
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
    </div>
  );
};

export default App;
