"use client";

import { Sparkles, Users, User, Compass, Zap, Cpu, Boxes, Key, ShieldCheck, Trophy } from "lucide-react";

export default function BoardGamesShowcase() {
  return (
    <div className="space-y-10">
      {/* Intro Header */}
      <div className="youpulse-card laser-card p-6 sm:p-8 border-purple-500/30 relative overflow-hidden">
        <div className="tech-corners" />
        <div className="flex items-center space-x-2 text-purple-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Interactive Board Game Ecosystem</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
          Board Games: 3 Solo & 2 Team vs Team Challenges
        </h2>
        <p className="text-sm font-sans text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Engineered for YouCode Day of Integration. The <strong>2 Team Board Games</strong> are competitive stations that award secret clues towards the final reveal, while the <strong>3 Solo Board Games</strong> provide a fun, relaxed, and stimulating algorithmic vibe for solo participants outside the point system.
        </p>
      </div>

      {/* SECTION 1: The 2 Team vs Team Board Games */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="font-display text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-400" />
            2 Team vs Team Board Games (Award Clues!)
          </h3>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold self-start sm:self-auto">
            Competitive Station • Winner Takes Clue
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Team Game 1: Code Names Dev Clash */}
          <div className="youpulse-card laser-card p-6 flex flex-col justify-between border-purple-500/30">
            <div className="tech-corners" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Station #10 • 6 vs 6
                </span>
                <Cpu className="w-6 h-6 text-purple-400" />
              </div>

              <h4 className="font-display text-xl font-black text-white tracking-tight">
                Code Names: Dev Clash
              </h4>
              <p className="text-xs font-mono text-purple-300/80 font-medium mt-0.5">
                Competitive Word Deduction & Developer Culture Strategy
              </p>

              <div className="mt-4 space-y-3 text-xs font-sans text-slate-300 leading-relaxed">
                <p>
                  <strong>How it works:</strong> Two teams sit opposite each other across a 5x5 card grid containing 25 cards with programming and campus culture terms (e.g., <em>Docker, Git Push, Recursion, Spaghetti Code, CORS, SQL Injection</em>).
                </p>
                <p>
                  <strong>The Roles:</strong> Each team appoints one <strong>Tech Lead (Spymaster)</strong>. Both Tech Leads see the secret key grid showing which cards belong to Team Blue, Team Red, innocent neutral variables, and the fatal <strong>Black Screen of Death (Assassin)</strong>.
                </p>
                <p>
                  <strong>Winning Condition:</strong> Tech Leads give a 1-word clue and a number (e.g., <em>"Security: 3"</em>). Operatives debate and touch cards. First team to identify all their team's code words wins the station and <strong>receives the Clue token</strong>! If a team taps the Assassin card, they lose immediately.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-purple-500/20 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Duration: 10–12 Mins</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-amber-400" /> Awards Clue
              </span>
            </div>
          </div>

          {/* Team Game 2: Flip 7 Overclock */}
          <div className="youpulse-card laser-card p-6 flex flex-col justify-between border-purple-500/30">
            <div className="tech-corners" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Station #11 • Push Your Luck
                </span>
                <Zap className="w-6 h-6 text-amber-400" />
              </div>

              <h4 className="font-display text-xl font-black text-white tracking-tight">
                Flip 7: Overclock Edition
              </h4>
              <p className="text-xs font-mono text-amber-300/80 font-medium mt-0.5">
                High-Stakes Probabilistic Card Push & Multipliers
              </p>

              <div className="mt-4 space-y-3 text-xs font-sans text-slate-300 leading-relaxed">
                <p>
                  <strong>How it works:</strong> A deck contains number cards (1 to 12) corresponding to their numerical frequency (twelve 12s, eleven 11s, down to one 1), plus special action cards: <em>Second Chance, Freeze, and +10 Overclock</em>.
                </p>
                <p>
                  <strong>The Heat:</strong> Team players alternate drawing cards into their collective team buffer. The goal is to accumulate points. However, drawing a duplicate number causes a <strong>System Crash (Bust)</strong> and all unbanked points in that round are lost!
                </p>
                <p>
                  <strong>Winning Condition:</strong> Both teams play 3 rapid heats. The team with the highest aggregate points across the 3 rounds wins the match and <strong>takes home the Station Clue</strong>.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-purple-500/20 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Duration: 8–10 Mins</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-amber-400" /> Awards Clue
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: The 3 Solo Board Games */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="font-display text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            3 Dedicated Solo Board Games (Pure Fun & Coding Vibe!)
          </h3>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold self-start sm:self-auto">
            Solo Lounge • No Point Stress • Friendly Atmosphere
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Solo Game 1: Algorithmic Maze */}
          <div className="youpulse-card laser-card p-6 flex flex-col justify-between border-emerald-500/30">
            <div className="tech-corners" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Station #12 • Logic Speed
                </span>
                <Compass className="w-6 h-6 text-emerald-400" />
              </div>

              <h4 className="font-display text-lg font-bold text-white tracking-tight">
                Algorithmic Maze (Turing Rush)
              </h4>
              <p className="text-xs font-mono text-emerald-300/80 font-medium mt-0.5">
                Physical Algorithm Construction Maze
              </p>

              <div className="mt-4 space-y-2.5 text-xs font-sans text-slate-300 leading-relaxed">
                <p>
                  <strong>Concept:</strong> A tactical physical puzzle where solo players draw challenge cards with start, obstacle, and endpoint nodes.
                </p>
                <p>
                  <strong>Gameplay:</strong> You receive physical wooden instruction tokens (<code>STEP</code>, <code>TURN_LEFT</code>, <code>IF_WALL</code>, <code>LOOP_3X</code>).
                </p>
                <p>
                  <strong>Goal:</strong> Form the shortest valid program path from origin to destination in under 3 minutes.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Time: 3–5 min / card</span>
              <span className="text-emerald-400 font-semibold">Levels 1 to 5</span>
            </div>
          </div>

          {/* Solo Game 2: Codenames Dev Cipher Solo */}
          <div className="youpulse-card laser-card p-6 flex flex-col justify-between border-emerald-500/30">
            <div className="tech-corners" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Station #13 • Deduction
                </span>
                <Key className="w-6 h-6 text-emerald-400" />
              </div>

              <h4 className="font-display text-lg font-bold text-white tracking-tight">
                Dev Cipher Solo (Codenames Duet)
              </h4>
              <p className="text-xs font-mono text-emerald-300/80 font-medium mt-0.5">
                Cryptographic Code Word Cracker
              </p>

              <div className="mt-4 space-y-2.5 text-xs font-sans text-slate-300 leading-relaxed">
                <p>
                  <strong>Concept:</strong> A single-player deduction board with a 4x4 array of developer vocabulary.
                </p>
                <p>
                  <strong>Gameplay:</strong> You draw mission cipher cards with clue keywords and target counts (e.g. <em>"Frontend State: 2"</em>).
                </p>
                <p>
                  <strong>Goal:</strong> Correctly pinpoint all target words within 5 turns without hitting corrupt memory addresses.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Time: 5–7 min</span>
              <span className="text-emerald-400 font-semibold">Solo Puzzle</span>
            </div>
          </div>

          {/* Solo Game 3: Katamino Architecture */}
          <div className="youpulse-card laser-card p-6 flex flex-col justify-between border-emerald-500/30">
            <div className="tech-corners" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Station #14 • Spatial Logic
                </span>
                <Boxes className="w-6 h-6 text-emerald-400" />
              </div>

              <h4 className="font-display text-lg font-bold text-white tracking-tight">
                Katamino Pentomino Grid
              </h4>
              <p className="text-xs font-mono text-emerald-300/80 font-medium mt-0.5">
                Geometric Spatial Packing Challenge
              </p>

              <div className="mt-4 space-y-2.5 text-xs font-sans text-slate-300 leading-relaxed">
                <p>
                  <strong>Concept:</strong> Modular geometric wooden polyomino pieces that fit together onto a sliding grid board.
                </p>
                <p>
                  <strong>Gameplay:</strong> Set the boundary slider to Penta 4, 5, 6, 7, or 8. Select the designated pieces indicated in the booklet.
                </p>
                <p>
                  <strong>Goal:</strong> Fit all selected pieces into a seamless, gap-free rectangle. Ultra satisfying and tactile!
                </p>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Time: 4–6 min / level</span>
              <span className="text-emerald-400 font-semibold">Penta 4 to 8</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
