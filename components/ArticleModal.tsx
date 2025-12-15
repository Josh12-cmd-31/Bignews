
import React, { useState, useEffect } from 'react';
import { Article, UserPreferences, Comment, MonetizationConfig, Video } from '../types';
import { X, Clock, User, Tag, Hash, Link, Check, Share2, Mail, Heart, MessageSquare, Send, Play, Film, ExternalLink, Edit2, Save, Reply } from 'lucide-react';
import AdUnit from './AdUnit';
import Logo from './Logo';

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
  onUpdateArticle: (article: Article) => void;
  monetization?: MonetizationConfig;
  videos?: Video[];
}

const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose, preferences, onUpdateArticle, monetization, videos }) => {
  const [copied, setCopied] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false); // Simple session-based like state
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  
  // Guest Profile State
  const [guestName, setGuestName] = useState('Guest');
  const [isEditingName, setIsEditingName] = useState(false);

  // Load guest identity from local storage
  useEffect(() => {
    const storedName = localStorage.getItem('bigNewsGuestName');
    if (storedName) {
      setGuestName(storedName);
    }
  }, []);

  // Reset video state when article changes
  useEffect(() => {
    setIsPlayingVideo(false);
  }, [article]);

  // Lock scroll on mobile when modal is open
  useEffect(() => {
    if (article) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [article]);

  if (!article) return null;

  const isDark = preferences.theme === 'dark';
  const linkedVideo = videos?.find(v => v.id === article.linkedVideoId);

  // Font size mapping
  const contentFontSizeClass = {
    small: 'prose-sm sm:prose-base',
    medium: 'prose-base sm:prose-lg',
    large: 'prose-lg sm:prose-xl'
  }[preferences.fontSize];

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/#article=${article.id}` : '';
  const shareText = `Check out this article on Big News: ${article.title}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = () => {
    if (isLiked) return; // Prevent multiple likes in one session for demo simplicity
    setIsLiked(true);
    onUpdateArticle({
      ...article,
      likes: (article.likes || 0) + 1
    });
  };

  const handleSaveName = () => {
    const trimmedName = guestName.trim() || 'Guest';
    setGuestName(trimmedName);
    localStorage.setItem('bigNewsGuestName', trimmedName);
    setIsEditingName(false);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    // Get or Create User ID
    let userId = localStorage.getItem('bigNewsGuestId');
    if (!userId) {
      userId = 'u-' + Date.now().toString(36) + Math.random().toString(36).substr(2);
      localStorage.setItem('bigNewsGuestId', userId);
    }

    const comment: Comment = {
      id: Date.now().toString(),
      userId: userId,
      user: guestName,
      userAvatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(guestName)}&background=random`,
      text: newComment.trim(),
      date: new Date().toISOString()
    };

    const updatedComments = [...(article.userComments || []), comment];

    onUpdateArticle({
      ...article,
      comments: updatedComments.length,
      userComments: updatedComments
    });

    setNewComment('');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className={`w-full h-full sm:h-auto sm:max-w-3xl sm:max-h-[90vh] overflow-y-auto sm:rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200 ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full aspect-video md:aspect-[21/9] group bg-black">
          {isPlayingVideo && linkedVideo ? (
             <div className="w-full h-full flex items-center justify-center">
                {linkedVideo.type === 'youtube' ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${linkedVideo.url}?autoplay=1&rel=0`}
                    title={linkedVideo.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video 
                    src={linkedVideo.url} 
                    className="w-full h-full object-contain" 
                    controls 
                    autoPlay
                  />
                )}
             </div>
          ) : (
            <>
              <img 
                src={article.imageUrl} 
                alt={article.title} 
                className="w-full h-full object-cover object-center"
              />
              
              {/* Play Button Overlay if video linked */}
              {linkedVideo && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer group-hover:bg-black/30 transition-colors"
                  onClick={() => setIsPlayingVideo(true)}
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/50 group-hover:scale-110 transition-transform duration-300">
                    <Play size={32} className="text-white ml-1" fill="white" />
                  </div>
                  <div className="absolute bottom-4 left-4 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                    <Film size={12} />
                    Watch Video
                  </div>
                </div>
              )}

              {/* Watermark - unobtrusive */}
              <div className="absolute top-6 left-6 opacity-30 pointer-events-none z-10 scale-90 origin-top-left">
                <Logo variant="watermark" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 sm:p-6 pt-20 pointer-events-none">
                <span className="inline-block px-3 py-1 bg-blue-600 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full mb-2 sm:mb-3 shadow-sm">
                  {article.category}
                </span>
                <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-white font-serif leading-tight shadow-sm line-clamp-2">
                  {article.title}
                </h2>
              </div>
            </>
          )}

          <button 
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-20 backdrop-blur-sm"
            aria-label="Close article"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 sm:p-8 md:p-10">
          {/* Metadata & Share Row */}
          <div className={`flex flex-col gap-6 mb-8 border-b pb-6 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className={`flex flex-wrap items-center gap-3 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>
                  <User size={16} />
                </div>
                <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{article.author}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-300"></div>
              <div className="flex items-center space-x-1.5">
                <Clock size={16} />
                <span>
                  {new Date(article.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
              {article.isAiGenerated && (
                <>
                  <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                  <div className={`flex items-center space-x-1.5 font-medium px-2 py-0.5 rounded-full ${isDark ? 'text-purple-400 bg-purple-900/30' : 'text-purple-600 bg-purple-50'}`}>
                    <Tag size={14} />
                    <span>AI Generated</span>
                  </div>
                </>
              )}
            </div>

            {/* Share Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Watch Video Button in Toolbar if not playing */}
              {linkedVideo && !isPlayingVideo && (
                 <button 
                    onClick={() => setIsPlayingVideo(true)}
                    className="flex items-center gap-1 mr-4 text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-700 transition-colors"
                 >
                    <Play size={14} fill="currentColor" />
                    Watch Video
                 </button>
              )}
              
              {/* External Source Link */}
              {article.sourceUrl && (
                <a 
                   href={article.sourceUrl}
                   target="_blank"
                   rel="noopener noreferrer"
                   className={`flex items-center gap-1 mr-4 text-xs font-bold uppercase tracking-wider transition-colors ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                >
                   <ExternalLink size={14} />
                   Read Original Source
                </a>
              )}

              <div className={`flex items-center mr-2 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                <Share2 size={14} className="mr-1" />
                Share
              </div>
              
              <button
                onClick={handleCopyLink}
                className={`p-2.5 rounded-full transition-all duration-200 border ${
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

              <div className="flex flex-wrap gap-2">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2.5 rounded-full transition-colors duration-200 border border-transparent ${
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
          </div>

          <div 
            className={`prose max-w-none font-serif leading-relaxed ${contentFontSizeClass} ${isDark ? 'prose-invert prose-p:text-slate-300 prose-headings:text-slate-100' : 'text-slate-800'}`}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
          
          {/* Article Ad Unit */}
          {monetization && (monetization.adsenseEnabled || monetization.monetagEnabled) && (
            <div className="my-8">
               <AdUnit 
                  type={monetization.monetagEnabled ? 'monetag' : 'adsense'} 
                  id={monetization.monetagEnabled ? monetization.monetagId : monetization.adsenseId}
                  preferences={preferences}
               />
            </div>
          )}

          {article.tags && article.tags.length > 0 && (
            <div className={`mt-8 pt-6 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
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

          {/* Engagement Section */}
          <div className={`mt-10 pt-8 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <h3 className={`text-xl font-bold font-serif mb-6 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Reactions</h3>
            
            {/* Like Button */}
            <div className="flex items-center gap-4 mb-8">
               <button
                  onClick={handleLike}
                  disabled={isLiked}
                  className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-300 border active:scale-95 ${
                     isLiked 
                       ? 'bg-rose-50 border-rose-200 text-rose-600' 
                       : isDark 
                          ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-rose-400 hover:border-rose-400/50' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                  }`}
               >
                 <Heart size={24} className={isLiked ? 'fill-current animate-bounce' : ''} />
                 <span className="font-semibold text-lg">{article.likes?.toLocaleString()}</span>
                 <span className="text-sm opacity-80">{isLiked ? 'Liked' : 'Like'}</span>
               </button>
            </div>

            {/* Comments Section */}
            <div className={`rounded-xl p-4 sm:p-6 ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
               <div className="flex items-center justify-between mb-6">
                 <h4 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                   <MessageSquare size={20} />
                   Comments ({article.userComments?.length || 0})
                 </h4>
               </div>

               <div className="space-y-6 mb-8">
                  {article.userComments && article.userComments.length > 0 ? (
                    article.userComments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 animate-in slide-in-from-bottom-2 duration-300">
                         {comment.userAvatarUrl ? (
                           <img src={comment.userAvatarUrl} alt={comment.user} className="w-10 h-10 rounded-full shrink-0 object-cover" />
                         ) : (
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-blue-100 text-blue-700'}`}>
                             {comment.user.charAt(0)}
                           </div>
                         )}
                         <div className="flex-1">
                            <div className="flex items-baseline gap-2 mb-1">
                               <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{comment.user}</span>
                               <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                 {new Date(comment.date).toLocaleDateString()}
                               </span>
                            </div>
                            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{comment.text}</p>
                            
                            <button 
                                onClick={() => setNewComment(`@${comment.user} `)}
                                className={`mt-2 flex items-center gap-1.5 text-xs font-medium transition-colors ${isDark ? 'text-slate-500 hover:text-blue-400' : 'text-slate-500 hover:text-blue-600'}`}
                            >
                                <Reply size={14} /> Reply
                            </button>
                         </div>
                      </div>
                    ))
                  ) : (
                    <p className={`text-sm italic ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>No comments yet.</p>
                  )}
               </div>

               {/* Add Comment Form */}
               <form onSubmit={handleAddComment} className="relative">
                 <div className="mb-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                       <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Posting as:</span>
                       {isEditingName ? (
                         <div className="flex items-center gap-1">
                           <input 
                              type="text" 
                              value={guestName}
                              onChange={(e) => setGuestName(e.target.value)}
                              className={`px-2 py-0.5 rounded border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'}`}
                              autoFocus
                           />
                           <button type="button" onClick={handleSaveName} className="p-0.5 text-green-500 hover:bg-green-100 rounded">
                              <Save size={14} />
                           </button>
                         </div>
                       ) : (
                         <div className="flex items-center gap-1">
                           <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{guestName}</span>
                           <button type="button" onClick={() => setIsEditingName(true)} className="text-blue-500 hover:underline">
                              <Edit2 size={12} />
                           </button>
                         </div>
                       )}
                    </div>
                 </div>

                 <input
                   type="text"
                   value={newComment}
                   onChange={(e) => setNewComment(e.target.value)}
                   placeholder="Write a comment..."
                   className={`w-full pl-4 pr-12 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                      isDark 
                        ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500' 
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                   }`}
                 />
                 <button
                   type="submit"
                   disabled={!newComment.trim()}
                   className="absolute right-2 bottom-1.5 p-2 rounded-md text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                 >
                   <Send size={18} />
                 </button>
               </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ArticleModal;
