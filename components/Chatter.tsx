
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { X, Mic, MicOff, Send, Sparkles, Image as ImageIcon, MessageSquare, Phone, PhoneOff, Bot, Loader2, Play, Volume2, User, History, PenTool, BrainCircuit } from 'lucide-react';

interface ChatterProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  userName?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  imageUrl?: string;
  thinking?: string;
  timestamp: Date;
}

// Audio handling helpers as per guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
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

function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const Chatter: React.FC<ChatterProps> = ({ isOpen, onClose, isDark, userName = 'Reader' }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [callTime, setCallTime] = useState(0);
  const [reasoning, setReasoning] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Voice Call Refs
  const nextStartTimeRef = useRef(0);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const micStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const callTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGenerating, reasoning]);

  useEffect(() => {
    if (isCalling) {
      callTimerRef.current = window.setInterval(() => {
        setCallTime(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      setCallTime(0);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [isCalling]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isGenerating) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    const prompt = inputText;
    setInputText('');
    setIsGenerating(true);
    
    // Set initial reasoning feedback
    setReasoning("I'm interpreting your request and gathering context...");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const isImageRequest = /\b(image|draw|generate image|picture|illustration|create image|photo|art|sketch)\b/i.test(prompt);

      if (isImageRequest) {
        setReasoning("Visualizing the creative elements and drafting the composition...");
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: `Create a high-quality, professional image for: ${prompt}. Journalistic and modern style.` }] },
          config: { imageConfig: { aspectRatio: "1:1" } }
        });

        let imageUrl = '';
        let aiText = "I've synthesized a visual representation based on your description.";
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          } else if (part.text) {
            aiText = part.text;
          }
        }

        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: aiText,
          imageUrl,
          timestamp: new Date()
        }]);
      } else {
        setReasoning("Synthesizing information and drafting a thoughtful response...");
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            thinkingConfig: { thinkingBudget: 0 },
            systemInstruction: `You are Chatter, an advanced, empathetic, and remarkably human-like AI companion for the "Big News" platform. 
            You excel at creative writing, deep research, and insightful conversation. 
            Current user: ${userName}. 
            Your tone should be professional yet warm, like a trusted journalist friend. 
            If asked to write something, use a clean, sophisticated style. 
            If asked for an opinion, be balanced and analytical.`
          }
        });

        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: response.text || "I processed that, but I'm having trouble phrasing it. Could you try asking in a different way?",
          timestamp: new Date()
        }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "My neural link hit a temporary snag. Let's try that again!",
        timestamp: new Date()
      }]);
    } finally {
      setIsGenerating(false);
      setReasoning(null);
    }
  };

  const startVoiceCall = async () => {
    try {
      setIsCalling(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessorRef.current.onaudioprocess = (event) => {
              const inputData = event.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromiseRef.current?.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const outCtx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outCtx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
                sourcesRef.current.delete(s);
              });
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => endVoiceCall(),
          onerror: (e) => {
            console.error("Live session error:", e);
            endVoiceCall();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: `You are in a live phone call with ${userName}. Act like a real, supportive human friend. 
          Be conversational, use natural fillers like "hmm" or "I see", and respond naturally to their tone. 
          Keep your responses relatively brief but meaningful.`
        }
      });
    } catch (err) {
      console.error("Failed to start voice call:", err);
      setIsCalling(false);
    }
  };

  const endVoiceCall = () => {
    setIsCalling(false);
    sessionPromiseRef.current?.then(s => s.close());
    micStreamRef.current?.getTracks().forEach(t => t.stop());
    scriptProcessorRef.current?.disconnect();
    inputAudioContextRef.current?.close();
    outputAudioContextRef.current?.close();
    sourcesRef.current.forEach(s => {
       try { s.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-2xl animate-in fade-in duration-500">
      <div 
        className={`w-full max-w-2xl h-[85vh] rounded-[3rem] shadow-[0_32px_128px_-12px_rgba(0,0,0,0.8)] overflow-hidden relative flex flex-col border border-white/10 ${isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Calling Overlay */}
        {isCalling && (
          <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center animate-in fade-in duration-500">
             <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                <div className="relative">
                   <div className="w-40 h-40 bg-blue-600/20 rounded-full flex items-center justify-center animate-pulse">
                      <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl">
                        <User size={64} className="text-white" />
                      </div>
                   </div>
                   <div className="absolute inset-0 w-40 h-40 border-4 border-blue-500 rounded-full animate-ping opacity-25"></div>
                </div>
                <div className="text-center">
                   <h2 className="text-3xl font-black font-serif text-white mb-2">Chatter AI</h2>
                   <div className="flex items-center justify-center gap-2 text-blue-400 font-mono text-2xl tracking-tighter">
                      <Volume2 size={24} className="animate-bounce" />
                      {formatTime(callTime)}
                   </div>
                   <p className="text-slate-400 mt-4 text-sm font-black uppercase tracking-[0.2em]">Voice Sync Active</p>
                </div>
             </div>
             <div className="p-12">
                <button 
                  onClick={endVoiceCall} 
                  className="w-20 h-20 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/40 transition-transform active:scale-90"
                >
                   <PhoneOff size={32} className="text-white" />
                </button>
             </div>
          </div>
        )}

        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-gradient-to-br from-blue-600/10 to-transparent">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl rotate-3">
               <Bot size={28} className="text-white" />
             </div>
             <div>
               <h2 className="text-xl font-black font-serif tracking-tight">Chatter AI</h2>
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(16,185,129,1)]"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Multimodal Neural Sync</span>
               </div>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={startVoiceCall} 
              className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl hover:bg-emerald-500/20 transition-all active:scale-90 shadow-sm"
              title="Voice Call"
            >
              <Phone size={20} />
            </button>
            <button 
              onClick={onClose} 
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages / Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-6">
               <div className="p-8 rounded-[3rem] bg-blue-600/5 border border-blue-500/10">
                  <Sparkles size={64} className="text-blue-500 mb-4 mx-auto animate-pulse" />
                  <h3 className="text-2xl font-black font-serif">I'm Chatter, your AI Co-Pilot</h3>
                  <p className="max-w-xs text-sm mt-3 text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    I can generate professional news reports, create custom illustrations, or simply have a human-like voice conversation with you.
                  </p>
               </div>
               
               <div className="grid grid-cols-1 gap-3 w-full max-w-sm">
                  {[
                    "Write a news summary about Mars exploration",
                    "Draw an illustration of a futuristic newsroom",
                    "Tell me a joke like a sophisticated journalist"
                  ].map(suggestion => (
                    <button 
                      key={suggestion}
                      onClick={() => setInputText(suggestion)}
                      className={`p-4 rounded-2xl text-xs font-black text-left uppercase tracking-widest transition-all border ${isDark ? 'border-white/5 hover:bg-blue-600/10 hover:border-blue-500/30' : 'border-slate-100 hover:bg-blue-50 hover:border-blue-200'}`}
                    >
                      {suggestion}
                    </button>
                  ))}
               </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
              <div className={`max-w-[85%] rounded-[2.5rem] p-6 shadow-2xl ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white shadow-blue-500/20' 
                  : isDark ? 'bg-white/5 border border-white/10 text-slate-100' : 'bg-slate-100 text-slate-900'
              }`}>
                {msg.imageUrl && (
                  <div className="mb-4 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                    <img src={msg.imageUrl} alt="AI Generated" className="w-full h-auto" />
                  </div>
                )}
                <p className="text-sm sm:text-base font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <div className="text-[9px] mt-4 font-black uppercase tracking-[0.2em] opacity-40 flex items-center gap-2">
                  {msg.role === 'user' ? <User size={10} /> : <Bot size={10} />}
                  {msg.role === 'user' ? 'You' : 'Chatter'} • {msg.timestamp.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          ))}

          {/* Reasoning / Thinking Feedback UI */}
          {isGenerating && (
            <div className="flex justify-start animate-in fade-in">
              <div className={`p-6 rounded-[2.5rem] flex items-center gap-4 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-200'}`}>
                <div className="relative">
                  <BrainCircuit size={28} className="text-blue-500 animate-pulse" />
                  <div className="absolute inset-0 border-2 border-blue-500/50 rounded-full animate-ping opacity-20"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
                    Neural Processing
                    <span className="flex gap-0.5">
                      <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                      <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                      <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                    </span>
                  </span>
                  <p className="text-xs font-black italic text-slate-500 dark:text-slate-400 transition-all">
                    {reasoning || "Analyzing neural pathways..."}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Footer / Input Bar */}
        <div className="p-8 border-t border-white/5 bg-slate-950/20 backdrop-blur-xl">
          <form onSubmit={handleSendMessage} className="flex gap-4">
             <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask me to write or draw anything..."
                  disabled={isGenerating}
                  className={`w-full pl-6 pr-14 py-5 rounded-2xl outline-none border-2 transition-all font-black text-sm shadow-inner ${
                    isDark 
                      ? 'bg-white/5 border-white/5 text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10' 
                      : 'bg-slate-100 border-transparent text-slate-900 focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5'
                  }`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group">
                   {inputText.toLowerCase().includes('image') || inputText.toLowerCase().includes('draw') ? (
                      <ImageIcon size={20} className="text-blue-500 animate-in zoom-in" />
                   ) : (
                      <PenTool size={20} className="opacity-20" />
                   )}
                </div>
             </div>
             <button 
               type="submit"
               disabled={!inputText.trim() || isGenerating}
               className={`p-5 rounded-2xl shadow-2xl transition-all active:scale-90 flex items-center justify-center ${
                 isGenerating 
                   ? 'bg-slate-800 text-slate-600' 
                   : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-blue-500/30'
               }`}
             >
                {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
             </button>
          </form>
          <div className="mt-6 flex justify-center items-center gap-8 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
             <div className="flex items-center gap-2 hover:text-blue-500 transition-colors cursor-default">
                <Sparkles size={12} className="text-blue-500" /> Multi-modal
             </div>
             <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
             <div className="flex items-center gap-2 hover:text-emerald-500 transition-colors cursor-default">
                <Volume2 size={12} className="text-emerald-500" /> Real-time Audio
             </div>
             <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
             <div className="flex items-center gap-2 hover:text-rose-500 transition-colors cursor-default">
                <BrainCircuit size={12} className="text-rose-500" /> Thinking feedback
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatter;
