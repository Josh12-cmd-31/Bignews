
import React, { useState, useEffect, useRef } from 'react';
import { Video } from '../types';
import { Play, X, Heart, Share2, MessageCircle, Volume2, VolumeX, ArrowLeft, Music2, Plus, Upload, Loader2, Clock, CheckCircle2 } from 'lucide-react';

interface VideoFeedProps {
  videos: Video[];
  onUpload?: (video: Video) => void;
}

const VideoFeed: React.FC<VideoFeedProps> = ({ videos, onUpload }) => {
  const [startIndex, setStartIndex] = useState<number | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const openFeed = (index: number) => {
    setStartIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeFeed = () => {
    setStartIndex(null);
    document.body.style.overflow = 'unset';
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* Upload Button (Visible in Grid) */}
      {onUpload && (
        <div className="flex justify-between items-center mb-4">
           <span className="text-sm text-slate-500 hidden sm:inline">Share your moments</span>
           <button 
             onClick={() => setIsUploadModalOpen(true)}
             className="ml-auto flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md hover:bg-slate-800 transition-transform active:scale-95"
           >
             <Plus size={18} />
             Upload Short
           </button>
        </div>
      )}

      {/* Grid View */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {videos.map((video, index) => (
          <div 
            key={video.id}
            onClick={() => openFeed(index)}
            className="group relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-slate-900"
          >
            {video.type === 'youtube' ? (
              <img 
                src={`https://img.youtube.com/vi/${video.url}/hqdefault.jpg`} 
                alt={video.title}
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                loading="lazy"
              />
            ) : (
              <video 
                src={video.url} 
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                muted 
                loop 
                onMouseOver={e => (e.target as HTMLVideoElement).play()}
                onMouseOut={e => (e.target as HTMLVideoElement).pause()}
              />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 flex flex-col justify-end p-3 sm:p-4">
              <h3 className="text-white font-bold text-xs sm:text-sm line-clamp-2 mb-1 leading-snug drop-shadow-md">
                {video.title}
              </h3>
              <div className="flex items-center gap-3 text-xs text-gray-300 font-medium">
                <span className="flex items-center gap-1"><Play size={10} fill="currentColor" /> {video.views.toLocaleString()}</span>
              </div>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-75 group-hover:scale-100">
               <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                 <Play size={24} className="text-white ml-1" fill="white" />
               </div>
            </div>
          </div>
        ))}
      </div>

      {videos.length === 0 && (
         <div className="text-center py-20">
           <p className="text-slate-500 text-lg">No short videos available at the moment.</p>
         </div>
      )}

      {/* Full Screen Scroll Feed */}
      {startIndex !== null && (
        <ScrollableFeed 
          videos={videos} 
          initialIndex={startIndex} 
          onClose={closeFeed}
          onUpload={() => {
            closeFeed();
            setIsUploadModalOpen(true);
          }} 
        />
      )}

      {/* Upload Modal */}
      {onUpload && (
        <UserUploadModal 
          isOpen={isUploadModalOpen} 
          onClose={() => setIsUploadModalOpen(false)} 
          onUpload={onUpload} 
        />
      )}
    </div>
  );
};

// ----------------------------------------------------------------------------
// Internal Components for the Feed Logic
// ----------------------------------------------------------------------------

const UserUploadModal: React.FC<{ isOpen: boolean, onClose: () => void, onUpload: (video: Video) => void }> = ({ isOpen, onClose, onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [duration, setDuration] = useState<number | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setTitle('');
      setError('');
      setDuration(null);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError('');
    
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('video/')) {
      setError('Please upload a valid video file.');
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit logic
      setError('File size too large. Max 50MB.');
      return;
    }

    // Check Duration
    const videoUrl = URL.createObjectURL(selectedFile);
    const videoElement = document.createElement('video');
    videoElement.preload = 'metadata';
    
    videoElement.onloadedmetadata = () => {
      URL.revokeObjectURL(videoUrl);
      const videoDuration = videoElement.duration;
      setDuration(videoDuration);

      if (videoDuration > 180) { // 3 minutes max
        setError(`Video is too long (${Math.round(videoDuration)}s). Maximum duration is 3 minutes.`);
        setFile(null);
      } else {
        setFile(selectedFile);
        if(!title) setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    };
    
    videoElement.onerror = () => {
      setError('Failed to load video metadata.');
    };

    videoElement.src = videoUrl;
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setIsUploading(true);

    // Simulate upload delay
    setTimeout(() => {
       const blobUrl = URL.createObjectURL(file);
       const newVideo: Video = {
          id: `u-${Date.now()}`,
          title,
          type: 'upload',
          url: blobUrl,
          thumbnail: '', // Could generate from video, but skipping for simplicity
          views: 0,
          likes: 0
       };
       
       onUpload(newVideo);
       setIsUploading(false);
       onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10">
            <X size={24} />
          </button>
          
          <div className="p-6">
             <div className="text-center mb-6">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-900">
                   <Upload size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Upload Short</h2>
                <p className="text-sm text-slate-500">Share your story with the world</p>
             </div>

             <form onSubmit={handleUpload} className="space-y-4">
                {error && (
                   <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                     <X size={16} /> {error}
                   </div>
                )}

                <div className="space-y-2">
                   <label className="block text-sm font-medium text-slate-700">Video File</label>
                   {!file ? (
                      <label className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                         <div className="mb-2 text-slate-400"><VideoIcon /></div>
                         <span className="text-sm font-semibold text-blue-600">Select Video</span>
                         <span className="text-xs text-slate-400 mt-1">15s, 30s, or 3m max</span>
                         <input type="file" className="hidden" accept="video/*" onChange={handleFileChange} />
                      </label>
                   ) : (
                      <div className="border border-slate-200 rounded-xl p-3 flex items-center gap-3 bg-slate-50">
                         <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 size={20} className="text-green-600" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                            <p className="text-xs text-slate-500">{duration ? Math.round(duration) + 's' : 'Ready'}</p>
                         </div>
                         <button type="button" onClick={() => setFile(null)} className="p-1 text-slate-400 hover:text-red-500">
                            <X size={18} />
                         </button>
                      </div>
                   )}
                </div>

                <div className="space-y-2">
                   <label className="block text-sm font-medium text-slate-700">Caption / Title</label>
                   <input 
                     type="text" 
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                     placeholder="What's happening in this video?"
                     className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                     required
                   />
                </div>
                
                <div className="flex gap-2 text-xs text-slate-500 justify-center pt-2">
                   <span className="flex items-center gap-1"><Clock size={12} /> 15s</span>
                   <span>•</span>
                   <span className="flex items-center gap-1"><Clock size={12} /> 30s</span>
                   <span>•</span>
                   <span className="flex items-center gap-1"><Clock size={12} /> 3m Max</span>
                </div>

                <button 
                  type="submit" 
                  disabled={!file || !title || isUploading}
                  className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold shadow-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                   {isUploading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
                   {isUploading ? 'Uploading...' : 'Post Video'}
                </button>
             </form>
          </div>
       </div>
    </div>
  );
};

const ScrollableFeed: React.FC<{ videos: Video[], initialIndex: number, onClose: () => void, onUpload?: () => void }> = ({ videos, initialIndex, onClose, onUpload }) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to initial video on mount
  useEffect(() => {
    if (containerRef.current) {
      const videoElement = containerRef.current.children[initialIndex] as HTMLElement;
      if (videoElement) {
        videoElement.scrollIntoView({ behavior: 'auto' });
      }
    }
  }, [initialIndex]);

  // Set up Intersection Observer to track active video
  useEffect(() => {
    const options = {
      root: containerRef.current,
      threshold: 0.7, // High threshold for "snap" feeling
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.getAttribute('data-index'));
          if (!isNaN(index)) {
            setActiveIndex(index);
          }
        }
      });
    }, options);

    const container = containerRef.current;
    if (container) {
      Array.from(container.children).forEach((child) => observer.observe(child as Element));
    }

    return () => {
      if (container) {
        Array.from(container.children).forEach((child) => observer.unobserve(child as Element));
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      {/* Header / Controls */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
        <button 
          onClick={onClose}
          className="pointer-events-auto p-2 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-white font-bold text-lg drop-shadow-md">
           Shorts
        </div>
        <div className="w-10">
           {/* Placeholder or Action */}
        </div>
      </div>

      {/* Floating Upload Button for Feed */}
      {onUpload && (
         <button 
            onClick={onUpload}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 p-4 bg-white text-slate-900 rounded-full shadow-lg shadow-black/50 hover:scale-110 transition-transform active:scale-95"
            aria-label="Upload"
         >
            <Plus size={24} />
         </button>
      )}

      {/* Scroll Snap Container */}
      <div 
        ref={containerRef}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black"
        style={{ scrollBehavior: 'smooth' }}
      >
        {videos.map((video, index) => (
          <div 
            key={video.id} 
            data-index={index}
            className="w-full h-full snap-start snap-always relative flex items-center justify-center bg-black overflow-hidden"
          >
            <VideoFeedItem 
              video={video} 
              isActive={index === activeIndex} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const VideoFeedItem: React.FC<{ video: Video, isActive: boolean }> = ({ video, isActive }) => {
  const [isMuted, setIsMuted] = useState(false); // Default unmuted
  const [isLiked, setIsLiked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      const videoElement = videoRef.current;
      videoElement.currentTime = 0;
      
      const attemptPlay = async () => {
        try {
          await videoElement.play();
        } catch (error) {
          console.log("Autoplay blocked, attempting muted autoplay", error);
          setIsMuted(true);
          videoElement.muted = true;
          try {
             await videoElement.play();
          } catch(e) {
             console.error("Playback failed completely", e);
          }
        }
      };
      
      attemptPlay();

    } else {
      videoRef.current.pause();
    }
  }, [isActive]);

  const toggleLike = (e: React.MouseEvent) => {
     e.stopPropagation();
     setIsLiked(!isLiked);
  };

  return (
    <div className="relative w-full h-full max-w-md mx-auto md:border-x border-slate-800 bg-black">
      {/* Video Player */}
      <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
        {video.type === 'youtube' ? (
          <div className="w-full h-full pointer-events-none select-none">
            {isActive ? (
               <iframe
               src={`https://www.youtube.com/embed/${video.url}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${video.url}&modestbranding=1&rel=0&enablejsapi=1`}
               className="w-full h-full object-cover scale-[1.35]" 
               title={video.title}
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
               allowFullScreen
             />
            ) : (
              <img 
                src={`https://img.youtube.com/vi/${video.url}/hqdefault.jpg`} 
                className="w-full h-full object-cover opacity-60"
                alt="thumbnail"
              />
            )}
          </div>
        ) : (
          <video
            ref={videoRef}
            src={video.url}
            className="w-full h-full object-contain bg-black"
            loop
            muted={isMuted}
            playsInline
            onClick={() => setIsMuted(!isMuted)}
          />
        )}
      </div>

      {/* Unmute Overlay if muted auto-play triggered */}
      {isMuted && isActive && (
        <div 
          className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs font-bold cursor-pointer z-30 flex items-center gap-2 pointer-events-auto"
          onClick={() => setIsMuted(false)}
        >
          <VolumeX size={14} /> Tap to Unmute
        </div>
      )}

      {/* Overlay UI */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80 pointer-events-none">
         <div className="absolute bottom-0 left-0 right-0 p-4 pb-12 md:pb-8 flex items-end justify-between">
            
            {/* Left Side: Info */}
            <div className="flex-1 mr-12 pointer-events-auto space-y-2">
               <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-800">
                    BN
                  </div>
                  <span className="text-white font-semibold text-sm shadow-sm">BigNews Official</span>
                  <button className="text-xs border border-white/50 text-white px-2 py-0.5 rounded-full hover:bg-white/20 transition-colors">
                     Follow
                  </button>
               </div>
               
               <h3 className="text-white text-sm sm:text-base font-medium leading-snug drop-shadow-md line-clamp-3">
                 {video.title}
               </h3>
               
               <div className="flex items-center gap-2 text-white/80 text-xs">
                 <Music2 size={12} className="animate-spin-slow" />
                 <span className="truncate max-w-[150px]">Original Sound - Big News</span>
               </div>
            </div>

            {/* Right Side: Actions */}
            <div className="flex flex-col items-center gap-6 pointer-events-auto">
               <button 
                 onClick={toggleLike}
                 className="flex flex-col items-center gap-1 group"
               >
                 <div className={`p-3 rounded-full bg-white/10 backdrop-blur-sm transition-all group-active:scale-90 ${isLiked ? 'text-red-500 bg-white/20' : 'text-white'}`}>
                   <Heart size={28} className={isLiked ? 'fill-current' : ''} />
                 </div>
                 <span className="text-white text-xs font-medium shadow-sm">{video.likes + (isLiked ? 1 : 0)}</span>
               </button>

               <button className="flex flex-col items-center gap-1 group">
                 <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm text-white transition-all group-active:scale-90 group-hover:bg-white/20">
                   <MessageCircle size={28} />
                 </div>
                 <span className="text-white text-xs font-medium shadow-sm">Comment</span>
               </button>

               <button className="flex flex-col items-center gap-1 group">
                 <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm text-white transition-all group-active:scale-90 group-hover:bg-white/20">
                   <Share2 size={28} />
                 </div>
                 <span className="text-white text-xs font-medium shadow-sm">Share</span>
               </button>
               
               {video.type !== 'youtube' && (
                 <button 
                   onClick={() => setIsMuted(!isMuted)}
                   className="mt-2 p-2 rounded-full bg-black/40 text-white/80 hover:bg-black/60 transition-colors"
                 >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                 </button>
               )}
            </div>
         </div>
      </div>

    </div>
  );
};

const VideoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 10l5-5v14l-5-5" />
    <path d="M14 11H9" />
    <path d="M11.5 8.5v5" />
    <rect x="2" y="6" width="13" height="12" rx="2" />
  </svg>
);

export default VideoFeed;
