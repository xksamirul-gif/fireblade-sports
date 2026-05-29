import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Toaster, toast } from "sonner";
import { Home, LayoutDashboard, Wallet, User as UserIcon, LogIn, LogOut, Bell, ShieldCheck, History, Plus, Trophy, Copy, Globe, Gamepad2 } from "lucide-react";
import HomePage from "@/pages/Home";
import WalletPage from "@/pages/Wallet";
import AdminPage from "@/pages/Admin";
import ProfilePage from "@/pages/Profile";
import LeaderboardPage from "@/pages/Leaderboard";
import RulesPage from "@/pages/Rules";
import LandingPage from "@/pages/Landing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { auth, db, handleFirestoreError } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, limit, doc } from "firebase/firestore";

function Sidebar() {
  const { isAdmin } = useAuth();
  const location = useLocation();

  return (
    <div className="w-20 border-r border-subtle flex flex-col items-center py-8 space-y-10 glass hidden md:flex h-screen sticky top-0">
      <Link to="/" className="w-12 h-12 accent-bg rounded-xl flex items-center justify-center font-bold text-black text-xl hover:scale-105 transition-transform">
        F
      </Link>
      
      <div className="flex flex-col space-y-8 text-slate-500">
        <Link to="/" className={`sidebar-item ${location.pathname === '/' ? 'active' : ''}`} title="Landing Website">
          <Globe className="w-6 h-6" />
        </Link>
        <Link to="/tournaments" className={`sidebar-item ${location.pathname === '/tournaments' ? 'active' : ''}`} title="Matches">
          <Gamepad2 className="w-6 h-6" />
        </Link>
        <Link to="/wallet" className={`sidebar-item ${location.pathname === '/wallet' ? 'active' : ''}`} title="Wallet">
          <Wallet className="w-6 h-6" />
        </Link>
        <Link to="/profile" className={`sidebar-item ${location.pathname === '/profile' ? 'active' : ''}`} title="Profile">
          <UserIcon className="w-6 h-6" />
        </Link>
        <Link to="/leaderboard" className={`sidebar-item ${location.pathname === '/leaderboard' ? 'active' : ''}`} title="Leaderboard">
          <Trophy className="w-6 h-6" />
        </Link>
        <Link to="/rules" className={`sidebar-item ${location.pathname === '/rules' ? 'active' : ''}`} title="Rules">
          <ShieldCheck className="w-6 h-6" />
        </Link>
        {isAdmin && (
          <Link to="/admin" className={`sidebar-item ${location.pathname.startsWith('/admin') ? 'active' : ''}`} title="Admin Panel">
            <LayoutDashboard className="w-6 h-6" />
          </Link>
        )}
      </div>
    </div>
  );
}

