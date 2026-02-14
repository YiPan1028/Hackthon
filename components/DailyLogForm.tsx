
import React from 'react';
import { DailyLog } from '../types';
import { ChevronLeft, Save, Calendar } from 'lucide-react';

interface DailyLogFormProps {
  log: DailyLog;
  onUpdate: (log: DailyLog) => void;
  onBack: () => void;
}

const DailyLogForm: React.FC<DailyLogFormProps> = ({ log, onUpdate, onBack }) => {
  const updateField = (field: keyof DailyLog, value: any) => {
    onUpdate({ ...log, [field]: value });
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-300 transition-colors text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Canvas
        </button>
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/20">
          <Calendar className="w-4 h-4 text-rose-500" />
          <span className="font-bold text-rose-500 text-sm tracking-widest uppercase">Day {log.day}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-8">
          <MetricSlider 
            label="Mood Level" 
            value={log.mood} 
            onChange={(v) => updateField('mood', v)} 
            min={1} max={10} 
            lowLabel="Depleted" highLabel="Radiant" 
          />
          <MetricSlider 
            label="Stress Intensity" 
            value={log.stress} 
            onChange={(v) => updateField('stress', v)} 
            min={1} max={10} 
            lowLabel="Zen" highLabel="Chaos" 
          />
        </div>
        <div className="space-y-8">
          <MetricSlider 
            label="Vitality / Energy" 
            value={log.energy} 
            onChange={(v) => updateField('energy', v)} 
            min={1} max={10} 
            lowLabel="Zero" highLabel="Vibrant" 
          />
          <MetricSlider 
            label="Sleep Performance" 
            value={log.sleep} 
            onChange={(v) => updateField('sleep', v)} 
            min={0} max={12} 
            lowLabel="0h" highLabel="12h+" 
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">Reflective Notes</label>
        <textarea 
          value={log.reflection}
          onChange={(e) => updateField('reflection', e.target.value)}
          placeholder="Briefly, what influenced your energy or mood today?"
          className="w-full bg-black/40 border border-white/5 rounded-3xl p-6 focus:ring-2 focus:ring-rose-500/30 outline-none transition-all h-32 text-sm leading-relaxed"
        />
      </div>

      <button 
        onClick={onBack}
        className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
      >
        <Save className="w-4 h-4" /> Confirm Updates
      </button>
    </div>
  );
};

const MetricSlider: React.FC<{
  label: string; 
  value: number; 
  onChange: (v: number) => void; 
  min: number; 
  max: number;
  lowLabel: string;
  highLabel: string;
}> = ({ label, value, onChange, min, max, lowLabel, highLabel }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-end">
      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">{label}</label>
      <span className="text-3xl font-black text-rose-500 tabular-nums">{value}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={1}
      value={value} 
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
    />
    <div className="flex justify-between text-[9px] text-stone-600 uppercase tracking-widest font-bold">
      <span>{lowLabel}</span>
      <span>{highLabel}</span>
    </div>
  </div>
);

export default DailyLogForm;
