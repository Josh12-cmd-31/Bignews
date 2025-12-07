
import React, { useState, useRef } from 'react';
import { Video } from '../types';
import { Youtube, Upload, Trash2, Plus, Film, ExternalLink, PlayCircle, FileVideo, CheckCircle2, X } from 'lucide-react';

interface VideoManagerProps {
  videos: Video[];
  onUpdateVideos: (videos: Video[]) => void;
}

const VideoManager: React.FC<VideoManagerProps> = ({ videos, onUpdateVideos }) => {
  const [activeTab, setActiveTab] = useState<'youtube' | 'upload'>('youtube');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  
  // Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Basic validation
      if (!file.type.startsWith('video/')) {
        alert('Please select a valid video file.');
        return;
      }
      setUploadFile(file);
      // Auto-set title from filename if empty
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'youtube') {
      if (!title || !url) return;
      const videoId = extractYoutubeId(url);
      if (!videoId) {
        alert('Invalid YouTube URL');
        return;
      }
      publishVideo(videoId);
    } else {
      // Handle File Upload
      if (!title || !uploadFile) return;
      
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      setTimeout(() => {
        clearInterval(interval);
        // Create a local blob URL for the file
        // Note: In a real app, this is where you'd get the URL from your S3 bucket/backend
        const blobUrl = URL.createObjectURL(uploadFile);
        publishVideo(blobUrl);
        setIsUploading(false);
        setUploadProgress(0);
        setUploadFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 2500);
    }
  };

  const publishVideo = (finalUrl: string) => {
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
    // alert('Video added successfully!'); 
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
              Upload File
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
                disabled={isUploading}
              />
            </div>

            {activeTab === 'youtube' ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">YouTube Video URL</label>
                <div className="relative">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full pl-10 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Youtube size={18} />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Video File</label>
                
                {!uploadFile ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <FileVideo size={32} className="text-slate-400 mb-2" />
                    <span className="text-sm text-slate-600 font-medium">Click to select video</span>
                    <span className="text-xs text-slate-400">MP4, WebM (Max 50MB)</span>
                  </div>
                ) : (
                  <div className="w-full p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <FileVideo size={24} className="text-blue-500" />
                        <div>
                           <p className="text-sm font-bold text-slate-800 line-clamp-1">{uploadFile.name}</p>
                           <p className="text-xs text-slate-500">{(uploadFile.size / (1024*1024)).toFixed(2)} MB</p>
                        </div>
                     </div>
                     {!isUploading && (
                       <button 
                         type="button" 
                         onClick={() => setUploadFile(null)}
                         className="p-1 hover:bg-slate-100 rounded-full text-slate-500"
                       >
                         <X size={18} />
                       </button>
                     )}
                  </div>
                )}
                
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="video/*"
                  className="hidden"
                />

                {isUploading && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-blue-600">Uploading...</span>
                      <span className="text-slate-500">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }} 
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Optional Thumbnail for Uploads */}
            {activeTab === 'upload' && !isUploading && (
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
              disabled={isUploading}
              className={`w-full py-2.5 rounded-lg font-medium transition-all shadow-md flex items-center justify-center gap-2 ${
                 isUploading 
                   ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                   : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg'
              }`}
            >
              {isUploading ? (
                'Processing...'
              ) : (
                <>
                  <Plus size={18} />
                  Publish Video
                </>
              )}
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
                       {video.type === 'youtube' ? 'YT' : 'File'}
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
