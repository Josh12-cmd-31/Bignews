import React from 'react';
import { X, Moon, Sun, Type } from 'lucide-react';
import { UserPreferences, FontSize, Theme } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, preferences, onUpdatePreferences }) => {
  if (!isOpen) return null;

  const handleThemeChange = (theme: Theme) => {
    onUpdatePreferences({ ...preferences, theme });
  };

  const handleFontSizeChange = (fontSize: FontSize) => {
    onUpdatePreferences({ ...preferences, fontSize });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative ${preferences.theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`p-4 flex justify-between items-center border-b ${preferences.theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
          <h2 className="text-xl font-bold font-serif">Reading Preferences</h2>
          <button 
            onClick={onClose}
            className={`p-1 rounded-full transition-colors ${preferences.theme === 'dark' ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Theme Selection */}
          <div className="space-y-3">
            <label className={`text-sm font-semibold uppercase tracking-wider ${preferences.theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Appearance
            </label>
            <div className={`grid grid-cols-2 gap-3 p-1 rounded-xl ${preferences.theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
              <button
                onClick={() => handleThemeChange('light')}
                className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                  preferences.theme === 'light' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Sun size={18} />
                Light
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                  preferences.theme === 'dark' 
                    ? 'bg-slate-700 text-blue-400 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Moon size={18} />
                Dark
              </button>
            </div>
          </div>

          {/* Font Size Selection */}
          <div className="space-y-3">
            <label className={`text-sm font-semibold uppercase tracking-wider ${preferences.theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Font Size
            </label>
            <div className={`flex items-center justify-between p-4 rounded-xl border ${preferences.theme === 'dark' ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
              <button
                onClick={() => handleFontSizeChange('small')}
                className={`p-2 rounded-lg transition-all flex flex-col items-center gap-1 ${
                  preferences.fontSize === 'small' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : `${preferences.theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-200'}`
                }`}
              >
                <Type size={16} />
                <span className="text-xs">Small</span>
              </button>
              
              <div className={`h-px flex-1 mx-4 ${preferences.theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'}`}></div>

              <button
                onClick={() => handleFontSizeChange('medium')}
                className={`p-2 rounded-lg transition-all flex flex-col items-center gap-1 ${
                  preferences.fontSize === 'medium' 
                     ? 'bg-blue-600 text-white shadow-md' 
                    : `${preferences.theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-200'}`
                }`}
              >
                <Type size={20} />
                <span className="text-xs">Medium</span>
              </button>

              <div className={`h-px flex-1 mx-4 ${preferences.theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'}`}></div>

              <button
                onClick={() => handleFontSizeChange('large')}
                className={`p-2 rounded-lg transition-all flex flex-col items-center gap-1 ${
                  preferences.fontSize === 'large' 
                     ? 'bg-blue-600 text-white shadow-md' 
                    : `${preferences.theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-200'}`
                }`}
              >
                <Type size={24} />
                <span className="text-xs">Large</span>
              </button>
            </div>
            <p className={`text-xs mt-2 text-center ${preferences.theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
              This will adjust the text size of articles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;