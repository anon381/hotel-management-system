import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Search, TrendingUp, Gift, User, MoreVertical, Plus, Minus, Eye, ChevronDown, ArrowUpDown, Crown, Trophy, RotateCcw } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "@/hooks/use-toast";

const customers = [
  { id: 1, name: "John Doe", email: "john@example.com", coins: 1250, tier: "Silver", totalEarned: 2400, totalSpent: 1150, lastActivity: "2 hours ago", avatar: "👤" },
  { id: 2, name: "Sarah Miller", email: "sarah@example.com", coins: 3450, tier: "Gold", totalEarned: 5200, totalSpent: 1750, lastActivity: "1 hour ago", avatar: "👩" },
  { id: 3, name: "Mike Johnson", email: "mike@example.com", coins: 580, tier: "Bronze", totalEarned: 980, totalSpent: 400, lastActivity: "Today", avatar: "👨" },
  { id: 4, name: "Emily Chen", email: "emily@example.com", coins: 6200, tier: "Platinum", totalEarned: 12500, totalSpent: 6300, lastActivity: "30 min ago", avatar: "👩‍💼" },
  { id: 5, name: "Alex Rivera", email: "alex@example.com", coins: 200, tier: "Bronze", totalEarned: 400, totalSpent: 200, lastActivity: "Yesterday", avatar: "🧑" },
  { id: 6, name: "Lisa Park", email: "lisa@example.com", coins: 1800, tier: "Silver", totalEarned: 3200, totalSpent: 1400, lastActivity: "3 hours ago", avatar: "👩‍🦰" },
  { id: 7, name: "James Wilson", email: "james@example.com", coins: 4100, tier: "Gold", totalEarned: 7800, totalSpent: 3700, lastActivity: "Today", avatar: "👨‍💼" },
  { id: 8, name: "Maria Garcia", email: "maria@example.com", coins: 950, tier: "Bronze", totalEarned: 1500, totalSpent: 550, lastActivity: "2 days ago", avatar: "👩‍🔬" },
];

const recentTransactions = [
  { id: 1, customer: "Emily Chen", type: "earned", amount: 120, reason: "Order #1045", date: "10 min ago" },
  { id: 2, customer: "Sarah Miller", type: "earned", amount: 50, reason: "Spin Wheel", date: "30 min ago" },
  { id: 3, customer: "John Doe", type: "spent", amount: -200, reason: "Redeemed: 10% Off", date: "2 hours ago" },
  { id: 4, customer: "James Wilson", type: "earned", amount: 85, reason: "Order #1044", date: "3 hours ago" },
  { id: 5, customer: "Lisa Park", type: "earned", amount: 10, reason: "Review Bonus", date: "5 hours ago" },
];

