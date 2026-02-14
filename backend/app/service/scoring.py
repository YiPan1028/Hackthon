# ============================================================
# LoveCare Scoring Engine
# 情绪健康评分引擎（Service Layer）
#
# EN:
# This module contains all business logic for emotional scoring.
# It does NOT depend on FastAPI or database.
# It can run independently for testing.
#
# CN:
# 本模块包含所有情绪评分的业务逻辑。
# 不依赖 FastAPI 或数据库。
# 可以单独运行测试。
# ============================================================

from dataclasses import dataclass
from typing import Any, Dict, List, Literal
import math


# ============================================================
# Utility Functions / 工具函数
# ============================================================

def clamp(x: float, lo: float, hi: float) -> float:
    """
    EN: Clamp a value into [lo, hi]
    CN: 将数值限制在指定区间
    """
    return max(lo, min(hi, x))


def mean(xs: List[float]) -> float:
    """
    EN: Calculate average
    CN: 计算平均值
    """
    return sum(xs) / len(xs) if xs else 0.0


def stddev(xs: List[float]) -> float:
    """
    EN: Population standard deviation (measures variability)
    CN: 总体标准差（衡量波动程度）
    """
    if not xs:
        return 0.0
    m = mean(xs)
    var = sum((x - m) ** 2 for x in xs) / len(xs)
    return math.sqrt(var)


def avg_abs_delta(xs: List[float]) -> float:
    """
    EN: Average absolute day-to-day change
    CN: 平均相邻两天的绝对变化值（衡量跳变）
    """
    if len(xs) < 2:
        return 0.0
    return sum(abs(xs[i] - xs[i - 1]) for i in range(1, len(xs))) / (len(xs) - 1)


def linear_trend_slope(xs: List[float]) -> float:
    """
    EN:
    Compute linear regression slope over time (t=0..n-1).
    Positive slope = upward trend.
    Negative slope = downward trend.

    CN:
    计算线性趋势斜率。
    正数表示上升趋势，负数表示下降趋势。
    """
    n = len(xs)
    if n < 2:
        return 0.0

    t_mean = (n - 1) / 2.0
    x_mean = mean(xs)

    num = 0.0
    den = 0.0
    for t, x in enumerate(xs):
        dt = t - t_mean
        dx = x - x_mean
        num += dt * dx
        den += dt * dt

    return num / den if den != 0 else 0.0


def normalize_0_100(x: float, x_min: float, x_max: float) -> float:
    """
    EN: Normalize value into 0-100 range.
    CN: 将数值归一化到 0-100 区间。
    """
    if x_max <= x_min:
        return 0.0
    return clamp((x - x_min) / (x_max - x_min) * 100.0, 0.0, 100.0)


# ============================================================
# Config / 参数配置
# ============================================================

@dataclass(frozen=True)
class ScoringConfig:
    """
    EN:
    All tunable parameters are centralized here.
    Adjust these values to calibrate demo output.

    CN:
    所有可调参数集中管理。
    Demo前如果分数偏高或偏低，可以在这里调整。
    """

    vol_w_std: float = 0.6
    vol_w_jump: float = 0.4

    mood_std_min: float = 0.0
    mood_std_max: float = 3.5
    mood_jump_min: float = 0.0
    mood_jump_max: float = 4.0

    stress_decay: float = 0.8

    risk_w_stress: float = 0.45
    risk_w_sleep_deficit: float = 0.20
    risk_w_energy_deficit: float = 0.25
    risk_w_mood_downtrend: float = 0.10

    sleep_target: float = 8.0

    risk_raw_min: float = 0.0
    risk_raw_max: float = 10.0

    green_max: float = 33.0
    yellow_max: float = 66.0


DEFAULT_CFG = ScoringConfig()


# ============================================================
# Core Calculations / 核心指标计算
# ============================================================

