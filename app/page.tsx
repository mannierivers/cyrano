'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Zap, 
  Activity, 
  Radio, 
  Cpu, 
  Volume2, 
  VolumeX, 
  Trash2, 
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

interface Suggestion {
  text: string;
  label: string;
  why: string;
}

export default function CyranoOS() {
  // --- State: Core Data ---
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [vibe, setVibe] = useState("");
  const [vibeColor, setVibeColor] = useState("");
  const [vibeHistory, setVibeHistory] = useState<number[]>([]); // Radar Tracking

  // --- State: UI & Controls ---
  const [isListening, setIsListening] = useState(false);
  const [whisperMode, setWhisperMode] = useState(false);
  const [mode, setMode] = useState<"casual" | "professional" | "conflict">("casual");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- Refs ---
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // --- Initialize Speech Engines ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentInterim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const finalStr = event.results[i][0].transcript;
            setTranscript(prev => prev + " " + finalStr);
            handleNeuralLogic(finalStr);
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }
        setInterimText(currentInterim);
      };

      recognition.onend = () => {
        if (isListening) {
          try { recognition.start(); } catch (e) {}
        }
      };

      recognitionRef.current = recognition;
    }
  }, [isListening, mode, whisperMode]);

  // --- Logic: Neural Logic (AI + TTS) ---
  const handleNeuralLogic = async (text: string) => {
    if (!text.trim()) return;
    setIsAnalyzing(true);

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

        // Update Social Radar History (-1 to 1)
        const score = data.vibe_color === 'green' ? 1 : data.vibe_color === 'red' ? -1 : 0;
        setVibeHistory(prev => [...prev, score].slice(-15));

        // Whisper Logic
        if (whisperMode && synthRef.current) {
          synthRef.current.cancel();
          const whisper = new SpeechSynthesisUtterance(data.suggestions[0].text);
          whisper.rate = 1.0;
          whisper.pitch = 0.8; 
          synthRef.current.speak(whisper);
        }
      }
    } catch (err) {
      console.error("Neural Processing Error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- Controls ---
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const purgeNeuralCache = () => {
    setTranscript("");
    setSuggestions([]);
    setVibe("");
    setVibeHistory([]);
    setInterimText("");
  };

  // --- Styles: Dynamic Glows ---
  const getVibeStyles = (color: string) => {
    switch(color) {
      case 'red': return 'border-red-500/40 bg-red-500/5 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]';
      case 'orange': return 'border-orange-500/40 bg-orange-500/5 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.1)]';
      case 'green': return 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
      case 'blue': return 'border-cyan-500/40 bg-cyan-500/5 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]';
      default: return 'border-white/10 bg-white/5 text-white/40';
    }
  };

  return (
    <main className="min-h-screen bg-[#030303] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-md mx-auto p-6 relative z-10 space-y-6">
        
        {/* Header Module */}
        <header className="flex justify-between items-center py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Cpu className="text-cyan-500 w-5 h-5 animate-pulse" />
            <h1 className="text-[10px] font-black tracking-[0.4em] uppercase opacity-70">Cyrano_OS // v1.0.4</h1>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={purgeNeuralCache}
              className="p-2 rounded-lg border border-white/5 hover:border-red-500/40 hover:text-red-400 transition-all text-white/20"
            >
              <Trash2 size={16} />
            </button>
            <button 
              onClick={() => setWhisperMode(!whisperMode)}
              className={`p-2 rounded-lg border transition-all duration-500 ${whisperMode ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_cyan]' : 'border-white/5 text-white/20'}`}
            >
              {whisperMode ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        </header>

        {/* Social Radar: Emotional Waveform */}
        <div className="relative pt-2">
           <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={10} className="text-white/30" />
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/30">Emotional_Trajectory_Radar</span>
           </div>
           <div className="w-full h-10 flex items-end gap-[2px]">
              {vibeHistory.length === 0 && <div className="w-full h-[1px] bg-white/5 animate-pulse" />}
              {vibeHistory.map((score, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  className={`flex-1 rounded-t-sm transition-all duration-700 ${
                    score === 1 ? 'bg-emerald-500/60' : 
                    score === -1 ? 'bg-red-500/60' : 
                    'bg-cyan-500/20'
                  }`}
                  style={{ 
                    height: `${Math.abs(score) * 100 + 10}%`, 
                    opacity: (i + 1) / vibeHistory.length 
                  }}
                />
              ))}
           </div>
        </div>

        {/* Diagnostic Mode Select */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/10">
          {(['casual', 'professional', 'conflict'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`py-2 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg transition-all ${
                mode === m ? 'bg-white/10 text-cyan-400 shadow-xl' : 'text-white/20 hover:text-white/40'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Neural Tone Diagnostic (Vibe) */}
        <AnimatePresence mode="wait">
          {vibe && (
            <motion.div 
              key={vibe}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className={`p-4 rounded-2xl border backdrop-blur-3xl flex items-center gap-4 transition-all duration-500 ${getVibeStyles(vibeColor)}`}
            >
              <Activity className="w-4 h-4 opacity-50" />
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-50 mb-1">Tone_Diagnostic</p>
                <p className="text-xs font-bold tracking-wider">{vibe}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Data Stream (Transcript) */}
        <div className="relative">
          <div className="absolute top-4 right-4 z-20">
             {isAnalyzing ? <Zap size={12} className="text-cyan-400 animate-bounce" /> : <Radio size={12} className="text-white/10" />}
          </div>
          <div className="relative bg-[#0A0A0A] rounded-2xl p-6 border border-white/5 min-h-[150px] shadow-2xl overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
            <p className="text-lg font-light leading-relaxed text-white/70 relative z-10">
              {transcript}
              <span className="text-cyan-500/40 italic"> {interimText}</span>
              {!transcript && !interimText && <span className="text-white/5 font-mono text-[10px] tracking-[0.2em]">_IDLE_AWAITING_INPUT...</span>}
            </p>
          </div>
        </div>

        {/* Response Modules (Suggestions) */}
        <div className="space-y-3 pb-12">
          {suggestions.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative group p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all active:scale-[0.98] ${i === 0 && whisperMode ? 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : ''}`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-cyan-500/60">{s.label}</span>
                <ShieldCheck size={10} className="text-white/10" />
              </div>
              <p className="text-lg font-medium text-white/90 tracking-tight">{s.text}</p>
              <div className="mt-4 pt-3 border-t border-white/5">
                <p className="text-[9px] font-mono text-white/30 leading-tight">
                  <span className="text-cyan-500/40 mr-2">LOG:</span> {s.why}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Primary Interface Controller */}
        <div className="fixed bottom-10 left-0 right-0 px-8 flex justify-center z-50">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleListening}
            className={`w-full max-w-sm py-5 rounded-2xl font-black tracking-[0.4em] uppercase text-[10px] flex items-center justify-center gap-4 transition-all duration-700 relative overflow-hidden border shadow-2xl`}
            style={{
              borderColor: isListening ? 'rgba(239, 68, 68, 0.4)' : 'rgba(6, 182, 212, 0.4)',
              background: 'black'
            }}
          >
            {/* Holographic BG */}
            <div className={`absolute inset-0 opacity-10 transition-colors ${isListening ? 'bg-red-500' : 'bg-cyan-500'}`} />
            
            <span className="relative z-10 flex items-center gap-3">
              {isListening ? (
                <>
                  <MicOff size={16} className="text-red-400" />
                  <span className="text-red-400">Terminate_Link</span>
                </>
              ) : (
                <>
                  <Mic size={16} className="text-cyan-400" />
                  <span className="text-cyan-400">Establish_Link</span>
                </>
              )}
            </span>

            {/* Scanning Laser Line */}
            {isListening && (
              <motion.div 
                initial={{ y: -30 }}
                animate={{ y: 30 }}
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