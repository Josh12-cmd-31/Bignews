import React, { useState, useEffect, useRef } from 'react';
import { Article, UserPreferences, Comment, UserProfile } from '../types';
import { GoogleGenAI, Modality } from "@google/genai";
import { X, Clock, User, Share2, Heart, MessageSquare, Send, Gift, ShieldCheck, Check, Bookmark, Reply, AtSign, Facebook, Twitter, MessageCircle, Volume2, Square, Loader2 } from 'lucide-react';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdateArticle: (article: Article) => void;
  userProfile: UserProfile | null;
  onOpenDonation?: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

const AVATAR_COLORS = [
  'bg-blue-600', 'bg-red-600', 'bg-emerald-600', 'bg-amber-600', 
  'bg-indigo-600', 'bg-rose-600', 'bg-purple-600', 'bg-slate-700'
];

const getAvatarColor = (name: string) => {
  const charCode = name.charCodeAt(0) || 0;
  return AVATAR_COLORS[charCode % AVATAR_COLORS.length];
};

// --- Audio Utility Helpers ---
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const CommentItem: React.FC<{ 
  c: Comment; 
  isReply?: boolean; 
  isDark: boolean; 
  replyingTo: string | null; 
  setReplyingTo: (id: string | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  handleAddReply: (parentId: string) => void;
}> = ({ c, isReply = false, isDark, replyingTo, setReplyingTo, replyText, setReplyText, handleAddReply }) => (
  <div className={`${isReply ? 'mt-4 ml-8' : 'pb-6 border-b last:border-0 mb-6'} ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
    <div className="flex gap-4">
      <div className={`shrink-0 ${isReply ? 'w-8 h-8' : 'w-10 h-10'} rounded-full flex items-center justify-center text-white font-black uppercase tracking-tighter shadow-sm ${getAvatarColor(c.user)}`}>
         {c.user.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-xs font-bold mb-1.5">
          <span className={`flex items-center gap-1.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            {c.user}
            {c.userId === 'user' && <ShieldCheck size={12} className="text-emerald-500" />}
          </span> 
          <span className="text-slate-400 font-medium">{new Date(c.date).toLocaleDateString()}</span>
        </div>
        <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{c.text}</p>
        
        {!isReply && (
          <div className="mt-3 flex items-center gap-4">
            <button 
              onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
              className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${isDark ? 'text-slate-500 hover:text-blue-400' : 'text-slate-500 hover:text-blue-600'}`}
            >
              <Reply size={12} /> Reply
            </button>
          </div>
        )}

        {replyingTo === c.id && (
          <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex gap-2">
              <input 
                type="text" 
                autoFocus
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..." 
                className={`flex-1 px-4 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} 
              />
              <button 
                onClick={() => handleAddReply(c.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 active:scale-95"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>

    {c.replies && c.replies.map(reply => (
      <CommentItem 
        key={reply.id} 
        c={reply} 
        isReply 
        isDark={isDark} 
        replyingTo={replyingTo} 
        setReplyingTo={setReplyingTo}
        replyText={replyText}
        setReplyText={setReplyText}
        handleAddReply={handleAddReply}
      />
    ))}
  </div>
);

const ArticleModal: React.FC<ArticleModalProps> = ({ 
  article, 
  onClose, 
  preferences, 
  onUpdateArticle, 
  userProfile,
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
  
  // TTS State
  const [isNarrating, setIsNarrating] = useState(false);
  const [isTtsLoading, setIsTtsLoading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Re-ordered to define these before useEffects
  const stopNarration = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch(e) {}
      sourceNodeRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch(e) {}
      audioContextRef.current = null;
    }
    setIsNarrating(false);
    setIsTtsLoading(false);
  };

  const startNarration = async () => {
    if (isNarrating) {
      stopNarration();
      return;
    }

    setIsTtsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const plainText = article?.content.replace(/<[^>]*>?/gm, '') || "";
      const prompt = `Read the following news article professionally: "${article?.title}. By ${article?.author}. ${plainText}"`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) throw new Error("No audio returned");

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = await decodeAudioData(
        decodeBase64(base64Audio),
        audioContextRef.current,
        24000,
        1
      );

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => {
        setIsNarrating(false);
        audioContextRef.current = null;
      };

      sourceNodeRef.current = source;
      source.start();
      setIsNarrating(true);
    } catch (err) {
      console.error("TTS Error:", err);
      alert("AI Narration failed. Please try again later.");
    } finally {
      setIsTtsLoading(false);
    }
  };

  useEffect(() => {
    const storedName = localStorage.getItem('bigNewsGuestName');
    if (storedName) setGuestName(storedName);
  }, []);

  useEffect(() => {
    setIsLiked(false);
    setReplyingTo(null);
    stopNarration();
  }, [article?.id]);

  useEffect(() => {
    return () => stopNarration();
  }, []);

  if (!article) return null;

  const isDark = preferences.theme === 'dark';
  const effectiveName = userProfile?.name || guestName || 'Guest';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnSocial = (platform: 'facebook' | 'twitter' | 'whatsapp') => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(article.title);
    let shareUrl = '';
    switch (platform) {
      case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`; break;
      case 'twitter': shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`; break;
      case 'whatsapp': shareUrl = `https://wa.me/?text=${text}%20${url}`; break;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleLike = () => {
    if (isLiked) return;
    setIsLiked(true);
    onUpdateArticle({ ...article, likes: (article.likes || 0) + 1 });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!userProfile) localStorage.setItem('bigNewsGuestName', guestName);
    const comment: Comment = {
      id: Date.now().toString(),
      userId: userProfile ? 'user' : 'guest',
      user: effectiveName,
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
      userId: userProfile ? 'user' : 'guest',
      user: effectiveName,
      text: replyText,
      date: new Date().toISOString()
    };
    const updatedComments = (article.userComments || []).map(c => {
      if (c.id === parentId) return { ...c, replies: [...(c.replies || []), reply] };
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
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">{article.category}</span>
              <button 
                onClick={startNarration} 
                disabled={isTtsLoading}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  isNarrating 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isTtsLoading ? <Loader2 size={14} className="animate-spin" /> : isNarrating ? <Square size={12} fill="currentColor" /> : <Volume2 size={14} />}
                {isTtsLoading ? 'Synthesis...' : isNarrating ? 'Stop AI' : 'Listen AI'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onToggleBookmark} className={`p-2.5 border rounded-full transition-all duration-300 transform hover:-translate-y-1 ${isBookmarked ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white' : 'border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900'}`} title={isBookmarked ? "Saved to Bookmarks" : "Save Story"}>
                <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
              </button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1"></div>
              <button onClick={() => shareOnSocial('facebook')} className={`p-2.5 border rounded-full transition-all duration-300 transform hover:-translate-y-1 ${isDark ? 'border-slate-700 text-slate-400 hover:bg-blue-600 hover:border-blue-600 hover:text-white' : 'border-slate-200 text-slate-600 hover:bg-blue-600 hover:border-blue-600 hover:text-white'}`} title="Share on Facebook"><Facebook size={18} /></button>
              <button onClick={() => shareOnSocial('twitter')} className={`p-2.5 border rounded-full transition-all duration-300 transform hover:-translate-y-1 ${isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-900 hover:border-slate-600 hover:text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-900 hover:border-slate-900 hover:text-white'}`} title="Share on X"><Twitter size={18} /></button>
              <button onClick={() => shareOnSocial('whatsapp')} className={`p-2.5 border rounded-full transition-all duration-300 transform hover:-translate-y-1 ${isDark ? 'border-slate-700 text-slate-400 hover:bg-emerald-600 hover:border-emerald-600 hover:text-white' : 'border-slate-200 text-slate-600 hover:bg-emerald-600 hover:border-emerald-600 hover:text-white'}`} title="Share on WhatsApp"><MessageCircle size={18} /></button>
              <button onClick={handleCopyLink} className={`p-2.5 border rounded-full transition-all duration-500 transform relative group ${copied ? 'bg-emerald-500 border-emerald-500 text-white' : isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white' : 'border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900'}`} title="Copy Article Link">
                {copied ? <Check size={18} className="animate-in zoom-in" /> : <Share2 size={18} />}
                {copied && (<div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-xl whitespace-nowrap animate-in slide-in-from-bottom-2">Copied!</div>)}
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
              <div className="flex-1"><h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Support our Journalism</h3><p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Enjoying {article.author}'s coverage? Your contribution helps us keep Big News independent.</p></div>
              <button onClick={onOpenDonation} className="whitespace-nowrap px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2">Donate Now</button>
            </div>
          </div>

          <div className={`mt-12 pt-10 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
             <button onClick={handleLike} className={`flex items-center gap-2 px-6 py-2 rounded-full border transition-all ${isLiked ? 'bg-rose-50 text-rose-500 border-rose-200' : isDark ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'}`}><Heart size={20} className={isLiked ? 'fill-current' : ''} /><span className="font-bold">{article.likes}</span></button>
             <div className="mt-12">
               <h4 className="text-xl font-bold mb-6 flex items-center gap-2"><MessageSquare size={20} />Comments ({article.comments || 0})</h4>
               <div className="mb-4">
                  {userProfile ? (
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400"><ShieldCheck size={14} className="text-emerald-500" />Posting as <span className="text-blue-500">{userProfile.name}</span></div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Posting as:</span>
                      <div className="relative group flex-1 max-w-[200px]">
                        <AtSign className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={12} />
                        <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Your Nickname" className={`w-full pl-8 pr-3 py-1.5 text-xs font-bold rounded-lg border outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500'}`} />
                      </div>
                    </div>
                  )}
               </div>
               <form onSubmit={handleAddComment} className="flex flex-col sm:flex-row gap-2 mb-8">
                 <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Share your thoughts..." className={`flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
                 <button type="submit" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg active:scale-95"><Send size={18} /><span className="sm:hidden">Post</span></button>
               </form>
               <div className="space-y-4">
                 {article.userComments && article.userComments.length > 0 ? (
                   article.userComments.map(c => (
                    <CommentItem 
                      key={c.id} 
                      c={c} 
                      isDark={isDark} 
                      replyingTo={replyingTo} 
                      setReplyingTo={setReplyingTo}
                      replyText={replyText}
                      setReplyText={setReplyText}
                      handleAddReply={handleAddReply}
                    />
                   ))
                 ) : (<div className="text-center py-10 text-slate-400 text-sm italic">No comments yet. Start the conversation!</div>)}
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleModal;