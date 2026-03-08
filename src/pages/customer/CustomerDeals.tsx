import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Zap, Timer, Tag, Flame } from "lucide-react";
import { CustomerLayout } from "@/components/CustomerLayout";
import { PageHeader } from "@/components/PageHeader";

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
  dayLabel: string;
  isActive: boolean;
}

const deals: Deal[] = [
  { id: "1", title: "Happy Hour", description: "Buy 1 Get 1 Free on all drinks", dealType: "bogo", dealValue: 0, emoji: "🍺", startTime: "16:00", endTime: "19:00", isHappyHour: true, dayLabel: "Every Day", isActive: true },
  { id: "2", title: "Taco Tuesday", description: "20% off all main courses", dealType: "discount_percent", dealValue: 20, emoji: "🌮", startTime: "11:00", endTime: "22:00", isHappyHour: false, dayLabel: "Tuesdays", isActive: true },
  { id: "3", title: "Weekend Brunch", description: "$5 off breakfast items", dealType: "discount_fixed", dealValue: 5, emoji: "🥞", startTime: "08:00", endTime: "13:00", isHappyHour: false, dayLabel: "Sat & Sun", isActive: true },
  { id: "4", title: "Late Night Dessert", description: "30% off all desserts after 9PM", dealType: "discount_percent", dealValue: 30, emoji: "🍰", startTime: "21:00", endTime: "23:59", isHappyHour: false, dayLabel: "Every Day", isActive: false },
  { id: "5", title: "Wine Wednesday", description: "Free appetizer with wine order", dealType: "free_item", dealValue: 0, emoji: "🍷", startTime: "17:00", endTime: "22:00", isHappyHour: true, dayLabel: "Wednesdays", isActive: true },
];

function CountdownTimer({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const [h, m] = endTime.split(":").map(Number);
      const end = new Date(now);
      end.setHours(h, m, 0, 0);
      if (end <= now) { setTimeLeft("Ended"); return; }
      const diff = end.getTime() - now.getTime();
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${hours}h ${mins}m left`);
    };
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, [endTime]);

  return (
    <span className="text-[10px] font-mono font-bold text-warning flex items-center gap-1">
      <Timer className="w-3 h-3" /> {timeLeft}
    </span>
  );
}

export default function CustomerDeals() {
  const activeDeals = deals.filter(d => d.isActive);
  const happyHour = deals.filter(d => d.isHappyHour && d.isActive);

  return (
    <CustomerLayout>
      <PageHeader title="Deals & Happy Hour" subtitle="Today's specials and time-limited offers" />

      {/* Happy Hour Banner */}
      {happyHour.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 border border-primary/20 p-6 mb-6">
          <div className="absolute top-2 right-2">
            <Zap className="w-8 h-8 text-primary/20" />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <Flame className="w-6 h-6 text-primary" />
            <h2 className="font-display text-xl font-bold text-foreground">Happy Hour is ON! 🎉</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{happyHour.map(h => h.description).join(" • ")}</p>
          <CountdownTimer endTime={happyHour[0].endTime} />
        </motion.div>
      )}

      {/* All Deals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeDeals.map((deal, i) => (
          <motion.div
            key={deal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -4 }}
            className="glass-card-elevated p-5 relative overflow-hidden"
          >
            {deal.isHappyHour && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">HAPPY HOUR</div>
            )}
            <span className="text-4xl block mb-3">{deal.emoji}</span>
            <h3 className="font-display font-bold text-foreground text-lg">{deal.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-3">{deal.description}</p>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-lg"><Clock className="w-3 h-3" /> {deal.startTime} - {deal.endTime}</span>
              <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-lg"><Tag className="w-3 h-3" /> {deal.dayLabel}</span>
            </div>

            {deal.dealValue > 0 && (
              <div className="mt-3 inline-block bg-success/10 text-success text-sm font-bold px-3 py-1 rounded-lg">
                {deal.dealType === "discount_percent" ? `${deal.dealValue}% OFF` : `$${deal.dealValue} OFF`}
              </div>
            )}
            {deal.dealType === "bogo" && (
              <div className="mt-3 inline-block bg-primary/10 text-primary text-sm font-bold px-3 py-1 rounded-lg">BUY 1 GET 1 FREE</div>
            )}
            {deal.dealType === "free_item" && (
              <div className="mt-3 inline-block bg-warning/10 text-warning text-sm font-bold px-3 py-1 rounded-lg">FREE ITEM</div>
            )}
          </motion.div>
        ))}
      </div>
    </CustomerLayout>
  );
}
