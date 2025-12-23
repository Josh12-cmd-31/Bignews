
import React, { useState } from 'react';
import { X, User, Save, CheckCircle2, Bookmark } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onUpdateProfile: (profile: UserProfile) => void;
  isDark: boolean;
}

const AVATAR_COLORS = [
  'bg-blue-600', 'bg-red-600', 'bg-emerald-600', 'bg-amber-600', 'bg-indigo-600', 'bg-rose-600', 'bg-purple-600', 'bg-slate-700'
];

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, userProfile, onUpdateProfile, isDark }) => {
  const [name, setName] = useState(userProfile?.name || '');
  const [color, setColor] = useState(userProfile?.avatarColor || AVATAR_COLORS[0]);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onUpdateProfile({
      name: name.trim(),
      avatarColor: color,
      joinedAt: userProfile?.joinedAt || new Date().toISOString()
    });

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative transition-all ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div className={`w-20 h-20 rounded-full ${color} flex items-center justify-center text-white text-3xl font-black shadow-xl ring-4 ring-white dark:ring-slate-800`}>
                {name.charAt(0) || <User size={32} />}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-full border-2 border-white dark:border-slate-800">
                <Bookmark size={14} fill="currentColor" />
              </div>
            </div>
            <h2 className={`text-2xl font-black font-serif ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {userProfile ? 'Update Profile' : 'Setup Profile'}
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Set up your reader profile to start saving your favorite stories.
            </p>
          </div>

          {showSuccess ? (
            <div className="py-10 text-center animate-in zoom-in duration-300">
              <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
              <p className="text-lg font-bold">Profile Saved!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Display Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  maxLength={20}
                  className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-4 focus:ring-blue-500/20 outline-none font-bold ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Avatar Color</label>
                <div className="grid grid-cols-4 gap-3">
                  {AVATAR_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-full aspect-square rounded-xl ${c} transition-all ${color === c ? 'ring-4 ring-blue-400 ring-offset-2 dark:ring-offset-slate-800' : 'hover:scale-105 opacity-80'}`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-black shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Save Profile
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
