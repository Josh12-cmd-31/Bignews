
import React, { useState, useEffect, useRef } from 'react';
import { Video } from '../types';
import { Play, X, Heart, Share2, MessageCircle, Volume2, VolumeX, ArrowLeft, MoreHorizontal, Music2 } from 'lucide-react';

interface VideoFeedProps {
  videos: Video[];
}

const VideoFeed: React.FC<VideoFeedProps> = ({ videos }) => {
  const [startIndex, setStartIndex] = useState<number | null>(null);

  const openFeed = (index: number) => {
    setStartIndex(index);
    // Prevent body scrolling when feed is open
    document.body.style.overflow = 'hidden';
  };

  const closeFeed = () => {
    setStartIndex(null);
    document.body.style.overflow = 'unset';
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
        />
      )}
    </div>
  );
};

// ----------------------------------------------------------------------------
// Internal Components for the Feed Logic
// ----------------------------------------------------------------------------

const ScrollableFeed: React.FC<{ videos: Video[], initialIndex: number, onClose: () => void }> = ({ videos, initialIndex, onClose }) => {
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
      threshold: 0.6, // Video is considered active when 60% visible
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
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Scroll Snap Container */}
      <div 
        ref={containerRef}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        {videos.map((video, index) => (
          <div 
            key={video.id} 
            data-index={index}
            className="w-full h-full snap-start relative flex items-center justify-center bg-black overflow-hidden"
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
  const [isMuted, setIsMuted] = useState(false); // Default unmuted for better UX, usually browser blocks unless interacted
  const [isLiked, setIsLiked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      // Small timeout to ensure smooth transition before playing
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Auto-play was prevented
          // We can show a "Click to Play" UI if needed, or mute and try again
          if (!isMuted) {
             // setIsMuted(true); // Retry muted?
          }
        });
      }
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0; // Reset video when scrolled away
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
             {/* Note: YouTube embeds inside a scroll container are tricky for autoplay/controls. 
                 Using a cover image + simplified iframe when active is a common workaround.
                 Here we try to autoplay if active. */}
            {isActive ? (
               <iframe
               src={`https://www.youtube.com/embed/${video.url}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${video.url}&modestbranding=1&rel=0`}
               className="w-full h-full object-cover scale-[1.35]" // Scale to fill roughly like cover
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
            className="w-full h-full object-cover"
            loop
            muted={isMuted}
            playsInline
            onClick={() => setIsMuted(!isMuted)}
          />
        )}
      </div>

      {/* Overlay UI */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none">
         <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 flex items-end justify-between">
            
            {/* Left Side: Info */}
            <div className="flex-1 mr-12 pointer-events-auto space-y-2">
               <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-800">
                    BN
                  </div>
                  <span className="text-white font-semibold text-sm shadow-sm">BigNews Official</span>
                  <button className="text-xs border border-white/50 text-white px-2 py-0.5 rounded-full hover:bg-white/20">
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

export default VideoFeed;