function AuthDialog() {
  const { login, loginEmail, registerEmail } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await registerEmail(email, password, name);
      } else {
        await loginEmail(email, password);
      }
      toast.success(isRegister ? "Account authorized!" : "Clearance verified!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button className="rounded-lg px-6 accent-bg text-black font-bold uppercase text-xs tracking-wider shadow-lg shadow-[#ff4d00]/20 hover:scale-105 active:scale-95 transition-all">
            <LogIn className="w-4 h-4 mr-2" /> Authenticate
          </Button>
        }
      />
      <PopoverContent className="w-80 glass border-subtle p-6" align="end">
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-black uppercase tracking-widest text-sm">Operation Login</h4>
            <p className="text-[10px] text-slate-500 font-bold">Secure deployment entrance.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black text-slate-400">Designation</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Tactical ID" className="h-9 bg-black/40 border-slate-800" />
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-black text-slate-400">Comm Link (Email)</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="hq@firezone.com" className="h-9 bg-black/40 border-slate-800" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-black text-slate-400">Cipher (Password)</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="h-9 bg-black/40 border-slate-800" />
            </div>
            
            <Button disabled={loading} className="w-full h-10 accent-bg text-black font-black uppercase tracking-widest text-[10px]">
              {loading ? "PROCESSING..." : (isRegister ? "REGISTER" : "LOGIN")}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-subtle" /></div>
            <div className="relative flex justify-center text-[8px] uppercase font-bold"><span className="bg-[#0a0b0e] px-2 text-slate-500">OR</span></div>
          </div>

          <Button variant="outline" onClick={login} className="w-full h-10 border-subtle text-white font-bold uppercase tracking-widest text-[10px] bg-white/5">
             Use Google Identity
          </Button>

          <button 
            onClick={() => setIsRegister(!isRegister)}
            className="w-full text-center text-[10px] font-bold text-[#ff4d00] hover:underline uppercase tracking-tighter"
          >
            {isRegister ? "Already have clearance? Login" : "No tactical ID? Register"}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Header() {
  const { user, profile, login, logout } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "users", user.uid, "notifications"), 
      orderBy("createdAt", "desc"),
      limit(50)
    );
    return onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => handleFirestoreError(err, 'list', `users/${user.uid}/notifications`));
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-20 border-b border-subtle flex items-center justify-between px-6 md:px-10 glass sticky top-0 z-40">
      <div className="flex flex-col">
        <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-widest leading-none">FireBlade Headquarters</span>
        <h1 className="text-sm sm:text-lg font-black tracking-tight uppercase italic mt-1">Dashboard (ড্যাশবোর্ড)</h1>
      </div>

      <div className="flex items-center space-x-4 md:space-x-8">
        {user ? (
          <>
            <div className="flex items-center gap-3 bg-emerald-500/5 px-4 py-2 rounded-2xl border border-emerald-500/10 shadow-sm">
              <div className="flex flex-col items-end">
                <span className="text-[8px] uppercase text-slate-500 font-bold tracking-tighter">Current Balance (ব্যালেন্স)</span>
                <span className="text-xl md:text-2xl font-black font-mono text-emerald-400 tracking-tighter leading-none">
                  ৳{profile?.balance?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="h-6 w-[1px] bg-emerald-500/20" />
              <Link to="/wallet">
                <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full hover:bg-emerald-500/10 text-emerald-500 p-0">
                  <Plus className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            <Popover>
              <PopoverTrigger
                render={
                  <Button variant="ghost" size="icon" className="relative hover:bg-white/5">
                    <Bell className="w-5 h-5 text-slate-400" />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-[#ff4d00] rounded-full" />
                    )}
                  </Button>
                }
              />
              <PopoverContent className="w-80 p-0 glass border-subtle" align="end">
                <div className="p-4 border-b border-subtle flex items-center justify-between">
                  <h4 className="font-semibold">Notifications</h4>
                  <span className="text-[10px] uppercase text-slate-500 font-bold">{unreadCount} UNREAD</span>
                </div>
                <ScrollArea className="h-[300px]">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-subtle">
                      {notifications.map((n) => (
                        <div key={n.id} className="p-4 hover:bg-white/5 transition-colors">
                          <h5 className="text-sm font-medium mb-1">{n.title}</h5>
                          <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
                          {(n.roomId || n.roomPassword) && (
                            <div className="mt-3 flex gap-2">
                              {n.roomId && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 h-8 text-[10px] uppercase font-bold justify-center"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(n.roomId);
                                    toast.success("Room ID copied!");
                                  }}
                                >
                                  <Copy className="w-3 h-3 mr-1" /> ID
                                </Button>
                              )}
                              {n.roomPassword && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 h-8 text-[10px] uppercase font-bold justify-center"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(n.roomPassword);
                                    toast.success("Password copied!");
                                  }}
                                >
                                  <Copy className="w-3 h-3 mr-1" /> Pass
                                </Button>
                              )}
                            </div>
                          )}
                          <span className="text-[10px] text-slate-500 mt-2 block">
                            {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleString() : 'Recent'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-500 text-sm italic">
                      No tactical alerts.
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-3">
              <Link to="/profile" className="block">
                <Avatar className="w-10 h-10 border border-slate-700 hover:border-[#ff4d00] transition-colors">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback className="bg-slate-800 text-xs">{user.displayName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={logout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <AuthDialog />
        )}
      </div>
    </header>
  );
}

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#0a0b0e] flex flex-col items-center justify-center gap-4 z-[100]">
      <div className="w-16 h-16 border-4 border-[#ff4d00]/20 border-t-[#ff4d00] rounded-full animate-spin" />
      <span className="text-[#ff4d00] font-bold tracking-widest animate-pulse uppercase italic">FireBlade</span>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#0a0b0e] text-[#e2e8f0] selection:bg-[#ff4d00]/30 flex font-sans">
          <Toaster position="top-right" theme="dark" />
          <AuthWrapper />
        </div>
      </Router>
    </AuthProvider>
  );
}

