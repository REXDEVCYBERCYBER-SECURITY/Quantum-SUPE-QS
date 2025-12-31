import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Activity, 
  Cpu, 
  Zap, 
  Terminal, 
  Settings, 
  Clock, 
  Compass, 
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
  VolumeX,
  Radio,
  ChevronDown,
  ChevronUp,
  Info,
  History,
  Thermometer,
  CloudLightning,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  FastForward,
  Navigation,
  FileText,
  Waves,
  ZapOff,
  BarChart3,
  BellRing,
  ScrollText,
  Scale,
  Atom,
  Binary,
  Layers,
  Fingerprint,
  Lock,
  Eye,
  Workflow,
  Globe,
  Heart,
  Users
} from 'lucide-react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { ControlView, QubitState, TemporalLog, QuantumMetrics, SystemHealth, HealthStatus } from './types';
import { QuantumVisualizer } from './components/QuantumVisualizer';
import { generateTemporalLog, analyzeQuantumStability, generateHealthSummary } from './services/geminiService';

const NOISE_THRESHOLD = 0.12;
const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

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
  const [systemEvents, setSystemEvents] = useState<{id: string, text: string, type: 'info' | 'warning' | 'error', time: string}[]>([]);
  const [computeSpeed, setComputeSpeed] = useState(1.4);
  const [isMuted, setIsMuted] = useState(false);
  const [activeToasts, setActiveToasts] = useState<{id: string, title: string, status: HealthStatus}[]>([]);
  
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

  const prevHealthRef = useRef<SystemHealth>(systemHealth);

  const playNotificationSound = (severity: 'WARNING' | 'CRITICAL') => {
    if (isMuted) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.2, ctx.currentTime);
      masterGain.connect(ctx.destination);

      const playTone = (freq: number, type: OscillatorType, delay: number, duration: number) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        g.gain.setValueAtTime(0, ctx.currentTime + delay);
        g.gain.linearRampToValueAtTime(0.15, ctx.currentTime + delay + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration);
      };

      if (severity === 'CRITICAL') {
        playTone(880, 'sawtooth', 0, 0.5);
        playTone(1320, 'square', 0.1, 0.4);
        playTone(1760, 'sawtooth', 0.2, 0.3);
      } else {
        playTone(440, 'sine', 0, 0.6);
        playTone(659.25, 'sine', 0.15, 0.4);
      }
    } catch (e) {
      console.warn("Audio Context blocked or unsupported");
    }
  };

  const addToast = (title: string, status: HealthStatus) => {
    const id = Math.random().toString(36).substring(2, 9);
    setActiveToasts(prev => [...prev, { id, title, status }]);
    setTimeout(() => {
      setActiveToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  useEffect(() => {
    const current = systemHealth;
    const prev = prevHealthRef.current;
    const healthMap: Record<HealthStatus, number> = { 'OPTIMAL': 0, 'WARNING': 1, 'CRITICAL': 2 };

    const checkRegression = (name: string, p: HealthStatus, c: HealthStatus) => {
      if (healthMap[c] > healthMap[p]) {
        addToast(`${name} status degraded to ${c}`, c);
        return true;
      }
      return false;
    };

    const coreReg = checkRegression("Quantum Core", prev.quantumCore, current.quantumCore);
    const stabReg = checkRegression("Temporal Stabilizer", prev.temporalStabilizer, current.temporalStabilizer);
    const linkReg = checkRegression("Data Link", prev.dataLink, current.dataLink);

    if (coreReg || stabReg || linkReg) {
      const worstState = (current.quantumCore === 'CRITICAL' || current.temporalStabilizer === 'CRITICAL' || current.dataLink === 'CRITICAL') 
        ? 'CRITICAL' 
        : 'WARNING';
      playNotificationSound(worstState);
    }

    prevHealthRef.current = current;
  }, [systemHealth]);

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
    addSystemEvent("Fortify Scan: SECURE.", "info");
    addSystemEvent("EthicalCheck: COMPLIANT.", "info");
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
      setComputeSpeed(prev => Math.max(1.0, Math.min(2.5, prev + (Math.random() - 0.5) * 0.1)));
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
    setSystemEvents(prev => [newEvent, ...prev].slice(0, 10));
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: INPUT_SAMPLE_RATE });
    const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: OUTPUT_SAMPLE_RATE });
    audioContextsRef.current = { input: inputCtx, output: outputCtx };

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
        systemInstruction: "You are Ziggy, the AI assistant for the Quantum-Superscript Control System. You provide status on quantum power steering, qubit stability, and temporal leap logistics.",
      },
      callbacks: {
        onopen: () => {
          setVoiceStatus('ACTIVE');
          setIsVoiceActive(true);
          addSystemEvent("Ziggy Link active.", "info");
          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
            
            sessionPromise.then(session => {
              session.sendRealtimeInput({ 
                media: { 
                  data: encode(new Uint8Array(int16.buffer)), 
                  mimeType: 'audio/pcm;rate=16000' 
                } 
              });
            });
          };
          source.connect(processor);
          processor.connect(inputCtx.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64EncodedAudioString) {
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
            const audioBuffer = await decodeAudioData(
              decode(base64EncodedAudioString),
              outputCtx,
              24000,
              1,
            );
            const source = outputCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputCtx.destination);
            source.addEventListener('ended', () => {
              audioSourcesRef.current.delete(source);
            });

            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration;
            audioSourcesRef.current.add(source);
          }

          const interrupted = message.serverContent?.interrupted;
          if (interrupted) {
            for (const source of audioSourcesRef.current.values()) {
              source.stop();
              audioSourcesRef.current.delete(source);
            }
            nextStartTimeRef.current = 0;
          }
        },
        onerror: (e) => {
          console.error('Live API Error:', e);
          setVoiceStatus('IDLE');
        },
        onclose: () => {
          setVoiceStatus('IDLE');
          setIsVoiceActive(false);
        },
      }
    });
    sessionRef.current = await sessionPromise;
  };

  const handleLeap = async () => {
    setIsLoading(true);
    setLeapEffect(true);
    addSystemEvent(`Transition initiated. Power Steering Stability: ${steeringValue}%`, "info");
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
        addSystemEvent(`Jump successful. Coordinates: ${targetDate}.`, "info");
      } catch (error) {
        addSystemEvent("Jump anomaly. Stabilizers engaged.", "error");
      } finally {
        setIsLoading(false);
        setLeapEffect(false);
      }
    }, 1500);
  };

  const renderHealthIndicator = (id: string, label: string, status: HealthStatus, Icon: any, subMetrics: {label: string, value: string, percent?: number, color?: string, icon?: any}[], alert?: string) => {
    const isExpanded = expandedHealth === id;
    return (
      <div className={`mb-1 transition-all duration-300 rounded-xl overflow-hidden ${isExpanded ? 'bg-sky-500/10 ring-1 ring-sky-500/30' : 'hover:bg-slate-800/40'}`}>
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
          <div className="px-4 pb-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-300">
            <div className="grid grid-cols-1 gap-2">
              {subMetrics.map((m, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center text-[9px]">
                    <div className="flex items-center gap-2">
                       {m.icon && <m.icon size={10} className="text-slate-500" />}
                       <span className="text-slate-500 uppercase tracking-tighter font-bold">{m.label}</span>
                    </div>
                    <span className="text-slate-100 mono font-bold">{m.value}</span>
                  </div>
                  {m.percent !== undefined && (
                    <div className="h-0.5 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-1000 ${m.color || 'bg-sky-500'}`} style={{ width: `${m.percent}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
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
          { id: ControlView.TEMPORAL_LEAP, icon: Compass, label: 'Temporal Jump' },
          { id: ControlView.QUBIT_LAB, icon: Cpu, label: 'Qubit Lab' },
          { id: ControlView.STEERING, icon: Navigation, label: 'Power Steering' },
          { id: ControlView.VOICE_COMMAND, icon: Radio, label: 'Ziggy Link' },
          { id: ControlView.GOVERNANCE, icon: Scale, label: 'System Info & Mandate' },
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

      <div className="hidden md:block mb-4 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
         <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest flex items-center gap-1.5"><ShieldCheck size={12}/> Neural Shield</span>
            <span className="text-[8px] mono text-emerald-600">v4.0_SEC</span>
         </div>
         <div className="space-y-1 text-[8px] text-slate-500 mono">
            <div className="flex justify-between"><span>Fortify_SAST</span><span className="text-emerald-500">SECURE</span></div>
            <div className="flex justify-between"><span>EthicalCheck</span><span className="text-emerald-500">COMPLIANT</span></div>
         </div>
      </div>

      <div className="hidden md:block space-y-2 mb-6 p-2 rounded-2xl bg-slate-900/30 border border-sky-500/10">
        <h5 className="text-[10px] text-sky-500 font-black tracking-widest uppercase flex items-center gap-2 px-2 py-1">
          <Server size={11} /> Hardware State
        </h5>
        <div className="space-y-0.5">
          {renderHealthIndicator('quantumCore', 'Quantum Core', systemHealth.quantumCore, Cpu, [{ label: 'Temp', value: '0.012 K', percent: 98, color: 'bg-emerald-500', icon: Thermometer }])}
          {renderHealthIndicator('temporalStabilizer', 'Leap Manifold', systemHealth.temporalStabilizer, Orbit, [{ label: 'Rigidity', value: `${steeringValue}%`, percent: steeringValue, color: 'bg-sky-500', icon: Gauge }])}
        </div>
      </div>

      <div className="mt-auto p-4 glass-panel rounded-2xl border-sky-900/40 bg-sky-950/10 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-black tracking-widest uppercase">Neural Audio</span>
          <button 
            onClick={() => setIsMuted(!isMuted)} 
            className={`p-1 rounded-lg transition-colors ${isMuted ? 'text-red-400 bg-red-400/10' : 'text-sky-400 bg-sky-400/10'}`}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>
      </div>
    </div>
  );

  const renderGovernanceView = () => (
    <div className="p-8 max-w-7xl mx-auto space-y-16 animate-in fade-in duration-700">
      {/* 1. คุณสมบัติของระบบควบคุม (System Properties) Section - MOVED TO TOP */}
      <section className="space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-sky-500/20 pb-8 gap-4">
          <div>
            <h1 className="text-6xl font-black text-slate-100 uppercase tracking-tighter italic mb-2">คุณสมบัติของระบบควบคุม</h1>
            <p className="text-sky-500 text-sm font-black uppercase tracking-[0.4em] flex items-center gap-3">
              <Layers size={16} /> Quantum-Superscript Architecture & AI Governance
            </p>
          </div>
          <div className="glass-panel px-6 py-3 rounded-2xl border-sky-500/30 bg-sky-500/5 flex items-center gap-6">
            <div className="text-center">
              <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Model Vers.</div>
              <div className="text-sm font-black text-sky-400 mono">G-2.5-FLASH</div>
            </div>
            <div className="h-8 w-px bg-sky-500/20" />
            <div className="text-center">
              <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Security State</div>
              <div className="text-sm font-black text-emerald-400 mono">HARDENED</div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Quantum-Superscript Engine",
                titleTh: "ระบบประมวลผลควอนตัมประสิทธิภาพสูง",
                icon: Atom,
                desc: "The heart of the QS_CTRL system, utilizing super-positional registers to process timeline data with 99.9% accuracy.",
                descTh: "หัวใจหลักของระบบ QS_CTRL ที่ใช้รีจิสเตอร์แบบซูเปอร์โพซิชันเพื่อประมวลผลข้อมูลไทม์ไลน์ด้วยความแม่นยำ 99.9%",
                metrics: ["1.4 Exa-Ops/s", "8-Qubit Register", "Decoherence Mitigation"]
              },
              {
                title: "World Impact & Ethics",
                titleTh: "จริยธรรมและการส่งเสริมพฤติกรรมเชิงบวก",
                icon: Globe,
                desc: "Promoting the behavior you want to see in the world. A project's atmosphere is the true engine of sustainable growth.",
                descTh: "ส่งเสริมพฤติกรรมที่คุณอยากเห็นในโลก การสร้างบรรยากาศที่เป็นมิตรคือเครื่องยนต์ที่แท้จริงของการเติบโตที่ยั่งยืน",
                metrics: ["Community Focus", "Welcoming Sync", "Zero-Toxicity"]
              },
              {
                title: "Temporal Manifold Steering",
                titleTh: "ระบบพวงมาลัยพาวเวอร์มิติเวลา",
                icon: Navigation,
                desc: "Precision vector stabilization for coordinate entry. Allows the navigator to 'steer' through temporal turbulence.",
                descTh: "ระบบรักษาเสถียรภาพเวกเตอร์ความแม่นยำสูงสำหรับการระบุพิกัด ช่วยให้นักเดินทางสามารถ 'ขับเคลื่อน' ผ่านความผันผวนของมิติเวลาได้",
                metrics: ["Active Torque", "Haptic Manifold", "Vector Locking"]
              },
              {
                title: "AI Security & Governance",
                titleTh: "ความปลอดภัยและการกำกับดูแล AI",
                icon: ShieldCheck,
                desc: "Advanced neural safeguards based on the 2025 AI Governance Framework. Protects against model poisoning and timeline drift.",
                descTh: "ระบบป้องกันประสาทขั้นสูงตามกรอบการกำกับดูแล AI ปี 2025 ป้องกันการวางยาโมเดลและความคลาดเคลื่อนของไทม์ไลน์",
                metrics: ["Prompt Shielding", "Leakage Prev.", "Audit Trail"]
              }
            ].map((feature, idx) => (
              <div key={idx} className="glass-panel p-8 rounded-[2.5rem] border-sky-500/10 hover:bg-sky-500/5 transition-all group overflow-hidden relative border-t-4 border-t-sky-500/30">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                  <feature.icon size={120} className="text-sky-400" />
                </div>
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-sky-500/20 rounded-2xl text-sky-400">
                    <feature.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-100 uppercase tracking-tighter">{feature.title}</h3>
                    <p className="text-sky-500 text-xs font-bold uppercase tracking-widest">{feature.titleTh}</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4 italic">"{feature.desc}"</p>
                <p className="text-slate-400 text-xs leading-relaxed mb-6 font-medium">{feature.descTh}</p>
                <div className="flex flex-wrap gap-2">
                  {feature.metrics.map((m, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-900/60 rounded-full text-[9px] mono text-sky-300 border border-sky-500/10 font-bold uppercase tracking-widest">{m}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="glass-panel rounded-[2.5rem] p-10 border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-transparent relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-10">
                <Fingerprint size={120} className="text-indigo-400" />
              </div>
              <h3 className="text-2xl font-black text-indigo-400 mb-6 uppercase tracking-tighter flex items-center gap-3">
                <Lock size={24} /> Technical Specs
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Core Topology", value: "Fractal Q-Bit", icon: Cpu },
                  { label: "Cohesion factor", value: "99.2% Hub", icon: Users },
                  { label: "AI Governance", value: "ISO-2025-AI", icon: ShieldCheck },
                  { label: "World Sync", value: "Enabled", icon: Globe },
                  { label: "Sync Latency", value: "< 5ms PCM", icon: Zap }
                ].map((spec, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-indigo-500/10 last:border-0">
                    <div className="flex items-center gap-3">
                      <spec.icon size={14} className="text-slate-600" />
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{spec.label}</span>
                    </div>
                    <span className="text-xs font-black text-slate-100 mono">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-[2.5rem] p-8 border-emerald-500/10">
              <h4 className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                 <ShieldAlert size={14} /> Ethical Manifold Advisory
              </h4>
              <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/5 space-y-4">
                 <p className="text-[11px] text-slate-400 leading-relaxed italic">
                   "Promote the behavior you want to see in the world." 🌎
                 </p>
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]" />
                    <span className="text-[9px] font-black text-emerald-600 uppercase mono">Atmosphere Optimized</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Protocol Mandate Section */}
      <section className="space-y-10 max-w-4xl mx-auto">
        <header className="flex items-center gap-4 mb-10 border-b border-sky-500/20 pb-6">
          <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400 border border-indigo-500/30">
            <Scale size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-100 uppercase tracking-tighter italic">Protocol Mandate</h1>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Administrator Code of Conduct & Responsibilities</p>
          </div>
        </header>

        <section className="glass-panel p-10 rounded-[2.5rem] border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Globe size={120} className="text-emerald-400" />
          </div>
          <div className="relative z-10 space-y-6">
             <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-tighter flex items-center gap-3">
               <Heart size={24} className="animate-pulse" /> ส่งเสริมพฤติกรรมที่คุณอยากเห็นในโลก 🌎
             </h2>
             <blockquote className="text-lg text-slate-100 leading-relaxed font-serif italic border-l-4 border-emerald-500 pl-6 py-2">
               "เมื่อโครงการดูเหมือนจะมีบรรยากาศที่ไม่เป็นมิตรหรือไม่ให้การต้อนรับ แม้ว่าจะเป็นเพียงคนๆ เดียวที่มีพฤติกรรมที่คนอื่นๆ ยอมรับได้ คุณก็เสี่ยงที่จะสูญเสียผู้ร่วมงานอีกมากมาย ซึ่งบางคนคุณอาจไม่เคยได้พบด้วยซ้ำ การนำหลักปฏิบัติมาใช้หรือบังคับใช้ไม่ใช่เรื่องง่ายเสมอไป แต่การส่งเสริมสภาพแวดล้อมที่เป็นมิตรจะช่วยให้ชุมชนของคุณเติบโตได้"
             </blockquote>
          </div>
        </section>

        <div className="glass-panel p-10 rounded-[2.5rem] border-indigo-500/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <ShieldCheck size={120} className="text-indigo-400" />
          </div>
          
          <article className="space-y-8 text-slate-300 leading-relaxed font-medium relative z-10">
            <section className="space-y-4">
              <h2 className="text-xl font-black text-indigo-400 uppercase tracking-tight flex items-center gap-2">
                <ScrollText size={18} /> หน้าที่ความรับผิดชอบของคุณในฐานะผู้ดูแลระบบ
              </h2>
              <p className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 italic">
                ระเบียบปฏิบัติไม่ใช่กฎหมายที่บังคับใช้ตามอำเภอใจ คุณคือผู้บังคับใช้ระเบียบปฏิบัติ และเป็นความรับผิดชอบของคุณที่จะต้องปฏิบัติตามกฎที่ระเบียบปฏิบัติกำหนดไว้
              </p>
            </section>

            <section className="space-y-4">
              <p>
                ในฐานะผู้ดูแล คุณมีหน้าที่กำหนดแนวทางสำหรับชุมชนของคุณและบังคับใช้แนวทางเหล่านั้นตามกฎที่กำหนดไว้ในจรรยาบรรณของคุณ ซึ่งหมายความว่าคุณต้องพิจารณารายงานการละเมิดจรรยาบรรณอย่างจริงจัง ผู้รายงานมีสิทธิ์ได้รับการตรวจสอบข้อร้องเรียนอย่างละเอียดและเป็นธรรม หากคุณพิจารณาแล้วว่าพฤติกรรมที่พวกเขารายงานนั้นไม่ใช่การละเมิด ให้แจ้งให้พวกเขาทราบอย่างชัดเจนและอธิบายว่าทำไมคุณถึงไม่ดำเนินการใดๆ หลังจากนั้นพวกเขาต้องตัดสินใจเองว่าจะยอมรับพฤติกรรมที่พวกเขามีปัญหา หรือเลิกเข้าร่วมในชุมชน
              </p>
            </section>

            <section className="space-y-4 border-l-4 border-indigo-500/30 pl-6 py-2">
              <p>
                รายงานเกี่ยวกับพฤติกรรมที่ไม่ได้ <strong>ละเมิดระเบียบปฏิบัติ</strong> อย่างชัดเจนอาจบ่งชี้ว่ามีปัญหาเกิดขึ้นในชุมชนของคุณ และคุณควรตรวจสอบปัญหาที่อาจเกิดขึ้นนี้และดำเนินการตามความเหมาะสม ซึ่งอาจรวมถึงการแก้ไขระเบียบปฏิบัติเพื่อให้พฤติกรรมที่ยอมรับได้ชัดเจนยิ่งขึ้น และ/หรือพูดคุยกับบุคคลที่ถูกรายงานพฤติกรรม และบอกพวกเขาว่าถึงแม้พวกเขาจะไม่ได้ละเมิดระเบียบปฏิบัติ แต่พวกเขากำลังทำในสิ่งที่ใกล้เคียงกับสิ่งที่คาดหวัง และทำให้ผู้เข้าร่วมบางคนรู้สึกไม่สบายใจ
              </p>
            </section>

            <section className="pt-6 border-t border-slate-800">
              <p className="font-bold text-slate-100">
                ในท้ายที่สุด ในฐานะผู้ดูแลระบบ คุณเป็นผู้กำหนดและบังคับใช้มาตรฐานพฤติกรรมที่ยอมรับได้ คุณมีอำนาจในการกำหนดค่านิยมของชุมชนในโครงการ และผู้เข้าร่วมคาดหวังว่าคุณจะบังคับใช้ค่านิยมเหล่านั้นอย่างยุติธรรมและเป็นกลาง
              </p>
            </section>
          </article>
        </div>
      </section>

      <footer className="flex justify-between items-center text-[10px] text-slate-600 font-black uppercase tracking-widest pt-4">
        <span>Authorization Level: ADMIN_ROOT</span>
        <span>Neural Signature Verified</span>
      </footer>
    </div>
  );

  const renderDashboard = () => (
    <div className="p-6 space-y-6 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-100 uppercase italic">Control Deck</h1>
          <div className="flex items-center gap-3">
            <p className="text-slate-400 text-sm font-medium">Link Status:</p>
            <span className={`text-sm font-black uppercase ${isCriticalNoise ? 'text-red-400' : 'text-emerald-400'}`}>
              {isCriticalNoise ? 'Peak Interference' : 'Optimal Synchrony'}
            </span>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <div className="glass-panel px-4 py-2 rounded-xl text-xs flex items-center gap-3 border-sky-500/30">
            <FastForward size={16} className="text-sky-400" />
            <span className="mono font-bold text-slate-200">{computeSpeed.toFixed(2)} EXA-OPS/S</span>
          </div>
          <div className="glass-panel px-4 py-2 rounded-xl text-xs flex items-center gap-3 border-sky-500/30">
            <Clock size={16} className="text-sky-400" />
            <span className="mono font-bold text-slate-200">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Entanglement', val: metrics.entanglementLevel.toFixed(1), unit: '%', icon: Waves, col: 'emerald' },
          { label: 'Coherence', val: metrics.coherenceTime.toFixed(1), unit: 'μs', icon: Activity, col: 'sky' },
          { label: 'Velocity', val: computeSpeed.toFixed(3), unit: 'QPS', icon: Navigation, col: 'indigo' },
          { label: 'Noise Density', val: (metrics.noiseLevel * 100).toFixed(2), unit: 'dB', icon: ZapOff, col: isCriticalNoise ? 'red' : 'amber' }
        ].map((m, i) => (
          <div key={i} className={`glass-panel rounded-2xl p-5 border-l-4 ${m.col === 'red' ? 'border-l-red-500 animate-flash-red' : `border-l-${m.col}-500/40`}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{m.label}</span>
              <m.icon size={14} className={`text-${m.col}-400`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white mono">{m.val}</span>
              <span className="text-[10px] text-slate-500">{m.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <section className="glass-panel rounded-3xl p-8 overflow-hidden relative border-sky-500/10">
            <h2 className="flex items-center gap-3 text-lg font-bold text-sky-300 uppercase mb-8 tracking-tighter"><Cpu size={20} /> Register Matrix</h2>
            <QuantumVisualizer qubits={qubits.slice(0, 8)} />
          </section>
          
          <section className="glass-panel rounded-3xl p-8 border-sky-500/10">
            <h2 className="flex items-center gap-3 text-lg font-bold text-sky-300 mb-8 uppercase tracking-tighter"><FileText size={20} /> Mission Screenplay</h2>
            <div className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {logs.map(log => (
                <div key={log.id} className="relative border-l-2 border-sky-500/20 pl-6 py-2 group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-sky-400 mono">INT. QUANTUM CHAMBER - {log.destinationDate}</span>
                    <span className="text-[10px] text-slate-600 mono">{log.timestamp}</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-serif italic">"{log.narrative}"</p>
                  <div className="mt-2 text-[9px] text-sky-600 font-black uppercase tracking-widest">Stability Profile: {log.stability}% Assistance Engaged</div>
                </div>
              ))}
              {logs.length === 0 && <div className="text-center py-10 text-slate-600 italic">No screenplay data recorded.</div>}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 bg-slate-900/40 border-sky-500/10">
            <h3 className="flex items-center gap-3 text-md font-black text-sky-400 mb-6 uppercase tracking-tighter"><BarChart3 size={18} /> Stability Diagnostics</h3>
            <div className="space-y-5">
              {[
                { label: 'Timeline Integrity', val: 98, status: 'OPTIMAL' },
                { label: 'Manifold Pressure', val: 72, status: 'WARNING' },
                { label: 'Encryption Health', val: 100, status: 'OPTIMAL' }
              ].map((comp, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                    <span>{comp.label}</span>
                    <span className={getStatusColor(comp.status as HealthStatus)}>{comp.status}</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${getStatusBg(comp.status as HealthStatus)} transition-all duration-1000`} style={{ width: `${comp.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-8 bg-gradient-to-br from-sky-600/10 to-transparent border-sky-500/20 relative overflow-hidden group">
            <h3 className="text-lg font-black text-sky-400 mb-6 flex items-center gap-3 uppercase tracking-tighter"><Sparkles size={20} /> Rapid Jump</h3>
            <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full bg-slate-900/80 border border-sky-500/20 rounded-xl p-3 text-sm font-bold text-sky-300 outline-none mb-4" />
            <button onClick={handleLeap} disabled={isLoading} className="w-full py-4 bg-sky-600 hover:bg-sky-500 transition-all rounded-2xl text-white font-black uppercase tracking-tighter flex items-center justify-center gap-3 shadow-xl disabled:opacity-50">
              {isLoading ? <RefreshCw className="animate-spin" /> : <Zap size={20} />}
              {isLoading ? 'DEPLOYING...' : 'INITIATE LEAP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSteeringView = () => (
    <div className="p-12 flex flex-col items-center justify-center h-full space-y-16 animate-in zoom-in-95">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-black text-sky-400 uppercase tracking-tighter italic">Quantum Power Steering</h2>
        <p className="text-slate-500 font-medium">Fine-tune the dimensional manifold curvature to stabilize arrival vectors.</p>
      </div>

      <div className="relative w-96 h-96 flex items-center justify-center group">
        <div className="absolute inset-[-20px] rounded-full border border-sky-500/10 animate-rotate-slow" />
        <div className="absolute inset-0 rounded-full border-[20px] border-slate-900 shadow-2xl flex items-center justify-center">
           <div className="w-[94%] h-[94%] rounded-full border-2 border-sky-500/20 animate-pulse" />
        </div>

        <div className="absolute inset-0 transition-transform duration-500 ease-out" style={{ transform: `rotate(${(steeringValue * 1.8) - 90}deg)` }}>
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-16 bg-sky-400 rounded-full shadow-[0_0_20px_rgba(56,189,248,1)]" />
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-16 bg-sky-500/20 rounded-full" />
           <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-16 bg-sky-500/20 rounded-full" />
           <div className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-16 bg-sky-500/20 rounded-full" />
        </div>

        <div className="z-10 bg-slate-950 w-40 h-40 rounded-full border-4 border-sky-400/80 flex flex-col items-center justify-center shadow-[0_0_80px_rgba(56,189,248,0.2)]">
           <span className="text-5xl font-black text-white tracking-tighter mono">{steeringValue}</span>
           <span className="text-[11px] text-sky-400 font-black uppercase tracking-[0.3em] mt-1">Stability</span>
        </div>

        <div className="absolute inset-[-40px] flex justify-between items-center px-4 pointer-events-none">
           <button onClick={() => setSteeringValue(v => Math.max(0, v-5))} className="p-6 rounded-full bg-slate-900/50 border border-sky-500/20 hover:bg-sky-500/10 pointer-events-auto transition-all">
             <ChevronUp size={32} className="-rotate-90 text-sky-500" />
           </button>
           <button onClick={() => setSteeringValue(v => Math.min(100, v+5))} className="p-6 rounded-full bg-slate-900/50 border border-sky-500/20 hover:bg-sky-500/10 pointer-events-auto transition-all">
             <ChevronUp size={32} className="rotate-90 text-sky-500" />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 w-full max-w-2xl bg-slate-900/20 p-8 rounded-[2rem] border border-sky-500/5">
         {[
           { label: 'Torque Assist', val: 'Active' },
           { label: 'Haptic Feedback', val: 'Nominal' },
           { label: 'Divergence Lock', val: steeringValue > 80 ? 'CRITICAL' : 'LOCKED' }
         ].map((stat, i) => (
           <div key={i} className="text-center space-y-1">
              <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{stat.label}</div>
              <div className="text-xs font-bold text-sky-400 mono">{stat.val}</div>
           </div>
         ))}
      </div>
    </div>
  );

  return (
    <div className={`flex h-screen w-screen overflow-hidden transition-all duration-1000 ${isCriticalNoise ? 'critical-gradient' : 'quantum-gradient'} text-slate-200`}>
      {leapEffect && <div className="fixed inset-0 z-[100] bg-white animate-pulse pointer-events-none" />}
      
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-[1000]">
        {activeToasts.map((toast) => (
          <div key={toast.id} className={`glass-panel p-4 pr-6 rounded-2xl flex items-center gap-4 animate-in slide-in-from-right-4 fade-in duration-300 border-l-4 ${toast.status === 'CRITICAL' ? 'border-l-red-500 animate-shake' : 'border-l-amber-500'}`}>
            <div className={`p-2 rounded-xl ${toast.status === 'CRITICAL' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
               <BellRing size={18} className="animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Neural Warning</div>
              <div className="text-xs font-bold text-slate-100 mono">{toast.title}</div>
            </div>
          </div>
        ))}
      </div>

      {renderSidebar()}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className={`absolute rounded-full transition-all duration-1000 ${isCriticalNoise ? 'bg-red-500' : 'bg-sky-500'}`} style={{ width: Math.random() * 3 + 'px', height: Math.random() * 3 + 'px', left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', animation: `pulse-soft ${2 + Math.random() * 5}s infinite` }} />
          ))}
        </div>
        <div className="relative z-10 h-full">
          {view === ControlView.DASHBOARD && renderDashboard()}
          {view === ControlView.STEERING && renderSteeringView()}
          {view === ControlView.GOVERNANCE && renderGovernanceView()}
          {view === ControlView.TEMPORAL_LEAP && (
            <div className="p-12 flex flex-col items-center justify-center h-full max-w-4xl mx-auto space-y-12 animate-in zoom-in-95">
                <div className="text-center space-y-4">
                  <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400 uppercase tracking-tighter italic">Temporal Jump Gate</h2>
                  <p className="text-slate-400 text-lg font-medium">Dimensionally synchronize coordinates and engage manifold stabilization.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
                  <div className="glass-panel p-10 rounded-[3rem] space-y-10 border-sky-500/20">
                    <div className="flex items-center gap-6 p-6 bg-sky-500/10 border border-sky-500/20 rounded-3xl">
                      <Compass size={64} className="text-sky-400" />
                      <div className="flex-1">
                        <div className="text-[11px] text-sky-500 font-black uppercase tracking-widest mb-1">Target Era</div>
                        <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="bg-transparent text-3xl font-black text-white outline-none w-full" />
                      </div>
                    </div>
                    <button onClick={handleLeap} disabled={isLoading} className="w-full py-6 bg-sky-600 hover:bg-sky-500 transition-all rounded-3xl text-2xl font-black text-white shadow-2xl flex items-center justify-center gap-4">
                      {isLoading ? <RefreshCw className="animate-spin" /> : <Zap size={28} />}
                      {isLoading ? 'CALCULATING...' : 'ENGAGE LEAP'}
                    </button>
                  </div>
                  <div className="glass-panel p-10 rounded-[3rem] flex flex-col items-center justify-center border-sky-500/20">
                    <div className="w-64 h-64 rounded-full border-8 border-dashed border-sky-500/10 flex items-center justify-center animate-[spin_60s_linear_infinite] relative">
                        <div className="absolute inset-0 rounded-full border-4 border-sky-400/20 animate-pulse" />
                        <Zap size={80} className="text-sky-400 drop-shadow-[0_0_30px_rgba(56,189,248,1)]" />
                    </div>
                  </div>
                </div>
            </div>
          )}
          {view === ControlView.QUBIT_LAB && <div className="p-8 space-y-8 animate-in slide-in-from-bottom-4 h-full"><h2 className="text-4xl font-black text-slate-100 uppercase tracking-tighter">Advanced Lab</h2><div className="glass-panel p-10 rounded-[3rem] border-sky-500/10 shadow-2xl h-full flex items-center justify-center"><QuantumVisualizer qubits={qubits} /></div></div>}
          {view === ControlView.VOICE_COMMAND && (
            <div className="p-12 flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center space-y-12">
               <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 uppercase tracking-tighter italic">Ziggy Neural Interface</h2>
               <div className="relative group">
                  <div className={`absolute inset-0 rounded-full blur-[60px] transition-all duration-1000 ${isVoiceActive ? 'bg-sky-500/30' : 'bg-slate-800/10'}`} />
                  <button onClick={toggleVoiceSession} className={`relative z-10 w-56 h-56 rounded-full flex flex-col items-center justify-center border-2 transition-all duration-500 ${isVoiceActive ? 'border-sky-400 bg-slate-950 shadow-[0_0_60px_rgba(56,189,248,0.4)]' : 'border-slate-800 bg-slate-900 hover:border-sky-500/40'}`}>
                    {voiceStatus === 'CONNECTING' ? <RefreshCw className="animate-spin text-sky-400 w-16 h-16" /> : isVoiceActive ? <MicOff size={64} className="text-sky-300" /> : <Mic size={64} className="text-slate-600" />}
                    <span className="text-[10px] font-black text-sky-400 mt-4 uppercase tracking-[0.3em]">{voiceStatus}</span>
                  </button>
               </div>
               <p className="text-slate-400 text-lg leading-relaxed italic">"Ziggy, what are the odds of return? Map the timeline divergence risk."</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;