
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  Cpu, 
  Zap, 
  Terminal, 
  Settings, 
  Clock, 
  Compass,
  ArrowRight,
  ShieldAlert,
  Dna
} from 'lucide-react';
import { ControlView, QubitState, TemporalLog } from './types';
import { QuantumVisualizer } from './components/QuantumVisualizer';
import { generateTemporalLog, analyzeQuantumStability } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<ControlView>(ControlView.DASHBOARD);
  const [qubits, setQubits] = useState<QubitState[]>([]);
  const [logs, setLogs] = useState<TemporalLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [targetDate, setTargetDate] = useState('1989-03-26');
  const [steeringValue, setSteeringValue] = useState(50);
  const [analysis, setAnalysis] = useState<{ divergenceRisk: number; reasoning: string; recommendedAction: string } | null>(null);

  // Initialize Qubits
  useEffect(() => {
    const initialQubits = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      alpha: Math.sqrt(0.5),
      beta: Math.random(),
      phase: Math.random() * Math.PI * 2,
    }));
    setQubits(initialQubits);
  }, []);

  // Update Qubit Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setQubits(prev => prev.map(q => ({
        ...q,
        phase: (q.phase + 0.1) % (Math.PI * 2),
        beta: Math.max(0, Math.min(1, q.beta + (Math.random() - 0.5) * 0.05))
      })));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleLeap = async () => {
    setIsLoading(true);
    try {
      const narrative = await generateTemporalLog(targetDate, `Steering Stability at ${steeringValue}%`);
      const newLog: TemporalLog = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        destinationDate: targetDate,
        narrative,
        stability: steeringValue
      };
      setLogs(prev => [newLog, ...prev].slice(0, 10));
      
      const analysisData = await analyzeQuantumStability(qubits.slice(0, 4));
      setAnalysis(analysisData);
    } catch (error) {
      console.error("Leap Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSidebar = () => (
    <div className="w-20 md:w-64 h-full glass-panel border-r border-sky-500/20 flex flex-col p-4 z-50">
      <div className="flex items-center gap-3 mb-10 px-2">
        <Zap className="text-sky-400 w-8 h-8 animate-pulse" />
        <span className="hidden md:block font-extrabold text-xl tracking-tighter text-sky-400">QS_CTRL</span>
      </div>
      
      <nav className="flex-1 space-y-2">
        {[
          { id: ControlView.DASHBOARD, icon: Activity, label: 'Control Deck' },
          { id: ControlView.TEMPORAL_LEAP, icon: Compass, label: 'Temporal Leap' },
          { id: ControlView.QUBIT_LAB, icon: Cpu, label: 'Qubit Lab' },
          { id: ControlView.STEERING, icon: Settings, label: 'Quantum Steering' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
              view === item.id 
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-[0_0_15px_rgba(56,189,248,0.2)]' 
                : 'text-slate-400 hover:text-sky-200 hover:bg-slate-800/50'
            }`}
          >
            <item.icon size={20} />
            <span className="hidden md:block text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto p-4 glass-panel rounded-xl border-sky-900/40 bg-sky-950/10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
          <span className="text-[10px] text-sky-400 mono">SYSTEM ONLINE</span>
        </div>
        <p className="text-[10px] text-slate-500 hidden md:block">ENTANGLEMENT_LEVEL: ALPHA-9</p>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="p-6 space-y-6 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100">Quantum Dashboard</h1>
          <p className="text-slate-400 text-sm">Superscript System Status: <span className="text-emerald-400">Optimized</span></p>
        </div>
        <div className="flex gap-3">
          <div className="glass-panel px-4 py-2 rounded-lg text-xs flex items-center gap-2">
            <Clock size={14} className="text-sky-400" />
            <span className="mono">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <section className="glass-panel rounded-2xl p-6 overflow-hidden relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-sky-300">
                <Cpu size={20} /> Qubit Matrix
              </h2>
              <button onClick={() => setView(ControlView.QUBIT_LAB)} className="text-xs text-sky-500 hover:text-sky-400 flex items-center gap-1">
                Advanced Lab <ArrowRight size={14} />
              </button>
            </div>
            <QuantumVisualizer qubits={qubits.slice(0, 8)} />
            <div className="absolute top-0 right-0 p-4 pointer-events-none opacity-10">
              <Dna size={120} className="text-sky-500 animate-pulse" />
            </div>
          </section>

          <section className="glass-panel rounded-2xl p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-sky-300 mb-6">
              <Terminal size={20} /> Recent Mission Logs
            </h2>
            <div className="space-y-4">
              {logs.length === 0 ? (
                <div className="text-center py-10 text-slate-500 italic text-sm">No temporal logs recorded. Initiate a Leap.</div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="border-l-2 border-sky-500/40 pl-4 py-2 hover:bg-sky-500/5 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-sky-400 mono">DEST: {log.destinationDate}</span>
                      <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed italic">"{log.narrative}"</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border-amber-500/20 bg-amber-500/5">
            <h3 className="flex items-center gap-2 text-md font-bold text-amber-400 mb-4">
              <ShieldAlert size={18} /> Timeline Status
            </h3>
            {analysis ? (
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Divergence Risk</span>
                  <span className={analysis.divergenceRisk > 0.5 ? 'text-red-400' : 'text-emerald-400'}>
                    {(analysis.divergenceRisk * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${analysis.divergenceRisk > 0.5 ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${analysis.divergenceRisk * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-300 leading-tight mt-4">{analysis.reasoning}</p>
                <div className="bg-slate-900/50 p-2 rounded border border-amber-500/20 text-[10px] text-amber-200">
                  <span className="font-bold">RECOMMENDATION:</span> {analysis.recommendedAction}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No temporal analysis available. Deploy sensor array.</p>
            )}
          </div>

          <div className="glass-panel rounded-2xl p-6 bg-gradient-to-br from-sky-500/10 to-transparent">
            <h3 className="text-md font-bold text-sky-400 mb-4">Quick Leap</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">COORDINATE_DATE</label>
                <input 
                  type="date" 
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-slate-900 border border-sky-500/30 rounded p-2 text-sm text-sky-200 outline-none focus:border-sky-400"
                />
              </div>
              <button 
                onClick={handleLeap}
                disabled={isLoading}
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(56,189,248,0.3)]"
              >
                {isLoading ? <Zap className="animate-spin w-5 h-5" /> : 'INITIATE LEAP'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLeapView = () => (
    <div className="p-8 max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400 mb-2">Temporal Control Unit</h2>
        <p className="text-slate-400">Manage destination coordinates and quantum stabilization parameters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-4 p-4 bg-sky-500/10 border border-sky-500/20 rounded-2xl">
            <Compass size={40} className="text-sky-400" />
            <div>
              <div className="text-[10px] text-sky-500 font-bold tracking-widest uppercase">Target Vector</div>
              <input 
                type="date" 
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="bg-transparent text-2xl font-bold text-white outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Quantum Stabilization</span>
              <span className="text-sky-400 font-bold">{steeringValue}%</span>
            </div>
            <input 
              type="range"
              min="0"
              max="100"
              value={steeringValue}
              onChange={(e) => setSteeringValue(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-bold">
              <span>ENTROPY HIGH</span>
              <span>EQUILIBRIUM</span>
              <span>RIGIDITY HIGH</span>
            </div>
          </div>

          <button 
            onClick={handleLeap}
            disabled={isLoading}
            className="w-full py-5 bg-gradient-to-r from-sky-600 to-indigo-600 rounded-2xl text-xl font-black text-white hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"
          >
            {isLoading ? "CALCULATING MANIFOLD..." : "DEPLOY QUANTUM BRIDGE"}
          </button>
        </div>

        <div className="glass-panel p-8 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%">
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          <div className="relative z-10 text-center">
            <div className="w-48 h-48 rounded-full border-4 border-dashed border-sky-500/30 flex items-center justify-center mb-6 animate-[spin_20s_linear_infinite]">
              <div className="w-32 h-32 rounded-full border-4 border-sky-400/50 flex items-center justify-center animate-[spin_10s_linear_infinite_reverse]">
                <Zap size={64} className="text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.8)]" />
              </div>
            </div>
            <h4 className="text-xl font-bold text-sky-100">Singularity Core</h4>
            <p className="text-slate-500 text-sm mt-2">Core frequency: 1.21 GW</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden quantum-gradient text-slate-200">
      {renderSidebar()}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative">
        {/* Particle Overlay (CSS decoration) */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i}
              className="absolute bg-sky-500 rounded-full"
              style={{
                width: Math.random() * 4 + 'px',
                height: Math.random() * 4 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                filter: 'blur(1px)',
                animation: `pulse-soft ${2 + Math.random() * 4}s infinite ease-in-out`
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          {view === ControlView.DASHBOARD && renderDashboard()}
          {view === ControlView.TEMPORAL_LEAP && renderLeapView()}
          {view === ControlView.QUBIT_LAB && (
            <div className="p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-bold text-sky-300">Advanced Qubit Laboratory</h2>
              <div className="glass-panel p-8 rounded-3xl border-sky-500/20">
                 <QuantumVisualizer qubits={qubits} />
                 <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="bg-slate-900/60 p-6 rounded-2xl border border-sky-500/10">
                      <h4 className="text-lg font-bold text-sky-400 mb-4">Entanglement Statistics</h4>
                      <div className="space-y-4 text-sm">
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="text-slate-400">Fidelity Coefficient</span>
                          <span className="mono text-emerald-400">0.9992</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="text-slate-400">Decoherence Rate</span>
                          <span className="mono text-amber-400">1.2ms/τ</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="text-slate-400">Active Bridges</span>
                          <span className="mono text-sky-400">1,024</span>
                        </div>
                      </div>
                   </div>
                   <div className="bg-slate-900/60 p-6 rounded-2xl border border-sky-500/10">
                      <h4 className="text-lg font-bold text-sky-400 mb-4">Hardware Diagnostics</h4>
                      <div className="flex items-center gap-6">
                        <div className="flex-1 space-y-3">
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[92%] animate-pulse" />
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-500 w-[78%] animate-pulse" />
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 w-[45%] animate-pulse" />
                          </div>
                        </div>
                        <div className="text-[10px] space-y-3 font-bold text-slate-500">
                          <div>COOLANT</div>
                          <div>VACUUM</div>
                          <div>PHOTON_YIELD</div>
                        </div>
                      </div>
                   </div>
                 </div>
              </div>
            </div>
          )}
          {view === ControlView.STEERING && (
            <div className="p-12 flex flex-col items-center space-y-12">
               <div className="text-center">
                 <h2 className="text-3xl font-black text-sky-400 uppercase tracking-widest italic mb-2">Quantum Power Steering</h2>
                 <p className="text-slate-500 text-sm">Fluid dynamic stabilization for multi-dimensional travel.</p>
               </div>
               
               <div className="relative w-80 h-80 flex items-center justify-center">
                 <div className="absolute inset-0 rounded-full border-8 border-slate-800 flex items-center justify-center">
                    <div className="w-[90%] h-[90%] rounded-full border-4 border-sky-500/20 animate-pulse" />
                 </div>
                 <div 
                    className="absolute w-2 h-40 bg-sky-500 origin-bottom transition-transform duration-300 rounded-full shadow-[0_0_15px_rgba(56,189,248,1)]"
                    style={{ 
                      transform: `rotate(${(steeringValue * 3.6) - 180}deg)`, 
                      bottom: '50%' 
                    }}
                 />
                 <div className="z-10 bg-slate-900 w-24 h-24 rounded-full border-4 border-sky-400 flex flex-col items-center justify-center shadow-2xl">
                    <span className="text-2xl font-black text-white">{steeringValue}</span>
                    <span className="text-[10px] text-sky-400 font-bold uppercase">STABILITY</span>
                 </div>
               </div>

               <div className="w-full max-w-md space-y-8">
                  <div className="flex justify-center gap-4">
                    <button 
                      onClick={() => setSteeringValue(prev => Math.max(0, prev - 5))}
                      className="px-6 py-2 glass-panel rounded-full hover:bg-sky-500/10 active:bg-sky-500/20 text-sky-400 font-bold"
                    >
                      REDUCE TORQUE
                    </button>
                    <button 
                      onClick={() => setSteeringValue(prev => Math.min(100, prev + 5))}
                      className="px-6 py-2 glass-panel rounded-full hover:bg-sky-500/10 active:bg-sky-500/20 text-sky-400 font-bold"
                    >
                      GAIN FRICTION
                    </button>
                  </div>
                  <div className="p-4 bg-sky-950/20 border border-sky-500/20 rounded-xl">
                    <p className="text-xs text-slate-400 leading-relaxed italic text-center">
                      "Quantum steering allows the pilot to navigate through the fluidic space of the multi-verse by manipulating local probability density. High stability prevents timeline fracture but reduces maneuverability."
                    </p>
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
