import React, { useState, useEffect } from 'react';
import { QuantumVisualizer } from './QuantumVisualizer';
import { QubitState } from '../types';
import { Cpu, Zap, RefreshCw, Activity, Terminal } from 'lucide-react';

const QuantumLab: React.FC = () => {
  const [qubits, setQubits] = useState<QubitState[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const generateQubits = () => {
    const newQubits: QubitState[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      alpha: Math.random(),
      beta: Math.random(),
      phase: Math.random() * Math.PI * 2
    }));
    setQubits(newQubits);
  };

  useEffect(() => {
    generateQubits();
  }, []);

  const runSimulation = () => {
    setIsSimulating(true);
    let count = 0;
    const interval = setInterval(() => {
      setQubits(prev => prev.map(q => ({
        ...q,
        beta: Math.max(0, Math.min(1, q.beta + (Math.random() - 0.5) * 0.1)),
        phase: (q.phase + 0.1) % (Math.PI * 2)
      })));
      count++;
      if (count > 20) {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 100);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-4">
            <Cpu className="w-3 h-3" />
            <span>Quantum-Cryptography Research Hub</span>
          </div>
          <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase">
            Quantum <span className="text-emerald-400">Lab</span>
          </h1>
          <p className="text-gray-400 max-w-xl mt-2">
            Simulating post-quantum encryption resilience and qubit entanglement patterns across our fiber grid.
          </p>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={generateQubits}
            className="px-6 py-3 glass-card text-emerald-400 font-bold rounded-xl hover:bg-emerald-500/10 transition-all border border-emerald-500/20 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="uppercase text-xs tracking-widest">Reset State</span>
          </button>
          <button 
            onClick={runSimulation}
            disabled={isSimulating}
            className="px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center space-x-2"
          >
            <Zap className={`w-4 h-4 ${isSimulating ? 'animate-pulse' : ''}`} />
            <span className="uppercase text-xs tracking-widest">{isSimulating ? 'Simulating...' : 'Run Analysis'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="glass-card rounded-[2rem] p-8 border-emerald-500/10 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <Activity className="w-32 h-32 text-emerald-500" />
             </div>
             <div className="flex items-center space-x-3 mb-8">
                <Terminal className="w-5 h-5 text-emerald-500" />
                <span className="text-xs font-black uppercase tracking-widest text-white/50">Active Entanglement Stream</span>
             </div>
             <QuantumVisualizer qubits={qubits} />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-[2rem] p-8 border-white/5">
            <h3 className="text-xl font-bold text-white mb-4 italic uppercase tracking-tighter">Lab <span className="text-emerald-400">Telemetry</span></h3>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Coherence Level</div>
                <div className="text-xl font-black text-emerald-400 italic">99.897%</div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Entropy Flux</div>
                <div className="text-xl font-black text-emerald-400 italic">0.0024 η</div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Decryption Speed</div>
                <div className="text-xl font-black text-emerald-400 italic">14.2 Q-Bits/s</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumLab;