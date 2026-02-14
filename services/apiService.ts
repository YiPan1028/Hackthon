// services/apiService.ts
import type { DailyLog, AnalysisResults } from "../types";

/**
 * Vite 里正确读 env 的方式是 import.meta.env
 * 你现在写 (import.meta as any).env 也能跑，但 TS/IDE 会爆红。
 */
const API_BASE = (import.meta as any).env?.VITE_API_BASE || "http://127.0.0.1:8002";


type AuthResponse = {
  success: boolean;
  user?: any;
  detail?: string;
};


async function safeJson(res: Response): Promise<any> {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

function normalizeLogs(logs: DailyLog[]) {
  // 确保后端拿到的字段名和类型都对（避免 422）
  return logs.map((l) => ({
    day: Number(l.day),
    mood: Number(l.mood),
    stress: Number(l.stress),
    energy: Number(l.energy),
    sleep: Number(l.sleep),
    reflection: (l as any).reflection ?? "",
  }));
}

export const apiService = {
  register: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await safeJson(res);

    if (!res.ok) {
      return {
        success: false,
        detail: data?.detail || `Register failed (${res.status})`,
      };
    }

    // FastAPI: { status:"success", user:{...} }
    return { success: true, user: data.user };
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await safeJson(res);

    if (!res.ok) {
      return {
        success: false,
        detail: data?.detail || `Login failed (${res.status})`,
      };
    }

    // FastAPI: { status:"success", token:"...", user:{email,name} }
    return { success: true, user: data.user };
  },

  calculateMetrics: async (
    email: string,
    logs: DailyLog[]
  ): Promise<AnalysisResults> => {
    const payload = {
      email,
      logs: normalizeLogs(logs),
    };

    const res = await fetch(`${API_BASE}/analysis/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await safeJson(res);

    if (!res.ok) {
      // FastAPI 422 会给 detail 是数组，这里把它 stringify 出来方便你 debug
      const detail =
        typeof data?.detail === "string"
          ? data.detail
          : data?.detail
          ? JSON.stringify(data.detail)
          : `Backend calculation failed (${res.status})`;
      throw new Error(detail);
    }

    return data as AnalysisResults;
  },
};
