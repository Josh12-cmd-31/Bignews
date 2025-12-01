import React from 'react';

interface LogoProps {
  className?: string;
  isDark?: boolean;
  variant?: 'full' | 'icon' | 'watermark';
}

const Logo: React.FC<LogoProps> = ({ className = "", isDark = false, variant = 'full' }) => {
  
  if (variant === 'watermark') {
    return (
      <div className={`flex items-center gap-2 select-none ${className}`}>
         {/* Simplified Icon for Watermark */}
         <div className="relative">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white drop-shadow-md">
                <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                <path d="M7 8H17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M7 12H17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M7 16H13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
         </div>
         <span className="text-xl font-black tracking-tighter font-serif text-white drop-shadow-md">
           BIG<span className="text-blue-400">NEWS</span>
         </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <div className={`relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg shadow-sm ${isDark ? 'bg-blue-600' : 'bg-slate-900'} transition-colors shrink-0`}>
         {/* Stylized Newspaper Icon */}
         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-6 sm:h-6 text-white">
            <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 7H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 11H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 15H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
         </svg>
         {/* Red Dot for "Live/Breaking" feel */}
         <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-red-600 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm">
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full animate-pulse"></div>
         </div>
      </div>
      
      {variant === 'full' && (
        <div className="flex flex-col leading-none">
          <span className={`text-lg sm:text-2xl font-black tracking-tighter font-serif ${isDark ? 'text-white' : 'text-slate-900'}`}>
            BIG<span className="text-blue-600">NEWS</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;