
import React, { useState, useEffect } from 'react';
import { AutomationConfig, AutomationLog, Category } from '../types';
import { Bot, Play, Pause, Clock, History, AlertCircle, CheckCircle2, Cpu, Zap, Settings, RefreshCw } from 'lucide-react';

interface AutomationPanelProps {
  config: AutomationConfig;
  onUpdate: (config: AutomationConfig) => void;
  logs: AutomationLog[];
}

const AutomationPanel: React.FC<AutomationPanelProps> = ({ config, onUpdate, logs }) => {
  const [nextRunCounter, setNextRunCounter] = useState<string>('--:--');

  useEffect(() => {
    if (!config.enabled || !config.lastRunAt) {
      setNextRunCounter('--:--');
      return;
    }

    const interval = setInterval(() => {
      const lastRun = new Date(config.lastRunAt!).getTime();
      const nextRun = lastRun + (config.intervalMinutes * 60 * 1000);
      const diff = nextRun - Date.now();

      if (diff <= 0) {
        setNextRunCounter('00:00');
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setNextRunCounter(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [config.enabled, config.lastRunAt, config.intervalMinutes]);

  const toggleAutomation = () => {
    onUpdate({
      ...config,
      enabled: !config.enabled,
      // If turning on, set lastRunAt to now so it starts the cycle or check right away
      lastRunAt: !config.enabled ? new Date().toISOString() : config.lastRunAt
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Master Control Card */}
      <div className={`relative overflow-hidden p-8 rounded-2xl shadow-xl border transition-all duration-500 ${config.enabled ? 'bg-slate-900 border-blue-500/50' : 'bg-white border-slate-200'}`}>
        {/* Background Animation */}
        {config.enabled && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
             <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-500 rounded-full blur-[120px] animate-pulse"></div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 border-b border-l border-blue-500/30 rounded-bl-3xl"></div>
          </div>
        )}

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
           <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl shadow-lg transition-all duration-500 ${config.enabled ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                 <Bot size={40} />
              </div>
              <div>
                 <h2 className={`text-3xl font-black font-serif ${config.enabled ? 'text-white' : 'text-slate-900'}`}>
                   AI Journalist Pro
                 </h2>
                 <p className={`text-sm mt-1 font-medium ${config.enabled ? 'text-blue-200' : 'text-slate-500'}`}>
                   {config.enabled ? 'System active. Researching global trends.' : 'Automated publishing is currently paused.'}
                 </p>
              </div>
           </div>

           <button 
             onClick={toggleAutomation}
             className={`group relative flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 active:scale-95 ${
               config.enabled 
                 ? 'bg-red-500/10 border-2 border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white' 
                 : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20'
             }`}
           >
              {config.enabled ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
              {config.enabled ? 'Stop Automation' : 'Start Automation'}
           </button>
        </div>

        {config.enabled && (
           <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
                 <div className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Clock size={12} /> Next Run
                 </div>
                 <div className="text-3xl font-mono font-bold text-white tabular-nums">
                    {nextRunCounter}
                 </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
                 <div className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                    <RefreshCw size={12} className={config.isCurrentlyRunning ? 'animate-spin' : ''} /> Status
                 </div>
                 <div className="text-xl font-bold text-white">
                    {config.isCurrentlyRunning ? 'Publishing...' : 'Standby'}
                 </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
                 <div className="text-purple-400 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Zap size={12} /> Cycle
                 </div>
                 <div className="text-xl font-bold text-white">
                    Every {config.intervalMinutes}m
                 </div>
              </div>
           </div>
        )}
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Configuration Side */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                 <Settings size={18} className="text-slate-400" />
                 Config
               </h3>
               <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cycle Interval</label>
                    <select 
                      value={config.intervalMinutes}
                      onChange={(e) => onUpdate({...config, intervalMinutes: Number(e.target.value)})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={15}>15 Minutes</option>
                      <option value={30}>30 Minutes</option>
                      <option value={60}>1 Hour</option>
                      <option value={120}>2 Hours</option>
                    </select>
                  </div>
               </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
               <AlertCircle className="text-blue-500 shrink-0" size={20} />
               <p className="text-xs text-blue-800 leading-relaxed">
                  <strong>How it works:</strong> When active, the bot uses Gemini 3.0 to research trending topics across your news categories and publishes a full journalistic report automatically.
               </p>
            </div>
         </div>

         {/* Logs Side */}
         <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full">
               <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                 <History size={18} className="text-slate-400" />
                 Recent Activity
               </h3>
               
               <div className="space-y-3">
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <div key={log.id} className="group p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors flex items-start gap-4">
                         <div className={`mt-1 p-1.5 rounded-full ${log.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                            {log.status === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                               <p className={`text-sm font-bold truncate ${log.status === 'success' ? 'text-slate-900' : 'text-red-700'}`}>
                                 {log.articleTitle || log.message}
                               </p>
                               <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap ml-2">
                                 {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </span>
                            </div>
                            {log.articleTitle && (
                               <p className="text-xs text-slate-500 font-medium italic">Auto-published successfully</p>
                            )}
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                       <Cpu size={48} className="opacity-10 mb-4" />
                       <p className="text-sm font-medium">No automation logs available yet.</p>
                    </div>
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AutomationPanel;
