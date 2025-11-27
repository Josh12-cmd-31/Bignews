import React, { useState, useEffect } from 'react';
import { Article, Category } from '../types';
import { CATEGORIES } from '../constants';
import { generateArticleContent } from '../services/geminiService';
import { Sparkles, PenTool, Image as ImageIcon, Loader2, Tags, Save, FileText, Trash2, Clock, AlertTriangle } from 'lucide-react';

interface AdminEditorProps {
  onPublish: (article: Article) => void;
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
  };
}

const AdminEditor: React.FC<AdminEditorProps> = ({ onPublish }) => {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Technology' as Category,
    content: '',
    summary: '',
    author: 'Admin',
    imageUrl: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
    tags: '',
    isBreaking: false
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
      topic,
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
    alert('Draft saved successfully!');
  };

  const loadDraft = (draft: Draft) => {
    if (window.confirm("Loading this draft will overwrite your current changes. Continue?")) {
      setFormData(draft.formData);
      setTopic(draft.topic);
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
    if (!topic.trim()) return;
    setIsGenerating(true);
    try {
      const generated = await generateArticleContent(topic);
      setFormData(prev => ({
        ...prev,
        title: generated.title,
        content: generated.content,
        summary: generated.summary,
        category: (CATEGORIES.includes(generated.category as Category) ? generated.category : 'Technology') as Category,
        tags: generated.tags ? generated.tags.join(', ') : ''
      }));
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
      isAiGenerated: !!topic,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
      views: 0,
      likes: 0,
      comments: 0
    };
    onPublish(newArticle);
    
    // Optional: remove draft after publish if we were editing one
    if (currentDraftId) {
       const updatedDrafts = drafts.filter(d => d.id !== currentDraftId);
       setDrafts(updatedDrafts);
       localStorage.setItem('bigNewsDrafts', JSON.stringify(updatedDrafts));
    }

    // Reset form
    setFormData({
      title: '',
      category: 'Technology',
      content: '',
      summary: '',
      author: 'Admin',
      imageUrl: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
      tags: '',
      isBreaking: false
    });
    setTopic('');
    setCurrentDraftId(null);
    alert('Article published successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Drafts Section - Only visible if drafts exist */}
      {drafts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-amber-50 flex items-center gap-2">
            <FileText className="text-amber-600" size={18} />
            <h3 className="font-semibold text-slate-800">Saved Drafts</h3>
          </div>
          <div className="max-h-60 overflow-y-auto">
             {drafts.map(draft => (
                <div 
                  key={draft.id}
                  onClick={() => loadDraft(draft)}
                  className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors flex justify-between items-center group ${currentDraftId === draft.id ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <h4 className="font-medium text-slate-900 truncate">
                      {draft.formData.title || '(Untitled Draft)'}
                    </h4>
                    <div className="flex items-center text-xs text-slate-500 mt-1 space-x-2">
                       <span className="flex items-center">
                          <Clock size={12} className="mr-1" />
                          {new Date(draft.savedAt).toLocaleDateString()} {new Date(draft.savedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </span>
                       <span className="px-1.5 py-0.5 rounded bg-slate-100">{draft.formData.category}</span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => deleteDraft(e, draft.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                    title="Delete Draft"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
             ))}
          </div>
        </div>
      )}

      {/* Main Editor */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <PenTool className="text-blue-600" />
              Publisher Dashboard
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {currentDraftId ? 'Editing Draft' : 'Create and manage news content'}
              </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              <Sparkles size={14} />
              AI Powered
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          
          {/* AI Generator Section */}
          <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              AI Content Generator
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., New electric vehicle battery breakthrough..."
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                Generate
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Enter a topic and let Gemini draft the article for you.
            </p>
          </div>

          {/* Manual Edit Section */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  {CATEGORIES.filter(c => c !== 'For You').map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Summary</label>
              <textarea
                required
                rows={2}
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Content (HTML Supported)</label>
              <textarea
                required
                rows={8}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-serif"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                <div className="flex gap-2">
                   <div className="relative flex-1">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                          type="text"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                   </div>
                   <button 
                      type="button" 
                      onClick={() => setFormData({...formData, imageUrl: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`})}
                      className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors text-sm font-medium"
                   >
                      Randomize
                   </button>
                </div>
             </div>
             
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma separated)</label>
                <div className="relative">
                  <Tags className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Technology, Innovation, Future"
                    className="w-full pl-10 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
             </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex items-center">
              <input
                type="checkbox"
                id="isBreaking"
                checked={formData.isBreaking}
                onChange={(e) => setFormData({...formData, isBreaking: e.target.checked})}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
              />
              <label htmlFor="isBreaking" className="ml-2 block text-sm font-medium text-red-700 cursor-pointer flex items-center">
                <AlertTriangle size={16} className="mr-1.5" />
                Mark as Breaking News (Pin to top)
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={saveDraft}
                className="px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2"
              >
                <Save size={18} />
                Save Draft
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Publish Article
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminEditor;