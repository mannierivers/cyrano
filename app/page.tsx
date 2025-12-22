'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Suggestion {
  text: string;
  label: string;
  why: string;
}

export default function CyranoPage() {
  const [transcript, setTranscript] = useState<string>("");
  const [history, setHistory] = useState<{role: string, content: string}[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const finalSentence = event.results[i][0].transcript;
            processSpeech(finalSentence);
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(interimTranscript);
      };
    }
  }, [history]); // Re-run when history updates to keep AI context fresh

  const processSpeech = async (text: string) => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    
    // 1. Update local history so AI knows what was just said
    const newHistory = [...history, { role: "user", content: text }];
    setHistory(newHistory);

    try {
      const response = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text, history: newHistory.slice(-6) }), // Send last 6 lines for context
      });

      const data = await response.json();
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error("Cyrano API Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 pb-32">
      {/* Header */}
      <header className="max-w-2xl mx-auto pt-8 mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-indigo-600 tracking-tight">Cyrano</h1>
        <p className="text-slate-500 mt-2 font-medium">Your social co-pilot</p>
      </header>

      <div className="max-w-md mx-auto space-y-6">
        
        {/* Live Transcript Box */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-all">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Hearing Now</h2>
          <p className="text-lg text-slate-700 leading-relaxed italic">
            {transcript || (isListening ? "Listening for speech..." : "Microphone is off.")}
          </p>
          {isProcessing && (
            <div className="mt-4 flex items-center text-indigo-500 text-sm font-medium animate-pulse">
              <span className="mr-2">Cyrano is thinking...</span>
            </div>
          )}
        </div>

        {/* Suggestions Section */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-2">Suggested Responses</h2>
          {suggestions.length === 0 && !isProcessing && (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
              Suggestions will appear here
            </div>
          )}
          
          {suggestions.map((s, i) => (
            <div 
              key={i} 
              className="group bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-2xl p-5 shadow-sm transition-all cursor-pointer active:scale-[0.98]"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase rounded-md">
                  {s.label}
                </span>
              </div>
              <p className="text-lg font-semibold text-slate-800 leading-snug group-hover:text-indigo-900">
                {s.text}
              </p>
              <p className="text-sm text-slate-500 mt-3 flex items-start italic">
                <span className="mr-2 text-indigo-400 font-bold not-italic">Why:</span>
                {s.why}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center px-6">
        <button
          onClick={toggleListening}
          className={`w-full max-w-md flex items-center justify-center gap-3 py-4 rounded-full font-bold text-white shadow-2xl transition-all active:scale-95 ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 ring-4 ring-red-100' 
              : 'bg-indigo-600 hover:bg-indigo-700 ring-4 ring-indigo-100'
          }`}
        >
          {isListening ? (
            <>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              Stop Cyrano
            </>
          ) : (
            "Start Cyrano"
          )}
        </button>
      </div>
    </main>
  );
}