import React, { useState, useEffect } from 'react';
import { MonetizationConfig } from '../types';
import { DollarSign, Save, AlertCircle, CheckCircle2, Layout, Code } from 'lucide-react';

interface MonetizationPanelProps {
  config: MonetizationConfig;
  onUpdate: (config: MonetizationConfig) => void;
}

const MonetizationPanel: React.FC<MonetizationPanelProps> = ({ config, onUpdate }) => {
  const [formData, setFormData] = useState<MonetizationConfig>(config);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <DollarSign className="text-green-600" />
          Monetization Settings
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Configure third-party ad networks to generate revenue from your news feed.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Google AdSense Section */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-lg shadow-sm text-blue-500">
                <Layout size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Google AdSense</h3>
                    <p className="text-xs text-slate-500">Display responsive display ads across your news feed.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="adsenseEnabled"
                      checked={formData.adsenseEnabled}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700">Publisher ID (pub-xxxx)</label>
                  <input
                    type="text"
                    name="adsenseId"
                    value={formData.adsenseId}
                    onChange={handleChange}
                    placeholder="ca-pub-0000000000000000"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                    disabled={!formData.adsenseEnabled}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Monetag Section */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-lg shadow-sm text-indigo-500">
                <Code size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Monetag</h3>
                    <p className="text-xs text-slate-500">High-performance ad formats and scripts.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="monetagEnabled"
                      checked={formData.monetagEnabled}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700">Direct Link / Zone ID</label>
                  <input
                    type="text"
                    name="monetagId"
                    value={formData.monetagId}
                    onChange={handleChange}
                    placeholder="https://monetag.com/..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                    disabled={!formData.monetagEnabled}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-100">
             {isSaved && (
                <span className="flex items-center text-green-600 text-sm font-medium mr-4 animate-in fade-in slide-in-from-right-2">
                  <CheckCircle2 size={16} className="mr-1.5" />
                  Settings saved successfully
                </span>
             )}
             <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium transition-all shadow-md hover:shadow-lg"
             >
               <Save size={18} />
               Save Changes
             </button>
          </div>

        </form>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
        <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-blue-800">
          <span className="font-semibold">Note:</span> Ad units will be automatically injected into the reader's news feed and article view once enabled. Ensure your IDs are valid to maximize fill rates.
        </div>
      </div>
    </div>
  );
};

export default MonetizationPanel;