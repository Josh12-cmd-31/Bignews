import React, { useState } from 'react';
import { Article, UserPreferences } from '../types';
import { X, Clock, User, Tag, Hash, Link, Check, Share2, Mail } from 'lucide-react';

// Inline SVG components for brand icons to ensure stability
const TwitterIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const FacebookIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const LinkedinIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const RedditIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M17 13c0 1.6-1.4 3-3.6 3-2 0-3.4-1.4-3.4-3 0-1.6 1.4-3 3.4-3 2.2 0 3.6 1.4 3.6 3z" />
    <path d="M17 13v-3" />
    <path d="M14 13.5a2.5 2.5 0 0 0-5 0" />
  </svg>
);

const WhatsappIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
  </svg>
);

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
  preferences: UserPreferences;
}

const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose, preferences }) => {
  const [copied, setCopied] = useState(false);

  if (!article) return null;

  const isDark = preferences.theme === 'dark';

  // Font size mapping
  const contentFontSizeClass = {
    small: 'prose-base',
    medium: 'prose-lg',
    large: 'prose-xl'
  }[preferences.fontSize];

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/#article=${article.id}` : '';
  const shareText = `Check out this article on Big News: ${article.title}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socialLinks = [
    {
      name: 'Twitter',
      icon: <TwitterIcon size={18} />,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      color: 'hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/30'
    },
    {
      name: 'Facebook',
      icon: <FacebookIcon size={18} />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30'
    },
    {
      name: 'LinkedIn',
      icon: <LinkedinIcon size={18} />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: 'hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30'
    },
    {
      name: 'Reddit',
      icon: <RedditIcon size={18} />,
      url: `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(article.title)}`,
      color: 'hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30'
    },
    {
      name: 'WhatsApp',
      icon: <WhatsappIcon size={18} />,
      url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      color: 'hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'
    },
    {
      name: 'Email',
      icon: <Mail size={18} />,
      url: `mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`,
      color: 'hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/30'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200 ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full aspect-video md:aspect-[21/9] group overflow-hidden">
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-full object-cover object-center"
          />
          
          {/* Watermark - unobtrusive */}
          <div className="absolute top-6 left-6 opacity-30 pointer-events-none z-10">
             <span className="text-xl md:text-2xl font-black text-white font-serif tracking-widest drop-shadow-lg border-b-2 border-white/20 pb-1">BIG NEWS</span>
          </div>

          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-20"
          >
            <X size={24} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 pt-20">
             <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-full mb-3 shadow-sm">
              {article.category}
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-white font-serif leading-tight shadow-sm">
              {article.title}
            </h2>
          </div>
        </div>

        <div className="p-6 md:p-10">
          {/* Metadata & Share Row */}
          <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b pb-6 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className={`flex flex-wrap items-center gap-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>
                  <User size={16} />
                </div>
                <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{article.author}</span>
              </div>
              <div className={`hidden sm:block w-1 h-1 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
              <div className="flex items-center space-x-1.5">
                <Clock size={16} />
                <span>
                  Published on {new Date(article.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(article.publishedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {article.isAiGenerated && (
                <>
                  <div className={`hidden sm:block w-1 h-1 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
                  <div className={`flex items-center space-x-1.5 font-medium px-2 py-0.5 rounded-full ${isDark ? 'text-purple-400 bg-purple-900/30' : 'text-purple-600 bg-purple-50'}`}>
                    <Tag size={14} />
                    <span>AI Generated</span>
                  </div>
                </>
              )}
            </div>

            {/* Share Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <div className={`flex items-center mr-2 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                <Share2 size={14} className="mr-1" />
                Share
              </div>
              
              <button
                onClick={handleCopyLink}
                className={`p-2 rounded-full transition-all duration-200 border ${
                    copied 
                    ? 'bg-green-50 border-green-200 text-green-600' 
                    : isDark 
                        ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-blue-700 hover:text-blue-400' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                    }`}
                title="Copy Link"
              >
                {copied ? <Check size={18} /> : <Link size={18} />}
              </button>

              <div className={`w-px h-6 mx-1 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>

              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full transition-colors duration-200 border border-transparent ${
                      isDark 
                        ? 'text-slate-500 hover:border-slate-700' 
                        : 'text-slate-400 hover:border-slate-200'
                    } ${link.color}`}
                  title={`Share on ${link.name}`}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          <div 
            className={`prose max-w-none font-serif leading-relaxed ${contentFontSizeClass} ${isDark ? 'prose-invert prose-p:text-slate-300 prose-headings:text-slate-100' : 'text-slate-800'}`}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {article.tags && article.tags.length > 0 && (
            <div className={`mt-12 pt-8 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className={`flex items-center text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                <Tag size={14} className="mr-2" />
                Related Topics
              </div>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className={`flex items-center text-sm font-medium transition-colors px-3 py-1.5 rounded-full cursor-default border ${
                        isDark 
                          ? 'text-slate-300 bg-slate-800 border-slate-700 hover:border-blue-700 hover:text-blue-400' 
                          : 'text-slate-600 bg-slate-50 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                    }`}
                  >
                    <Hash size={13} className={`mr-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleModal;