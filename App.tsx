
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Activity, Cpu, Zap, Clock, Compass, Gauge, Server, Orbit, Sparkles, Mic, MicOff, Volume2, VolumeX, 
  Radio, ChevronDown, ChevronUp, Info, Thermometer, RefreshCw, ShieldCheck, ShieldAlert, FastForward, 
  Navigation, FileText, Waves, ZapOff, BarChart3, BellRing, ScrollText, Scale, Atom, Layers, 
  Fingerprint, Lock, Globe, Heart, Users, CheckCircle2, LayoutDashboard, Database, MessageSquareText,
  Binary
} from 'lucide-react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { ControlView, QubitState, TemporalLog, QuantumMetrics, SystemHealth, HealthStatus } from './types';
import { QuantumVisualizer } from './components/QuantumVisualizer';
import { generateTemporalLog, analyzeQuantumStability, generateHealthSummary } from './services/geminiService';

const NOISE_THRESHOLD = 0.12;
const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

// Manually implement encode as per guidelines
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Manually implement decode as per guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Custom decoding logic for raw PCM data as per guidelines
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
  const [transitioning, setTransitioning] = useState(false);
  const [qubits, setQubits] = useState<QubitState[]>([]);
  const [logs, setLogs] = useState<TemporalLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [targetDate, setTargetDate] = useState('1989-03-26');
  const [steeringValue, setSteeringValue] = useState(50);
  const [dismissedAlert, setDismissedAlert] = useState(false);
  const [leapEffect, setLeapEffect] = useState(false);
  const [computeSpeed, setComputeSpeed] = useState(1.4);
  const [cohesionScore, setCohesionScore] = useState(92.4);
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
  const isVisualCritical = isCriticalNoise && !dismissedAlert;

  // Added missing helper to resolve "Cannot find name 'getStatusColor'"
  const getStatusColor = (status: HealthStatus) => {
    switch (status) {
      case 'OPTIMAL': return 'text-emerald-400';
      case 'WARNING': return 'text-amber-400';
      case 'CRITICAL': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  // Added missing helper to resolve "Cannot find name 'getStatusBg'"
  const getStatusBg = (status: HealthStatus) => {
    switch (status) {
      case 'OPTIMAL': return 'bg-emerald-500';
      case 'WARNING': return 'bg-amber-500';
      case 'CRITICAL': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  // Added missing toggleVoiceSession implementation for Live API
  const toggleVoiceSession = async () => {
    if (isVoiceActive) {
      sessionRef.current?.close();
      setIsVoiceActive(false);
      setVoiceStatus('IDLE');
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
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), outputCtx, OUTPUT_SAMPLE_RATE, 1);
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
            console.error('Ziggy session error:', e);
            setIsVoiceActive(false);
            setVoiceStatus('IDLE');
          },
          onclose: () => {
            setIsVoiceActive(false);
            setVoiceStatus('IDLE');
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'You are Ziggy, the neural interface for a quantum control system. You are helpful, professional, and slightly futuristic. Assist the user in managing the system and answer their technical queries with flair.',
        },
      });
      sessionRef.current = await sessionPromise;
    } catch (error) {
      console.error('Failed to connect to Ziggy:', error);
      setVoiceStatus('IDLE');
      setIsVoiceActive(false);
    }
  };

  const changeView = (newView: ControlView) => {
    if (newView === view) return;
    setTransitioning(true);
    setTimeout(() => {
      setView(newView);
      setTransitioning(false);
    }, 400);
  };

  useEffect(() => {
    if (!isCriticalNoise && dismissedAlert) {
      setDismissedAlert(false);
    }
  }, [isCriticalNoise, dismissedAlert]);

  const handleDismissAlert = () => {
    setDismissedAlert(true);
    setActiveToasts(prev => prev.filter(t => t.status !== 'CRITICAL'));
  };

  const systemHealth: SystemHealth = useMemo(() => {
    let core: HealthStatus = metrics.noiseLevel >= 0.12 ? 'CRITICAL' : (metrics.noiseLevel >= 0.08 ? 'WARNING' : 'OPTIMAL');
    let stabilizer: HealthStatus = (steeringValue <= 10 || steeringValue >= 90) ? 'CRITICAL' : ((steeringValue <= 25 || steeringValue >= 75) ? 'WARNING' : 'OPTIMAL');
    let link: HealthStatus = metrics.entanglementLevel <= 82 ? 'CRITICAL' : (metrics.entanglementLevel <= 88 ? 'WARNING' : 'OPTIMAL');
    return { quantumCore: core, temporalStabilizer: stabilizer, dataLink: link };
  }, [metrics, steeringValue]);

  const prevHealthRef = useRef<SystemHealth>(systemHealth);

  const playNotificationSound = (severity: 'WARNING' | 'CRITICAL') => {
    if (isMuted) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.1, ctx.currentTime);
      masterGain.connect(ctx.destination);
      const playTone = (freq: number, type: OscillatorType, delay: number, duration: number) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        g.gain.setValueAtTime(0, ctx.currentTime + delay);
        g.gain.linearRampToValueAtTime(0.1, ctx.currentTime + delay + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration);
      };
      if (severity === 'CRITICAL') { playTone(880, 'sawtooth', 0, 0.4); playTone(1320, 'square', 0.1, 0.3); }
      else { playTone(440, 'sine', 0, 0.5); playTone(659, 'sine', 0.1, 0.3); }
    } catch (e) {}
  };

  const addToast = (title: string, status: HealthStatus) => {
    if (status === 'CRITICAL' && dismissedAlert) return;
    const id = Math.random().toString(36).substring(2, 9);
    setActiveToasts(prev => [...prev, { id, title, status }]);
    setTimeout(() => setActiveToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  useEffect(() => {
    const current = systemHealth;
    const prev = prevHealthRef.current;
    if (current.quantumCore !== prev.quantumCore && current.quantumCore !== 'OPTIMAL') {
      addToast(`Core Stability: ${current.quantumCore}`, current.quantumCore);
      playNotificationSound(current.quantumCore === 'CRITICAL' ? 'CRITICAL' : 'WARNING');
    }
    prevHealthRef.current = current;
  }, [systemHealth]);

  useEffect(() => {
    const initialQubits = Array.from({ length: 8 }, (_, i) => ({
      id: i, alpha: Math.sqrt(0.5), beta: Math.random(), phase: Math.random() * Math.PI * 2,
    }));
    setQubits(initialQubits);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setQubits(prev => prev.map(q => ({
        ...q, phase: (q.phase + 0.05) % (Math.PI * 2), beta: Math.max(0, Math.min(1, q.beta + (Math.random() - 0.5) * 0.02))
      })));
      setMetrics(prev => ({
        entanglementLevel: Math.max(80, Math.min(99.9, prev.entanglementLevel + (Math.random() - 0.5) * 0.4)),
        coherenceTime: Math.max(100, Math.min(500, prev.coherenceTime + (Math.random() - 0.5) * 5)),
        gateOps: Math.floor(Math.max(120000, Math.min(130000, prev.gateOps + (Math.random() - 0.5) * 1000))),
        noiseLevel: Math.max(0.01, Math.min(0.20, prev.noiseLevel + (Math.random() - 0.5) * 0.01))
      }));
      setComputeSpeed(prev => Math.max(1.2, Math.min(1.8, prev + (Math.random() - 0.5) * 0.05)));
      setCohesionScore(prev => Math.max(85, Math.min(99, prev + (Math.random() - 0.5) * 0.2)));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLeap = async () => {
    setIsLoading(true);
    setLeapEffect(true);
    setTimeout(async () => {
      try {
        const narrative = await generateTemporalLog(targetDate, `Stability ${steeringValue}%`);
        setLogs(prev => [{ id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), destinationDate: targetDate, narrative, stability: steeringValue }, ...prev].slice(0, 10));
        changeView(ControlView.DASHBOARD);
      } catch (error) {} finally {
        setIsLoading(false);
        setLeapEffect(false);
      }
    }, 1500);
  };

  const renderSidebar = () => (
    <div className="w-20 lg:w-72 h-full glass-panel border-r border-sky-500/10 flex flex-col p-6 z-50">
      <div className="flex items-center gap-4 mb-12 px-2 cursor-pointer group" onClick={() => changeView(ControlView.DASHBOARD)}>
        <div className="p-2 bg-sky-500/10 rounded-xl group-hover:bg-sky-500/20 transition-all border border-sky-500/20">
          <Zap className="text-sky-400 w-6 h-6 animate-pulse" />
        </div>
        <span className="hidden lg:block font-black text-xl tracking-tighter text-sky-400 uppercase hologram-glow italic">QS_CTRL</span>
      </div>
      
      <nav className="flex-1 space-y-1.5">
        {[
          { id: ControlView.DASHBOARD, icon: LayoutDashboard, label: 'Control Deck' },
          { id: ControlView.TEMPORAL_LEAP, icon: Compass, label: 'Temporal Jump' },
          { id: ControlView.QUBIT_LAB, icon: Cpu, label: 'Qubit sequence' },
          { id: ControlView.STEERING, icon: Navigation, label: 'Power Steering' },
          { id: ControlView.VOICE_COMMAND, icon: Radio, label: 'Ziggy Neural' },
          { id: ControlView.GOVERNANCE, icon: Scale, label: 'Ethics & Mandate' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => changeView(item.id)}
            className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all group border ${
              view === item.id 
                ? 'bg-sky-500/10 text-sky-300 border-sky-500/30 shadow-[0_0_20px_rgba(56,189,248,0.1)]' 
                : 'text-slate-500 hover:text-sky-200 hover:bg-slate-800/40 border-transparent'
            }`}
          >
            <item.icon size={20} className={view === item.id ? 'text-sky-400' : 'group-hover:text-sky-300'} />
            <span className="hidden lg:block text-[11px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="hidden lg:block mt-6 p-4 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
         <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={14}/> Neural Shield</span>
            <span className="text-[9px] mono text-emerald-600/60">ACTIVE</span>
         </div>
         <div className="space-y-2">
            <div className="flex justify-between items-center text-[9px] mono">
                <span className="text-slate-500">Social Cohesion</span>
                <span className="text-emerald-400">{cohesionScore.toFixed(1)}%</span>
            </div>
            <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${cohesionScore}%` }} />
            </div>
         </div>
      </div>
    </div>
  );

  const renderGovernanceView = () => (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-20 animate-view-entry">
      <section className="space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-sky-500/10 pb-12 gap-6">
          <div>
            <h1 className="text-7xl font-black text-slate-100 uppercase tracking-tighter italic mb-4 leading-none">คุณสมบัติระบบควบคุม</h1>
            <p className="text-sky-500 text-sm font-black uppercase tracking-[0.6em] flex items-center gap-4">
              <Layers size={18} /> Architecture & AI Governance Ledger
            </p>
          </div>
          <div className="flex items-center gap-8 glass-panel px-8 py-4 rounded-[2rem] border-sky-500/20">
            <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Cohesion</div>
              <div className="text-lg font-black text-emerald-400 mono">{cohesionScore.toFixed(1)}%</div>
            </div>
            <div className="h-10 w-px bg-sky-500/10" />
            <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">State</div>
              <div className="text-lg font-black text-sky-400 mono">VERIFIED</div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Quantum Engine",
                titleTh: "ระบบประมวลผลควอนตัม",
                icon: Atom,
                desc: " सुपर positional registers for timeline data processing with near-zero latency.",
                metrics: ["1.6 Exa-Ops/s", "8-Q-Register"]
              },
              {
                title: "World Impact",
                titleTh: "จริยธรรมและการส่งเสริมพฤติกรรม",
                icon: Globe,
                desc: "Promoting the behavior you want to see. An atmosphere of welcome is the true expansion engine.",
                metrics: ["Cohesion Protocol", "Ethical Sync"]
              },
              {
                title: "Steering Manifold",
                titleTh: "ระบบพวงมาลัยพาวเวอร์มิติเวลา",
                icon: Navigation,
                desc: "Precision vector stabilization for coordinate entry and temporal navigation.",
                metrics: ["Vector Lock", "Haptic Rig"]
              },
              {
                title: "AI Governance",
                titleTh: "การกำกับดูแล AI",
                icon: ShieldCheck,
                desc: "Neural safeguards protecting against model leakage and unauthorized drift.",
                metrics: ["Hardened", "Audit: OK"]
              }
            ].map((f, i) => (
              <div key={i} className="glass-panel p-10 rounded-[3rem] border-sky-500/10 hover:border-sky-400/30 transition-all group border-t-4 border-t-sky-500/20">
                <div className="flex items-start gap-5 mb-6">
                  <div className="p-4 bg-sky-500/10 rounded-[1.5rem] text-sky-400 group-hover:bg-sky-500/20 transition-all">
                    <f.icon size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tighter">{f.title}</h3>
                    <p className="text-sky-500 text-[10px] font-black uppercase tracking-[0.2em]">{f.titleTh}</p>
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium italic">"{f.desc}"</p>
                <div className="flex gap-3">
                  {f.metrics.map((m, j) => (
                    <span key={j} className="px-4 py-1.5 bg-slate-950/80 rounded-full text-[9px] mono text-sky-300 border border-sky-500/10 uppercase font-black">{m}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-8">
            <div className="glass-panel rounded-[3rem] p-10 border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-transparent relative overflow-hidden h-full">
              <h3 className="text-2xl font-black text-indigo-400 mb-8 uppercase tracking-tighter flex items-center gap-4">
                <Database size={24} /> System Registry
              </h3>
              <div className="space-y-6">
                {[
                  { label: "Architecture", value: "Superscript Q", icon: Binary },
                  { label: "Sync Engine", value: "Gemini 2.5 L", icon: Activity },
                  { label: "Cohesion factor", value: `${cohesionScore.toFixed(2)}`, icon: Users },
                  { label: "World Policy", value: "Active", icon: Globe }
                ].map((spec, i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-4">
                      <spec.icon size={16} className="text-slate-600" />
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{spec.label}</span>
                    </div>
                    <span className="text-xs font-black text-slate-100 mono">{spec.value}</span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-12 py-5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 rounded-3xl text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4">
                <Fingerprint size={18} /> Neural Re-Verification
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-12 max-w-5xl mx-auto">
        <div className="glass-panel p-12 lg:p-16 rounded-[4rem] border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
            <Heart size={200} className="text-emerald-400" />
          </div>
          <div className="relative z-10 space-y-10">
             <div className="flex items-center gap-6">
                <div className="p-5 bg-emerald-500/10 rounded-[2rem] text-emerald-400">
                    <Scale size={36} />
                </div>
                <div>
                    <h2 className="text-4xl font-black text-emerald-400 uppercase tracking-tighter leading-none mb-2">Protocol Mandate</h2>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest">ส่งเสริมพฤติกรรมที่คุณอยากเห็นในโลก</p>
                </div>
             </div>
             
             <div className="space-y-8">
                 <blockquote className="text-2xl text-slate-100 leading-snug font-serif italic border-l-4 border-emerald-500/40 pl-10 py-4">
                   "เมื่อโครงการดูเหมือนจะมีบรรยากาศที่ไม่เป็นมิตรหรือไม่ให้การต้อนรับ แม้ว่าจะเป็นเพียงคนๆ เดียวที่มีพฤติกรรมที่คนอื่นๆ ยอมรับได้ คุณก็เสี่ยงที่จะสูญเสียผู้ร่วมงานอีกมากมาย การนำหลักปฏิบัติมาใช้หรือบังคับใช้ไม่ใช่เรื่องง่ายเสมอไป แต่การส่งเสริมสภาพแวดล้อมที่เป็นมิตรจะช่วยให้ชุมชนของคุณเติบโตได้"
                 </blockquote>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-slate-400 text-sm leading-relaxed font-medium">
                    <p>
                        ในฐานะผู้ดูแล คุณมีหน้าที่กำหนดแนวทางสำหรับชุมชนของคุณและบังคับใช้แนวทางเหล่านั้นตามกฎที่กำหนดไว้ในจรรยาบรรณ ซึ่งหมายความว่าคุณต้องพิจารณารายงานการละเมิดอย่างจริงจัง ผู้รายงานมีสิทธิ์ได้รับการตรวจสอบที่ละเอียดและเป็นธรรม
                    </p>
                    <p>
                        ในท้ายที่สุด คุณเป็นผู้กำหนดและบังคับใช้มาตรฐานพฤติกรรมที่ยอมรับได้ คุณมีอำนาจในการกำหนดค่านิยมชุมชนในโครงการ และผู้เข้าร่วมคาดหวังว่าคุณจะบังคับใช้ค่านิยมเหล่านั้นอย่างยุติธรรม
                    </p>
                 </div>
             </div>

             <div className="pt-10 border-t border-emerald-500/10 flex flex-wrap gap-4">
                <span className="px-6 py-2 bg-emerald-500/10 rounded-full text-[10px] font-black text-emerald-400 border border-emerald-500/20 uppercase">Atmosphere Engine: STABLE</span>
                <span className="px-6 py-2 bg-emerald-500/10 rounded-full text-[10px] font-black text-emerald-400 border border-emerald-500/20 uppercase">Welcoming Sync: ON</span>
             </div>
          </div>
        </div>
      </section>

      <footer className="flex justify-between items-center text-[11px] text-slate-700 font-black uppercase tracking-[0.4em] border-t border-white/5 pt-10 pb-4">
        <div className="flex items-center gap-4">
            <Users size={16} />
            <span>Community Synchrony Ledger v4.0</span>
        </div>
        <div className="flex items-center gap-4">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span>Encrypted Neural Sig Verified</span>
        </div>
      </footer>
    </div>
  );

  const renderDashboard = () => (
    <div className="p-8 lg:p-12 space-y-10 animate-view-entry">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-6xl font-black tracking-tighter text-slate-100 uppercase italic leading-none mb-3">Control Deck</h1>
          <div className="flex items-center gap-4">
            <div className={`w-2 h-2 rounded-full ${isVisualCritical ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse shadow-[0_0_8px_currentColor]`} />
            <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em]">
              Network Status: <span className={isVisualCritical ? 'text-red-400' : 'text-emerald-400'}>{isVisualCritical ? 'Critical Interference' : 'Coherent Link'}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="glass-panel px-6 py-3 rounded-2xl text-[10px] flex items-center gap-4 border-sky-500/20">
            <FastForward size={18} className="text-sky-400" />
            <span className="mono font-black text-slate-200 uppercase tracking-widest">{computeSpeed.toFixed(2)} EXA-OPS/S</span>
          </div>
          <div className="glass-panel px-6 py-3 rounded-2xl text-[10px] flex items-center gap-4 border-sky-500/20">
            <Clock size={18} className="text-sky-400" />
            <span className="mono font-black text-slate-200 uppercase tracking-widest">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Entanglement', val: metrics.entanglementLevel.toFixed(1), unit: '%', icon: Waves, col: 'sky' },
          { label: 'Coherence', val: metrics.coherenceTime.toFixed(1), unit: 'μs', icon: Activity, col: 'indigo' },
          { label: 'Atmosphere', val: cohesionScore.toFixed(1), unit: '%', icon: Heart, col: 'emerald' },
          { 
            label: 'Noise Density', 
            val: (metrics.noiseLevel * 100).toFixed(2), 
            unit: 'dB', 
            icon: ZapOff, 
            col: isVisualCritical ? 'red' : isCriticalNoise ? 'amber' : 'sky',
            isSpecial: true 
          }
        ].map((m, i) => (
          <div key={i} className={`glass-panel rounded-[2rem] p-8 border-l-4 transition-all duration-700 ${m.col === 'red' ? 'border-l-red-500 animate-flash-red' : `border-l-${m.col}-500/30`}`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{m.label}</span>
              <m.icon size={18} className={`text-${m.col}-400 opacity-60`} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white mono leading-none">{m.val}</span>
                <span className="text-[10px] text-slate-600 font-black uppercase">{m.unit}</span>
              </div>
              {m.isSpecial && isVisualCritical && (
                <button 
                  onClick={handleDismissAlert}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all border border-red-500/20 group"
                  title="Suppress Alert"
                >
                  <VolumeX size={16} className="group-hover:scale-110 transition-transform" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="glass-panel rounded-[3rem] p-10 overflow-hidden relative border-sky-500/10">
            <h2 className="flex items-center gap-4 text-xl font-black text-sky-400 uppercase mb-10 tracking-tighter italic">
                <Cpu size={24} /> Neural Register Matrix
            </h2>
            <QuantumVisualizer qubits={qubits.slice(0, 8)} />
            <div className="scanline"></div>
          </section>
          
          <section className="glass-panel rounded-[3rem] p-10 border-sky-500/10 relative overflow-hidden">
            <h2 className="flex items-center gap-4 text-xl font-black text-sky-400 mb-10 uppercase tracking-tighter italic">
                <MessageSquareText size={24} /> Mission Screenplay
            </h2>
            <div className="space-y-8 max-h-[400px] overflow-y-auto custom-scrollbar pr-6">
              {logs.map(log => (
                <div key={log.id} className="relative border-l-2 border-sky-500/10 pl-10 py-4 group hover:bg-white/5 rounded-r-[2rem] transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-sky-500 mono uppercase tracking-[0.2em]">Coordinates: {log.destinationDate}</span>
                    <span className="text-[10px] text-slate-700 mono">{log.timestamp}</span>
                  </div>
                  <p className="text-base text-slate-200 leading-relaxed font-serif italic">"{log.narrative}"</p>
                  <div className="mt-4 text-[9px] text-sky-700 font-black uppercase tracking-widest mono">Atmosphere Stability verified at {log.stability}%</div>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-center py-20">
                    <Sparkles size={48} className="text-slate-800 mx-auto mb-4" />
                    <p className="text-slate-600 italic font-medium uppercase tracking-widest text-xs">Awaiting temporal coordinates...</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <div className="glass-panel rounded-[3rem] p-8 border-sky-500/10 bg-sky-950/5">
            <h3 className="flex items-center gap-4 text-sm font-black text-sky-500 mb-8 uppercase tracking-widest italic">
                <BarChart3 size={20} /> Diagnostics
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Timeline Integrity', val: 98.4, status: 'OPTIMAL' },
                { label: 'Manifold Pressure', val: 72.1, status: 'WARNING' },
                { label: 'Ethical Alignment', val: 100, status: 'OPTIMAL' }
              ].map((comp, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest">
                    <span>{comp.label}</span>
                    <span className={getStatusColor(comp.status as HealthStatus)}>{comp.status}</span>
                  </div>
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className={`h-full ${getStatusBg(comp.status as HealthStatus)} transition-all duration-1000 shadow-[0_0_8px_currentColor]`} style={{ width: `${comp.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[3rem] p-10 bg-gradient-to-br from-sky-600/10 to-transparent border-sky-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Navigation size={120} />
            </div>
            <h3 className="text-lg font-black text-sky-400 mb-8 flex items-center gap-4 uppercase tracking-tighter italic"><Sparkles size={24} /> Rapid Jump</h3>
            <div className="space-y-4">
                <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full bg-slate-950 border border-sky-500/20 rounded-2xl p-4 text-sm font-black text-sky-300 outline-none focus:border-sky-400/50 transition-colors mono" />
                <button onClick={handleLeap} disabled={isLoading} className="w-full py-5 bg-sky-600 hover:bg-sky-500 transition-all rounded-[1.5rem] text-white font-black uppercase tracking-tighter flex items-center justify-center gap-4 shadow-[0_10px_30px_rgba(2,132,199,0.3)] disabled:opacity-50">
                  {isLoading ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} />}
                  {isLoading ? 'SYNCING...' : 'INITIATE LEAP'}
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex h-screen w-screen overflow-hidden transition-all duration-1000 ${isVisualCritical ? 'critical-gradient' : 'quantum-gradient'} text-slate-200`}>
      {leapEffect && <div className="fixed inset-0 z-[100] bg-white/20 backdrop-blur-3xl animate-pulse pointer-events-none" />}
      
      <div className="fixed bottom-10 right-10 flex flex-col gap-4 z-[1000]">
        {activeToasts.map((toast) => (
          <div key={toast.id} className={`glass-panel p-6 pr-10 rounded-3xl flex items-center gap-5 animate-in slide-in-from-right-10 fade-in duration-500 border-l-8 ${toast.status === 'CRITICAL' ? 'border-l-red-500 animate-shake' : 'border-l-amber-500'}`}>
            <div className={`p-3 rounded-2xl ${toast.status === 'CRITICAL' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
               <BellRing size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Telemetry Alert</div>
              <div className="text-xs font-black text-slate-100 mono tracking-tight">{toast.title}</div>
            </div>
          </div>
        ))}
      </div>

      {renderSidebar()}
      
      <main className="flex-1 overflow-y-auto custom-scrollbar relative">
        {transitioning && (
            <div className="absolute inset-0 z-[100] bg-slate-950/40 backdrop-blur-md flex items-center justify-center">
                <div className="text-sky-400 font-black mono text-xs animate-pulse tracking-[1em]">DESCRAMBLING_DATA</div>
            </div>
        )}
        
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className={`absolute rounded-full transition-all duration-[4s] ${isVisualCritical ? 'bg-red-500' : 'bg-sky-500'}`} style={{ width: Math.random() * 2 + 'px', height: Math.random() * 2 + 'px', left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', animation: `pulse-soft ${2 + Math.random() * 5}s infinite` }} />
          ))}
        </div>
        
        <div className={`relative z-10 h-full ${transitioning ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
          {view === ControlView.DASHBOARD && renderDashboard()}
          {view === ControlView.GOVERNANCE && renderGovernanceView()}
          {view === ControlView.STEERING && (
            <div className="p-12 flex flex-col items-center justify-center h-full space-y-20 animate-view-entry">
                <div className="text-center space-y-4">
                    <h2 className="text-6xl font-black text-sky-400 uppercase tracking-tighter italic leading-none hologram-glow">Manifold Control</h2>
                    <p className="text-slate-500 font-black text-xs uppercase tracking-[0.4em]">Precision power steering for temporal stability</p>
                </div>
                <div className="relative group">
                    <div className="absolute inset-[-40px] rounded-full border border-sky-500/10 animate-rotate-slow" />
                    <div className="w-96 h-96 rounded-full glass-panel border-4 border-slate-900 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 to-transparent"></div>
                        <div className="z-10 bg-slate-950/80 w-48 h-48 rounded-full border-[1px] border-sky-500/20 flex flex-col items-center justify-center shadow-[0_0_80px_rgba(56,189,248,0.1)]">
                           <span className="text-7xl font-black text-white tracking-tighter mono">{steeringValue}</span>
                           <span className="text-[10px] text-sky-400 font-black uppercase tracking-widest mt-2">Rigidity</span>
                        </div>
                        <div className="absolute inset-0 transition-transform duration-700 ease-out" style={{ transform: `rotate(${(steeringValue * 1.8) - 90}deg)` }}>
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3 h-16 bg-sky-400 rounded-full shadow-[0_0_20px_rgba(56,189,248,0.8)]" />
                        </div>
                    </div>
                    <div className="absolute inset-[-60px] flex justify-between items-center px-4">
                       <button onClick={() => setSteeringValue(v => Math.max(0, v-5))} className="p-8 rounded-[2rem] glass-panel border-sky-500/20 hover:bg-sky-500/20 transition-all group">
                         <ChevronUp size={48} className="-rotate-90 text-sky-500 group-hover:scale-110 transition-transform" />
                       </button>
                       <button onClick={() => setSteeringValue(v => Math.min(100, v+5))} className="p-8 rounded-[2rem] glass-panel border-sky-500/20 hover:bg-sky-500/20 transition-all group">
                         <ChevronUp size={48} className="rotate-90 text-sky-500 group-hover:scale-110 transition-transform" />
                       </button>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-12 w-full max-w-2xl bg-slate-950/40 p-10 rounded-[3rem] border border-white/5">
                   {[{ label: 'Torque', val: 'Active' }, { label: 'Haptic', val: 'Sync' }, { label: 'Lock', val: steeringValue > 80 ? 'CRITICAL' : 'OK' }].map((s, i) => (
                     <div key={i} className="text-center space-y-2">
                        <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest">{s.label}</div>
                        <div className={`text-xs font-black mono ${s.val === 'CRITICAL' ? 'text-red-500' : 'text-sky-400'}`}>{s.val}</div>
                     </div>
                   ))}
                </div>
            </div>
          )}
          {view === ControlView.TEMPORAL_LEAP && (
            <div className="p-12 lg:p-24 flex flex-col items-center justify-center h-full max-w-6xl mx-auto space-y-16 animate-view-entry">
                <div className="text-center space-y-6">
                  <h2 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 uppercase tracking-tighter italic leading-none hologram-glow">Jump Gate</h2>
                  <p className="text-slate-400 text-lg font-medium tracking-tight">Manifold stabilization enabled. Confirm temporal destination.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
                  <div className="glass-panel p-16 rounded-[4rem] space-y-12 border-sky-500/10 hover:border-sky-500/30 transition-all flex flex-col justify-center">
                    <div className="space-y-4">
                        <div className="text-[12px] text-sky-500 font-black uppercase tracking-[0.4em] text-center">Target Era Selection</div>
                        <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="bg-slate-950 border border-sky-500/20 rounded-3xl p-8 text-4xl font-black text-white outline-none w-full text-center mono shadow-inner" />
                    </div>
                    <button onClick={handleLeap} disabled={isLoading} className="w-full py-8 bg-sky-600 hover:bg-sky-500 transition-all rounded-[2.5rem] text-3xl font-black text-white shadow-[0_20px_60px_rgba(2,132,199,0.4)] flex items-center justify-center gap-6 group disabled:opacity-50">
                      {isLoading ? <RefreshCw className="animate-spin" size={32} /> : <Zap size={32} className="group-hover:scale-110 transition-transform" />}
                      {isLoading ? 'CALCULATING...' : 'ENGAGE LEAP'}
                    </button>
                  </div>
                  <div className="glass-panel p-16 rounded-[4rem] flex flex-col items-center justify-center border-sky-500/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-80 h-80 rounded-full border-8 border-dashed border-sky-500/5 flex items-center justify-center animate-[spin_60s_linear_infinite] relative">
                        <div className="absolute inset-0 rounded-full border-4 border-sky-400/10 animate-pulse" />
                        <Compass size={120} className="text-sky-400 drop-shadow-[0_0_30px_rgba(56,189,248,0.8)] group-hover:scale-105 transition-transform" />
                    </div>
                  </div>
                </div>
            </div>
          )}
          {view === ControlView.QUBIT_LAB && (
            <div className="p-8 lg:p-12 space-y-12 animate-view-entry h-full">
                <header className="flex items-center gap-6 border-b border-white/5 pb-8">
                    <div className="p-4 bg-sky-500/10 rounded-3xl text-sky-400"><Cpu size={32} /></div>
                    <div>
                        <h2 className="text-4xl font-black text-slate-100 uppercase tracking-tighter italic">Neural sub-registers</h2>
                        <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Live Q-bit interference monitoring</p>
                    </div>
                </header>
                <div className="h-[calc(100%-120px)] overflow-y-auto custom-scrollbar pr-4">
                    <QuantumVisualizer qubits={qubits} />
                </div>
            </div>
          )}
          {view === ControlView.VOICE_COMMAND && (
            <div className="p-12 flex flex-col items-center justify-center h-full max-w-3xl mx-auto text-center space-y-20 animate-view-entry">
               <div className="space-y-4">
                  <h2 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 uppercase tracking-tighter italic leading-none hologram-glow">Ziggy Interface</h2>
                  <p className="text-slate-500 font-black text-xs uppercase tracking-[0.5em]">Neural Uplink v4.0.211</p>
               </div>
               <div className="relative">
                  <div className={`absolute inset-[-60px] rounded-full blur-[100px] transition-all duration-1000 ${isVoiceActive ? 'bg-sky-500/40' : 'bg-slate-800/10'}`} />
                  <button onClick={toggleVoiceSession} className={`relative z-10 w-72 h-72 rounded-[4rem] flex flex-col items-center justify-center border-2 transition-all duration-500 ${isVoiceActive ? 'border-sky-400 bg-slate-950 shadow-[0_0_100px_rgba(56,189,248,0.3)]' : 'border-slate-800 bg-slate-900/40 hover:border-sky-500/30'}`}>
                    {voiceStatus === 'CONNECTING' ? <RefreshCw className="animate-spin text-sky-400 w-20 h-20" /> : isVoiceActive ? <MicOff size={80} className="text-sky-300" /> : <Mic size={80} className="text-slate-600" />}
                    <span className="text-[11px] font-black text-sky-400 mt-6 uppercase tracking-[0.5em]">{voiceStatus}</span>
                  </button>
                  <div className={`absolute inset-0 rounded-[4rem] border-2 border-sky-400/20 scale-110 ${isVoiceActive ? 'animate-pulse' : 'opacity-0'}`} />
               </div>
               <p className="text-slate-400 text-xl leading-relaxed italic font-serif">"Ziggy, initiate atmospheric cohesion check. Verify welcoming sync protocol."</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
