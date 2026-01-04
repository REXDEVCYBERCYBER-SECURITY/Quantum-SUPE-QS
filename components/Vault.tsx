import React, { useState, useEffect } from 'react';
import { Database, Shield, Lock, Eye, EyeOff, Plus, Trash2, Key, Search, Zap, Activity, RefreshCw, Cpu, Loader2 } from 'lucide-react';
import { analyzeVaultEntry } from '../services/geminiService';
import { VaultEntry } from '../types';

const STORAGE_KEY = 'REX_FIBER_VAULT';

const loadingSteps = [
  "Initializing Secure Tunnel...",
  "Encrypting Identifier Block...",
  "AI Analysis: Entropy Calculation...",
  "AI Analysis: Pattern Recognition...",
  "Finalizing Vault Integrity...",
];

const Vault: React.FC = () => {
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [showId, setShowId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({ label: '', identifier: '', category: 'General' });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        console.error("Vault corruption detected", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  // Handle loading step rotation
  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStepIdx((prev) => (prev + 1) % loadingSteps.length);
      }, 1500);
    } else {
      setLoadingStepIdx(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label || !form.identifier) return;

    setLoading(true);
    try {
      const audit = await analyzeVaultEntry(form.label, form.identifier);
      const newEntry: VaultEntry = {
        id: crypto.randomUUID(),
        label: form.label,
        identifier: form.identifier,
        category: form.category,
        securityScore: audit.securityScore,
        analysis: audit.analysis,
        createdAt: new Date().toISOString()
      };
      setEntries([newEntry, ...entries]);
      setForm({ label: '', identifier: '', category: 'General' });
      setIsAdding(false);
    } catch (err) {
      console.error("Audit failed", err);
    } finally {
      setLoading(false);
    }
  };

  const removeEntry = (id: string) => {
    if (confirm("Permanently delete this fiber block?")) {
      setEntries(entries.filter(e => e.id !== id));
    }
  };

  const filteredEntries = entries.filter(e => 
    e.label.toLowerCase().includes(search.toLowerCase()) || 
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 relative min-h-screen">
      <style>
        {`
          @keyframes border-glow {
            0% { border-color: rgba(16, 185, 129, 0.2); }
            50% { border-color: rgba(16, 185, 129, 0.8); }
            100% { border-color: rgba(16, 185, 129, 0.2); }
          }
          @keyframes progress-slide {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(250%); }
          }
          .animate-border-glow {
            animation: border-glow 2s infinite ease-in-out;
          }
          .animate-progress-slide {
            animation: progress-slide 1.5s infinite linear;
          }
        `}
      </style>

      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none opacity-10">
        <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-500 fill-none stroke-current stroke-[0.1]">
          <path d="M10,10 Q50,90 90,10" />
          <path d="M10,90 Q50,10 90,90" />
          <circle cx="50" cy="50" r="40" />
        </svg>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 relative z-10">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-4">
            <Database className="w-3 h-3" />
            <span>Encrypted Fiber Storage Network</span>
          </div>
          <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase">
            Account <span className="text-emerald-400">Vault</span>
          </h1>
          <p className="text-gray-400 max-w-xl mt-2">
            Securely explore and store digital identifiers within our specialized fiber-block network. Powered by AI security auditing.
          </p>
        </div>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input 
              type="text" 
              placeholder="Search database..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-emerald-500/50 w-64 font-mono"
            />
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span className="uppercase text-xs tracking-widest">New Entry</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Entry Form */}
        {isAdding && (
          <div className={`lg:col-span-12 glass-card p-8 rounded-[2rem] border-emerald-500/40 animate-in fade-in slide-in-from-top-4 relative overflow-hidden transition-all ${loading ? 'opacity-70' : ''}`}>
            {loading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-500">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse"></div>
                  <div className="relative p-6 bg-emerald-500/10 rounded-full border border-emerald-500/30">
                    <Cpu className="w-12 h-12 text-emerald-400 animate-spin" />
                  </div>
                  <Loader2 className="absolute -top-1 -right-1 w-6 h-6 text-emerald-400 animate-spin" />
                </div>
                
                <div className="text-sm font-black text-emerald-400 uppercase tracking-[0.4em] mb-4 text-center px-4">
                  {loadingSteps[loadingStepIdx]}
                </div>

                <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                  <div className="absolute inset-0 bg-emerald-500/40 w-1/2 animate-progress-slide"></div>
                </div>
                
                <div className="mt-6 text-[10px] font-mono text-gray-500 animate-pulse uppercase tracking-widest italic">
                  Running Gemini Heuristics Engine...
                </div>
              </div>
            )}
            
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Record Label</label>
                <input 
                  type="text" 
                  disabled={loading}
                  value={form.label}
                  onChange={e => setForm({...form, label: e.target.value})}
                  placeholder="e.g. Main Cloud Account"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 disabled:opacity-50"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Secret Identifier</label>
                <input 
                  type="text" 
                  disabled={loading}
                  value={form.identifier}
                  onChange={e => setForm({...form, identifier: e.target.value})}
                  placeholder="Password or Token"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 disabled:opacity-50"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <div className="flex-grow">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Category</label>
                  <select 
                    disabled={loading}
                    value={form.category}
                    onChange={e => setForm({...form, category: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 disabled:opacity-50"
                  >
                    <option className="bg-neutral-900">General</option>
                    <option className="bg-neutral-900">Work</option>
                    <option className="bg-neutral-900">Private</option>
                    <option className="bg-neutral-900">Finance</option>
                  </select>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-8 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 disabled:opacity-50 h-[46px] transition-all flex items-center justify-center min-w-[160px]"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Audit & Store'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Ghost Card when Loading */}
          {loading && (
            <div className="glass-card p-6 rounded-[2rem] border-emerald-500/50 border-2 animate-border-glow flex flex-col h-[280px] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-500/50 animate-pulse"></div>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400 animate-pulse">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-white/10 rounded animate-pulse"></div>
                    <div className="h-2 w-12 bg-emerald-500/20 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="bg-black/40 border border-white/5 rounded-2xl p-4 mb-6 flex items-center justify-between">
                <div className="h-3 w-32 bg-white/5 rounded animate-pulse"></div>
              </div>
              <div className="flex-grow space-y-3">
                <div className="flex justify-between">
                   <div className="h-2 w-16 bg-white/5 rounded animate-pulse"></div>
                   <div className="h-2 w-8 bg-emerald-500/20 rounded animate-pulse"></div>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500/20 w-1/3"></div>
                </div>
                <div className="h-2 w-full bg-white/5 rounded animate-pulse"></div>
                <div className="h-2 w-2/3 bg-white/5 rounded animate-pulse"></div>
              </div>
              <div className="mt-4 text-[8px] font-mono text-emerald-500/50 uppercase italic text-center animate-pulse">
                Encrypting Data Block...
              </div>
            </div>
          )}

          {filteredEntries.map((entry) => (
            <div key={entry.id} className="glass-card p-6 rounded-[2rem] border-white/5 group hover:border-emerald-500/20 transition-all flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{entry.label}</h3>
                    <div className="text-[9px] text-emerald-500 font-mono tracking-widest uppercase">{entry.category}</div>
                  </div>
                </div>
                <button 
                  onClick={() => removeEntry(entry.id)}
                  className="p-2 text-gray-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-black/40 border border-white/5 rounded-2xl p-4 mb-6 flex items-center justify-between">
                <div className="font-mono text-sm tracking-widest text-emerald-100/80">
                  {showId === entry.id ? entry.identifier : '••••••••••••'}
                </div>
                <button 
                  onClick={() => setShowId(showId === entry.id ? null : entry.id)}
                  className="p-1.5 text-emerald-500/50 hover:text-emerald-500 transition-colors"
                >
                  {showId === entry.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex-grow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Security Score</span>
                  <span className={`text-xs font-black ${entry.securityScore > 70 ? 'text-emerald-400' : entry.securityScore > 40 ? 'text-orange-400' : 'text-red-400'}`}>
                    {entry.securityScore}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                  <div 
                    className={`h-full transition-all duration-1000 ${entry.securityScore > 70 ? 'bg-emerald-500' : entry.securityScore > 40 ? 'bg-orange-500' : 'bg-red-500'}`} 
                    style={{ width: `${entry.securityScore}%` }}
                  />
                </div>
                <p className="text-[10px] font-mono text-gray-500 leading-relaxed italic border-l-2 border-emerald-500/20 pl-3">
                  {entry.analysis}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center text-[8px] text-gray-600 font-mono uppercase tracking-widest">
                  <Activity className="w-3 h-3 mr-2" />
                  Block: {entry.id.slice(0, 8)}
                </div>
                <div className="text-[8px] text-gray-700 font-mono">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}

          {filteredEntries.length === 0 && !isAdding && !loading && (
            <div className="col-span-full py-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-30 grayscale">
              <Database className="w-20 h-20 mb-6 text-emerald-500" />
              <p className="font-black uppercase tracking-[0.4em] text-xs">Fiber Network Empty</p>
              <button 
                onClick={() => setIsAdding(true)}
                className="mt-6 text-[10px] font-mono text-emerald-500 hover:underline cursor-pointer"
              >
                // Initialize first storage block
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Vault;