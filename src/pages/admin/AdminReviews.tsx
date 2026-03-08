import { useState } from "react";
import { motion } from "framer-motion";
import { Star, MessageSquare, Eye, EyeOff, Filter, ThumbsUp } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "@/hooks/use-toast";

const reviews = [
  { id: "r1", customer: "Alex M.", item: "Wagyu Steak", emoji: "🥩", rating: 5, comment: "Best steak ever! The truffle butter was divine.", date: "Mar 5", helpful: 12, reply: "Thank you, Alex! Chef Marco appreciates it. 🙏", visible: true },
  { id: "r2", customer: "Jordan L.", item: "Tiramisu", emoji: "🍰", rating: 5, comment: "Authentic Italian taste. Perfection.", date: "Mar 4", helpful: 8, reply: null, visible: true },
  { id: "r3", customer: "Sarah K.", item: "Grilled Salmon", emoji: "🐟", rating: 4, comment: "Great flavor, slightly overcooked.", date: "Mar 3", helpful: 3, reply: "Thanks for the honest feedback, Sarah!", visible: true },
  { id: "r4", customer: "Chris W.", item: "Margherita Pizza", emoji: "🍕", rating: 3, comment: "Good but nothing special. Expected more.", date: "Mar 2", helpful: 1, reply: null, visible: true },
  { id: "r5", customer: "Emma T.", item: "Iced Latte", emoji: "☕", rating: 2, comment: "Too watery, not enough espresso.", date: "Mar 1", helpful: 5, reply: null, visible: false },
  { id: "r6", customer: "Mike D.", item: "Sushi Platter", emoji: "🍣", rating: 5, comment: "Fresh, creative, absolutely stunning presentation!", date: "Feb 28", helpful: 15, reply: "Thanks Mike! Our sushi chef worked hard on that platter.", visible: true },
];

export default function AdminReviews() {
  const [filter, setFilter] = useState("all");
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const filtered = filter === "all" ? reviews : reviews.filter(r => r.rating === parseInt(filter));
  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  const submitReply = (id: string) => {
    toast({ title: "Reply Posted ✅", description: "Customer will be notified." });
    setReplyId(null);
    setReplyText("");
  };

  return (
    <AdminLayout>
      <PageHeader title="Reviews & Ratings" subtitle="Monitor customer feedback and respond" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-display font-bold text-warning">{avgRating}</p>
          <div className="flex justify-center gap-0.5 mt-1">{[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= Math.round(Number(avgRating)) ? "text-warning fill-warning" : "text-muted"}`} />)}</div>
          <p className="text-xs text-muted-foreground mt-1">Avg Rating</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-display font-bold text-foreground">{reviews.length}</p>
          <p className="text-xs text-muted-foreground">Total Reviews</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-display font-bold text-success">{reviews.filter(r => r.reply).length}</p>
          <p className="text-xs text-muted-foreground">Replied</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-display font-bold text-destructive">{reviews.filter(r => r.rating <= 2).length}</p>
          <p className="text-xs text-muted-foreground">Need Attention</p>
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
          <motion.div key={review.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`glass-card-elevated p-5 ${!review.visible ? "opacity-60" : ""}`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{review.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div>
                    <span className="text-sm font-semibold text-foreground">{review.customer}</span>
                    <span className="text-xs text-muted-foreground ml-2">on {review.item}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      {review.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 mb-2">
                  {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? "text-warning fill-warning" : "text-muted"}`} />)}
                </div>
                <p className="text-sm text-foreground mb-2">{review.comment}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ThumbsUp className="w-3 h-3" /> {review.helpful} helpful
                </div>

                {review.reply && (
                  <div className="mt-3 bg-muted/50 rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-primary mb-1">Your Reply</p>
                    <p className="text-xs text-foreground">{review.reply}</p>
                  </div>
                )}

                {!review.reply && replyId !== review.id && (
                  <button onClick={() => setReplyId(review.id)} className="mt-2 text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
                    <MessageSquare className="w-3 h-3" /> Reply
                  </button>
                )}

                {replyId === review.id && (
                  <div className="mt-3">
                    <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write your reply..." className="w-full h-16 rounded-xl border border-input bg-background text-foreground text-sm p-3 resize-none focus:ring-2 focus:ring-ring outline-none mb-2" />
                    <div className="flex gap-2">
                      <button onClick={() => setReplyId(null)} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground">Cancel</button>
                      <button onClick={() => submitReply(review.id)} className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold">Post Reply</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </AdminLayout>
  );
}
