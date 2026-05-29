import React from "react";
import { useAuth } from "@/lib/auth";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Zap, Shield, Smartphone, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function UserProfileStats() {
  const { profile } = useAuth();

  if (!profile) return null;

  // Level logic: every 100 XP = 1 level
  const xpForNextLevel = 100;
  const currentLevelXp = (profile.xp || 0) % xpForNextLevel;
  const progress = (currentLevelXp / xpForNextLevel) * 100;

  return (
    <div className="space-y-6">
      {/* Personalized Operative Identity Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5 gap-4 shadow-lg animate-in fade-in duration-500">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-lg">
            {profile.displayName?.charAt(0).toUpperCase() || "P"}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block">Authenticated Operative</span>
              <Badge variant="outline" className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                {profile.role || "Player"}
              </Badge>
            </div>
            <h3 className="text-base font-black uppercase text-white tracking-wider flex items-center gap-1.5">
              {profile.displayName || "Tactical Player"}
              {profile.ffIgn && <BadgeCheck className="w-4 h-4 text-primary" />}
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <div className="flex flex-row items-center gap-3 bg-black/40 px-4 py-3 rounded-2xl border border-white/5 min-w-[150px] flex-1 md:flex-initial">
            <Smartphone className="w-4 h-4 text-primary shrink-0" />
            <div className="flex flex-col leading-none">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.15em] mb-1">Free Fire IGN</span>
              <span className="text-xs font-black text-primary truncate max-w-[120px]">
                {profile.ffIgn || "Not Configured"}
              </span>
            </div>
          </div>
          <div className="flex flex-row items-center gap-3 bg-black/40 px-4 py-3 rounded-2xl border border-white/5 min-w-[150px] flex-1 md:flex-initial">
            <Shield className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="flex flex-col leading-none">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.15em] mb-1">Free Fire UID</span>
              <span className="text-xs font-black font-mono text-slate-300 truncate max-w-[120px]">
                {profile.ffUid || "Not Configured"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Level & XP Card */}
        <div className="glass p-5 rounded-3xl border-subtle relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="w-12 h-12 text-primary" />
          </div>
          <div className="relative">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1 block">Tier Status</span>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-3xl font-black italic uppercase">Level {profile.level || 1}</span>
              <span className="text-xs font-bold text-slate-500 mb-1">XP {profile.xp || 0}</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-white/5" />
            <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">{xpForNextLevel - currentLevelXp} XP to next promotion</p>
          </div>
        </div>

        {/* Battle Stats */}
        <div className="glass p-5 rounded-3xl border-subtle relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target className="w-12 h-12 text-rose-500" />
          </div>
          <div className="relative">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1 block">Combat Efficiency</span>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <span className="block text-2xl font-black text-rose-400">{profile.kills || 0}</span>
                <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Confirmed Neutralizations</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-amber-400">
                  {profile.matchesPlayed ? ((profile.kills || 0) / profile.matchesPlayed).toFixed(2) : '0.00'}
                </span>
                <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">K/D Ratio Index</span>
              </div>
            </div>
          </div>
        </div>

        {/* Earnings Stats */}
        <div className="glass p-5 rounded-3xl border-subtle relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Trophy className="w-12 h-12 text-emerald-500" />
          </div>
          <div className="relative">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1 block">Revenue Stream</span>
            <div className="mt-2">
              <span className="block text-2xl font-black text-emerald-400 italic font-mono">৳{profile.totalWinnings || 0}</span>
              <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Cumulative Tactical Earnings</span>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="glass p-5 rounded-3xl border-subtle flex flex-col justify-between animate-in fade-in duration-500">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 block">Tactical Merits</span>
          <div className="flex flex-wrap gap-2">
            {profile.badges?.map((badge, idx) => (
              <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                <Shield className="w-2.5 h-2.5 text-primary" />
                <span className="text-[9px] font-black uppercase tracking-wider text-primary">{badge}</span>
              </div>
            ))}
            {(!profile.badges || profile.badges.length === 0) && (
               <span className="text-[10px] text-slate-600 font-bold uppercase italic">No merits recorded yet.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
