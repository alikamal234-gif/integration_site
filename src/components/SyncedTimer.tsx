"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface SyncedTimerProps {
  startedAt?: Date | string | null;
  status: "pending" | "in_progress" | "completed";
  durationMinutes?: number;
  className?: string;
}

export default function SyncedTimer({
  startedAt,
  status,
  durationMinutes = 15,
  className = "",
}: SyncedTimerProps) {
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

  useEffect(() => {
    if (status !== "in_progress" || !startedAt) {
      setSecondsElapsed(0);
      return;
    }

    const startTime = new Date(startedAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = Math.max(0, Math.floor((now - startTime) / 1000));
      setSecondsElapsed(elapsed);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startedAt, status]);

  const totalTargetSeconds = durationMinutes * 60;
  const remainingSeconds = Math.max(0, totalTargetSeconds - secondsElapsed);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (status === "pending") {
    return (
      <span className={`inline-flex items-center space-x-1.5 text-xs text-slate-400 font-mono ${className}`}>
        <Clock className="w-3.5 h-3.5 text-slate-500" />
        <span>Ready: {durationMinutes}:00</span>
      </span>
    );
  }

  if (status === "completed") {
    return (
      <span className={`inline-flex items-center space-x-1.5 text-xs text-slate-400 font-mono ${className}`}>
        <Clock className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-emerald-400 font-medium">Finished</span>
      </span>
    );
  }

  const isLowTime = remainingSeconds < 120; // under 2 mins

  return (
    <div
      className={`inline-flex items-center space-x-1.5 font-mono text-xs font-semibold px-2 py-0.5 rounded-md border ${
        isLowTime
          ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse"
          : "bg-blue-500/20 text-blue-300 border-blue-500/30"
      } ${className}`}
    >
      <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "3s" }} />
      <span>
        {formatTime(remainingSeconds)} <span className="text-[10px] opacity-75">({formatTime(secondsElapsed)} in)</span>
      </span>
    </div>
  );
}

