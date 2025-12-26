
import React, { useEffect, useRef, useState } from 'react';
import { Article, AutomationConfig, AutomationLog, Category } from '../types';
import { generateArticleContent, identifyTrendingTopic } from '../services/geminiService';
import { Bot, Zap, CheckCircle2, AlertCircle, X, ShieldCheck, Search } from 'lucide-react';

interface BackgroundJournalistProps {
  config: AutomationConfig;
  onUpdateConfig: (config: AutomationConfig) => void;
  onNewArticle: (article: Article) => void;
  onNewLog: (log: AutomationLog) => void;
  isAuthenticated: boolean;
}

const BackgroundJournalist: React.FC<BackgroundJournalistProps> = ({
  config,
  onUpdateConfig,
  onNewArticle,
  onNewLog,
  isAuthenticated
}) => {
  const [notification, setNotification] = useState<{title: string, id: string} | null>(null);
  const [status, setStatus] = useState<'idle' | 'researching' | 'writing' | 'publishing'>('idle');
  const isRunningRef = useRef(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    // Initialize cross-tab communication
    channelRef.current = new BroadcastChannel('big_news_automation_sync');
    
    channelRef.current.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'NEW_ARTICLE') {
        onNewArticle(payload);
        setNotification({ title: payload.title, id: payload.id });
        setTimeout(() => setNotification(null), 8000);
      } else if (type === 'LOG') {
        onNewLog(payload);
      } else if (type === 'FORCE_RUN' && !isRunningRef.current) {
        runTask();
      }
    };

    return () => {
      channelRef.current?.close();
    };
  }, [onNewArticle, onNewLog]);

  const acquireLock = () => {
    const lockKey = 'bigNews_automation_lock';
    const now = Date.now();
    const lock = localStorage.getItem(lockKey);
    
    // Lock is valid if it's less than 30s old. If it's older, assume the previous tab crashed.
    if (!lock || now - parseInt(lock) > 30000) {
      localStorage.setItem(lockKey, now.toString());
      return true;
    }
    return false;
  };

  const runTask = async () => {
    if (isRunningRef.current) return;
    if (!acquireLock()) return;

    isRunningRef.current = true;
    onUpdateConfig({ ...config, isCurrentlyRunning: true });

    try {
      setStatus('researching');
      const trackedCategories = config.autoCategories.length > 0 ? config.autoCategories : ['Technology', 'Football', 'Politics'];
      const trend = await identifyTrendingTopic(trackedCategories as string[]);
      
      setStatus('writing');
      const generated = await generateArticleContent(trend.topic, 'automation');
      
      setStatus('publishing');
      const fixedSeed = Date.now();
      const newArticle: Article = {
        id: `auto-${fixedSeed}`,
        title: generated.title,
        subject: generated.subject || 'AI BREAKING UPDATE',
        summary: generated.summary,
        content: generated.content,
        category: (generated.category as Category) || (trend.category as Category) || 'Technology',
        author: 'Big News AI Journalist',
        imageUrl: `https://picsum.photos/seed/${fixedSeed}/1600/900`,
        publishedAt: new Date().toISOString(),
        isAiGenerated: true,
        isBreaking: Math.random() > 0.6,
        tags: generated.tags || [],
        views: 0,
        likes: 0,
        comments: 0,
        userComments: []
      };

      const log: AutomationLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        status: 'success',
        articleTitle: newArticle.title,
        message: `Neural synthesis complete. Published report on ${newArticle.category}.`
      };

      // Update local state
      onNewArticle(newArticle);
      onNewLog(log);
      
      // Notify other tabs
      channelRef.current?.postMessage({ type: 'NEW_ARTICLE', payload: newArticle });
      channelRef.current?.postMessage({ type: 'LOG', payload: log });

      setNotification({ title: newArticle.title, id: newArticle.id });
      setTimeout(() => setNotification(null), 8000);

      onUpdateConfig({ 
        ...config, 
        lastRunAt: new Date().toISOString(), 
        isCurrentlyRunning: false 
      });
    } catch (error) {
      console.error("AI Journalist error:", error);
      const logMsg = error instanceof Error ? error.message : 'Unknown neural link failure.';
      const errorLog: AutomationLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        status: 'error',
        message: `Task interrupted: ${logMsg.substring(0, 80)}...`
      };
      onNewLog(errorLog);
      channelRef.current?.postMessage({ type: 'LOG', payload: errorLog });
      onUpdateConfig({ ...config, isCurrentlyRunning: false });
    } finally {
      isRunningRef.current = false;
      setStatus('idle');
      localStorage.removeItem('bigNews_automation_lock');
    }
  };

  useEffect(() => {
    if (!config.enabled) return;

    const intervalId = setInterval(() => {
      const now = Date.now();
      const lastRun = config.lastRunAt ? new Date(config.lastRunAt).getTime() : 0;
      const threshold = config.intervalMinutes * 60 * 1000;
      
      if (now - lastRun >= threshold) {
        runTask();
      }
      
      // Update lock heartbeat if this tab is the one running
      if (isRunningRef.current) {
        localStorage.setItem('bigNews_automation_lock', Date.now().toString());
      }
    }, 10000); 

    return () => clearInterval(intervalId);
  }, [config.enabled, config.lastRunAt, config.intervalMinutes]);

  if (!notification && status === 'idle') return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200] space-y-3 pointer-events-none">
      {/* Bot Status Indicator */}
      {(status !== 'idle' || isAuthenticated) && config.enabled && (
        <div className={`bg-slate-900/90 backdrop-blur-md border px-4 py-2 rounded-full flex items-center gap-3 shadow-2xl transition-all duration-500 pointer-events-auto ${status !== 'idle' ? 'border-blue-500 scale-105' : 'border-slate-800 opacity-60'}`}>
           <div className={`w-2 h-2 rounded-full ${status !== 'idle' ? 'bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-slate-600'}`}></div>
           <Bot size={14} className={`text-blue-400 ${status !== 'idle' ? 'animate-bounce' : ''}`} />
           <span className="text-[10px] font-black uppercase tracking-widest text-white">
             {status === 'idle' ? 'Journalist Active' : `${status}...`}
           </span>
        </div>
      )}

      {/* New Article Notification */}
      {notification && (
        <div className="bg-white text-slate-900 p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-blue-50 flex items-start gap-4 max-w-sm animate-in slide-in-from-right-10 duration-500 pointer-events-auto">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 text-white">
            <Zap size={24} fill="white" />
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Flash Report</span>
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
            </div>
            <h4 className="text-sm font-black font-serif truncate leading-tight">{notification.title}</h4>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Published by AI Core.</p>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="absolute top-4 right-4 p-1 text-slate-300 hover:text-slate-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default BackgroundJournalist;
