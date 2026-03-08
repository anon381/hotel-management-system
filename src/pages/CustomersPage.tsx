import { motion } from "framer-motion";
import { Heart, Search, Star, Gift, MessageSquare, TrendingUp } from "lucide-react";
import { AdminLayout as AppLayout } from "@/components/AdminLayout";
import { PageHeader } from "@/components/PageHeader";

const customers = [
  { id: 1, name: "John Davidson", visits: 42, spent: "$2,840", points: 1420, lastVisit: "Today", favorite: "Wagyu Steak", rating: 5 },
  { id: 2, name: "Sarah Mitchell", visits: 35, spent: "$1,960", points: 980, lastVisit: "Yesterday", favorite: "Truffle Pasta", rating: 5 },
  { id: 3, name: "Mike Rodriguez", visits: 28, spent: "$1,540", points: 770, lastVisit: "2 days ago", favorite: "Grilled Salmon", rating: 4 },
  { id: 4, name: "Emma Lee", visits: 22, spent: "$1,280", points: 640, lastVisit: "3 days ago", favorite: "Caesar Salad", rating: 4 },
  { id: 5, name: "David Kumar", visits: 18, spent: "$980", points: 490, lastVisit: "1 week ago", favorite: "Burger Deluxe", rating: 5 },
  { id: 6, name: "Lisa Wang", visits: 15, spent: "$820", points: 410, lastVisit: "Today", favorite: "Margherita Pizza", rating: 4 },
];

export default function CustomersPage() {
  return (
    <AppLayout>
      <PageHeader title="Customer Management" subtitle="Loyalty programs, feedback, and customer insights" />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Heart, label: "Loyal Customers", value: "160", color: "bg-destructive/10 text-destructive" },
          { icon: Gift, label: "Active Rewards", value: "45", color: "bg-primary/10 text-primary" },
          { icon: MessageSquare, label: "Pending Feedback", value: "12", color: "bg-warning/10 text-warning" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Customer cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.06 }}
            whileHover={{ y: -4 }}
            className="glass-card-elevated p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full gradient-warm flex items-center justify-center text-primary-foreground font-display font-bold">
                {c.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">{c.name}</h3>
                <p className="text-xs text-muted-foreground">{c.visits} visits · Last: {c.lastVisit}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                <p className="text-sm font-bold text-foreground">{c.spent}</p>
                <p className="text-[10px] text-muted-foreground">Total Spent</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                <p className="text-sm font-bold text-primary">{c.points} pts</p>
                <p className="text-[10px] text-muted-foreground">Loyalty Points</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Favorite: <strong className="text-foreground">{c.favorite}</strong></span>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: c.rating }).map((_, j) => (
                  <Star key={j} className="w-3 h-3 text-warning fill-warning" />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </AppLayout>
  );
}
