"use client";

import { useState } from "react";
import {
  Gamepad2,
  MapPin,
  Info,
  Clock,
  Sparkles,
  Users,
  Snowflake,
  Play,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { IGame, ITeam } from "@/lib/models";
import SyncedTimer from "./SyncedTimer";

interface StationsMapProps {
  games: IGame[];
  teams: ITeam[];
  currentStationMappings: any[];
  currentRound: number;
}

export default function StationsMap({
  games,
  teams,
  currentStationMappings,
  currentRound,
}: StationsMapProps) {
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [selectedGameRules, setSelectedGameRules] = useState<IGame | null>(null);

  const filteredGames = games.filter((g) => {
    if (filterCategory === "ALL") return true;
    if (filterCategory === "TEAM") return g.category === "TEAM";
    if (filterCategory === "BOARD_TEAM") return g.category === "BOARD_TEAM";
    if (filterCategory === "BOARD_SOLO") return g.category === "BOARD_SOLO";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 font-mono">
          <button
            onClick={() => setFilterCategory("ALL")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filterCategory === "ALL"
                ? "bg-[#0066ff] text-white shadow-lg shadow-[#0066ff]/40"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            All Stations ({games.length})
          </button>

          <button
            onClick={() => setFilterCategory("TEAM")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filterCategory === "TEAM"
                ? "bg-[#0066ff] text-white shadow-lg shadow-[#0066ff]/40"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            9 Integration Games (Rotation)
          </button>

          <button
            onClick={() => setFilterCategory("BOARD_TEAM")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filterCategory === "BOARD_TEAM"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/40"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            2 Team Board Games
          </button>

          <button
            onClick={() => setFilterCategory("BOARD_SOLO")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filterCategory === "BOARD_SOLO"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/40"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            3 Solo Board Games
          </button>
        </div>

        <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5 font-medium">
          <Clock className="w-3.5 h-3.5 text-[#00d2ff]" />
          <span>Active: <strong className="text-white">Round {currentRound} of 9</strong></span>
        </div>
      </div>

      {/* Stations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGames.map((game) => {
          const currentMatch = currentStationMappings.find(
            (m) => m.gameId === game._id || m.gameName === game.name
          );

          const isFrozen = !game.inRotation;
          const isSolo = game.category === "BOARD_SOLO";

          return (
            <div
              key={game._id || game.gameNumber}
              className={`youpulse-card laser-card p-6 flex flex-col justify-between ${
                isFrozen ? "border-amber-500/40 bg-amber-950/10" : ""
              }`}
            >
              <div className="tech-corners" />

              <div>
                {/* Header row: Station number & category */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[rgba(0,102,255,0.15)] text-[#00d2ff] font-mono font-bold text-xs border border-[rgba(0,210,255,0.3)]">
                      #{game.gameNumber}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        game.category === "TEAM"
                          ? "bg-blue-500/10 text-[#38bdf8] border border-blue-500/20"
                          : game.category === "BOARD_TEAM"
                          ? "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                          : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      }`}
                    >
                      {game.category === "TEAM"
                        ? "Team Station"
                        : game.category === "BOARD_TEAM"
                        ? "Board (Team)"
                        : "Board (Solo)"}
                    </span>
                  </div>

                  {isFrozen && (
                    <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Snowflake className="w-3 h-3" /> FROZEN
                    </span>
                  )}
                </div>

                {/* Station Name */}
                <h3 className="font-display text-lg font-bold text-white tracking-tight">{game.name}</h3>

                <p className="text-xs font-mono text-slate-400 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{game.location || "YouCode Campus Zone"}</span>
                </p>

                <p className="text-xs font-sans text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                  {game.description}
                </p>
              </div>

              {/* Status and Active Match Section */}
              <div className="mt-5 pt-4 border-t border-[rgba(255,255,255,0.06)] space-y-3">
                {!isSolo ? (
                  <div className="bg-[#07090e]/90 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase font-semibold text-slate-400 block">
                        Round {currentRound} Team:
                      </span>
                      {currentMatch ? (
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: currentMatch.teamColor }}
                          />
                          <span className="text-xs font-display font-bold text-white">
                            {currentMatch.teamName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-mono text-slate-500">Free / Open Station</span>
                      )}
                    </div>

                    <SyncedTimer
                      startedAt={game.startedAt}
                      status={game.status}
                      durationMinutes={15}
                    />
                  </div>
                ) : (
                  <div className="bg-emerald-950/20 rounded-xl p-3 border border-emerald-900/40">
                    <span className="text-[10px] font-mono uppercase font-semibold text-emerald-400 block">
                      Solo Participant Zone
                    </span>
                    <span className="text-xs font-sans text-slate-300 mt-0.5 block">
                      Open to all solo students throughout the day (Free Play).
                    </span>
                  </div>
                )}

                {/* Actions row: View Rules */}
                <div className="flex items-center justify-between pt-1">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold ${
                      game.status === "in_progress"
                        ? "text-emerald-400"
                        : game.status === "completed"
                        ? "text-blue-400"
                        : "text-slate-400"
                    }`}
                  >
                    {game.status === "in_progress" ? (
                      <>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>Match Running</span>
                      </>
                    ) : game.status === "completed" ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>Completed</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Pending</span>
                      </>
                    )}
                  </span>

                  <button
                    onClick={() => setSelectedGameRules(game)}
                    className="text-xs font-mono font-semibold text-[#38bdf8] hover:text-white flex items-center gap-1 py-1 px-2.5 rounded-full hover:bg-[rgba(0,102,255,0.15)] transition-colors"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Rules</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rules Modal */}
      {selectedGameRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0c0f18] border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[rgba(0,102,255,0.2)] text-[#00d2ff] font-mono font-bold text-xs">
                  Station #{selectedGameRules.gameNumber}
                </span>
                <h3 className="font-display text-lg font-bold text-white">{selectedGameRules.name}</h3>
              </div>
              <button
                onClick={() => setSelectedGameRules(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-xs font-mono uppercase text-slate-400 mb-1">Location</h4>
                <p className="text-sm font-sans text-slate-200">{selectedGameRules.location}</p>
              </div>

              <div>
                <h4 className="text-xs font-mono uppercase text-slate-400 mb-1">Objective</h4>
                <p className="text-sm font-sans text-slate-300 leading-relaxed">{selectedGameRules.description}</p>
              </div>

              <div>
                <h4 className="text-xs font-mono uppercase text-slate-400 mb-1">Rules & Guidelines</h4>
                <div className="p-3.5 bg-[#07090e] rounded-xl border border-slate-800 text-sm font-sans text-slate-200 leading-relaxed">
                  {selectedGameRules.rules}
                </div>
              </div>

              {selectedGameRules.category === "TEAM" && (
                <div className="p-3 bg-blue-950/30 rounded-xl border border-blue-900/40 text-xs font-sans text-blue-300 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Winning this station awards the team <strong>1 hidden clue fragment</strong> towards the grand final reveal prize!
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedGameRules(null)}
                className="px-5 py-2 rounded-full text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
