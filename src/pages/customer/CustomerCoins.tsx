import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Gift, TrendingUp, Trophy, RotateCcw, Star, ShoppingCart, Sparkles, ChevronRight, ArrowRight, Zap, Crown, Clock, Check } from "lucide-react";
import { CustomerLayout } from "@/components/CustomerLayout";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "@/hooks/use-toast";

// Spin wheel segments
const wheelSegments = [
  { label: "5", coins: 5, color: "hsl(270, 70%, 50%)", probability: 0.3 },
  { label: "10", coins: 10, color: "hsl(142, 71%, 45%)", probability: 0.25 },
  { label: "25", coins: 25, color: "hsl(38, 92%, 50%)", probability: 0.15 },
  { label: "50", coins: 50, color: "hsl(217, 91%, 60%)", probability: 0.12 },
  { label: "2", coins: 2, color: "hsl(280, 60%, 45%)", probability: 0.08 },
  { label: "100", coins: 100, color: "hsl(0, 72%, 51%)", probability: 0.05 },
  { label: "1", coins: 1, color: "hsl(270, 20%, 50%)", probability: 0.03 },
  { label: "200", coins: 200, color: "hsl(45, 93%, 47%)", probability: 0.02 },
];

const rewards = [
  { id: 1, name: "10% Off Next Order", cost: 200, icon: "🏷️", category: "discount" },
  { id: 2, name: "Free Dessert", cost: 350, icon: "🍰", category: "freebie" },
  { id: 3, name: "Free Drink", cost: 150, icon: "☕", category: "freebie" },
  { id: 4, name: "25% Off Next Order", cost: 500, icon: "🔥", category: "discount" },
  { id: 5, name: "Free Appetizer", cost: 250, icon: "🥗", category: "freebie" },
  { id: 6, name: "Free Main Course", cost: 800, icon: "🥩", category: "freebie" },
  { id: 7, name: "50% Off Next Order", cost: 1200, icon: "💎", category: "discount" },
  { id: 8, name: "VIP Table Access", cost: 1500, icon: "👑", category: "perk" },
];

const coinHistory = [
  { id: 1, type: "earned", amount: 85, reason: "Order #1020 - Wagyu Steak", date: "Today, 2:30 PM" },
  { id: 2, type: "earned", amount: 25, reason: "Spin Wheel Bonus", date: "Today, 1:15 PM" },
  { id: 3, type: "spent", amount: -200, reason: "Redeemed: 10% Off Order", date: "Yesterday" },
  { id: 4, type: "earned", amount: 45, reason: "Order #1015 - Salmon & Salad", date: "Yesterday" },
  { id: 5, type: "earned", amount: 10, reason: "Review Bonus - Tiramisu", date: "2 days ago" },
  { id: 6, type: "earned", amount: 50, reason: "Spin Wheel Jackpot!", date: "3 days ago" },
  { id: 7, type: "earned", amount: 120, reason: "Order #1010 - Wagyu & Wine", date: "3 days ago" },
  { id: 8, type: "spent", amount: -150, reason: "Redeemed: Free Coffee", date: "5 days ago" },
  { id: 9, type: "earned", amount: 200, reason: "Welcome Bonus 🎉", date: "1 week ago" },
];

const milestones = [
  { coins: 500, title: "Bronze Spender", icon: "🥉", reached: true },
  { coins: 1000, title: "Silver Status", icon: "🥈", reached: true },
  { coins: 2000, title: "Gold Member", icon: "🥇", reached: false },
  { coins: 5000, title: "Platinum VIP", icon: "💎", reached: false },
];

