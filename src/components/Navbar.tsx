"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Shield, Users, Trophy, Compass, Sparkles, LayoutGrid, Radio, ArrowUpRight } from "lucide-react";

interface NavbarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  isLive?: boolean;
  currentRound?: number;
}

export default function Navbar({
  activeTab = "leaderboard",
  setActiveTab,
  isLive = true,
  currentRound = 1,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? "bg-[#07090e]/90 backdrop-blur-xl border-[rgba(255,255,255,0.08)] shadow-2xl shadow-black/80"
          : "bg-[#07090e]/60 backdrop-blur-md border-[rgba(255,255,255,0.05)]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand & Official YouPulse Logo */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-3 group">
            {/* Logo Image */}
            <div className="relative h-11 w-11 rounded-xl bg-white p-1 flex items-center justify-center shadow-lg shadow-[#0066ff]/25 group-hover:scale-105 transition-transform overflow-hidden">
              <Image
                src="/youpulse-logo.png"
                alt="YouPulse • BDE YouCode Youssoufia"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-black text-xl tracking-tight text-white flex items-center">
                  You<span className="text-[#0084ff]">Pulse</span>
                </span>
                {/* Audio Equalizer Bars Animation from youpulse-six */}
                <div className="eq-bars-wrapper hidden sm:inline-flex" title="Live Event Active">
                  <span className="eq-bar"></span>
                  <span className="eq-bar"></span>
                  <span className="eq-bar"></span>
                  <span className="eq-bar"></span>
                  <span className="eq-bar"></span>
                </div>
              </div>
              <p className="text-[11px] font-mono text-slate-400 tracking-wider">
                BDE <span className="text-[#00d2ff]">•</span> YouCode Youssoufia
              </p>
            </div>
          </Link>

          {/* Live Sync Beacon */}
          <div className="hidden xl:flex items-center space-x-2 pl-4 border-l border-slate-800/80">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d2ff] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00d2ff]"></span>
            </span>
            <span className="text-[11px] font-mono font-semibold text-[#00d2ff] uppercase tracking-wider flex items-center gap-1">
              LIVE SYNC
            </span>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-900/90 px-2.5 py-0.5 rounded-full border border-slate-800">
              Round {currentRound}/9
            </span>
          </div>
        </div>

        {/* Tab Controls (Homepage) */}
        {setActiveTab && (
          <nav className="hidden lg:flex items-center space-x-1 bg-[#0c0f18]/90 p-1.5 rounded-full border border-[rgba(255,255,255,0.08)] shadow-inner">
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold flex items-center space-x-2 transition-all ${
                activeTab === "leaderboard"
                  ? "bg-[#0066ff] text-white shadow-lg shadow-[#0066ff]/40"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Leaderboard</span>
            </button>

            <button
              onClick={() => setActiveTab("stations")}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold flex items-center space-x-2 transition-all ${
                activeTab === "stations"
                  ? "bg-[#0066ff] text-white shadow-lg shadow-[#0066ff]/40"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Stations</span>
            </button>

            <button
              onClick={() => setActiveTab("teams")}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold flex items-center space-x-2 transition-all ${
                activeTab === "teams"
                  ? "bg-[#0066ff] text-white shadow-lg shadow-[#0066ff]/40"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Teams</span>
            </button>

            <button
              onClick={() => setActiveTab("boardgames")}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold flex items-center space-x-2 transition-all ${
                activeTab === "boardgames"
                  ? "bg-[#0066ff] text-white shadow-lg shadow-[#0066ff]/40"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Board Games</span>
            </button>
          </nav>
        )}

        {/* Right Action Links */}
        <div className="flex items-center space-x-3">
          <Link
            href="/solo"
            className="px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-400 transition-all flex items-center space-x-1.5"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Solo Lounge</span>
          </Link>

          <Link
            href="/admin"
            className="btn-youpulse-primary"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Staff Portal</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
