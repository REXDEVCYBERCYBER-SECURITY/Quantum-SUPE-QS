
import React from 'react';
import { QubitState } from '../types';

interface Props {
  qubits: QubitState[];
}

export const QuantumVisualizer: React.FC<Props> = ({ qubits }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
      {qubits.map((q) => {
        const radius = 35;
        const centerX = 50;
        const centerY = 50;
        const orbitX = centerX + Math.cos(q.phase) * radius;
        const orbitY = centerY + Math.sin(q.phase) * radius;

        return (
          <div key={q.id} className="glass-panel p-6 rounded-3xl flex flex-col items-center border-sky-500/10 hover:border-sky-400/30 hover:bg-sky-500/5 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
                <span className="mono text-[8px] text-sky-400">REG_{q.id.toString().padStart(2, '0')}</span>
            </div>
            
            <h3 className="text-[10px] font-black text-slate-500 mb-4 mono uppercase tracking-widest group-hover:text-sky-400 transition-colors">Q-Bit Sequence {q.id}</h3>
            
            <div className="relative">
                <svg width="120" height="120" viewBox="0 0 100 100" className="drop-shadow-[0_0_12px_rgba(56,189,248,0.2)]">
                  {/* Background Aura */}
                  <circle cx="50" cy="50" r="45" fill="rgba(56, 189, 248, 0.02)" />
                  
                  {/* Outer Orbit Path */}
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={radius}
                    fill="none"
                    stroke="rgba(56, 189, 248, 0.1)"
                    strokeWidth="0.5"
                    strokeDasharray="4 2"
                  />
                  
                  {/* Coherence Gradient */}
                  <defs>
                    <radialGradient id={`grad-${q.id}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                      <stop offset="0%" style={{ stopColor: 'rgba(56, 189, 248, 0.4)', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: 'rgba(56, 189, 248, 0)', stopOpacity: 0 }} />
                    </radialGradient>
                  </defs>

                  {/* Probability Mass */}
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={q.beta * 30}
                    fill={`url(#grad-${q.id})`}
                    className="transition-all duration-700"
                  />

                  {/* Rotating Phase Indicator */}
                  <line
                    x1={centerX}
                    y1={centerY}
                    x2={orbitX}
                    y2={orbitY}
                    stroke="rgba(56, 189, 248, 0.3)"
                    strokeWidth="1"
                  />
                  
                  <circle
                    cx={orbitX}
                    cy={orbitY}
                    r="3"
                    className="fill-sky-400 shadow-[0_0_10px_rgba(56,189,248,1)]"
                  />
                </svg>
            </div>

            <div className="mt-6 text-[10px] w-full space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 uppercase tracking-tighter font-bold">State Density</span>
                <span className="text-sky-300 font-black mono">{(q.beta * 100).toFixed(1)}%</span>
              </div>
              <div className="h-0.5 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-sky-600 to-sky-400 transition-all duration-1000" 
                  style={{ width: `${q.beta * 100}%` }}
                />
              </div>
              <div className="flex justify-between items-center pt-1 text-[8px] text-slate-600 mono uppercase">
                <span>Phase Shift</span>
                <span>{(q.phase % (Math.PI * 2)).toFixed(2)} rad</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
