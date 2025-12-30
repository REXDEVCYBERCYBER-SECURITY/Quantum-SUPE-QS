
import React from 'react';
import { QubitState } from '../types';

interface Props {
  qubits: QubitState[];
}

export const QuantumVisualizer: React.FC<Props> = ({ qubits }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4">
      {qubits.map((q) => {
        const radius = 40;
        const centerX = 50;
        const centerY = 50;
        // Simple probability visualization
        const probabilityHeight = q.beta * 80;

        return (
          <div key={q.id} className="glass-panel p-4 rounded-xl flex flex-col items-center border-sky-500/30 hover:border-sky-400 transition-all duration-300">
            <h3 className="text-xs font-bold text-sky-400 mb-2 mono">QUBIT_{q.id.toString().padStart(2, '0')}</h3>
            <svg width="100" height="100" viewBox="0 0 100 100" className="drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]">
              {/* Outer Ring */}
              <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="none"
                stroke="rgba(56, 189, 248, 0.2)"
                strokeWidth="2"
              />
              {/* State Indicator */}
              <rect
                x={centerX - 10}
                y={centerY + 40 - probabilityHeight}
                width="20"
                height={probabilityHeight}
                className="fill-sky-500/50"
              />
              {/* Pulse circle for phase */}
              <circle
                cx={centerX + Math.cos(q.phase) * radius}
                cy={centerY + Math.sin(q.phase) * radius}
                r="4"
                className="fill-cyan-400 animate-pulse"
              />
            </svg>
            <div className="mt-3 text-[10px] w-full space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">PROB |1&gt;</span>
                <span className="text-sky-300">{(q.beta * 100).toFixed(1)}%</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sky-500 transition-all duration-500" 
                  style={{ width: `${q.beta * 100}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
