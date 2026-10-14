import React from 'react';
import { Flame, Award, Zap, ArrowUpRight } from 'lucide-react';

interface SpeedometerGaugeProps {
  streakDays: number;
  maxDays?: number;
  onIncrementStreak?: () => void;
  studentName?: string;
}

export function SpeedometerGauge({
  streakDays,
  maxDays = 30,
  onIncrementStreak,
  studentName = 'Student',
}: SpeedometerGaugeProps) {
  // Clamp streak between 0 and maxDays
  const currentStreak = Math.max(0, Math.min(maxDays, streakDays));
  const percentage = currentStreak / maxDays;

  // Gauge angle calculation (Speedometer arc from -135deg to +135deg = 270 total degrees)
  const angle = -135 + percentage * 270;

  // Color tier based on streak
  const tierColor =
    currentStreak >= 21
      ? 'from-emerald-500 to-teal-600 text-emerald-700 bg-emerald-50 border-emerald-200'
      : currentStreak >= 10
      ? 'from-blue-600 to-indigo-600 text-blue-700 bg-blue-50 border-blue-200'
      : 'from-amber-500 to-orange-600 text-amber-700 bg-amber-50 border-amber-200';

  const tierLabel =
    currentStreak >= 21
      ? '🔥 Elite Consistency Habit'
      : currentStreak >= 10
      ? '⚡ Regular Momentum'
      : '🌱 Building Routine';

  return (
    <div className="bg-gradient-to-br from-white via-slate-50 to-blue-50/40 border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col items-center justify-between relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500"></div>

      {/* Header */}
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shadow-blue-500/20">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 tracking-tight">Daily Login Speedometer</h4>
            <p className="text-[10px] text-slate-500">Consecutive Portal & Attendance Streak</p>
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${tierColor}`}>
          {tierLabel}
        </span>
      </div>

      {/* Speedometer SVG Dial */}
      <div className="relative w-48 h-32 flex items-center justify-center my-1">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 200 120">
          {/* Background Arc */}
          <path
            d="M 25 105 A 75 75 0 1 1 175 105"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Colored Progress Arc */}
          <path
            d="M 25 105 A 75 75 0 1 1 175 105"
            fill="none"
            stroke="url(#speedometerGradient)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray="235.6"
            strokeDashoffset={235.6 * (1 - percentage)}
            className="transition-all duration-700 ease-out"
          />

          <defs>
            <linearGradient id="speedometerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" /> {/* Amber */}
              <stop offset="50%" stopColor="#2563eb" /> {/* Blue */}
              <stop offset="100%" stopColor="#059669" /> {/* Emerald */}
            </linearGradient>
          </defs>

          {/* Ticks */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((pt, idx) => {
            const tickAngle = -135 + pt * 270;
            const rad = (tickAngle * Math.PI) / 180;
            const x1 = 100 + 62 * Math.cos(rad);
            const y1 = 105 + 62 * Math.sin(rad);
            const x2 = 100 + 70 * Math.cos(rad);
            const y2 = 105 + 70 * Math.sin(rad);
            return (
              <line
                key={idx}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#64748b"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            );
          })}

          {/* Needle Pivot & Needle */}
          <g transform={`rotate(${angle} 100 105)`} className="transition-transform duration-700 ease-out">
            {/* Needle line */}
            <polygon points="100,25 96,110 104,110" fill="#0f172a" />
            <circle cx="100" cy="105" r="5" fill="#2563eb" />
          </g>

          {/* Center Pin Hub */}
          <circle cx="100" cy="105" r="3" fill="#ffffff" />
        </svg>

        {/* Digital Readout in center */}
        <div className="absolute bottom-1 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-2xl font-black font-mono text-slate-900 tracking-tight">
            {currentStreak}
            <span className="text-xs font-bold text-slate-500 ml-1">Days</span>
          </div>
          <div className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">
            Streak Scale
          </div>
        </div>
      </div>

      {/* Scale Legend & Interactive Button */}
      <div className="w-full mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="text-[11px] text-slate-500 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Scale: 0 to {maxDays} days daily login</span>
        </div>

        {onIncrementStreak && (
          <button
            type="button"
            onClick={onIncrementStreak}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Simulate daily login (+1 Day Streak)"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+1 Day Login</span>
          </button>
        )}
      </div>
    </div>
  );
}
