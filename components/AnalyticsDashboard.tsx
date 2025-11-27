import React from 'react';
import { Article, Category } from '../types';
import { BarChart3, TrendingUp, Users, Heart, MessageSquare } from 'lucide-react';

interface AnalyticsDashboardProps {
  articles: Article[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ articles }) => {
  const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);
  const totalLikes = articles.reduce((sum, article) => sum + (article.likes || 0), 0);
  const totalComments = articles.reduce((sum, article) => sum + (article.comments || 0), 0);
  const avgViews = Math.round(totalViews / (articles.length || 1));

  // Sort articles by engagement (Likes + Comments)
  const topArticles = [...articles].sort((a, b) => {
    const engagementA = (a.likes || 0) + (a.comments || 0);
    const engagementB = (b.likes || 0) + (b.comments || 0);
    return engagementB - engagementA;
  }).slice(0, 5);

  // Calculate views by category
  const viewsByCategory: Record<string, number> = {};
  articles.forEach(article => {
    if (!viewsByCategory[article.category]) {
      viewsByCategory[article.category] = 0;
    }
    viewsByCategory[article.category] += article.views || 0;
  });

  const maxCategoryViews = Math.max(...Object.values(viewsByCategory), 1);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <BarChart3 className="text-blue-600" />
          Analytics Overview
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-600 uppercase tracking-wider">Total Views</span>
              <Users size={20} className="text-blue-500" />
            </div>
            <div className="text-3xl font-black text-slate-900">{totalViews.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">Across {articles.length} articles</div>
          </div>

          <div className="bg-rose-50 p-6 rounded-xl border border-rose-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-rose-600 uppercase tracking-wider">Total Likes</span>
              <Heart size={20} className="text-rose-500" />
            </div>
            <div className="text-3xl font-black text-slate-900">{totalLikes.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">User Reactions</div>
          </div>

          <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-600 uppercase tracking-wider">Total Comments</span>
              <MessageSquare size={20} className="text-purple-500" />
            </div>
            <div className="text-3xl font-black text-slate-900">{totalComments.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">Community Discussions</div>
          </div>

          <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-amber-600 uppercase tracking-wider">Avg. Readership</span>
              <TrendingUp size={20} className="text-amber-500" />
            </div>
            <div className="text-3xl font-black text-slate-900">{avgViews.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">Views per article</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Top Stories by Engagement</h3>
            <p className="text-xs text-slate-500 mb-4 -mt-2">Sorted by combined likes and comments</p>
            <div className="space-y-4">
              {topArticles.map((article, index) => (
                <div key={article.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-yellow-400 text-yellow-900' : 'bg-slate-200 text-slate-600'}`}>
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 truncate">{article.title}</h4>
                    <p className="text-xs text-slate-500">{article.category} • {new Date(article.publishedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                     <div className="flex items-center gap-1 text-rose-600" title="Likes">
                        <Heart size={12} fill="currentColor" />
                        <span className="text-xs font-bold">{article.likes?.toLocaleString()}</span>
                     </div>
                     <div className="flex items-center gap-1 text-purple-600" title="Comments">
                        <MessageSquare size={12} fill="currentColor" />
                        <span className="text-xs font-bold">{article.comments?.toLocaleString()}</span>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
             <h3 className="text-lg font-bold text-slate-800 mb-4">Category Popularity</h3>
             <p className="text-xs text-slate-500 mb-4 -mt-2">Based on total views per category</p>
             <div className="space-y-4">
               {Object.entries(viewsByCategory).sort(([,a], [,b]) => b - a).map(([category, views]) => (
                 <div key={category} className="space-y-1">
                   <div className="flex justify-between text-sm">
                     <span className="font-medium text-slate-700">{category}</span>
                     <span className="text-slate-500">{views.toLocaleString()}</span>
                   </div>
                   <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                       style={{ width: `${(views / maxCategoryViews) * 100}%` }}
                     />
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;