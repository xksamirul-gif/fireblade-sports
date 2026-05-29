import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Ban, AlertTriangle, Scale, HelpCircle, FileText, Globe } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";

type Language = "en" | "bn";

export default function RulesPage() {
  const [lang, setLang] = useState<Language>("en");

  // Multilingual Strings
  const strings = {
    en: {
      directive: "Command Directives",
      titlePre: "Tactical",
      titlePost: "Rulebook",
      desc: "Adherence to these protocols is mandatory for all FireBlade operatives. Ignorance of the code is not an excuse for mission failure.",
      penaltyTitle: "Penalty Escalation",
      penaltySubtitle1: "Violations are met with immediate tactical termination.",
      penaltyStep1: "1. Warning & Disqualification (Minor Infraction)",
      penaltyStep2: "2. Asset Seizure (Intermediate Infraction)",
      penaltyStep3: "3. Sector Ban & Permanent Blacklist (Critical Breach)",
      disputeTitle: "Dispute Resolution",
      disputeDesc: "In case of conflict, combatants must provide clear tactical recording (Video Proof).",
      disputeAction: "Deploy a support ticket via the Tactical Hub on the Home page. All results approved by Command after 24H are non-reversible.",
      supportBtn: "Contact Support",
      faqTitle: "Common Tactical Questions",
      faqDesc: "Still uncertain? Consult with high-ranking operatives in the Global Squad Chat or initiate contact with Headquarters via the primary WhatsApp link.",
      sector: "Protocol Sector",
    },
    bn: {
      directive: "কমান্ড নির্দেশনাবলী",
      titlePre: "কৌশলগত",
      titlePost: "নিয়মাবলী",
      desc: "এই নিয়মগুলো মেনে চলা সকল ফায়ারব্লেড প্লেয়ারদের জন্য বাধ্যতামূলক। নিয়ম না জানা থাকলে বা অবহেলা করলে কোনো ছাড় দেওয়া হবে না।",
      penaltyTitle: "শাস্তি ও জরিমানা বৃদ্ধি",
      penaltySubtitle1: "যেকোনো নিয়ম লঙ্ঘন বা অসদাচরণের জন্য তাত্ক্ষণিক বহিষ্কার করা হবে।",
      penaltyStep1: "১. সতর্কবার্তা ও ডিসকোয়ালিফিকেশন (সাধারণ ভুল)",
      penaltyStep2: "২. পুরস্কার বা ব্যালেন্স বাজেয়াপ্তকরণ (মাঝারি অপরাধ)",
      penaltyStep3: "৩. পার্মানেন্ট ব্যান ও ব্ল্যাকলিস্ট (মারাত্মক নিয়মহানি)",
      disputeTitle: "বিরোধ নিষ্পত্তি ও প্রমাণ",
      disputeDesc: "যেকোনো মতবিরোধ ও দ্বন্দ্বের ক্ষেত্রে গেমারদের অবশ্যই স্পষ্ট স্ক্রিন রেকর্ডিং (ভিডিও প্রুফ) দেখাতে হবে।",
      disputeAction: "হোম পেজের টিকিট সেকশনে সাপোর্ট টিকিট খুলুন। ২৪ ঘণ্টা পর কমান্ড অনুমোদিত চূড়ান্ত ফলাফল পরিবর্তন অযোগ্য।",
      supportBtn: "সহায়তা নিন",
      faqTitle: "সাধারণ জিজ্ঞাসা",
      faqDesc: "এখনও সংশয় আছে? গ্লোবাল স্কোয়াড চ্যাটে অভিজ্ঞ প্লেয়ারদের সাথে আলোচনা করতে পারেন অথবা প্রধান হোয়াটসঅ্যাপ লিংকের মাধ্যমে সরাসরি সাহায্য নিন।",
      sector: "প্রোটোকল সেক্টর",
    }
  };

  const categories = [
    {
      titleEn: "Tactical Regulations",
      titleBn: "তীব্র যুদ্ধ নির্দেশনা",
      icon: ShieldCheck,
      color: "text-emerald-400",
      rules: [
        {
          titleEn: "Mobile Only",
          titleBn: "শুধু মোবাইল দিয়ে খেলতে হবে",
          descEn: "Use of Emulators, PCs, or tablets with third-party mapping is strictly forbidden. Tactical purity must be maintained.",
          descBn: "ইমুলেটর, পিসি বা থার্ড-পার্টি কি-ম্যাপিং সম্বলিত ফিজিক্যাল ট্যাবলেট ব্যবহার সম্পূর্ণ নিষিদ্ধ। শুধু মোবাইল অ্যাপ ব্যবহার করা যাবে।"
        },
        {
          titleEn: "Account Verification",
          titleBn: "অ্যাকাউন্ট ভেরিফিকেশন",
          descEn: "Operatives must be Level 40+ with a Clean History. Smurf accounts or suspicious activity will trigger immediate investigation.",
          descBn: "ইউজারদের অবশ্যই লেভেল ৪০+ এবং পরিচ্ছন্ন ট্র্যাক রেকর্ড থাকতে হবে। 'স্মার্ফ' অ্যাকাউন্ট বা সন্দেহজনক কার্যকলাপে রিফান্ড ছাড়া ব্যান করা হবে।"
        },
        {
          titleEn: "Slot Adherence",
          titleBn: "সঠিক স্লট দখল",
          descEn: "You MUST occupy the slot number assigned by Command. Failure to comply results in immediate kick without refund.",
          descBn: "আপনাকে অবশ্যই স্কোয়াড কাস্টম রুমে নির্ধারিত স্লট নাম্বারে বসতে হবে। অন্য স্লটে বসলে কোনো রিফাড ছাড়াই কিক দেওয়া হবে।"
        },
      ]
    },
    {
      titleEn: "Prohibited Actions",
      titleBn: "নিষিদ্ধ কার্যকলাপ সমূহ",
      icon: Ban,
      color: "text-red-500",
      rules: [
        {
          titleEn: "Mercenary Alliances",
          titleBn: "টিমিং বা কো-অপারেশন",
          descEn: "Formal or informal alliances (teaming) between separate squads result in permanent ban for all involved.",
          descBn: "আলাদা স্কোয়াডের মধ্যে খেলাকালীন কোনো অনানুষ্ঠানিক সমঝোতা বা টিমিং করার চেষ্টা প্রমাণিত হলে স্থায়ীভাবে ব্যান করা হবে।"
        },
        {
          titleEn: "Electronic Support (Hacks)",
          titleBn: "হ্যাক বা থার্ড পার্টি স্ক্রিপ্ট ব্যবহার",
          descEn: "Use of any software to manipulate game physics, visibility, or recoil leads to local and global banning.",
          descBn: "যেকোনো স্ক্রিপ্ট, হ্যাক সফটওয়্যার বা গেমের ভিজিবিলিটি/রিকয়েল পরিবর্তনকারী উপাদান ব্যবহারে অ্যাকাউন্ট ও ডিভাইস সাময়িকভাবে/স্থায়ীভাবে ব্যান করা হবে।"
        },
        {
          titleEn: "Intelligence Leakage",
          titleBn: "অপ্রিয় আইডি-পাস শেয়ারিং",
          descEn: "Sharing Room IDs/Passwords with non-registered operatives is considered high treason.",
          descBn: "রেজিস্ট্রেশন বা জয়েন করা ছাড়া বাইরের কারো সাথে কাস্টম রুম আইডি এবং পাসওয়ার্ড শেয়ার করা কঠোর শাস্তিযোগ্য অপরাধ।"
        },
      ]
    },
    {
      titleEn: "Financial Protocols",
      titleBn: "আর্থিক লেনদেন ও নিয়মাবলী",
      icon: Scale,
      color: "text-amber-500",
      rules: [
        {
          titleEn: "Entry Deductions",
          titleBn: "এন্ট্রি ফি নীতি",
          descEn: "Entry fees are non-refundable once the tactical countdown begins. Verify your availability before joining.",
          descBn: "ম্যাচ শুরুর সময় ঘনিয়ে আসলে বা কাউন্টডাউন শুরু হয়ে গেলে এন্ট্রি ফি রিফান্ড পাওয়া যাবে না। জয়েন করার পূর্বে সময় নিশ্চিত করুন।"
        },
        {
          titleEn: "Reward Extractions",
          titleBn: "পুরস্কার উত্তোলন",
          descEn: "Payouts are processed within 24 hours of combat verification. Use valid bKash/Nagad intel.",
          descBn: "ম্যাচ সফলভাবে শেষ ও যাচাইকরণের ২৪ ঘণ্টার মধ্যে রিওয়ার্ড বা পুরস্কার আপনার বিকাশ/নগদ নাম্বারে পাঠানো হবে।"
        },
        {
          titleEn: "Minimum Threshold",
          titleBn: "সর্বনিম্ন উইথড্র লিমিট",
          descEn: "Withdrawals allowed for balances of ৳50 BDT and above.",
          descBn: "আপনার ওয়ালেট ব্যালেন্স সর্বনিম্ন ৫০ টাকা বা তার বেশি হলে উইথড্র বা টাকা উত্তোলনের জন্য আবেদন করতে পারবেন।"
        },
      ]
    }
  ];

  const t = strings[lang];

  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-right-4 duration-700">
      
      {/* Header Container */}
      <div className="relative overflow-hidden p-8 md:p-12 rounded-[2.5rem] border border-white/5 glass group">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 blur-[120px] rounded-full group-hover:bg-primary/20 transition-all" />
        <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="max-w-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">{t.directive}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
              {t.titlePre} <span className="text-primary italic">{t.titlePost}</span>
            </h1>
            <p className="text-sm md:text-md text-slate-400 font-medium leading-relaxed">
              {t.desc}
            </p>
          </div>

          {/* Elegant Language Selector */}
          <div className="shrink-0 flex items-center gap-1.5 p-1.5 bg-black/40 rounded-2xl border border-white/10 self-start">
            <div className="p-1.5 text-slate-400">
              <Globe className="w-4 h-4" />
            </div>
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                lang === "en"
                  ? "bg-primary text-black font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang("bn")}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider transition-all ${
                lang === "bn"
                  ? "bg-primary text-black font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              বাংলা
            </button>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {categories.map((cat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="glass border-subtle h-full group hover:border-white/20 transition-all rounded-[2rem] flex flex-col justify-between">
              <CardHeader className="space-y-4">
                <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}>
                   <cat.icon className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-md font-black uppercase italic">
                    {lang === "en" ? cat.titleEn : cat.titleBn}
                  </CardTitle>
                  <CardDescription className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    {t.sector} 0{idx + 1}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-1 hierarchy-content">
                <div className="space-y-5">
                  {cat.rules.map((rule, rIdx) => (
                    <div key={rIdx} className="space-y-1">
                      <h4 className="text-xs font-black uppercase text-white tracking-widest">
                        {lang === "en" ? rule.titleEn : rule.titleBn}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400 leading-relaxed italic">
                        {lang === "en" ? rule.descEn : rule.descBn}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Enforcement & Help Center */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="glass border-subtle p-8 rounded-[2rem] bg-amber-500/5">
           <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                 <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-3">
                 <h3 className="text-lg font-black uppercase italic leading-none">{t.penaltyTitle}</h3>
                 <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase space-y-1">
                   <span>{t.penaltySubtitle1}</span>
                   <span className="block mt-2 text-amber-500">{t.penaltyStep1}</span>
                   <span className="block text-amber-500">{t.penaltyStep2}</span>
                   <span className="block text-amber-500/80">{t.penaltyStep3}</span>
                 </p>
              </div>
           </div>
        </Card>

        <Card className="glass border-subtle p-8 rounded-[2rem] bg-emerald-500/5">
           <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                 <Scale className="w-5 h-5" />
              </div>
              <div className="space-y-3 flex-1">
                 <h3 className="text-lg font-black uppercase italic leading-none">{t.disputeTitle}</h3>
                 <div className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase space-y-2">
                    <p className="text-emerald-400">{t.disputeDesc}</p>
                    <p className="text-slate-400">{t.disputeAction}</p>
                 </div>
                 <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-emerald-500/20 text-emerald-400 mt-2">
                   {t.supportBtn}
                 </Badge>
              </div>
           </div>
        </Card>
      </div>

      {/* Footnote footer */}
      <div className="p-8 glass border-subtle rounded-[2rem] text-center space-y-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all">
         <HelpCircle className="w-10 h-10 text-slate-500 mx-auto" />
         <div className="max-w-xl mx-auto space-y-1">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">{t.faqTitle}</h3>
            <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase italic">
              {t.faqDesc}
            </p>
         </div>
      </div>
    </div>
  );
}
