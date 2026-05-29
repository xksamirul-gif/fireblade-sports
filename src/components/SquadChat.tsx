import React, { useState, useRef, useEffect } from "react";
import { useMatchChat, sendChatMessage } from "@/lib/matchService";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Users, MessageSquare } from "lucide-react";
import { format } from "date-fns";

export function SquadChat({ matchId, matchTitle }: { matchId: string, matchTitle: string }) {
  const { user, profile } = useAuth();
  const messages = useMatchChat(matchId);
  const [msg, setMsg] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim() || !user || !profile) return;
    try {
      await sendChatMessage(matchId, user.uid, profile.displayName, msg);
      setMsg("");
    } catch (err) {}
  };

  return (
    <div className="flex flex-col h-[500px] glass rounded-3xl border-subtle overflow-hidden">
      <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest">{matchTitle} Squad Comms</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase italic">Sector Active</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">Live</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.userId === user?.uid ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">
              {m.userId === user?.uid ? 'Command' : m.userName}
            </span>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              m.userId === user?.uid 
                ? 'bg-primary text-black font-bold rounded-tr-none' 
                : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
            }`}>
              {m.message}
            </div>
            <span className="text-[8px] text-slate-600 mt-1 uppercase font-bold">
              {m.createdAt?.toDate ? format(m.createdAt.toDate(), 'HH:mm') : 'Syncing...'}
            </span>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-20 py-20 grayscale">
            <Users className="w-12 h-12 mb-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Silence across frequencies</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-black/40 border-t border-white/5 flex gap-2">
        <Input 
          value={msg} 
          onChange={(e) => setMsg(e.target.value)} 
          placeholder="Transmit tactical update..."
          className="bg-black/60 border-white/10 focus:border-primary h-11 text-xs"
        />
        <Button type="submit" size="icon" className="h-11 w-11 shrink-0 accent-bg text-black">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
