import { useState } from "react";
import { motion } from "framer-motion";
import { Gift, Copy, Users, Coins, Check, Share2 } from "lucide-react";
import { CustomerLayout } from "@/components/CustomerLayout";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "@/hooks/use-toast";

const myCode = "CAFE8A3F1D";
const referrals = [
  { name: "Alex M.", date: "Mar 3", coins: 100 },
  { name: "Sarah K.", date: "Feb 28", coins: 100 },
  { name: "Jordan L.", date: "Feb 20", coins: 100 },
];

export default function CustomerReferrals() {
  const [copied, setCopied] = useState(false);
  const [redeemCode, setRedeemCode] = useState("");

  const copyCode = () => {
    navigator.clipboard.writeText(myCode);
    setCopied(true);
    toast({ title: "Copied! 📋", description: "Referral code copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  const redeemReferral = () => {
    if (!redeemCode.trim()) return;
    toast({ title: "Code Redeemed! 🎉", description: "You earned 50 coins from your friend's referral." });
    setRedeemCode("");
  };

  return (
    <CustomerLayout>
      <PageHeader title="Refer Friends" subtitle="Share your code and earn coins together" />

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card-elevated p-6 mb-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-display text-xl font-bold text-foreground mb-2">Give 50, Get 100!</h2>
        <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">Share your code with friends. They get 50 coins and you earn 100 coins for each signup!</p>

        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="bg-muted rounded-xl px-5 py-3 font-mono text-lg font-bold text-foreground tracking-widest">
            {myCode}
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={copyCode} className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </motion.button>
        </div>

        <motion.button whileTap={{ scale: 0.95 }} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          <Share2 className="w-4 h-4" /> Share via link
        </motion.button>
      </motion.div>

      {/* Redeem a code */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card-elevated p-5 mb-6">
        <h3 className="font-semibold text-foreground mb-3">Have a referral code?</h3>
        <div className="flex gap-3">
          <input value={redeemCode} onChange={e => setRedeemCode(e.target.value.toUpperCase())} placeholder="Enter code..." className="flex-1 h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm font-mono uppercase tracking-wider focus:ring-2 focus:ring-ring outline-none" />
          <motion.button whileTap={{ scale: 0.95 }} onClick={redeemReferral} className="px-5 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">Redeem</motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass-card p-4 text-center">
          <Users className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-display font-bold text-foreground">{referrals.length}</p>
          <p className="text-[10px] text-muted-foreground">Friends Referred</p>
        </div>
        <div className="glass-card p-4 text-center">
          <Coins className="w-5 h-5 text-warning mx-auto mb-1" />
          <p className="text-xl font-display font-bold text-foreground">{referrals.length * 100}</p>
          <p className="text-[10px] text-muted-foreground">Coins Earned</p>
        </div>
        <div className="glass-card p-4 text-center">
          <Gift className="w-5 h-5 text-success mx-auto mb-1" />
          <p className="text-xl font-display font-bold text-foreground">50</p>
          <p className="text-[10px] text-muted-foreground">Max Referrals</p>
        </div>
      </div>

      {/* Referral History */}
      <h3 className="font-display font-semibold text-foreground mb-3">Referral History</h3>
      <div className="space-y-2">
        {referrals.map((ref, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.05 }} className="glass-card p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">{ref.name}</p>
              <p className="text-xs text-muted-foreground">{ref.date}</p>
            </div>
            <span className="text-sm font-bold text-success">+{ref.coins} 🪙</span>
          </motion.div>
        ))}
      </div>
    </CustomerLayout>
  );
}
