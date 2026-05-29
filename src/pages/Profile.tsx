import { useState } from "react";
import React from "react";
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { User, ShieldCheck, Trophy, IdCard, Save, Smartphone, Star, Zap, Target, Medal, Flame, Info, Scan, Loader2, UploadCloud, Users, Bomb, Heart } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { GoogleGenAI } from "@google/genai";

const AchievementBadge = ({ icon: Icon, label, color }: { icon: any, label: string, color: string }) => (
  <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-2 group transition-all hover:bg-white/10`}>
     <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color} shadow-lg group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5 text-white" />
     </div>
     <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 text-center">{label}</span>
  </div>
);

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const [ffIgn, setFfIgn] = useState(profile?.ffIgn || "");
  const [ffUid, setFfUid] = useState(profile?.ffUid || "");
  const [contactId, setContactId] = useState(profile?.contactId || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  React.useEffect(() => {
    if (profile) {
      if (profile.ffIgn) setFfIgn(profile.ffIgn);
      if (profile.ffUid) setFfUid(profile.ffUid);
      if (profile.contactId) setContactId(profile.contactId);
    }
  }, [profile]);

  const kdRatio = profile?.matchesPlayed ? ((profile.kills || 0) / profile.matchesPlayed).toFixed(2) : "0.00";
  const winRate = profile?.matchesPlayed ? (((profile.victories || 0) / profile.matchesPlayed) * 100).toFixed(1) : "0.0";
  const currentXp = profile?.xp || 0;
  const nextLevelXp = (profile?.level || 1) * 100;
  const xpProgress = (currentXp % 100);

  const handleUpdate = async () => {
    if (!user) return;
    if (!ffIgn.trim() || !ffUid.trim()) {
      toast.error("Enter your tactical identifiers.");
      return;
    }

    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        ffIgn,
        ffUid,
        contactId: contactId.trim()
      });
      toast.success("Profile clearance updated.");
    } catch (err: any) {
      toast.error("Calibration failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncProfile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!user) {
      toast.error("Authentication required.");
      return;
    }

    setIsSyncing(true);
    toast.info("Analyzing Free Fire profile screenshot...");

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const base64Data = (event.target?.result as string).split(",")[1];
        // Note: Make sure VITE_GEMINI_API_KEY is available in the environment config or use process.env mapping
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY || (window as any).process?.env?.GEMINI_API_KEY || 'AIzaSyCi9DdTfYpEhca2-yWNky6oFXEFJmFg_XQ';
        if (!apiKey) {
           throw new Error("AI Vision key not configured. Cannot synchronize.");
        }
        
        const ai = new GoogleGenAI({ apiKey });
        
        const promptString = "Analyze this Free Fire profile screenshot. Extract the player's IGN (In-Game Name), UID, Level, total matches played, total wins (victories), and total kills. Return ONLY a valid JSON object with the following strictly typed structure (use numeric values for all stats except ign/uid): { \"ffIgn\": string, \"ffUid\": string, \"level\": number, \"matchesPlayed\": number, \"victories\": number, \"kills\": number }. Do not include markdown formatting or extra text.";

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
        const jsonMatch = text.match(/```json\n([\s\S]*)\n```/) || text.match(/{[\s\S]*}/);

        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          if (data.ffIgn || data.ffUid) {
             setFfIgn(data.ffIgn || ffIgn);
             setFfUid(data.ffUid || ffUid);
             
             await updateDoc(doc(db, "users", user.uid), {
               ffIgn: data.ffIgn || ffIgn,
               ffUid: data.ffUid || ffUid,
               level: data.level || profile?.level || 1,
               matchesPlayed: data.matchesPlayed || profile?.matchesPlayed || 0,
               victories: data.victories || profile?.victories || 0,
               kills: data.kills || profile?.kills || 0,
             });

             toast.success("AI Sync Complete: Profile data updated automatically!");
          } else {
             throw new Error("Could not detect profile details from this image.");
          }
        } else {
          throw new Error("Could not parse AI response.");
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to analyze screenshot.");
        console.error(err);
      } finally {
        setIsSyncing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="mb-12 relative overflow-hidden p-8 rounded-3xl border border-subtle glass">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#ff4d00]/5 blur-[100px] rounded-full" />
        <div className="flex flex-col md:flex-row items-center gap-8 relative">
          <div className="w-24 h-24 rounded-3xl border-2 border-[#ff4d00] p-1 glass relative group shrink-0">
             <div className="absolute inset-0 bg-[#ff4d00]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center relative shadow-2xl">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-500" />
                )}
             </div>
             <div className="absolute -bottom-2 -right-2 bg-[#ff4d00] text-black w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs border-2 border-black">
                {profile?.level || 1}
             </div>
          </div>
          <div className="flex-1 w-full">
            <div className="flex items-center gap-3 mb-1 justify-center md:justify-start">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase italic">{profile?.displayName}</h1>
              {profile?.role === 'admin' && (
                <Badge className="bg-primary/20 text-primary border-primary/30 uppercase text-[8px] tracking-widest font-black">COMMANDER</Badge>
              )}
            </div>
            <p className="text-slate-500 font-mono text-sm text-center md:text-left">{profile?.email}</p>
            
            <div className="mt-6 space-y-2">
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Level Protocol Progress</span>
                  <span className="text-white italic">{xpProgress}/100 XP</span>
               </div>
               <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-primary transition-all duration-700" style={{ width: `${xpProgress}%` }} />
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Gaming Profile */}
        <div className="glass rounded-2xl p-8 border-subtle relative overflow-hidden card-glow h-full">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
               <Smartphone className="w-5 h-5 accent-text" />
               <h2 className="text-sm font-black uppercase tracking-widest text-white">Credentials (তথ্য)</h2>
             </div>
             <div className="relative">
                <Input 
                   type="file"
                   accept="image/*"
                   onChange={handleSyncProfile}
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                   disabled={isSyncing}
                />
                <Button 
                   variant="outline" 
                   size="sm" 
                   className="h-8 text-[9px] uppercase font-black tracking-widest border-[#ff4d00]/30 text-[#ff4d00]"
                   disabled={isSyncing}
                >
                   {isSyncing ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Scan className="w-3 h-3 mr-2" />}
                   {isSyncing ? "Syncing..." : "Auto Sync UI"}
                </Button>
             </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Free Fire IGN (নাম)</Label>
              <Input 
                placeholder="Ex: TACTICAL_SNIPER"
                value={ffIgn}
                onChange={(e) => setFfIgn(e.target.value)}
                className="h-12 bg-black/40 border-slate-800 focus:border-[#ff4d00]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Free Fire UID (আইডি)</Label>
              <Input 
                placeholder="Ex: 582910394"
                value={ffUid}
                onChange={(e) => setFfUid(e.target.value)}
                className="h-12 bg-black/40 border-slate-800 focus:border-[#ff4d00]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Contact Info / ID (যোগাযোগের মাধ্যম - WhatsApp/TG/Phone)</Label>
              <Input 
                placeholder="Ex: WhatsApp +88017XXXXXXXX or Telegram @username"
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="h-12 bg-black/40 border-slate-800 focus:border-[#ff4d00]"
              />
            </div>
            <Button 
              disabled={isSaving || isSyncing}
              onClick={handleUpdate}
              className="w-full h-12 rounded-xl accent-bg text-black font-black uppercase text-[11px] tracking-[0.2em] shadow-lg shadow-[#ff4d00]/20 active:scale-95 transition-all"
            >
              {isSaving ? "SAVING..." : "UPDATE PROFILE (সেভ করুন)"}
            </Button>
          </div>
        </div>

        {/* Reputation Stats */}
        <div className="glass rounded-2xl p-8 border-subtle relative overflow-hidden card-glow h-full">
           <div className="flex items-center gap-3 mb-8">
             <Trophy className="w-5 h-5 text-emerald-400" />
             <h2 className="text-sm font-black uppercase tracking-widest text-white">Tactical Reputation (রেপুটেশন)</h2>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center group transition-colors hover:bg-white/10">
                 <span className="text-2xl font-black italic">{profile?.matchesPlayed || 0}</span>
                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Tournaments</span>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center group transition-colors hover:bg-white/10">
                 <span className="text-2xl font-black italic text-emerald-400">{winRate}%</span>
                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Win Rate (জয়)</span>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center group transition-colors hover:bg-white/10">
                 <span className="text-2xl font-black italic text-[#ff4d00]">{kdRatio}</span>
                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">K/D Ratio</span>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center group transition-colors hover:bg-white/10">
                 <span className="text-2xl font-black italic text-blue-400">৳{profile?.totalWinnings || 0}</span>
                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Winnings (জাতীয়)</span>
              </div>
           </div>

           <div className="mt-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                 <Medal className="w-3 h-3 text-amber-500" /> Achievement Badges (ব্যাজ)
              </h3>
              <div className="grid grid-cols-3 gap-3">
                 <AchievementBadge icon={Target} label="Sniper" color="bg-amber-600/40" />
                 <AchievementBadge icon={Zap} label="Rusher" color="bg-blue-600/40" />
                 <AchievementBadge icon={Medal} label="Pro" color="bg-purple-600/40" />
                  <AchievementBadge icon={Users} label="Supporter" color="bg-teal-600/40" />
                  <AchievementBadge icon={Bomb} label="Bomber" color="bg-red-600/40" />
                  <AchievementBadge icon={Heart} label="Healer" color="bg-rose-500/40" />
              </div>
           </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-[#ff4d00]/5 border border-[#ff4d00]/10 rounded-xl max-w-sm">
         <p className="text-[10px] leading-relaxed text-slate-400 italic">
           Stats are synchronized after match conclusion by Command.
         </p>
      </div>
    </div>
  );
}
