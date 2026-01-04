import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Send, ShieldCheck, AlertCircle, RefreshCw, Trash2, History, Clock, FileText, Download } from 'lucide-react';
import { analyzeSecurityVulnerability } from '../services/geminiService';
import { SecurityScanResult, SavedScan } from '../types';

const STORAGE_KEY = 'REX_SECURITY_HISTORY';

const AIAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<SecurityScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [history, setHistory] = useState<SavedScan[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setLoading(true);
    setResult(null);
    setLogs([]);
    
    addLog("Initializing security scan module...");
    await new Promise(r => setTimeout(r, 600));
    addLog("Contacting REXDEVCYBER fiber node...");
    await new Promise(r => setTimeout(r, 800));
    addLog("Parsing input parameters for vulnerability patterns...");
    await new Promise(r => setTimeout(r, 500));
    addLog("Running Gemini-3 heuristic engine...");

    try {
      const analysis = await analyzeSecurityVulnerability(input);
      addLog("Analysis complete. Decrypting findings...");
      await new Promise(r => setTimeout(r, 700));
      
      const newScan: SavedScan = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        input: input,
        result: analysis
      };
      
      setResult(analysis);
      setHistory(prev => [newScan, ...prev].slice(0, 20));
      addLog("Result saved to local grid history.");
    } catch (error) {
      addLog("ERROR: Connection to fiber node lost.");
      console.error("Scan failed", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (scan: SavedScan) => {
    setInput(scan.input);
    setResult(scan.result);
    setLogs([`[${new Date().toLocaleTimeString()}] RE-LOADING SCAN ID: ${scan.id.slice(0, 8)}`, `[SYSTEM] History retrieval successful.`]);
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to purge all local scan history?")) {
      setHistory([]);
      localStorage.removeItem(STORAGE_KEY);
      addLog("Local history database purged.");
    }
  };

  const downloadReport = () => {
    if (!result) return;
    const report = `
REXDEVCYBER SECURITY AUDIT REPORT
=================================
ID: ${crypto.randomUUID()}
DATE: ${new Date().toLocaleString()}
TARGET: ${input}

VULNERABILITY: ${result.vulnerability}
SEVERITY: ${result.severity}

DESCRIPTION:
${result.description}

RECOMMENDED REMEDIATION:
${result.recommendation}

---------------------------------
(c) 2025 REXDEVCYBER FIBER NETWORK
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rex_audit_${result.vulnerability.toLowerCase().replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addLog("Audit report generated and exported.");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-16 text-center">
        <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-6">
          <Terminal className="w-8 h-8" />
        </div>
        <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 uppercase italic tracking-tighter">AI Security <span className="text-emerald-400">Terminal</span></h2>
        <p className="text-gray-400 max-w-2xl mx-auto">Input suspicious traffic or vulnerability descriptions for advanced investigation powered by Gemini AI. All results are stored in your local session archive.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-[2rem] overflow-hidden border-emerald-500/20 flex flex-col">
            <div className="bg-emerald-500/10 px-6 py-4 border-b border-emerald-500/20 flex items-center justify-between">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Scanner Input</span>
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500/40"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500/40"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-500/40"></div>
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleScan}>
                <p className="text-[10px] font-black text-gray-500 mb-4 uppercase tracking-[0.2em]">Analysis Target:</p>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g. Unusual traffic spike on port 443..."
                  className="w-full bg-black/40 border border-emerald-500/10 rounded-2xl p-5 text-emerald-100 placeholder:text-gray-700 focus:outline-none focus:border-emerald-500/40 min-h-[180px] font-mono transition-all text-xs leading-relaxed"
                />
                <button 
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="mt-6 w-full bg-emerald-500 text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-30"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-3" /> : <Send className="w-4 h-4 mr-3" />}
                  {loading ? 'Analyzing...' : 'Execute Scan'}
                </button>
              </form>
            </div>
          </div>

          <div className="glass-card rounded-[2rem] border-white/5 flex flex-col max-h-[500px]">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-emerald-500/50" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Local History</span>
              </div>
              {history.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="p-1.5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg transition-all"
                  title="Purge Archive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            <div className="p-4 space-y-3 overflow-y-auto scrollbar-hide">
              {history.length === 0 ? (
                <div className="text-center py-10">
                  <Clock className="w-8 h-8 text-white/5 mx-auto mb-2" />
                  <p className="text-[10px] font-mono text-gray-600 italic">Archive Empty</p>
                </div>
              ) : (
                history.map((scan) => (
                  <button
                    key={scan.id}
                    onClick={() => loadFromHistory(scan)}
                    className="w-full text-left p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                        scan.result.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                        scan.result.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {scan.result.severity}
                      </span>
                      <span className="text-[8px] font-mono text-gray-600">{new Date(scan.timestamp).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-300 group-hover:text-white line-clamp-1">{scan.result.vulnerability}</h4>
                    <p className="text-[10px] text-gray-600 line-clamp-1 mt-1 font-mono italic">"{scan.input}"</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="glass-card rounded-[2rem] border-white/5 bg-black/60 p-6 h-[180px] overflow-y-auto font-mono text-[11px] text-gray-400 scrollbar-hide border-l-4 border-l-emerald-500/30">
            {logs.length === 0 && <div className="italic text-gray-700 font-mono tracking-widest text-[9px] uppercase">Terminal Ready for Command Input...</div>}
            {logs.map((log, i) => (
              <div key={i} className="mb-1 flex">
                <span className="text-emerald-500/50 mr-2 shrink-0">#</span>
                <span className={i === logs.length - 1 ? "text-emerald-400" : ""}>{log}</span>
              </div>
            ))}
            {loading && <div className="animate-pulse text-emerald-400 mt-1 font-bold">SCANNING_IN_PROGRESS...</div>}
            <div ref={logEndRef} />
          </div>

          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
              <div className={`p-8 rounded-[2.5rem] border-2 flex flex-col ${
                  result.severity === 'CRITICAL' ? 'border-red-500/30 bg-red-500/5 shadow-[0_0_30px_rgba(239,68,68,0.1)]' :
                  result.severity === 'HIGH' ? 'border-orange-500/30 bg-orange-500/5 shadow-[0_0_30px_rgba(249,115,22,0.1)]' :
                  'border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.1)]'
              }`}>
                <div className="flex items-center justify-between mb-8">
                  <div className={`p-3 rounded-2xl ${
                    result.severity === 'CRITICAL' ? 'bg-red-500 text-black' :
                    result.severity === 'HIGH' ? 'bg-orange-500 text-black' :
                    'bg-emerald-500 text-black'
                  }`}>
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={downloadReport}
                      className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                      <Download className="w-3 h-3" />
                      <span>Export Report</span>
                    </button>
                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border-2 ${
                      result.severity === 'CRITICAL' ? 'border-red-500 text-red-400' :
                      result.severity === 'HIGH' ? 'border-orange-500 text-orange-400' :
                      'border-emerald-500 text-emerald-400'
                    } uppercase tracking-[0.2em]`}>
                      {result.severity} THREAT LEVEL
                    </span>
                  </div>
                </div>

                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 italic">
                  {result.vulnerability}
                </h3>
                <p className="text-gray-400 leading-relaxed font-medium mb-10">
                  {result.description}
                </p>

                <div className="bg-white/5 rounded-3xl p-8 border border-white/5">
                  <div className="flex items-center space-x-3 mb-6">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h4 className="font-black text-white text-xs uppercase tracking-widest italic underline decoration-emerald-500/30">Remediation Protocol</h4>
                  </div>
                  <div className="text-gray-400 text-sm font-mono whitespace-pre-wrap leading-loose border-l-2 border-emerald-500/20 pl-6">
                    {result.recommendation}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!result && !loading && (
            <div className="h-[400px] flex flex-col items-center justify-center py-20 opacity-20 grayscale border-2 border-dashed border-white/10 rounded-[3rem]">
              <ShieldCheck className="w-24 h-24 mb-6" />
              <p className="font-black uppercase tracking-[0.4em] text-xs">Awaiting Analysis Data</p>
              <p className="text-[10px] mt-4 font-mono">Select a past scan or execute a new query</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;