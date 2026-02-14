
import React from 'react';
import { DailyLog } from '../types';
import { Heart, Plus, CheckCircle, Clock, Zap, Moon } from 'lucide-react';

interface CalendarDashboardProps {
  logs: DailyLog[];
  onSelectDay: (index: number) => void;
  onAnalyze: () => void;
  isReady: boolean;
}

const CalendarDashboard: React.FC<CalendarDashboardProps> = ({ logs, onSelectDay, onAnalyze, isReady }) => {
  const completedCount = logs.filter(l => l.reflection !== "" || l.mood !== 5 || l.stress !== 5).length;

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold">Weekly Emotional Canvas</h2>
          <p className="text-stone-500 text-sm">Select a day to map your internal state.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
          <div className="text-right">
            <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Progress</div>
            <div className="text-sm font-bold text-rose-500">{completedCount} / 7 Days</div>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-white/5 flex items-center justify-center relative">
             <svg className="w-full h-full transform -rotate-90 absolute">
                <circle
                  cx="24" cy="24" r="20"
                  fill="none" stroke="currentColor" strokeWidth="3"
                  className="text-white/5"
                />
                <circle
                  cx="24" cy="24" r="20"
                  fill="none" stroke="currentColor" strokeWidth="3"
                  strokeDasharray={126}
                  strokeDashoffset={126 - (126 * completedCount / 7)}
                  className="text-rose-500 transition-all duration-700"
                />
             </svg>
             <Heart className={`w-4 h-4 ${completedCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-stone-700'}`} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
        {logs.map((log, index) => {
          const isStarted = log.reflection !== "" || log.mood !== 5 || log.stress !== 5;
          return (
            <button
              key={index}
              onClick={() => onSelectDay(index)}
              className={`group relative flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all duration-300 ${
                isStarted 
                  ? 'bg-rose-500/5 border-rose-500/30 hover:bg-rose-500/10' 
                  : 'bg-white/2 border-white/5 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <span className="text-[10px] font-black text-stone-600 uppercase tracking-widest group-hover:text-stone-400 transition-colors">
                Day {log.day}
              </span>
              
              <div className="my-2">
                {isStarted ? (
                  <div className="grid grid-cols-2 gap-1 opacity-80">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] font-bold">{log.energy}</span>
                    <Moon className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] font-bold">{log.sleep}h</span>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-dashed border-white/10 group-hover:scale-110 transition-transform">
                    <Plus className="w-4 h-4 text-stone-600" />
                  </div>
                )}
              </div>

              {isStarted && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="w-3 h-3 text-rose-500" />
                </div>
              )}

              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                 <div 
                   className="h-full bg-rose-500 transition-all duration-500" 
                   style={{ width: `${log.mood * 10}%`, opacity: isStarted ? 1 : 0 }} 
                 />
              </div>
            </button>
          );
        })}
      </div>

      <div className="pt-8 flex flex-col items-center gap-4">
        <button
          onClick={onAnalyze}
          disabled={!isReady}
          className={`px-12 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 shadow-xl ${
            isReady 
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/20 scale-105' 
              : 'bg-white/5 text-stone-600 cursor-not-allowed grayscale'
          }`}
        >
          <Heart className={`w-5 h-5 ${isReady ? 'fill-white animate-pulse' : ''}`} />
          Analyze Week
        </button>
        {!isReady && (
          <p className="text-[10px] text-stone-600 uppercase font-bold tracking-widest">
            Log at least 2 days to unlock Python Analytics
          </p>
        )}
      </div>
    </div>
  );
};

export default CalendarDashboard;
