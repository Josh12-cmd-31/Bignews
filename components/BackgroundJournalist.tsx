
import React, { useEffect, useRef, useState } from 'react';
import { Article, AutomationConfig, AutomationLog, Category } from '../types';
import { generateArticleContent, identifyTrendingTopic } from '../services/geminiService';
import { Bot, Zap, CheckCircle2, AlertCircle, X } from 'lucide-react';

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
  const isRunningRef = useRef(false);

  // Tab Locking Logic: Ensures only one open tab runs the automation
  const acquireLock = () => {
    const lockKey = 'bigNews_automation_lock';
    const now = Date.now();
    const lock = localStorage.getItem(lockKey);
    
    if (!lock || now - parseInt(lock) > 30000) { // Lock expires after 30s
      localStorage.setItem(lockKey, now.toString());
      return true;
    }
    return false;
  };

  const runTask = async () => {
    if (isRunningRef.current || !config.enabled) return;
    
    // Only attempt if we can get the lock
    if (!acquireLock()) return;

    isRunningRef.current = true;
    onUpdateConfig({ ...config, isCurrentlyRunning: true });

    try {
      const { topic, category } = await identifyTrendingTopic(config.autoCategories as string[]);
      const generated = await generateArticleContent(topic, 'automation');
      
      const fixedSeed = Date.now();
      const newArticle: Article = {
        id: `auto-${fixedSeed}`,
        title: generated.title,
        subject: generated.subject || 'BREAKING UPDATE',
        summary: generated.summary,
        content: generated.content,
        category: (generated.category as Category) || (category as Category),
        author: 'Big News AI Bot',
        imageUrl: `https://picsum.photos/seed/${fixedSeed}/1600/900`,
        publishedAt: new Date().toISOString(),
        isAiGenerated: true,
        isBreaking: Math.random() > 0.7,
        tags: generated.tags || [],
        views: 0,
        likes: 0,
        comments: 0,
        userComments: []
      };

      onNewArticle(newArticle);
      onNewLog({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        status: 'success',
        articleTitle: newArticle.title,
        message: 'Auto-published in background'
      });

      // Show toast notification
      setNotification({ title: newArticle.title, id: newArticle.id });
      setTimeout(() => setNotification(null), 8000);

      onUpdateConfig({ 
        ...config, 
        lastRunAt: new Date().toISOString(), 
        isCurrentlyRunning: false 
      });
    } catch (error) {
      onNewLog({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        status: 'error',
        message: 'Background AI error: Connection failed'
      });
      onUpdateConfig({ ...config, isCurrentlyRunning: false });
    } finally {
      isRunningRef.current = false;
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
      
      // Heartbeat for lock (if we hold it)
      const lockKey = 'bigNews_automation_lock';
      const lock = localStorage.getItem(lockKey);
      if (lock && isRunningRef.current) {
        localStorage.setItem(lockKey, Date.now().toString());
      }
    }, 15000); // Check every 15s

    return () => clearInterval(intervalId);
  }, [config.enabled, config.lastRunAt, config.intervalMinutes]);

  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200] animate-in slide-in-from-right-10 duration-500">
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-blue-500/30 flex items-start gap-4 max-w-sm">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
          <Bot size={20} className="animate-pulse" />
        </div>
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">AI Journalist Pro</span>
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
          </div>
          <h4 className="text-sm font-bold truncate leading-tight">Just Published: {notification.title}</h4>
          <p className="text-[11px] text-slate-400 mt-1">A new story has been automatically added to the feed.</p>
        </div>
        <button 
          onClick={() => setNotification(null)}
          className="absolute top-2 right-2 p-1 text-slate-500 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default BackgroundJournalist;
