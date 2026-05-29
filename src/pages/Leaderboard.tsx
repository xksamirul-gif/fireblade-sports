import React, { useState, useEffect } from "react";
import { db, handleFirestoreError } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot, where, getDocs } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Target, TrendingUp, Search, Calendar, Swords } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LeaderboardEntry {
  userId: string;
  playerName: string;
  totalWinnings: number;
  kills: number;
  matchesPlayed: number;
  wins: number;
  kdRatio?: number;
  winRate?: number;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [timePeriod, setTimePeriod] = useState("overall");

  useEffect(() => {
    setLoading(true);
    if (timePeriod === "overall") {
      const q = query(
        collection(db, "users"), 
        orderBy("totalWinnings", "desc"), 
        limit(50)
      );
      
      const unsub = onSnapshot(q, (snap) => {
        const platformUsers = snap.docs.map(d => {
          const data = d.data();
          return {
            userId: d.id,
            playerName: data.displayName || data.userId.substring(0, 8),
            totalWinnings: data.totalWinnings || 0,
            kills: data.kills || 0,
            matchesPlayed: data.matchesPlayed || 0,
            wins: data.wins || 0,
            kdRatio: data.matchesPlayed > 0 ? (data.kills / data.matchesPlayed) : 0,
            winRate: data.matchesPlayed > 0 ? ((data.wins / data.matchesPlayed) * 100) : 0,
          };
        });
        setEntries(platformUsers);
        setLoading(false);
      }, (err) => handleFirestoreError(err, 'list', 'users'));
      
      return () => unsub();
    } else {
      // Aggregating from results collection for time periods
      // This is a simplified implementation for the demo
      // In a real app, you'd calculate these periodically on the server
      const now = new Date();
      let startTime = new Date();
      if (timePeriod === "daily") startTime.setHours(0, 0, 0, 0);
      else if (timePeriod === "weekly") startTime.setDate(now.getDate() - 7);
      else if (timePeriod === "monthly") startTime.setMonth(now.getMonth() - 1);

      const q = query(
        collection(db, "results"),
        where("createdAt", ">=", startTime),
        orderBy("createdAt", "desc")
      );

      getDocs(q).then((snap) => {
        const statsMap: Record<string, any> = {};
        snap.forEach(d => {
          const res = d.data();
          if (!statsMap[res.userId]) {
            statsMap[res.userId] = {
              userId: res.userId,
              playerName: res.playerName,
              totalWinnings: 0,
              kills: 0,
              matchesPlayed: 0,
              wins: 0
            };
          }
          statsMap[res.userId].totalWinnings += res.winnings;
          statsMap[res.userId].kills += res.kills;
          statsMap[res.userId].matchesPlayed += 1;
          if (res.rank === 1) statsMap[res.userId].wins += 1;
        });

        const aggregated = Object.values(statsMap).map((s: any) => ({
          ...s,
          kdRatio: s.matchesPlayed > 0 ? (s.kills / s.matchesPlayed) : 0,
          winRate: s.matchesPlayed > 0 ? ((s.wins / s.matchesPlayed) * 100) : 0,
        })).sort((a, b) => b.totalWinnings - a.totalWinnings);

        setEntries(aggregated);
        setLoading(false);
      }).catch(err => {
        handleFirestoreError(err, 'list', 'results');
        setLoading(false);
      });
    }
  }, [timePeriod]);

  const filtered = entries.filter(e => 
    e.playerName.toLowerCase().includes(search.toLowerCase())
  );

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-amber-400" />;
    if (index === 1) return <Medal className="w-5 h-5 text-slate-300" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-700" />;
    return <span className="text-[10px] font-black text-slate-600">#{index + 1}</span>;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter italic">Global Hall of Fame</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Ranking the elite operatives of FireBlade.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input 
              placeholder="Search operative..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 h-10 glass border-subtle bg-black/20 focus:border-primary/50"
            />
          </div>
          <Tabs value={timePeriod} onValueChange={setTimePeriod} className="w-full sm:w-auto">
            <TabsList className="bg-white/5 border border-white/5 p-1 h-10">
              <TabsTrigger value="overall" className="text-[9px] uppercase font-black px-4 data-[state=active]:accent-bg data-[state=active]:text-black">Overall</TabsTrigger>
              <TabsTrigger value="daily" className="text-[9px] uppercase font-black px-4 data-[state=active]:accent-bg data-[state=active]:text-black">Daily</TabsTrigger>
              <TabsTrigger value="weekly" className="text-[9px] uppercase font-black px-4 data-[state=active]:accent-bg data-[state=active]:text-black">Weekly</TabsTrigger>
              <TabsTrigger value="monthly" className="text-[9px] uppercase font-black px-4 data-[state=active]:accent-bg data-[state=active]:text-black">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="wait">
          {filtered.slice(0, 3).map((top, idx) => (
            <motion.div
              key={`${top.userId}-${timePeriod}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-6 rounded-[2.5rem] glass border-subtle relative overflow-hidden group ${
                idx === 0 ? 'bg-primary/5 border-primary/20 lg:scale-105 z-10' : ''
              }`}
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                {idx === 0 ? <Trophy className="w-32 h-32" /> : <Medal className="w-32 h-32" />}
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${
                  idx === 0 ? 'bg-primary border-primary text-black' : 'bg-black/40 border-white/10'
                }`}>
                  {getRankIcon(idx)}
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase italic truncate max-w-[150px]">{top.playerName}</h3>
                  <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest bg-white/5">
                    Operative Level {Math.floor(top.kills / 10) + 1}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Total Winnings</span>
                  <span className="text-xl font-black text-emerald-400 italic">৳{top.totalWinnings.toLocaleString()}</span>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Combat K/D</span>
                  <span className="text-lg font-black italic">{top.kdRatio?.toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Card className="glass border-subtle overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5">
                <TableHead className="w-20 text-[10px] font-black uppercase tracking-widest text-center">Rank</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Operative</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Missions</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Kills</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-center text-primary">Win Rate</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-right text-emerald-400">Total Winnings (৳)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5 animate-pulse">
                    <TableCell colSpan={6} className="h-16 bg-white/5 mt-2 rounded-2xl" />
                  </TableRow>
                ))
              ) : filtered.length > 0 ? (
                filtered.map((entry, idx) => (
                  <TableRow key={entry.userId} className="border-white/5 h-16 hover:bg-white/5 transition-colors group">
                    <TableCell className="text-center font-black">{getRankIcon(idx)}</TableCell>
                    <TableCell>
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-black text-[10px] uppercase">
                            {entry.playerName.substring(0, 2)}
                          </div>
                          <span className="text-xs font-black uppercase italic group-hover:text-primary transition-colors">{entry.playerName}</span>
                       </div>
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs">{entry.matchesPlayed}</TableCell>
                    <TableCell className="text-center font-mono text-xs">{entry.kills}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-[9px] font-black uppercase border-primary/20 text-primary bg-primary/5">
                        {entry.winRate?.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-black text-emerald-400 italic text-sm">৳{entry.totalWinnings.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center opacity-30 grayscale saturate-0">
                      <Swords className="w-16 h-16 text-slate-500 mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest italic">No operatives identified in this sector.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass border-subtle p-6 rounded-3xl">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Swords className="w-5 h-5" />
             </div>
             <div>
                <h4 className="text-[10px] uppercase font-black text-slate-500">Peak Performance</h4>
                <p className="text-xs font-bold uppercase italic">Highest K/D: {(Math.max(...entries.map(e => e.kdRatio || 0))).toFixed(2)}</p>
             </div>
          </div>
        </Card>
        <Card className="glass border-subtle p-6 rounded-3xl">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Target className="w-5 h-5" />
             </div>
             <div>
                <h4 className="text-[10px] uppercase font-black text-slate-500">Elite Tactician</h4>
                <p className="text-xs font-bold uppercase italic">Best Win Rate: {(Math.max(...entries.map(e => e.winRate || 0))).toFixed(1)}%</p>
             </div>
          </div>
        </Card>
        <Card className="glass border-subtle p-6 rounded-3xl">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <TrendingUp className="w-5 h-5" />
             </div>
             <div>
                <h4 className="text-[10px] uppercase font-black text-slate-500">Field Commander</h4>
                <p className="text-xs font-bold uppercase italic">Top Extraction: ৳{(Math.max(...entries.map(e => e.totalWinnings || 0))).toLocaleString()}</p>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
