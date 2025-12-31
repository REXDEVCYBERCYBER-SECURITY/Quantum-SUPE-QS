
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Activity, Cpu, Zap, Compass, Server, Orbit, Mic, MicOff, ChevronUp, RefreshCw, 
  ShieldCheck, Waves, ZapOff, BarChart3, BellRing, Scale, Atom, Layers, 
  Fingerprint, Lock, Globe, Heart, Users, CheckCircle2, LayoutDashboard, Database,
  Binary, Terminal, AlertCircle, Share2, Eye, Key, UserCheck, Shield, LogOut, Zap as ZapIcon,
  HelpCircle, MoreHorizontal, Search, History, Calendar, Info, BookOpen, Settings,
  Workflow, Microscope, ShieldAlert, FileText, UserPlus
} from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';
import { ControlView, QubitState, TemporalLog, QuantumMetrics, HealthStatus } from './types';
import { QuantumVisualizer } from './components/QuantumVisualizer';
import { generateTemporalLog } from './services/geminiService';

// Credentials mimic the requested PHP config.php behavior
const AUTH_CONFIG = {
  username: "ROOT_ADMIN_MARIO",
  password: "FUTURISTIC_SYNC_2025"
};

const NOISE_THRESHOLD = 0.12;
const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

const App: React.FC = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [view, setView] = useState<ControlView>(ControlView.DASHBOARD);
  const [transitioning, setTransitioning] = useState(false);
  const [qubits, setQubits] = useState<QubitState[]>([]);
  const [logs, setLogs] = useState<TemporalLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [targetDate, setTargetDate] = useState('1989-03-26');
  const [steeringValue, setSteeringValue] = useState(50);
  const [dismissedAlert, setDismissedAlert] = useState(false);
  const [leapEffect, setLeapEffect] = useState(false);
  const [computeSpeed, setComputeSpeed] = useState(1.4);
  const [cohesionScore, setCohesionScore] = useState(94.2);
  const [activeToasts, setActiveToasts] = useState<{id: string, title: string, status: HealthStatus}[]>([]);
  const [systemEvents, setSystemEvents] = useState<{id: string, text: string, type: 'info' | 'warn' | 'err'}[]>([]);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginFields, setLoginFields] = useState({ user: '', pass: '', email: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'IDLE' | 'CONNECTING' | 'ACTIVE'>('IDLE');
  const sessionRef = useRef<any>(null);
  const audioContextsRef = useRef<{ input?: AudioContext, output?: AudioContext }>({});
  const nextStartTimeRef = useRef(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const [metrics, setMetrics] = useState<QuantumMetrics>({
    entanglementLevel: 94.2,
    coherenceTime: 245.8,
    gateOps: 124500,
    noiseLevel: 0.04
  });

  const isCriticalNoise = metrics.noiseLevel > NOISE_THRESHOLD;
  const isVisualCritical = isCriticalNoise && !dismissedAlert;

  const filteredLogs = useMemo(() => {
    if (!searchQuery) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter(log => 
      log.destinationDate.toLowerCase().includes(q) || 
      log.narrative.toLowerCase().includes(q)
    );
  }, [logs, searchQuery]);

  const changeView = (newView: ControlView) => {
    if (newView === view) return;
    setTransitioning(true);
    setTimeout(() => {
      setView(newView);
      setTransitioning(false);
    }, 400);
  };

  const addSystemEvent = (text: string, type: 'info' | 'warn' | 'err' = 'info') => {
    setSystemEvents(prev => [{ id: Math.random().toString(), text, type }, ...prev].slice(0, 15));
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(null);

    // Mimics the PHP session logic (login.php / register.php mock)
    setTimeout(() => {
      if (isRegistering) {
        setIsRegistering(false);
        setIsLoading(false);
        addSystemEvent("NEW IDENTITY REGISTERED IN SQL_BUFFER", "info");
        setLoginError("Account created. Please sign in.");
      } else {
        if (loginFields.user === AUTH_CONFIG.username && loginFields.pass === AUTH_CONFIG.password) {
          setIsVerified(true);
          setIsLoading(false);
          addSystemEvent("NEURAL IDENTITY CONFIRMED: ROOT ACCESS GRANTED", "info");
        } else {
          setLoginError("WARNING! Incorrect information.");
          setIsLoading(false);
        }
      }
    }, 1200);
  };

  const handleLogout = () => {
    setTransitioning(true);
    addSystemEvent("TERMINATING NEURAL LINK (session_destroy)...", "warn");
    setTimeout(() => {
      setIsVerified(false);
      setTransitioning(false);
      setLoginFields({ user: '', pass: '', email: '' });
      setSystemEvents([]);
      setView(ControlView.DASHBOARD);
      if (isVoiceActive) {
        sessionRef.current?.close();
        setIsVoiceActive(false);
      }
    }, 1000);
  };

  const toggleVoiceSession = async () => {
    if (isVoiceActive) {
      sessionRef.current?.close();
      setIsVoiceActive(false);
      setVoiceStatus('IDLE');
      addSystemEvent("ZIGGY LINK DEACTIVATED", "warn");
      return;
    }
    setVoiceStatus('CONNECTING');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: INPUT_SAMPLE_RATE });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: OUTPUT_SAMPLE_RATE });
      audioContextsRef.current = { input: inputCtx, output: outputCtx };
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setVoiceStatus('ACTIVE');
            setIsVoiceActive(true);
            addSystemEvent("ZIGGY NEURAL SYNC ESTABLISHED", "info");
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              sessionPromise.then(s => s.sendRealtimeInput({ media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (m) => {
            const audioData = m.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), outputCtx, OUTPUT_SAMPLE_RATE, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              audioSourcesRef.current.add(source);
              source.onended = () => audioSourcesRef.current.delete(source);
            }
          }
        },
        config: { 
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: "You are Ziggy, the quantum-superscript AI assistant. You help users manage their temporal missions and quantum state data."
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) {
      setVoiceStatus('IDLE');
      setIsVoiceActive(false);
    }
  };

  useEffect(() => {
    const initialQubits = Array.from({ length: 8 }, (_, i) => ({ id: i, alpha: 0.5, beta: Math.random(), phase: Math.random() * Math.PI * 2 }));
    setQubits(initialQubits);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setQubits(prev => prev.map(q => ({
        ...q, phase: (q.phase + 0.05) % (Math.PI * 2), beta: Math.max(0.1, Math.min(0.9, q.beta + (Math.random() - 0.5) * 0.05))
      })));
      setMetrics(prev => ({
        ...prev,
        noiseLevel: Math.max(0.01, Math.min(0.25, prev.noiseLevel + (Math.random() - 0.5) * 0.02)),
        entanglementLevel: Math.max(80, Math.min(99.9, prev.entanglementLevel + (Math.random() - 0.5) * 0.5))
      }));
      setComputeSpeed(prev => Math.max(1.0, Math.min(3.5, prev + (Math.random() - 0.5) * 0.1)));
      setCohesionScore(prev => Math.max(85, Math.min(99.9, prev + (Math.random() - 0.5) * 0.2)));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (s: HealthStatus) => s === 'CRITICAL' ? 'text-red-400' : (s === 'WARNING' ? 'text-amber-400' : 'text-emerald-400');
  const getStatusBg = (s: HealthStatus) => s === 'CRITICAL' ? 'bg-red-500' : (s === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500');

  const renderLogin = () => (
    <div className="h-screen w-screen flex items-center justify-center bg-[#010409] quantum-gradient relative overflow-hidden px-4">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full animate-[scanline_12s_linear_infinite] bg-gradient-to-b from-transparent via-sky-500/20 to-transparent" />
      </div>
      
      <div className="glass-panel p-8 sm:p-12 rounded-[1.5rem] border-sky-500/20 max-w-[400px] w-full space-y-8 relative z-10 shadow-[0_0_100px_rgba(167,139,250,0.05)] animate-view-entry">
        <div className="text-center space-y-2">
          <p className="text-2xl font-bold text-white tracking-tight">{isRegistering ? 'Create Account' : 'Login'}</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mono">Quantum-Superscript System</p>
        </div>

        <form className="space-y-6" onSubmit={handleVerify}>
          <div className="space-y-4">
            {isRegistering && (
              <div className="group space-y-1">
                <label htmlFor="email" className="text-[11px] font-bold text-slate-400 block ml-1">Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  id="email" 
                  value={loginFields.email}
                  onChange={(e) => setLoginFields(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-[#111827] border border-[#374151] rounded-lg py-3 px-4 text-sm font-medium text-white outline-none focus:border-[#a78bfa] transition-all"
                  required
                />
              </div>
            )}
            <div className="group space-y-1">
              <label htmlFor="username" className="text-[11px] font-bold text-slate-400 block ml-1">Username</label>
              <input 
                type="text" 
                name="username" 
                id="username" 
                placeholder="" 
                value={loginFields.user}
                onChange={(e) => setLoginFields(prev => ({ ...prev, user: e.target.value }))}
                className="w-full bg-[#111827] border border-[#374151] rounded-lg py-3 px-4 text-sm font-medium text-white outline-none focus:border-[#a78bfa] transition-all"
                required
              />
            </div>
            <div className="group space-y-1">
              <label htmlFor="password" className="text-[11px] font-bold text-slate-400 block ml-1">Password</label>
              <input 
                type="password" 
                name="password" 
                id="password" 
                placeholder="" 
                value={loginFields.pass}
                onChange={(e) => setLoginFields(prev => ({ ...prev, pass: e.target.value }))}
                className="w-full bg-[#111827] border border-[#374151] rounded-lg py-3 px-4 text-sm font-medium text-white outline-none focus:border-[#a78bfa] transition-all"
                required
              />
              {!isRegistering && (
                <div className="flex justify-end pt-1">
                  <a href="#" className="text-[11px] font-medium text-slate-500 hover:text-[#a78bfa] transition-colors">Forgot Password ?</a>
                </div>
              )}
            </div>
          </div>

          {loginError && (
            <div className={`p-3 border rounded-lg text-[10px] font-bold uppercase text-center animate-pulse ${loginError.includes('Incorrect') ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
              {loginError}
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#a78bfa] hover:brightness-110 transition-all rounded-lg text-[#111827] font-bold text-sm flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
          >
            {isLoading ? <RefreshCw className="animate-spin" size={18} /> : null}
            {isLoading ? 'VERIFYING...' : (isRegistering ? 'Register' : 'Sign in')}
          </button>
        </form>

        <div className="flex items-center gap-3 pt-2">
          <div className="h-px bg-[#374151] flex-1"></div>
          <p className="text-[11px] text-slate-500 font-medium">Authentication Channels</p>
          <div className="h-px bg-[#374151] flex-1"></div>
        </div>

        <div className="flex justify-center gap-4">
           {[Fingerprint, Key, ShieldCheck].map((Icon, idx) => (
             <button key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-[#a78bfa]/10 hover:border-[#a78bfa]/20 transition-all text-slate-400 hover:text-[#a78bfa]">
               <Icon size={18} />
             </button>
           ))}
        </div>
        
        <p className="text-center text-[11px] text-slate-500 font-medium">
          {isRegistering ? 'Already have an account?' : "Don't have an account?"} {' '}
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-white hover:underline font-bold"
          >
            {isRegistering ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="p-6 lg:p-12 space-y-12 animate-view-entry">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-sky-500/10 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-400 mono flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ACCESS_VERIFIED
             </div>
             <div className="px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full text-[10px] font-black text-sky-400 mono">KERNEL_ID: {AUTH_CONFIG.username}</div>
          </div>
          <h1 className="text-7xl font-black text-slate-100 uppercase tracking-tighter italic leading-none hologram-glow">Control Deck</h1>
          <p className="text-slate-500 text-xs font-black uppercase tracking-[0.5em] leading-relaxed">
            Neural Uplink Active | Atmosphere Cohesion: <span className="text-emerald-400">OPTIMAL</span>
          </p>
        </div>
        <div className="flex gap-6 items-center glass-panel px-10 py-5 rounded-[2.5rem] border-sky-500/20">
          <div className="text-center">
            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Compute Flow</div>
            <div className="text-2xl font-black text-sky-400 mono">{computeSpeed.toFixed(2)} TB/s</div>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div className="text-center">
            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Atmosphere</div>
            <div className="text-2xl font-black text-emerald-400 mono">{cohesionScore.toFixed(1)}%</div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Quantum Entanglement', val: metrics.entanglementLevel.toFixed(1), unit: '%', icon: Waves, col: 'sky' },
          { label: 'Temporal Stability', val: metrics.coherenceTime.toFixed(1), unit: 'μs', icon: Activity, col: 'indigo' },
          { label: 'System Cohesion', val: cohesionScore.toFixed(1), unit: 'NOMINAL', icon: Heart, col: 'emerald' },
          { label: 'Neural Entropy', val: (metrics.noiseLevel * 100).toFixed(2), unit: 'dB', icon: ZapOff, col: isVisualCritical ? 'red' : (metrics.noiseLevel > 0.1 ? 'amber' : 'sky') }
        ].map((m, i) => (
          <div key={i} className={`glass-panel rounded-3xl p-8 border-l-[6px] transition-all duration-500 hover:translate-y-[-4px] group ${m.col === 'red' ? 'border-l-red-500 animate-flash-red' : `border-l-${m.col}-500/30 hover:border-l-${m.col}-500`}`}>
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{m.label}</span>
              <m.icon size={20} className={`text-${m.col}-400 group-hover:scale-110 transition-transform opacity-50 group-hover:opacity-100`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white mono leading-none tracking-tighter">{m.val}</span>
              <span className="text-[10px] text-slate-600 font-black uppercase mono">{m.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <section className="glass-panel rounded-[3rem] p-10 overflow-hidden relative border-sky-500/10 min-h-[450px]">
            <header className="flex justify-between items-center mb-10">
                <h2 className="flex items-center gap-4 text-xl font-black text-sky-400 uppercase tracking-tighter italic">
                    <Cpu size={28} /> Neural Sub-Registers
                </h2>
                <div className="flex gap-3">
                    <div className="px-3 py-1 bg-sky-500/10 rounded-full border border-sky-500/20 text-[9px] font-black mono text-sky-400">STATUS: LIVE</div>
                </div>
            </header>
            <QuantumVisualizer qubits={qubits.slice(0, 8)} />
            <div className="scanline"></div>
          </section>
        </div>

        <div className="space-y-10">
          <section className="glass-panel rounded-[3rem] p-10 border-sky-500/10 bg-sky-950/5 flex flex-col h-full">
            <h3 className="flex items-center gap-4 text-xs font-black text-sky-500 mb-10 uppercase tracking-[0.4em] italic border-b border-white/5 pb-6">
                <BarChart3 size={20} /> System Diagnostics
            </h3>
            <div className="space-y-10 flex-1">
              {[
                { label: 'Timeline Divergence', val: 0.05, status: 'OPTIMAL' },
                { label: 'Sub-space Pressure', val: 72.4, status: 'WARNING' },
                { label: 'Neural Stability', val: 99.8, status: 'OPTIMAL' },
                { label: 'Moral Alignment', val: 100, status: 'OPTIMAL' }
              ].map((comp, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest">
                    <span className="flex items-center gap-2"> <Layers size={12} className="text-slate-700"/> {comp.label}</span>
                    <span className={getStatusColor(comp.status as HealthStatus)}>{comp.status}</span>
                  </div>
                  <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div className={`h-full ${getStatusBg(comp.status as HealthStatus)} transition-all duration-1000 shadow-[0_0_10px_currentColor]`} style={{ width: `${comp.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );

  const renderPropertiesView = () => (
    <div className="p-8 lg:p-20 max-w-7xl mx-auto space-y-20 animate-view-entry">
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-sky-500/10 pb-16 gap-10">
        <div className="space-y-6">
          <div className="flex items-center gap-6">
              <div className="p-5 bg-sky-500/10 rounded-3xl text-sky-400 shadow-2xl border border-sky-500/10"><BookOpen size={42} /></div>
              <div>
                  <h1 className="text-7xl font-black text-slate-100 uppercase tracking-tighter italic leading-none mb-3">Handbook</h1>
                  <p className="text-sky-500 text-xs font-black uppercase tracking-[0.8em] flex items-center gap-5">
                    คุณสมบัติของระบบควบคุม Quantum-Superscript
                  </p>
              </div>
          </div>
        </div>
        <div className="glass-panel px-8 py-5 rounded-[2rem] flex items-center gap-6 border-emerald-500/20 bg-emerald-500/5">
            <div className="text-center">
                <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Architecture</div>
                <div className="text-xl font-black text-emerald-400 mono">FRACTAL-CORE</div>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="text-center">
                <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Governance</div>
                <div className="text-xl font-black text-sky-400 mono">v4.2-LEGAL</div>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-16">
          {/* Core System Properties Section */}
          <div className="glass-panel p-10 sm:p-14 rounded-[3rem] border-sky-500/10 bg-sky-900/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                  <Workflow size={200} className="text-sky-400" />
              </div>
              <div className="relative z-10 space-y-10">
                  <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sky-400 text-[10px] font-black uppercase tracking-[0.4em]">
                          <Settings size={16} /> Technical Specifications / ข้อมูลทางเทคนิค
                      </div>
                      <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none italic">พลศาสตร์ของระบบควบคุม</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 hover:border-sky-500/20 transition-all space-y-4">
                          <div className="p-3 bg-sky-500/10 rounded-2xl w-fit text-sky-400"><Microscope size={24} /></div>
                          <h4 className="text-lg font-black text-sky-400 uppercase tracking-tighter italic">Stability (เสถียรภาพ)</h4>
                          <p className="text-sm text-slate-400 font-medium leading-relaxed">ระบบใช้การควบคุมแบบป้อนกลับควอนตัม (Quantum Feedback Control) เพื่อรักษาเสถียรภาพของไทม์ไลน์ แม้ในสภาวะที่มีสัญญาณรบกวนสูงถึง 15.2dB</p>
                      </div>
                      <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 hover:border-emerald-500/20 transition-all space-y-4">
                          <div className="p-3 bg-emerald-500/10 rounded-2xl w-fit text-emerald-400"><ZapIcon size={24} /></div>
                          <h4 className="text-lg font-black text-emerald-400 uppercase tracking-tighter italic">Responsiveness (การตอบสนอง)</h4>
                          <p className="text-sm text-slate-400 font-medium leading-relaxed">การประมวลผลผ่าน Neural Manifold ช่วยให้การสลับโหมดการทำงานเกิดขึ้นได้ในระดับนาโนวินาที (Sub-nanosecond switching latency)</p>
                      </div>
                  </div>
              </div>
          </div>

          <div className="glass-panel p-10 sm:p-14 rounded-[3rem] border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group border-t-4 border-t-emerald-500/30 shadow-2xl">
              <div className="absolute -top-10 -right-10 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity rotate-12">
                  <Globe size={300} className="text-emerald-400" />
              </div>
              <div className="relative z-10 space-y-10">
                  <div className="space-y-3">
                      <div className="flex items-center gap-3 text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em]">
                          <Heart size={16} /> Social Expansion Protocol (SEP)
                      </div>
                      <h2 className="text-5xl sm:text-6xl font-black text-white uppercase tracking-tighter leading-none italic">ส่งเสริมพฤติกรรมที่คุณอยากเห็นในโลก 🌎</h2>
                  </div>
                  
                  <div className="space-y-10">
                      <blockquote className="text-2xl sm:text-3xl text-slate-100 leading-snug font-serif italic border-l-8 border-emerald-500/30 pl-8 py-4 bg-white/5 rounded-r-2xl">
                         "การส่งเสริมสภาพแวดล้อมที่เป็นมิตรจะช่วยให้ชุมชนของคุณเติบโตได้ บรรยากาศที่ไม่เป็นมิตรเสี่ยงที่จะสูญเสียผู้ร่วมงานมากมาย"
                      </blockquote>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-slate-300 text-base sm:text-lg leading-relaxed">
                          <div className="space-y-4">
                              <div className="p-3 bg-emerald-500/10 rounded-2xl w-fit text-emerald-400"><Users size={24} /></div>
                              <h4 className="text-lg font-black text-emerald-400 uppercase tracking-tighter italic">Responsibility / หน้าที่</h4>
                              <p className="font-medium text-slate-400">ในฐานะผู้ดูแล คุณมีหน้าที่กำหนดแนวทางสำหรับชุมชนของคุณและบังคับใช้แนวทางเหล่านั้นตามกฎที่กำหนดไว้ในจรรยาบรรณ ซึ่งหมายความว่าคุณต้องพิจารณารายงานการละเมิดอย่างจริงจัง</p>
                          </div>
                          <div className="space-y-4">
                              <div className="p-3 bg-sky-500/10 rounded-2xl w-fit text-sky-400"><ShieldCheck size={24} /></div>
                              <h4 className="text-lg font-black text-sky-400 uppercase tracking-tighter italic">Standard / การรักษามาตรฐาน</h4>
                              <p className="font-medium text-slate-400">รายงานเกี่ยวกับพฤติกรรมที่ไม่ได้ละเมิดระเบียบปฏิบัติอย่างชัดเจนอาจบ่งชี้ว่ามีปัญหาเกิดขึ้น และคุณควรตรวจสอบและดำเนินการตามความเหมาะสม</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <div className="glass-panel rounded-[2.5rem] p-10 border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-transparent h-fit sticky top-12 shadow-2xl">
            <h3 className="text-xl font-black text-indigo-400 mb-10 uppercase tracking-tighter flex items-center gap-4 italic border-b border-white/5 pb-4">
              <Binary size={24} /> Identity Registry
            </h3>
            <div className="space-y-6">
              {[
                { label: "Core Version", value: "QS_4.2.1-PRO", icon: Terminal },
                { label: "Stabilization", value: "Verified High", icon: Lock },
                { label: "Identity Hash", value: "SHA-Q512", icon: Fingerprint },
                { label: "Encryption", value: "AES-QUBIT", icon: ShieldAlert }
              ].map((spec, i) => (
                <div key={i} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-4">
                    <spec.icon size={16} className="text-slate-600" />
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{spec.label}</span>
                  </div>
                  <span className="text-[11px] font-black text-slate-200 mono">{spec.value}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-10 py-5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[10px] font-black text-white uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-[0_10px_30px_rgba(79,70,229,0.3)]">
              <Share2 size={16} /> Update Registry
            </button>
          </div>

          <div className="glass-panel rounded-[2.5rem] p-8 border-red-500/10 bg-red-500/5 space-y-6">
            <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert size={14}/> Security Alerts
            </h4>
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[11px] text-red-300 font-medium italic leading-relaxed">
                Unauthorized access attempts detected from Sector 7G. Neural firewall integrity at 88%.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const handleLeap = async () => {
    setIsLoading(true);
    setLeapEffect(true);
    addSystemEvent(`INITIATING TEMPORAL JUMP: ${targetDate}`, 'warn');
    
    try {
      const status = `Stability: ${metrics.entanglementLevel.toFixed(1)}%, Noise: ${metrics.noiseLevel.toFixed(4)}`;
      const logText = await generateTemporalLog(targetDate, status);
      
      const newLog: TemporalLog = {
        id: Math.random().toString(),
        timestamp: new Date().toISOString(),
        destinationDate: targetDate,
        narrative: logText || "Data corrupted during sectoral displacement.",
        stability: metrics.entanglementLevel
      };
      
      setLogs(prev => [newLog, ...prev]);
      addSystemEvent(`ARRIVAL CONFIRMED: ERA ${targetDate}`, 'info');
    } catch (error) {
      addSystemEvent("TEMPORAL DISPLACEMENT COLLAPSE", "err");
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setLeapEffect(false);
      }, 2500);
    }
  };

  const renderSidebar = () => (
    <nav className="w-20 lg:w-28 bg-slate-950/90 border-r border-white/5 flex flex-col items-center py-10 gap-8 relative z-50">
      <div className="w-12 h-12 bg-sky-500 rounded-[1.5rem] flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.4)] mb-6 group cursor-pointer hover:rotate-12 transition-transform">
        <Orbit size={24} className="text-white animate-spin-slow" />
      </div>
      
      {[
        { id: ControlView.DASHBOARD, icon: LayoutDashboard, label: 'Deck' },
        { id: ControlView.TEMPORAL_LEAP, icon: Zap, label: 'Jump' },
        { id: ControlView.QUBIT_LAB, icon: Cpu, label: 'Lab' },
        { id: ControlView.STEERING, icon: Compass, label: 'Steer' },
        { id: ControlView.VOICE_COMMAND, icon: Mic, label: 'Ziggy' },
        { id: ControlView.PROPERTIES, icon: BookOpen, label: 'Handbook' }
      ].map((item) => (
        <button
          key={item.id}
          onClick={() => changeView(item.id)}
          className={`group relative p-4 rounded-xl transition-all duration-500 ${view === item.id ? 'bg-sky-500/10 text-sky-400 border border-sky-500/10' : 'text-slate-700 hover:text-slate-300 hover:bg-white/5 border border-transparent'}`}
        >
          <item.icon size={22} className={`transition-all duration-500 ${view === item.id ? 'scale-110 drop-shadow-[0_0_8px_currentColor]' : 'group-hover:scale-110'}`} />
          <div className="absolute left-full ml-5 px-3 py-1.5 bg-slate-900 text-sky-400 text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 border border-sky-500/20 whitespace-nowrap shadow-2xl z-[100] italic">
            {item.label}
          </div>
          {view === item.id && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sky-500 rounded-full shadow-[0_0_15px_rgba(56,189,248,1)]" />
          )}
        </button>
      ))}
      
      <div className="mt-auto space-y-6">
        <button onClick={handleLogout} className="text-slate-800 hover:text-red-500 transition-colors group relative p-4 hover:bg-red-500/5 rounded-xl">
          <LogOut size={20}/>
          <div className="absolute left-full ml-5 px-3 py-1.5 bg-slate-900 text-red-500 text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 border border-red-500/20 whitespace-nowrap shadow-2xl z-[100] italic">TERMINATE SESSION</div>
        </button>
      </div>
    </nav>
  );

  if (!isVerified) return renderLogin();

  return (
    <div className={`flex h-screen w-screen overflow-hidden transition-all duration-1000 ${isVisualCritical ? 'critical-gradient' : 'quantum-gradient'} text-slate-200 selection:bg-sky-500/30`}>
      {leapEffect && <div className="fixed inset-0 z-[100] bg-white/20 backdrop-blur-[100px] animate-pulse pointer-events-none" />}
      
      <div className="fixed bottom-10 right-10 flex flex-col gap-6 z-[1000]">
        {activeToasts.map((toast) => (
          <div key={toast.id} className={`glass-panel p-8 pr-12 rounded-[2.5rem] flex items-center gap-6 animate-in slide-in-from-right-12 fade-in duration-700 border-l-[10px] ${toast.status === 'CRITICAL' ? 'border-l-red-500 animate-shake' : 'border-l-amber-500'}`}>
            <div className={`p-4 rounded-xl ${toast.status === 'CRITICAL' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
               <BellRing size={22} className="animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none">Anomaly Detected</div>
              <div className="text-base font-black text-slate-100 mono tracking-tighter leading-none italic">{toast.title}</div>
            </div>
          </div>
        ))}
      </div>

      {renderSidebar()}
      
      <main className="flex-1 overflow-y-auto custom-scrollbar relative">
        {transitioning && (
            <div className="absolute inset-0 z-[100] bg-slate-950/80 backdrop-blur-3xl flex items-center justify-center animate-in fade-in duration-500">
                <div className="space-y-8 text-center">
                    <div className="w-16 h-1 bg-sky-500/10 rounded-full mx-auto relative overflow-hidden">
                        <div className="absolute inset-0 bg-sky-400 animate-[scanline_1s_linear_infinite]" />
                    </div>
                    <div className="text-sky-400 font-black mono text-[10px] animate-pulse tracking-[1.5em] uppercase italic">Recalibrating Neural Manifold...</div>
                </div>
            </div>
        )}
        
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className={`absolute rounded-full transition-all duration-[6s] ${isVisualCritical ? 'bg-red-500' : (i % 3 === 0 ? 'bg-emerald-400' : 'bg-sky-400')}`} 
                 style={{ 
                   width: Math.random() * 2 + 'px', 
                   height: Math.random() * 2 + 'px', 
                   left: Math.random() * 100 + '%', 
                   top: Math.random() * 100 + '%', 
                   animation: `pulse-soft ${2 + Math.random() * 8}s infinite`,
                   opacity: Math.random() * 0.4 + 0.1
                 }} />
          ))}
        </div>
        
        <div className={`relative z-10 h-full ${transitioning ? 'opacity-0 scale-[0.98] blur-lg' : 'opacity-100 scale-100 blur-0'} transition-all duration-700`}>
          {view === ControlView.DASHBOARD && renderDashboard()}
          {view === ControlView.PROPERTIES && renderPropertiesView()}
          {view === ControlView.STEERING && (
            <div className="p-12 lg:p-24 flex flex-col items-center justify-center h-full space-y-24 animate-view-entry">
                <div className="text-center space-y-6 max-w-3xl">
                    <h2 className="text-[8rem] font-black text-white uppercase tracking-tighter italic leading-none hologram-glow">Steering</h2>
                    <p className="text-slate-500 font-black text-xs uppercase tracking-[0.8em] leading-relaxed italic">Precision adjustment for target era vector locking</p>
                </div>
                <div className="relative group">
                    <div className="w-[450px] h-[450px] rounded-full glass-panel border-[10px] border-slate-900 shadow-[0_50px_120px_rgba(0,0,0,0.7)] flex flex-col items-center justify-center relative overflow-hidden group">
                        <div className="z-10 bg-slate-950/95 w-64 h-64 rounded-full border-[2px] border-sky-500/40 flex flex-col items-center justify-center shadow-[0_0_120px_rgba(56,189,248,0.15)] relative">
                           <span className="text-[8rem] font-black text-white tracking-tighter mono leading-none">{steeringValue}</span>
                        </div>
                        <div className="absolute inset-0 transition-transform duration-[1.2s] cubic-bezier(0.2, 1, 0.3, 1)" style={{ transform: `rotate(${(steeringValue * 2.6) - 130}deg)` }}>
                            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-4 h-28 bg-sky-400 rounded-full shadow-[0_0_30px_rgba(56,189,248,1)]" />
                        </div>
                    </div>
                    
                    <div className="absolute inset-[-100px] flex justify-between items-center px-12 pointer-events-none">
                       <button onClick={() => setSteeringValue(v => Math.max(0, v-5))} className="p-10 rounded-3xl glass-panel border-sky-500/20 hover:bg-sky-500/20 transition-all group pointer-events-auto active:scale-90">
                         <ChevronUp size={64} className="-rotate-90 text-sky-500" />
                       </button>
                       <button onClick={() => setSteeringValue(v => Math.min(100, v+5))} className="p-10 rounded-3xl glass-panel border-sky-500/20 hover:bg-sky-500/20 transition-all group pointer-events-auto active:scale-90">
                         <ChevronUp size={64} className="rotate-90 text-sky-500" />
                       </button>
                    </div>
                </div>
            </div>
          )}
          {view === ControlView.TEMPORAL_LEAP && (
            <div className="p-8 lg:p-20 flex flex-col items-center justify-start min-h-full max-w-7xl mx-auto space-y-20 animate-view-entry">
                <div className="text-center space-y-6 max-w-4xl">
                  <div className="px-4 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-full text-[10px] font-black text-sky-400 mono uppercase tracking-[0.6em] w-fit mx-auto mb-2">Sub-Space_Jump_Portal</div>
                  <h2 className="text-[6rem] sm:text-[9rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-indigo-600 uppercase tracking-tighter italic leading-none hologram-glow">Jump Gate</h2>
                  <p className="text-slate-500 text-lg sm:text-xl font-medium tracking-tight leading-relaxed max-w-2xl mx-auto italic font-serif">"Confirm temporal era coordinates. Deceleration manifold synchronized for sectoral displacement."</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
                  <div className="glass-panel p-10 sm:p-14 rounded-[3rem] space-y-10 border-sky-500/10 hover:border-sky-500/30 transition-all flex flex-col justify-center relative shadow-xl">
                    <div className="absolute top-8 right-10 opacity-10 font-black mono text-[9px] tracking-widest uppercase">Targeting_Unit_07</div>
                    <div className="space-y-4">
                        <div className="text-[11px] text-sky-500 font-black uppercase tracking-[0.4em] text-center mb-2 italic flex items-center justify-center gap-3"><Calendar size={14}/> Destination Era</div>
                        <input 
                            type="date" 
                            value={targetDate} 
                            onChange={(e) => setTargetDate(e.target.value)} 
                            className="bg-slate-950 border-b-4 border-sky-500/20 hover:border-sky-500/50 transition-colors rounded-2xl p-8 text-4xl sm:text-5xl font-black text-white outline-none w-full text-center mono shadow-2xl focus:scale-[1.02]" 
                        />
                    </div>
                    <button 
                        onClick={handleLeap} 
                        disabled={isLoading} 
                        className="w-full py-6 bg-sky-600 hover:bg-sky-500 transition-all rounded-[2rem] text-2xl sm:text-3xl font-black text-white shadow-xl flex items-center justify-center gap-6 group disabled:opacity-50 active:scale-[0.98]"
                    >
                      {isLoading ? <RefreshCw className="animate-spin" size={32} /> : <Zap size={32} className="group-hover:scale-125 transition-transform duration-500" />}
                      {isLoading ? 'SYNCING...' : 'INITIATE JUMP'}
                    </button>
                  </div>

                  <div className="glass-panel p-10 sm:p-14 rounded-[3rem] border-sky-500/10 flex flex-col h-[600px] shadow-xl overflow-hidden group">
                    <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                        <h3 className="text-xl font-black text-sky-400 uppercase tracking-tighter italic flex items-center gap-4">
                            <History size={24} /> Temporal Archive
                        </h3>
                        <div className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-slate-500 mono">{logs.length} RECORDS</div>
                    </div>

                    <div className="relative mb-8">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-600">
                            <Search size={18} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="SEARCH ARCHIVES..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-sky-400 outline-none focus:border-sky-500/40 transition-all placeholder:text-slate-800 mono tracking-widest"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-4">
                        {filteredLogs.map((log) => (
                            <div key={log.id} className="p-6 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all space-y-4 group/card relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover/card:opacity-20 transition-opacity">
                                    <Info size={14} className="text-sky-400" />
                                </div>
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="text-[10px] text-sky-500 font-black uppercase tracking-widest italic">Temporal Coordinate</div>
                                        <div className="text-xl font-black text-white mono">{log.destinationDate}</div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <div className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Stability</div>
                                        <div className="text-sm font-black text-emerald-400 mono">{log.stability.toFixed(1)}%</div>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-400 font-medium leading-relaxed italic line-clamp-3">"{log.narrative}"</p>
                                <div className="text-[9px] text-slate-700 mono uppercase tracking-widest pt-2">ENTRY_LOG_ID: {log.id.slice(0,8).toUpperCase()}</div>
                            </div>
                        ))}
                    </div>
                  </div>
                </div>
            </div>
          )}
          {view === ControlView.QUBIT_LAB && (
            <div className="p-10 lg:p-20 space-y-12 animate-view-entry h-full">
                <header className="flex items-center gap-10 border-b border-white/5 pb-10">
                    <div className="p-6 bg-sky-500/10 rounded-3xl text-sky-400 shadow-xl border border-sky-500/20"><Cpu size={48} /></div>
                    <h2 className="text-6xl font-black text-slate-100 uppercase tracking-tighter italic leading-none mb-2">Neural Lab</h2>
                </header>
                <div className="h-[calc(100%-180px)] overflow-y-auto custom-scrollbar pr-6 pb-24">
                    <QuantumVisualizer qubits={qubits} />
                </div>
            </div>
          )}
          {view === ControlView.VOICE_COMMAND && (
            <div className="p-12 lg:p-32 flex flex-col items-center justify-center h-full max-w-4xl mx-auto text-center space-y-24 animate-view-entry">
               <h2 className="text-[9rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-indigo-600 uppercase tracking-tighter italic leading-none hologram-glow">Ziggy</h2>
               <div className="relative group scale-105">
                  <button onClick={toggleVoiceSession} className={`relative z-10 w-72 h-72 rounded-[4rem] flex flex-col items-center justify-center border-[3px] transition-all duration-1000 ${isVoiceActive ? 'border-sky-400 bg-slate-950 shadow-[0_0_150px_rgba(56,189,248,0.4)]' : 'border-slate-800 bg-slate-900/40 hover:border-sky-500/50 active:scale-90'}`}>
                    {voiceStatus === 'CONNECTING' ? <RefreshCw className="animate-spin text-sky-400 w-24 h-24" /> : isVoiceActive ? <MicOff size={96} className="text-sky-300 drop-shadow-[0_0_15px_currentColor]" /> : <Mic size={96} className="text-slate-700" />}
                    <span className="text-[11px] font-black text-sky-400 mt-8 uppercase tracking-[0.5em] mono italic">{voiceStatus}</span>
                  </button>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
