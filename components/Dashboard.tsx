import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, ShieldAlert, Wifi, Server } from 'lucide-react';

const initialChartData = [
  { name: '00:00', traffic: 400, threats: 24, latency: 12 },
  { name: '04:00', traffic: 300, threats: 13, latency: 15 },
  { name: '08:00', traffic: 900, threats: 98, latency: 22 },
  { name: '12:00', traffic: 1200, threats: 45, latency: 18 },
  { name: '16:00', traffic: 1500, threats: 67, latency: 25 },
  { name: '20:00', traffic: 1100, threats: 120, latency: 20 },
  { name: '23:59', traffic: 600, threats: 32, latency: 14 },
];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState([
    { label: 'Network Load', value: 78, unit: '%', icon: <Wifi className="text-blue-400" />, trend: '+1.2%' },
    { label: 'Security Threats', value: 234, unit: '', icon: <ShieldAlert className="text-red-400" />, trend: '-0.5%' },
    { label: 'Data Processing', value: 1.2, unit: ' GB/s', icon: <Activity className="text-emerald-400" />, trend: '+0.04' },
    { label: 'Active Nodes', value: 8231, unit: '', icon: <Server className="text-purple-400" />, trend: '+12' },
  ]);

  const [chartData, setChartData] = useState(initialChartData);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => prev.map(stat => {
        let fluctuation = 0;
        if (stat.label === 'Network Load') fluctuation = (Math.random() - 0.5) * 2;
        if (stat.label === 'Security Threats') fluctuation = Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        if (stat.label === 'Data Processing') fluctuation = (Math.random() - 0.5) * 0.1;
        if (stat.label === 'Active Nodes') fluctuation = Math.random() > 0.9 ? (Math.random() > 0.5 ? 2 : -2) : 0;
        
        const newValue = stat.label === 'Data Processing' 
          ? Number((stat.value + fluctuation).toFixed(2))
          : Math.floor(stat.value + fluctuation);

        return { ...stat, value: newValue };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white uppercase tracking-tighter italic">Network <span className="text-emerald-400">Intelligence</span></h2>
          <p className="text-gray-400">Real-time statistics from our fiber archive blocks.</p>
        </div>
        <div className="flex space-x-2">
          <span className="flex items-center px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 text-xs font-mono">
            <Activity className="w-3 h-3 mr-2 animate-pulse" />
            LIVE FEED
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl hover:border-emerald-500/50 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-all">
                {stat.icon}
              </div>
              <span className={`text-[10px] font-bold font-mono ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                {stat.trend}
              </span>
            </div>
            <div className="text-2xl font-black text-white mb-1 tabular-nums">
              {stat.value}{stat.unit}
            </div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card p-6 rounded-2xl border-emerald-500/10 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Activity className="w-32 h-32" />
        </div>
        <h3 className="text-lg font-bold text-white mb-6 flex items-center uppercase tracking-widest text-xs italic">
          <Activity className="w-4 h-4 mr-2 text-emerald-400" />
          Traffic Statistics (24h Aggregate)
        </h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#4b5563" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontStyle: 'italic', fontWeight: 'bold' }}
              />
              <YAxis 
                stroke="#4b5563" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontWeight: 'bold' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f0f0f', borderColor: '#10b981', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                labelStyle={{ color: '#9ca3af', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase' }}
              />
              <Area 
                type="monotone" 
                dataKey="traffic" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTraffic)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;