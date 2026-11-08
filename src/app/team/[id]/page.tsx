"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Key,
  Lock,
  Unlock,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Share2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import SyncedTimer from "@/components/SyncedTimer";

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params?.id as string;

  const [teamData, setTeamData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const fetchTeam = async () => {
    if (!teamId) return;
    try {
      const res = await fetch(`/api/public/team/${teamId}`);
      const json = await res.json();
      if (json.success && json.team) {
        setTeamData(json.team);
      }
    } catch (e) {
      console.error("Failed to load team data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
    const interval = setInterval(fetchTeam, 4000);
    return () => clearInterval(interval);
  }, [teamId]);

  const copyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#00d2ff] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-400">Syncing team hub data...</p>
        </div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-4">
        <h2 className="font-display text-xl font-bold mb-2">Team Not Found</h2>
        <p className="text-xs font-mono text-slate-400 mb-4">The requested team does not exist or has been modified.</p>
        <Link href="/" className="btn-youpulse-primary">
          Return to Leaderboard
        </Link>
      </div>
    );
  }

  const {
    name,
    color,
    clueCount,
    members,
    currentMission,
    roadmap,
    clues,
    cluesRevealed,
    activeRound,
  } = teamData;

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-[#ffffff] relative">
      <div className="audio-grid-overlay" aria-hidden="true" />
      <div className="ambient-vignette" aria-hidden="true" />

      <Navbar currentRound={activeRound} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-mono font-semibold text-slate-400 hover:text-white group transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Leaderboard</span>
          </Link>

          <button
            onClick={copyShareLink}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#0c0f18] border border-[rgba(255,255,255,0.08)] text-xs font-mono text-slate-300 hover:text-white hover:border-[#00d2ff] transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? "Link Copied!" : "Share QR / Link"}</span>
          </button>
        </div>

        {/* Team Hero Header */}
        <div className="youpulse-card laser-card p-6 sm:p-8 relative overflow-hidden mb-8">
          <div className="tech-corners" />
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"
            style={{ backgroundColor: color }}
          />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center space-x-3 mb-2 font-mono">
                <span
                  className="w-3.5 h-3.5 rounded-full ring-2 ring-white/20 shadow-lg"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Integration Day Team
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-black text-white tracking-tight">{name}</h1>
              <p className="text-xs font-mono text-slate-400 mt-1 flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-[#00d2ff]" />
                <span>{members.length} Players • Balanced A1 & A2 Students</span>
              </p>
            </div>

            {/* Clue Progress Box */}
            <div className="bg-[#07090e]/95 p-4 rounded-2xl border border-[rgba(255,255,255,0.08)] flex items-center space-x-4 shrink-0 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Key className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-semibold uppercase text-slate-400 block">
                  Clues Vault
                </span>
                <span className="text-2xl font-black text-white font-mono">
                  {clueCount} <span className="text-xs text-slate-400 font-normal">/ 9 clues</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1 & 2: Current Mission & 9-Round Roadmap */}
          <div className="lg:col-span-2 space-y-6">
            {/* CURRENT MISSION BANNER */}
            <div className="youpulse-card laser-card p-6 sm:p-7 border-blue-500/40 relative overflow-hidden">
              <div className="tech-corners" />

              <div className="flex items-center justify-between mb-3 font-mono">
                <span className="text-xs font-bold uppercase tracking-wider text-[#38bdf8] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  CURRENT ACTIVE MISSION (ROUND {activeRound})
                </span>

                {currentMission && (
                  <span
                    className={`text-xs px-3 py-0.5 rounded-full font-bold ${
                      currentMission.status === "in_progress"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : currentMission.status === "completed"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {currentMission.status === "in_progress"
                      ? "Match In Progress"
                      : currentMission.status === "completed"
                      ? "Completed"
                      : "Pending Start"}
                  </span>
                )}
              </div>

              {currentMission ? (
                <div>
                  <h2 className="font-display text-2xl font-black text-white tracking-tight">
                    {currentMission.gameName}
                  </h2>
                  <p className="text-xs font-mono text-slate-300 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#00d2ff]" />
                    <span>Report to: <strong className="text-white">{currentMission.location}</strong></span>
                  </p>

                  <div className="mt-5 p-4 rounded-xl bg-[#07090e]/90 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase font-semibold text-slate-400 block">
                        Station Rule
                      </span>
                      <p className="text-xs font-sans text-slate-300 mt-0.5">
                        {currentMission.inRotation
                          ? "Win this match to secure your team's secret clue fragment."
                          : "Free Play Station (No clues awarded in this round)."}
                      </p>
                    </div>

                    <SyncedTimer
                      status={currentMission.status}
                      durationMinutes={15}
                    />
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center font-mono">
                  <p className="text-sm text-slate-400">Transit / Free recreation break</p>
                </div>
              )}
            </div>

            {/* 9-ROUND ROADMAP */}
            <div className="youpulse-card p-6 sm:p-7 border-slate-800">
              <div className="tech-corners" />
              <h3 className="font-display text-xl font-bold text-white tracking-tight flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-[#00d2ff]" />
                9-Round Station Schedule (Zero Conflict Rotation)
              </h3>
              <p className="text-xs font-sans text-slate-400 mb-6">
                Your team visits each station in this exact chronological order.
              </p>

              <div className="space-y-3 font-mono">
                {roadmap.map((step: any) => {
                  const isCurrent = step.round === activeRound;
                  const isPast = step.round < activeRound || step.status === "completed";

                  return (
                    <div
                      key={step.round}
                      className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                        isCurrent
                          ? "bg-[rgba(0,102,255,0.12)] border-[#00d2ff] shadow-lg shadow-[#0066ff]/20"
                          : isPast
                          ? "bg-[#07090e]/50 border-slate-800/60 opacity-80"
                          : "bg-[#07090e]/90 border-slate-800"
                      }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isCurrent
                              ? "bg-[#0066ff] text-white shadow-md shadow-[#0066ff]/40"
                              : isPast
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          R{step.round}
                        </span>

                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-display text-sm font-bold text-white">{step.gameName}</h4>
                            {isCurrent && (
                              <span className="text-[10px] px-2 py-0.2 rounded-full bg-blue-500/20 text-[#38bdf8] font-semibold border border-blue-500/30">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {step.location}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 text-xs">
                        {step.isWinner && (
                          <span className="font-bold text-amber-400 flex items-center gap-1">
                            <Key className="w-3.5 h-3.5" /> Clue Won
                          </span>
                        )}

                        <span
                          className={`font-semibold px-2.5 py-1 rounded-full ${
                            step.status === "completed"
                              ? "bg-emerald-950/40 text-emerald-400"
                              : step.status === "in_progress"
                              ? "bg-blue-950/50 text-[#38bdf8]"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {step.status === "completed"
                            ? "Done"
                            : step.status === "in_progress"
                            ? "Running"
                            : "Upcoming"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column 3: Clue Vault & Team Roster */}
          <div className="space-y-6">
            {/* CLUE VAULT */}
            <div className="youpulse-card p-6 border-amber-500/30">
              <div className="tech-corners" />
              <div className="flex items-center justify-between mb-3 font-mono">
                <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-400" />
                  Unlocked Clue Fragments
                </h3>
                {cluesRevealed ? (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center gap-1 border border-emerald-500/30">
                    <Unlock className="w-3 h-3" /> REVEALED
                  </span>
                ) : (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center gap-1 border border-amber-500/30">
                    <Lock className="w-3 h-3" /> LOCKED
                  </span>
                )}
              </div>

              <p className="text-xs font-sans text-slate-400 mb-4 leading-relaxed">
                {cluesRevealed
                  ? "All clue fragments are now decrypted! Assemble them with your team to deduce the mystery."
                  : "Clues earned are stored securely on the server. Their contents remain encrypted until the Organizer activates the Final Reveal!"}
              </p>

              {clues.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#07090e]/80 border border-slate-800 text-center text-xs font-mono text-slate-500">
                  No clues won yet. Win your assigned stations to unlock clue tokens!
                </div>
              ) : (
                <div className="space-y-3 font-mono">
                  {clues.map((clue: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                        clue.isRevealed
                          ? "bg-amber-950/25 border-amber-500/40 text-amber-100 font-sans"
                          : "bg-[#07090e]/80 border-slate-800 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5 font-semibold font-mono">
                        <span className="text-amber-400">
                          Token #{clue.clueIndex}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {clue.isRevealed ? "Decrypted" : "Server Encrypted"}
                        </span>
                      </div>
                      <p>{clue.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TEAM MEMBERS ROSTER */}
            <div className="youpulse-card p-6 border-slate-800">
              <div className="tech-corners" />
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-[#00d2ff]" />
                Team Roster ({members.length})
              </h3>

              <div className="space-y-2 font-sans">
                {members.map((member: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#07090e]/80 border border-slate-800 text-xs"
                  >
                    <span className="font-medium text-slate-200">{member.fullName}</span>
                    <div className="flex items-center space-x-1.5 font-mono">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-[#38bdf8] font-semibold">
                        {member.year}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                        {member.className}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