const tierColors: Record<string, string> = {
  Bronze: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  Silver: "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300",
  Gold: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Platinum: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export default function AdminCoins() {
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<typeof customers[0] | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustType, setAdjustType] = useState<"add" | "deduct">("add");
  const [showAdjust, setShowAdjust] = useState(false);
  const [filterTier, setFilterTier] = useState("all");
  const [sortBy, setSortBy] = useState<"coins" | "name" | "activity">("coins");

  const filtered = customers
    .filter(c => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
      const matchTier = filterTier === "all" || c.tier.toLowerCase() === filterTier;
      return matchSearch && matchTier;
    })
    .sort((a, b) => {
      if (sortBy === "coins") return b.coins - a.coins;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  const totalCoinsInCirculation = customers.reduce((s, c) => s + c.coins, 0);
  const totalEarned = customers.reduce((s, c) => s + c.totalEarned, 0);
  const totalSpent = customers.reduce((s, c) => s + c.totalSpent, 0);

  const handleAdjust = () => {
    if (!selectedCustomer || !adjustAmount || !adjustReason) {
      toast({ title: "Fill all fields", variant: "destructive" });
      return;
    }
    toast({
      title: `Coins ${adjustType === "add" ? "added to" : "deducted from"} ${selectedCustomer.name}`,
      description: `${adjustType === "add" ? "+" : "-"}${adjustAmount} coins — ${adjustReason}`,
    });
    setShowAdjust(false);
    setAdjustAmount("");
    setAdjustReason("");
  };

  return (
    <AdminLayout>
      <PageHeader title="Coins & Gamification" subtitle="Manage customer coins, rewards, and the spin wheel" />

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Coins, label: "Total in Circulation", value: totalCoinsInCirculation.toLocaleString(), color: "bg-warning/10 text-warning" },
          { icon: TrendingUp, label: "Total Earned (All Time)", value: totalEarned.toLocaleString(), color: "bg-success/10 text-success" },
          { icon: Gift, label: "Total Redeemed", value: totalSpent.toLocaleString(), color: "bg-primary/10 text-primary" },
          { icon: RotateCcw, label: "Spin Wheel Payouts", value: "4,280", color: "bg-info/10 text-info" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card-elevated p-4 text-center"
          >
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-2`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-xl font-display font-bold text-foreground">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="lg:col-span-2">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm text-foreground focus:outline-none"
            >
              <option value="all">All Tiers</option>
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
            </select>
            <button
              onClick={() => setSortBy(sortBy === "coins" ? "name" : "coins")}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" /> {sortBy === "coins" ? "By Coins" : "By Name"}
            </button>
          </div>

          {/* Customer Cards */}
          <div className="space-y-3">
            {filtered.map((customer, i) => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`glass-card-elevated p-4 cursor-pointer transition-all hover:ring-2 hover:ring-primary/20 ${
                  selectedCustomer?.id === customer.id ? "ring-2 ring-primary/40" : ""
                }`}
                onClick={() => setSelectedCustomer(customer)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
                      {customer.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-foreground">{customer.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tierColors[customer.tier]}`}>
                          {customer.tier}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{customer.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-warning flex items-center gap-1 justify-end">
                      <Coins className="w-4 h-4" /> {customer.coins.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{customer.lastActivity}</p>
                  </div>
                </div>
                {/* Mini stats */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/20">
                  <span className="text-[11px] text-success flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Earned: {customer.totalEarned.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-destructive flex items-center gap-1">
                    <Gift className="w-3 h-3" /> Spent: {customer.totalSpent.toLocaleString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Panel - Selected Customer Detail + Actions */}
        <div className="space-y-4">
          {/* Selected Customer Detail */}
          {selectedCustomer ? (
            <motion.div
              key={selectedCustomer.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card-elevated p-5"
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-3xl mx-auto mb-3">
                  {selectedCustomer.avatar}
                </div>
                <h3 className="font-display font-bold text-lg text-foreground">{selectedCustomer.name}</h3>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${tierColors[selectedCustomer.tier]}`}>
                  {selectedCustomer.tier} Member
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-warning/10 rounded-xl p-3 text-center">
                  <p className="text-lg font-display font-bold text-warning">{selectedCustomer.coins.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">Current Coins</p>
                </div>
                <div className="bg-success/10 rounded-xl p-3 text-center">
                  <p className="text-lg font-display font-bold text-success">{selectedCustomer.totalEarned.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">Total Earned</p>
                </div>
              </div>

              {/* Adjust Coins Button */}
              <button
                onClick={() => setShowAdjust(!showAdjust)}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Coins className="w-4 h-4" /> Adjust Coins
              </button>

              {/* Adjust Form */}
              <AnimatePresence>
                {showAdjust && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => setAdjustType("add")}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                          adjustType === "add" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Plus className="w-4 h-4 inline mr-1" /> Add
                      </button>
                      <button
                        onClick={() => setAdjustType("deduct")}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                          adjustType === "deduct" ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Minus className="w-4 h-4 inline mr-1" /> Deduct
                      </button>
                    </div>
                    <input
                      type="number"
                      placeholder="Amount"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm text-foreground mb-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <input
                      type="text"
                      placeholder="Reason (e.g. Manual bonus, Correction)"
                      value={adjustReason}
                      onChange={(e) => setAdjustReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm text-foreground mb-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button
                      onClick={handleAdjust}
                      className="w-full py-2 rounded-lg bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      Confirm {adjustType === "add" ? "Add" : "Deduct"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="glass-card-elevated p-8 text-center">
              <User className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Select a customer to view details</p>
            </div>
          )}

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card-elevated p-5"
          >
            <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-warning" /> Recent Activity
            </h3>
            <div className="space-y-2">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/20 transition-colors">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{tx.customer}</p>
                    <p className="text-[10px] text-muted-foreground">{tx.reason} · {tx.date}</p>
                  </div>
                  <span className={`text-xs font-bold ${tx.type === "earned" ? "text-success" : "text-destructive"}`}>
                    {tx.type === "earned" ? "+" : ""}{tx.amount} 🪙
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Tier Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card-elevated p-5"
          >
            <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
              <Crown className="w-4 h-4 text-warning" /> Tier Distribution
            </h3>
            {["Platinum", "Gold", "Silver", "Bronze"].map((tier) => {
              const count = customers.filter(c => c.tier === tier).length;
              const pct = Math.round((count / customers.length) * 100);
              return (
                <div key={tier} className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`font-semibold px-2 py-0.5 rounded ${tierColors[tier]}`}>{tier}</span>
                    <span className="text-muted-foreground">{count} customers ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.7, duration: 0.6 }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    />
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}