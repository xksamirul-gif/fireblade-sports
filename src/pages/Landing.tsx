import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  Gamepad2, 
  Flame, 
  Smartphone, 
  ArrowRight, 
  Trophy, 
  ShieldCheck, 
  Zap, 
  Users, 
  Download, 
  HelpCircle, 
  CheckCircle, 
  Calendar, 
  PhoneCall, 
  Coins, 
  MessagesSquare, 
  Clock,
  Play,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const features = [
    {
      icon: <Gamepad2 className="w-6 h-6 text-[#ff4d00]" />,
      title: "Active Esports Grid",
      desc: "Daily tournaments for Free Fire and popular squads. View active maps, full prize pools, and live slot status.",
      titleBn: "সক্রিয় টুর্নামেন্ট গ্রিড"
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      title: "ID & Password Delivery",
      desc: "Instant delivery of Room ID and password directly on the secure player portal as soon as lobbies are initialized.",
      titleBn: "ইনস্ট্যান্ট আইডি - পাসওয়ার্ড"
    },
    {
      icon: <Coins className="w-6 h-6 text-emerald-400" />,
      title: "Guaranteed Withdrawals",
      desc: "Integrated with local secure providers (bKash & Nagad). Safe withdrawal of tournament earnings within 24 hours.",
      titleBn: "নিরাপদ উইথড্রয়াল"
    },
    {
      icon: <Trophy className="w-6 h-6 text-yellow-400" />,
      title: "Global Guild Leaderboard",
      desc: "Earn XP with every match win and rising rank. Secure your spot on the top list for custom weekly airdrops.",
      titleBn: "গ্লোবাল লিডারবোর্ড"
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-blue-400" />,
      title: "Anti-Cheat Enforcement",
      desc: "Manual review of end-screen results and operative verification of Match IGNs to prevent system manipulation.",
      titleBn: "অ্যান্টি-চিট পলিসি"
    },
    {
      icon: <MessagesSquare className="w-6 h-6 text-purple-400" />,
      title: "24/7 Command Support",
      desc: "Direct support center integration. Modify IDs dynamically or chat with human handlers via WhatsApp or Messenger.",
      titleBn: "২৪/৭ লাইভ সাপোর্ট"
    }
  ];

  const playStoreSteps = [
    {
      step: "01",
      title: "APK Production Complete",
      desc: "The native React Native / Kotlin build is fully packaged and undergoes sandbox testing.",
      status: "COMPLETED"
    },
    {
      step: "02",
      title: "Play Console Verification",
      desc: "App bundle uploaded to Google Play Developer Console for review policies.",
      status: "UNDER REVIEW"
    },
    {
      step: "03",
      title: "Play Store Release v1.0",
      desc: "Launch of official build with premium match sound cues, push notifications, and lock-screen widgets.",
      status: "COMING SOON"
    }
  ];

  const faqs = [
    {
      q: "Can I join matches and withdraw BDT right now without the Playstore app?",
      a: "Yes! Our Web Platform is 100% operational. You can register, deposit, join matches, view room details, and withdraw earnings. All data syncs flawlessly when the Android app launches."
    },
    {
      q: "How does the bKash and Nagad withdrawal system work?",
      a: "Simply request an extraction from the Wallet. Enter your personal cashout number and the BDT amount. The administrative core verify transactions and process payouts within 24 hours."
    },
    {
      q: "Do I get push notifications for Room ID & Password?",
      a: "On the web application, we offer live reactive notifications directly via the Header alert center. When our native Playstore application arrives, you will receive native push alerts."
    }
  ];

  return (
    <div className="min-h-screen bg-[#07080b] text-[#e2e8f0] relative overflow-hidden font-sans">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-[#ff4d00]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[-150px] w-96 h-96 bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[180px] pointer-events-none" />

      {/* Hero Header */}
      <header className="border-b border-white/5 py-4 px-6 md:px-12 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#ff4d00] rounded-xl flex items-center justify-center font-black text-black text-lg shadow-[0_0_20px_rgba(255,77,0,0.3)]">
              F
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-widest text-[#ff4d00] uppercase text-xs leading-none">FIREBLADE</span>
              <span className="text-[8px] uppercase tracking-wider font-bold text-slate-500 mt-0.5">Official Web Launchpad</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/tournaments">
              <Button className="accent-bg text-black font-black uppercase tracking-wider text-[10px] h-9 px-4 rounded-xl shadow-lg shadow-[#ff4d00]/10 hover:scale-105 active:scale- scale-100 transition-all">
                Launch Web App
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-12 pb-20 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#ff4d00] animate-pulse" />
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Android App In Submission Stage</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tight text-white leading-none">
                THE PREMIER <span className="text-[#ff4d00] not-italic font-extrabold">ESPORTS</span> GROUND FOR MOBILE GAMERS
              </h1>
              <p className="text-xs md:text-sm text-slate-300 font-bold uppercase tracking-wider leading-relaxed">
                উইথড্রয়াল এবং ডিপোজিট সরাসরি bKash & Nagad-এ!
              </p>
              <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-xl">
                We are currently expanding our ecosystem! While we fine-tune our forthcoming Android app for Play Store deployment, we have built a **fully integrated Web Portal**. Register, top up, join tournament maps, view instant Room keys, and cashout your winnings immediately on this secure dashboard.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/tournaments">
                <Button className="w-full sm:w-auto h-12 px-8 rounded-xl accent-bg text-black font-extrabold uppercase tracking-widest text-xs shadow-[0_0_25px_rgba(255,77,0,0.25)] hover:scale-[1.03] transition-all flex items-center justify-center gap-2">
                  <Gamepad2 className="w-4 h-4" /> Enter Live Web App
                </Button>
              </Link>
              <a href="#playstore">
                <Button variant="outline" className="w-full sm:w-auto h-12 px-8 rounded-xl border-white/10 text-white font-extrabold uppercase tracking-widest text-xs bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" /> Playstore Blueprint
                </Button>
              </a>
            </div>

            <div className="flex flex-wrap gap-6 pt-6 border-t border-white/5 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
              <div className="flex items-center gap-2">
                <span className="text-[#ff4d00] text-sm">৳</span> Guaranteed Payouts
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> bKash & Nagad Active
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-blue-500" /> Direct Admin Command
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            {/* Visual Mobile Mockup Representation */}
            <div className="w-full max-w-[340px] mx-auto bg-black/60 border border-white/10 p-4 rounded-[40px] shadow-[0_0_50px_rgba(255,77,0,0.1)] relative">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black border-b border-white/10 rounded-b-3xl z-20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-800" />
              </div>
              
              <div className="bg-[#090a0d] rounded-[32px] overflow-hidden border border-white/5 p-4 min-h-[460px] flex flex-col justify-between">
                <div className="space-y-4 pt-4">
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#ff4d00] animate-ping" />
                      <span className="text-[8px] font-black tracking-widest uppercase text-[#ff4d00]">Match Dispatch</span>
                    </div>
                    <span className="text-[7px] font-mono text-slate-500">2 Mins Ago</span>
                  </div>

                  <div className="bg-gradient-to-br from-[#12141c] to-[#090a0d] p-4 rounded-3xl border border-white/5 space-y-3 relative overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 rounded-full bg-[#ff4d00]/10 text-[#ff4d00] text-[7px] font-black uppercase tracking-widest">SOLO FLIGHT</span>
                      <span className="text-[8px] font-mono text-emerald-400">Entry: ৳20</span>
                    </div>
                    <h3 className="text-sm font-black uppercase text-white tracking-wide">BERMUDA SPECIAL FLIGHT</h3>
                    <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[7px] font-bold text-slate-400 uppercase tracking-tighter">
                      <div className="bg-white/5 p-1.5 rounded-lg border border-white/5">
                        <span className="text-white block font-mono text-[9px] mb-0.5">৳350</span> Total Pool
                      </div>
                      <div className="bg-white/5 p-1.5 rounded-lg border border-white/5">
                        <span className="text-white block font-mono text-[9px] mb-0.5">৳10</span> Per Kill
                      </div>
                      <div className="bg-white/5 p-1.5 rounded-lg border border-white/5">
                        <span className="text-white block font-mono text-[9px] mb-0.5">40/48</span> Slots
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex items-center justify-between text-[8px] font-bold uppercase tracking-wider">
                    <span className="text-slate-400">Tactical Payout:</span>
                    <span className="text-emerald-400 font-mono text-[9px]">bKash Verified ●</span>
                  </div>
                </div>

                <div className="pt-4 mt-8 border-t border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-[8px] text-slate-500 font-bold uppercase">
                    <span>Play Store Status</span>
                    <span className="text-amber-500">95% complete</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full w-[95%] bg-[#ff4d00]" />
                  </div>
                  <Button disabled size="sm" className="w-full h-8 bg-zinc-900 text-[8px] font-black uppercase text-zinc-500 tracking-widest border border-zinc-800">
                    <Download className="w-3 h-3 mr-1" /> Downloading Suspended
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compare Options */}
      <section className="bg-black/40 border-y border-white/5 py-16 px-6 md:px-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-12">
            <span className="text-[9px] font-black tracking-[0.3em] uppercase text-[#ff4d00]">DEPLOYMENT STATUS</span>
            <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-wide text-white">WEB VS NATIVE APP</h2>
            <p className="text-xs text-slate-400">Choose your entryway. Both connect to the exact same servers and wallet database.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-3xl border border-emerald-500/10 bg-emerald-500/[0.02] space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-emerald-400 font-black uppercase tracking-widest text-[9px] px-2.5 py-1 rounded bg-emerald-400/10">ONLINE & FULLY ACTIVE</span>
                <span className="text-xs font-mono font-bold text-emerald-400">RECOMMENDED</span>
              </div>
              <h3 className="text-xl font-black uppercase text-white tracking-wide">FIREBLADE WEB PLATFORM</h3>
              <p className="text-xs text-slate-400 leading-relaxed">No store installs required. Playable immediately on iPhone, Android, Laptop, or Tablet browsers. Connected database allows instant real-time interaction.</p>
              <ul className="text-xs text-slate-300 space-y-2 font-semibold uppercase tracking-wide">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Zero installation, play instantly</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Direct tournament lobby joining</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> bKash & Nagad Cashout full speed</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Real-time active chat & admin ticket tools</li>
              </ul>
              <div className="pt-4">
                <Link to="/tournaments" className="block">
                  <Button className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-black font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-emerald-600/10">
                    Deploy Browser Version
                  </Button>
                </Link>
              </div>
            </div>

            <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.01] space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-black uppercase tracking-widest text-[9px] px-2.5 py-1 rounded bg-white/5">IN CERTIFICATE AUDITS</span>
                <span className="text-xs font-mono font-bold text-amber-500">LAUNCHING LATER</span>
              </div>
              <h3 className="text-xl font-black uppercase text-white tracking-wide">NATIVE PLAYSTORE APP</h3>
              <p className="text-xs text-slate-400 leading-relaxed">We are packing premium Native components and notification hubs specifically tailored for low latency tournament schedules and real-time gaming push notifications.</p>
              <ul className="text-xs text-slate-400 space-y-2 font-semibold uppercase tracking-wide">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-slate-600 shrink-0" /> Push notifications with custom alert sounds</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-slate-600 shrink-0" /> Seamless Free Fire app switching</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-slate-600 shrink-0" /> Background battery optimizations</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-slate-600 shrink-0" /> Low data footprint grid updates</li>
              </ul>
              <div className="pt-4">
                <Button disabled className="w-full h-11 bg-zinc-800 text-zinc-500 border border-zinc-700 font-black uppercase tracking-widest text-[10px] rounded-xl cursor-not-allowed">
                  Play Store Registration Coming Soon
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-xl mx-auto space-y-2 mb-16">
          <span className="text-[9px] font-black tracking-[0.3em] uppercase text-[#ff4d00]">CORE OPERATIVE PROTOCOLS</span>
          <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-wide text-white">PLATFORM SPECIFICATIONS</h2>
          <p className="text-xs text-slate-400">Everything designed to support robust, fraud-free esports matches with guaranteed payment tracks.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-black/30 border border-white/5 rounded-2xl p-6 hover:border-[#ff4d00]/30 hover:bg-black/50 transition-all group duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {f.icon}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-wide text-white">{f.title}</h3>
                    <span className="text-[8px] font-bold text-slate-500 font-mono">STABLE</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase italic">{f.titleBn}</span>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed pt-2">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Play Store Blueprint */}
      <section id="playstore" className="py-20 px-6 md:px-12 bg-gradient-to-b from-transparent to-black/60 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-4 space-y-4">
              <span className="text-[9px] font-black tracking-[0.3em] uppercase text-[#ff4d00]">LAUNCH PIPELINE</span>
              <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-wide text-white">PLAYSTORE APPROVAL BLUEPRINT</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Esports apps handling wallet assets require rigorous certification. Here is our progressive deployment roadmap to Google Play Store release. Keep track of our progress!
              </p>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1 items-center text-center">
                <span className="text-[8px] font-black uppercase text-slate-400">ACTIVE BUILD RELEASE</span>
                <span className="text-sm font-mono font-black text-[#ff4d00]">v1.0.0-Beta (Browser Launch)</span>
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {playStoreSteps.map((s, index) => (
                <div key={index} className="bg-black/30 border border-white/10 rounded-2xl p-6 space-y-4 flex flex-col justify-between hover:border-white/20 transition-colors">
                  <div className="space-y-2">
                    <span className="text-3xl font-extrabold italic text-white/10 block">{s.step}</span>
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">{s.title}</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{s.desc}</p>
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest py-1 px-2.5 rounded w-fit ${
                    s.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400" :
                    s.status === "UNDER REVIEW" ? "bg-amber-500/10 text-amber-500" :
                    "bg-white/5 text-slate-500"
                  }`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ & Support Section */}
      <section className="py-20 px-6 md:px-12 max-w-4xl mx-auto relative z-10">
        <div className="text-center space-y-2 mb-12">
          <span className="text-[9px] font-black tracking-[0.3em] uppercase text-[#ff4d00]">INTEL BASE</span>
          <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-wide text-white">FREQUENTLY ASKED QUESTIONS</h2>
          <p className="text-xs text-slate-400">Clear operative guidelines regarding gameplay, account status, and play store migration.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="p-5 rounded-2xl bg-black/40 border border-white/5 hover:border-[#ff4d00]/20 transition-all">
              <h4 className="text-xs font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" /> {faq.q}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed pl-6">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-3xl border border-white/5 bg-gradient-to-r from-transparent via-[#ff4d00]/5 to-transparent text-center space-y-4">
          <h3 className="text-sm font-black uppercase text-white tracking-wide">NEED DIRECT SQUAD FEEDBACK?</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">Get in touch with the support center directly in our app to modify active details or double-check transactions.</p>
          <div className="flex justify-center gap-4">
            <Link to="/tournaments">
              <Button className="accent-bg text-black font-black uppercase text-[10px] tracking-wider rounded-xl h-10 px-6">
                Open Support Ticket In-App
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Foot Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-slate-500 font-bold uppercase tracking-wider text-[8px] bg-black/80 relative z-10">
        <p>© 2026 FIREBLADE ESPORTS CO. ALL RIGHTS RESERVED. POWERED BY CODE 11 FOR ULTRA SECURE OPERATIONS.</p>
        <p className="text-[7px] text-slate-600 mt-2">NOT ASSOCIATED WITH GARENA OFICIAL OF FREE FIRE OR GOOGLE PLAY STORE INC.</p>
      </footer>
    </div>
  );
}
