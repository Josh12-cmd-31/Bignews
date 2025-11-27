import React, { useState, useEffect } from 'react';
import { Article, Category, UserPreferences } from './types';
import { MOCK_ARTICLES, CATEGORIES } from './constants';
import AdminEditor from './components/AdminEditor';
import NewsCard from './components/NewsCard';
import ArticleModal from './components/ArticleModal';
import BreakingNewsBanner from './components/BreakingNewsBanner';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import LoginModal from './components/LoginModal';
import FeedbackModal from './components/FeedbackModal';
import SettingsModal from './components/SettingsModal';
import { Newspaper, LayoutGrid, Menu, X, Shield, Search, BarChart3, PenTool, ChevronLeft, ChevronRight, LogOut, Lock, MessageSquarePlus, Settings } from 'lucide-react';

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false); // Controls view (Admin vs Reader)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [articles, setArticles] = useState<Article[]>(MOCK_ARTICLES);
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

  // Load from local storage on mount
  useEffect(() => {
    const savedArticles = localStorage.getItem('bigNewsArticles');
    if (savedArticles) {
      setArticles(JSON.parse(savedArticles));
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

    if (selectedCategory !== 'For You') {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button 
                className={`md:hidden p-2 mr-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div 
                className="flex items-center gap-2 cursor-pointer mr-6"
                onClick={() => {
                  if (isAuthenticated) {
                    setShowAdminDashboard(false);
                  }
                  setSelectedCategory('For You');
                  setSearchQuery('');
                  setShowAnalytics(false);
                }}
              >
                <div className={`${isDark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'} p-1.5 rounded-lg`}>
                  <Newspaper size={24} />
                </div>
                <span className={`text-2xl font-black tracking-tight font-serif hidden sm:block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Big<span className="text-blue-600">News</span>
                </span>
              </div>
            </div>

            {/* Search Bar (Desktop & Mobile) */}
            <div className="flex-1 max-w-lg flex items-center px-2">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search news, topics, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-full leading-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:bg-slate-800' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-500 focus:bg-white'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 ml-2">
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className={`p-2 rounded-full transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                title="Settings"
              >
                <Settings size={20} />
              </button>

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAdminDashboard(!showAdminDashboard)}
                    className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                      showAdminDashboard 
                        ? 'bg-blue-600 text-white' 
                        : isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Shield size={14} />
                    {showAdminDashboard ? 'Dashboard Active' : 'Go to Dashboard'}
                  </button>
                  <button
                    onClick={handleLogout}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors ${
                      isDark 
                        ? 'text-slate-400 hover:bg-red-900/20 hover:text-red-400' 
                        : 'text-slate-600 hover:bg-red-50 hover:text-red-600'
                    }`}
                    title="Logout"
                  >
                    <LogOut size={16} />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow ${
                    isDark 
                      ? 'bg-slate-100 text-slate-900 hover:bg-white' 
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  <Lock size={14} />
                  <span className="hidden sm:inline">Admin Login</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
           <div className={`md:hidden border-t ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
             <div className="px-2 pt-2 pb-3 space-y-1">
               {isAuthenticated && (
                  <button
                    onClick={() => {
                      setShowAdminDashboard(!showAdminDashboard);
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-blue-700 bg-blue-50 mb-2"
                  >
                    {showAdminDashboard ? 'Switch to Reader View' : 'Switch to Admin Dashboard'}
                  </button>
               )}
               {CATEGORIES.map(cat => (
                 <button
                   key={cat}
                   onClick={() => {
                     setSelectedCategory(cat);
                     setIsMobileMenuOpen(false);
                     setShowAdminDashboard(false);
                   }}
                   className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                     selectedCategory === cat && !showAdminDashboard
                       ? (isDark ? 'bg-slate-800 text-white font-bold' : 'bg-slate-100 text-slate-900 font-bold')
                       : (isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50')
                   }`}
                 >
                   {cat}
                 </button>
               ))}
             </div>
           </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
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
                  <button
                    onClick={() => setShowAnalytics(false)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      !showAnalytics
                        ? (isDark ? 'bg-slate-800 text-blue-400 shadow-sm ring-1 ring-slate-700' : 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200')
                        : (isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-100' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                    }`}
                  >
                    <PenTool size={18} />
                    <span>Publisher</span>
                  </button>
                  <button
                    onClick={() => setShowAnalytics(true)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      showAnalytics
                        ? (isDark ? 'bg-slate-800 text-blue-400 shadow-sm ring-1 ring-slate-700' : 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200')
                        : (isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-100' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                    }`}
                  >
                    <BarChart3 size={18} />
                    <span>Analytics</span>
                  </button>
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
                      <span>{cat}</span>
                      {cat === 'For You' && <LayoutGrid size={16} />}
                    </button>
                  ))}
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
                 <div className="md:hidden flex mb-6 bg-slate-200 p-1 rounded-lg">
                    <button 
                      onClick={() => setShowAnalytics(false)}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!showAnalytics ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                    >
                      Publisher
                    </button>
                    <button 
                      onClick={() => setShowAnalytics(true)}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${showAnalytics ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                    >
                      Analytics
                    </button>
                 </div>

                 {showAnalytics ? (
                   <AnalyticsDashboard articles={articles} />
                 ) : (
                   <AdminEditor onPublish={handlePublish} />
                 )}
               </div>
            ) : (
              // Reader View
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className={`text-3xl font-bold font-serif ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    {searchQuery ? `Search results: "${searchQuery}"` : selectedCategory}
                  </h1>
                  <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Showing {paginatedArticles.length} of {processedArticles.length} stories
                  </span>
                </div>

                {paginatedArticles.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {paginatedArticles.map(article => (
                        <NewsCard 
                          key={article.id} 
                          article={article} 
                          onClick={handleArticleClick}
                          preferences={preferences}
                        />
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className={`flex justify-center items-center gap-4 mt-8 pt-6 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                             isDark 
                               ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
                               : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <ChevronLeft size={16} />
                          Previous
                        </button>
                        <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                             isDark 
                               ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
                               : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Next
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className={`text-center py-20 backdrop-blur-sm rounded-xl border border-dashed ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-slate-300'}`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                      <Search size={32} className="text-slate-400" />
                    </div>
                    <h3 className={`text-lg font-medium ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>No stories found</h3>
                    <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                      {searchQuery 
                        ? `We couldn't find anything matching "${searchQuery}"` 
                        : `Check back later for news in ${selectedCategory}.`}
                    </p>
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="mt-4 text-blue-600 font-medium hover:text-blue-800"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className={`border-t mt-auto py-12 relative z-10 transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center space-y-4">
          <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>&copy; {new Date().getFullYear()} Big News Inc. All rights reserved.</p>
          <button 
            onClick={() => setIsFeedbackModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                isDark 
                  ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-blue-900/30 hover:text-blue-400' 
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <MessageSquarePlus size={16} />
            Give Feedback
          </button>
        </div>
      </footer>

      <ArticleModal 
        article={selectedArticle} 
        onClose={() => setSelectedArticle(null)}
        preferences={preferences}
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