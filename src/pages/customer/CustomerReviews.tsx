import { useState } from "react";
import { motion } from "framer-motion";
import { Star, ThumbsUp, MessageSquare, Filter } from "lucide-react";
import { CustomerLayout } from "@/components/CustomerLayout";
import { PageHeader } from "@/components/PageHeader";

const myReviews = [
  { id: "r1", item: "Wagyu Steak", emoji: "🥩", rating: 5, comment: "Absolutely incredible! Best steak I've ever had. The truffle butter was divine.", date: "Mar 5", helpful: 12, reply: "Thank you for your kind words! Chef Marco is delighted. 🙏" },
  { id: "r2", item: "Tiramisu", emoji: "🍰", rating: 5, comment: "Perfect dessert. Authentic Italian taste.", date: "Mar 3", helpful: 8, reply: null },
  { id: "r3", item: "Grilled Salmon", emoji: "🐟", rating: 4, comment: "Great salmon, herb crust was flavorful. Slightly overcooked.", date: "Feb 28", helpful: 3, reply: "Thanks for the feedback! We'll improve." },
  { id: "r4", item: "Iced Latte", emoji: "☕", rating: 4, comment: "Smooth and refreshing.", date: "Feb 25", helpful: 1, reply: null },
];

export default function CustomerReviews() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? myReviews : myReviews.filter(r => r.rating === parseInt(filter));

  return (
    <CustomerLayout>
      <PageHeader title="My Reviews" subtitle="Your ratings and restaurant responses" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-display font-bold text-foreground">{myReviews.length}</p>
          <p className="text-xs text-muted-foreground">Reviews</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-display font-bold text-warning">{(myReviews.reduce((s, r) => s + r.rating, 0) / myReviews.length).toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">Avg Rating</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-display font-bold text-primary">{myReviews.reduce((s, r) => s + r.helpful, 0)}</p>
          <p className="text-xs text-muted-foreground">Helpful Votes</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-display font-bold text-success">{myReviews.length * 10}</p>
          <p className="text-xs text-muted-foreground">Coins Earned</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {["all", "5", "4", "3", "2", "1"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {f === "all" ? "All" : `${f}★`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((review, i) => (
          <motion.div key={review.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card-elevated p-5">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-3xl">{review.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-foreground">{review.item}</h3>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
                <div className="flex items-center gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? "text-warning fill-warning" : "text-muted"}`} />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-foreground mb-3">{review.comment}</p>

            {review.reply && (
              <div className="bg-muted/50 rounded-xl p-3 mb-3">
                <p className="text-[10px] font-semibold text-primary mb-1 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Restaurant Reply</p>
                <p className="text-xs text-foreground">{review.reply}</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <ThumbsUp className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{review.helpful} found helpful</span>
            </div>
          </motion.div>
        ))}
      </div>
    </CustomerLayout>
  );
}
