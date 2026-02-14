
export interface DailyLog {
  day: number;
  mood: number;    // 1-10
  stress: number;  // 1-10
  energy: number;  // 1-10
  sleep: number;   // hours
  reflection: string;
}

export enum RiskLevel {
  STABLE = 'STABLE',
  CAUTION = 'CAUTION',
  HIGH_RISK = 'HIGH_RISK'
}

export interface AnalysisResults {
  volatilityScore: number;       // 0-100
  stressAccumulation: number[];  // 7 days of accumulated values
  burnoutLikelihood: number;    // 0-100
  riskLevel: RiskLevel;
  emotionalBattery: number;     // 0-100
  loveStressBalance: number;    // 0-100 (Higher = more Love/Balance)
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
