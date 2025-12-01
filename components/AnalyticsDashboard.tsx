
import React from 'react';
import { Article, Category } from '../types';
import { BarChart3, TrendingUp, Users, Heart, MessageSquare, Globe, Smartphone, Monitor, Tablet, Clock, MousePointerClick, Activity } from 'lucide-react';

interface AnalyticsDashboardProps {
  articles: Article[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ articles }) => {
  const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);
  const totalLikes = articles.reduce((sum, article) => sum + (article.likes || 0), 0);
  const totalComments = articles.reduce((sum, article) => sum + (article.comments || 0), 0);
  const avgViews = Math.round(totalViews / (articles.length || 1));

  // --- Visitor Estimates (Simulated based on Article View Data) ---
  // Assuming avg 2.5 page views per visitor
  const estimatedVisitors = Math.round(totalViews / 2.5); 
  const bounceRate = 42; // Hardcoded mock
  const avgSessionDuration = "4m 12s"; // Hardcoded mock
  
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

  // Mock Data for Traffic Trend (Last 7 Days)
  const trafficTrend = [65, 59, 80, 81, 56, 95, 100]; // Percentages relative to max
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Content Performance Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <BarChart3 className="text-blue-600" />
          Content Performance
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

          <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-amber-600 uppercase tracking-wider">Average Views</span>
              <TrendingUp size={20} className="text-amber-500" />
            </div>
            <div className="text-3xl font-black text-slate-900">{avgViews.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">Per Article</div>
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

      {/* Visitor Analytics Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Activity className="text-indigo-600" />
          Visitor Insights
        </h2>

        {/* Visitor Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
           <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center text-center">
              <div className="mb-2 p-2 bg-white rounded-full text-indigo-600 shadow-sm">
                 <Users size={20} />
              </div>
              <div className="text-2xl font-black text-slate-900">{estimatedVisitors.toLocaleString()}</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">Est. Unique Visitors</div>
              <span className="text-[10px] text-green-600 bg-green-100 px-2 py-0.5 rounded-full mt-2 font-bold">+12% vs last week</span>
           </div>

           <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100 flex flex-col items-center justify-center text-center">
              <div className="mb-2 p-2 bg-white rounded-full text-emerald-600 shadow-sm">
                 <Clock size={20} />
              </div>
              <div className="text-2xl font-black text-slate-900">{avgSessionDuration}</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">Avg. Session Time</div>
              <span className="text-[10px] text-green-600 bg-green-100 px-2 py-0.5 rounded-full mt-2 font-bold">+5% vs last week</span>
           </div>

           <div className="p-4 rounded-lg bg-orange-50 border border-orange-100 flex flex-col items-center justify-center text-center">
              <div className="mb-2 p-2 bg-white rounded-full text-orange-600 shadow-sm">
                 <MousePointerClick size={20} />
              </div>
              <div className="text-2xl font-black text-slate-900">{bounceRate}%</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">Bounce Rate</div>
              <span className="text-[10px] text-red-600 bg-red-100 px-2 py-0.5 rounded-full mt-2 font-bold">-2% vs last week</span>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Weekly Traffic Trend */}
           <div className="lg:col-span-2">
             <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6">Traffic Trend (Last 7 Days)</h3>
             <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 px-2">
                {trafficTrend.map((height, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                     <div className="relative w-full bg-slate-100 rounded-t-md overflow-hidden h-full flex items-end">
                        <div 
                           className="w-full bg-indigo-500 hover:bg-indigo-600 transition-all duration-500 rounded-t-md relative group"
                           style={{ height: `${height}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {Math.round((estimatedVisitors * height) / 100)}
                          </div>
                        </div>
                     </div>
                     <span className="text-xs font-medium text-slate-400">{days[i]}</span>
                  </div>
                ))}
             </div>
           </div>

           {/* Device Breakdown */}
           <div>
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6">Device Breakdown</h3>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between items-center mb-2">
                       <div className="flex items-center gap-2 text-slate-700">
                          <Smartphone size={18} />
                          <span className="text-sm font-medium">Mobile</span>
                       </div>
                       <span className="text-sm font-bold text-slate-900">65%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                 </div>

                 <div>
                    <div className="flex justify-between items-center mb-2">
                       <div className="flex items-center gap-2 text-slate-700">
                          <Monitor size={18} />
                          <span className="text-sm font-medium">Desktop</span>
                       </div>
                       <span className="text-sm font-bold text-slate-900">30%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                 </div>

                 <div>
                    <div className="flex justify-between items-center mb-2">
                       <div className="flex items-center gap-2 text-slate-700">
                          <Tablet size={18} />
                          <span className="text-sm font-medium">Tablet</span>
                       </div>
                       <span className="text-sm font-bold text-slate-900">5%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-purple-500 rounded-full" style={{ width: '5%' }}></div>
                    </div>
                 </div>
              </div>

              {/* Geo Location Mini Table */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                 <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Globe size={16} /> Top Locations
                 </h3>
                 <ul className="space-y-3">
                    <li className="flex justify-between text-sm">
                       <span className="text-slate-600">🇺🇸 United States</span>
                       <span className="font-semibold text-slate-900">42%</span>
                    </li>
                    <li className="flex justify-between text-sm">
                       <span className="text-slate-600">🇬🇧 United Kingdom</span>
                       <span className="font-semibold text-slate-900">15%</span>
                    </li>
                    <li className="flex justify-between text-sm">
                       <span className="text-slate-600">🇨🇦 Canada</span>
                       <span className="font-semibold text-slate-900">12%</span>
                    </li>
                    <li className="flex justify-between text-sm">
                       <span className="text-slate-600">🇩🇪 Germany</span>
                       <span className="font-semibold text-slate-900">8%</span>
                    </li>
                 </ul>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
