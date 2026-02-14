
import React, { useState, useEffect } from 'react';
import { DailyLog, AnalysisResults, RiskLevel } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
// Fix: added Brain to the list of icons from lucide-react
import { AlertCircle, CheckCircle2, Battery, RefreshCw, MessageCircle, Heart, Zap, ShieldAlert, Brain } from 'lucide-react';
import Chatbot from './Chatbot';

interface DashboardProps {
  logs: DailyLog[];
  results: AnalysisResults;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ logs, results, onReset }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'chat'>('overview');

  const chartData = logs.map((log, i) => ({
    name: `Day ${log.day}`,
    mood: log.mood,
    stress: log.stress,
    accumulation: results.stressAccumulation[i]
  }));

  const riskColors = {
    [RiskLevel.STABLE]: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    [RiskLevel.CAUTION]: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    [RiskLevel.HIGH_RISK]: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  };

  const riskIcon = {
    [RiskLevel.STABLE]: <CheckCircle2 className="w-5 h-5" />,
    [RiskLevel.CAUTION]: <AlertCircle className="w-5 h-5" />,
    [RiskLevel.HIGH_RISK]: <ShieldAlert className="w-5 h-5" />,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Emotional Health Profile</h1>
          <p className="text-stone-500">Analysis generated based on your 7-day pattern recognition.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Retake
          </button>
          <button 
             onClick={() => setActiveTab('chat')}
             className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors text-sm font-semibold shadow-lg shadow-rose-900/20"
          >
            <MessageCircle className="w-4 h-4" /> AI Analysis
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Risk Status Card */}
        <div className={`col-span-1 md:col-span-2 p-8 rounded-3xl border glass flex flex-col justify-between relative overflow-hidden`}>
          <div className="relative z-10">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6 ${riskColors[results.riskLevel]}`}>
              {riskIcon[results.riskLevel]} {results.riskLevel.replace('_', ' ')}
            </div>
            <h2 className="text-4xl font-bold mb-4">
              {results.burnoutLikelihood.toFixed(0)}% <span className="text-lg font-normal text-stone-500 block">Burnout Likelihood</span>
            </h2>
            <p className="text-stone-400 text-sm leading-relaxed max-w-sm">
              {results.riskLevel === RiskLevel.STABLE 
                ? "Your emotional baseline is healthy. You're entering the holiday with resilience."
                : results.riskLevel === RiskLevel.CAUTION
                ? "We've detected rising pressure. Small self-care adjustments can prevent a red-zone spike."
                : "You are operating at high capacity. Prioritize radical rest before engaging in complex emotional labor."}
            </p>
          </div>
          {/* Heart shaped bg visual */}
          <div className="absolute top-1/2 -translate-y-1/2 -right-12 opacity-[0.03] pointer-events-none">
             <Heart className="w-64 h-64 text-white fill-white" />
          </div>
        </div>

        {/* Battery & Volatility Stats */}
        <div className="p-6 rounded-3xl border border-white/5 glass flex flex-col justify-between">
           <div className="flex justify-between items-start mb-4">
             <Battery className="w-6 h-6 text-rose-500" />
             <span className="text-xs font-bold text-rose-500">BATTERY</span>
           </div>
           <div>
             <div className="text-3xl font-bold mb-2">{results.emotionalBattery.toFixed(0)}%</div>
             <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-1000" 
                  style={{ width: `${results.emotionalBattery}%` }} 
                />
             </div>
           </div>
           <p className="text-[10px] text-stone-500 uppercase mt-4 tracking-tighter">Current Readiness Level</p>
        </div>

        <div className="p-6 rounded-3xl border border-white/5 glass flex flex-col justify-between">
           <div className="flex justify-between items-start mb-4">
             <Zap className="w-6 h-6 text-rose-500" />
             <span className="text-xs font-bold text-rose-500">VOLATILITY</span>
           </div>
           <div>
             <div className="text-3xl font-bold mb-2">{results.volatilityScore.toFixed(0)}</div>
             <p className="text-stone-400 text-xs">A score of {results.volatilityScore.toFixed(0)} indicates {results.volatilityScore > 60 ? 'significant' : 'minor'} emotional fluctuation.</p>
           </div>
           <p className="text-[10px] text-stone-500 uppercase mt-4 tracking-tighter">Day-to-day Stability</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stress Accumulation Curve */}
        <div className="col-span-1 md:col-span-2 p-8 rounded-3xl border border-white/10 glass">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold">Stress Accumulation Curve</h3>
              <p className="text-stone-500 text-sm">Visualizing how stress compounds over 7 days.</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500" /> Stress</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-white/30" /> Raw Input</div>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#78716c', fontSize: 10}} />
                <YAxis hide domain={[0, 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1c1917', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#fafaf9' }}
                />
                <Area type="monotone" dataKey="accumulation" stroke="#e11d48" fillOpacity={1} fill="url(#colorAcc)" strokeWidth={3} />
                <Line type="monotone" dataKey="stress" stroke="#ffffff20" strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Love vs Stress Balance */}
        <div className="p-8 rounded-3xl border border-white/10 glass flex flex-col items-center justify-center text-center">
          <h3 className="text-lg font-bold mb-8">Love vs Stress Balance</h3>
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="#ffffff05"
                strokeWidth="12"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="url(#balanceGradient)"
                strokeWidth="12"
                strokeDasharray={552}
                strokeDashoffset={552 - (552 * results.loveStressBalance) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="balanceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4c1d95" />
                  <stop offset="100%" stopColor="#e11d48" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Heart className="w-8 h-8 text-rose-500 fill-rose-500 mb-1" />
              <span className="text-4xl font-black">{results.loveStressBalance.toFixed(0)}</span>
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-tighter">Harmony Index</span>
            </div>
          </div>
          <p className="mt-8 text-stone-500 text-xs leading-relaxed">
            Higher values indicate you are emotionally available and balanced. 
            Lower values suggest self-prioritization is required.
          </p>
        </div>
      </div>

      {activeTab === 'chat' && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in zoom-in-95 duration-300">
           <div className="bg-[#0c0a09] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                    <Brain className="w-5 h-5 text-rose-500" />
                  </div>
                  <div>
                    <h2 className="font-bold">Insight Engine</h2>
                    <p className="text-[10px] text-stone-500 uppercase tracking-widest">AI Data Interpreter</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('overview')}
                  className="w-8 h-8 rounded-full border border-white/10 hover:bg-white/5 flex items-center justify-center text-stone-400"
                >
                  &times;
                </button>
              </div>
              <Chatbot logs={logs} results={results} />
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
