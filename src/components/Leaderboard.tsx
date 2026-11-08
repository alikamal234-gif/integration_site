"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, Medal, Award, ChevronRight, Search, Key, Users, Sparkles } from "lucide-react";
import { ITeam } from "@/lib/models";

interface LeaderboardProps {
  teams: ITeam[];
  currentStationMappings: any[];
  currentRound: number;
}

export default function Leaderboard({
  teams,
  currentStationMappings,
  currentRound,
}: LeaderboardProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const top3 = teams.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Top 3 Podium Cards with Cyber Holographic style */}
      {teams.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          {/* #2 Rank - Silver */}
          {top3[1] && (
            <div className="order-2 md:order-1 youpulse-card laser-card p-6 flex flex-col justify-between border-slate-700/60">
              <div className="tech-corners" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-300/15 text-slate-200 font-mono font-bold text-sm border border-slate-300/30 shadow-sm">
                    #2
                  </span>
                  <Medal className="w-6 h-6 text-slate-300" />
                </div>
                <h3 className="font-display text-xl font-bold text-white tracking-tight">{top3[1].name}</h3>
                <p className="text-xs font-mono text-slate-400 mt-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  {top3[1].members?.length || 6} players • Balanced
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Key className="w-4 h-4 text-[#00d2ff]" />
                    <span className="text-sm font-mono font-semibold text-white">
                      {top3[1].clueCount} <span className="text-xs text-slate-400">/ 9 clues</span>
                    </span>
                  </div>
                  <Link
                    href={`/team/${top3[1]._id}`}
                    className="text-xs font-mono font-semibold text-[#38bdf8] hover:text-white flex items-center gap-0.5"
                  >
                    Roadmap <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                {/* Clue slots */}
                <div className="grid grid-cols-9 gap-1.5 mt-3">
                  {Array.from({ length: 9 }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 rounded-xs ${
                        idx < top3[1].clueCount
                          ? "bg-gradient-to-r from-[#0066ff] to-[#00d2ff] shadow-sm shadow-[#0066ff]/60"
                          : "bg-slate-900 border border-slate-800"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* #1 Rank - Gold Champion */}
          {top3[0] && (
            <div className="order-1 md:order-2 youpulse-card laser-card p-7 border-amber-500/40 relative flex flex-col justify-between shadow-2xl shadow-amber-500/10 md:-translate-y-2">
              <div className="tech-corners" />
              <div className="absolute top-4 right-4">
                <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-extrabold uppercase tracking-wider border border-amber-500/40">
                  LEADER #1
                </span>
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black text-lg shadow-md shadow-amber-500/40">
                    #1
                  </span>
                  <Trophy className="w-7 h-7 text-amber-400 animate-pulse" />
                </div>
                <h3 className="font-display text-2xl font-black text-white tracking-tight">{top3[0].name}</h3>
                <p className="text-xs font-mono text-amber-200/80 mt-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  {top3[0].members?.length || 6} players • Top Clue Hunters
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-amber-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Key className="w-5 h-5 text-amber-400" />
                    <span className="text-base font-mono font-bold text-white">
                      {top3[0].clueCount} <span className="text-xs text-amber-300/70 font-normal">/ 9 clues collected</span>
                    </span>
                  </div>
                  <Link
                    href={`/team/${top3[0]._id}`}
                    className="text-xs font-mono font-bold text-amber-300 hover:text-white flex items-center bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30"
                  >
                    View Roadmap <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </Link>
                </div>
                {/* Clue slots */}
                <div className="grid grid-cols-9 gap-1.5 mt-3">
                  {Array.from({ length: 9 }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2.5 rounded-xs ${
                        idx < top3[0].clueCount
                          ? "bg-gradient-to-r from-amber-400 to-yellow-300 shadow-sm shadow-amber-500/70"
                          : "bg-slate-900 border border-slate-800"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* #3 Rank - Bronze */}
          {top3[2] && (
            <div className="order-3 youpulse-card laser-card p-6 flex flex-col justify-between border-amber-800/40">
              <div className="tech-corners" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-700/20 text-amber-200 font-mono font-bold text-sm border border-amber-700/40">
                    #3
                  </span>
                  <Award className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="font-display text-xl font-bold text-white tracking-tight">{top3[2].name}</h3>
                <p className="text-xs font-mono text-slate-400 mt-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  {top3[2].members?.length || 6} players • Balanced
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Key className="w-4 h-4 text-[#00d2ff]" />
                    <span className="text-sm font-mono font-semibold text-white">
                      {top3[2].clueCount} <span className="text-xs text-slate-400">/ 9 clues</span>
                    </span>
                  </div>
                  <Link
                    href={`/team/${top3[2]._id}`}
                    className="text-xs font-mono font-semibold text-[#38bdf8] hover:text-white flex items-center gap-0.5"
                  >
                    Roadmap <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                {/* Clue slots */}
                <div className="grid grid-cols-9 gap-1.5 mt-3">
                  {Array.from({ length: 9 }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 rounded-xs ${
                        idx < top3[2].clueCount
                          ? "bg-gradient-to-r from-amber-600 to-orange-400 shadow-sm shadow-orange-500/50"
                          : "bg-slate-900 border border-slate-800"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Standings Table with YouPulse Styling */}
      <div className="youpulse-card p-6 sm:p-7">
        <div className="tech-corners" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#00d2ff]" />
              Official Tournament Standings
            </h2>
            <p className="text-xs font-sans text-slate-400 mt-0.5">
              Rankings determined by total secret clue fragments collected across rounds.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by team name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#07090e] text-xs font-mono text-white pl-9 pr-4 py-2 rounded-full border border-slate-700/70 focus:border-[#00d2ff] focus:outline-none w-full sm:w-60"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-4">Round {currentRound} Station</th>
                <th className="py-3 px-4 text-center">Clues</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredTeams.map((team, index) => {
                const stationMatch = currentStationMappings.find((m) => m.teamId === team._id);

                return (
                  <tr
                    key={team._id}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs ${
                          index === 0
                            ? "bg-amber-500 text-slate-950 font-black"
                            : index === 1
                            ? "bg-slate-300 text-slate-950 font-bold"
                            : index === 2
                            ? "bg-amber-700 text-white font-bold"
                            : "text-slate-400"
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full ring-2 ring-white/10 shrink-0"
                          style={{ backgroundColor: team.color }}
                        />
                        <div>
                          <span className="font-display font-bold text-white text-sm group-hover:text-[#38bdf8] transition-colors">
                            {team.name}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 block">
                            {team.members?.length || 6} students
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {stationMatch ? (
                        <div className="flex items-center space-x-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              stationMatch.status === "in_progress"
                                ? "bg-emerald-400 animate-ping"
                                : stationMatch.status === "completed"
                                ? "bg-blue-400"
                                : "bg-slate-500"
                            }`}
                          />
                          <div>
                            <span className="text-white font-medium block">
                              {stationMatch.gameName}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {stationMatch.gameLocation}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 font-mono">Transit</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center space-x-1.5 mb-1.5 font-mono">
                          <Key className="w-3.5 h-3.5 text-amber-400" />
                          <span className="font-bold text-white text-xs">
                            {team.clueCount} / 9
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          {Array.from({ length: 9 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-3 h-1.5 rounded-xs ${
                                i < team.clueCount
                                  ? "bg-gradient-to-r from-[#0066ff] to-[#00d2ff]"
                                  : "bg-slate-900 border border-slate-800"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/team/${team._id}`}
                        className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold bg-[rgba(0,102,255,0.12)] hover:bg-[#0066ff] text-[#38bdf8] hover:text-white transition-all border border-[rgba(0,210,255,0.25)] hover:border-[#0066ff]"
                      >
                        <span>Team View</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
