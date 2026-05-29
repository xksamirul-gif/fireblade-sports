import React, { useState } from "react";
import { submitSupportTicket } from "@/lib/communityService";
import { useAuth } from "@/lib/auth";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LifeBuoy, AlertCircle, Send } from "lucide-react";
import { toast } from "sonner";

export function SupportTicketForm() {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!subject.trim() || !message.trim()) {
      toast.error("Protocol violation: Subject and Message are mandatory.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitSupportTicket(user.uid, subject, message);
      setSubject("");
      setMessage("");
      setIsOpen(false);
    } catch (err) {
      // Error handled in service
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className="gap-2 border-subtle glass hover:border-primary/50 font-bold uppercase text-[10px] tracking-[0.2em]">
            <LifeBuoy className="w-3 h-3" /> SOS Protocol
          </Button>
        }
      />
      <DialogContent className="glass border-subtle sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="accent-text flex items-center gap-2 italic">
            <AlertCircle className="w-5 h-5" /> Emergency Frequency
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
            Report protocol violations or critical malfunctions to Command.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Incident Subject</Label>
            <Input 
              value={subject} 
              onChange={e => setSubject(e.target.value)} 
              placeholder="Ex: Deployment Failure, Wallet Glitch" 
              className="bg-black/40 border-white/10 h-12"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tactical Briefing</Label>
            <Textarea 
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              placeholder="Describe the anomaly in detail..." 
              className="bg-black/40 border-white/10 min-h-[120px] resize-none"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full h-12 accent-bg text-black font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20"
          >
            {isSubmitting ? "TRANSMITTING..." : "INITIATE EMERGENCY SIGNAL"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
