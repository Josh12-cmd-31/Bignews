import React from 'react';
import { UserPreferences } from '../types';

interface AdUnitProps {
  type: 'adsense' | 'monetag';
  id: string;
  preferences: UserPreferences;
  label?: string;
}

const AdUnit: React.FC<AdUnitProps> = ({ type, id, preferences, label }) => {
  const isDark = preferences.theme === 'dark';

  if (!id) return null;

  return (
    <div className={`w-full my-8 p-4 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center overflow-hidden transition-colors ${
      isDark 
        ? 'bg-slate-800/50 border-slate-700' 
        : 'bg-slate-50 border-slate-200'
    }`}>
      <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2">
        {label || 'Advertisement'}
      </span>
      
      {type === 'adsense' && (
        <div className="w-full max-w-[728px] h-[90px] bg-white/5 flex items-center justify-center rounded">
          <div className="text-xs text-slate-400 font-mono">
             <span className="font-bold text-blue-500">Google AdSense</span>
             <br/>
             Slot: {id}
          </div>
        </div>
      )}

      {type === 'monetag' && (
        <div className="w-full max-w-[300px] h-[250px] bg-indigo-900/5 flex items-center justify-center rounded">
          <div className="text-xs text-slate-400 font-mono">
             <span className="font-bold text-indigo-500">Monetag</span>
             <br/>
             Script Active
             <br/>
             ID: {id.substring(0, 15)}...
          </div>
        </div>
      )}
    </div>
  );
};

export default AdUnit;