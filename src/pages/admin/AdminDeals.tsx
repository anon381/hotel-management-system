import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Plus, Clock, Tag, Edit2, Trash2, Zap, ToggleLeft, ToggleRight } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "@/hooks/use-toast";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Deal {
  id: string;
  title: string;
  description: string;
  dealType: string;
  dealValue: number;
  emoji: string;
  startTime: string;
  endTime: string;
  isHappyHour: boolean;
  dayOfWeek: number | null;
  isActive: boolean;
  redemptions: number;
}

const initialDeals: Deal[] = [
  { id: "1", title: "Happy Hour", description: "Buy 1 Get 1 Free on all drinks", dealType: "bogo", dealValue: 0, emoji: "🍺", startTime: "16:00", endTime: "19:00", isHappyHour: true, dayOfWeek: null, isActive: true, redemptions: 342 },
  { id: "2", title: "Taco Tuesday", description: "20% off all main courses", dealType: "discount_percent", dealValue: 20, emoji: "🌮", startTime: "11:00", endTime: "22:00", isHappyHour: false, dayOfWeek: 2, isActive: true, redemptions: 158 },
  { id: "3", title: "Weekend Brunch", description: "$5 off breakfast items", dealType: "discount_fixed", dealValue: 5, emoji: "🥞", startTime: "08:00", endTime: "13:00", isHappyHour: false, dayOfWeek: 0, isActive: true, redemptions: 89 },
  { id: "4", title: "Late Night Dessert", description: "30% off all desserts after 9PM", dealType: "discount_percent", dealValue: 30, emoji: "🍰", startTime: "21:00", endTime: "23:59", isHappyHour: false, dayOfWeek: null, isActive: true, redemptions: 201 },
  { id: "5", title: "Wine Wednesday", description: "Free appetizer with wine order", dealType: "free_item", dealValue: 0, emoji: "🍷", startTime: "17:00", endTime: "22:00", isHappyHour: true, dayOfWeek: 3, isActive: false, redemptions: 67 },
];

export default function AdminDeals() {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);

  const toggleActive = (id: string) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, isActive: !d.isActive } : d));
    toast({ title: "Deal Updated" });
  };

  const deleteDeal = (id: string) => {
    setDeals(prev => prev.filter(d => d.id !== id));
    toast({ title: "Deal Deleted 🗑️" });
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Daily Deals & Happy Hour"
        subtitle="Manage time-based promotions and specials"
        actions={
          <motion.button whileTap={{ scale: 0.95 }} className="gradient-warm text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg">
            <Plus className="w-4 h-4" /> New Deal
          </motion.button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-display font-bold text-foreground">{deals.filter(d => d.isActive).length}</p>
          <p className="text-xs text-muted-foreground">Active Deals</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-display font-bold text-warning">{deals.filter(d => d.isHappyHour).length}</p>
          <p className="text-xs text-muted-foreground">Happy Hours</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-display font-bold text-primary">{deals.reduce((s, d) => s + d.redemptions, 0)}</p>
          <p className="text-xs text-muted-foreground">Total Redemptions</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-display font-bold text-success">{deals.length}</p>
          <p className="text-xs text-muted-foreground">Total Deals</p>
        </div>
      </div>

      <div className="space-y-3">
        {deals.map((deal, i) => (
          <motion.div key={deal.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`glass-card-elevated p-5 ${!deal.isActive ? "opacity-60" : ""}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-3xl">{deal.emoji}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{deal.title}</h3>
                    {deal.isHappyHour && <Zap className="w-4 h-4 text-warning fill-warning" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{deal.description}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-[10px] bg-muted px-2 py-0.5 rounded-lg text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {deal.startTime}-{deal.endTime}</span>
                    <span className="text-[10px] bg-muted px-2 py-0.5 rounded-lg text-muted-foreground flex items-center gap-1"><Tag className="w-3 h-3" /> {deal.dayOfWeek !== null ? dayNames[deal.dayOfWeek] : "Every Day"}</span>
                    <span className="text-[10px] bg-primary/10 px-2 py-0.5 rounded-lg text-primary font-semibold">{deal.redemptions} used</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleActive(deal.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                  {deal.isActive ? <ToggleRight className="w-6 h-6 text-success" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
                <button className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => deleteDeal(deal.id)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </AdminLayout>
  );
}
