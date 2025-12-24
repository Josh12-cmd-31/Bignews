
import React, { useState, useEffect, useRef } from 'react';
import { Article, Category, Video } from '../types';
import { CATEGORIES } from '../constants';
import { generateArticleContent } from '../services/geminiService';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Loader2, 
  Tags, 
  Save, 
  Trash2, 
  CheckCircle,
  History,
  PenLine,
  ChevronDown,
  ChevronUp,
  Film, 
  Link as LinkIcon, 
  Globe, 
  Layout, 
  Flag,
  Upload,
  X
} from 'lucide-react';

interface AdminEditorProps {
  onPublish: (article: Article) => void;
  videos: Video[];
}

interface Draft {
  id: string;
  savedAt: number;
  topic: string;
  formData: {
    title: string;
    subject: string;
    category: Category;
    content: string;
    summary: string;
    author: string;
    imageUrl: string;
    tags: string;
    isBreaking: boolean;
    linkedVideoId: string;
    sourceUrl: string;
  };
}

const AdminEditor: React.FC<AdminEditorProps> = ({ onPublish, videos }) => {
  const [inputMode, setInputMode] = useState<'topic' | 'url'>('topic');
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [showAiPanel, setShowAiPanel] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    category: 'Technology' as Category,
    content: '',
    summary: '',
    author: 'Admin',
    imageUrl: `https://picsum.photos/seed/${Math.floor(Math.random() * 1000000)}/1600/900`,
    tags: '',
    isBreaking: false,
    linkedVideoId: '',
    sourceUrl: ''
  });

  useEffect(() => {
    const savedDrafts = localStorage.getItem('bigNewsDrafts');
    if (savedDrafts) {
      try {
        setDrafts(JSON.parse(savedDrafts));
      } catch (e) {
        console.error("Failed to parse drafts", e);
      }
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const saveDraft = () => {
    const newDraft: Draft = {
      id: currentDraftId || Date.now().toString(),
      savedAt: Date.now(),
      topic: inputValue,
      formData: { ...formData }
    };

    let updatedDrafts;
    if (currentDraftId) {
      updatedDrafts = drafts.map(d => d.id === currentDraftId ? newDraft : d);
    } else {
      updatedDrafts = [newDraft, ...drafts];
      setCurrentDraftId(newDraft.id);
    }

    setDrafts(updatedDrafts);
    localStorage.setItem('bigNewsDrafts', JSON.stringify(updatedDrafts));
    
    const btn = document.getElementById('save-draft-btn');
    if(btn) {
       const originalText = btn.innerHTML;
       btn.innerHTML = '<span class="flex items-center gap-2">Saved</span>';
       setTimeout(() => btn.innerHTML = originalText, 2000);
    }
  };

  const loadDraft = (draft: Draft) => {
    if (window.confirm("Loading this draft will overwrite your current changes. Continue?")) {
      setFormData(draft.formData);
      setInputValue(draft.topic);
      setCurrentDraftId(draft.id);
    }
  };

  const deleteDraft = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this draft?")) {
      const updatedDrafts = drafts.filter(d => d.id !== id);
      setDrafts(updatedDrafts);
      localStorage.setItem('bigNewsDrafts', JSON.stringify(updatedDrafts));
      if (currentDraftId === id) setCurrentDraftId(null);
    }
  };

  const handleGenerate = async () => {
    if (!inputValue.trim()) return;
    setIsGenerating(true);
    try {
      const generated = await generateArticleContent(inputValue, inputMode);
      setFormData(prev => ({
        ...prev,
        title: generated.title,
        subject: generated.subject || '',
        content: generated.content,
        summary: generated.summary,
        category: (CATEGORIES.includes(generated.category as Category) ? generated.category : 'Technology') as Category,
        tags: generated.tags ? generated.tags.join(', ') : '',
        sourceUrl: inputMode === 'url' ? inputValue : prev.sourceUrl,
        // Ensure generated image uses a STABLE seed so it never changes
        imageUrl: `https://picsum.photos/seed/${Date.now()}/1600/900`
      }));
      setShowAiPanel(false);
    } catch (err) {
      alert("Failed to generate content. Please check API key or try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert('Title and Content are required.');
      return;
    }

    const newArticle: Article = {
      id: Date.now().toString(),
      ...formData,
      publishedAt: new Date().toISOString(),
      isAiGenerated: !!inputValue,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
      views: 0,
      likes: 0,
      comments: 0,
      userComments: []
    };
    onPublish(newArticle);
    
    if (currentDraftId) {
       const updatedDrafts = drafts.filter(d => d.id !== currentDraftId);
       setDrafts(updatedDrafts);
       localStorage.setItem('bigNewsDrafts', JSON.stringify(updatedDrafts));
    }

    setFormData({
      title: '',
      subject: '',
      category: 'Technology',
      content: '',
      summary: '',
      author: 'Admin',
      imageUrl: `https://picsum.photos/seed/${Math.floor(Math.random() * 1000000)}/1600/900`,
      tags: '',
      isBreaking: false,
      linkedVideoId: '',
      sourceUrl: ''
    });
    setInputValue('');
    setCurrentDraftId(null);
    alert('Article published successfully!');
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-20">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10 bg-white/80 backdrop-blur-md py-4 border-b border-slate-100">
        <div>
           <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
             <PenLine className="text-blue-600" />
             Publisher Studio
           </h2>
           <p className="text-sm text-slate-500">
             {currentDraftId ? 'Editing Draft Mode' : 'Create new content for the feed'}
           </p>
        </div>
        <div className="flex gap-3">
             <button
                type="button"
                id="save-draft-btn"
                onClick={saveDraft}
                className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium shadow-sm transition-all flex items-center gap-2 text-sm"
              >
                <Save size={16} />
                Save Draft
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-sm"
              >
                <CheckCircle size={16} />
                Publish Live
              </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 overflow-hidden relative group">
            <div 
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => setShowAiPanel(!showAiPanel)}
            >
               <div className="flex items-center gap-2 text-blue-900 font-semibold">
                  <div className="bg-white p-1.5 rounded-lg shadow-sm">
                    <Sparkles size={18} className="text-blue-600" />
                  </div>
                  AI Copilot
               </div>
               {showAiPanel ? <ChevronUp size={18} className="text-blue-400" /> : <ChevronDown size={18} className="text-blue-400" />}
            </div>
            
            {showAiPanel && (
              <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                <div className="flex gap-2 mb-4 bg-white/60 p-1 rounded-lg inline-flex">
                  {['topic', 'url'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => { setInputMode(mode as 'topic' | 'url'); setInputValue(''); }}
                      className={`py-1.5 px-4 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                          inputMode === mode
                            ? 'bg-white text-blue-700 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                        {mode === 'topic' ? 'Generate from Topic' : 'Import from URL'}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={inputMode === 'topic' ? "What's happening? e.g., 'New breakthrough in fusion energy...'" : "https://example.com/article-to-import"}
                    className="flex-1 px-4 py-3 bg-white border-0 shadow-sm rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition-all text-sm pr-32"
                  />
                  <div className="absolute right-1 top-1 bottom-1">
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !inputValue.trim()}
                        className="h-full px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium shadow-sm flex items-center gap-2 whitespace-nowrap transition-all"
                    >
                        {isGenerating ? <Loader2 className="animate-spin" size={16} /> : (inputMode === 'url' ? <LinkIcon size={16} /> : <Sparkles size={16} />)}
                        {isGenerating ? 'Working...' : (inputMode === 'url' ? 'Fetch' : 'Generate')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 min-h-[700px] flex flex-col">
             <div className="mb-6">
                <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Add Title Here..."
                className="w-full text-4xl sm:text-5xl font-black font-serif placeholder:text-slate-200 border-none focus:ring-0 p-0 text-slate-900 leading-tight bg-transparent"
                />
             </div>

             <div className="mb-6">
                <div className="flex items-center gap-2 mb-2 text-blue-600">
                  <Flag size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">Subject Banner</span>
                </div>
                <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Impactful banner text (e.g. POLICE REFORM INITIATIVE)"
                className="w-full text-xl font-black font-sans uppercase tracking-widest placeholder:text-slate-200 border-none focus:ring-0 p-0 text-slate-700 bg-transparent italic"
                />
             </div>

             <div className="relative mb-8 pl-4 border-l-4 border-slate-100">
                <textarea
                required
                rows={2}
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Write a compelling summary..."
                className="w-full text-lg text-slate-600 font-medium placeholder:text-slate-300 border-none focus:ring-0 p-0 resize-none bg-transparent italic"
                />
             </div>

             <div className="flex-1 relative">
                <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Start writing your story..."
                className="w-full h-full min-h-[400px] text-lg leading-relaxed text-slate-800 font-serif placeholder:text-slate-200 border-none focus:ring-0 p-0 resize-none bg-transparent"
                />
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-2">
                <ImageIcon size={14} /> Featured Media
             </div>
             <div className="p-4 space-y-4">
                 <div className="w-full aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative group">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-col gap-2">
                        <button 
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-white rounded-full text-xs font-bold hover:bg-slate-100 flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                        >
                          <Upload size={14} /> {isUploading ? 'Processing...' : 'Upload Image'}
                        </button>
                        <button 
                        type="button"
                        onClick={() => setFormData({...formData, imageUrl: `https://picsum.photos/seed/${Math.floor(Math.random() * 1000000)}/1600/900`})}
                        className="px-4 py-2 bg-blue-600 text-white rounded-full text-xs font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                        >
                        <Sparkles size={14} /> Randomize AI Image
                        </button>
                    </div>
                 </div>

                 <div className="space-y-2">
                   <label className="block text-xs font-semibold text-slate-500">Image URL / Source</label>
                   <input
                      type="text"
                      value={formData.imageUrl.startsWith('data:') ? 'Local Image Stored' : formData.imageUrl}
                      readOnly={formData.imageUrl.startsWith('data:')}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      className={`w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs bg-slate-50 ${formData.imageUrl.startsWith('data:') ? 'text-blue-600 font-bold italic' : 'text-slate-600'}`}
                      placeholder="https://image-url.com..."
                   />
                   {formData.imageUrl.startsWith('data:') && (
                     <button 
                       onClick={() => setFormData({...prev => ({...prev, imageUrl: ''})})}
                       className="text-[10px] text-red-500 font-bold hover:underline flex items-center gap-1"
                     >
                       <X size={10} /> Remove Uploaded Image
                     </button>
                   )}
                 </div>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                />

                <hr className="border-slate-100" />
                
                <div>
                   <label className="block text-xs font-semibold text-slate-500 mb-1.5">Link a Video</label>
                   <div className="relative">
                     <Film className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                     <select
                       value={formData.linkedVideoId}
                       onChange={(e) => setFormData({...formData, linkedVideoId: e.target.value})}
                       className="w-full pl-9 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 text-sm appearance-none"
                     >
                       <option value="">No Video Linked</option>
                       {videos.map(video => (
                         <option key={video.id} value={video.id}>
                           {video.title.substring(0, 30)}...
                         </option>
                       ))}
                     </select>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-2">
                <Globe size={14} /> Visibility
             </div>
             <div className="p-4 space-y-4">
                <div>
                   <label className="block text-xs font-semibold text-slate-500 mb-1.5">Source URL</label>
                   <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        type="text"
                        value={formData.sourceUrl}
                        onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                        placeholder="Original article link..."
                        className="w-full pl-9 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-slate-50"
                      />
                   </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100 cursor-pointer" onClick={() => setFormData({...formData, isBreaking: !formData.isBreaking})}>
                     <div>
                        <div className="text-sm font-bold text-red-900">Breaking News</div>
                        <div className="text-xs text-red-700 opacity-80">Boosts visibility in feed</div>
                     </div>
                     <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isBreaking ? 'bg-red-600 border-red-600' : 'bg-white border-red-200'}`}>
                         {formData.isBreaking && <CheckCircle size={14} className="text-white" />}
                     </div>
                </div>
             </div>
          </div>

          {drafts.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 font-semibold text-amber-800 text-xs uppercase tracking-wider flex items-center gap-2">
                <History size={14} /> Saved Drafts
              </div>
              <div className="max-h-48 overflow-y-auto">
                 {drafts.map(draft => (
                    <div 
                      key={draft.id}
                      onClick={() => loadDraft(draft)}
                      className={`p-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors flex justify-between items-center group ${currentDraftId === draft.id ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="flex-1 min-w-0 mr-2">
                        <h4 className="font-medium text-slate-800 truncate text-sm">
                          {draft.formData.title || 'Untitled Draft'}
                        </h4>
                        <span className="text-xs text-slate-400">
                           {new Date(draft.savedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <button 
                        onClick={(e) => deleteDraft(e, draft.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                 ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEditor;