import { HelpCircle, MessageCircle, AlertTriangle, Hammer, Power, RefreshCw, Settings, Send } from "lucide-react";
import { GoogleGenAI } from "@google/genai";

function CustomerSupportPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "system", "settings"), (snap) => {
      if (snap.exists()) {
        setSettings(snap.data());
      }
    });
    return () => unsub();
  }, []);

  const waNumber = settings?.whatsappNumber || "8801234567890";
  const messengerId = settings?.messengerId || "yourpage";
  const telegramUsername = settings?.telegramUsername || "yourusername";

  const waLink = `https://wa.me/${waNumber.replace(/[\s\+\-]/g, '')}`;
  const messengerLink = messengerId.startsWith("http") ? messengerId : `https://m.me/${messengerId}`;
  const telegramLink = telegramUsername.startsWith("http") ? telegramUsername : `https://t.me/${telegramUsername.replace(/@/g, '')}`;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        render={
          <Button 
            className="fixed bottom-[80px] md:bottom-6 right-6 z-50 w-14 h-14 bg-emerald-600 hover:bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-600/40 hover:scale-110 active:scale-95 transition-all text-white p-0"
          >
            <HelpCircle className="w-6 h-6" />
          </Button>
        }
      />
      <PopoverContent className="w-[200px] p-2 glass border-subtle mb-2 mr-6 text-sm flex flex-col gap-2" align="end" sideOffset={10}>
         <div className="text-center p-2 border-b border-white/5 mb-2">
           <span className="font-black uppercase tracking-widest text-[10px] text-slate-400">Support Center</span>
         </div>
         <a 
          href={waLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-500/20 text-emerald-400 transition-colors cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.767 5.767 0 1.267.405 2.436 1.083 3.39l-.403 1.21-.403 1.209 1.24-.316 1.077-.275c.91.536 1.956.849 3.173.849 3.18 0 5.766-2.586 5.766-5.767 0-3.181-2.586-5.767-5.766-5.767zm3.177 8.35c-.139.387-.714.717-1.121.782-.36.059-.838.093-1.345-.147-2.115-.997-3.486-3.16-3.591-3.301-.106-.142-.857-1.139-.857-2.17 0-1.03.535-1.537.726-1.744.191-.208.411-.314.549-.314s.273-.01.393.003c.121.013.284-.047.444.33.167.393.57.1.57.1.57 1.383.626 1.353.18.57-.442.227-.087.611-.087.611 1.229 2.052 2.585 3.003 3.163 3.303.111.056.223.111.334.167-.111.167.111-.111-.111-.111.167z"/></svg>
          <span className="font-bold text-xs">WhatsApp</span>
        </a>
        <a 
          href={messengerLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.477 2 2 6.145 2 11.259c0 2.923 1.503 5.513 3.826 7.234.129.096.222.228.257.382l.334 1.488c.089.4.526.604.887.414l1.745-.916c.148-.078.318-.108.487-.087 1.05.132 2.146.202 3.268.202 5.523 0 10-4.145 10-9.259S17.523 2 12 2zm1.093 12.392l-2.613-2.793c-.23-.245-.6-.264-.852-.043l-3.329 2.915c-.328.287.143.722.502.435l2.613-2.793c.23-.245.6-.264.852-.043l3.329 2.915c.328.287-.143-.722-.502-.435z"/></svg>
          <span className="font-bold text-xs">Messenger</span>
        </a>
        <a 
          href={telegramLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-sky-500/20 text-sky-400 transition-colors cursor-pointer"
        >
          <Send className="w-5 h-5" />
          <span className="font-bold text-xs">Telegram</span>
        </a>
      </PopoverContent>
    </Popover>
  );
}

function BottomNav() {
  const location = useLocation();
  const { profile, isAdmin } = useAuth();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0a0b0e]/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-around z-50 px-2 pb-safe">
      <Link to="/" className={`flex flex-col items-center justify-center w-full h-full text-slate-500 ${location.pathname === '/' ? 'text-primary' : ''}`}>
        <Globe className="w-5 h-5 mb-1" />
        <span className="text-[9px] font-bold uppercase tracking-widest">Web</span>
      </Link>
      <Link to="/tournaments" className={`flex flex-col items-center justify-center w-full h-full text-slate-500 ${location.pathname === '/tournaments' ? 'text-primary' : ''}`}>
        <Gamepad2 className="w-5 h-5 mb-1" />
        <span className="text-[9px] font-bold uppercase tracking-widest">Matches</span>
      </Link>
      <Link to="/wallet" className={`flex flex-col items-center justify-center w-full h-full text-slate-500 ${location.pathname === '/wallet' ? 'text-primary' : ''}`}>
        <Wallet className="w-5 h-5 mb-1" />
        <span className="text-[9px] font-bold uppercase tracking-widest">Wallet</span>
      </Link>
      <Link to="/profile" className={`flex flex-col items-center justify-center w-full h-full text-slate-500 ${location.pathname === '/profile' ? 'text-primary' : ''}`}>
        <UserIcon className="w-5 h-5 mb-1" />
        <span className="text-[9px] font-bold uppercase tracking-widest">Profile</span>
      </Link>
      <Link to="/leaderboard" className={`flex flex-col items-center justify-center w-full h-full text-slate-500 ${location.pathname === '/leaderboard' ? 'text-primary' : ''}`}>
        <Trophy className="w-5 h-5 mb-1" />
        <span className="text-[9px] font-bold uppercase tracking-widest">Rank</span>
      </Link>
    </div>
  );
}

