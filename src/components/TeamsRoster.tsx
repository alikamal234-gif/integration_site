"use client";

import Link from "next/link";
import { Users, QrCode, ExternalLink, ShieldCheck, UserCheck } from "lucide-react";
import { ITeam } from "@/lib/models";

interface TeamsRosterProps {
  teams: ITeam[];
}

export default function TeamsRoster({ teams }: TeamsRosterProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00d2ff]" />
            Balanced Team Rosters
          </h2>
          <p className="text-xs font-sans text-slate-400 mt-1">
            Demographically balanced across Year (A1/A2), Classes (A/B/C/D), and Gender to guarantee fair play and authentic integration.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-[#00d2ff] bg-[rgba(0,102,255,0.12)] border border-[rgba(0,210,255,0.3)] px-3.5 py-1.5 rounded-full font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>{teams.length} Teams Registered • 6 Players Target</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team, idx) => {
          const members = team.members || [];
          const a1Count = members.filter((m) => m.year === "A1").length;
          const a2Count = members.filter((m) => m.year === "A2").length;
          const maleCount = members.filter((m) => m.gender === "Male").length;
          const femaleCount = members.filter((m) => m.gender === "Female").length;

          return (
            <div
              key={team._id || idx}
              className="youpulse-card laser-card p-6 flex flex-col justify-between"
            >
              <div className="tech-corners" />

              <div>
                {/* Team Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className="w-4 h-4 rounded-full ring-2 ring-white/20 shadow-sm shrink-0"
                      style={{ backgroundColor: team.color }}
                    />
                    <h3 className="font-display text-lg font-bold text-white tracking-tight">{team.name}</h3>
                  </div>

                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    #{idx + 1}
                  </span>
                </div>

                {/* Balance Metrics Chips */}
                <div className="flex flex-wrap items-center gap-1.5 mb-4 font-mono">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-[#38bdf8] font-semibold border border-blue-500/20">
                    A1: {a1Count} | A2: {a2Count}
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 font-semibold border border-purple-500/20">
                    M: {maleCount} | F: {femaleCount}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                    {members.length} players
                  </span>
                </div>

                {/* Member Roster List */}
                <div className="space-y-1.5">
                  {members.map((member, mIdx) => (
                    <div
                      key={mIdx}
                      className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-[#07090e]/70 border border-slate-800/80 hover:border-slate-700 transition-colors"
                    >
                      <span className="text-slate-200 font-medium truncate pr-2 font-sans">
                        {member.fullName}
                      </span>
                      <div className="flex items-center space-x-1 shrink-0 font-mono">
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-[#38bdf8]">
                          {member.year}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {member.className.replace("Class ", "")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer action link to team page */}
              <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">
                  {team.clueCount} Clues Unlocked
                </span>

                <Link
                  href={`/team/${team._id}`}
                  className="btn-youpulse-primary py-1.5 px-3 text-xs"
                >
                  <span>Team Hub</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
