import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  AlertCircle,
  MessageSquare,
  Send,
  Zap,
  BarChart3,
  Search,
  ChevronRight,
  Mic,
  Volume2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn, formatCurrency } from '@/lib/utils';
import { aiService } from '@/services/api';

const AIInsights: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [insightData, setInsightData] = useState<any>(null);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);

  const insights = [
    { 
      title: 'Ledger Commitment', 
      metric: insightData?.spendSummary?.total ? formatCurrency(insightData.spendSummary.total) : '$0.00', 
      change: insightData?.spendSummary?.change || '0% TREND', 
      icon: TrendingUp, 
      color: 'text-brand-accent', 
      description: 'Aggregate approved commitment processed through the digital ledger.' 
    },
    { 
      title: 'Strategy Efficiency', 
      metric: 'OPTIMAL', 
      change: '94.2% ACCURACY', 
      icon: BarChart3, 
      color: 'text-emerald-500', 
      description: 'Neural assessment of procurement velocity vs. departmental budgets.' 
    },
    { 
      title: 'Anomaly Flags', 
      metric: insightData?.anomalies?.length || '00', 
      change: 'RISK NEUTRAL', 
      icon: AlertCircle, 
      color: 'text-amber-500', 
      description: 'Detected variances in requisition patterns or vendor pricing integrity.' 
    },
  ];

  React.useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [insightRes, historyRes] = await Promise.all([
          aiService.getInsights(),
          aiService.getHistory()
        ]);
        setInsightData(insightRes.data);
        if (historyRes.data.length > 0) {
          setChatHistory(historyRes.data);
        } else {
          setChatHistory([{ role: 'assistant', content: 'Sovereign Ledger Intelligence is active. How can I assist with your procurement analytics today?' }]);
        }
      } catch (error) {
        console.error("Intelligence offline", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const handleSend = async (overrideQuery?: string) => {
    const currentQuery = overrideQuery || query;
    if (!currentQuery.trim()) return;
    const userMsg = { role: 'user', content: currentQuery };
    setChatHistory([...chatHistory, userMsg]);
    setQuery('');

    try {
      const response = await aiService.chat(currentQuery);
      setChatHistory(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Connection to neural core interrupted." }]);
    }
  };

  return (
    <div className="space-y-12 pb-20 font-sans">
      <div className="flex items-center justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest text-brand-text-secondary uppercase">
             <span>Intelligence</span>
             <ChevronRight className="w-3 h-3 text-brand-text-secondary/50" />
             <span className="text-brand-accent">Predictive Analytics</span>
          </div>
          <h1 className="text-5xl font-light text-white tracking-tight flex items-center gap-6">
            Sovereign Insight
            <div className="w-10 h-10 rounded-full bg-brand-accent/20 border border-brand-accent/50 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-brand-accent" />
            </div>
          </h1>
          <p className="text-brand-text-secondary text-sm font-medium uppercase tracking-widest">
             AI-driven procurement intelligence and spend forecasting
          </p>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {insights.map((insight, i) => (
          <div key={i} className="glass rounded-3xl p-8 border border-brand-border bg-brand-sidebar/30 hover:bg-brand-sidebar/50 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-accent/1 rounded-full blur-3xl group-hover:bg-brand-accent/10 transition-all duration-500" />
            
            <div className="flex items-center justify-between mb-8">
              <div className={cn("p-4 rounded-2xl bg-white/5 border border-brand-border group-hover:border-brand-accent/30 transition-all", insight.color)}>
                <insight.icon className="w-6 h-6" />
              </div>
              <div className="text-right">
                <p className={cn("text-2xl font-light tracking-tighter", insight.color)}>{insight.metric}</p>
                <p className="text-[9px] font-black tracking-widest uppercase opacity-40">{insight.change}</p>
              </div>
            </div>
            
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">{insight.title}</h3>
            <p className="text-xs font-light text-brand-text-secondary leading-relaxed">
              {insight.description}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-12">
        {/* Chat Interface */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-brand-border pb-4">
             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-text-secondary">AI Procurement Assistant</h3>
             <span className="text-[9px] font-bold text-brand-accent uppercase tracking-widest bg-brand-accent/10 px-3 py-1 rounded-full border border-brand-accent/30 animate-pulse">Neural Dynamic</span>
          </div>

          <div className="glass rounded-3xl border border-brand-border bg-brand-card/20 h-[500px] flex flex-col overflow-hidden relative">
            <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
              {chatHistory.map((msg, i) => (
                <div key={i} className={cn(
                  "flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}>
                  {msg.role === 'assistant' && (
                    <div className="w-10 h-10 rounded-full bg-brand-accent/20 border border-brand-accent/50 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-brand-accent" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-md p-6 rounded-3xl text-sm font-light leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-brand-accent text-black font-medium shadow-[0_0_20px_rgba(251,176,59,0.15)]" 
                      : "bg-white/5 border border-brand-border text-brand-text-secondary shadow-xl"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 border-t border-brand-border bg-brand-sidebar/50">
               <div className="relative group">
                 <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="ASK ABOUT VENDOR SPEND, ANOMALIES, OR PROJECTED BUDGETS..."
                  className={cn(
                    "w-full bg-white/3 border rounded-2xl pl-8 pr-28 py-6 text-xs text-white placeholder-brand-text-secondary/40 focus:outline-none focus:ring-1 transition-all tracking-widest font-bold",
                    isListening ? "border-brand-accent animate-pulse ring-brand-accent/30" : "border-brand-border focus:border-brand-accent focus:ring-brand-accent/50"
                  )}
                 />
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-3">
                   <button 
                    onClick={handleVoice}
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg",
                      isListening ? "bg-rose-500 text-white animate-pulse" : "bg-white/5 border border-brand-border text-brand-text-secondary hover:text-white"
                    )}
                   >
                     <Mic className="w-5 h-5" />
                   </button>
                   <button 
                    onClick={() => handleSend()}
                    className="w-12 h-12 bg-brand-accent rounded-xl flex items-center justify-center text-black hover:scale-105 transition-all shadow-lg"
                   >
                     <Send className="w-5 h-5" />
                   </button>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Suggestion Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="space-y-4">
             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-text-secondary">Smart Queries</h3>
             <p className="text-[10px] font-medium text-brand-text-secondary/40 uppercase tracking-widest">Frequent analysis patterns triggered by your role</p>
          </div>

          <div className="space-y-4">
            {[
              "HOW MUCH DID WE SPEND ON APPLE VENDOR?",
              "LIST POTENTIAL VENDOR CONSOLIDATIONS",
              "FORECAST Q4 CAPEX BASED ON CURRENT TRENDS",
              "IDENTIFY REQUISITIONS OVER $50,000",
            ].map((q, i) => (
              <button 
                key={i}
                onClick={() => handleSend(q)}
                className="w-full p-5 glass border border-brand-border rounded-2xl text-left text-[10px] font-bold text-brand-text-secondary hover:text-brand-accent hover:border-brand-accent/50 transition-all flex items-center justify-between group"
              >
                {q}
                <Zap className="w-3 h-3 opacity-20 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>

          <div className="glass rounded-3xl p-8 border border-brand-border bg-gradient-to-br from-brand-accent/5 to-transparent relative overflow-hidden">
             <BarChart3 className="absolute -bottom-10 -right-10 w-32 h-32 text-brand-accent/5" />
             <h4 className="text-[11px] font-black uppercase tracking-widest text-brand-accent mb-4">Risk Profile: Minimal</h4>
             <p className="text-[10px] font-medium text-brand-text-secondary leading-relaxed uppercase tracking-widest">
               Your current procurement velocity is optimal. No critical budget overruns detected for period Mar-2024.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
