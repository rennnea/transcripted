import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Activity, RefreshCw, XCircle } from 'lucide-react';

// --- Client-Side Mock Analysis Logic ---
const analyzeSentimentLocal = (text: string): number => {
  if (!text.trim()) return 0;

  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'happy', 'wonderful', 'fantastic', 'best', 'brilliant', 'success', 'win', 'confident', 'hope', 'joy', 'beautiful'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'sad', 'wrong', 'fail', 'failure', 'worst', 'angry', 'upset', 'disappoint', 'pain', 'fear', 'lost', 'poor'];

  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\W+/).filter(w => w.length > 2);
  
  if (words.length === 0) return 0;

  let score = 0;
  words.forEach(word => {
    if (positiveWords.includes(word)) score += 1;
    if (negativeWords.includes(word)) score -= 1;
  });

  // Normalize roughly between -1 and 1 based on density
  const intensity = Math.min(Math.abs(score) / (words.length * 0.5), 1); 
  return score > 0 ? intensity : -intensity;
};

// --- Sub-components ---

const SentimentGlow = ({ sentiment }: { sentiment: number }) => {
  let color = 'rgba(107, 114, 128, 0.2)'; // Gray/Neutral
  if (sentiment > 0.2) color = 'rgba(16, 185, 129, 0.4)'; // Emerald
  if (sentiment < -0.2) color = 'rgba(244, 63, 94, 0.4)'; // Rose

  return (
    <motion.div
      className="absolute -inset-10 rounded-[3rem] blur-3xl -z-10"
      animate={{ background: color }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    />
  );
};

const FluidBar = ({ sentiment }: { sentiment: number }) => {
  // Map -1..1 to 0..100% for position, but we want a bar growing from center
  // Center is 50%.
  
  const isPositive = sentiment >= 0;
  const widthPercentage = Math.abs(sentiment) * 50; // 0 to 50% width
  
  // Dynamic Gradient
  const getGradient = (val: number) => {
    if (val > 0.3) return 'linear-gradient(90deg, #10B981 0%, #06B6D4 100%)'; // Emerald -> Cyan
    if (val < -0.3) return 'linear-gradient(90deg, #F43F5E 0%, #F97316 100%)'; // Rose -> Orange
    return 'linear-gradient(90deg, #94A3B8 0%, #64748B 100%)'; // Slate
  };

  return (
    <div className="relative w-full h-4 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/5 mt-8">
      {/* Center Marker */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20 z-10" />
      
      {/* The Fluid Bar */}
      <motion.div
        className="absolute top-0 bottom-0 rounded-full"
        initial={{ width: 0, left: '50%' }}
        animate={{
          width: `${widthPercentage}%`,
          left: isPositive ? '50%' : `${50 - widthPercentage}%`,
          background: getGradient(sentiment),
        }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      />
    </div>
  );
};

// --- Main Component ---

const SentimentLab: React.FC = () => {
  const [text, setText] = useState('');
  const [sentiment, setSentiment] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  // Debounced Analysis
  useEffect(() => {
    setIsTyping(true);
    const timer = setTimeout(() => {
      const score = analyzeSentimentLocal(text);
      setSentiment(score);
      setIsTyping(false);
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [text]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-950 p-6 relative overflow-hidden transition-colors duration-700">
      
      {/* Header Info */}
      <div className="text-center mb-10 z-10">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight flex items-center justify-center gap-3">
          <Activity className="text-emerald-400" /> Sentiment Lab
        </h1>
        <p className="text-gray-400">The Living Interface: Real-time organic text analysis.</p>
      </div>

      {/* Main Glass Card */}
      <motion.div 
        className="relative w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <SentimentGlow sentiment={sentiment} />
        
        <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-20">
          
          {/* Input Area */}
          <div className="relative group">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type something... try 'I love this amazing feature' or 'This error is terrible'"
              className="w-full h-40 bg-gray-950/50 text-gray-100 placeholder-gray-600 rounded-xl p-5 border border-white/5 focus:border-white/20 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none resize-none transition-all text-lg leading-relaxed"
            />
            <AnimatePresence>
                {text.length > 0 && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setText('')}
                        className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                    >
                        <XCircle size={20} />
                    </motion.button>
                )}
            </AnimatePresence>
          </div>

          {/* Visualizer */}
          <FluidBar sentiment={sentiment} />

          {/* Footer / Stats */}
          <div className="flex justify-between items-center mt-6 text-sm font-medium">
            <div className="flex items-center gap-2 text-gray-400">
              {isTyping ? (
                <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                    <RefreshCw size={16} />
                </motion.div>
              ) : (
                <Sparkles size={16} className={sentiment > 0.1 ? 'text-yellow-400' : 'text-gray-600'} />
              )}
              <span>
                {isTyping ? 'Analyzing...' : 'Live Analysis'}
              </span>
            </div>
            
            <div className={`transition-colors duration-500 ${
              sentiment > 0.1 ? 'text-emerald-400' : 
              sentiment < -0.1 ? 'text-rose-400' : 'text-gray-400'
            }`}>
              Score: {sentiment.toFixed(2)}
            </div>
          </div>

        </div>
      </motion.div>
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-20">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[100px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[100px]" />
      </div>

    </div>
  );
};

export default SentimentLab;
