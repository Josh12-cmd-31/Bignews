
import React, { useState } from 'react';
import { Video } from '../types';
import { Youtube, Upload, Trash2, Plus, Film, ExternalLink, PlayCircle } from 'lucide-react';

interface VideoManagerProps {
  videos: Video[];
  onUpdateVideos: (videos: Video[]) => void;
}

const VideoManager: React.FC<VideoManagerProps> = ({ videos, onUpdateVideos }) => {
  const [activeTab, setActiveTab] = useState<'youtube' | 'upload'>('youtube');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;

    let finalUrl = url;
    if (activeTab === 'youtube') {
      const videoId = extractYoutubeId(url);
      if (!videoId) {
        alert('Invalid YouTube URL');
        return;
      }
      finalUrl = videoId;
    }

    const newVideo: Video = {
      id: Date.now().toString(),
      title,
      type: activeTab,
      url: finalUrl,
      thumbnail: thumbnailUrl || `https://picsum.photos/400/700?random=${Date.now()}`,
      views: 0,
      likes: 0
    };

    onUpdateVideos([newVideo, ...videos]);
    setTitle('');
    setUrl('');
    setThumbnailUrl('');
    alert('Video added successfully!');
  };

  const handleDeleteVideo = (id: string) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      onUpdateVideos(videos.filter(v => v.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Film className="text-red-600" />
          Short Video Manager
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Upload short videos or embed YouTube Shorts for the "Videos" feed.
        </p>

        {/* Add Video Form */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Plus size={18} /> Add New Video
          </h3>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('youtube')}
              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeTab === 'youtube' 
                  ? 'bg-red-600 text-white shadow-md' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Youtube size={18} />
              YouTube Link
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeTab === 'upload' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Upload size={18} />
              Direct URL / Upload
            </button>
          </div>

          <form onSubmit={handleAddVideo} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Video Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter engaging title..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {activeTab === 'youtube' ? 'YouTube Video URL' : 'Video File URL (MP4)'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={activeTab === 'youtube' ? "https://youtube.com/watch?v=..." : "https://example.com/video.mp4"}
                  className="w-full pl-10 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {activeTab === 'youtube' ? <Youtube size={18} /> : <ExternalLink size={18} />}
                </div>
              </div>
              {activeTab === 'upload' && (
                 <p className="text-xs text-slate-500 mt-1">For demo purposes, enter a direct link to an .mp4 file.</p>
              )}
            </div>

            {activeTab === 'upload' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Thumbnail URL (Optional)</label>
                <input
                  type="text"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Publish Video
            </button>
          </form>
        </div>

        {/* Video List */}
        <div>
          <h3 className="font-bold text-slate-800 mb-4">Published Videos ({videos.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <div key={video.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 group">
                <div className="relative aspect-[9/16] bg-black">
                  {video.type === 'youtube' ? (
                     <img 
                       src={`https://img.youtube.com/vi/${video.url}/hqdefault.jpg`} 
                       alt={video.title}
                       className="w-full h-full object-cover opacity-80"
                     />
                  ) : (
                     <video src={video.url} className="w-full h-full object-cover opacity-80" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle className="text-white opacity-80" size={48} />
                  </div>
                  <div className="absolute top-2 right-2">
                     <span className={`px-2 py-1 rounded text-xs font-bold uppercase text-white ${video.type === 'youtube' ? 'bg-red-600' : 'bg-blue-600'}`}>
                       {video.type}
                     </span>
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-slate-900 line-clamp-1 mb-2">{video.title}</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">{video.views.toLocaleString()} views</span>
                    <button
                      onClick={() => handleDeleteVideo(video.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {videos.length === 0 && (
             <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
               No videos published yet.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoManager;
