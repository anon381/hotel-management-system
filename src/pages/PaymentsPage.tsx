import { motion } from "framer-motion";
import { CreditCard, DollarSign, Receipt, TrendingUp, Percent, ArrowDownRight, Banknote, Smartphone } from "lucide-react";
import { AdminLayout as AppLayout } from "@/components/AdminLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";

const transactions = [
  { id: "TXN-001", order: "#1022", method: "Card", amount: 65, tax: 6.5, tip: 10, time: "12:32 PM", status: "Completed" },
  { id: "TXN-002", order: "#1020", method: "Cash", amount: 52, tax: 5.2, tip: 5, time: "12:28 PM", status: "Completed" },
  { id: "TXN-003", order: "#1019", method: "Mobile", amount: 18, tax: 1.8, tip: 3, time: "11:58 AM", status: "Completed" },
  { id: "TXN-004", order: "#1017", method: "Card", amount: 120, tax: 12, tip: 20, time: "11:40 AM", status: "Completed" },
  { id: "TXN-005", order: "#1015", method: "Cash", amount: 34, tax: 3.4, tip: 0, time: "11:22 AM", status: "Refunded" },
];

const methodIcons: Record<string, typeof CreditCard> = { Card: CreditCard, Cash: Banknote, Mobile: Smartphone };

export default function PaymentsPage() {
  return (
    <AppLayout>
      <PageHeader title="Payments & Billing" subtitle="Track revenue, process payments, and manage billing" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={DollarSign} title="Today's Revenue" value="$4,280" change="+8%" changeType="positive" delay={0} />
        <StatCard icon={Receipt} title="Transactions" value="42" change="+12" changeType="positive" delay={0.1} />
        <StatCard icon={Percent} title="Avg. Tax" value="10%" delay={0.2} />
        <StatCard icon={TrendingUp} title="Tips Collected" value="$320" change="+15%" changeType="positive" delay={0.3} />
      </div>

      {/* Payment Methods Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {[
          { method: "Card", pct: 55, amount: "$2,354", color: "bg-primary" },
          { method: "Cash", pct: 30, amount: "$1,284", color: "bg-success" },
          { method: "Mobile", pct: 15, amount: "$642", color: "bg-info" },
        ].map((m, i) => (
          <motion.div
            key={m.method}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-foreground">{m.method}</span>
              <span className="text-sm text-muted-foreground">{m.pct}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${m.pct}%` }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${m.color}`}
              />
            </div>
            <p className="text-lg font-display font-bold text-foreground">{m.amount}</p>
          </motion.div>
        ))}
      </div>

      {/* Transactions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card-elevated overflow-hidden">
        <div className="p-5 border-b border-border/50">
          <h2 className="font-display font-semibold text-lg text-foreground">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wider">
                <th className="text-left p-4">Transaction</th>
                <th className="text-left p-4">Method</th>
                <th className="text-right p-4">Amount</th>
                <th className="text-right p-4">Tax</th>
                <th className="text-right p-4">Tip</th>
                <th className="text-left p-4">Time</th>
                <th className="text-left p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const MIcon = methodIcons[tx.method] || CreditCard;
                return (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t border-border/30 hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      <p className="text-sm font-semibold text-foreground">{tx.id}</p>
                      <p className="text-xs text-muted-foreground">{tx.order}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <MIcon className="w-4 h-4 text-muted-foreground" /> {tx.method}
                      </div>
                    </td>
                    <td className="p-4 text-right font-semibold text-foreground">${tx.amount}</td>
                    <td className="p-4 text-right text-muted-foreground text-sm">${tx.tax}</td>
                    <td className="p-4 text-right text-sm text-success">${tx.tip}</td>
                    <td className="p-4 text-sm text-muted-foreground">{tx.time}</td>
                    <td className="p-4">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        tx.status === "Completed" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                      }`}>{tx.status}</span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </AppLayout>
  );
}
