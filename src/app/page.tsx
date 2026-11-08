"use client";

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import Navbar from "@/components/Navbar";
import Leaderboard from "@/components/Leaderboard";
import StationsMap from "@/components/StationsMap";
import TeamsRoster from "@/components/TeamsRoster";
import BoardGamesShowcase from "@/components/BoardGamesShowcase";
import {
  Trophy,
  LayoutGrid,
  Users,
  Sparkles,
  HelpCircle,
  Radio,
  Clock,
  Key,
  Shield,
  Snowflake,
  RefreshCw,
  ExternalLink,
  Zap,
} from "lucide-react";
import { ITeam, IGame, IStudent, IEventState } from "@/lib/models";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<string>("leaderboard");
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [hasCelebrated, setHasCelebrated] = useState<boolean>(false);

  const [teams, setTeams] = useState<ITeam[]>([]);
  const [games, setGames] = useState<IGame[]>([]);
  const [soloPlayers, setSoloPlayers] = useState<IStudent[]>([]);
  const [eventState, setEventState] = useState<IEventState>({
    phase: "SETUP",
    currentRound: 1,
    totalRounds: 9,
    cluesRevealed: false,
    roundStartedAt: null,
    roundDurationMinutes: 15,
  });
  const [currentStationMappings, setCurrentStationMappings] = useState<any[]>([]);

  // Fetch live public data
  const fetchData = async () => {
    try {
      const res = await fetch("/api/public/data", { cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        setTeams(json.data.teams || []);
        setGames(json.data.games || []);
        setSoloPlayers(json.data.soloPlayers || []);
        setEventState(json.data.eventState || {});
        setCurrentStationMappings(json.data.currentStationMappings || []);
        setLastUpdated(new Date());

        // Confetti if clues are revealed
        if (json.data.eventState?.cluesRevealed && !hasCelebrated) {
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
          });
          setHasCelebrated(true);
        }
      }
    } catch (e) {
      console.error("Failed to poll public data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh polling every 3.5 seconds
    const interval = setInterval(fetchData, 3500);
    return () => clearInterval(interval);
  }, [hasCelebrated]);

  const totalCluesAwarded = teams.reduce((acc, t) => acc + (t.clueCount || 0), 0);
  const activeStationsCount = games.filter((g) => g.status === "in_progress").length;

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-[#ffffff] relative">
      {/* Visual Audio Grid & Ambient Vignette Background */}
      <div className="audio-grid-overlay" aria-hidden="true" />
      <div className="ambient-vignette" aria-hidden="true" />

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRound={eventState.currentRound || 1}
      />

      {/* Hero Section */}
      <section className="relative z-10 pt-10 pb-12 border-b border-[rgba(255,255,255,0.06)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              {/* Top Tag */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[rgba(0,102,255,0.12)] border border-[rgba(0,210,255,0.3)] text-[#38bdf8] text-xs font-mono font-semibold mb-4">
                <span className="w-2 h-2 rounded-full bg-[#00d2ff] animate-ping" />
                <span>YouCode Youssoufia • Day of Integration 2026</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                Connect. Compete. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0084ff] via-[#00d2ff] to-[#38bdf8]">
                  Come Alive.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed font-sans font-normal">
                Official tournament and clue hunt platform engineered for YouCode students (A1 & A2). 9 game stations, zero-collision rotation, live synchronized timers, and secret clue decryption.
              </p>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 lg:w-[480px] shrink-0">
              <div className="youpulse-card p-4 text-center">
                <div className="tech-corners" />
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block tracking-wider">Round</span>
                <span className="text-2xl font-black text-white font-mono mt-1 block">
                  {eventState.currentRound || 1}<span className="text-xs text-slate-400 font-normal">/9</span>
                </span>
                <span className="text-[10px] text-[#00d2ff] font-mono mt-0.5 block">Active Tour</span>
              </div>

              <div className="youpulse-card p-4 text-center">
                <div className="tech-corners" />
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block tracking-wider">Teams</span>
                <span className="text-2xl font-black text-white font-mono mt-1 block">
                  {teams.length}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">Balanced</span>
              </div>

              <div className="youpulse-card p-4 text-center">
                <div className="tech-corners" />
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block tracking-wider">Clues Won</span>
                <span className="text-2xl font-black text-amber-400 font-mono mt-1 flex items-center justify-center gap-1">
                  <Key className="w-4 h-4" /> {totalCluesAwarded}
                </span>
                <span className="text-[10px] text-amber-300 font-mono mt-0.5 block">Unlocked</span>
              </div>

              <div className="youpulse-card p-4 text-center">
                <div className="tech-corners" />
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block tracking-wider">Live Matches</span>
                <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
                  {activeStationsCount}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">In Progress</span>
              </div>
            </div>
          </div>

          {/* Final Reveal Alert Banner if activated by Admin */}
          {eventState.cluesRevealed && (
            <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-500/20 border border-amber-400/60 shadow-xl shadow-amber-500/15 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/30 border border-amber-400/50 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" style={{ animationDuration: "6s" }} />
                </div>
                <div>
                  <h3 className="text-base font-display font-bold text-white tracking-wide">
                    FINAL REVEAL DECRYPTED BY SUPER ADMIN!
                  </h3>
                  <p className="text-xs text-amber-200 mt-0.5">
                    All teams can now open their Team Hub to view the secret contents of their unlocked clue tokens and deduce the grand mystery!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab("teams")}
                className="btn-youpulse-primary bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-extrabold border-amber-300 shadow-amber-500/30 hover:scale-105 shrink-0"
              >
                Assemble Clues Now
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10">
        {/* Mobile Tab Selectors */}
        <div className="flex lg:hidden overflow-x-auto pb-3 gap-2 mb-6 border-b border-slate-800">
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold whitespace-nowrap ${
              activeTab === "leaderboard" ? "bg-[#0066ff] text-white" : "bg-slate-900 text-slate-400"
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab("stations")}
            className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold whitespace-nowrap ${
              activeTab === "stations" ? "bg-[#0066ff] text-white" : "bg-slate-900 text-slate-400"
            }`}
          >
            Stations
          </button>
          <button
            onClick={() => setActiveTab("teams")}
            className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold whitespace-nowrap ${
              activeTab === "teams" ? "bg-[#0066ff] text-white" : "bg-slate-900 text-slate-400"
            }`}
          >
            Teams
          </button>
          <button
            onClick={() => setActiveTab("boardgames")}
            className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold whitespace-nowrap ${
              activeTab === "boardgames" ? "bg-[#0066ff] text-white" : "bg-slate-900 text-slate-400"
            }`}
          >
            Board Games
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold whitespace-nowrap ${
              activeTab === "rules" ? "bg-[#0066ff] text-white" : "bg-slate-900 text-slate-400"
            }`}
          >
            Rules & FAQ
          </button>
        </div>

        {/* Tab 1: Leaderboard */}
        {activeTab === "leaderboard" && (
          <Leaderboard
            teams={teams}
            currentStationMappings={currentStationMappings}
            currentRound={eventState.currentRound || 1}
          />
        )}

        {/* Tab 2: Stations Map */}
        {activeTab === "stations" && (
          <StationsMap
            games={games}
            teams={teams}
            currentStationMappings={currentStationMappings}
            currentRound={eventState.currentRound || 1}
          />
        )}

        {/* Tab 3: Teams */}
        {activeTab === "teams" && <TeamsRoster teams={teams} />}

        {/* Tab 4: Board Games (3 Solo & 2 Team) */}
        {activeTab === "boardgames" && <BoardGamesShowcase />}

        {/* Tab 5: Rules & System FAQ */}
        {activeTab === "rules" && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="youpulse-card p-6 sm:p-8">
              <div className="tech-corners" />
              <h2 className="font-display text-2xl font-bold text-white tracking-tight flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-[#00d2ff]" />
                Event Rules & Problem Resolutions (Cahier des Charges)
              </h2>

              <div className="space-y-4 text-xs font-sans text-slate-300 leading-relaxed">
                <div className="p-4 bg-[#07090e]/80 rounded-xl border border-slate-800">
                  <h4 className="font-display font-bold text-white text-sm mb-1 text-[#00d2ff]">
                    1. Rotation Algorithm (Zero Conflict Guarantee)
                  </h4>
                  <p>
                    Teams rotate through the 9 stations using our cyclic round-robin permutation algorithm. In each round <em>r</em>, Team <em>t</em> moves to Station <code>(t + r - 2) % 9 + 1</code>. Every team visits every station exactly once with zero collisions!
                  </p>
                </div>

                <div className="p-4 bg-[#07090e]/80 rounded-xl border border-slate-800">
                  <h4 className="font-display font-bold text-white text-sm mb-1 text-[#00d2ff]">
                    2. Odd Number of Teams & Balancing
                  </h4>
                  <p>
                    Target team size is strictly 6 players. If registrations do not divide cleanly by 6, teams of 5 or 7 players are dynamically formed so that the total team count remains manageable (e.g. 9 teams). Extra solo players enjoy the 3 dedicated Solo Board Games.
                  </p>
                </div>

                <div className="p-4 bg-[#07090e]/80 rounded-xl border border-slate-800">
                  <h4 className="font-display font-bold text-white text-sm mb-1 text-[#00d2ff]">
                    3. Frozen Games (Free Play Outside Points)
                  </h4>
                  <p>
                    If an admin freezes a game (e.g. station maintenance or fewer teams), the game enters Free Play mode. Teams that rotate into that station can still play for recreation, but no clue reward is awarded.
                  </p>
                </div>

                <div className="p-4 bg-[#07090e]/80 rounded-xl border border-slate-800">
                  <h4 className="font-display font-bold text-white text-sm mb-1 text-[#00d2ff]">
                    4. Clue Security
                  </h4>
                  <p>
                    Clue text contents are securely locked on the backend. Public screens and team pages only display the count of clues earned. Only after the Super Admin activates the Final Reveal do clues become readable!
                  </p>
                </div>

                <div className="p-4 bg-[#07090e]/80 rounded-xl border border-slate-800">
                  <h4 className="font-display font-bold text-white text-sm mb-1 text-[#00d2ff]">
                    5. Actions & Duplicate Click Protection
                  </h4>
                  <p>
                    Game Master buttons are state-guarded toggles: <code>Pending</code> → <code>In Progress</code> → <code>Completed</code>. Accidental double clicks are rejected by the server, and all device timers synchronize from the server start timestamp.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer styled as YouPulse */}
      <footer className="border-t border-[rgba(255,255,255,0.06)] bg-[#07090e] py-8 mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-display font-bold text-white">You<span className="text-[#0084ff]">Pulse</span></span>
            <span>•</span>
            <span className="font-mono text-slate-400">BDE YouCode Youssoufia</span>
            <span>•</span>
            <span>Day of Integration</span>
          </div>

          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Synced (3.5s)</span>
            </span>
            <span>{lastUpdated ? lastUpdated.toLocaleTimeString() : "Live"}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
