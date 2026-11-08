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
  UserPlus,
  Trash2,
  FileSpreadsheet,
  Upload,
  Check,
  Sparkles,
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

  // Dashboard data
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<
    "controls" | "staff" | "csv" | "overrides" | "audit"
  >("controls");

  // Game Master Match Action state
  const [selectedWinnerGame, setSelectedWinnerGame] = useState<IGame | null>(null);
  const [selectedWinnerTeamId, setSelectedWinnerTeamId] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  // Create Staff Form state
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffPassword, setNewStaffPassword] = useState("");
  const [newStaffGameId, setNewStaffGameId] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<"GAME_MASTER" | "ADMIN">("GAME_MASTER");
  const [staffCreating, setStaffCreating] = useState(false);
  const [staffError, setStaffError] = useState("");
  const [staffSuccess, setStaffSuccess] = useState("");

  // CSV Import Form state
  const [csvText, setCsvText] = useState("");
  const [csvPreview, setCsvPreview] = useState<any>(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvError, setCsvError] = useState("");
  const [csvSuccess, setCsvSuccess] = useState("");

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

  // Match Action: Start Match
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
      alert("Error starting match");
    } finally {
      setActionLoading(false);
    }
  };

  // Match Action: End Match & Submit Winner
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
      alert("Error completing match");
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

  // Admin Override: Toggle Freeze / Unfreeze
  const handleToggleFreeze = async (gameId: string) => {
    try {
      const res = await fetch("/api/admin/game-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TOGGLE_FREEZE", gameId }),
      });
      const json = await res.json();
      if (json.success) {
        loadAdminData();
      } else {
        alert(json.error || "Failed to toggle freeze");
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
      : "Are you sure you want to REVEAL ALL CLUES to all teams? This initiates the Grand Final Clue Solving!";
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

  // Admin: Create Game Master Account
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffCreating(true);
    setStaffError("");
    setStaffSuccess("");

    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newStaffName,
          email: newStaffEmail,
          password: newStaffPassword,
          assignedGameId: newStaffGameId,
          role: newStaffRole,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStaffSuccess(`Account created for ${newStaffName}!`);
        setNewStaffName("");
        setNewStaffEmail("");
        setNewStaffPassword("");
        setNewStaffGameId("");
        loadAdminData();
      } else {
        setStaffError(json.error || "Failed to create staff account");
      }
    } catch (e: any) {
      setStaffError("Error creating account");
    } finally {
      setStaffCreating(false);
    }
  };

  // Admin: Delete Staff Account
  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm("Are you sure you want to delete this Game Master account?")) return;
    try {
      const res = await fetch(`/api/admin/staff/${staffId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        loadAdminData();
      } else {
        alert(json.error || "Failed to delete account");
      }
    } catch (e) {
      alert("Error deleting account");
    }
  };

  // Admin: CSV Preview Test
  const handlePreviewCSV = async () => {
    if (!csvText.trim()) return;
    setCsvLoading(true);
    setCsvError("");
    setCsvSuccess("");

    try {
      const res = await fetch("/api/admin/import-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvContent: csvText, previewOnly: true }),
      });
      const json = await res.json();
      if (json.success && json.stats) {
        setCsvPreview(json.stats);
      } else {
        setCsvError(json.error || "Failed to parse CSV");
      }
    } catch (e: any) {
      setCsvError("Error reading CSV");
    } finally {
      setCsvLoading(false);
    }
  };

  // Admin: Commit CSV & Deploy Teams
  const handleDeployCSV = async () => {
    if (!csvText.trim()) return;
    if (
      !confirm(
        "Deploying will replace the current teams with the newly balanced teams from this CSV. Continue?"
      )
    )
      return;

    setCsvLoading(true);
    setCsvError("");
    setCsvSuccess("");

    try {
      const res = await fetch("/api/admin/import-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvContent: csvText, previewOnly: false }),
      });
      const json = await res.json();
      if (json.success) {
        setCsvSuccess(json.message);
        setCsvPreview(null);
        loadAdminData();
      } else {
        setCsvError(json.error || "Failed to deploy teams");
      }
    } catch (e: any) {
      setCsvError("Error deploying teams");
    } finally {
      setCsvLoading(false);
    }
  };

  // File drop handler for CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
    };
    reader.readAsText(file);
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
                Enter your credentials to control assigned matches, award clues, or configure rotation.
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
  const staffList: IStaff[] = dashboardData?.staffList || [];
  const currentRound = eventState.currentRound || 1;

  // Single game assigned to Game Master
  const gmAssignedGame: IGame | null = isGM && allGames.length > 0 ? allGames[0] : null;

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

      {/* Main Body */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 relative z-10">
        {/* ============================================================== */}
        {/* VIEW 1: GAME MASTER DEDICATED CONSOLE (Strict visual isolation) */}
        {/* ============================================================== */}
        {isGM && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-4">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#00d2ff]">
                  Assigned Game Master Station
                </span>
                <h1 className="font-display text-2xl font-black text-white mt-1">
                  {gmAssignedGame ? `Station #${gmAssignedGame.gameNumber} • ${gmAssignedGame.name}` : "No station assigned yet"}
                </h1>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  {gmAssignedGame?.location || "Designated tournament zone"}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono text-slate-400">Current Round:</span>
                <span className="px-3 py-1 rounded-full bg-[#0066ff]/20 text-[#38bdf8] font-mono font-bold text-sm border border-[#0066ff]/40">
                  Round {currentRound} / 9
                </span>
              </div>
            </div>

            {gmAssignedGame ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Station Controls Card */}
                <div className="lg:col-span-2 youpulse-card laser-card p-6 border-slate-800 space-y-6">
                  <div className="tech-corners" />

                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                        Match Status
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`w-3 h-3 rounded-full ${
                            gmAssignedGame.status === "in_progress"
                              ? "bg-amber-400 animate-ping"
                              : gmAssignedGame.status === "completed"
                              ? "bg-emerald-400"
                              : "bg-slate-500"
                          }`}
                        />
                        <span className="font-display font-bold text-lg text-white uppercase">
                          {gmAssignedGame.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    {gmAssignedGame.startedAt && (
                      <SyncedTimer
                        startedAt={gmAssignedGame.startedAt}
                        durationMinutes={eventState.roundDurationMinutes || 15}
                        status={gmAssignedGame.status}
                      />
                    )}
                  </div>

                  {/* Rules & Description */}
                  <div className="bg-[#07090e] p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
                    <p className="text-slate-300 font-semibold">{gmAssignedGame.description}</p>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      <strong className="text-[#00d2ff]">Station Rules:</strong> {gmAssignedGame.rules}
                    </p>
                  </div>

                  {/* Match Control Buttons */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    {gmAssignedGame.status === "pending" && (
                      <button
                        onClick={() => handleStartGame(gmAssignedGame._id!)}
                        disabled={actionLoading}
                        className="px-6 py-3 rounded-full text-sm font-sans font-bold btn-youpulse-primary flex items-center space-x-2"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Start Round {currentRound} Match</span>
                      </button>
                    )}

                    {gmAssignedGame.status === "in_progress" && (
                      <button
                        onClick={() => {
                          setSelectedWinnerGame(gmAssignedGame);
                          setSelectedWinnerTeamId(allTeams[0]?._id || "");
                        }}
                        disabled={actionLoading}
                        className="px-6 py-3 rounded-full text-sm font-sans font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center space-x-2 shadow-lg shadow-emerald-500/20"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>End Match & Award Secret Clue</span>
                      </button>
                    )}

                    {gmAssignedGame.status === "completed" && (
                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Match Completed & Clue Awarded
                        </span>
                        <button
                          onClick={() => handleResetGameStatus(gmAssignedGame._id!)}
                          className="px-3 py-1.5 rounded-full text-xs font-mono text-slate-400 hover:text-white bg-slate-900 border border-slate-800 flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Reset Match
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Team Currently Playing at this Station */}
                <div className="youpulse-card p-6 border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-3">
                      Current Competing Team (Round {currentRound})
                    </span>

                    {allTeams.length > 0 ? (
                      allTeams.map((team) => (
                        <div key={team._id} className="space-y-4">
                          <div className="flex items-center space-x-3 p-3 rounded-xl bg-[#07090e] border border-slate-800">
                            <span
                              className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                              style={{ backgroundColor: team.color }}
                            />
                            <div>
                              <h4 className="font-display font-bold text-white text-base">
                                {team.name}
                              </h4>
                              <p className="text-[11px] font-mono text-slate-400">
                                {team.clueCount} clues won so far
                              </p>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-mono uppercase text-slate-500 block mb-2">
                              Team Members ({team.members?.length || 0} players):
                            </span>
                            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                              {team.members?.map((m, idx) => (
                                <div
                                  key={idx}
                                  className="text-xs font-mono p-2 rounded-lg bg-[#07090e]/60 border border-slate-800/80 flex items-center justify-between"
                                >
                                  <span className="text-slate-200 font-semibold">{m.fullName}</span>
                                  <div className="flex items-center space-x-1.5 text-[10px]">
                                    <span className="px-1.5 py-0.5 rounded-sm bg-blue-500/20 text-[#38bdf8]">
                                      {m.year}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded-sm bg-purple-500/20 text-purple-300">
                                      {m.className}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-xs font-mono text-slate-500">
                        No team is currently assigned to this station for Round {currentRound}.
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-500">
                    🔒 You are assigned only to this station. Clues can only be granted to the current team.
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 youpulse-card border-slate-800">
                <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                <h3 className="text-lg font-display font-bold text-white">No Assigned Station</h3>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  Ask the Super Admin to assign your account to one of the 14 game stations.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: GLOBAL ADMIN / SUPER ADMIN PORTAL (Full Control Suite) */}
        {/* ============================================================== */}
        {isAdmin && (
          <div className="space-y-6">
            {/* Navigation Tabs for Admin */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.06)] pb-4">
              <div className="flex flex-wrap items-center gap-2 font-mono">
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

                <button
                  onClick={() => setActiveAdminTab("staff")}
                  className={`px-4 py-2 rounded-full text-xs font-bold flex items-center space-x-2 transition-all ${
                    activeAdminTab === "staff"
                      ? "bg-[#0066ff] text-white shadow-lg shadow-[#0066ff]/40"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Game Masters & Staff</span>
                </button>

                <button
                  onClick={() => setActiveAdminTab("csv")}
                  className={`px-4 py-2 rounded-full text-xs font-bold flex items-center space-x-2 transition-all ${
                    activeAdminTab === "csv"
                      ? "bg-[#0066ff] text-white shadow-lg shadow-[#0066ff]/40"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>CSV Form & Balancer</span>
                </button>

                <button
                  onClick={() => setActiveAdminTab("overrides")}
                  className={`px-4 py-2 rounded-full text-xs font-bold flex items-center space-x-2 transition-all ${
                    activeAdminTab === "overrides"
                      ? "bg-[#0066ff] text-white shadow-lg shadow-[#0066ff]/40"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Clues & Overrides</span>
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
              </div>

              {/* Quick Round Navigator */}
              <div className="flex items-center space-x-2 bg-[#0c0f18] px-3.5 py-1.5 rounded-full border border-slate-800 font-mono">
                <span className="text-xs text-slate-400 font-semibold">Active Round:</span>
                <select
                  value={currentRound}
                  onChange={(e) => handleSetRound(parseInt(e.target.value, 10))}
                  className="bg-[#07090e] text-xs font-bold text-[#00d2ff] px-2.5 py-1 rounded-full border border-slate-700 focus:outline-none"
                >
                  {Array.from({ length: 9 }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Round {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* TAB 1: ALL STATIONS & MATCH CONTROLS */}
            {activeAdminTab === "controls" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-white">
                    All Game Stations & Live Match Management
                  </h2>
                  <span className="text-xs font-mono text-slate-400">
                    {allGames.length} stations active • Round {currentRound}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {allGames.map((game) => (
                    <div
                      key={game._id}
                      className={`youpulse-card p-5 border flex flex-col justify-between ${
                        !game.inRotation
                          ? "border-cyan-500/30 bg-cyan-950/10"
                          : game.status === "in_progress"
                          ? "border-amber-500/40"
                          : game.status === "completed"
                          ? "border-emerald-500/30"
                          : "border-slate-800"
                      }`}
                    >
                      <div>
                        {/* Header Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-mono text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                            Station #{game.gameNumber}
                          </span>

                          <div className="flex items-center space-x-1.5">
                            {/* Freeze / Unfreeze button */}
                            <button
                              onClick={() => handleToggleFreeze(game._id!)}
                              title={game.inRotation ? "Freeze Station (Exclude from rotation)" : "Unfreeze Station (Return to rotation)"}
                              className={`p-1.5 rounded-lg text-xs font-mono border transition-colors ${
                                !game.inRotation
                                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30"
                                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-cyan-300"
                              }`}
                            >
                              <Snowflake className="w-3.5 h-3.5" />
                            </button>

                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                                !game.inRotation
                                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                                  : game.status === "in_progress"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                                  : game.status === "completed"
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                  : "bg-slate-800 text-slate-400 border border-slate-700"
                              }`}
                            >
                              {!game.inRotation ? "FROZEN" : game.status.replace("_", " ")}
                            </span>
                          </div>
                        </div>

                        <h3 className="font-display font-bold text-lg text-white">{game.name}</h3>
                        <p className="text-xs font-mono text-slate-400 mt-1 line-clamp-2">
                          {game.description}
                        </p>
                        <p className="text-[11px] font-mono text-slate-500 mt-2 flex items-center gap-1">
                          📍 {game.location}
                        </p>
                      </div>

                      {/* Controls Footer */}
                      <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        {game.status === "pending" && (
                          <button
                            onClick={() => handleStartGame(game._id!)}
                            disabled={actionLoading}
                            className="w-full py-2 rounded-full text-xs font-mono font-bold bg-[#0066ff] hover:bg-[#0052cc] text-white flex items-center justify-center gap-1.5 shadow-md shadow-[#0066ff]/20"
                          >
                            <Play className="w-3 h-3 fill-white" /> Start Match
                          </button>
                        )}

                        {game.status === "in_progress" && (
                          <button
                            onClick={() => {
                              setSelectedWinnerGame(game);
                              setSelectedWinnerTeamId(allTeams[0]?._id || "");
                            }}
                            disabled={actionLoading}
                            className="w-full py-2 rounded-full text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Finish & Award
                          </button>
                        )}

                        {game.status === "completed" && (
                          <div className="w-full flex items-center justify-between">
                            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Done
                            </span>
                            <button
                              onClick={() => handleResetGameStatus(game._id!)}
                              className="text-[10px] font-mono text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full"
                            >
                              Reset
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: GAME MASTERS & STAFF MANAGER */}
            {activeAdminTab === "staff" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Create Game Master Form */}
                  <div className="youpulse-card laser-card p-6 border-slate-800 h-fit">
                    <div className="tech-corners" />
                    <h3 className="font-display font-bold text-lg text-white mb-2 flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-[#00d2ff]" />
                      <span>Create Game Master Account</span>
                    </h3>
                    <p className="text-xs font-mono text-slate-400 mb-6">
                      Rule: Each Game Master is responsible for exactly ONE game station and only controls matches for that game.
                    </p>

                    {staffSuccess && (
                      <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400">
                        {staffSuccess}
                      </div>
                    )}

                    {staffError && (
                      <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-400">
                        {staffError}
                      </div>
                    )}

                    <form onSubmit={handleCreateStaff} className="space-y-4 font-mono text-xs">
                      <div>
                        <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Yassine El Amrani"
                          value={newStaffName}
                          onChange={(e) => setNewStaffName(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#07090e] border border-slate-700 text-white focus:border-[#00d2ff] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="gm@youcode.ma"
                          value={newStaffEmail}
                          onChange={(e) => setNewStaffEmail(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#07090e] border border-slate-700 text-white focus:border-[#00d2ff] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                          Initial Password
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={newStaffPassword}
                          onChange={(e) => setNewStaffPassword(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#07090e] border border-slate-700 text-white focus:border-[#00d2ff] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                          Role
                        </label>
                        <select
                          value={newStaffRole}
                          onChange={(e) => setNewStaffRole(e.target.value as any)}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#07090e] border border-slate-700 text-white focus:border-[#00d2ff] focus:outline-none"
                        >
                          <option value="GAME_MASTER">Game Master (Single Game Station)</option>
                          <option value="ADMIN">Staff Admin (All Games)</option>
                        </select>
                      </div>

                      {newStaffRole === "GAME_MASTER" && (
                        <div>
                          <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                            Assigned Game Station (1 Game)
                          </label>
                          <select
                            required
                            value={newStaffGameId}
                            onChange={(e) => setNewStaffGameId(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-[#07090e] border border-slate-700 text-white focus:border-[#00d2ff] focus:outline-none"
                          >
                            <option value="">-- Choose Game Station --</option>
                            {allGames.map((g) => (
                              <option key={g._id} value={g._id}>
                                Station #{g.gameNumber} • {g.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={staffCreating}
                        className="w-full py-2.5 rounded-full font-sans font-bold btn-youpulse-primary mt-2"
                      >
                        {staffCreating ? "Creating..." : "Create & Assign Account"}
                      </button>
                    </form>
                  </div>

                  {/* Existing Game Masters Table */}
                  <div className="lg:col-span-2 youpulse-card p-6 border-slate-800">
                    <h3 className="font-display font-bold text-lg text-white mb-2 flex items-center justify-between">
                      <span>Registered Game Masters & Staff</span>
                      <span className="text-xs font-mono text-slate-400 font-normal">
                        {staffList.length} accounts
                      </span>
                    </h3>
                    <p className="text-xs font-mono text-slate-400 mb-6">
                      Admins have master control over all stations. Game Masters are locked to their single assigned station.
                    </p>

                    <div className="overflow-x-auto">
                      <table className="w-full font-mono text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider text-left">
                            <th className="py-2.5 px-3">Name</th>
                            <th className="py-2.5 px-3">Email</th>
                            <th className="py-2.5 px-3">Role</th>
                            <th className="py-2.5 px-3">Assigned Station</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {staffList.map((s) => {
                            const assignedGame = allGames.find(
                              (g) =>
                                g._id === (s as any).assignedGameId ||
                                (s.assignedGameIds && s.assignedGameIds.includes(g._id!))
                            );
                            return (
                              <tr key={s._id} className="hover:bg-white/5 transition-colors">
                                <td className="py-3 px-3 font-semibold text-white">{s.name}</td>
                                <td className="py-3 px-3 text-slate-300">{s.email}</td>
                                <td className="py-3 px-3">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      s.role === "SUPER_ADMIN"
                                        ? "bg-amber-500/20 text-amber-300"
                                        : s.role === "ADMIN"
                                        ? "bg-blue-500/20 text-[#38bdf8]"
                                        : "bg-purple-500/20 text-purple-300"
                                    }`}
                                  >
                                    {s.role}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-slate-300">
                                  {s.role === "SUPER_ADMIN" || s.role === "ADMIN" ? (
                                    <span className="text-[#00d2ff]">All Stations (Master)</span>
                                  ) : assignedGame ? (
                                    `Station #${assignedGame.gameNumber} • ${assignedGame.name}`
                                  ) : (
                                    <span className="text-slate-500">Unassigned</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-right">
                                  {s.role !== "SUPER_ADMIN" && (
                                    <button
                                      onClick={() => handleDeleteStaff(s._id!)}
                                      className="p-1 rounded-md text-red-400 hover:bg-red-500/20"
                                      title="Delete Staff Account"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CSV IMPORT & ADVANCED TEAM BALANCER */}
            {activeAdminTab === "csv" && (
              <div className="space-y-6 font-mono">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-[#00d2ff]" />
                    <span>Google Form CSV Import & Multi-Criteria Team Balancer</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Accepts responses matching the registration form: <code className="text-[#00d2ff]">Timestamp, Full Name, Level, Class Name, Gender, Solo/Team</code>.
                  </p>
                </div>

                {csvSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{csvSuccess}</span>
                  </div>
                )}

                {csvError && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{csvError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* CSV Input Panel */}
                  <div className="youpulse-card p-6 border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white uppercase">Upload or Paste CSV</span>
                      <label className="cursor-pointer px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs text-[#00d2ff] hover:bg-white/5 flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" /> Choose .csv file
                        <input
                          type="file"
                          accept=".csv,.txt"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <textarea
                      rows={12}
                      value={csvText}
                      onChange={(e) => setCsvText(e.target.value)}
                      placeholder={`Timestamp,Full Name,Level,Class Name,Gender,Do you want to play solo or in a team?\n2026/11/08 14:00,Yassine Mansouri,A1,Class 1,Male,Team\n2026/11/08 14:01,Salma Berrada,A2,Class 3,Female,Team\n2026/11/08 14:02,Othmane Bennani,A1,Class 5,Male,Solo`}
                      className="w-full p-3.5 rounded-xl bg-[#07090e] border border-slate-800 text-xs text-slate-200 focus:border-[#00d2ff] focus:outline-none font-mono"
                    />

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handlePreviewCSV}
                        disabled={csvLoading || !csvText.trim()}
                        className="flex-1 py-2.5 rounded-full text-xs font-bold bg-slate-900 border border-slate-700 text-white hover:bg-slate-800 flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#00d2ff]" />
                        <span>Test & Preview Balancing</span>
                      </button>

                      <button
                        onClick={handleDeployCSV}
                        disabled={csvLoading || !csvText.trim()}
                        className="flex-1 py-2.5 rounded-full text-xs font-sans font-bold btn-youpulse-primary flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Deploy Teams to Tournament</span>
                      </button>
                    </div>
                  </div>

                  {/* Balancing Rules & Criteria Summary */}
                  <div className="youpulse-card p-6 border-slate-800 space-y-4">
                    <span className="text-xs font-bold text-white uppercase">Balancing Logic Hierarchy</span>
                    <ul className="space-y-2.5 text-xs text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-md bg-[#0066ff]/20 text-[#38bdf8] flex items-center justify-center text-[10px] shrink-0 font-bold">1</span>
                        <span><strong>Equal Year 1 & Year 2:</strong> Targets 3 A1 and 3 A2 students per team of 6 for balanced seniority.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-300 flex items-center justify-center text-[10px] shrink-0 font-bold">2</span>
                        <span><strong>Equal Gender:</strong> Targets 3 Male and 3 Female students per team of 6.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] shrink-0 font-bold">3</span>
                        <span><strong>8 Classes Diversity:</strong> Prioritizes 1 player per class in each team to maximize new cross-class friendships.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] shrink-0 font-bold">4</span>
                        <span><strong>Leftovers Scramble (&quot;Shambles&quot;):</strong> Remaining students who cannot fit exact symmetry are scrambled evenly across teams (5 to 7 players).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] shrink-0 font-bold">5</span>
                        <span><strong>Solo Player Lounge:</strong> Students who chose &quot;Solo&quot; are automatically placed into the Solo Board Games showcase.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Dry Run Preview Results */}
                {csvPreview && (
                  <div className="youpulse-card p-6 border-slate-800 space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3.5 rounded-xl bg-[#07090e] border border-slate-800">
                        <span className="text-[10px] uppercase text-slate-400 block">Total Records</span>
                        <strong className="text-lg text-white font-display">{csvPreview.totalRows}</strong>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#07090e] border border-slate-800">
                        <span className="text-[10px] uppercase text-slate-400 block">Team Candidates</span>
                        <strong className="text-lg text-[#00d2ff] font-display">{csvPreview.teamCandidates}</strong>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#07090e] border border-slate-800">
                        <span className="text-[10px] uppercase text-slate-400 block">Solo Players</span>
                        <strong className="text-lg text-purple-400 font-display">{csvPreview.soloCount}</strong>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#07090e] border border-slate-800">
                        <span className="text-[10px] uppercase text-slate-400 block">Balanced Teams</span>
                        <strong className="text-lg text-emerald-400 font-display">{csvPreview.teamCount}</strong>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white mb-3">Preview of Generated Teams:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {csvPreview.teams?.map((t: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-xl bg-[#07090e] border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white font-display">{t.name}</span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {t.memberCount} players
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-1 text-[10px] text-center pt-1">
                              <span className="p-1 rounded bg-blue-500/10 text-[#38bdf8]">
                                A1: {t.a1Count} | A2: {t.a2Count}
                              </span>
                              <span className="p-1 rounded bg-purple-500/10 text-purple-300">
                                M: {t.maleCount} | F: {t.femaleCount}
                              </span>
                              <span className="p-1 rounded bg-emerald-500/10 text-emerald-300">
                                {t.distinctClasses} classes
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: ADMIN OVERRIDES & CLUE VAULT */}
            {activeAdminTab === "overrides" && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="font-display text-xl font-bold text-white">
                    Emergency Admin Overrides & Grand Final Clue Reveal
                  </h2>
                  <p className="text-xs font-mono text-slate-400 mt-1">
                    Direct organizer tools to adjust team clues, reveal final riddles, or advance tournament rounds.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Final Reveal Card */}
                  <div className="youpulse-card p-6 border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase text-slate-400">
                        Grand Final Clue Vault
                      </span>
                      <span
                        className={`px-3 py-0.5 rounded-full text-xs font-mono font-bold uppercase ${
                          eventState.cluesRevealed
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-red-500/20 text-red-300 border border-red-500/40"
                        }`}
                      >
                        {eventState.cluesRevealed ? "UNLOCKED & REVEALED" : "ENCRYPTED & LOCKED"}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-slate-300">
                      When activated, full secret riddle texts are decrypted and revealed to all teams on their mission screens to initiate the final clue-solving puzzle.
                    </p>

                    <button
                      onClick={handleToggleFinalReveal}
                      className={`w-full py-3 rounded-full text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                        eventState.cluesRevealed
                          ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                          : "bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/30"
                      }`}
                    >
                      {eventState.cluesRevealed ? (
                        <>
                          <Lock className="w-4 h-4" /> Relock Clues Content
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4" /> ACTIVATE FINAL CLUE REVEAL
                        </>
                      )}
                    </button>
                  </div>

                  {/* Manual Clue Dispatcher */}
                  <div className="youpulse-card p-6 border-slate-800 space-y-4">
                    <span className="text-xs font-mono font-bold uppercase text-slate-400 block">
                      Manual Clue Dispatcher (+/- Clues)
                    </span>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1 font-mono text-xs">
                      {allTeams.map((team) => (
                        <div
                          key={team._id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[#07090e] border border-slate-800"
                        >
                          <div className="flex items-center space-x-2">
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: team.color }}
                            />
                            <span className="font-semibold text-white">{team.name}</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-[#00d2ff] w-12 text-center">
                              {team.clueCount} clues
                            </span>
                            <button
                              onClick={() => handleAdjustClues(team._id!, -1)}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                            >
                              -1
                            </button>
                            <button
                              onClick={() => handleAdjustClues(team._id!, 1)}
                              className="px-2 py-0.5 rounded bg-[#0066ff] hover:bg-[#0052cc] text-white"
                            >
                              +1
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: AUDIT LOGS */}
            {activeAdminTab === "audit" && (
              <div className="space-y-4 font-mono">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="font-display text-xl font-bold text-white">Live System Audit Trail</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Immutable log of all actions taken by Game Masters and Administrators.
                  </p>
                </div>

                <div className="youpulse-card p-6 border-slate-800">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider text-left">
                          <th className="py-2.5 px-3">Time</th>
                          <th className="py-2.5 px-3">Staff / Email</th>
                          <th className="py-2.5 px-3">Action</th>
                          <th className="py-2.5 px-3">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {auditLogs.map((log, idx) => (
                          <tr key={log._id || idx} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleTimeString()}
                            </td>
                            <td className="py-3 px-3 font-semibold text-white">
                              {log.adminEmail}
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-[#00d2ff] font-bold text-[10px]">
                                {log.action}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-300">{log.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Winner Selection Modal */}
        {selectedWinnerGame && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-md youpulse-card laser-card p-6 border-slate-700 space-y-5">
              <div className="tech-corners" />

              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-display font-bold text-lg text-white">
                  Finish Station Match & Award Clue
                </h3>
                <button
                  onClick={() => setSelectedWinnerGame(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs font-mono text-slate-300">
                Designate the winning team for{" "}
                <strong className="text-white">{selectedWinnerGame.name}</strong> (Round {currentRound}).
                The winning team will unlock their secret clue fragment.
              </div>

              <div className="space-y-2 font-mono">
                {allTeams.map((team) => (
                  <label
                    key={team._id}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                      selectedWinnerTeamId === team._id
                        ? "bg-[#0066ff]/20 border-[#0066ff] text-white"
                        : "bg-[#07090e] border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="radio"
                        name="winnerTeam"
                        value={team._id}
                        checked={selectedWinnerTeamId === team._id}
                        onChange={() => setSelectedWinnerTeamId(team._id!)}
                        className="text-[#0066ff] focus:ring-0"
                      />
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: team.color }}
                      />
                      <span className="font-semibold text-xs">{team.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{team.clueCount} clues</span>
                  </label>
                ))}

                {/* Option for Draw or Free Play without clue */}
                <label
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedWinnerTeamId === ""
                      ? "bg-slate-800 border-slate-600 text-white"
                      : "bg-[#07090e] border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <input
                      type="radio"
                      name="winnerTeam"
                      value=""
                      checked={selectedWinnerTeamId === ""}
                      onChange={() => setSelectedWinnerTeamId("")}
                      className="text-slate-500 focus:ring-0"
                    />
                    <span className="font-semibold text-xs">No Winner / Draw (No clue awarded)</span>
                  </div>
                </label>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedWinnerGame(null)}
                  className="flex-1 py-2.5 rounded-full text-xs font-mono font-semibold bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmEndGame}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-full text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
                >
                  {actionLoading ? "Submitting..." : "Confirm & Award Clue"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
