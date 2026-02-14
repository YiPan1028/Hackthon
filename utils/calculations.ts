
import { DailyLog, AnalysisResults, RiskLevel } from '../types';

export const analyzeEmotionalData = (logs: DailyLog[]): AnalysisResults => {
  if (logs.length < 2) {
    throw new Error("Need at least 2 days of data for trend analysis");
  }

  // 1. Emotional Volatility Score
  // Standard deviation of mood + average day-to-day jump
  const moods = logs.map(l => l.mood);
  const meanMood = moods.reduce((a, b) => a + b, 0) / moods.length;
  const stdDev = Math.sqrt(moods.map(x => Math.pow(x - meanMood, 2)).reduce((a, b) => a + b, 0) / moods.length);
  
  let jumps = 0;
  for (let i = 1; i < moods.length; i++) {
    jumps += Math.abs(moods[i] - moods[i - 1]);
  }
  const avgJump = jumps / (moods.length - 1);
  
  // Normalize to 0-100 (Assuming max stdDev ~3.5 and max avgJump ~5)
  const volatilityScore = Math.min(100, (stdDev * 15) + (avgJump * 10));

  // 2. Stress Accumulation Curve
  // Formula: A_i = 0.8 * A_{i-1} + s_i
  const stressAccumulation: number[] = [];
  let currentAccumulation = 0;
  logs.forEach(log => {
    currentAccumulation = (0.8 * currentAccumulation) + log.stress;
    stressAccumulation.push(Number(currentAccumulation.toFixed(2)));
  });

  // 3. Burnout Likelihood Score
  // Weights: Avg Stress (40%), Sleep Deficit (20%), Energy Depletion (20%), Mood Trend (20%)
  const avgStress = logs.reduce((sum, l) => sum + l.stress, 0) / logs.length;
  const avgSleep = logs.reduce((sum, l) => sum + l.sleep, 0) / logs.length;
  const sleepDeficit = Math.max(0, 8 - avgSleep) / 8; // Normalized deficit relative to 8h
  const avgEnergy = logs.reduce((sum, l) => sum + l.energy, 0) / logs.length;
  const energyDepletion = (10 - avgEnergy) / 10;
  
  // Simple mood trend: difference between start and end
  const moodTrend = (logs[0].mood - logs[logs.length - 1].mood) / 10; // Positive means declining mood
  
  const burnoutRaw = (avgStress * 4) + (sleepDeficit * 20) + (energyDepletion * 20) + (Math.max(0, moodTrend) * 20);
  const burnoutLikelihood = Math.min(100, burnoutRaw * 2); // Multiplier to reach 100

  // Risk Level
  let riskLevel = RiskLevel.STABLE;
  if (burnoutLikelihood > 70 || (volatilityScore > 80 && burnoutLikelihood > 40)) {
    riskLevel = RiskLevel.HIGH_RISK;
  } else if (burnoutLikelihood > 40 || volatilityScore > 50) {
    riskLevel = RiskLevel.CAUTION;
  }

  // 4. Emotional Battery
  // Derived from energy, sleep, and mood
  const battery = Math.min(100, (avgEnergy * 5) + (avgSleep * 5) + (logs[logs.length - 1].mood * 2));

  // 5. Love vs Stress Balance
  // Balance is higher when stress is low and mood/energy are high
  // Fix: changed avgMood to meanMood
  const loveStressBalance = Math.min(100, Math.max(0, 100 - (avgStress * 7) + (meanMood * 3)));

  return {
    volatilityScore,
    stressAccumulation,
    burnoutLikelihood,
    riskLevel,
    emotionalBattery: battery,
    loveStressBalance
  };
};

export const MOCK_LOGS: DailyLog[] = Array.from({ length: 7 }, (_, i) => ({
  day: i + 1,
  mood: Math.floor(Math.random() * 5) + 4,
  stress: Math.floor(Math.random() * 5) + 4,
  energy: Math.floor(Math.random() * 5) + 4,
  sleep: Math.floor(Math.random() * 3) + 6,
  reflection: ""
}));
