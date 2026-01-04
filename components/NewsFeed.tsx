
import React, { useState, useEffect } from 'react';
import { Radio, Calendar, ExternalLink, RefreshCw, ShieldAlert, AlertTriangle, Info, Zap } from 'lucide-react';
import { getSecurityNews } from '../services/geminiService';
import { NewsItem } from '../types';

const NewsFeed: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const data = await getSecurityNews();
      setNews(data);
    } catch (error) {
      console.error("Failed to fetch news", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const getSeverityStyles = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return {
          border: 'border-red-500/50',
          glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
          text: 'text-red-400',
          bg: 'bg-red-500/10',
          badge: 'bg-red-500 text-black',
          label: 'CRITICAL BREACH',
          icon: <ShieldAlert className="w-4 h-4" />
        };
      case 'HIGH':
        return {
          border: 'border-orange-500/50',
          glow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]',
          text: 'text-orange-400',
          bg: 'bg-orange-500/10',
          badge: 'bg-orange-500 text-black',
          label: 'HIGH VULNERABILITY',
          icon: <AlertTriangle className="w-4 h-4" />
        };
      default:
        return {
          border: 'border-emerald-500/50',
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
          text: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          badge: 'bg-emerald-500 text-black',
          label: 'INTEL LOG',
          icon: <Info className="w-4 h-4" />
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 relative">
      <style>
        {`
          @keyframes scanline {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(400%); }
          }
          .scan-line {
            height: 2px;
            background: linear-gradient(to right, transparent, rgba(16, 185, 129, 0.2), transparent);
            position: absolute;
            width: 100%;
            top: 0;
            left: 0;
            animation: scanline 4s linear infinite;
            pointer-events: none;
          }
          .news-card:hover {
            transform: translateY(-5px);
          }
        `}
      </style>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-4">
            <Zap className="w-3 h-3 fill-emerald-400" />
            <span>Cyber Intelligence Stream Active</span>
          </div>
          <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase">
            Intelligence <span className="text-emerald-400">Feed</span>
          </h1>
          <p className="text-gray-400 max-w-xl mt-2">
            Investigative news and real-time vulnerability statistics gathered from the REXDEVCYBER fiber network.
          </p>
        </div>
        <button 
          onClick={fetchNews}
          disabled={loading}
          className="flex items-center space-x-2 px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="uppercase text-xs tracking-widest">Update Archive</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-8 rounded-3xl h-[400px] animate-pulse">
              <div className="h-4 bg-white/5 rounded w-1/4 mb-6"></div>
              <div className="h-8 bg-white/5 rounded w-3/4 mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-white/5 rounded w-full"></div>
                <div className="h-4 bg-white/5 rounded w-5/6"></div>
                <div className="h-4 bg-white/5 rounded w-4/6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {news.slice(0, 3).map((item) => {
            const styles = getSeverityStyles(item.severity);
            return (
              <article 
                key={item.id} 
                className={`news-card glass-card p-8 rounded-[2rem] border-2 ${styles.border} ${styles.glow} transition-all duration-500 flex flex-col group relative overflow-hidden`}
              >
                <div className="scan-line" />
                
                <div className="flex items-center justify-between mb-8">
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-md ${styles.badge} text-[10px] font-black uppercase tracking-tighter`}>
                    {styles.icon}
                    <span>{styles.label}</span>
                  </div>
                  <div className="flex items-center text-[10px] text-gray-500 font-mono italic">
                    <Calendar className="w-3 h-3 mr-1" />
                    {item.date}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight mb-2">
                    {item.title}
                  </h3>
                  <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">TAG: {item.tag}</div>
                </div>

                <p className="text-gray-400 text-sm leading-relaxed mb-8 flex-grow">
                  {item.summary}
                </p>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-700">ID: {item.id.slice(0, 8)}</span>
                  <button className={`flex items-center space-x-2 text-xs font-bold ${styles.text} hover:brightness-125 transition-all`}>
                    <span>ANALYZE</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && news.length === 0 && (
        <div className="text-center py-32 glass-card rounded-3xl border-dashed border-white/10">
          <Radio className="w-12 h-12 text-gray-800 mx-auto mb-4" />
          <p className="text-gray-500 font-mono italic">Archive stream empty. Check connection and retry.</p>
        </div>
      )}
    </div>
  );
};

export default NewsFeed;
