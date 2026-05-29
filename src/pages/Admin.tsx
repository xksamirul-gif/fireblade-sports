import { useState, useEffect, useMemo } from "react";
import React from "react";
import { useAuth } from "@/lib/auth";
import { db, handleFirestoreError } from "@/lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  runTransaction,
  addDoc,
  setDoc,
  serverTimestamp,
  getDocs,
  where,
  getDoc,
  deleteDoc,
  limit,
} from "firebase/firestore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { GoogleGenAI } from "@google/genai";
import {
  Trophy,
  CreditCard,
  Users as UsersIcon,
  Plus,
  Check,
  X,
  Megaphone,
  ShieldAlert,
  Map as MapIcon,
  Clock,
  Edit3,
  Trash2,
  LockKeyhole,
  LifeBuoy,
  Film,
  Layout,
  Search,
  AlertTriangle,
  Phone,
  Send,
  UserX,
  History,
  Grid,
  Video,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Hammer,
  Power,
  User,
  Settings,
  MessageCircle,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { safeFormat } from "@/lib/utils";

const notifyRoomCredentialsUpdate = async (matchId: string, matchTitle: string, newId: string, newPass: string) => {
  try {
    const q = query(
      collection(db, "matches", matchId, "registrations")
    );
    const snap = await getDocs(q);
    const batchRequests = snap.docs.map(async (d) => {
      const data = d.data();
      const notifRef = doc(collection(db, "users", data.userId, "notifications"));
      await setDoc(notifRef, {
        title: "BATTLE INTEL: ROOM UPDATED",
        message: `Match: ${matchTitle}. Room ID: ${newId || 'N/A'}, Pass: ${newPass || 'N/A'}. Deploy immediately!`,
        type: "match",
        read: false,
        roomId: newId,
        roomPassword: newPass,
        createdAt: serverTimestamp(),
      });
    });
    await Promise.all(batchRequests);
    console.log("Push notifications sent for room credentials update.");
  } catch (err) {
    console.error("Failed to push room updates", err);
  }
};

export default function AdminPage() {
  const { user, profile, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("control");

  // Simplified Role Based Access Control
  const roles: Record<string, "owner" | "moderator" | "treasurer"> = {
    "xksamirul@gmail.com": "owner",
    "mahi2007raj@gmail.com": "owner",
  };
  const displayRoles: Record<string, string> = {
    "xksamirul@gmail.com": "PRIMARY ADMIN",
    "mahi2007raj@gmail.com": "SECONDARY ADMIN",
  };
  const userEmail = user?.email || profile?.email || "";
  const role = roles[userEmail] || "user"; // Ensure default is Not owner
  const displayRole = displayRoles[userEmail] || role.toUpperCase();

  if (loading) return null;
  if (!isAdmin && role === "user") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <ShieldAlert className="w-20 h-20 text-destructive mb-6" />
        <h1 className="text-3xl font-black mb-2 uppercase">Access Denied</h1>
        <p className="text-muted-foreground">
          This sector is restricted to Command Center personnel only.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen border-x border-white/10 bg-[#06070a] shadow-2xl relative pb-20">
      <div className="relative overflow-hidden p-6 border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-10 w-full mb-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4d00]/20 blur-[60px] rounded-full" />
        <div className="relative flex flex-col gap-2">
          <div>
            <span className="text-[9px] font-black text-[#ff4d00] uppercase tracking-[0.3em] mb-1 block">
              Clearance: {displayRole}
            </span>
            <h1 className="text-2xl font-black mb-1 tracking-tighter uppercase italic text-white flex items-center gap-2">
              Command <span className="text-primary">Center</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5 mt-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex flex-col items-center justify-center border border-primary/30 text-primary">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[8px] uppercase font-black tracking-widest text-slate-400">
                Identity Confirmed
              </div>
              <div className="text-xs font-bold uppercase italic text-white truncate max-w-[150px]">
                {profile?.displayName || "Authorized Admin"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-10">
        <Tabs
          defaultValue="control"
          className="flex flex-col gap-[20px] w-full"
        >
          <TabsList className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-transparent h-auto p-0 w-full">
            {(role === "owner" || role === "moderator") && (
              <>
                <TabsTrigger
                  value="control"
                  className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 w-full rounded-2xl bg-white/5 data-[state=active]:bg-primary data-[state=active]:text-black border border-white/5 hover:bg-white/10 transition-all text-[10px] uppercase font-black"
                >
                  <LockKeyhole className="w-5 h-5" />
                  Control
                </TabsTrigger>
                <TabsTrigger
                  value="tourney"
                  className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 w-full rounded-2xl bg-white/5 data-[state=active]:bg-primary data-[state=active]:text-black border border-white/5 hover:bg-white/10 transition-all text-[10px] uppercase font-black"
                >
                  <Plus className="w-5 h-5" />
                  Tournaments
                </TabsTrigger>
                <TabsTrigger
                  value="users"
                  className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 w-full rounded-2xl bg-white/5 data-[state=active]:bg-primary data-[state=active]:text-black border border-white/5 hover:bg-white/10 transition-all text-[10px] uppercase font-black"
                >
                  <UsersIcon className="w-5 h-5" />
                  Players
                </TabsTrigger>
                <TabsTrigger
                  value="results"
                  className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 w-full rounded-2xl bg-white/5 data-[state=active]:bg-primary data-[state=active]:text-black border border-white/5 hover:bg-white/10 transition-all text-[10px] uppercase font-black"
                >
                  <Megaphone className="w-5 h-5" />
                  Results
                </TabsTrigger>
              </>
            )}
            <TabsTrigger
              value="tickets"
              className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 w-full rounded-2xl bg-white/5 data-[state=active]:bg-primary data-[state=active]:text-black border border-white/5 hover:bg-white/10 transition-all text-[10px] uppercase font-black"
            >
              <MessageCircle className="w-5 h-5" />
              Support
            </TabsTrigger>
            {role === "owner" && (
              <TabsTrigger
                value="logs"
                className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 w-full rounded-2xl bg-white/5 data-[state=active]:bg-primary data-[state=active]:text-black border border-white/5 hover:bg-white/10 transition-all text-[10px] uppercase font-black"
              >
                <History className="w-5 h-5" />
                Logs
              </TabsTrigger>
            )}
            <TabsTrigger
              value="profile"
              className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 w-full rounded-2xl bg-white/5 data-[state=active]:bg-primary data-[state=active]:text-black border border-white/5 hover:bg-white/10 transition-all text-[10px] uppercase font-black col-span-2"
            >
              <User className="w-5 h-5" />
              HQ Profile
            </TabsTrigger>
          </TabsList>

          <div className="w-full">
            <TabsContent
              value="control"
              className="mt-0 outline-none animate-in fade-in zoom-in-95 duration-300"
            >
              <MatchControlCenter />
            </TabsContent>

            <TabsContent
              value="tourney"
              className="mt-0 outline-none animate-in fade-in zoom-in-95 duration-300"
            >
              <MatchManager />
            </TabsContent>

            <TabsContent
              value="users"
              className="mt-0 outline-none animate-in fade-in zoom-in-95 duration-300"
            >
              <UserManager />
            </TabsContent>

            <TabsContent
              value="results"
              className="mt-0 outline-none flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300"
            >
              <BulkResultSheet />
              <BracketManager />
            </TabsContent>

            <TabsContent
              value="tickets"
              className="mt-0 outline-none animate-in fade-in zoom-in-95 duration-300"
            >
              <TicketManager />
            </TabsContent>

            <TabsContent
              value="logs"
              className="mt-0 outline-none animate-in fade-in zoom-in-95 duration-300"
            >
              <AdminActivityLog />
            </TabsContent>

            <TabsContent
              value="profile"
              className="mt-0 outline-none animate-in fade-in zoom-in-95 duration-300"
            >
              <AdminCommandSector />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function AdminCommandSector() {
  const { profile } = useAuth();
  const roles: Record<string, "owner" | "moderator" | "treasurer"> = {
    "xksamirul@gmail.com": "owner",
    "mahi2007raj@gmail.com": "owner",
  };
  const displayRoles: Record<string, string> = {
    "xksamirul@gmail.com": "PRIMARY ADMIN",
    "mahi2007raj@gmail.com": "SECONDARY ADMIN",
  };
  const role = roles[profile?.email || ""] || "user";
  const displayRole = displayRoles[profile?.email || ""] || role.toUpperCase();

  return (
    <Card className="glass border-subtle overflow-hidden">
      <CardHeader className="bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50 shadow-[0_0_20px_rgba(240,185,11,0.2)]">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black uppercase tracking-tighter italic">
              HQ Command: {profile?.displayName || "Elite Operative"}
            </CardTitle>
            <CardDescription className="text-slate-400 font-bold text-xs uppercase tracking-widest">
              {profile?.email} • Clearance {displayRole}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs
          defaultValue={role === "treasurer" ? "approval" : "god"}
          className="flex flex-col gap-[20px] w-full"
        >
          <TabsList className="grid grid-cols-2 gap-2 px-6 pt-6 bg-transparent w-full h-auto">
            {role === "owner" && (
              <TabsTrigger
                value="god"
                className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 w-full rounded-2xl bg-white/5 data-[state=active]:bg-primary data-[state=active]:text-black border border-white/5 transition-all text-[10px] uppercase font-black hover:bg-white/10"
              >
                <LockKeyhole className="w-5 h-5" /> God Mode
              </TabsTrigger>
            )}
            {(role === "owner" || role === "treasurer") && (
              <>
                <TabsTrigger
                  value="approval"
                  className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 w-full rounded-2xl bg-white/5 data-[state=active]:bg-primary data-[state=active]:text-black border border-white/5 transition-all text-[10px] uppercase font-black hover:bg-white/10"
                >
                  <Check className="w-5 h-5" /> Deposits
                </TabsTrigger>
                <TabsTrigger
                  value="withdrawals"
                  className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 w-full rounded-2xl bg-white/5 data-[state=active]:bg-primary data-[state=active]:text-black border border-white/5 transition-all text-[10px] uppercase font-black hover:bg-white/10"
                >
                  <History className="w-5 h-5" /> Withdrawals
                </TabsTrigger>
              </>
            )}
            <TabsTrigger
              value="announcement"
              className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 w-full rounded-2xl bg-white/5 data-[state=active]:bg-primary data-[state=active]:text-black border border-white/5 transition-all text-[10px] uppercase font-black hover:bg-white/10"
            >
              <Megaphone className="w-5 h-5" /> Broadcast
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="god" className="mt-0">
              <GodViewDashboard />
            </TabsContent>
            <TabsContent value="approval" className="mt-0">
              <TransactionSniper />
            </TabsContent>
            <TabsContent value="withdrawals" className="mt-0">
              <WithdrawalSniper />
            </TabsContent>
            <TabsContent value="announcement" className="mt-0">
              <AnnouncementBlast />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function GodViewDashboard() {
  const [matches, setMatches] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalBalance: 0 });
  const [settings, setSettings] = useState<any>(null);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [bkashNumber, setBkashNumber] = useState("");
  const [nagadNumber, setNagadNumber] = useState("");
  const [messengerId, setMessengerId] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [deposits, setDeposits] = useState<any[]>([]);

  useEffect(() => {
    // Basic match query
    const q = query(
      collection(db, "matches"),
      orderBy("startTime", "asc"),
      limit(50),
    );
    const unsubMatches = onSnapshot(
      q,
      (snap) => {
        setMatches(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => handleFirestoreError(err, "list", "matches"),
    );

    // Global stats (limited for performance)
    const qUsers = query(collection(db, "users"), limit(500));
    const unsubUsers = onSnapshot(qUsers, (snap) => {
      const users = snap.docs.map((d) => d.data());
      setStats({
        totalUsers: snap.size,
        totalBalance: users.reduce((acc, u) => acc + (u.balance || 0), 0),
      });
    });

    // Payments for chart
    const qPayments = query(
      collection(db, "payments"),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc"),
      limit(500)
    );
    const unsubPayments = onSnapshot(qPayments, (snap) => {
      setDeposits(snap.docs.map((d) => d.data()));
    });

    // System Settings
    const unsubSettings = onSnapshot(
      doc(db, "system", "settings"),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setSettings(data);
          if (data.whatsappNumber) setWhatsappNumber(data.whatsappNumber);
          if (data.bkashNumber) setBkashNumber(data.bkashNumber);
          if (data.nagadNumber) setNagadNumber(data.nagadNumber);
          if (data.messengerId) setMessengerId(data.messengerId);
          if (data.telegramUsername) setTelegramUsername(data.telegramUsername);
        } else {
          setSettings({ maintenanceMode: false });
        }
      },
      (err) => handleFirestoreError(err, "get", "system/settings"),
    );

    return () => {
      unsubMatches();
      unsubUsers();
      unsubPayments();
      unsubSettings();
    };
  }, []);

  const chartData = useMemo(() => {
    // Group deposits by day for the last 30 days
    const daily: Record<string, number> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = format(d, "MMM dd");
      daily[dateStr] = 0;
    }

    deposits.forEach((d) => {
      if (d.createdAt && d.createdAt.toDate) {
        const dDate = d.createdAt.toDate();
        const diffTime = Math.abs(now.getTime() - dDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if (diffDays <= 30) {
          const dateStr = format(dDate, "MMM dd");
          if (daily[dateStr] !== undefined) {
            daily[dateStr] += Number(d.amount || 0);
          }
        }
      }
    });

    return Object.keys(daily).map(key => ({
      date: key,
      amount: daily[key]
    }));
  }, [deposits]);

  const handleMaintenance = async () => {
    const isMaintenance = settings?.maintenanceMode;
    if (
      !confirm(
        isMaintenance
          ? "Disable Maintenance Mode and open the app to public?"
          : "Enable Maintenance Mode? App will be locked for all players.",
      )
    )
      return;
    try {
      await setDoc(
        doc(db, "system", "settings"),
        { maintenanceMode: !isMaintenance },
        { merge: true },
      );
      toast.success(
        isMaintenance ? "App is now LIVE." : "App frozen for Maintenance.",
      );
    } catch (err: any) {
      toast.error("Failed to update settings.");
    }
  };

  const handleRefund = async () => {
    if (
      !confirm(
        "Refund to Wallet? (Mock action for specific matches). Go to Match Control to cancel matches.",
      )
    )
      return;
    toast.info(
      "Navigate to Match Control to cancel matches and auto-refund players.",
    );
  };

  const updateSettingsKey = async (key: string, value: string, label: string) => {
    try {
      await setDoc(
        doc(db, "system", "settings"),
        { [key]: value },
        { merge: true },
      );
      toast.success(`${label} Updated.`);
    } catch (err) {
      toast.error(`Failed to update ${label}.`);
    }
  };

  const updateWhatsapp = async () => {
    await updateSettingsKey("whatsappNumber", whatsappNumber, "Support Number");
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4">
        <Card className="glass border-emerald-500/20 bg-emerald-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase text-slate-500">
              System Liquidity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-400 font-mono tracking-tighter">
              ৳{stats.totalBalance.toLocaleString()}
            </div>
            <p className="text-[8px] text-slate-500 uppercase font-bold mt-1">
              Total combined user reserves
            </p>
          </CardContent>
        </Card>
        <Card className="glass border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase text-slate-500">
              Active Operatives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-primary font-mono tracking-tighter">
              {stats.totalUsers}
            </div>
            <p className="text-[8px] text-slate-500 uppercase font-bold mt-1">
              Personnel detected in sector
            </p>
          </CardContent>
        </Card>
        <Card
          className={`glass border-subtle transition-colors cursor-pointer ${settings?.maintenanceMode ? "bg-red-500/10 border-red-500/30" : "hover:bg-white/5"}`}
          onClick={handleMaintenance}
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] font-black uppercase text-slate-500 italic">
              Core Status
            </CardTitle>
            <Power
              className={`w-4 h-4 ${settings?.maintenanceMode ? "text-red-500" : "text-emerald-400"}`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-sm font-black uppercase tracking-widest ${settings?.maintenanceMode ? "text-red-500" : "text-emerald-400"}`}
            >
              {settings?.maintenanceMode ? "MAINTENANCE" : "ONLINE"}
            </div>
            <p className="text-[8px] text-slate-500 uppercase font-bold mt-1">
              Click to toggle
            </p>
          </CardContent>
        </Card>
        <Card className="glass border-subtle">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase text-slate-500 italic">
              System & Payment Config
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider block">WhatsApp Support</span>
              <div className="flex gap-2">
                <Input
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+880..."
                  className="h-8 text-[10px] font-black bg-black/40 border-white/10 flex-1"
                />
                <Button
                  onClick={updateWhatsapp}
                  size="sm"
                  className="h-8 text-[9px] font-black uppercase px-3"
                >
                  Save
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[8px] font-semibold text-[#0084FF] uppercase tracking-wider block">Facebook Messenger ID</span>
              <div className="flex gap-2">
                <Input
                  value={messengerId}
                  onChange={(e) => setMessengerId(e.target.value)}
                  placeholder="Page ID or Username (e.g. fireblade.gaming)"
                  className="h-8 text-[10px] font-black bg-black/40 border-white/10 flex-1"
                />
                <Button
                  onClick={() => updateSettingsKey("messengerId", messengerId, "Messenger ID")}
                  size="sm"
                  className="h-8 text-[9px] font-black uppercase px-3"
                >
                  Save
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[8px] font-semibold text-[#0088cc] uppercase tracking-wider block">Telegram Support Username</span>
              <div className="flex gap-2">
                <Input
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value)}
                  placeholder="Username without @ (e.g. fireblade_support)"
                  className="h-8 text-[10px] font-black bg-black/40 border-white/10 flex-1"
                />
                <Button
                  onClick={() => updateSettingsKey("telegramUsername", telegramUsername, "Telegram Support")}
                  size="sm"
                  className="h-8 text-[9px] font-black uppercase px-3"
                >
                  Save
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[8px] font-semibold text-[#E2136E] uppercase tracking-wider block">bKash Personal</span>
              <div className="flex gap-2">
                <Input
                  value={bkashNumber}
                  onChange={(e) => setBkashNumber(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="h-8 text-[10px] font-black bg-black/40 border-white/10 flex-1"
                />
                <Button
                  onClick={() => updateSettingsKey("bkashNumber", bkashNumber, "bKash Number")}
                  size="sm"
                  className="h-8 text-[9px] font-black uppercase px-3"
                >
                  Save
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[8px] font-semibold text-[#F7941D] uppercase tracking-wider block">Nagad Personal</span>
              <div className="flex gap-2">
                <Input
                  value={nagadNumber}
                  onChange={(e) => setNagadNumber(e.target.value)}
                  placeholder="019XXXXXXXX"
                  className="h-8 text-[10px] font-black bg-black/40 border-white/10 flex-1"
                />
                <Button
                  onClick={() => updateSettingsKey("nagadNumber", nagadNumber, "Nagad Number")}
                  size="sm"
                  className="h-8 text-[9px] font-black uppercase px-3"
                >
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-subtle overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] italic text-slate-500">
            Financial Intelligence (30-Day Deposits)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#666" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#888' }}
                />
                <YAxis 
                  stroke="#666" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `৳${value}`}
                  tick={{ fill: '#888' }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                  itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                />
                <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} name="Deposits" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] italic text-slate-500">
            Mission Surveillance
          </h3>
          <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black uppercase">
            Live Updates
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {matches.slice(0, 5).map((m) => (
            <Card
              key={m.id}
              className="glass border-subtle overflow-hidden relative group hover:border-primary/50 transition-all"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
              <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-[#ff4d00] italic">
                    Operation {m.id.substring(0, 4)}
                  </CardTitle>
                  <CardDescription className="text-xs font-bold text-white truncate max-w-[120px]">
                    {m.title}
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[8px] font-black uppercase tracking-tighter ${
                    m.status === "upcoming"
                      ? "border-emerald-500/30 text-emerald-400"
                      : m.status === "live"
                        ? "border-red-500/30 text-red-500 animate-pulse"
                        : "border-slate-500/30 text-slate-500"
                  }`}
                >
                  {m.status}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">
                    Reserves Filled
                  </span>
                  <span className="text-xs font-black">
                    {m.joinedCount || 0}/{m.slots}
                  </span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${((m.joinedCount || 0) / m.slots) * 100}%`,
                    }}
                  />
                </div>
                <div className="mt-3 flex items-center gap-2 text-slate-600">
                  <Clock className="w-3 h-3" />
                  <span className="text-[9px] font-bold uppercase">
                    {safeFormat(m.startTime, "HH:mm")} Deployment
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnnouncementBlast() {
  const [msg, setMsg] = useState("");
  const [isBlasting, setIsBlasting] = useState(false);

  const triggerBlast = async () => {
    if (!msg.trim()) return;
    setIsBlasting(true);
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const batchRequests = usersSnap.docs.map(async (userDoc) => {
        const notifRef = collection(db, "users", userDoc.id, "notifications");
        await addDoc(notifRef, {
          title: "COMMAND ANNOUNCEMENT (ঘোষণা)",
          message: msg,
          type: "announcement",
          read: false,
          createdAt: serverTimestamp(),
        });
      });
      await Promise.all(batchRequests);
      toast.success("Broadcast successful. All sector operatives notified.");
      setMsg("");
    } catch (err) {
      toast.error("Broadcast failed. System interference detected.");
    } finally {
      setIsBlasting(false);
    }
  };

  return (
    <Card className="glass border-subtle relative overflow-hidden bg-primary/5">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Megaphone className="w-32 h-32 rotate-12" />
      </div>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 italic uppercase">
          <Megaphone className="w-5 h-5 text-primary" /> Announcement Blast
          (ব্রডকাস্ট)
        </CardTitle>
        <CardDescription className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
          Transmit critical intel to every active operative in the FireZone
          sector.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Type your tactical broadcast message here... (e.g. SPECIAL MATCH AT 9 PM!)"
          className="h-14 bg-black/60 border-white/5 focus:border-primary rounded-xl text-sm"
        />
        <Button
          onClick={triggerBlast}
          disabled={isBlasting || !msg}
          className="w-full h-12 rounded-xl accent-bg text-black font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20"
        >
          {isBlasting
            ? "TRANSMITTING TO ALL..."
            : "INITIATE BROADCAST (ব্রডকাস্ট করুন)"}
        </Button>
      </CardContent>
    </Card>
  );
}

function TicketManager() {
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "tickets"),
      orderBy("createdAt", "desc"),
      limit(50),
    );
    return onSnapshot(
      q,
      (snap) => {
        setTickets(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => handleFirestoreError(err, "list", "tickets"),
    );
  }, []);

  const closeTicket = async (id: string) => {
    try {
      await updateDoc(doc(db, "tickets", id), { status: "closed" });
      toast.success("Incident containment successful.");
    } catch (err: any) {
      toast.error("Failed to close ticket.");
    }
  };

  return (
    <Card className="glass border-subtle">
      <div className="overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5">
              <TableHead>User ID</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((t) => (
              <TableRow key={t.id} className="border-white/5">
                <TableCell className="text-[10px] font-mono text-slate-500 uppercase">
                  {t.userId.substring(0, 8)}
                </TableCell>
                <TableCell>
                  <div className="font-bold text-xs">{t.subject}</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {t.message}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={t.status === "open" ? "destructive" : "secondary"}
                    className="uppercase text-[8px] font-black tracking-widest"
                  >
                    {t.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {t.status === "open" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => closeTicket(t.id)}
                      className="text-[10px] font-black uppercase h-8 border-emerald-500/30 text-emerald-400"
                    >
                      Close Case
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

function HighlightsManager() {
  const [highlights, setHighlights] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "highlights"),
      orderBy("createdAt", "desc"),
      limit(20),
    );
    return onSnapshot(
      q,
      (snap) => {
        setHighlights(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => handleFirestoreError(err, "list", "highlights"),
    );
  }, []);

  const deleteHighlight = async (id: string) => {
    if (!confirm("Remove this battle report?")) return;
    try {
      await deleteDoc(doc(db, "highlights", id));
      toast.success("Clip incinerated.");
    } catch (err: any) {
      toast.error("Failed to delete clip.");
    }
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {highlights.map((h) => (
        <Card key={h.id} className="glass border-subtle overflow-hidden">
          <div className="aspect-video bg-black/60 relative">
            <img
              src={`https://picsum.photos/seed/${h.title}/400/225`}
              className="w-full h-full object-cover opacity-50"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 text-destructive bg-black/40 hover:bg-destructive/20 border border-white/5"
              onClick={() => deleteHighlight(h.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-black uppercase">
              {h.title}
            </CardTitle>
            <CardDescription className="text-[10px] font-bold text-slate-500 uppercase">
              Uploaded by {h.userName}
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

function MatchControlCenter() {
  const { profile } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [regs, setRegs] = useState<any[]>([]);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [editRoomDetails, setEditRoomDetails] = useState({ roomId: "", roomPassword: "" });

  const saveRoomDetails = async () => {
    if (!selectedMatch) return;
    try {
      await updateDoc(doc(db, "matches", selectedMatch), {
        roomId: editRoomDetails.roomId,
        roomPassword: editRoomDetails.roomPassword
      });
      const matchData = matches.find((m) => m.id === selectedMatch);
      if (matchData) {
        await notifyRoomCredentialsUpdate(selectedMatch, matchData.title, editRoomDetails.roomId, editRoomDetails.roomPassword);
      }
      setIsEditingRoom(false);
      toast.success("Room credentials updated and protocol transmitted.");
    } catch (err: any) {
      toast.error(err.message || "Failed to update room details.");
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, "matches"),
      where("status", "==", "upcoming"),
      orderBy("startTime", "asc"),
      limit(20),
    );
    return onSnapshot(
      q,
      (snap) => {
        setMatches(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => handleFirestoreError(err, "list", "matches"),
    );
  }, []);

  useEffect(() => {
    if (!selectedMatch) return;
    const q = query(
      collection(db, "matches", selectedMatch, "registrations"),
      orderBy("slotNumber", "asc"),
    );
    return onSnapshot(
      q,
      (snap) => {
        setRegs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => handleFirestoreError(err, "list", "registrations"),
    );
  }, [selectedMatch]);

  const activeMatch = matches.find((m) => m.id === selectedMatch);

  const broadcastCredentials = async () => {
    if (!activeMatch || !activeMatch.roomId)
      return toast.error("Room ID not deployed yet.");
    setIsBroadcasting(true);
    try {
      const batchRequests = regs.map(async (r) => {
        const notifRef = collection(db, "users", r.userId, "notifications");
        await addDoc(notifRef, {
          title: "BATTLE INTEL: ROOM ID/PASS",
          message: `Intel for ${activeMatch.title}: ID: ${activeMatch.roomId}, Pass: ${activeMatch.roomPassword}. Deploy immediately!`,
          type: "match",
          read: false,
          createdAt: serverTimestamp(),
          roomId: activeMatch.roomId,
          roomPassword: activeMatch.roomPassword,
        });
      });
      await Promise.all(batchRequests);
      await logAdminAction(
        profile?.email || "",
        "Broadcast Credentials",
        `Room ID/Pass sent to ${regs.length} players for match ${activeMatch.title}`,
      );
      toast.success(
        "Push broadcast successful. All verified operatives notified.",
      );
    } catch (err) {
      toast.error("Broadcast transmission failed.");
    } finally {
      setIsBroadcasting(false);
    }
  };

  const movePlayer = async (regId: string, currentSlot: number) => {
    const limits = activeMatch?.slots || 48;
    const newSlot = prompt(`Target Slot Number (1-${limits}):`, String(currentSlot));
    if (!newSlot || isNaN(Number(newSlot))) return;
    try {
      await updateDoc(
        doc(db, "matches", selectedMatch!, "registrations", regId),
        { slotNumber: Number(newSlot) },
      );
      toast.success("Operative relocated to new slot.");
    } catch (err) {
      toast.error("Relocation failed.");
    }
  };

  const recalculatePrize = async () => {
    if (!activeMatch) return;
    const currentPool = activeMatch.totalPrize;
    const joined = activeMatch.joinedCount;
    const slots = activeMatch.slots;
    const factor = joined / slots;
    const newPrize = Math.floor(currentPool * factor);

    if (
      !confirm(
        `Joined players (${joined}) are less than total slots (${slots}). Recalculate prize from ৳${currentPool} to ৳${newPrize}?`,
      )
    )
      return;

    try {
      await updateDoc(doc(db, "matches", activeMatch.id), {
        totalPrize: newPrize,
      });
      await logAdminAction(
        profile?.email || "",
        "Recalculate Prize",
        `Lowered prize of ${activeMatch.title} to ৳${newPrize} due to low turnout (${joined}/${slots})`,
      );
      toast.success("Prize pool recalibrated to current deployment size.");
    } catch (err) {
      toast.error("Recalculation failed.");
    }
  };

  const deleteActiveMatch = async () => {
    if (!activeMatch) return;
    if (
      !confirm(
        "WARNING: Are you sure you want to permanently delete this match? This action cannot be reversed!",
      )
    )
      return;
    try {
      await deleteDoc(doc(db, "matches", activeMatch.id));
      await logAdminAction(
        profile?.email || "",
        "Delete Match",
        `Deleted match: ${activeMatch.title}`,
      );
      setSelectedMatch(null);
      toast.success("Match has been permanently deleted.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete match");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-panel">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2 italic uppercase">
              <LockKeyhole className="w-5 h-5 text-primary" /> Strategic Control
              Center
            </CardTitle>
            <CardDescription className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Select an active operation to manage room deployment and slot
              mapping.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedMatch}>
            <SelectTrigger className="bg-black/40 border-slate-800 h-12 rounded-xl">
              <SelectValue placeholder="Select Deployment Sector..." />
            </SelectTrigger>
            <SelectContent>
              {matches.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.title} ({safeFormat(m.startTime, "HH:mm")})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedMatch && activeMatch && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="glass border-subtle">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs uppercase font-black tracking-widest text-slate-400">
                  Broadcast Protocol
                </CardTitle>
                {!isEditingRoom && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-[10px] uppercase font-bold"
                    onClick={() => {
                      setEditRoomDetails({
                        roomId: activeMatch.roomId || "",
                        roomPassword: activeMatch.roomPassword || ""
                      });
                      setIsEditingRoom(true);
                    }}
                  >
                    Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditingRoom ? (
                  <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-500 uppercase">Room ID</Label>
                      <Input 
                        value={editRoomDetails.roomId}
                        onChange={(e) => setEditRoomDetails({...editRoomDetails, roomId: e.target.value})}
                        className="h-8 text-xs bg-black/50 border-white/10 text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-500 uppercase">Password</Label>
                      <Input 
                        value={editRoomDetails.roomPassword}
                        onChange={(e) => setEditRoomDetails({...editRoomDetails, roomPassword: e.target.value})}
                        className="h-8 text-xs bg-black/50 border-white/10 text-white"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={() => setIsEditingRoom(false)} 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-[10px] uppercase font-bold h-8"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={saveRoomDetails} 
                        size="sm" 
                        className="flex-1 text-[10px] uppercase font-bold text-black accent-bg hover:bg-[#ff4d00]/90 h-8"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
                      <span>Room ID</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-mono text-xs">
                          {activeMatch.roomId || "NOT SET"}
                        </span>
                        {activeMatch.roomId && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-slate-400 hover:text-white"
                            onClick={() => {
                              navigator.clipboard.writeText(activeMatch.roomId);
                              toast.success("Room ID copied");
                            }}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
                      <span>Password</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-mono text-xs">
                          {activeMatch.roomPassword || "NOT SET"}
                        </span>
                        {activeMatch.roomPassword && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-slate-400 hover:text-white"
                            onClick={() => {
                              navigator.clipboard.writeText(activeMatch.roomPassword);
                              toast.success("Password copied");
                            }}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <Button
                  onClick={broadcastCredentials}
                  disabled={isBroadcasting || isEditingRoom || !activeMatch.roomId}
                  className="w-full h-12 rounded-xl accent-bg text-black font-black uppercase tracking-widest text-[10px]"
                >
                  {isBroadcasting
                    ? "Transmitting..."
                    : "Send ID/Pass Broadcast"}
                </Button>
              </CardContent>
            </Card>

            <Card className="glass border-subtle">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase font-black tracking-widest text-slate-400">
                  Tactical Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Turnout Ratio
                  </span>
                  <span className="text-sm font-black italic">
                    {activeMatch.joinedCount}/{activeMatch.slots}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Time to Start
                  </span>
                  <span className="text-sm font-black text-amber-500">
                    {(() => {
                      const start = new Date(activeMatch.startTime).getTime();
                      const now = new Date().getTime();
                      const diff = start - now;
                      if (diff <= 0)
                        return (
                          <span className="text-red-500 animate-pulse text-xs tracking-widest">
                            AWAITING START
                          </span>
                        );
                      const m = Math.floor(diff / 60000);
                      return `${m} min(s)`;
                    })()}
                  </span>
                </div>
                {activeMatch.joinedCount < activeMatch.slots && (
                  <Button
                    variant="outline"
                    onClick={recalculatePrize}
                    className="w-full h-10 rounded-xl border-amber-500/30 text-amber-500 hover:bg-amber-500/10 text-[9px] font-bold uppercase tracking-widest"
                  >
                    Recalculate Prize Pool
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={deleteActiveMatch}
                  className="w-full h-10 mt-2 rounded-xl border-red-500/30 text-red-500 hover:bg-red-500/10 text-[9px] font-bold uppercase tracking-widest"
                >
                  Delete Match
                </Button>
              </CardContent>
            </Card>

            <Card className="glass border-subtle overflow-hidden">
              <CardHeader className="bg-white/5 border-b border-white/5 flex flex-row items-center justify-between">
                <CardTitle className="text-[11px] uppercase font-black tracking-widest text-slate-400">
                  Live Slot Mapping (স্লট ম্যাপ)
                </CardTitle>
                <Badge className="bg-primary text-black font-black">
                  {regs.length} Active
                </Badge>
              </CardHeader>
              <CardContent className="p-6">
                {(() => {
                  const mType = (activeMatch.type || "Solo").trim().toLowerCase();
                  
                  if (mType === "duo") {
                    const totalTeams = Math.ceil(activeMatch.slots / 2);
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: totalTeams }).map((_, teamIdx) => {
                          const slotNum1 = teamIdx * 2 + 1;
                          const slotNum2 = teamIdx * 2 + 2;
                          return (
                            <div key={teamIdx} className="glass p-3 rounded-2xl border border-white/5 space-y-2 bg-white/[0.02]">
                              <div className="flex justify-between items-center text-[9px] uppercase font-black text-slate-400 tracking-wider">
                                <span>Team {teamIdx + 1}</span>
                                <span className="text-[8px] text-slate-500 font-mono">#{slotNum1}-{Math.min(slotNum2, activeMatch.slots)}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {[slotNum1, slotNum2].map((slotNum) => {
                                  if (slotNum > activeMatch.slots) return null;
                                  const r = regs.find((reg) => reg.slotNumber === slotNum);
                                  return (
                                    <div
                                      key={slotNum}
                                      onClick={() => r && movePlayer(r.id, r.slotNumber)}
                                      className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all min-h-[50px] ${
                                        r
                                          ? "bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(240,185,11,0.1)]"
                                          : "bg-white/5 border-white/5 opacity-40 hover:opacity-100"
                                      }`}
                                    >
                                      <span className={`text-[8px] font-black ${r ? "text-primary" : "text-slate-600"}`}>
                                        Slot {slotNum}
                                      </span>
                                      {r ? (
                                        <span className="text-[7.5px] font-bold text-white truncate w-full px-1 text-center font-mono">
                                          {r.gameName}
                                        </span>
                                      ) : (
                                        <span className="text-[6px] font-black text-slate-600 uppercase tracking-widest">
                                          EMPTY
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }

                  if (mType === "squad") {
                    const totalTeams = Math.ceil(activeMatch.slots / 4);
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {Array.from({ length: totalTeams }).map((_, teamIdx) => {
                          const slotNum1 = teamIdx * 4 + 1;
                          const slotNum2 = teamIdx * 4 + 2;
                          const slotNum3 = teamIdx * 4 + 3;
                          const slotNum4 = teamIdx * 4 + 4;
                          return (
                            <div key={teamIdx} className="glass p-4 rounded-2xl border border-white/5 space-y-2 bg-white/[0.02]">
                              <div className="flex justify-between items-center text-[10px] uppercase font-black text-slate-400 tracking-wider">
                                <span>Team {teamIdx + 1}</span>
                                <span className="text-[8px] text-slate-500 font-mono">#{slotNum1}-{Math.min(slotNum4, activeMatch.slots)}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {[slotNum1, slotNum2, slotNum3, slotNum4].map((slotNum) => {
                                  if (slotNum > activeMatch.slots) return null;
                                  const r = regs.find((reg) => reg.slotNumber === slotNum);
                                  return (
                                    <div
                                      key={slotNum}
                                      onClick={() => r && movePlayer(r.id, r.slotNumber)}
                                      className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all min-h-[50px] ${
                                        r
                                          ? "bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(240,185,11,0.1)]"
                                          : "bg-white/5 border-white/5 opacity-40 hover:opacity-100"
                                      }`}
                                    >
                                      <span className={`text-[8px] font-black ${r ? "text-primary" : "text-slate-600"}`}>
                                        Slot {slotNum}
                                      </span>
                                      {r ? (
                                        <span className="text-[7.5px] font-bold text-white truncate w-full px-1 text-center font-mono">
                                          {r.gameName}
                                        </span>
                                      ) : (
                                        <span className="text-[6px] font-black text-slate-600 uppercase tracking-widest">
                                          EMPTY
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }

                  // Default / Solo: Individual Slots
                  return (
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                      {Array.from({ length: activeMatch.slots }).map((_, i) => {
                        const slotNum = i + 1;
                        const r = regs.find((reg) => reg.slotNumber === slotNum);
                        return (
                          <div
                            key={slotNum}
                            onClick={() => r && movePlayer(r.id, r.slotNumber)}
                            className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                              r
                                ? "bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(240,185,11,0.1)]"
                                : "bg-white/5 border-white/5 opacity-40 hover:opacity-100"
                            }`}
                          >
                            <span
                              className={`text-[8px] font-black ${r ? "text-primary" : "text-slate-600"}`}
                            >
                              {slotNum}
                            </span>
                            {r && (
                              <span className="text-[7px] font-bold text-white truncate w-full px-1 text-center font-mono">
                                {r.gameName}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}

function MatchManager() {
  const [matches, setMatches] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreds, setShowCreds] = useState<Record<string, boolean>>({});

  const toggleCreds = (id: string) => setShowCreds(prev => ({...prev, [id]: !prev[id]}));

  const [form, setForm] = useState({
    title: "",
    map: "Bermuda",
    type: "Solo",
    entryFee: "30",
    totalPrize: "1000",
    startTime: "",
    slots: "48",
    roomId: "",
    roomPassword: "",
    minLevel: "1",
  });

  useEffect(() => {
    const q = query(collection(db, "matches"), orderBy("startTime", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        setMatches(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => handleFirestoreError(err, "list", "matches"),
    );
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      map: "Bermuda",
      type: "Solo",
      entryFee: "30",
      totalPrize: "1000",
      startTime: "",
      slots: "48",
      roomId: "",
      roomPassword: "",
      minLevel: "1",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const matchData = {
        ...form,
        entryFee: Number(form.entryFee),
        totalPrize: Number(form.totalPrize),
        slots: Number(form.slots),
        minLevel: Number(form.minLevel),
        updatedAt: serverTimestamp(),
      };
      if (editingId) {
        const oldMatch = matches.find((m) => m.id === editingId);
        await updateDoc(doc(db, "matches", editingId), matchData);
        if (oldMatch && (oldMatch.roomId !== matchData.roomId || oldMatch.roomPassword !== matchData.roomPassword)) {
          await notifyRoomCredentialsUpdate(editingId, matchData.title, matchData.roomId, matchData.roomPassword);
        }
        toast.success("Tournament protocol updated!");
      } else {
        await addDoc(collection(db, "matches"), {
          ...matchData,
          status: "upcoming",
          joinedCount: 0,
          createdAt: serverTimestamp(),
        });
        toast.success("Tournament deployed!");
      }
      resetForm();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const updateMatchStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "matches", id), { status });
      toast.success(`Match marked as ${status}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const deleteMatch = async (id: string) => {
    if (!confirm("Delete this match?")) return;
    try {
      await deleteDoc(doc(db, "matches", id));
      toast.success("Match deleted");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Card className="glass border-subtle">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId ? "Modify Strategy" : "Deploy New Match"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Tournament Name</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Game Mode</Label>
                <Select
                  value={form.type}
                  onValueChange={(val) => setForm({ ...form, type: val })}
                >
                  <SelectTrigger className="w-full border-white/10 bg-black/40">
                    <SelectValue placeholder="Game Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solo">Solo</SelectItem>
                    <SelectItem value="Duo">Duo</SelectItem>
                    <SelectItem value="Squad">Squad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Map</Label>
                  <Input
                    value={form.map}
                    onChange={(e) => setForm({ ...form, map: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slots</Label>
                  <Input
                    type="number"
                    value={form.slots}
                    onChange={(e) =>
                      setForm({ ...form, slots: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Entry Fee</Label>
                  <Input
                    type="number"
                    value={form.entryFee}
                    onChange={(e) =>
                      setForm({ ...form, entryFee: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prize Pool</Label>
                  <Input
                    type="number"
                    value={form.totalPrize}
                    onChange={(e) =>
                      setForm({ ...form, totalPrize: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="datetime-local"
                    value={form.startTime}
                    onChange={(e) =>
                      setForm({ ...form, startTime: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-amber-500 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Min Lvl
                  </Label>
                  <Input
                    type="number"
                    value={form.minLevel}
                    onChange={(e) =>
                      setForm({ ...form, minLevel: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Room ID</Label>
                  <Input
                    placeholder="Auto-generated if blank"
                    value={form.roomId}
                    onChange={(e) => setForm({ ...form, roomId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Room Password</Label>
                  <Input
                    placeholder="Enter password"
                    value={form.roomPassword}
                    onChange={(e) => setForm({ ...form, roomPassword: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  className="flex-1 accent-bg text-black font-black uppercase tracking-widest text-[10px]"
                >
                  {editingId ? "Update Intel" : "Deploy Operation"}
                </Button>
                {editingId && (
                  <Button type="button" variant="ghost" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 pl-2 border-l-2 border-primary/50">
          Active Tournaments
        </h3>
        {matches.map((m) => (
          <div
            key={m.id}
            className="glass p-4 rounded-xl border border-white/5 space-y-3 relative overflow-hidden"
          >
            {m.status === "live" && (
              <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/20 blur-xl rounded-full" />
            )}
            <div className="flex justify-between items-start">
              <div>
                <div className="font-black text-sm uppercase italic">
                  {m.title}
                </div>
                <div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                  {m.map} • {safeFormat(m.startTime, "MMM d, h:mm a")}
                </div>
              </div>
              <Badge
                variant={
                  m.status === "live"
                    ? "destructive"
                    : (m.status === "completed" || m.status === "prize distributed")
                      ? "secondary"
                      : "outline"
                }
                className="text-[8px] font-black uppercase tracking-widest whitespace-nowrap"
              >
                {m.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-bold tracking-widest text-slate-500">
              <div className="bg-white/5 p-2 rounded text-center">
                <span className="block text-[8px] text-slate-600 mb-1">
                  Capacity
                </span>
                <span className="text-white italic">
                  {m.joinedCount || 0} / {m.slots}
                </span>
              </div>
              <div className="bg-white/5 p-2 rounded text-center">
                <span className="block text-[8px] text-slate-600 mb-1">
                  Min Level
                </span>
                <span className="text-amber-400">{m.minLevel || 1}</span>
              </div>
              {m.roomId && m.roomPassword && (
                <div className="col-span-2 bg-white/5 p-2 rounded text-center flex justify-around relative">
                  <div>
                    <span className="block text-[8px] text-slate-600 mb-1">Room ID</span>
                    <span className="text-white normal-case leading-tight">{showCreds[m.id] ? m.roomId : '••••••'}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-600 mb-1">Password</span>
                    <span className="text-white normal-case leading-tight">{showCreds[m.id] ? m.roomPassword : '••••••'}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCreds(m.id);
                    }}
                  >
                    {showCreds[m.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-[9px] font-black uppercase tracking-widest hover:text-primary"
                onClick={() => {
                  setEditingId(m.id);
                  setForm({
                    title: m.title,
                    map: m.map,
                    type: m.type,
                    entryFee: String(m.entryFee),
                    totalPrize: String(m.totalPrize),
                    startTime: m.startTime,
                    slots: String(m.slots),
                    roomId: m.roomId || "",
                    roomPassword: m.roomPassword || "",
                    minLevel: String(m.minLevel || 1),
                  });
                }}
              >
                <Edit3 className="w-3 h-3 mr-1" /> Edit
              </Button>

              <Select
                value={m.status}
                onValueChange={(val) => updateMatchStatus(m.id, val)}
              >
                <SelectTrigger className="flex-1 h-8 text-[9px] font-black uppercase tracking-widest border-white/10 bg-black/40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">UPCOMING</SelectItem>
                  <SelectItem value="live">LIVE</SelectItem>
                  <SelectItem value="completed">COMPLETED</SelectItem>
                  <SelectItem value="prize distributed">PRIZE DISTRIBUTED</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                onClick={() => deleteMatch(m.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper to log admin actions
async function logAdminAction(
  adminEmail: string,
  action: string,
  details: string,
) {
  try {
    await addDoc(collection(db, "admin_logs"), {
      adminEmail,
      action,
      details,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Failed to log admin action:", err);
  }
}

function TransactionSniper() {
  const { profile } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [searchTrx, setSearchTrx] = useState("");
  const [selectedMatchFilter, setSelectedMatchFilter] = useState("all");
  const [matches, setMatches] = useState<any[]>([]);
  const [duplicates, setDuplicates] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Current and upcoming matches for filtering
    const qMatches = query(
      collection(db, "matches"),
      where("status", "==", "upcoming"),
      orderBy("startTime", "asc"),
    );
    const unsubMatches = onSnapshot(qMatches, (snap) => {
      setMatches(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    // Recent payments to check for TrxID duplication
    const qAllPayments = query(
      collection(db, "payments"),
      orderBy("createdAt", "desc"),
      limit(200),
    );
    const unsubAll = onSnapshot(qAllPayments, (snap) => {
      const trxIds = snap.docs.map((d) => d.data().transactionId);
      const dups = new Set<string>();
      const seen = new Set<string>();
      trxIds.forEach((id) => {
        if (seen.has(id)) dups.add(id);
        seen.add(id);
      });
      setDuplicates(dups);
    });

    const qPending = query(
      collection(db, "payments"),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc"),
      limit(50),
    );
    const unsubPending = onSnapshot(
      qPending,
      (snap) => {
        setPayments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => handleFirestoreError(err, "list", "payments"),
    );

    return () => {
      unsubMatches();
      unsubAll();
      unsubPending();
    };
  }, []);

  const handleAction = async (
    payment: any,
    action: "approved" | "rejected",
  ) => {
    try {
      await runTransaction(db, async (tx) => {
        const pRef = doc(db, "payments", payment.id);
        const uRef = doc(db, "users", payment.userId);

        const uSnap = await tx.get(uRef);
        if (!uSnap.exists()) throw new Error("User does not exist");

        tx.update(pRef, {
          status: action,
          processedBy: profile?.email || "System",
          processedAt: serverTimestamp(),
        });

        if (action === "approved") {
          tx.update(uRef, { balance: uSnap.data().balance + payment.amount });
        }

        // Add notification
        const notifRef = doc(
          collection(db, "users", payment.userId, "notifications"),
        );
        tx.set(notifRef, {
          title: `PAYMENT ${action.toUpperCase()}`,
          message:
            action === "approved"
              ? `Tactical reserves updated: +৳${payment.amount} BDT credited to your wallet.`
              : `Tactical reserves rejected: Recharge request for ৳${payment.amount} BDT was denied. Check TrxID and try again.`,
          type: "payment",
          read: false,
          createdAt: serverTimestamp(),
        });
      });

      await logAdminAction(
        profile?.email || "Unknown",
        `Payment ${action}`,
        `Processed recharge of ৳${payment.amount} for ${payment.userEmail}. TrxID: ${payment.transactionId}`,
      );
      toast.success(`Transaction ${action}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filtered = payments.filter((p) => {
    const matchesSearch =
      p.transactionId?.toLowerCase().includes(searchTrx.toLowerCase()) ||
      p.userEmail?.toLowerCase().includes(searchTrx.toLowerCase());
    const matchesMatch =
      selectedMatchFilter === "all" || p.matchId === selectedMatchFilter;
    return matchesSearch && matchesMatch;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-end bg-white/5 p-6 rounded-3xl border border-white/5">
        <div className="flex-1 min-w-[200px] space-y-1">
          <Label className="text-[10px] uppercase font-black text-slate-500">
            Search Intelligence
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Filter by TrxID or Email..."
              value={searchTrx}
              onChange={(e) => setSearchTrx(e.target.value)}
              className="pl-10 h-10 bg-black/40 border-slate-800"
            />
          </div>
        </div>
        <div className="w-full md:w-64 space-y-1">
          <Label className="text-[10px] uppercase font-black text-slate-500">
            Match Sector
          </Label>
          <Select
            value={selectedMatchFilter}
            onValueChange={setSelectedMatchFilter}
          >
            <SelectTrigger className="bg-black/40 border-slate-800 h-10">
              <SelectValue placeholder="All Matches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              {matches.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="glass border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5">
                <TableHead className="text-[10px] font-black uppercase tracking-widest">
                  Operative
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">
                  Transaction Intel
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">
                  Amount
                </TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest">
                  Tactical Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => {
                const isDup = duplicates.has(p.transactionId);
                return (
                  <TableRow
                    key={p.id}
                    className={`border-white/5 transition-colors ${isDup ? "bg-red-500/5 hover:bg-red-500/10" : ""}`}
                  >
                    <TableCell>
                      <div className="font-bold text-xs">{p.userName}</div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {p.userEmail}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            <code
                              className={`text-xs font-mono tracking-widest px-2 py-0.5 rounded w-fit ${isDup ? "bg-red-500/20 text-red-500 font-black" : p.transactionId?.length !== 10 ? "bg-amber-500/20 text-amber-500 font-black" : "bg-emerald-500/10 text-emerald-400 font-black"}`}
                            >
                              {p.transactionId}
                            </code>
                            {p.transactionId && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  navigator.clipboard.writeText(p.transactionId);
                                  toast.success(`Copied TrxID: ${p.transactionId}`);
                                }}
                                className="w-5 h-5 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                                title="Copy Trx ID"
                              >
                                <Copy className="w-2.5 h-2.5" />
                              </Button>
                            )}
                          </div>
                          {isDup && (
                            <div className="flex items-center gap-1 text-[8px] font-black uppercase text-red-500 animate-pulse bg-red-500/10 px-2 py-0.5 rounded">
                              <AlertTriangle className="w-3 h-3" /> Duplicate
                              Detected
                            </div>
                          )}
                          {p.transactionId?.length !== 10 && !isDup && (
                            <div className="flex items-center gap-1 text-[8px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                              <AlertTriangle className="w-3 h-3" /> AI Flag:
                              Invalid Length
                            </div>
                          )}
                          {p.transactionId?.length === 10 && !isDup && (
                            <div className="flex items-center gap-1 text-[8px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                              <Check className="w-3 h-3" /> AI: Format Verified
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-[9px] text-slate-500 mt-2 uppercase font-bold tracking-tighter flex items-center gap-1.5 flex-wrap">
                        <span>Method: <span className="text-slate-300">{p.method}</span></span> •
                        <span>Agent: <span className="text-slate-300">{p.agentName || "N/A"}</span></span>
                        {(p.senderNumber || p.phoneNumber) && (
                          <>
                            • 
                            <span className="flex items-center gap-1">
                              Phone: <span className="text-slate-300 font-mono text-[10px]">{p.senderNumber || p.phoneNumber}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const num = p.senderNumber || p.phoneNumber || "";
                                  navigator.clipboard.writeText(num);
                                  toast.success(`Copied phone number: ${num}`);
                                }}
                                className="w-5 h-5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                                title="Copy Phone Number"
                              >
                                <Copy className="w-2.5 h-2.5" />
                              </Button>
                            </span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-black accent-text italic">
                        ৳{p.amount}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 px-4 rounded-xl border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 gap-2 font-black uppercase text-[9px] tracking-widest"
                          onClick={() => handleAction(p, "approved")}
                        >
                          <Check className="w-3 h-3" /> Approve
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 px-4 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 gap-2 font-black uppercase text-[9px] tracking-widest"
                          onClick={() => handleAction(p, "rejected")}
                        >
                          <X className="w-3 h-3" /> Reject
                        </Button>
                        <a href={`tel:${p.phoneNumber || ""}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl border border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </Button>
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="View Receipt Screenshot"
                          className="h-9 w-9 rounded-xl border border-white/20 text-slate-300 hover:bg-white/10"
                          onClick={() =>
                            alert(
                              "Screenshot integration pending implementation. Cross-reference TrxID manually.",
                            )
                          }
                        >
                          <Film className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-40 text-center text-slate-500 grayscale opacity-50 italic text-xs uppercase font-bold tracking-[0.2em]"
                  >
                    Scanning frequencies... Verification queue empty.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

function AdminActivityLog() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "admin_logs"),
      orderBy("createdAt", "desc"),
      limit(100),
    );
    return onSnapshot(
      q,
      (snap) => {
        setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => handleFirestoreError(err, "list", "admin_logs"),
    );
  }, []);

  return (
    <Card className="glass border-subtle">
      <div className="overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5">
              <TableHead className="text-[10px] font-black uppercase tracking-widest">
                Timestamp
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">
                Commander
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">
                Tactical Action
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">
                Intelligence Details
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow
                key={log.id}
                className="border-white/5 hover:bg-white/5 transition-colors"
              >
                <TableCell className="text-[9px] font-mono text-slate-500">
                  {safeFormat(log.createdAt, "HH:mm:ss")}
                  <br />
                  {safeFormat(log.createdAt, "MMM d, yy")}
                </TableCell>
                <TableCell>
                  <div className="font-black text-[10px] uppercase text-primary italic">
                    {log.adminEmail}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="text-[8px] font-black uppercase tracking-[0.1em] border-slate-700 bg-black/40"
                  >
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="text-[10px] font-bold text-slate-400">
                  {log.details}
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-40 text-center text-slate-500 italic uppercase font-bold tracking-widest text-[10px]"
                >
                  Tactical logs clear. No recent command actions.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

function UserManager() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [adjustingUser, setAdjustingUser] = useState<{
    id: string;
    balance: number;
    displayName: string;
  } | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "users"),
      orderBy("balance", "desc"),
      limit(100),
    );
    return onSnapshot(
      q,
      (snap) => {
        setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => handleFirestoreError(err, "list", "users"),
    );
  }, []);

  const confirmAdjustBalance = async () => {
    if (!adjustingUser) return;
    const amountStr = adjustmentAmount;
    if (!amountStr || isNaN(Number(amountStr))) return;
    try {
      await updateDoc(doc(db, "users", adjustingUser.id), {
        balance: adjustingUser.balance + Number(amountStr),
      });
      await logAdminAction(
        profile?.email || "",
        "Adjust Balance",
        `Adjusted balance of ${adjustingUser.id} by ৳${amountStr}`,
      );
      toast.success("Reserves recalibrated.");
      setAdjustingUser(null);
      setAdjustmentAmount("");
    } catch (err) {
      toast.error("Adjustment failed.");
    }
  };

  const toggleAgent = async (userId: string, role: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        role: role === "agent" ? "player" : "agent",
      });
      toast.success("Operative security clearance updated.");
    } catch (err) {
      toast.error("Role update failed.");
    }
  };

  const blacklistUser = async (userId: string, isBanned: boolean) => {
    if (
      !confirm(
        isBanned
          ? "Reinstate this operative?"
          : "Deploy total shadow ban on this operative? They will be unable to join missions.",
      )
    )
      return;
    try {
      await updateDoc(doc(db, "users", userId), {
        status: isBanned ? "active" : "banned",
        emailBlocked: !isBanned,
        phoneBlocked: !isBanned,
        deviceBlocked: !isBanned,
      });
      await logAdminAction(
        profile?.email || "",
        isBanned ? "Unban" : "Ban",
        `Changed status of ${userId} to ${isBanned ? "active" : "banned"}`,
      );
      toast.success(
        isBanned
          ? "Operative reinstated."
          : "BAN HAMMER: Email, Phone, and Device IDs added to global blacklist.",
      );
    } catch (err) {
      toast.error("Status update failed.");
    }
  };

  const filtered = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      u.ffIgn?.toLowerCase().includes(search.toLowerCase()),
  );

  // Self heal admin roles
  useEffect(() => {
    const healRoles = async () => {
      for (const u of users) {
        if (
          u.email &&
          ["xksamirul@gmail.com", "mahi2007raj@gmail.com"].includes(u.email) &&
          u.role !== "admin"
        ) {
          try {
            await updateDoc(doc(db, "users", u.id), { role: "admin" });
          } catch (e) {}
        }
      }
    };
    if (users.length > 0) healRoles();
  }, [users]);

  return (
    <div className="space-y-4">
      <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
        <Label className="text-[10px] uppercase font-black text-slate-500">
          Operative Intel Database
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search by Email, IGN, or Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-black/40 border-slate-800 focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((u) => (
          <div
            key={u.id}
            className="glass p-4 rounded-xl border border-white/5 space-y-3 relative overflow-hidden flex flex-col md:flex-row justify-between gap-4"
          >
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="font-bold text-sm uppercase italic">
                  {u.displayName}
                </div>
                <Badge
                  variant="outline"
                  className={`text-[8px] font-black uppercase ${u.role === "admin" || (u.email && ["xksamirul@gmail.com", "mahi2007raj@gmail.com"].includes(u.email)) ? "border-primary text-primary" : "border-slate-700 text-slate-500"}`}
                >
                  {u.role === "admin" ||
                  (u.email &&
                    ["xksamirul@gmail.com", "mahi2007raj@gmail.com"].includes(
                      u.email,
                    ))
                    ? "admin"
                    : u.role}
                </Badge>
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {u.email}
              </div>
              <div className="bg-white/5 p-2 rounded flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-black text-slate-300 tracking-tighter">
                  <span>IGN: {u.ffIgn || "UNSET"}</span>
                  {u.ffIgn && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(u.ffIgn);
                        toast.success(`Copied IGN: ${u.ffIgn}`);
                      }}
                      className="w-5 h-5 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                      title="Copy IGN"
                    >
                      <Copy className="w-2.5 h-2.5" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                  <span>UID: {u.ffUid || "UNSET"}</span>
                  {u.ffUid && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(u.ffUid);
                        toast.success(`Copied UID: ${u.ffUid}`);
                      }}
                      className="w-5 h-5 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                      title="Copy UID"
                    >
                      <Copy className="w-2.5 h-2.5" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center justify-between text-[10px] text-amber-400 font-mono mt-1 pt-1 border-t border-white/5">
                  <span className="flex items-center gap-1">
                    Contact: <span className="text-slate-300 font-bold">{u.contactId || "UNSET"}</span>
                  </span>
                  {u.contactId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(u.contactId);
                        toast.success(`Copied Contact: ${u.contactId}`);
                      }}
                      className="w-5 h-5 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                      title="Copy Contact"
                    >
                      <Copy className="w-2.5 h-2.5" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-primary italic">
                    LVL {u.level || 1}
                  </span>
                  <div className="h-1 w-16 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(u.xp % 500) / 5}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  XP {u.xp || 0} • Kills {u.kills || 0}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-4">
              <div className="text-right mb-2">
                <span className="text-[8px] text-slate-500 uppercase font-black block tracking-widest">
                  Reserves
                </span>
                <span className="font-black italic text-emerald-400 text-lg">
                  ৳{u.balance}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAdjustingUser({
                      id: u.id,
                      balance: u.balance,
                      displayName: u.displayName || "Unknown",
                    });
                    setAdjustmentAmount("");
                  }}
                  className="w-full text-[10px] font-black uppercase text-emerald-400 border-white/10 hover:bg-emerald-400/10 justify-start"
                >
                  <CreditCard className="w-3.5 h-3.5 mr-2" /> Adjust Reserves
                </Button>
                {u.role !== "admin" &&
                  !(
                    u.email &&
                    ["xksamirul@gmail.com", "mahi2007raj@gmail.com"].includes(
                      u.email,
                    )
                  ) && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAgent(u.id, u.role)}
                        className={`w-full text-[10px] font-black uppercase justify-start ${u.role === "agent" ? "text-amber-500 border-amber-500/30 hover:bg-amber-500/10" : "text-slate-500 border-white/10 hover:bg-white/5"}`}
                      >
                        <Grid className="w-3.5 h-3.5 mr-2" />{" "}
                        {u.role === "agent" ? "Revoke Agent" : "Make Agent"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          blacklistUser(u.id, u.status === "banned")
                        }
                        className={`w-full text-[10px] font-black uppercase justify-start ${u.status === "banned" ? "text-red-500 border-red-500/30 bg-red-500/10 hover:bg-red-500/20" : "text-red-400/50 border-white/10 hover:text-red-500 hover:bg-red-500/10"}`}
                      >
                        <UserX className="w-3.5 h-3.5 mr-2" />{" "}
                        {u.status === "banned" ? "Revoke Ban" : "Shadow Ban"}
                      </Button>
                    </>
                  )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={!!adjustingUser}
        onOpenChange={(open) => !open && setAdjustingUser(null)}
      >
        <DialogContent className="max-w-sm glass border-subtle">
          <DialogHeader>
            <DialogTitle className="text-xl font-black italic uppercase tracking-tighter text-emerald-400">
              Adjust Reserves
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              Adding funds to{" "}
              <span className="text-white">{adjustingUser?.displayName}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">
                Adjustment Amount (৳ BDT)
              </Label>
              <Input
                type="number"
                placeholder="Ex: 50 or -50"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
                className="h-12 bg-black/40 border-slate-800 focus:border-emerald-500/50 text-emerald-400 font-black text-lg"
              />
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Use negative numbers to deduct reserves.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="h-10 text-[10px] font-black uppercase tracking-widest"
              onClick={() => setAdjustingUser(null)}
            >
              Cancel
            </Button>
            <Button
              className="h-10 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              onClick={confirmAdjustBalance}
            >
              Confirm Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BulkResultSheet() {
  const { profile } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "matches"),
      where("status", "==", "completed"),
      orderBy("startTime", "desc"),
      limit(10),
    );
    return onSnapshot(
      q,
      (snap) => {
        setMatches(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => handleFirestoreError(err, "list", "matches"),
    );
  }, []);

  useEffect(() => {
    if (!selectedMatch) return;
    const q = query(
      collection(db, "matches", selectedMatch, "registrations"),
      orderBy("slotNumber", "asc"),
    );
    return onSnapshot(
      q,
      (snap) => {
        setPlayers(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            kills: 0,
            rank: 99,
            winnings: 0,
          })),
        );
      },
      (err) =>
        handleFirestoreError(
          err,
          "list",
          `matches/${selectedMatch}/registrations`,
        ),
    );
  }, [selectedMatch]);

  const updateResult = (id: string, field: string, val: number) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: val } : p)),
    );
  };

  const calculateAutoPayout = () => {
    const match = matches.find((m) => m.id === selectedMatch);
    if (!match) return;
    const prizePerKill = (match.totalPrize * 0.4) / (match.joinedCount || 1); // Mock logic: 40% pool to kills
    const booyahPrize = match.totalPrize * 0.3; // 30% to winner

    setPlayers((prev) =>
      prev.map((p) => {
        let win = Math.floor(p.kills * prizePerKill);
        if (p.rank === 1) win += booyahPrize;
        return { ...p, winnings: win };
      }),
    );
    toast.success("Tactical payouts calculated based on combat performance.");
  };

  const submitForReview = async () => {
    if (
      !confirm(
        "Submit for 30-Minute Review? Players will see outcomes before funds are sent. Use this to avoid disputes.",
      )
    )
      return;
    setIsProcessing(true);
    try {
      await runTransaction(db, async (tx) => {
        for (const p of players) {
          const resultRef = doc(collection(db, "results"));
          tx.set(resultRef, {
            matchId: selectedMatch,
            userId: p.userId,
            playerName: p.gameName,
            kills: Number(p.kills),
            rank: Number(p.rank),
            winnings: Number(p.winnings),
            status: "pending_review",
            createdAt: serverTimestamp(),
          });
        }
        tx.update(doc(db, "matches", selectedMatch!), {
          resultsProcessed: "review",
        });
      });
      await logAdminAction(
        profile?.email || "",
        "Results Review",
        `Submitted results for review for match ${selectedMatch}`,
      );
      toast.success("Submitted for 30-Min Review! Waiting for disputes.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const notifyFinalResults = async () => {
    if (!selectedMatch) return;
    setIsProcessing(true);
    try {
      const matchConfig = matches.find((m) => m.id === selectedMatch);
      const batchRequests = players.map(async (p) => {
        const notifRef = doc(collection(db, "users", p.userId, "notifications"));
        await setDoc(notifRef, {
          title: "RESULTS FINALIZED",
          message: `Match: ${matchConfig?.title}. Results have been finalized. Check your wallet / leaderboard!`,
          type: "match",
          read: false,
          createdAt: serverTimestamp(),
        });
      });
      await Promise.all(batchRequests);
      toast.success("Final results notification sent to all participants.");
    } catch (err: any) {
      toast.error(err.message || "Failed to notify.");
    } finally {
      setIsProcessing(false);
    }
  };

  const finalizeAndPay = async () => {
    if (
      !confirm(
        "Initiate mass payout? This will update all users' tactical reserves and archive the match.",
      )
    )
      return;
    setIsProcessing(true);
    try {
      await runTransaction(db, async (tx) => {
        for (const p of players) {
          const uRef = doc(db, "users", p.userId);
          const uSnap = await tx.get(uRef);
          if (uSnap.exists()) {
            const current = uSnap.data();
            const kills = Number(p.kills);
            const winnings = Number(p.winnings);
            const xpGain = kills * 10 + (p.rank === 1 ? 100 : 0);

            tx.update(uRef, {
              balance: (current.balance || 0) + winnings,
              kills: (current.kills || 0) + kills,
              totalWinnings: (current.totalWinnings || 0) + winnings,
              xp: (current.xp || 0) + xpGain,
              level: Math.floor(((current.xp || 0) + xpGain) / 500) + 1,
              wins: (current.wins || 0) + (p.rank === 1 ? 1 : 0),
              matchesPlayed: (current.matchesPlayed || 0) + 1,
            });

            // Create global result entry for leaderboards
            const resultRef = doc(collection(db, "results"));
            tx.set(resultRef, {
              matchId: selectedMatch,
              userId: p.userId,
              playerName: p.gameName,
              kills,
              rank: p.rank,
              winnings,
              createdAt: serverTimestamp(),
            });

            const notifRef = doc(
              collection(db, "users", p.userId, "notifications"),
            );
            tx.set(notifRef, {
              title: "COMBAT RESULTS DEPLOYED",
              message: `Match: ${matches.find((m) => m.id === selectedMatch).title}. Kills: ${kills}. Extraction: ৳${winnings} BDT. Level up sequence initiated.`,
              type: "match",
              read: false,
              createdAt: serverTimestamp(),
            });
          }
        }
        tx.update(doc(db, "matches", selectedMatch!), {
          resultsProcessed: true,
        });
      });
      await logAdminAction(
        profile?.email || "",
        "Finalize Payouts",
        `Distributed rewards for match ${selectedMatch}`,
      );
      toast.success(
        "Tactical rewards distributed. Squad extractions complete.",
      );
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAIAnalyze = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!selectedMatch) {
      toast.error("Select a mission first.");
      return;
    }

    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const base64Data = (event.target?.result as string).split(",")[1];
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'AIzaSyCi9DdTfYpEhca2-yWNky6oFXEFJmFg_XQ' });

        const promptString =
          "Analyze this Free Fire match result screenshot. Return a JSON object with a 'players' array. Each object in the array should have 'gameName' (string, the player's name), 'kills' (number), and 'rank' (number, their placement/# if visible). Only output the JSON.";

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: {
            parts: [
              { inlineData: { mimeType: file.type, data: base64Data } },
              { text: promptString },
            ],
          },
        });

        const text = response.text || "";
        const jsonMatch =
          text.match(/```json\n([\s\S]*)\n```/) || text.match(/{[\s\S]*}/);

        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          if (data.players && Array.isArray(data.players)) {
            // Merge AI data with existing players based on approximate name match
            setPlayers((prev) =>
              prev.map((p) => {
                const aiPlayer = data.players.find(
                  (ap: any) =>
                    ap.gameName
                      .toLowerCase()
                      .includes(p.gameName.toLowerCase()) ||
                    p.gameName
                      .toLowerCase()
                      .includes(ap.gameName.toLowerCase()),
                );
                if (aiPlayer) {
                  return {
                    ...p,
                    kills: aiPlayer.kills || 0,
                    rank: aiPlayer.rank || p.rank,
                  };
                }
                return p;
              }),
            );
            toast.success(
              "AI Analysis Complete: Results mapped to operative profiles.",
            );
          }
        } else {
          throw new Error("Could not parse JSON from AI response.");
        }
      } catch (err: any) {
        console.error("AI Analysis Failed:", err);
        toast.error("AI Analysis Failed: " + (err.message || "Unknown error"));
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="glass border-subtle overflow-hidden">
      <CardHeader className="bg-white/5 border-b border-white/5 flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-sm uppercase font-black tracking-widest text-primary flex items-center gap-2 italic">
            <Megaphone className="w-4 h-4" /> Bulk Result Entry
          </CardTitle>
          <CardDescription className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Distribute all rewards instantly. Players will receive balance
            immediately.
          </CardDescription>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <Button
            variant="outline"
            onClick={calculateAutoPayout}
            disabled={!selectedMatch}
            className="h-9 px-4 rounded-xl border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase"
          >
            Auto-Calc
          </Button>
          <Button
            variant="outline"
            onClick={submitForReview}
            disabled={isProcessing || !selectedMatch}
            className="h-9 px-4 rounded-xl border-amber-500/30 text-amber-500 hover:bg-amber-500/10 text-[9px] font-black uppercase tracking-widest transition-all"
          >
            Submit for 30-Min Review
          </Button>
          <Button
            variant="outline"
            onClick={notifyFinalResults}
            disabled={isProcessing || !selectedMatch}
            className="h-9 px-4 rounded-xl border-blue-500/30 text-blue-400 hover:bg-blue-500/10 text-[9px] font-black uppercase tracking-widest transition-all"
          >
            Notify Results
          </Button>
          <Button
            onClick={finalizeAndPay}
            disabled={isProcessing || !selectedMatch}
            className="h-9 px-4 rounded-xl accent-bg text-black text-[9px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(240,185,11,0.3)] hover:scale-105 transition-all"
          >
            Distribute All
          </Button>
        </div>
      </CardHeader>
      <div className="p-4 bg-black/20 border-b border-white/5 flex gap-4 items-center">
        <Select onValueChange={setSelectedMatch}>
          <SelectTrigger className="bg-white/5 border-white/10 h-10 rounded-xl flex-1 max-w-sm">
            <SelectValue placeholder="Select Completed Mission..." />
          </SelectTrigger>
          <SelectContent>
            {matches.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.title} ({safeFormat(m.startTime, "MMM d")})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            onChange={handleAIAnalyze}
            disabled={isAnalyzing || !selectedMatch}
            title={
              !selectedMatch
                ? "Select a mission first"
                : "Upload Match Screenshot"
            }
          />
          <Button
            variant="outline"
            disabled={isAnalyzing || !selectedMatch}
            className="h-10 px-4 rounded-xl border-blue-500/30 text-blue-400 hover:bg-blue-500/10 gap-2 flex items-center"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
            <span className="text-[10px] font-black uppercase tracking-widest">
              AI Scan Picture
            </span>
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto w-full">
        <Table className="min-w-[700px]">
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5">
              <TableHead className="text-[10px] font-black uppercase">
                Operative
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase w-24">
                Kills
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase w-24">
                Rank
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase w-32">
                Payout (৳)
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((p) => (
              <TableRow
                key={p.id}
                className="border-white/5 hover:bg-white/5 transition-colors"
              >
                <TableCell className="font-bold text-xs">
                  {p.gameName}
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    className="h-8 bg-black/40 border-slate-800 font-mono text-center"
                    value={p.kills}
                    onChange={(e) =>
                      updateResult(p.id, "kills", Number(e.target.value))
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    className="h-8 bg-black/40 border-slate-800 font-mono text-center"
                    value={p.rank}
                    onChange={(e) =>
                      updateResult(p.id, "rank", Number(e.target.value))
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    className="h-8 bg-black/40 border-emerald-500/20 text-emerald-400 font-black text-center"
                    value={p.winnings}
                    onChange={(e) =>
                      updateResult(p.id, "winnings", Number(e.target.value))
                    }
                  />
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => {
                      const notifRef = collection(
                        db,
                        "users",
                        p.userId,
                        "notifications",
                      );
                      addDoc(notifRef, {
                        title: "VIDEO PROOF REQUIRED",
                        message:
                          "Your recent match winnings are on hold. Please upload your final circle screen-recording and send the link to our WhatsApp Support within 24 hours.",
                        type: "warning",
                        read: false,
                        createdAt: serverTimestamp(),
                      });
                      toast.success(
                        `Video Proof request sent to ${p.gameName}`,
                      );
                    }}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 ml-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                    title="Request Video Proof"
                  >
                    <Video className="w-3.5 h-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

function BracketManager() {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [bracket, setBracket] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "matches"),
      where("status", "in", ["upcoming", "live"]),
    );
    return onSnapshot(
      q,
      (snap) => {
        setMatches(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => handleFirestoreError(err, "list", "matches"),
    );
  }, []);

  useEffect(() => {
    if (!selectedMatch) return;
    const bracketRef = doc(db, "matches", selectedMatch, "brackets", "tree");
    return onSnapshot(
      bracketRef,
      (snap) => {
        if (snap.exists()) setBracket(snap.data());
        else setBracket(null);
      },
      (err) =>
        handleFirestoreError(
          err,
          "get",
          `matches/${selectedMatch}/brackets/tree`,
        ),
    );
  }, [selectedMatch]);

  const generateBracket = async () => {
    if (!selectedMatch) return;
    setLoading(true);
    try {
      const regsSnap = await getDocs(
        query(collection(db, "matches", selectedMatch, "registrations")),
      );
      const players = regsSnap.docs.map((d) => ({
        id: d.data().userId,
        name: d.data().gameName,
      }));

      if (players.length < 2) {
        toast.error("Not enough players to generate tactical bracket.");
        return;
      }

      // Shuffle
      const shuffled = [...players].sort(() => Math.random() - 0.5);

      const rounds = [];
      const firstRoundMatches = [];
      for (let i = 0; i < shuffled.length; i += 2) {
        firstRoundMatches.push({
          player1Id: shuffled[i].id,
          player1Name: shuffled[i].name,
          player2Id: shuffled[i + 1]?.id || null,
          player2Name: shuffled[i + 1]?.name || "BYE",
          winnerId: null,
          score: "",
        });
      }
      rounds.push({ matches: firstRoundMatches });

      await setDoc(doc(db, "matches", selectedMatch, "brackets", "tree"), {
        matchId: selectedMatch,
        rounds,
        updatedAt: serverTimestamp(),
      });
      toast.success("Bracket randomized and deployed.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setWinner = async (
    roundIdx: number,
    matchIdx: number,
    winnerId: string,
  ) => {
    const newRounds = JSON.parse(JSON.stringify(bracket.rounds));
    newRounds[roundIdx].matches[matchIdx].winnerId = winnerId;

    // Advance to next round if exists
    if (!newRounds[roundIdx + 1]) {
      newRounds[roundIdx + 1] = { matches: [] };
    }

    const nextMatchIdx = Math.floor(matchIdx / 2);
    if (!newRounds[roundIdx + 1].matches[nextMatchIdx]) {
      newRounds[roundIdx + 1].matches[nextMatchIdx] = {
        player1Id: null,
        player1Name: null,
        player2Id: null,
        player2Name: null,
        winnerId: null,
        score: "",
      };
    }

    const winnerName =
      winnerId === newRounds[roundIdx].matches[matchIdx].player1Id
        ? newRounds[roundIdx].matches[matchIdx].player1Name
        : newRounds[roundIdx].matches[matchIdx].player2Name;

    if (matchIdx % 2 === 0) {
      newRounds[roundIdx + 1].matches[nextMatchIdx].player1Id = winnerId;
      newRounds[roundIdx + 1].matches[nextMatchIdx].player1Name = winnerName;
    } else {
      newRounds[roundIdx + 1].matches[nextMatchIdx].player2Id = winnerId;
      newRounds[roundIdx + 1].matches[nextMatchIdx].player2Name = winnerName;
    }

    try {
      await updateDoc(doc(db, "matches", selectedMatch, "brackets", "tree"), {
        rounds: newRounds,
      });
      toast.success("Progression updated.");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Bracket Command</CardTitle>
          <CardDescription>
            Generate and manage tactical elimination trees.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Select onValueChange={setSelectedMatch}>
            <SelectTrigger className="bg-white/5 border-white/10 flex-1">
              <SelectValue placeholder="Select active match" />
            </SelectTrigger>
            <SelectContent>
              {matches.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={generateBracket}
            disabled={loading || !selectedMatch}
            className="accent-bg text-black font-bold"
          >
            Generate Bracket
          </Button>
        </CardContent>
      </Card>

      {bracket && (
        <div className="flex gap-8 overflow-x-auto pb-8">
          {bracket.rounds.map((round: any, rIdx: number) => (
            <div key={rIdx} className="space-y-4 min-w-[200px]">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 px-4">
                Round {rIdx + 1}
              </h3>
              <div className="flex flex-col justify-around h-full space-y-8">
                {round.matches.map((m: any, mIdx: number) => (
                  <div
                    key={mIdx}
                    className="glass rounded-xl border-subtle overflow-hidden relative"
                  >
                    <button
                      onClick={() =>
                        m.player1Id && setWinner(rIdx, mIdx, m.player1Id)
                      }
                      className={`w-full p-3 text-left transition-colors border-b border-subtle flex justify-between items-center ${m.winnerId === m.player1Id ? "bg-emerald-500/20" : "hover:bg-white/5"}`}
                    >
                      <span className="text-xs font-bold truncate">
                        {m.player1Name || "---"}
                      </span>
                      {m.winnerId === m.player1Id && (
                        <Trophy className="w-3 h-3 text-emerald-400" />
                      )}
                    </button>
                    <button
                      onClick={() =>
                        m.player2Id && setWinner(rIdx, mIdx, m.player2Id)
                      }
                      className={`w-full p-3 text-left transition-colors flex justify-between items-center ${m.winnerId === m.player2Id ? "bg-emerald-500/20" : "hover:bg-white/5"}`}
                    >
                      <span className="text-xs font-bold truncate">
                        {m.player2Name || "---"}
                      </span>
                      {m.winnerId === m.player2Id && (
                        <Trophy className="w-3 h-3 text-emerald-400" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WithdrawalSniper() {
  const { profile } = useAuth();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  useEffect(() => {
    const qPending = query(
      collection(db, "withdrawals"),
      orderBy("createdAt", "desc"),
      limit(100),
    );
    return onSnapshot(
      qPending,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const pendingDocs = docs.filter(
          (w: any) => w.status === "pending" || w.status === "processing"
        );
        setWithdrawals(pendingDocs);
      },
      (err) => handleFirestoreError(err, "list", "withdrawals"),
    );
  }, []);

  const handleAction = async (
    withdrawal: any,
    action: "approved" | "rejected",
  ) => {
    try {
      await runTransaction(db, async (tx) => {
        const wRef = doc(db, "withdrawals", withdrawal.id);
        const uRef = doc(db, "users", withdrawal.userId);

        const uSnap = await tx.get(uRef);
        if (!uSnap.exists()) throw new Error("User does not exist");

        tx.update(wRef, {
          status: action,
          processedBy: profile?.email || "System",
          processedAt: serverTimestamp(),
        });

        if (action === "rejected") {
          // Refund balance if rejected
          const currentBalance = uSnap.data().balance || 0;
          tx.update(uRef, { balance: currentBalance + withdrawal.amount });
        }

        logAdminAction(
          profile?.email || "",
          "Process Withdrawal",
          `${action.toUpperCase()} withdrawal of ৳${withdrawal.amount} for ${withdrawal.userId}`,
        );
      });
      toast.success(`Withdrawal ${action}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
          Pending Extractions
        </h3>
        <Badge variant="outline" className="text-blue-400 border-blue-400/30">
          {withdrawals.length} QUEUED
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {withdrawals.map((w) => (
          <Card
            key={w.id}
            className="glass border-subtle relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <ShieldAlert className="w-16 h-16" />
            </div>
            <CardContent className="p-4 relative">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {w.userId}
                  </div>
                  <div className="text-xl font-black italic text-emerald-400 flex items-center gap-1">
                    ৳{w.amount}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">
                    Method
                  </div>
                  <div className="text-sm font-bold uppercase">{w.method}</div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-xl p-3 mb-4 space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 font-bold uppercase tracking-widest">
                    Account Number
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-200">
                      {w.accountNumber || w.phoneNumber || w.number}
                    </span>
                    {(w.accountNumber || w.phoneNumber || w.number) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const num = w.accountNumber || w.phoneNumber || w.number;
                          navigator.clipboard.writeText(num);
                          toast.success(`Copied account number: ${num}`);
                        }}
                        className="w-5 h-5 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                        title="Copy account number"
                      >
                        <Copy className="w-2.5 h-2.5" />
                      </Button>
                    )}
                  </div>
                </div>
                {w.method === "diamond" && (
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 font-bold uppercase tracking-widest">
                      Player UID
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold">{w.playerUid}</span>
                      {w.playerUid && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            navigator.clipboard.writeText(w.playerUid);
                            toast.success(`Copied Player UID: ${w.playerUid}`);
                          }}
                          className="w-5 h-5 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                          title="Copy Player UID"
                        >
                          <Copy className="w-2.5 h-2.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                {w.method === "airdrop" && (
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 font-bold uppercase tracking-widest">
                      Password
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold">{w.password}</span>
                      {w.password && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            navigator.clipboard.writeText(w.password);
                            toast.success(`Copied Password: ${w.password}`);
                          }}
                          className="w-5 h-5 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                          title="Copy Password"
                        >
                          <Copy className="w-2.5 h-2.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider h-10 px-2 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center"
                  onClick={() => handleAction(w, "approved")}
                >
                  <Check className="w-3.5 h-3.5 mr-1 shrink-0" /> Approve & Paid
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-10 px-2 rounded-xl border-red-500/20 text-red-500 hover:bg-red-500/10 text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center"
                  onClick={() => handleAction(w, "rejected")}
                >
                  <X className="w-3.5 h-3.5 mr-1 shrink-0" /> Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {withdrawals.length === 0 && (
          <div className="col-span-full h-32 flex items-center justify-center border border-dashed border-white/10 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] italic">
              No pending extraction requests.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
