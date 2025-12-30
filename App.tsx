
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Dna,
  BarChart3,
  Waves,
  ZapOff,
  Gauge,
  AlertTriangle,
  X,
  Server,
  Network,
  Orbit,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  Radio,
  ChevronDown,
  ChevronUp,
  Info,
  History,
  Thermometer,
  CloudLightning,
  RefreshCw,
  Box,
  Wind,
  Layers
} from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';
import { ControlView, QubitState, TemporalLog, QuantumMetrics, SystemHealth, HealthStatus } from './types';
import { QuantumVisualizer } from './components/QuantumVisualizer';
import { generateTemporalLog, analyzeQuantumStability, generateHealthSummary } from './services/geminiService';

const NOISE_THRESHOLD = 0.12;
const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

const App: React.FC = () => {
  const [view, setView] = useState<ControlView>(ControlView.DASHBOARD);
  const [qubits, setQubits] = useState<QubitState[]>([]);
  const [logs, setLogs] = useState<TemporalLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [targetDate, setTargetDate] = useState('1989-03-26');
  const [steeringValue, setSteeringValue] = useState(50);
  const [analysis, setAnalysis] = useState<{ divergenceRisk: number; reasoning: string; recommendedAction: string } | null>(null);
  const [dismissedAlert, setDismissedAlert] = useState(false);
  const [leapEffect, setLeapEffect] = useState(false);
  const [expandedHealth, setExpandedHealth] = useState<string | null>(null);
  const [componentDiagnostics, setComponentDiagnostics] = useState<Record<string, { text: string; loading: boolean, time?: string }>>({});
  const [systemEvents, setSystemEvents] = useState<{id: string, text: string, type: 'info' | 'warning' | 'error', time: string}[]>([]);
  
  // Voice Control State
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

  const systemHealth: SystemHealth = useMemo(() => {
    let core: HealthStatus = 'OPTIMAL';
    if (metrics.noiseLevel >= 0.12) core = 'CRITICAL';
    else if (metrics.noiseLevel >= 0.08) core = 'WARNING';
    let stabilizer: HealthStatus = 'OPTIMAL';
    if (steeringValue <= 10 || steeringValue >= 90) stabilizer = 'CRITICAL';
    else if (steeringValue <= 25 || steeringValue >= 75) stabilizer = 'WARNING';
    let link: HealthStatus = 'OPTIMAL';
    if (metrics.entanglementLevel <= 82) link = 'CRITICAL';
    else if (metrics.entanglementLevel <= 88) link = 'WARNING';
    return { quantumCore: core, temporalStabilizer: stabilizer, dataLink: link };
  }, [metrics, steeringValue]);

  const getStatusColor = (status: HealthStatus) => {
    switch (status) {
      case 'OPTIMAL': return 'text-emerald-400';
      case 'WARNING': return 'text-amber-400';
      case 'CRITICAL': return 'text-red-500';
      default: return 'text-slate-400';
    }
  };

  const getStatusBg = (status: HealthStatus) => {
    switch (status) {
      case 'OPTIMAL': return 'bg-emerald-500';
      case 'WARNING': return 'bg-amber-500';
      case 'CRITICAL': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  useEffect(() => {
    if (isCriticalNoise && !dismissedAlert) {
      addSystemEvent("Interference Spike: Quantum decoherence warning.", "error");
    }
  }, [isCriticalNoise]);

  useEffect(() => {
    const initialQubits = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      alpha: Math.sqrt(0.5),
      beta: Math.random(),
      phase: Math.random() * Math.PI * 2,
    }));
    setQubits(initialQubits);
    addSystemEvent("Neural Uplink Initialized.", "info");
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setQubits(prev => prev.map(q => ({
        ...q,
        phase: (q.phase + 0.1) % (Math.PI * 2),
        beta: Math.max(0, Math.min(1, q.beta + (Math.random() - 0.5) * 0.05))
      })));
      setMetrics(prev => ({
        entanglementLevel: Math.max(80, Math.min(99.9, prev.entanglementLevel + (Math.random() - 0.5) * 0.6)),
        coherenceTime: Math.max(100, Math.min(500, prev.coherenceTime + (Math.random() - 0.5) * 10)),
        gateOps: Math.floor(Math.max(50000, Math.min(250000, prev.gateOps + (Math.random() - 0.5) * 5000))),
        noiseLevel: Math.max(0.01, Math.min(0.20, prev.noiseLevel + (Math.random() - 0.5) * 0.015))
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addSystemEvent = (text: string, type: 'info' | 'warning' | 'error') => {
    const newEvent = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      type,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setSystemEvents(prev => [newEvent, ...prev].slice(0, 8));
  };

  const fetchComponentDiagnostic = async (id: string, label: string) => {
    setComponentDiagnostics(prev => ({ ...prev, [id]: { text: prev[id]?.text || '', loading: true } }));
    try {
      const summary = await generateHealthSummary(metrics, { [id]: systemHealth[id as keyof SystemHealth] });
      setComponentDiagnostics(prev => ({ 
        ...prev, 
        [id]: { text: summary, loading: false, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) } 
      }));
      addSystemEvent(`AI Diagnostic report for ${label} ready.`, "info");
    } catch (e) {
      setComponentDiagnostics(prev => ({ ...prev, [id]: { text: "Protocol breach. AI diagnostic failed.", loading: false } }));
    }
  };

  const recalibrateComponent = (id: string, label: string) => {
    addSystemEvent(`Recalibrating ${label}...`, "warning");
    setTimeout(() => {
      addSystemEvent(`${label} recalibration complete. Parameters reset to nominal.`, "info");
      if (id === 'quantumCore') setMetrics(p => ({ ...p, noiseLevel: 0.02 }));
      if (id === 'temporalStabilizer') setSteeringValue(50);
    }, 1500);
  };

  // Live API Audio Helpers
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  };

  const toggleVoiceSession = async () => {
    if (isVoiceActive) {
      if (sessionRef.current) sessionRef.current.close();
      setIsVoiceActive(false);
      setVoiceStatus('IDLE');
      addSystemEvent("Ziggy Link disconnected.", "warning");
      return;
    }

    setVoiceStatus('CONNECTING');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: INPUT_SAMPLE_RATE });
    const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: OUTPUT_SAMPLE_RATE });
    audioContextsRef.current = { input: inputCtx, output: outputCtx };

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
        systemInstruction: "You are Ziggy, the AI assistant for the Quantum-Superscript Control System. You help the traveler with temporal leap navigation, system status, and existential advice. Keep responses brief, high-tech, and helpful.",
      },
      callbacks: {
        onopen: () => {
          setVoiceStatus('ACTIVE');
          setIsVoiceActive(true);
          addSystemEvent("Ziggy Link online.", "info");
          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
            sessionPromise.then(session => {
              session.sendRealtimeInput({ media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } });
            });
          };
          source.connect(processor);
          processor.connect(inputCtx.destination);
        },
        onmessage: async (msg) => {
          const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioData) {
            const buffer = await decodeAudioData(decode(audioData), outputCtx, OUTPUT_SAMPLE_RATE, 1);
            const source = outputCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(outputCtx.destination);
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            audioSourcesRef.current.add(source);
            source.onended = () => audioSourcesRef.current.delete(source);
          }
        },
        onerror: () => setVoiceStatus('IDLE'),
        onclose: () => setVoiceStatus('IDLE'),
      }
    });
    sessionRef.current = await sessionPromise;
  };

  const handleLeap = async () => {
    setIsLoading(true);
    setLeapEffect(true);
    addSystemEvent(`Transition initiated to ${targetDate}.`, "info");
    setTimeout(async () => {
      try {
        const narrative = await generateTemporalLog(targetDate, `Stability ${steeringValue}%`);
        const newLog: TemporalLog = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toLocaleTimeString(),
          destinationDate: targetDate, narrative, stability: steeringValue
        };
        setLogs(prev => [newLog, ...prev].slice(0, 10));
        const analysisData = await analyzeQuantumStability(qubits.slice(0, 4));
        setAnalysis(analysisData);
        setView(ControlView.DASHBOARD);
        addSystemEvent(`Arrival complete. Destination reached.`, "info");
      } catch (error) {
        addSystemEvent("Leap anomaly. Redirecting to safe zone.", "error");
      } finally {
        setIsLoading(false);
        setLeapEffect(false);
      }
    }, 1500);
  };

  const renderHealthIndicator = (id: string, label: string, status: HealthStatus, Icon: any, subMetrics: {label: string, value: string, percent?: number, color?: string, icon?: any}[], alert?: string) => {
    const isExpanded = expandedHealth === id;
    const diag = componentDiagnostics[id];
    return (
      <div className={`mb-1 transition-all duration-300 rounded-xl overflow-hidden ${isExpanded ? 'bg-sky-500/10 ring-1 ring-sky-500/30 shadow-[0_4px_20px_rgba(56,189,248,0.1)]' : 'hover:bg-slate-800/40'}`}>
        <div 
          className="flex items-center justify-between cursor-pointer group p-3"
          onClick={() => setExpandedHealth(isExpanded ? null : id)}
        >
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${isExpanded ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-900 text-slate-500 group-hover:text-sky-400'} transition-all`}>
              <Icon size={14} />
            </div>
            <span className="text-[10px] text-slate-300 font-bold tracking-tight uppercase">{label}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${getStatusBg(status)} ${status !== 'OPTIMAL' ? 'animate-pulse shadow-[0_0_8px_currentColor]' : ''}`} />
            {isExpanded ? <ChevronUp size={12} className="text-slate-500" /> : <ChevronDown size={12} className="text-slate-600" />}
          </div>
        </div>
        
        {isExpanded && (
          <div className="px-4 pb-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-300">
            <div className="flex items-center justify-between border-b border-sky-500/10 pb-2">
              <span className={`text-[9px] mono font-black uppercase ${getStatusColor(status)}`}>{status} STATE</span>
              <div className="flex gap-2">
                 <button 
                  onClick={(e) => { e.stopPropagation(); fetchComponentDiagnostic(id, label); }}
                  className="hover:text-sky-400 transition-colors text-slate-600 flex items-center gap-1"
                  title="AI Component Analysis"
                 >
                  {diag?.loading ? <RefreshCw size={10} className="animate-spin text-sky-400" /> : <Sparkles size={10} />}
                  <span className="text-[7px] font-bold">DIAG</span>
                 </button>
                 <button 
                  onClick={(e) => { e.stopPropagation(); recalibrateComponent(id, label); }}
                  className="hover:text-amber-400 transition-colors text-slate-600 flex items-center gap-1"
                  title="Recalibrate"
                 >
                  <RefreshCw size={10} />
                  <span className="text-[7px] font-bold">RESET</span>
                 </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {subMetrics.map((m, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center text-[9px]">
                    <div className="flex items-center gap-2">
                       {m.icon && <m.icon size={11} className="text-slate-500" />}
                       <span className="text-slate-500 uppercase tracking-tighter font-bold">{m.label}</span>
                    </div>
                    <span className="text-slate-100 mono font-bold">{m.value}</span>
                  </div>
                  {m.percent !== undefined && (
                    <div className="h-1 w-full bg-slate-900/50 rounded-full overflow-hidden shadow-inner border border-slate-800/30">
                      <div 
                        className={`h-full transition-all duration-1000 ${m.color || 'bg-sky-500'}`} 
                        style={{ width: `${m.percent}%` }} 
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {alert && (
              <div className="p-2.5 rounded-lg bg-red-500/5 border border-red-500/20 flex gap-2.5 items-start shadow-inner">
                <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                <span className="text-[8.5px] text-red-200 leading-normal font-medium italic">"{alert}"</span>
              </div>
            )}

            {diag?.text && (
              <div className="p-3 rounded-lg bg-sky-950/40 border border-sky-500/20 text-[8.5px] text-sky-300 leading-relaxed italic animate-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between mb-1.5">
                   <div className="flex items-center gap-1.5 text-sky-500 font-black uppercase text-[7px] tracking-widest"><Sparkles size={8}/> AI_REPORT</div>
                   <span className="text-[7px] text-slate-600 mono">{diag.time}</span>
                </div>
                "{diag.text}"
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderSidebar = () => (
    <div className="w-20 md:w-64 h-full glass-panel border-r border-sky-500/20 flex flex-col p-4 z-50">
      <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => setView(ControlView.DASHBOARD)}>
        <Zap className="text-sky-400 w-8 h-8 animate-pulse" />
        <span className="hidden md:block font-black text-xl tracking-tighter text-sky-400 uppercase">QS_CTRL</span>
      </div>
      <nav className="flex-1 space-y-1 mb-6">
        {[
          { id: ControlView.DASHBOARD, icon: Activity, label: 'Control Deck' },
          { id: ControlView.TEMPORAL_LEAP, icon: Compass, label: 'Temporal Leap' },
          { id: ControlView.QUBIT_LAB, icon: Cpu, label: 'Qubit Lab' },
          { id: ControlView.STEERING, icon: Settings, label: 'Dimensional Steering' },
          { id: ControlView.VOICE_COMMAND, icon: Radio, label: 'Ziggy Voice Link' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
              view === item.id 
                ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-[0_0_15px_rgba(56,189,248,0.15)]' 
                : 'text-slate-500 hover:text-sky-200 hover:bg-slate-800/40'
            }`}
          >
            <item.icon size={18} />
            <span className="hidden md:block text-xs font-bold uppercase tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Enhanced Sidebar Health Display */}
      <div className="hidden md:block space-y-2 mb-6 p-2.5 rounded-2xl bg-slate-900/30 border border-sky-500/10">
        <div className="flex items-center justify-between px-2 mb-3">
          <h5 className="text-[10px] text-sky-500 font-black tracking-widest uppercase flex items-center gap-2">
            <Server size={11} /> Global Telemetry
          </h5>
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isCriticalNoise ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
          </div>
        </div>

        <div className="space-y-1">
          {renderHealthIndicator(
            'quantumCore', 
            'Quantum Core', 
            systemHealth.quantumCore, 
            Cpu, 
            [
              { label: 'Thermal_Lvl', value: '0.015 K', percent: 98, color: 'bg-emerald-500', icon: Thermometer },
              { label: 'Coherence', value: `${metrics.coherenceTime.toFixed(1)} μs`, percent: (metrics.coherenceTime / 500) * 100, color: 'bg-sky-500', icon: Activity },
              { label: 'Interference', value: `${(metrics.noiseLevel * 100).toFixed(1)} dB`, percent: (metrics.noiseLevel / 0.20) * 100, color: isCriticalNoise ? 'bg-red-500' : 'bg-amber-500', icon: ZapOff }
            ],
            systemHealth.quantumCore !== 'OPTIMAL' ? 'Photon yield fluctuation detected in main sub-register.' : undefined
          )}
          {renderHealthIndicator(
            'temporalStabilizer', 
            'Leap Manifold', 
            systemHealth.temporalStabilizer, 
            Orbit, 
            [
              { label: 'Rigidity', value: `${steeringValue}%`, percent: steeringValue, color: 'bg-indigo-500', icon: Gauge },
              { label: 'Tachyonic_Drift', value: '0.04ms', percent: 84, color: 'bg-sky-500', icon: Wind },
              { label: 'Flux_Density', value: '1.42 T', percent: 72, color: 'bg-indigo-400', icon: CloudLightning }
            ],
            systemHealth.temporalStabilizer !== 'OPTIMAL' ? 'High manifold pressure. Divergence risk increasing.' : undefined
          )}
          {renderHealthIndicator(
            'dataLink', 
            'Continuum Hub', 
            systemHealth.dataLink, 
            Network, 
            [
              { label: 'Entanglement', value: `${metrics.entanglementLevel.toFixed(1)}%`, percent: metrics.entanglementLevel, color: 'bg-emerald-500', icon: Waves },
              { label: 'Throughput', value: '4.8 TB/s', percent: 78, color: 'bg-sky-500', icon: BarChart3 },
              { label: 'Synch_Lag', value: '12ms', percent: 92, color: 'bg-emerald-400', icon: Clock }
            ],
            systemHealth.dataLink !== 'OPTIMAL' ? 'Sub-space packet collision. Retrying bridge handshake.' : undefined
          )}
        </div>

        {/* Neural Ticker Section */}
        <div className="mt-4 px-2 border-t border-slate-800/60 pt-3">
           <div className="flex items-center justify-between text-[9px] text-slate-500 font-black uppercase mb-2.5">
             <div className="flex items-center gap-1.5"><History size={11} /> Neural Ticker</div>
             <span className="text-[7px] text-slate-700 font-black mono bg-slate-800/50 px-1.5 py-0.5 rounded">REAL_TIME</span>
           </div>
           <div className="space-y-2.5 max-h-40 overflow-y-auto custom-scrollbar pr-1.5">
             {systemEvents.length === 0 ? (
               <div className="text-[8px] text-slate-700 italic text-center py-4 uppercase tracking-widest">Scanning subspace frequencies...</div>
             ) : (
               systemEvents.map(event => (
                 <div key={event.id} className="flex gap-2.5 items-start py-1 transition-all group border-l border-slate-800 pl-2 hover:border-sky-500/40">
                    <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 shadow-sm ${event.type === 'error' ? 'bg-red-500 shadow-red-500/50' : event.type === 'warning' ? 'bg-amber-500 shadow-amber-500/50' : 'bg-sky-500 group-hover:bg-white shadow-sky-500/50'}`} />
                    <div className="flex flex-col min-w-0">
                      <span className={`text-[8px] leading-snug font-medium break-words ${event.type === 'error' ? 'text-red-400' : event.type === 'warning' ? 'text-amber-300' : 'text-slate-400 group-hover:text-slate-200'}`}>{event.text}</span>
                      <span className="text-[6.5px] text-slate-600 mono mt-0.5 tracking-tighter uppercase font-bold">{event.time} // SYS_EVENT</span>
                    </div>
                 </div>
               ))
             )}
           </div>
        </div>
      </div>

      <div className="mt-auto p-4 glass-panel rounded-2xl border-sky-900/40 bg-sky-950/10 flex flex-col gap-2.5 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-black tracking-widest uppercase">Encryption</span>
          <ShieldAlert size={14} className="text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]" />
        </div>
        <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
           <div className="h-full bg-emerald-500/50 w-[85%] animate-pulse" />
        </div>
        <p className="text-[8px] text-slate-600 mono text-right font-black">AES-QUBIT: 2048_BIT_SECURE</p>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="p-6 space-y-6 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-100 uppercase">Control Deck</h1>
          <div className="flex items-center gap-3">
            <p className="text-slate-400 text-sm font-medium">Operation Status:</p>
            <span className={`flex items-center gap-1.5 text-sm font-black uppercase tracking-tight ${isCriticalNoise ? 'text-red-400' : 'text-emerald-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isCriticalNoise ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></div>
              {isCriticalNoise ? 'Interference Peak' : 'Optimal Coherence'}
            </span>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          {isVoiceActive && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 animate-pulse text-[10px] font-black uppercase tracking-widest">
              <Volume2 size={12}/> Ziggy Connected
            </div>
          )}
          <div className="glass-panel px-4 py-2 rounded-xl text-xs flex items-center gap-3 border-sky-500/30">
            <Clock size={16} className="text-sky-400" />
            <span className="mono font-bold text-slate-200">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </header>

      {isCriticalNoise && !dismissedAlert && (
        <div className="animate-in slide-in-from-top-4 bg-red-600/10 border border-red-500/40 rounded-3xl p-6 flex items-center justify-between group shadow-[0_0_40px_rgba(239,68,68,0.15)] ring-1 ring-red-500/20">
          <div className="flex items-center gap-5">
            <div className="bg-red-500 p-3 rounded-2xl animate-shake text-white shadow-lg"><AlertTriangle size={24} /></div>
            <div>
              <h4 className="text-red-400 font-black text-lg tracking-tighter uppercase">Signal Decoherence Imminent</h4>
              <p className="text-sm text-red-300/70 leading-relaxed font-medium">Inter-qubit noise thresholds breached. Stabilization required to prevent manifold collapse.</p>
            </div>
          </div>
          <button onClick={() => setDismissedAlert(true)} className="p-3 hover:bg-red-500/20 rounded-full transition-all text-red-400"><X size={24} /></button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Entanglement', val: metrics.entanglementLevel.toFixed(1), unit: '%', icon: Waves, col: 'emerald' },
          { label: 'Coherence', val: metrics.coherenceTime.toFixed(1), unit: 'μs', icon: Activity, col: 'sky' },
          { label: 'Gate Operations', val: (metrics.gateOps / 1000).toFixed(1), unit: 'k/s', icon: Gauge, col: 'indigo' },
          { label: 'Noise Density', val: (metrics.noiseLevel * 100).toFixed(2), unit: 'dB', icon: ZapOff, col: isCriticalNoise ? 'red' : 'amber' }
        ].map((m, i) => (
          <div key={i} className={`glass-panel rounded-2xl p-5 border-l-4 transition-all duration-500 hover:scale-[1.02] ${m.col === 'red' ? 'border-l-red-500 animate-flash-red' : `border-l-${m.col}-500/40`}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{m.label}</span>
              <div className={`p-1.5 rounded-lg bg-${m.col}-500/10`}>
                <m.icon size={16} className={`text-${m.col}-400`} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white mono tracking-tighter">{m.val}</span>
              <span className={`text-xs font-bold text-${m.col}-400/80 uppercase`}>{m.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <section className="glass-panel rounded-3xl p-8 overflow-hidden relative group border-sky-500/10 shadow-xl">
            <div className="flex items-center justify-between mb-8">
               <h2 className="flex items-center gap-3 text-xl font-bold text-sky-300 uppercase tracking-tighter"><Cpu size={24} className="text-sky-500" /> Qubit Logic Matrix</h2>
               <div className="flex items-center gap-2 text-[10px] text-slate-500 mono bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></div> REGISTER_A // ACTIVE
               </div>
            </div>
            <QuantumVisualizer qubits={qubits.slice(0, 8)} />
          </section>
          
          <section className="glass-panel rounded-3xl p-8 border-sky-500/10">
            <h2 className="flex items-center gap-3 text-xl font-bold text-sky-300 mb-8 uppercase tracking-tighter"><Terminal size={24} className="text-sky-500" /> Mission Chronology</h2>
            <div className="space-y-5 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-600 space-y-3">
                   <Compass size={40} className="animate-pulse opacity-20" />
                   <p className="italic text-sm">Awaiting first leap entry...</p>
                </div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="relative border-l-2 border-sky-500/20 pl-6 py-4 hover:bg-sky-500/5 transition-all duration-300 rounded-r-2xl group">
                    <div className="absolute left-[-9px] top-5 w-4 h-4 rounded-full bg-slate-950 border-2 border-sky-500 group-hover:scale-125 transition-transform" />
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-sky-400 mono tracking-widest">{log.destinationDate}</span>
                        <div className="h-0.5 w-8 bg-sky-500/20 rounded-full" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{log.stability}% STABILITY</span>
                      </div>
                      <span className="text-[10px] text-slate-600 font-medium uppercase mono">{log.timestamp}</span>
                    </div>
                    <p className="text-[15px] text-slate-300 leading-relaxed italic font-medium opacity-90 group-hover:opacity-100 transition-opacity">"{log.narrative}"</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-8 bg-slate-900/40 border-sky-500/10">
            <h3 className="flex items-center gap-3 text-lg font-black text-sky-400 mb-8 uppercase tracking-tighter"><BarChart3 size={20} className="text-sky-500" /> Performance Diagnostics</h3>
            <div className="space-y-6">
              {[
                { label: 'Quantum Core', status: systemHealth.quantumCore, val: 98 },
                { label: 'Leap Manifold', status: systemHealth.temporalStabilizer, val: 82 },
                { label: 'Continuum Link', status: systemHealth.dataLink, val: 94 }
              ].map((comp, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{comp.label}</span>
                    <span className={`text-[10px] mono px-2 py-0.5 rounded-full border ${getStatusColor(comp.status)} border-current bg-current/5 font-black`}>{comp.status}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                    <div className={`h-full transition-all duration-1000 ${getStatusBg(comp.status)}`} style={{ width: `${comp.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-8 bg-gradient-to-br from-sky-600/10 to-transparent border-sky-500/20 relative overflow-hidden group">
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-sky-500/5 rounded-full blur-3xl group-hover:bg-sky-500/10 transition-all" />
            <h3 className="text-lg font-black text-sky-400 mb-6 flex items-center gap-3 uppercase tracking-tighter"><Sparkles size={20} className="text-sky-400" /> Express Leap</h3>
            <div className="space-y-4 relative z-10">
              <div className="space-y-2">
                 <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Destination Vector</label>
                 <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full bg-slate-900/80 border border-sky-500/20 rounded-xl p-4 text-sm font-bold text-sky-300 outline-none focus:border-sky-400/50 focus:ring-1 focus:ring-sky-400/20 transition-all" />
              </div>
              <button 
                onClick={handleLeap} 
                disabled={isLoading} 
                className="w-full py-4 bg-sky-600 hover:bg-sky-500 active:scale-95 transition-all rounded-2xl text-white font-black uppercase tracking-tighter flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(56,189,248,0.2)] disabled:opacity-50 disabled:scale-100"
              >
                {isLoading ? <RefreshCw className="animate-spin w-5 h-5" /> : <><Zap size={20} /> Initiate Leap</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVoiceView = () => (
    <div className="p-12 flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center space-y-12 animate-in zoom-in-95">
      <div className="space-y-4">
        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-sky-400 uppercase tracking-tighter">Ziggy Voice Link</h2>
        <div className="flex items-center justify-center gap-2">
           <div className="h-0.5 w-12 bg-sky-500/30 rounded-full" />
           <p className="text-slate-400 font-medium italic">"Ziggy, provide system status on component core registers."</p>
           <div className="h-0.5 w-12 bg-sky-500/30 rounded-full" />
        </div>
      </div>

      <div className="relative group">
        <div className={`absolute inset-0 rounded-full blur-[80px] transition-all duration-1000 ${isVoiceActive ? 'bg-sky-500/30 scale-150' : 'bg-slate-800/10 scale-100'}`} />
        <button 
          onClick={toggleVoiceSession}
          className={`relative z-10 w-56 h-56 rounded-full flex flex-col items-center justify-center border-2 transition-all duration-500 ${isVoiceActive ? 'border-sky-400 bg-slate-950 shadow-[0_0_60px_rgba(56,189,248,0.4)] scale-110' : 'border-slate-800 bg-slate-900 hover:border-sky-500/40 shadow-none'}`}
        >
          {voiceStatus === 'CONNECTING' ? (
             <RefreshCw className="text-sky-400 w-16 h-16 animate-spin" />
          ) : isVoiceActive ? (
            <>
              <div className="flex gap-1.5 items-center h-10 mb-4">
                {[1,2,3,4,5,6,7].map(i => <div key={i} className="w-1.5 bg-sky-400 rounded-full animate-[pulse-soft_0.8s_infinite]" style={{ height: `${30 + Math.random() * 60}%`, animationDelay: `${i * 0.12}s` }} />)}
              </div>
              <MicOff size={48} className="text-sky-300" />
              <span className="text-[10px] font-black text-sky-400 mt-4 uppercase tracking-[0.3em]">Disconnect</span>
            </>
          ) : (
            <>
              <Mic size={56} className="text-slate-600 group-hover:text-sky-400 transition-colors" />
              <span className="text-[10px] font-black text-slate-500 group-hover:text-sky-400 mt-4 uppercase tracking-[0.3em]">Activate Ziggy</span>
            </>
          )}
        </button>
      </div>

      <div className="w-full space-y-6 bg-slate-900/30 p-8 rounded-3xl border border-sky-500/5">
        <div className="flex items-center justify-between text-[11px] font-black tracking-widest uppercase border-b border-slate-800/50 pb-3 text-slate-500">
          <span>Signal Status</span>
          <span className={isVoiceActive ? 'text-sky-400' : 'text-slate-700'}>{voiceStatus}</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed font-medium">
          The Ziggy Interface provides direct voice access to our core sub-processors. Use it for complex system analysis or to help guide your leap destinations.
        </p>
      </div>
    </div>
  );

  return (
    <div className={`flex h-screen w-screen overflow-hidden transition-all duration-1000 ${isCriticalNoise ? 'critical-gradient' : 'quantum-gradient'} text-slate-200 font-sans selection:bg-sky-500/30`}>
      {leapEffect && <div className="fixed inset-0 z-[100] bg-white animate-pulse pointer-events-none" />}
      {renderSidebar()}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className={`absolute rounded-full transition-all duration-1000 ${isCriticalNoise ? 'bg-red-500' : 'bg-sky-500'}`} style={{ width: Math.random() * 4 + 'px', height: Math.random() * 4 + 'px', left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', filter: 'blur(1px)', animation: `pulse-soft ${2 + Math.random() * 4}s infinite ease-in-out` }} />
          ))}
        </div>
        <div className={`relative z-10 h-full transition-transform duration-500 ${isCriticalNoise && !dismissedAlert ? 'animate-shake' : ''}`}>
          {view === ControlView.DASHBOARD && renderDashboard()}
          {view === ControlView.TEMPORAL_LEAP && <div className="p-8 max-w-5xl mx-auto space-y-12 h-full flex flex-col justify-center animate-in zoom-in-95">
              <div className="text-center space-y-3">
                <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 uppercase tracking-tighter">Temporal Control</h2>
                <p className="text-slate-400 text-lg font-medium">Configure sub-register coordinates and dimensional stability.</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="glass-panel p-10 rounded-[3rem] space-y-10 border-sky-500/20 shadow-2xl">
                  <div className="flex items-center gap-6 p-6 bg-sky-500/10 border border-sky-500/20 rounded-3xl">
                    <Compass size={56} className="text-sky-400" />
                    <div className="flex-1">
                      <div className="text-[11px] text-sky-500 font-black tracking-[0.2em] uppercase mb-1">Jump Vector</div>
                      <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="bg-transparent text-3xl font-black text-white outline-none w-full tracking-tighter" />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex justify-between items-end"><span className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Stability Dampening</span><span className="text-sky-400 font-black text-2xl mono">{steeringValue}%</span></div>
                    <input type="range" min="0" max="100" value={steeringValue} onChange={(e) => setSteeringValue(parseInt(e.target.value))} className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-sky-500" />
                  </div>
                  <button onClick={handleLeap} disabled={isLoading} className="group w-full py-6 bg-gradient-to-r from-sky-600 to-indigo-600 rounded-3xl text-2xl font-black text-white hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-4 uppercase tracking-tighter disabled:opacity-50">
                    {isLoading ? <><RefreshCw className="animate-spin w-6 h-6" /> Transitioning...</> : <><Zap size={24} /> Deploy Jump Gate</>}
                  </button>
                </div>
                <div className="glass-panel p-10 rounded-[3rem] flex flex-col items-center justify-center relative overflow-hidden border-sky-500/20 bg-slate-900/30">
                  <div className="w-64 h-64 rounded-full border-[10px] border-dashed border-sky-500/10 flex items-center justify-center animate-[spin_40s_linear_infinite] relative">
                    <Zap size={96} className="text-sky-400 drop-shadow-[0_0_20px_rgba(56,189,248,0.8)] animate-pulse" />
                  </div>
                  <div className="mt-12 text-center space-y-2">
                    <h4 className="text-2xl font-black text-sky-100 uppercase tracking-widest">Manifold Core</h4>
                    <p className="text-[10px] text-sky-500 font-bold uppercase tracking-[0.4em] mono">STATUS: SYNCHRONIZED</p>
                  </div>
                </div>
              </div>
            </div>}
          {view === ControlView.QUBIT_LAB && <div className="p-8 space-y-10 animate-in slide-in-from-bottom-4">
             <div className="flex items-center justify-between">
                <h2 className="text-4xl font-black text-slate-100 uppercase tracking-tighter">Register Lab</h2>
                <button className="px-6 py-2 rounded-xl border border-sky-500/30 bg-sky-500/5 text-sky-400 text-xs font-black uppercase tracking-widest hover:bg-sky-500/10 transition-all">Manual Recalibration</button>
             </div>
             <div className="glass-panel p-10 rounded-[3rem] border-sky-500/10 shadow-2xl">
                <QuantumVisualizer qubits={qubits} />
             </div>
          </div>}
          {view === ControlView.STEERING && <div className="p-12 flex flex-col items-center space-y-16 h-full justify-center animate-in fade-in zoom-in-95">
             <div className="text-center space-y-2">
                <h2 className="text-4xl font-black text-sky-400 uppercase tracking-tighter italic">Dimensional Steering</h2>
                <p className="text-slate-500 font-medium">Calibrate manifold curvature to prevent temporal drift.</p>
             </div>
             <div className="relative w-96 h-96 flex items-center justify-center group">
                <div className="absolute inset-0 rounded-full border-[16px] border-slate-900 flex items-center justify-center shadow-2xl">
                   <div className="w-[92%] h-[92%] rounded-full border-4 border-sky-500/20 animate-pulse" />
                </div>
                <div className="absolute w-3 h-48 bg-gradient-to-t from-sky-400 to-indigo-500 origin-bottom transition-all duration-300 rounded-full shadow-[0_0_20px_rgba(56,189,248,0.6)]" style={{ transform: `rotate(${(steeringValue * 3.6) - 180}deg)`, bottom: '50%' }} />
                <div className="z-10 bg-slate-950 w-32 h-32 rounded-full border-[6px] border-sky-400/80 flex flex-col items-center justify-center shadow-[0_0_60px_rgba(56,189,248,0.2)]">
                   <span className="text-4xl font-black text-white tracking-tighter mono">{steeringValue}</span>
                   <span className="text-[11px] text-sky-400 font-black uppercase tracking-widest">Stability</span>
                </div>
             </div>
          </div>}
          {view === ControlView.VOICE_COMMAND && renderVoiceView()}
        </div>
      </main>
    </div>
  );
};

export default App;
