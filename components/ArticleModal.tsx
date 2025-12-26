
import React, { useState, useEffect } from 'react';
import { Article, UserPreferences, Comment, MonetizationConfig, Video } from '../types';
import { X, Clock, User, Share2, Heart, MessageSquare, Send, Gift, ShieldCheck, Check, Bookmark, Reply } from 'lucide-react';
import Logo from './Logo';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdateArticle: (article: Article) => void;
  onOpenDonation?: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

const ArticleModal: React.FC<ArticleModalProps> = ({ 
  article, 
  onClose, 
  preferences, 
  onUpdateArticle, 
  onOpenDonation,
  isBookmarked,
  onToggleBookmark
}) => {
  const [copied, setCopied] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [guestName, setGuestName] = useState('Guest');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const storedName = localStorage.getItem('bigNewsGuestName');
    if (storedName) setGuestName(storedName);
  }, []);

  useEffect(() => {
    setIsLiked(false);
    setReplyingTo(null);
  }, [article?.id]);

  if (!article) return null;

  const isDark = preferences.theme === 'dark';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = () => {
    if (isLiked) return;
    setIsLiked(true);
    onUpdateArticle({ ...article, likes: (article.likes || 0) + 1 });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      userId: 'guest',
      user: guestName,
      text: newComment,
      date: new Date().toISOString(),
      replies: []
    };

    onUpdateArticle({
      ...article,
      userComments: [comment, ...(article.userComments || [])],
      comments: (article.comments || 0) + 1
    });
    setNewComment('');
  };

  const handleAddReply = (parentId: string) => {
    if (!replyText.trim()) return;

    const reply: Comment = {
      id: Date.now().toString(),
      userId: 'guest',
      user: guestName,
      text: replyText,
      date: new Date().toISOString()
    };

    const updatedComments = (article.userComments || []).map(c => {
      if (c.id === parentId) {
        return { ...c, replies: [...(c.replies || []), reply] };
      }
      return c;
    });

    onUpdateArticle({
      ...article,
      userComments: updatedComments,
      comments: (article.comments || 0) + 1
    });
    setReplyText('');
    setReplyingTo(null);
  };

  // Fix: Explicitly using React.FC to allow 'key' prop which is required for mapped components
  const CommentItem: React.FC<{ c: Comment, isReply?: boolean }> = ({ c, isReply = false }) => (
    <div className={`${isReply ? 'mt-4 ml-8' : 'pb-6 border-b last:border-0 mb-6'} ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
      <div className="flex justify-between text-xs font-bold mb-2">
        <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>{c.user}</span> 
        <span className="text-slate-400">{new Date(c.date).toLocaleDateString()}</span>
      </div>
      <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{c.text}</p>
      
      {!isReply && (
        <div className="mt-3 flex items-center gap-4">
          <button 
            onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
            className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${isDark ? 'text-slate-500 hover:text-blue-400' : 'text-slate-500 hover:text-blue-600'}`}
          >
            <Reply size={14} /> Reply
          </button>
        </div>
      )}

      {replyingTo === c.id && (
        <div className="mt-4 ml-8 animate-in slide-in-from-top-2 duration-200">
          <div className="flex gap-2">
            <input 
              type="text" 
              autoFocus
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..." 
              className={`flex-1 p-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} 
            />
            <button 
              onClick={() => handleAddReply(c.id)}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {c.replies && c.replies.map(reply => (
        <CommentItem key={reply.id} c={reply} isReply />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className={`w-full h-full sm:h-auto sm:max-w-3xl sm:max-h-[90vh] overflow-y-auto sm:rounded-xl shadow-2xl ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}`} onClick={e => e.stopPropagation()}>
        <div className="relative aspect-video bg-black overflow-hidden">
          <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
          
          {article.subject && (
            <div className="absolute bottom-0 left-0 right-0 z-20">
              <div className="bg-slate-900/90 backdrop-blur-md border-t border-white/10 px-6 py-4 flex items-center gap-4">
                 <div className="bg-blue-600 text-white p-2 rounded-md shadow-lg flex-shrink-0"><ShieldCheck size={20} /></div>
                 <p className="text-white text-xs sm:text-sm font-black uppercase tracking-widest line-clamp-2 italic leading-snug">{article.subject}</p>
              </div>
            </div>
          )}
          
          <button onClick={onClose} className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-colors z-30"><X size={24} /></button>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mb-6 flex justify-between items-center">
            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold uppercase rounded-full shadow-sm">{article.category}</span>
            <div className="flex gap-2">
              <button 
                onClick={onToggleBookmark} 
                className={`p-2 border rounded-full transition-all ${
                  isBookmarked 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                    : isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
                title={isBookmarked ? "Saved" : "Save for later"}
              >
                <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
              </button>
              <button onClick={handleCopyLink} className={`p-2 border rounded-full transition-colors ${isDark ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'}`} title="Copy Link">
                {copied ? <Check size={18} className="text-green-500" /> : <Share2 size={18} />}
              </button>
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold font-serif mb-4 leading-tight">{article.title}</h2>
          
          <div className={`flex items-center gap-4 text-sm mb-8 pb-6 border-b ${isDark ? 'text-slate-500 border-slate-800' : 'text-slate-500 border-slate-100'}`}>
             <div className="flex items-center gap-2"><User size={16} /> <span>{article.author}</span></div>
             <div className="flex items-center gap-2"><Clock size={16} /> <span>{new Date(article.publishedAt).toLocaleDateString()}</span></div>
          </div>

          <div className={`prose max-w-none font-serif leading-relaxed text-lg ${isDark ? 'prose-invert' : ''}`} dangerouslySetInnerHTML={{ __html: article.content }} />
          
          <div className={`mt-12 p-8 rounded-2xl border-2 border-dashed transition-colors ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-rose-50 border-rose-100'}`}>
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className={`p-4 rounded-full ${isDark ? 'bg-slate-700 text-rose-400' : 'bg-white text-rose-500 shadow-sm'}`}><Gift size={32} /></div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Support our Journalism</h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Enjoying {article.author}'s coverage? Your contribution helps us keep Big News independent.</p>
              </div>
              <button onClick={onOpenDonation} className="whitespace-nowrap px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2">Donate Now</button>
            </div>
          </div>

          <div className={`mt-12 pt-10 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
             <button onClick={handleLike} className={`flex items-center gap-2 px-6 py-2 rounded-full border transition-all ${isLiked ? 'bg-rose-50 text-rose-500 border-rose-200' : isDark ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'}`}>
               <Heart size={20} className={isLiked ? 'fill-current' : ''} /> 
               <span className="font-bold">{article.likes}</span>
             </button>

             <div className="mt-12">
               <h4 className="text-xl font-bold mb-6 flex items-center gap-2"><MessageSquare size={20} />Comments ({article.comments || 0})</h4>
               <form onSubmit={handleAddComment} className="flex gap-2 mb-8">
                 <input 
                  type="text" 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..." 
                  className={`flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} 
                 />
                 <button type="submit" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"><Send size={18} /></button>
               </form>
               <div className="space-y-2">
                 {article.userComments && article.userComments.length > 0 ? (
                   article.userComments.map(c => <CommentItem key={c.id} c={c} />)
                 ) : (
                   <div className="text-center py-10 text-slate-400 text-sm italic">No comments yet.</div>
                 )}
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleModal;
