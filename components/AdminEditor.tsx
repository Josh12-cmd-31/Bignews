
import React, { useState, useEffect } from 'react';
import { Article, Category, Video } from '../types';
import { CATEGORIES } from '../constants';
import { generateArticleContent } from '../services/geminiService';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Loader2, 
  Tags, 
  Save, 
  FileText, 
  Trash2, 
  Clock, 
  AlertTriangle, 
  Film, 
  Link as LinkIcon, 
  Globe, 
  Layout, 
  Type, 
  CheckCircle,
  History,
  PenLine,
  ChevronDown,
  ChevronUp
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
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [showAiPanel, setShowAiPanel] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'Technology' as Category,
    content: '',
    summary: '',
    author: 'Admin',
    imageUrl: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
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
    
    // Visual feedback
    const btn = document.getElementById('save-draft-btn');
    if(btn) {
       const originalText = btn.innerHTML;
       btn.innerHTML = '<span class="flex items-center gap-2"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Saved</span>';
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
        content: generated.content,
        summary: generated.summary,
        category: (CATEGORIES.includes(generated.category as Category) ? generated.category : 'Technology') as Category,
        tags: generated.tags ? generated.tags.join(', ') : '',
        sourceUrl: inputMode === 'url' ? inputValue : prev.sourceUrl
      }));
      setShowAiPanel(false); // Auto collapse after success
    } catch (err) {
      alert("Failed to generate content. Please check API key or try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      category: 'Technology',
      content: '',
      summary: '',
      author: 'Admin',
      imageUrl: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
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
    <div className="max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
        {/* LEFT COLUMN: Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Copilot Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
            <div 
              className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex items-center justify-between cursor-pointer"
              onClick={() => setShowAiPanel(!showAiPanel)}
            >
               <div className="flex items-center gap-2 text-blue-800 font-semibold">
                  <Sparkles size={18} className="text-blue-600" />
                  AI Copilot
               </div>
               {showAiPanel ? <ChevronUp size={18} className="text-blue-400" /> : <ChevronDown size={18} className="text-blue-400" />}
            </div>
            
            {showAiPanel && (
              <div className="p-6 animate-in slide-in-from-top-2 duration-300">
                <div className="flex gap-2 mb-4">
                  {['topic', 'url'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => { setInputMode(mode as 'topic' | 'url'); setInputValue(''); }}
                      className={`flex-1 py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
                          inputMode === mode
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                        {mode === 'topic' ? 'Generate from Topic' : 'Import from URL'}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={inputMode === 'topic' ? "What's happening? e.g., 'New breakthrough in fusion energy...'" : "https://example.com/article-to-import"}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !inputValue.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 font-medium shadow-md flex items-center gap-2 whitespace-nowrap"
                  >
                    {isGenerating ? <Loader2 className="animate-spin" size={18} /> : (inputMode === 'url' ? <LinkIcon size={18} /> : <Sparkles size={18} />)}
                    {inputMode === 'url' ? 'Fetch' : 'Generate'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Document Editor */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 min-h-[600px]">
            <div className="space-y-6">
               {/* Title Input */}
               <div>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Article Headline"
                    className="w-full text-4xl font-black font-serif placeholder:text-slate-300 border-none focus:ring-0 p-0 text-slate-900 leading-tight"
                  />
               </div>

               {/* Summary Input */}
               <div className="relative">
                  <Type className="absolute left-0 top-3 text-slate-300" size={20} />
                  <textarea
                    required
                    rows={2}
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="Write a short, catchy summary..."
                    className="w-full pl-8 py-2 text-lg text-slate-600 font-medium placeholder:text-slate-300 border-none focus:ring-0 p-0 resize-none bg-transparent"
                  />
               </div>

               <hr className="border-slate-100" />

               {/* Main Content */}
               <div className="relative h-full">
                  <textarea
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Start writing your story here... HTML tags are supported for formatting."
                    className="w-full h-[500px] text-lg leading-relaxed text-slate-800 font-serif placeholder:text-slate-200 border-none focus:ring-0 p-0 resize-none"
                  />
               </div>
            </div>
          </div>
        </div>


        {/* RIGHT COLUMN: Sidebar Settings */}
        <div className="space-y-6">
          
          {/* Article Settings Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700 text-sm flex items-center gap-2">
                <Layout size={16} /> Organization
             </div>
             <div className="p-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                  >
                    {CATEGORIES.filter(c => c !== 'For You').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tags</label>
                  <div className="relative">
                    <Tags className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="Tech, Future, AI..."
                      className="w-full pl-9 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                </div>
             </div>
          </div>

          {/* Media Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700 text-sm flex items-center gap-2">
                <ImageIcon size={16} /> Media
             </div>
             <div className="p-4 space-y-4">
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Featured Image</label>
                   
                   {/* Image Preview */}
                   <div className="mb-3 w-full aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative group">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            type="button"
                            onClick={() => setFormData({...formData, imageUrl: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`})}
                            className="px-3 py-1 bg-white rounded-full text-xs font-bold hover:bg-slate-100"
                          >
                            New Random Image
                          </button>
                      </div>
                   </div>

                   <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs text-slate-600"
                      placeholder="https://..."
                   />
                </div>

                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Linked Video</label>
                   <div className="relative">
                     <Film className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                     <select
                       value={formData.linkedVideoId}
                       onChange={(e) => setFormData({...formData, linkedVideoId: e.target.value})}
                       className="w-full pl-9 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm appearance-none"
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

          {/* Attribution & Meta */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700 text-sm flex items-center gap-2">
                <Globe size={16} /> Attribution
             </div>
             <div className="p-4 space-y-4">
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Source URL</label>
                   <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        type="text"
                        value={formData.sourceUrl}
                        onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                        placeholder="Original article link..."
                        className="w-full pl-9 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                   </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                    <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.isBreaking ? 'bg-red-600 border-red-600' : 'bg-white border-slate-300'}`}>
                         {formData.isBreaking && <CheckCircle size={14} className="text-white" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.isBreaking}
                        onChange={(e) => setFormData({...formData, isBreaking: e.target.checked})}
                        className="hidden"
                      />
                      <span className={`text-sm font-medium ${formData.isBreaking ? 'text-red-600' : 'text-slate-600'}`}>Mark as Breaking News</span>
                    </label>
                </div>
             </div>
          </div>

          {/* Draft History */}
          {drafts.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 font-semibold text-amber-800 text-sm flex items-center gap-2">
                <History size={16} /> Saved Drafts
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
