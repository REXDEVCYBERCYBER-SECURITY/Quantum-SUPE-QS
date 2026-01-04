
import React from 'react';
// Added missing ChevronRight and ShieldCheck imports
import { ArrowRight, Lock, Database, Globe, Network, ChevronRight, ShieldCheck } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative overflow-hidden pt-12 pb-24 px-6">
      {/* Background Fiber Lines */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
         <div className="absolute top-[20%] left-[-10%] w-[120%] h-[1px] bg-emerald-500/30 -rotate-12 blur-sm"></div>
         <div className="absolute top-[60%] right-[-10%] w-[120%] h-[1px] bg-emerald-400/20 rotate-6 blur-sm"></div>
      </div>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none -z-10"></div>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
            <Lock className="w-3 h-3" />
            <span>Cyber-Tech-Explorer v4.0.0</span>
          </div>
          <h1 className="text-6xl lg:text-8xl font-black text-white mb-8 leading-[0.9] uppercase italic tracking-tighter">
            Digital <span className="text-emerald-400">Fiber</span> Investigation.
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-xl leading-relaxed font-medium">
            Explore a global fiber network archive storing mission-critical statistics, traffic database blocks, and practical learning resources for the cyber-curious.
          </p>
          <div className="flex flex-wrap gap-6">
            <button className="px-10 py-5 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-400 transition-all flex items-center shadow-[0_0_30px_rgba(16,185,129,0.4)] group">
              Explore Store
              <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
            <button className="px-10 py-5 glass-card text-white font-black uppercase tracking-widest rounded-2xl hover:bg-white/5 transition-all flex items-center border-white/10">
              <Network className="mr-3 w-5 h-5 text-emerald-400" />
              Join Grid
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="glass-card p-8 rounded-[3rem] border-emerald-500/20 relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-10">
              <div className="flex space-x-3">
                <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/60"></div>
              </div>
              <div className="text-[10px] text-emerald-500/50 font-black tracking-widest uppercase italic">REX-NODE-0174 // ACTIVE</div>
            </div>
            <div className="space-y-5 font-mono text-xs leading-relaxed">
              <div className="flex items-center text-emerald-400">
                <span className="mr-3 opacity-50">root@rexdev:~$</span>
                <span className="font-bold underline">./analyze_grid.sh --deep-scan</span>
              </div>
              <div className="text-gray-500 flex items-center">
                <ChevronRight className="w-3 h-3 mr-2" />
                [INFO] Routing through fiber blocks...
              </div>
              <div className="text-gray-400 flex items-center">
                <ChevronRight className="w-3 h-3 mr-2" />
                [SCAN] Database Statistics: 98.4% Integrity
              </div>
              <div className="text-emerald-500 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                <div className="flex items-center font-bold mb-1">
                  <ShieldCheck className="w-3 h-3 mr-2" />
                  SECURITY STATUS: NOMINAL
                </div>
                <p className="text-[9px] text-emerald-500/60">All nodes synchronized. No leaks detected in primary traffic block.</p>
              </div>
              <div className="text-red-400/80 animate-pulse font-bold">[!] Incoming packet from corner [0,0,0,1] - INVESTIGATING</div>
              <div className="h-6 bg-white/5 w-full rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[70%] animate-pulse"></div>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -bottom-12 -left-12 glass-card p-6 rounded-3xl border-emerald-500/10 hidden xl:block z-20 hover:-translate-y-2 transition-transform duration-500">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl">
                <Database className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Global Archive</div>
                <div className="text-2xl font-black text-white italic">4.2 PB</div>
              </div>
            </div>
          </div>
          
          <div className="absolute -top-12 -right-12 glass-card p-6 rounded-3xl border-emerald-500/10 hidden xl:block z-20 hover:translate-y-2 transition-transform duration-500">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl">
                <Globe className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Traffic Load</div>
                <div className="text-2xl font-black text-white italic">0.4ms LAT</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
