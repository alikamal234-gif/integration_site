"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  ArrowLeft,
  Users,
  Sparkles,
  Key,
  Boxes,
  HelpCircle,
  Coffee,
  CheckCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { IStudent, IGame } from "@/lib/models";

export default function SoloPlayersPage() {
  const [soloPlayers, setSoloPlayers] = useState<IStudent[]>([]);
  const [soloGames, setSoloGames] = useState<IGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/data")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSoloPlayers(data.data.soloPlayers || []);
          const sg = (data.data.games || []).filter(
            (g: IGame) => g.category === "BOARD_SOLO"
          );
          setSoloGames(sg);
        }
      })
      .catch((e) => console.error("Error loading solo page:", e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-[#ffffff] relative">
      <div className="audio-grid-overlay" aria-hidden="true" />
      <div className="ambient-vignette" aria-hidden="true" />

      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-mono font-semibold text-slate-400 hover:text-white mb-6 group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Main Leaderboard</span>
        </Link>

        {/* Solo Lounge Banner */}
        <div className="youpulse-card laser-card p-6 sm:p-8 border-emerald-500/30 relative overflow-hidden mb-8">
          <div className="tech-corners" />
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Dedicated Social & Logic Lounge</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-white tracking-tight">
            Solo Players Hub & Board Games
          </h1>
          <p className="text-sm font-sans text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Welcome to the Solo Experience Zone! While the team tournament runs across the campus stations, solo participants enjoy free play across 3 dedicated algorithmic board games for fun, networking, and creative challenge outside the point system.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 font-mono">
            <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> {soloPlayers.length} Solo Participants
            </span>
            <span className="px-3.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5 text-amber-400" /> Free Play & Recreation
            </span>
            <span className="px-3.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-blue-400" /> Zero Clue Stress
            </span>
          </div>
        </div>

        {/* 3 Solo Board Games Showcase */}
        <div className="space-y-4 mb-10">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Active Solo Board Games
            </h2>
            <span className="text-xs font-mono text-slate-400">Location: Solo Lounge - Library Deck</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Solo Game 1: Algorithmic Maze */}
            <div className="youpulse-card laser-card p-6 flex flex-col justify-between border-slate-800">
              <div className="tech-corners" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Station #12
                  </span>
                  <Compass className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="font-display text-lg font-bold text-white">Algorithmic Maze (Turing Rush)</h3>
                <p className="text-xs font-mono text-emerald-300/80 font-medium mt-0.5">
                  Physical Algorithmic Puzzle
                </p>
                <p className="text-xs font-sans text-slate-300 mt-3 leading-relaxed">
                  Map condition instruction blocks (<code>IF</code>, <code>LOOP</code>, <code>TURN</code>, <code>STEP</code>) onto a physical grid to guide a bot through obstacles from origin to target under 3 minutes.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-800 text-xs font-mono text-slate-400 flex justify-between">
                <span>Open all day</span>
                <span className="text-emerald-400 font-semibold">Levels 1 to 5</span>
              </div>
            </div>

            {/* Solo Game 2: Codenames Dev Cipher */}
            <div className="youpulse-card laser-card p-6 flex flex-col justify-between border-slate-800">
              <div className="tech-corners" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Station #13
                  </span>
                  <Key className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="font-display text-lg font-bold text-white">Codenames: Dev Cipher Solo</h3>
                <p className="text-xs font-mono text-emerald-300/80 font-medium mt-0.5">
                  Deductive Log Cracker
                </p>
                <p className="text-xs font-sans text-slate-300 mt-3 leading-relaxed">
                  Inspect a 4x4 matrix of developer terms (Docker, Git, React, Kernel, CORS). Decode server log clue hints to reveal target keywords without triggering corrupt memory blocks.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-800 text-xs font-mono text-slate-400 flex justify-between">
                <span>Open all day</span>
                <span className="text-emerald-400 font-semibold">Solo Deduction</span>
              </div>
            </div>

            {/* Solo Game 3: Katamino Architecture */}
            <div className="youpulse-card laser-card p-6 flex flex-col justify-between border-slate-800">
              <div className="tech-corners" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Station #14
                  </span>
                  <Boxes className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="font-display text-lg font-bold text-white">Katamino Pentomino Grid</h3>
                <p className="text-xs font-mono text-emerald-300/80 font-medium mt-0.5">
                  Tactile Spatial Geometry
                </p>
                <p className="text-xs font-sans text-slate-300 mt-3 leading-relaxed">
                  Adjust the wooden boundary bar (Penta 4 through Penta 8). Place polyomino blocks into a solid, perfectly aligned geometric rectangle. Relaxing and deeply satisfying.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-800 text-xs font-mono text-slate-400 flex justify-between">
                <span>Open all day</span>
                <span className="text-emerald-400 font-semibold">Penta 4 to 8</span>
              </div>
            </div>
          </div>
        </div>

        {/* Solo Players Directory */}
        <div className="youpulse-card p-6 sm:p-7 border-slate-800">
          <div className="tech-corners" />
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-[#00d2ff]" />
                Registered Solo Participants
              </h2>
              <p className="text-xs font-sans text-slate-400 mt-0.5">
                Students participating in the Day of Integration solo experience.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-300 bg-[#07090e] px-3.5 py-1 rounded-full border border-slate-800">
              {soloPlayers.length} Students
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {soloPlayers.map((student, idx) => (
              <div
                key={student._id || idx}
                className="p-3.5 rounded-xl bg-[#07090e]/80 border border-slate-800/80 hover:border-emerald-500/40 transition-colors flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-sans font-bold text-white truncate max-w-[140px]">
                    {student.fullName}
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                    {student.className}
                  </span>
                </div>

                <div className="flex flex-col items-end gap-1 font-mono">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-[#38bdf8] font-semibold">
                    {student.year}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {student.gender}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