def calculate_volatility(mood: List[float], cfg=DEFAULT_CFG):
    """
    EN:
    Emotional volatility score (0-100).
    Combines standard deviation + day-to-day jump.

    CN:
    情绪波动分（0-100）。
    综合标准差与日间跳变。
    """
    s = stddev(mood)
    j = avg_abs_delta(mood)

    s_norm = normalize_0_100(s, cfg.mood_std_min, cfg.mood_std_max)
    j_norm = normalize_0_100(j, cfg.mood_jump_min, cfg.mood_jump_max)

    score = cfg.vol_w_std * s_norm + cfg.vol_w_jump * j_norm

    return {
        "mood_std": round(s, 4),
        "mood_jump": round(j, 4),
        "volatility_score": round(score, 2),
    }


def calculate_stress_accumulation(stress: List[float], cfg=DEFAULT_CFG):
    """
    EN:
    Stress accumulation model:
        A_i = decay * A_(i-1) + stress_i

    CN:
    压力累积模型：
        A_i = 衰减系数 * 前一天累积 + 当天压力
    """
    decay = clamp(cfg.stress_decay, 0.0, 0.99)

    curve = []
    prev = 0.0
    for s in stress:
        prev = decay * prev + s
        curve.append(prev)

    slope = linear_trend_slope(curve)

    return {
        "accumulation_curve": [round(x, 3) for x in curve],
        "accumulation_trend_slope": round(slope, 4),
        "latest_accumulation": round(curve[-1], 3) if curve else 0.0,
    }


def calculate_burnout_risk(
    mood, stress, sleep, energy,
    cfg=DEFAULT_CFG,
    max_reasons: int = 3,
    debug: bool = False,
):
    avg_stress = mean(stress)
    avg_sleep = mean(sleep)
    avg_energy = mean(energy)

    sleep_deficit = max(0.0, cfg.sleep_target - avg_sleep)   # hours
    energy_deficit = max(0.0, 10.0 - avg_energy)             # 0~10 assumed

    mood_slope = linear_trend_slope(mood)
    mood_downtrend = max(0.0, -mood_slope)

    # Contributions to risk_raw
    stress_term = cfg.risk_w_stress * avg_stress
    sleep_term  = cfg.risk_w_sleep_deficit * (sleep_deficit * 2.0)
    energy_term = cfg.risk_w_energy_deficit * (energy_deficit / 2.0)
    mood_term   = cfg.risk_w_mood_downtrend * (mood_downtrend * 5.0)

    risk_raw = stress_term + sleep_term + energy_term + mood_term
    risk_score = normalize_0_100(risk_raw, cfg.risk_raw_min, cfg.risk_raw_max)

    if risk_score <= cfg.green_max:
        label: Literal["Green", "Yellow", "Red"] = "Green"
    elif risk_score <= cfg.yellow_max:
        label = "Yellow"
    else:
        label = "Red"

    # Candidate reasons: (name, contribution, message)
    candidates: List[tuple[str, float, str]] = []

    # Stress gating
    if avg_stress >= 7.0:
        candidates.append(("stress", stress_term, "High average stress over the past week."))
    elif avg_stress >= 5.5:
        candidates.append(("stress", stress_term, "Moderate stress levels have been persistent."))

    # Sleep gating
    if sleep_deficit >= 2.0:
        candidates.append(("sleep", sleep_term, "Significant sleep deficit compared to the 8-hour target."))
    elif sleep_deficit >= 1.0:
        candidates.append(("sleep", sleep_term, "Not consistently meeting the 8-hour sleep target."))

    # Energy gating
    if energy_deficit >= 4.0:
        candidates.append(("energy", energy_term, "Low energy levels on average."))
    elif energy_deficit >= 2.0:
        candidates.append(("energy", energy_term, "Energy levels have been slightly below ideal."))

    # Mood trend gating
    if mood_downtrend >= 0.35:
        candidates.append(("mood", mood_term, "Mood has been trending downward across the week."))
    elif mood_downtrend >= 0.20:
        candidates.append(("mood", mood_term, "Slight downward mood trend detected."))

    # Sort by contribution and cap
    candidates.sort(key=lambda x: x[1], reverse=True)
    reasons = [msg for _, _, msg in candidates[:max(0, int(max_reasons))]]

    if not reasons:
        reasons = ["Overall indicators look stable this week."]

    result = {
        "burnout_risk_score": round(risk_score, 2),
        "burnout_risk_label": label,
        "burnout_reasons": reasons,
    }

    # Only attach debug payload when requested
    if debug:
        result["components_debug"] = {
            "avg_stress": round(avg_stress, 2),
            "avg_sleep": round(avg_sleep, 2),
            "avg_energy": round(avg_energy, 2),
            "sleep_deficit": round(sleep_deficit, 2),
            "energy_deficit": round(energy_deficit, 2),
            "mood_slope": round(mood_slope, 4),
            "mood_downtrend": round(mood_downtrend, 4),
            "risk_raw": round(risk_raw, 4),
            "contributions": {
                "stress": round(stress_term, 4),
                "sleep": round(sleep_term, 4),
                "energy": round(energy_term, 4),
                "mood": round(mood_term, 4),
            },
        }

    return result