function AuthWrapper() {
  const { loading, isAdmin } = useAuth();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "system", "settings"), (doc) => {
      if (doc.exists()) {
        setMaintenanceMode(doc.data().maintenanceMode);
      }
    });
    return () => unsub();
  }, []);

  if (loading) return <LoadingScreen />;

  // Render the standalone website landing page on `/` immediately without the sidebar or headers
  if (location.pathname === "/") {
    return (
      <div className="w-full min-h-screen bg-[#07080b]">
        <Routes>
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </div>
    );
  }

  if (maintenanceMode && !isAdmin) {
    return (
      <div className="flex w-full min-h-screen items-center justify-center bg-[#06070a] text-white flex-col p-4 text-center">
        <Power className="w-20 h-20 text-red-500 mb-6 animate-pulse" />
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-[#ff4d00] mb-2">System Offline</h1>
        <p className="text-slate-400 font-bold max-w-md">Fireblade is currently undergoing tactical maintenance. The deploy zone is temporarily frozen. We will be back online shortly.</p>
        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-8 flex items-center justify-center border border-white/5 rounded-xl px-4 py-2"><Hammer className="w-3 h-3 mr-2" /> Maintenance Mode</span>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen">
      <Sidebar />
      <BottomNav />
      <CustomerSupportPopover />
      <div className="flex-1 flex flex-col pt-0 pb-16 md:pb-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative h-full">
          <div className="container mx-auto p-4 md:p-8">
            <Routes>
              <Route path="/tournaments" element={<HomePage />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/admin/*" element={<AdminPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/rules" element={<RulesPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
