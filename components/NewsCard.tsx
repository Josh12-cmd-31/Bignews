
import React from 'react';
import { Article, UserPreferences } from '../types';
import { ArrowRight, Clock, Eye, Heart, MessageSquare, ShieldCheck, Bookmark } from 'lucide-react';
import Logo from './Logo';

interface NewsCardProps {
  article: Article;
  onClick: (article: Article) => void;
  preferences: UserPreferences;
  onUpdateArticle: (article: Article) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (e: React.MouseEvent) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, onClick, preferences, onUpdateArticle, isBookmarked, onToggleBookmark }) => {
  const isDark = preferences.theme === 'dark';

  const getPreviewText = (html: string) => {
    const text = html.replace(/<[^>]*>?/gm, '');
    return text.length > 150 ? text.substring(0, 150) + "..." : text;
  };

  const previewText = getPreviewText(article.content);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateArticle({ ...article, likes: (article.likes || 0) + 1 });
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleBookmark) onToggleBookmark(e);
  };

  return (
    <article 
      className={`group rounded-xl shadow-sm hover:shadow-xl border overflow-hidden transition-all duration-300 flex flex-col h-full cursor-pointer transform hover:-translate-y-1 active:scale-[0.98] ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}
      onClick={() => onClick(article)}
    >
      <div className="relative w-full aspect-video overflow-hidden bg-slate-200 dark:bg-slate-700">
        <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700" loading="lazy" />
        
        {/* Bookmark Overlay Button */}
        <button 
          onClick={handleBookmark}
          className={`absolute top-4 right-4 z-40 p-2 rounded-full backdrop-blur-md transition-all sm:opacity-0 group-hover:opacity-100 ${
            isBookmarked 
              ? 'bg-blue-600 text-white scale-110 shadow-lg' 
              : 'bg-white/90 text-slate-800 hover:bg-blue-600 hover:text-white'
          }`}
          title={isBookmarked ? "Saved" : "Save for later"}
        >
          <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
        </button>

        {article.subject && (
           <div className="absolute bottom-0 left-0 right-0 z-20">
              <div className="bg-slate-900/90 backdrop-blur-sm border-t border-white/10 px-4 py-2.5 flex items-center gap-3">
                 <div className="bg-blue-600 text-white p-1 rounded-sm shadow-sm flex-shrink-0"><ShieldCheck size={12} /></div>
                 <p className="text-white text-[10px] sm:text-xs font-black uppercase tracking-widest line-clamp-1 italic">{article.subject}</p>
              </div>
           </div>
        )}

        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center p-6 text-white hidden sm:flex pointer-events-none z-30">
           <div className="flex items-center gap-2 mb-3 text-blue-400 text-xs font-bold uppercase tracking-wider translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ease-out">
             <Eye size={14} /> Quick Preview
           </div>
           <p className="text-sm font-serif leading-relaxed line-clamp-5 text-slate-200 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75 ease-out">{previewText}</p>
        </div>
        
        <div className="absolute bottom-3 right-3 opacity-30 z-20 pointer-events-none scale-75 origin-bottom-right group-hover:opacity-0 transition-opacity"><Logo variant="watermark" /></div>
        <div className="absolute top-4 left-4 sm:group-hover:opacity-0 transition-opacity duration-300 z-10">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">{article.category}</span>
        </div>
      </div>
      
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <div className={`flex flex-wrap items-center text-xs mb-3 gap-y-1 gap-x-2 text-slate-400`}>
            <div className="flex items-center gap-1"><Clock size={14} /><span>{new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span></div>
        </div>

        <h3 className={`text-lg sm:text-xl font-bold mb-2 font-serif leading-snug transition-colors line-clamp-2 ${isDark ? 'text-slate-100 group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-700'}`}>{article.title}</h3>
        <p className={`text-sm mb-4 line-clamp-3 flex-1 transition-colors ${isDark ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-600 group-hover:text-slate-500'}`}>{article.summary}</p>

        <div className={`mt-auto pt-4 border-t flex items-center justify-between font-semibold text-sm ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
          <div className="flex items-center gap-2">
            <button onClick={handleLikeClick} className={`flex items-center gap-1.5 transition-colors p-2 -ml-2 rounded-full ${isDark ? 'text-slate-400 hover:text-rose-400' : 'text-slate-500 hover:text-rose-600'}`} title="Like">
              <Heart size={16} /><span className="text-xs">{article.likes}</span>
            </button>
            <div className={`flex items-center gap-1.5 p-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} title="Comments">
              <MessageSquare size={16} /><span className="text-xs">{article.userComments?.length || 0}</span>
            </div>
          </div>
          <div className={`flex items-center ${isDark ? 'text-blue-400 group-hover:text-blue-300' : 'text-blue-600 group-hover:text-blue-700'}`}>
            <span className="relative text-xs sm:text-sm font-bold uppercase tracking-wide">Read Story<span className={`absolute left-0 bottom-0 w-full h-px scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ${isDark ? 'bg-blue-300' : 'bg-blue-700'}`}></span></span>
            <ArrowRight size={16} className="ml-1 sm:ml-2 transform transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
