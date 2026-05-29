import { useState, useEffect } from "react";
import React from "react";
import { useAuth } from "@/lib/auth";
import { db, handleFirestoreError } from "@/lib/firebase";
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp, doc, runTransaction } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet as WalletIcon, History, AlertCircle, CheckCircle2, XCircle, Clock, UploadCloud, Smartphone, HelpCircle, PhoneCall, Send, Users as UsersIcon, Trophy, Plus, ArrowDownLeft, ArrowUpRight, Filter, LogOut, Copy } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { safeFormat } from "@/lib/utils";

export default function WalletPage() {
  const { user, profile } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bKash");
  const [trxId, setTrxId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [settings, setSettings] = useState<any>(null);

  // Withdraw states
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("bKash");
  const [withdrawNumber, setWithdrawNumber] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleCopy = (text: string, label: string = "Number") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard: ${text}`);
  };

  const combineTransactions = () => {
    const all = [
      ...payments.map(p => ({ ...p, type: 'deposit' })),
      ...withdrawals.map(w => ({ ...w, type: 'withdrawal' }))
    ].sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });

    return all.filter(t => {
      if (filter === 'all') return true;
      if (filter === 'deposits') return t.type === 'deposit';
      if (filter === 'withdrawals') return t.type === 'withdrawal';
      
      let unifiedStatus = 'rejected';
      if (t.type === 'deposit') {
         unifiedStatus = t.status === 'approved' ? 'completed' : t.status === 'pending' ? 'pending' : 'rejected';
      } else {
         unifiedStatus = (t.status === 'sent' || t.status === 'approved') ? 'completed' : (t.status === 'processing' || t.status === 'pending') ? 'pending' : 'rejected';
      }

      if (filter === 'pending') return unifiedStatus === 'pending';
      if (filter === 'completed') return unifiedStatus === 'completed';
      if (filter === 'rejected') return unifiedStatus === 'rejected';

      return true;
    });
  };

  const filteredTransactions = combineTransactions();

  useEffect(() => {
    if (!user) return;
    const wQ = query(collection(db, "withdrawals"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsubW = onSnapshot(wQ, (snap) => setWithdrawals(snap.docs.map(d => ({ id: d.id, ...d.data() }))), (err) => handleFirestoreError(err, 'list', 'withdrawals'));

    const pQ = query(collection(db, "payments"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsubP = onSnapshot(pQ, (snap) => setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() }))), (err) => handleFirestoreError(err, 'list', 'payments'));

    return () => { unsubW(); unsubP(); };
  }, [user]);

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "agent"));
    const unsub = onSnapshot(q, (snap) => {
      setAgents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => handleFirestoreError(err, 'list', 'users'));
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, "system", "settings"), (snap) => {
      if (snap.exists()) {
        setSettings(snap.data());
      }
    }, (err) => handleFirestoreError(err, 'get', 'system/settings'));
    return () => unsubSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!amount || !trxId || !senderNumber) return toast.error("Please fill all tactical data fields.");

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "payments"), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        amount: Number(amount),
        method,
        senderNumber,
        transactionId: trxId,
        status: "pending",
        createdAt: serverTimestamp()
      });
      toast.success("Deposit clearance request transmitted.");
      setAmount("");
      setTrxId("");
      setSenderNumber("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    if (!withdrawAmount || !withdrawNumber) return toast.error("Please fill all withdrawal fields.");

    const numAmount = Number(withdrawAmount);
    if (numAmount < 50) return toast.error("Minimum withdrawal is 50 BDT.");
    if (numAmount > profile.balance) return toast.error("Insufficient balance.");

    setIsWithdrawing(true);
    try {
      await runTransaction(db, async (tx) => {
        const uRef = doc(db, "users", user.uid);
        const uSnap = await tx.get(uRef);
        if (!uSnap.exists()) throw new Error("User not found.");

        const currentBalance = uSnap.data().balance || 0;
        if (numAmount > currentBalance) throw new Error("Insufficient balance.");

        tx.update(uRef, { balance: currentBalance - numAmount });

        const wRef = doc(collection(db, "withdrawals"));
        tx.set(wRef, {
          userId: user.uid,
          userEmail: user.email,
          userName: profile.displayName || user.displayName || "Unknown",
          amount: numAmount,
          method: withdrawMethod,
          number: withdrawNumber,
          accountNumber: withdrawNumber,
          phoneNumber: withdrawNumber,
          status: "pending",
          createdAt: serverTimestamp()
        });
      });

      toast.success("Withdrawal request transmitted successfully.");
      setWithdrawAmount("");
      setWithdrawNumber("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
      {/* Wallet Summary & Recharge Form */}
      <div className="md:col-span-12 lg:col-span-12 space-y-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass rounded-3xl p-8 border-emerald-500/20 relative overflow-hidden card-glow bg-emerald-500/5 col-span-1 md:col-span-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 -mr-16 -mt-16 rounded-full blur-3xl" />
            <h2 className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] mb-2 flex items-center gap-2">
               <WalletIcon className="w-3 h-3 text-emerald-400" /> Command Balance (ব্যালেন্স)
            </h2>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl md:text-6xl font-black text-emerald-400 font-mono tracking-tighter">
                ৳{profile?.balance?.toLocaleString() || '0'}
              </span>
              <span className="text-xl font-bold text-slate-600 uppercase italic">BDT</span>
            </div>
          </div>

          <div className="glass rounded-3xl p-8 border-subtle relative overflow-hidden bg-blue-500/5 col-span-1">
            <h2 className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] mb-2 flex items-center gap-2">
               <Trophy className="w-3 h-3 text-blue-400" /> Total Bounty (মোট আয়)
            </h2>
            <div className="flex items-baseline gap-2">
               <span className="text-4xl md:text-5xl font-black text-blue-400 font-mono tracking-tighter">
                 ৳{profile?.totalWinnings || 0}
               </span>
               <span className="text-xl font-bold text-slate-600 uppercase italic">BDT</span>
            </div>
          </div>

          <div className="glass rounded-3xl p-8 border-subtle relative overflow-hidden bg-amber-500/5 col-span-1">
            <h2 className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] mb-2 flex items-center gap-2">
               <History className="w-3 h-3 text-amber-400" /> Active Operations
            </h2>
            <div className="flex items-baseline gap-2">
               <span className="text-4xl md:text-5xl font-black text-amber-400 font-mono tracking-tighter">
                 {profile?.matchesPlayed || 0}
               </span>
               <span className="text-xl font-bold text-slate-600 uppercase italic">Missions</span>
            </div>
          </div>
        </div>
      </div>

      <div className="md:col-span-12 lg:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass rounded-3xl p-8 border-subtle flex flex-col space-y-6 card-glow">
          <h2 className="text-lg font-black italic tracking-tighter flex items-center gap-2 uppercase">
            <Plus className="w-5 h-5 text-primary" /> 
            Command Recharge (রিচার্জ)
          </h2>

          <div className="space-y-4">
             <div className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-[#E2136E]/20 flex items-center justify-center font-bold text-[#E2136E] text-[10px]">B</div>
                    <span className="text-xs font-bold text-slate-300 uppercase italic">bKash Personal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-white">{settings?.bkashNumber || "017XXXXXXXX"}</span>
                    {settings?.bkashNumber && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(settings.bkashNumber, "bKash personal number")}
                        className="w-7 h-7 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                        title="Copy bKash number"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-[#F7941D]/20 flex items-center justify-center font-bold text-[#F7941D] text-[10px]">N</div>
                    <span className="text-xs font-bold text-slate-300 uppercase italic">Nagad Personal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-white">{settings?.nagadNumber || "019XXXXXXXX"}</span>
                    {settings?.nagadNumber && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(settings.nagadNumber, "Nagad personal number")}
                        className="w-7 h-7 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                        title="Copy Nagad number"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
             </div>

             <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Payment Method</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setMethod('bKash')}
                      className={`flex items-center justify-center p-3 rounded-xl border-2 transition-all ${method === 'bKash' ? 'border-[#ff4d00] bg-[#ff4d00]/5' : 'border-slate-800 bg-white/5 hover:border-slate-700'}`}
                    >
                      <span className="font-bold text-[#E2136E]">bKash</span>
                    </button>
                    <button 
                      onClick={() => setMethod('Nagad')}
                      className={`flex items-center justify-center p-3 rounded-xl border-2 transition-all ${method === 'Nagad' ? 'border-[#ff4d00] bg-[#ff4d00]/5' : 'border-slate-800 bg-white/5 hover:border-slate-700'}`}
                    >
                      <span className="font-bold text-[#F7941D]">Nagad</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Transaction Amount (BDT)</Label>
                  <Input 
                    type="number"
                    placeholder="Ex: 500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-12 bg-black/40 border-slate-800 focus:border-[#ff4d00] focus:ring-[#ff4d00]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Sender Phone Number</Label>
                  <Input 
                    placeholder="Ex: 017XXXXXXXX"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    className="h-12 bg-black/40 border-slate-800 focus:border-[#ff4d00] focus:ring-[#ff4d00]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Transaction ID</Label>
                  <Input 
                    placeholder="Ex: 9A2B3C4D5E"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    className="h-12 bg-black/40 border-slate-800 focus:border-[#ff4d00] focus:ring-[#ff4d00]/20"
                  />
                </div>

                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-[10px] leading-relaxed text-blue-300">
                    <strong className="block mb-1 text-blue-200">TACTICAL NOTE:</strong> Submit request after physical payment. Approval usually takes 10-15 minutes by Command.
                  </p>
                </div>
              </div>
          </div>

          <Button 
            disabled={isSubmitting}
            onClick={handleSubmit} 
            className="w-full h-12 rounded-xl accent-bg text-black font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-[#ff4d00]/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            {isSubmitting ? "TRANSMITTING..." : "SUBMIT RECHARGE"}
          </Button>
        </div>

        <div className="glass rounded-3xl p-8 border-subtle flex flex-col space-y-6 card-glow bg-rose-500/5">
          <h2 className="text-lg font-black italic tracking-tighter flex items-center gap-2 uppercase">
            <LogOut className="w-5 h-5 text-rose-500" /> 
            Withdraw Funds (উত্তোলন)
          </h2>

          <div className="space-y-4 flex-1">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Withdraw Method</Label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setWithdrawMethod('bKash')}
                  className={`flex items-center justify-center p-3 rounded-xl border-2 transition-all ${withdrawMethod === 'bKash' ? 'border-[#ff4d00] bg-[#ff4d00]/5' : 'border-slate-800 bg-white/5 hover:border-slate-700'}`}
                >
                  <span className="font-bold text-[#E2136E]">bKash</span>
                </button>
                <button 
                  onClick={() => setWithdrawMethod('Nagad')}
                  className={`flex items-center justify-center p-3 rounded-xl border-2 transition-all ${withdrawMethod === 'Nagad' ? 'border-[#ff4d00] bg-[#ff4d00]/5' : 'border-slate-800 bg-white/5 hover:border-slate-700'}`}
                >
                  <span className="font-bold text-[#F7941D]">Nagad</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Withdraw Amount (BDT)</Label>
              <Input 
                type="number"
                placeholder="Min: 50"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="h-12 bg-black/40 border-slate-800 focus:border-[#ff4d00] focus:ring-[#ff4d00]/20"
              />
              <p className="text-[10px] text-slate-500 font-bold">Minimum withdraw amount is ৳50</p>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Receiving Phone Number</Label>
              <Input 
                placeholder="Ex: 017XXXXXXXX"
                value={withdrawNumber}
                onChange={(e) => setWithdrawNumber(e.target.value)}
                className="h-12 bg-black/40 border-slate-800 focus:border-[#ff4d00] focus:ring-[#ff4d00]/20"
              />
            </div>
            
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-[10px] leading-relaxed text-amber-300">
                <strong className="block mb-1 text-amber-200">WITHDRAWAL POLICY:</strong> Funds will be transferred to your selected mobile banking account typically within 24 hours.
              </p>
            </div>
          </div>

          <Button 
            disabled={isWithdrawing}
            onClick={handleWithdrawSubmit} 
            className="w-full h-12 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-rose-500/20 hover:scale-[1.02] active:scale-95 transition-all mt-auto"
          >
            {isWithdrawing ? "PROCESSING..." : "SUBMIT WITHDRAWAL"}
          </Button>
        </div>
      </div>

      {/* History Table */}
      <div className="md:col-span-12 lg:col-span-12 space-y-8">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center space-x-3">
              <History className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em]">Transaction History</h2>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                <Button 
                  variant="ghost" size="sm" 
                  onClick={() => setFilter('all')}
                  className={`h-7 px-3 text-[10px] uppercase font-bold rounded-lg transition-all ${filter === 'all' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white'}`}
                >
                  All
                </Button>
                <Button 
                  variant="ghost" size="sm" 
                  onClick={() => setFilter('deposits')}
                  className={`h-7 px-3 text-[10px] uppercase font-bold rounded-lg transition-all ${filter === 'deposits' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white'}`}
                >
                  <ArrowDownLeft className="w-3 h-3 mr-1" /> Deposits
                </Button>
                <Button 
                  variant="ghost" size="sm" 
                  onClick={() => setFilter('withdrawals')}
                  className={`h-7 px-3 text-[10px] uppercase font-bold rounded-lg transition-all ${filter === 'withdrawals' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white'}`}
                >
                  <ArrowUpRight className="w-3 h-3 mr-1" /> Withdrawals
                </Button>
              </div>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 hidden sm:flex">
                <Button 
                  variant="ghost" size="sm" 
                  onClick={() => setFilter('pending')}
                  className={`h-7 px-3 text-[10px] uppercase font-bold rounded-lg transition-all ${filter === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white'}`}
                >
                  Pending
                </Button>
                <Button 
                  variant="ghost" size="sm" 
                  onClick={() => setFilter('completed')}
                  className={`h-7 px-3 text-[10px] uppercase font-bold rounded-lg transition-all ${filter === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
                >
                  Completed
                </Button>
                <Button 
                  variant="ghost" size="sm" 
                  onClick={() => setFilter('rejected')}
                  className={`h-7 px-3 text-[10px] uppercase font-bold rounded-lg transition-all ${filter === 'rejected' ? 'bg-red-500/20 text-red-500' : 'text-slate-400 hover:text-white'}`}
                >
                  Rejected
                </Button>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl border-subtle overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader className="bg-white/5">
                <TableRow className="border-subtle hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-6 py-4">Type / Method</TableHead>
                  <TableHead className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-6 py-4">Status</TableHead>
                  <TableHead className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-6 py-4">Amount</TableHead>
                  <TableHead className="text-[10px] uppercase font-black text-slate-500 tracking-widest px-6 py-4 text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((t) => (
                  <TableRow key={t.id} className="border-subtle hover:bg-white/5 transition-colors">
                    <TableCell className="px-6 py-4 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-[10px] ${t.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {t.type === 'deposit' ? <ArrowDownLeft className="w-4 h-4"/> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold uppercase">{t.type} - {t.method}</span>
                        {(t.senderNumber || t.number || t.phoneNumber) && (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400 font-mono">No: {t.senderNumber || t.number || t.phoneNumber}</span>
                            <button
                              onClick={() => handleCopy(t.senderNumber || t.number || t.phoneNumber, "Phone number")}
                              className="p-0.5 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-all"
                              title="Copy Number"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        {t.transactionId && (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-mono text-slate-500 truncate max-w-[120px]">Trx: {t.transactionId}</span>
                            <button
                              onClick={() => handleCopy(t.transactionId, "Transaction ID")}
                              className="p-0.5 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-all"
                              title="Copy Transaction ID"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {((t.type === 'deposit' && t.status === 'approved') || (t.type === 'withdrawal' && (t.status === 'sent' || t.status === 'approved'))) ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-tighter">
                          Completed
                        </span>
                      ) : ((t.type === 'deposit' && t.status === 'pending') || (t.type === 'withdrawal' && (t.status === 'processing' || t.status === 'pending'))) ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-tighter">
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-tighter">
                          Rejected
                        </span>
                      )}
                    </TableCell>
                    <TableCell className={`px-6 py-4 font-mono font-bold text-sm ${t.type === 'deposit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                       {t.type === 'deposit' ? '+' : '-'}৳{t.amount}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-tighter">
                        {safeFormat(t.createdAt, 'dd MMM yyyy')}
                      </span>
                      <span className="text-[10px] text-slate-600 block">
                        {safeFormat(t.createdAt, 'HH:mm')}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-60 text-center">
                      <Filter className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs italic">No transactions found.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Tactical Agent Network */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UsersIcon className="w-5 h-5 accent-text" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em]">Tactical Agent Network</h2>
            </div>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-none font-black text-[8px] tracking-widest uppercase">Direct Recharge</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {agents.map(agent => (
              <div key={agent.id} className="glass p-4 rounded-xl border-subtle relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 -mr-8 -mt-8 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
                <div className="flex items-start justify-between relative">
                  <div className="space-y-1">
                    <div className="font-black text-xs uppercase tracking-tighter">{agent.displayName}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase italic">Official Field Agent</div>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[8px] font-black uppercase tracking-tighter">Active</Badge>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-[10px] font-black uppercase h-8 border-white/5 bg-white/5 hover:bg-white/10" onClick={() => window.open(`tel:${agent.phone || '0123456789'}`)}>
                    <PhoneCall className="w-3 h-3 mr-2" /> Call
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-[10px] font-black uppercase h-8 border-white/5 bg-white/5 hover:bg-white/10" onClick={() => window.open(`https://wa.me/${agent.phone || '0123456789'}`)}>
                    <Send className="w-3 h-3 mr-2 text-emerald-500" /> WhatsApp
                  </Button>
                </div>
              </div>
            ))}
            {agents.length === 0 && (
              <div className="col-span-full p-8 border border-dashed border-slate-800 rounded-xl text-center italic text-slate-500 text-xs uppercase font-bold tracking-widest">
                No active field agents detected in this sector.
              </div>
            )}
          </div>

          <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
             <div className="flex gap-3">
                <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-[10px] font-medium leading-relaxed text-amber-200/60 uppercase tracking-tighter">
                  Agents provide instant manual top-ups. Ensure you verify the agent identity before participating in direct physical currency exchanges.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