export default function CustomerCoins() {
  const [totalCoins] = useState(1250);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [activeTab, setActiveTab] = useState<"rewards" | "history" | "milestones">("rewards");
  const wheelRef = useRef<HTMLDivElement>(null);

  const spinWheel = useCallback(() => {
    if (isSpinning || !canSpin) return;
    setIsSpinning(true);
    setShowResult(false);

    // Weighted random selection
    const rand = Math.random();
    let cumulative = 0;
    let selectedIndex = 0;
    for (let i = 0; i < wheelSegments.length; i++) {
      cumulative += wheelSegments[i].probability;
      if (rand <= cumulative) { selectedIndex = i; break; }
    }

    const segmentAngle = 360 / wheelSegments.length;
    const targetAngle = 360 - (selectedIndex * segmentAngle + segmentAngle / 2);
    const spins = 5 + Math.floor(Math.random() * 3);
    const finalRotation = rotation + spins * 360 + targetAngle;

    setRotation(finalRotation);
    setSpinResult(wheelSegments[selectedIndex].coins);

    setTimeout(() => {
      setIsSpinning(false);
      setShowResult(true);
      setCanSpin(false);
      toast({
        title: `🎉 You won ${wheelSegments[selectedIndex].coins} coins!`,
        description: "Coins have been added to your balance.",
      });
      // Re-enable spin after cooldown (demo: 10s)
      setTimeout(() => setCanSpin(true), 10000);
    }, 4500);
  }, [isSpinning, canSpin, rotation]);

  const redeemReward = (reward: typeof rewards[0]) => {
    if (totalCoins < reward.cost) {
      toast({ title: "Not enough coins", description: `You need ${reward.cost - totalCoins} more coins.`, variant: "destructive" });
      return;
    }
    toast({ title: `${reward.icon} Reward Redeemed!`, description: `${reward.name} applied to your account.` });
  };

  const segmentAngle = 360 / wheelSegments.length;

  return (
    <CustomerLayout>
      <PageHeader title="My Coins & Rewards 🪙" subtitle="Earn coins, spin the wheel, redeem rewards!" />

      {/* Top Coin Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Coins, label: "Total Coins", value: totalCoins.toLocaleString(), color: "bg-warning/10 text-warning", glow: true },
          { icon: TrendingUp, label: "Earned This Month", value: "535", color: "bg-success/10 text-success" },
          { icon: Gift, label: "Rewards Redeemed", value: "3", color: "bg-primary/10 text-primary" },
          { icon: Trophy, label: "Current Tier", value: "Silver", color: "bg-info/10 text-info" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass-card-elevated p-4 text-center ${s.glow ? "ring-2 ring-warning/30" : ""}`}
          >
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-2`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-xl font-display font-bold text-foreground">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* How to Earn Coins Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8 glass-card-elevated p-5 bg-gradient-to-r from-primary/5 to-accent/5"
      >
        <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-warning" /> How to Earn Coins
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: ShoppingCart, text: "1 coin per $1 spent", sub: "Order food" },
            { icon: Star, text: "10 coins per review", sub: "Rate dishes" },
            { icon: RotateCcw, text: "Up to 200 coins", sub: "Spin the wheel" },
            { icon: Gift, text: "200 welcome bonus", sub: "Sign up reward" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{item.text}</p>
                <p className="text-[10px] text-muted-foreground">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Spin Wheel - Left side */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-card-elevated p-6 flex flex-col items-center"
        >
          <h3 className="font-display font-semibold text-lg text-foreground mb-2 flex items-center gap-2">
            <Zap className="w-5 h-5 text-warning" /> Lucky Spin
          </h3>
          <p className="text-xs text-muted-foreground mb-6">Spin daily for free coins!</p>

          {/* Wheel */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 mb-6">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-foreground drop-shadow-lg" />

            {/* Wheel circle */}
            <motion.div
              ref={wheelRef}
              animate={{ rotate: rotation }}
              transition={{ duration: 4.5, ease: [0.2, 0.8, 0.3, 1] }}
              className="w-full h-full rounded-full relative overflow-hidden border-4 border-foreground/20 shadow-2xl"
              style={{ transformOrigin: "center center" }}
            >
              {wheelSegments.map((seg, i) => {
                const startAngle = i * segmentAngle;
                const midAngle = startAngle + segmentAngle / 2;
                const rad = (midAngle * Math.PI) / 180;
                const labelRadius = 42;
                const labelX = 50 + labelRadius * Math.sin(rad);
                const labelY = 50 - labelRadius * Math.cos(rad);

                return (
                  <div key={i}>
                    <svg
                      className="absolute inset-0 w-full h-full"
                      viewBox="0 0 100 100"
                    >
                      <path
                        d={describeArc(50, 50, 50, startAngle, startAngle + segmentAngle)}
                        fill={seg.color}
                        stroke="hsl(var(--background))"
                        strokeWidth="0.5"
                      />
                      <text
                        x={labelX}
                        y={labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="6"
                        fontWeight="bold"
                        transform={`rotate(${midAngle}, ${labelX}, ${labelY})`}
                      >
                        {seg.label}
                      </text>
                    </svg>
                  </div>
                );
              })}
              {/* Center circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-background border-4 border-foreground/20 flex items-center justify-center z-10 shadow-lg">
                  <Coins className="w-6 h-6 text-warning" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Spin button */}
          <motion.button
            onClick={spinWheel}
            disabled={isSpinning || !canSpin}
            whileHover={canSpin && !isSpinning ? { scale: 1.05 } : {}}
            whileTap={canSpin && !isSpinning ? { scale: 0.95 } : {}}
            className={`w-full max-w-[200px] py-3 rounded-2xl font-display font-bold text-sm transition-all ${
              canSpin && !isSpinning
                ? "bg-primary text-primary-foreground shadow-lg hover:shadow-xl"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            {isSpinning ? (
              <span className="flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4 animate-spin" /> Spinning...
              </span>
            ) : !canSpin ? (
              <span className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" /> Cooldown...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" /> SPIN!
              </span>
            )}
          </motion.button>

          {/* Result popup */}
          <AnimatePresence>
            {showResult && spinResult !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="mt-4 bg-warning/10 border border-warning/30 rounded-2xl p-4 text-center"
              >
                <p className="text-2xl font-display font-bold text-warning">+{spinResult} 🪙</p>
                <p className="text-xs text-muted-foreground">Added to your balance!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Right side - Tabs: Rewards / History / Milestones */}
        <div className="lg:col-span-3">
          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-2xl bg-muted/50 mb-6">
            {(["rewards", "history", "milestones"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "rewards" && "🎁 Rewards"}
                {tab === "history" && "📜 History"}
                {tab === "milestones" && "🏆 Milestones"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "rewards" && (
              <motion.div
                key="rewards"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {rewards.map((reward, i) => {
                  const canAfford = totalCoins >= reward.cost;
                  return (
                    <motion.div
                      key={reward.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -3 }}
                      className={`glass-card-elevated p-5 cursor-pointer group ${!canAfford ? "opacity-60" : ""}`}
                      onClick={() => redeemReward(reward)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">{reward.icon}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                          reward.category === "discount" ? "bg-primary/10 text-primary" :
                          reward.category === "freebie" ? "bg-success/10 text-success" :
                          "bg-warning/10 text-warning"
                        }`}>
                          {reward.category}
                        </span>
                      </div>
                      <h4 className="font-semibold text-foreground text-sm mb-2">{reward.name}</h4>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-warning font-display font-bold">
                          <Coins className="w-4 h-4" /> {reward.cost}
                        </span>
                        <motion.span
                          whileHover={{ x: 3 }}
                          className={`text-xs font-semibold flex items-center gap-1 ${
                            canAfford ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          {canAfford ? "Redeem" : "Not enough"} <ChevronRight className="w-3 h-3" />
                        </motion.span>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (totalCoins / reward.cost) * 100)}%` }}
                          transition={{ delay: 0.3 + i * 0.05, duration: 0.6 }}
                          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card-elevated divide-y divide-border/30"
              >
                {coinHistory.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        entry.type === "earned" ? "bg-success/10" : "bg-destructive/10"
                      }`}>
                        {entry.type === "earned" ? (
                          <TrendingUp className="w-4 h-4 text-success" />
                        ) : (
                          <Gift className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{entry.reason}</p>
                        <p className="text-[11px] text-muted-foreground">{entry.date}</p>
                      </div>
                    </div>
                    <span className={`font-display font-bold text-sm ${
                      entry.type === "earned" ? "text-success" : "text-destructive"
                    }`}>
                      {entry.type === "earned" ? "+" : ""}{entry.amount} 🪙
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === "milestones" && (
              <motion.div
                key="milestones"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {milestones.map((m, i) => (
                  <motion.div
                    key={m.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`glass-card-elevated p-5 flex items-center gap-4 ${m.reached ? "ring-2 ring-success/30" : ""}`}
                  >
                    <span className="text-3xl">{m.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-foreground">{m.title}</h4>
                        {m.reached ? (
                          <span className="text-xs font-bold text-success flex items-center gap-1">
                            <Check className="w-3 h-3" /> Achieved
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-muted-foreground">
                            {m.coins.toLocaleString()} coins needed
                          </span>
                        )}
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (totalCoins / m.coins) * 100)}%` }}
                          transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                          className={`h-full rounded-full ${m.reached ? "bg-success" : "bg-gradient-to-r from-primary to-accent"}`}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {Math.min(totalCoins, m.coins).toLocaleString()} / {m.coins.toLocaleString()} coins
                      </p>
                    </div>
                  </motion.div>
                ))}

                {/* Tier Benefits */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="glass-card-elevated p-5 mt-4"
                >
                  <h4 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-warning" /> Tier Benefits
                  </h4>
                  <div className="space-y-2">
                    {[
                      { tier: "🥉 Bronze", perks: "1x coin multiplier, daily spin" },
                      { tier: "🥈 Silver", perks: "1.5x coins, 2 daily spins, priority seating" },
                      { tier: "🥇 Gold", perks: "2x coins, 3 daily spins, free delivery, birthday reward" },
                      { tier: "💎 Platinum", perks: "3x coins, unlimited spins, VIP access, monthly free dish" },
                    ].map((t) => (
                      <div key={t.tier} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                        <span className="text-lg">{t.tier.split(" ")[0]}</span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{t.tier.split(" ").slice(1).join(" ")}</p>
                          <p className="text-[11px] text-muted-foreground">{t.perks}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </CustomerLayout>
  );
}

// SVG arc helper
function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}