def calculate_emotional_battery(stress, energy):
    """
    EN:
    Emotional battery indicator for UI display.

    CN:
    情绪电量指标（用于界面展示）。
    """
    s = mean(stress)
    e = mean(energy)

    battery = 100.0 - (0.6 * s + 0.4 * (10.0 - e)) * 10.0
    return round(clamp(battery, 0.0, 100.0), 2)


def generate_report(data: Dict[str, Any], cfg=DEFAULT_CFG):
    """
    EN:
    Main entry point for API.
    Combines all metrics into one JSON report.

    CN:
    后端 API 调用的主函数。
    整合所有指标生成报告。
    """

    mood = data["mood"]
    stress = data["stress"]
    sleep = data["sleep"]
    energy = data["energy"]

    volatility = calculate_volatility(mood, cfg)
    accumulation = calculate_stress_accumulation(stress, cfg)
    burnout = calculate_burnout_risk(mood, stress, sleep, energy, cfg)
    battery = calculate_emotional_battery(stress, energy)

    return {
        "metrics": {
            "volatility": volatility,
            "stress_accumulation": accumulation,
            "burnout_risk": burnout,
            "emotional_battery": battery,
        },
        "disclaimer": "Wellness insights only. Not medical diagnosis.",
    }


# ============================================================
# Local Test / 本地测试
# ============================================================

if __name__ == "__main__":

    # sample = {
    #     "mood":   [7, 6, 8, 5, 6, 4, 5],
    #     "stress": [5, 6, 7, 6, 8, 7, 6],
    #     "sleep":  [7, 6, 6, 5, 6, 5, 6],
    #     "energy": [8, 7, 6, 6, 5, 5, 6],
    # }

    # from pprint import pprint
    # pprint(generate_report(sample))
    # === Demo cases: Green / Yellow / Red ===
# 你可能需要把 key 名改成你项目里真实的字段名

    DEMO_CASES = [
    {
        "name": "Case A (Green) - healthy/stable",
        "mood":   [7, 7, 6.5, 7, 7.5, 7, 7],
        "stress": [2, 2, 3,   2, 2,   3, 2],
        "sleep":  [8, 8, 8,   7.5, 8, 8, 8],
        "energy": [8, 8, 7.5, 8,   8, 7.5, 8],
    },
    {
        "name": "Case B (Yellow) - mild risk",
        "mood":   [6, 6, 5.5, 6, 5, 5.5, 5],
        "stress": [5, 5, 6,   5, 6, 6,   5],
        "sleep":  [6.5, 6, 6, 6.5, 6, 6, 6],
        "energy": [6, 6, 5.5, 6,   5.5, 5, 5.5],
    },
    {
        "name": "Case C (Red) - high risk",
        "mood":   [1, 5.5, 5, 4, 3.5, 3, 2.5],
        "stress": [8, 8.5, 9, 8.5, 9, 9, 8.5],
        "sleep":  [4.5, 1, 4, 1, 4, 4, 4.5],
        "energy": [4, 3.5, 3, 3, 1, 2, 2],
    },
]

    from pprint import pprint

    for c in DEMO_CASES:
        name = c["name"]
        data = {k: v for k, v in c.items() if k != "name"}  # 去掉 name
        result = generate_report(data)
        print("\n" + name)
        pprint(result)


