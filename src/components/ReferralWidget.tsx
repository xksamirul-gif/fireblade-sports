import { useAuth } from "@/lib/auth";
import { Copy, Users, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ReferralWidget() {
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!profile) return null;

  const copyCode = () => {
    navigator.clipboard.writeText(profile.referralCode || "");
    setCopied(true);
    toast.success("Designation code copied to clipboard.");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass p-6 rounded-3xl border-subtle relative overflow-hidden">
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="flex flex-col md:flex-row items-center gap-6 relative">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-primary" />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-200">Enlist New Operatives</h3>
          <p className="text-xs text-slate-500 mt-1">Both you and your recruit receive ৳5 bonus upon their first paid deployment.</p>
        </div>

        <div className="flex items-center gap-2 bg-black/40 border border-white/10 p-1 rounded-2xl">
          <div className="px-4 py-2 font-mono font-black text-primary tracking-[0.2em]">
            {profile.referralCode}
          </div>
          <Button 
            onClick={copyCode} 
            size="icon" 
            variant="ghost" 
            className="h-10 w-10 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
