
import React from 'react';
import { X, ShieldCheck, Scale, FileText, CheckCircle2 } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy';
  isDark: boolean;
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type, isDark }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className={`w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col transition-all ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between shrink-0 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              {type === 'terms' ? <Scale size={24} /> : <ShieldCheck size={24} />}
            </div>
            <div>
              <h2 className={`text-xl font-black font-serif ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {type === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Last Updated: March 2024</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto p-8 prose max-w-none ${isDark ? 'prose-invert' : ''}`}>
          {type === 'terms' ? (
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-bold font-serif mb-2">1. Acceptance of Terms</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  By accessing "Big News", you agree to be bound by these Terms of Service. If you do not agree to all terms, you are prohibited from using this platform.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold font-serif mb-2">2. AI-Generated Content</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  Some content on this platform is generated or assisted by artificial intelligence (AI). While we strive for accuracy, users are encouraged to verify information independently. "Big News" is not liable for inaccuracies in AI-authored flash reports.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold font-serif mb-2">3. User Contributions</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  Users are responsible for their comments. We reserve the right to remove any content that is harmful, hateful, or violates community standards without prior notice.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold font-serif mb-2">4. Intellectual Property</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  The "Big News" logo, interface, and proprietary algorithms (including the Mova AI integration) are the exclusive property of Big News Inc.
                </p>
              </section>
            </div>
          ) : (
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-bold font-serif mb-2">1. Data Collection</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  We use <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">localStorage</code> to store your reading preferences, bookmarks, and guest profile locally on your device. This data is never sold to third parties.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold font-serif mb-2">2. Geolocation Services</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  With your explicit permission, we access your location solely to provide region-specific features, such as M-Pesa payment integration for Kenyan users. We do not track your movement history.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold font-serif mb-2">3. Advertising</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  We integrate Google AdSense and Monetag. These third-party providers may use cookies to serve ads based on your visit to this and other websites.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold font-serif mb-2">4. Your Rights</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  You can clear your data at any time by clearing your browser cache or deleting your profile in the settings menu.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-6 border-t shrink-0 flex justify-end ${isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'}`}>
          <button 
            onClick={onClose}
            className={`px-8 py-3 rounded-xl font-black text-sm transition-all shadow-lg active:scale-95 ${isDark ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'}`}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
