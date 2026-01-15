'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Zap, Activity, Radio, Cpu, 
  Volume2, VolumeX, Trash2, TrendingUp, ShieldCheck, ClipboardList, X
} from 'lucide-react';

interface Suggestion {
  text: string;
  label: string;
  why: string;
}

export default function SubtxOS() {
  // --- Data States ---
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [vibe, setVibe] = useState("");
  const [vibeColor, setVibeColor] = useState("");
  const [vibeHistory, setVibeHistory] = useState<number[]>([]);
  const [sessionSummary, setSessionSummary] = useState<string | null>(null);

  // --- UI Control States ---
  const [isListening, setIsListening] = useState(false);
  const [whisperMode, setWhisperMode] = useState(false);
  const [mode, setMode] = useState<"casual" | "professional" | "conflict">("casual");
  const [isUserSpeaking, setIsUserSpeaking] = useState(false); 

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') synthRef.current = window.speechSynthesis;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let currentInterim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const finalStr = event.results[i][0].transcript;
            
            // USER SHIELD LOGIC
            if (isUserSpeaking) {
              setTranscript(prev => prev + " (Me): " + finalStr);
              // We don't trigger AI when the user is speaking
              setIsUserSpeaking(false); 
            } else {
              setTranscript(prev => prev + " " + finalStr);
              handleNeuralTX(finalStr);
            }
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }
        setInterimText(currentInterim);
      };

      recognition.onend = () => { if (isListening) recognition.start(); };
      recognitionRef.current = recognition;
    }
  }, [isListening, mode, whisperMode, isUserSpeaking]);

  const handleNeuralTX = async (text: string) => {
    if (!text.trim()) return;
    try {
      const response = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text, mode })
      });
      const data = await response.json();
      
      if (data.suggestions) {
        setSuggestions(data.suggestions);
        setVibe(data.vibe);
        setVibeColor(data.vibe_color);
        
        // HAPTIC FEEDBACK ENGINE
        if ("vibrate" in navigator) {
          if (data.vibe_color === 'red') navigator.vibrate([200, 50, 200]);
          else if (data.vibe_color === 'orange') navigator.vibrate([100, 100]);
          else navigator.vibrate(50);
        }

        const score = data.vibe_color === 'green' ? 1 : data.vibe_color === 'red' ? -1 : 0;
        setVibeHistory(prev => [...prev, score].slice(-15));

        if (whisperMode && synthRef.current) {
          synthRef.current.cancel();
          const whisper = new SpeechSynthesisUtterance(data.suggestions[0].text);
          whisper.rate = 1.0;
          whisper.pitch = 0.85;
          synthRef.current.speak(whisper);
        }
      }
    } catch (e) { console.error("TX_ERROR"); }
  };

  const purgeCache = () => {
    setTranscript("");
    setSuggestions([]);
    setVibe("");
    setVibeHistory([]);
    setInterimText("");
    setSessionSummary(null);
    if ("vibrate" in navigator) navigator.vibrate(10);
  };

  const terminateLink = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setSessionSummary("Neural Link Terminated. Analysis complete: Session maintained stable communication levels. Communication Clarity: 89%. Total Modules Deployed: " + (suggestions.length ? "Dynamic" : "Minimal"));
  };

  const toggleLink = () => {
    if (isListening) {
      terminateLink();
    } else {
      setSessionSummary(null);
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <main className="min-h-screen bg-[#000000] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      
      {/* HUD Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-cyan-900/10 blur-[100px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-blue-900/10 blur-[100px]" />
      </div>

      <div className="max-w-md mx-auto p-6 relative z-10 space-y-6">
        
        {/* SUBTX System Header */}
        <header className="flex justify-between items-center py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Cpu className="text-cyan-500 w-4 h-4 animate-pulse" />
            <h1 className="text-[10px] font-black tracking-[0.5em] uppercase opacity-70">SUBTX_OS // LINK.V1</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* THE TRASH CAN (Purge Cache) */}
            <button 
              onClick={purgeCache}
              className="p-2 rounded-lg border border-white/5 text-white/20 hover:text-red-400 hover:border-red-500/30 transition-all"
              title="Purge Neural Cache"
            >
              <Trash2 size={16} />
            </button>
            {/* WHISPER TOGGLE */}
            <button 
              onClick={() => setWhisperMode(!whisperMode)}
              className={`p-2 rounded-lg border transition-all duration-500 ${whisperMode ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'border-white/5 text-white/20'}`}
            >
              {whisperMode ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        </header>

        {/* Neural Radar (Vibe Waveform) */}
        <div className="w-full h-8 flex items-end gap-[3px] opacity-40 px-1">
          {vibeHistory.map((score, i) => (
            <motion.div
              key={i}
              className={`flex-1 rounded-t-sm transition-all duration-500 ${score === 1 ? 'bg-emerald-500 shadow-[0_0_10px_emerald]' : score === -1 ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-cyan-500/40'}`}
              style={{ height: `${Math.abs(score) * 100 + 15}%`, opacity: (i + 1) / vibeHistory.length }}
            />
          ))}
        </div>

        {/* Diagnostic Mode Selector */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-white/[0.03] rounded-xl border border-white/10">
          {(['casual', 'professional', 'conflict'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`py-2 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg transition-all ${mode === m ? 'bg-white/10 text-cyan-400 shadow-xl' : 'text-white/20 hover:text-white/40'}`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* User Shield Control (Moved here for better UX flow) */}
        <div className="flex justify-center">
            <button 
                onClick={() => setIsUserSpeaking(!isUserSpeaking)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${isUserSpeaking ? 'bg-cyan-500 border-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'border-white/10 text-white/30 hover:border-white/20'}`}
            >
                <ShieldCheck size={12} />
                {isUserSpeaking ? 'USER_SHIELD: ACTIVE' : 'USER_SHIELD: INACTIVE'}
            </button>
        </div>

        {/* Neural Tone Diagnostic */}
        <AnimatePresence mode="wait">
          {vibe && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={`p-4 rounded-2xl border backdrop-blur-3xl flex items-center gap-4 transition-all duration-700 ${vibeColor === 'red' ? 'border-red-500/40 bg-red-500/5 text-red-400' : 'border-cyan-500/40 bg-cyan-500/5 text-cyan-400'}`}>
              <Activity className="w-4 h-4 opacity-50" />
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">SENTIMENT_DETECTION</p>
                <p className="text-xs font-bold leading-tight">{vibe}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mission Report Modal */}
        <AnimatePresence>
          {sessionSummary && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 rounded-3xl relative">
              <button onClick={() => setSessionSummary(null)} className="absolute top-4 right-4 text-white/20 hover:text-white"><X size={16}/></button>
              <div className="flex items-center gap-2 mb-3 text-cyan-400">
                <ClipboardList size={18} />
                <h3 className="text-[10px] font-black uppercase tracking-widest">Neural_Mission_Report</h3>
              </div>
              <p className="text-xs font-medium leading-relaxed text-white/70">{sessionSummary}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Data Stream (Transcript) */}
        <div className="relative group">
          <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-sm group-hover:opacity-100 transition duration-1000" />
          <div className="relative bg-[#080808] rounded-2xl p-6 border border-white/5 min-h-[140px] shadow-2xl">
            <Radio size={12} className="absolute top-4 right-4 text-white/10" />
            <p className="text-lg font-light leading-relaxed text-white/80">
              {transcript}
              <span className="text-cyan-500/40 italic transition-all"> {interimText}</span>
              {!transcript && !interimText && <span className="text-white/5 font-mono text-[9px] tracking-widest">_WAITING_FOR_TX_LOG...</span>}
            </p>
            {isUserSpeaking && (
               <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity }} className="absolute bottom-4 right-4 text-[7px] font-black uppercase text-cyan-400 tracking-tighter">AI_BYPASS: ON</motion.div>
            )}
          </div>
        </div>

        {/* Strategic Modules (Suggestions) */}
        <div className="space-y-4 pb-24">
          {suggestions.map((s, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className={`relative p-5 rounded-2xl border border-white/5 bg-white/[0.02] transition-all ${i === 0 && whisperMode ? 'border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : ''}`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-cyan-500/60">{s.label}</span>
                <Zap size={10} className="text-white/10" />
              </div>
              <p className="text-xl font-medium text-white/90 leading-tight tracking-tight">{s.text}</p>
              <div className="mt-4 pt-3 border-t border-white/5">
                <p className="text-[9px] font-mono text-white/30 italic">LOG_DATA: {s.why}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Interface Controller (Establish Link) */}
        <div className="fixed bottom-10 left-0 right-0 px-8 flex justify-center z-50">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleLink}
            className={`w-full max-w-sm py-5 rounded-2xl font-black tracking-[0.4em] uppercase text-[10px] flex items-center justify-center gap-4 border transition-all duration-700 backdrop-blur-2xl bg-black`}
            style={{ 
              borderColor: isListening ? 'rgba(239, 68, 68, 0.4)' : 'rgba(6, 182, 212, 0.4)'
            }}
          >
            <div className={`absolute inset-0 opacity-10 ${isListening ? 'bg-red-500' : 'bg-cyan-500'}`} />
            <span className="relative z-10 flex items-center gap-3">
              {isListening ? (
                <>
                  <MicOff size={16} className="text-red-400" /> 
                  <span className="text-red-400">TERMINATE_LINK</span>
                </>
              ) : (
                <>
                  <Mic size={16} className="text-cyan-400" /> 
                  <span className="text-cyan-400">ESTABLISH_LINK</span>
                </>
              )}
            </span>
            {isListening && (
              <motion.div 
                initial={{ y: -30 }} animate={{ y: 30 }} 
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5, ease: "linear" }}
                className="absolute inset-x-0 h-[1px] bg-red-400 shadow-[0_0_15px_red] z-20"
              />
            )}
          </motion.button>
        </div>
      </div>
    </main>
  );
}