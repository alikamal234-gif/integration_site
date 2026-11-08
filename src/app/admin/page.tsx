"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  Key,
  Users,
  Play,
  Square,
  RotateCcw,
  Snowflake,
  Flame,
  Unlock,
  Lock,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History,
  LogOut,
  RefreshCw,
  Trophy,
  Sliders,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import SyncedTimer from "@/components/SyncedTimer";
import { IGame, ITeam, IStaff, IAuditLog, IEventState } from "@/lib/models";

export default function AdminPortalPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Login form state
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Admin Dashboard data
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<"controls" | "overrides" | "audit" | "teams">("controls");

  // Winner selection modal state
  const [selectedWinnerGame, setSelectedWinnerGame] = useState<IGame | null>(null);
  const [selectedWinnerTeamId, setSelectedWinnerTeamId] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  // Check auth session
  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const json = await res.json();
      if (json.success && json.user) {
        setCurrentUser(json.user);
        loadAdminData();
      } else {
        setCurrentUser(null);
      }
    } catch (e) {
      setCurrentUser(null);
    } finally {
      setAuthChecked(true);
    }
  };

  const loadAdminData = async () => {
    setLoadingData(true);
    try {
      const res = await fetch("/api/admin/data");
      const json = await res.json();
      if (json.success && json.data) {
        setDashboardData(json.data);
      }
    } catch (e) {
      console.error("Failed to load admin data:", e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, password: passwordInput }),
      });
      const json = await res.json();
      if (json.success && json.user) {
        setCurrentUser(json.user);
        loadAdminData();
      } else {
        setLoginError(json.error || "Invalid credentials");
      }
    } catch (e: any) {
      setLoginError("Login connection error");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
    setDashboardData(null);
  };

  const quickLogin = (email: string, pass: string) => {
    setEmailInput(email);
    setPasswordInput(pass);
  };

  // Game Master Action: Start Match
  const handleStartGame = async (gameId: string) => {
    setActionLoading(true);
    setActionMessage("");
    try {
      const res = await fetch("/api/admin/game-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "START_GAME", gameId }),
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage(json.message);
        loadAdminData();
      } else {
        alert(json.error || "Action failed");
      }
    } catch (e: any) {
      alert("Error starting game");
    } finally {
      setActionLoading(false);
    }
  };

  // Game Master Action: End Match & Submit Winner
  const handleConfirmEndGame = async () => {
    if (!selectedWinnerGame) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/game-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "END_GAME",
          gameId: selectedWinnerGame._id,
          winnerTeamId: selectedWinnerTeamId || null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedWinnerGame(null);
        setSelectedWinnerTeamId("");
        loadAdminData();
      } else {
        alert(json.error || "Action failed");
      }
    } catch (e: any) {
      alert("Error completing game");
    } finally {
      setActionLoading(false);
    }
  };

  // Reset Game Status
  const handleResetGameStatus = async (gameId: string) => {
    if (!confirm("Reset this station back to pending status?")) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/game-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET_STATUS", gameId }),
      });
      const json = await res.json();
      if (json.success) {
        loadAdminData();
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Admin Override: Toggle Freeze
  const handleToggleFreeze = async (gameId: string) => {
    try {
      const res = await fetch("/api/admin/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overrideType: "TOGGLE_FREEZE",
          payload: { gameId },
        }),
      });
      const json = await res.json();
      if (json.success) {
        loadAdminData();
      }
    } catch (e) {
      alert("Failed to toggle freeze");
    }
  };

  // Admin Override: Adjust Clues
  const handleAdjustClues = async (teamId: string, delta: number) => {
    try {
      const res = await fetch("/api/admin/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overrideType: "ADJUST_CLUES",
          payload: { teamId, delta },
        }),
      });
      const json = await res.json();
      if (json.success) {
        loadAdminData();
      }
    } catch (e) {
      alert("Failed to adjust clues");
    }
  };

  // Admin Override: Toggle Final Reveal
  const handleToggleFinalReveal = async () => {
    const isCurrentlyRevealed = dashboardData?.eventState?.cluesRevealed;
    const confirmMsg = isCurrentlyRevealed
      ? "Lock and hide clue contents again?"
      : "Are you sure you want to REVEAL ALL CLUES to all teams? This initiates the Grand Final Round!";
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch("/api/admin/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overrideType: "TOGGLE_FINAL_REVEAL",
          payload: {},
        }),
      });
      const json = await res.json();
      if (json.success) {
        loadAdminData();
      }
    } catch (e) {
      alert("Failed to toggle final reveal");
    }
  };

  // Admin Override: Advance Round
  const handleSetRound = async (roundNumber: number) => {
    try {
      const res = await fetch("/api/admin/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overrideType: "SET_ROUND",
          payload: { roundNumber },
        }),
      });
      const json = await res.json();
      if (json.success) {
        loadAdminData();
      }
    } catch (e) {
      alert("Failed to set round");
    }
  };

  // Admin Override: Rebalance Teams
  const handleRebalanceTeams = async () => {
    if (!confirm("Re-run the automatic team balancing algorithm across all registered students?")) return;
    try {
      const res = await fetch("/api/admin/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overrideType: "REGENERATE_TEAMS",
          payload: {},
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        loadAdminData();
      }
    } catch (e) {
      alert("Failed to rebalance teams");
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00d2ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 1. LOGIN SCREEN
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-[#07090e] text-[#ffffff] relative">
        <div className="audio-grid-overlay" aria-hidden="true" />
        <div className="ambient-vignette" aria-hidden="true" />

        <Navbar />

        <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
          <div className="w-full max-w-md youpulse-card laser-card p-8 sm:p-9 shadow-2xl">
            <div className="tech-corners" />

            <div className="text-center mb-8">
              <div className="relative h-14 w-14 rounded-2xl bg-white p-1 flex items-center justify-center mx-auto shadow-xl shadow-[#0066ff]/30 mb-4 overflow-hidden">
                <Image
                  src="/youpulse-logo.png"
                  alt="YouPulse"
                  width={52}
                  height={52}
                  className="object-contain"
                />
              </div>
              <h1 className="font-display text-2xl font-black text-white tracking-tight">Staff & Game Masters</h1>
              <p className="text-xs font-mono text-slate-400 mt-1">
                Enter your credentials to manage matches, award clues, or configure rotation.
              </p>
            </div>

            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 font-mono">
              <div>
                <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@youcode.ma"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#07090e] border border-slate-700/80 text-sm text-white focus:border-[#00d2ff] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#07090e] border border-slate-700/80 text-sm text-white focus:border-[#00d2ff] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 rounded-full text-sm font-sans font-bold btn-youpulse-primary mt-3 flex items-center justify-center gap-2"
              >
                {loginLoading ? "Authenticating..." : "Sign In to Staff Portal"}
              </button>
            </form>

            {/* Quick Demo Credentials */}
            <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.06)] font-mono">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3 text-center">
                One-Click Test Accounts:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => quickLogin("admin@youcode.ma", "admin123")}
                  className="p-2.5 rounded-xl bg-[#07090e] hover:bg-white/5 text-slate-300 border border-slate-800 text-left transition-colors"
                >
                  <strong className="block text-white font-display">Super Admin</strong>
                  <span className="text-[10px] text-[#00d2ff]">admin@youcode.ma</span>
                </button>

                <button
                  type="button"
                  onClick={() => quickLogin("gm1@youcode.ma", "master123")}
                  className="p-2.5 rounded-xl bg-[#07090e] hover:bg-white/5 text-slate-300 border border-slate-800 text-left transition-colors"
                >
                  <strong className="block text-white font-display">Game Master</strong>
                  <span className="text-[10px] text-purple-400">gm1@youcode.ma</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED STAFF DASHBOARD
  const isSuper = currentUser.role === "SUPER_ADMIN";
  const isAdmin = currentUser.role === "SUPER_ADMIN" || currentUser.role === "ADMIN";
  const isGM = currentUser.role === "GAME_MASTER";

  const allGames: IGame[] = dashboardData?.games || [];
  const allTeams: ITeam[] = dashboardData?.teams || [];
  const eventState: IEventState = dashboardData?.eventState || {};
  const auditLogs: IAuditLog[] = dashboardData?.auditLogs || [];
  const currentRound = eventState.currentRound || 1;

  const controlledGames = isAdmin
    ? allGames
    : allGames.filter((g) => currentUser.assignedGameIds.includes(g._id));

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-[#ffffff] relative">
      <div className="audio-grid-overlay" aria-hidden="true" />
      <div className="ambient-vignette" aria-hidden="true" />

      {/* Staff Header */}
      <header className="bg-[#0c0f18]/90 border-b border-[rgba(255,255,255,0.06)] backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="font-display font-black text-xl text-white">
              You<span className="text-[#0084ff]">Pulse</span>
            </Link>
            <span className="text-slate-700">|</span>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-slate-200">{currentUser.name}</span>
              <span
                className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  isSuper
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : isAdmin
                    ? "bg-blue-500/20 text-[#38bdf8] border border-blue-500/40"
                    : "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                }`}
              >
                {currentUser.role.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadAdminData}
              disabled={loadingData}
              className="p-2 rounded-full bg-[#07090e] border border-slate-800 text-slate-300 hover:text-white"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loadingData ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 flex items-center space-x-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Body */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 relative z-10">
        {/* Navigation Tabs for Admin */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.06)] pb-4">
          <div className="flex items-center space-x-2 font-mono">
            <button
              onClick={() => setActiveAdminTab("controls")}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center space-x-2 transition-all ${
                activeAdminTab === "controls"
                  ? "bg-[#0066ff] text-white shadow-lg shadow-[#0066ff]/40"
                  : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Station Matches</span>
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveAdminTab("overrides")}
                  className={`px-4 py-2 rounded-full text-xs font-bold flex items-center space-x-2 transition-all ${
                    activeAdminTab === "overrides"
                      ? "bg-[#0066ff] text-white shadow-lg shadow-[#0066ff]/40"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Admin Overrides</span>
                </button>

                <button
                  onClick={() => setActiveAdminTab("teams")}
                  className={`px-4 py-2 rounded-full text-xs font-bold flex items-center space-x-2 transition-all ${
                    activeAdminTab === "teams"
                      ? "bg-[#0066ff] text-white shadow-lg shadow-[#0066ff]/40"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Scores & Balancing</span>
                </button>

                <button
                  onClick={() => setActiveAdminTab("audit")}
                  className={`px-4 py-2 rounded-full text-xs font-bold flex items-center space-x-2 transition-all ${
                    activeAdminTab === "audit"
                      ? "bg-[#0066ff] text-white shadow-lg shadow-[#0066ff]/40"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Audit Logs ({auditLogs.length})</span>
                </button>
              </>
            )}
          </div>

          {/* Quick Round Navigator */}
          <div className="flex items-center space-x-2 bg-[#0c0f18] px-3.5 py-1.5 rounded-full border border-slate-800 font-mono">
            <span className="text-xs text-slate-400 font-semibold">Active Round:</span>
            {isAdmin ? (
              <select
                value={currentRound}
                onChange={(e) => handleSetRound(parseInt(e.target.value, 10))}
                className="bg-[#07090e] text-xs font-bold text-[#00d2ff] px-2.5 py-1 rounded-full border border-slate-700 focus:outline-none"
              >
                {Array.from({ length: 9 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Round {i + 1} of 9
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs font-bold text-white">
                Round {currentRound} of 9
              </span>
            )}
          </div>
        </div>

        {/* TAB 1: GAME CONTROLS */}
        {activeAdminTab === "controls" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-white tracking-tight">
                {isGM ? "Your Assigned Game Stations" : "All Game Station Controls"}
              </h2>
              <p className="text-xs font-sans text-slate-400 mt-0.5">
                Start matches, record results, and designate winning teams to award secret clues.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {controlledGames.map((game) => {
                const isFrozen = !game.inRotation;
                const isPending = game.status === "pending";
                const isInProgress = game.status === "in_progress";
                const isCompleted = game.status === "completed";

                const assign = (dashboardData?.assignments || []).find(
                  (a: any) =>
                    (a.gameId === game._id || a.gameId === `game_${game.gameNumber}`) &&
                    a.round === currentRound
                );
                const assignedTeam = allTeams.find((t) => t._id === assign?.teamId);

                return (
                  <div
                    key={game._id}
                    className={`youpulse-card laser-card p-6 flex flex-col justify-between ${
                      isFrozen
                        ? "border-amber-500/40 bg-amber-950/10"
                        : isInProgress
                        ? "border-emerald-500/60 shadow-xl shadow-emerald-500/15"
                        : "border-slate-800"
                    }`}
                  >
                    <div className="tech-corners" />

                    <div>
                      {/* Station header */}
                      <div className="flex items-center justify-between mb-3 font-mono">
                        <span className="px-2.5 py-0.5 rounded-md bg-[rgba(0,102,255,0.15)] text-[#00d2ff] font-bold text-xs border border-[rgba(0,210,255,0.3)]">
                          Station #{game.gameNumber}
                        </span>

                        <div className="flex items-center space-x-1.5">
                          {isFrozen && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              FROZEN
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                              isInProgress
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : isCompleted
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {game.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-display text-lg font-bold text-white tracking-tight">{game.name}</h3>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">{game.location}</p>

                      {/* Current Round matchup box */}
                      <div className="mt-4 p-3.5 rounded-xl bg-[#07090e]/95 border border-slate-800 space-y-2 font-mono">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Round {currentRound} Team:</span>
                          <span className="font-bold text-white font-display">
                            {assignedTeam ? assignedTeam.name : "Transit / Free Play"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800">
                          <span className="text-slate-400">Server Synced Timer:</span>
                          <SyncedTimer
                            startedAt={game.startedAt}
                            status={game.status}
                            durationMinutes={15}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.06)] space-y-2.5">
                      {isPending && (
                        <button
                          onClick={() => handleStartGame(game._id!)}
                          disabled={actionLoading}
                          className="w-full py-3 rounded-full text-sm font-sans font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>START MATCH (ROUND {currentRound})</span>
                        </button>
                      )}

                      {isInProgress && (
                        <button
                          onClick={() => {
                            setSelectedWinnerGame(game);
                            setSelectedWinnerTeamId(assignedTeam?._id || "");
                          }}
                          disabled={actionLoading}
                          className="w-full py-3 rounded-full text-sm font-sans font-bold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-600/30 flex items-center justify-center space-x-2 transition-all"
                        >
                          <Square className="w-4 h-4 fill-current" />
                          <span>END MATCH & AWARD CLUE</span>
                        </button>
                      )}

                      {isCompleted && (
                        <div className="p-3 rounded-full bg-blue-950/20 border border-blue-900/40 text-center">
                          <span className="text-xs font-mono font-semibold text-[#38bdf8] flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Match Completed for Round {currentRound}</span>
                          </span>
                        </div>
                      )}

                      {/* Reset status toggle */}
                      <button
                        onClick={() => handleResetGameStatus(game._id!)}
                        className="w-full py-1.5 text-[11px] font-mono text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset status to pending</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: ADMIN OVERRIDES */}
        {activeAdminTab === "overrides" && isAdmin && (
          <div className="space-y-6">
            {/* Grand Final Reveal Control */}
            <div className="youpulse-card laser-card p-6 sm:p-8 border-amber-500/40 relative overflow-hidden">
              <div className="tech-corners" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-1">
                    <Key className="w-4 h-4" />
                    GRAND FINAL REVEAL CONTROLLER
                  </span>
                  <h3 className="font-display text-2xl font-black text-white">
                    {eventState.cluesRevealed
                      ? "Clues Status: REVEALED TO ALL PARTICIPANTS"
                      : "Clues Status: SECURELY LOCKED ON SERVER"}
                  </h3>
                  <p className="text-xs font-sans text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Triggering this decrypts the clue texts across all team hubs. Use only once all teams have finished their 9 rounds and are assembled in the main room.
                  </p>
                </div>

                <button
                  onClick={handleToggleFinalReveal}
                  className={`btn-youpulse-primary shrink-0 ${
                    eventState.cluesRevealed
                      ? "bg-slate-800 hover:bg-slate-700 text-amber-400 border-amber-500/40"
                      : "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black border-amber-300 shadow-amber-500/30 hover:scale-105"
                  }`}
                >
                  {eventState.cluesRevealed ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>LOCK CLUES AGAIN</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" />
                      <span>TRIGGER FINAL REVEAL</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Freeze / Unfreeze Stations Management */}
            <div className="youpulse-card p-6 sm:p-7 border-slate-800">
              <div className="tech-corners" />
              <h3 className="font-display text-xl font-bold text-white tracking-tight flex items-center gap-2 mb-2">
                <Snowflake className="w-5 h-5 text-[#00d2ff]" />
                Station Freeze & Unfreeze Management
              </h3>
              <p className="text-xs font-sans text-slate-400 mb-6">
                Frozen games are removed from the competitive rotation pool (free play, no clue awarded).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allGames.map((game) => (
                  <div
                    key={game._id}
                    className="p-4 rounded-2xl bg-[#07090e] border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block">
                        Station #{game.gameNumber}
                      </span>
                      <h4 className="font-display text-sm font-bold text-white">{game.name}</h4>
                      <span
                        className={`text-[10px] font-mono font-semibold ${
                          game.inRotation ? "text-emerald-400" : "text-amber-400"
                        }`}
                      >
                        {game.inRotation ? "Active in Rotation" : "Frozen (Free Play)"}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleFreeze(game._id!)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold border transition-all ${
                        game.inRotation
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                      }`}
                    >
                      {game.inRotation ? "Freeze" : "Unfreeze"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SCORES & TEAM BALANCING */}
        {activeAdminTab === "teams" && isAdmin && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-xl font-bold text-white tracking-tight">
                  Team Score Adjustments & Automatic Balancing
                </h3>
                <p className="text-xs font-sans text-slate-400 mt-0.5">
                  Manual admin override to correct results or re-run the demographic balancing algorithm.
                </p>
              </div>

              <button
                onClick={handleRebalanceTeams}
                className="btn-youpulse-primary py-2 px-4 self-start"
              >
                <UserCheck className="w-4 h-4" />
                <span>Re-run Team Balancer</span>
              </button>
            </div>

            <div className="youpulse-card p-6 sm:p-7 border-slate-800 overflow-x-auto">
              <div className="tech-corners" />
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono font-semibold uppercase text-[11px]">
                    <th className="py-3 px-4">Team</th>
                    <th className="py-3 px-4">Members</th>
                    <th className="py-3 px-4 text-center">Clues Collected</th>
                    <th className="py-3 px-4 text-right">Manual Score Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {allTeams.map((team) => (
                    <tr key={team._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2.5">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: team.color }}
                          />
                          <span className="font-display font-bold text-white text-sm">{team.name}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 font-mono">
                        {team.members?.length || 6} students (A1/A2 balanced)
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-sm text-amber-400">
                          {team.clueCount} / 9 clues
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center space-x-2 font-mono">
                          <button
                            onClick={() => handleAdjustClues(team._id!, -1)}
                            className="px-3 py-1 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold border border-red-500/30"
                          >
                            -1 Clue
                          </button>
                          <button
                            onClick={() => handleAdjustClues(team._id!, 1)}
                            className="px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30"
                          >
                            +1 Clue
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT LOGS */}
        {activeAdminTab === "audit" && isAdmin && (
          <div className="youpulse-card p-6 sm:p-7 border-slate-800 space-y-4">
            <div className="tech-corners" />
            <div>
              <h3 className="font-display text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <History className="w-5 h-5 text-[#00d2ff]" />
                System Audit Logs (Immutable Traceability)
              </h3>
              <p className="text-xs font-sans text-slate-400 mt-0.5">
                Every start, end, freeze, clue adjustment, and reveal is recorded here with admin identity and timestamp.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Staff Email</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {auditLogs.map((log, idx) => (
                    <tr key={log._id || idx} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-[#00d2ff]">
                        {log.adminEmail}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 font-sans">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* WINNER DESIGNATION MODAL */}
      {selectedWinnerGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0c0f18] border border-slate-700 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative">
            <h3 className="font-display text-lg font-bold text-white mb-1">
              End Match & Select Winner
            </h3>
            <p className="text-xs font-mono text-slate-400 mb-4">
              Station #{selectedWinnerGame.gameNumber}: {selectedWinnerGame.name} (Round {currentRound})
            </p>

            <div className="space-y-4 font-mono">
              <div>
                <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1.5">
                  Designate Winning Team (Receives Clue)
                </label>
                <select
                  value={selectedWinnerTeamId}
                  onChange={(e) => setSelectedWinnerTeamId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-slate-700 text-sm text-white focus:outline-none focus:border-[#00d2ff]"
                >
                  <option value="">No Winner / Draw / Free Play (No Clue)</option>
                  {allTeams.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} (Currently has {t.clueCount} clues)
                    </option>
                  ))}
                </select>
              </div>

              {selectedWinnerTeamId && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2">
                  <Key className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="font-sans">
                    The designated winner will receive <strong>1 secret clue token</strong> automatically added to their vault.
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedWinnerGame(null)}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmEndGame}
                  disabled={actionLoading}
                  className="btn-youpulse-primary"
                >
                  {actionLoading ? "Submitting..." : "Confirm & Record Result"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
