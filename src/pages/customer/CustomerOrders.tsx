import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2, Package, ChefHat, Truck, UtensilsCrossed, Star, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { CustomerLayout } from "@/components/CustomerLayout";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "@/hooks/use-toast";

interface TrackingStep {
  status: string;
  title: string;
  description: string;
  completedAt: string | null;
  isCurrent: boolean;
}

interface Order {
  id: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: string;
  date: string;
  table: string;
  type: string;
  tracking: TrackingStep[];
  canReview: boolean;
}

const orders: Order[] = [
  {
    id: "#1024", items: [{ name: "Grilled Salmon", qty: 1, price: 45 }, { name: "Caesar Salad", qty: 1, price: 18 }],
    total: 68.04, status: "preparing", date: "Today, 12:30 PM", table: "T-05", type: "dine_in", canReview: false,
    tracking: [
      { status: "pending", title: "Order Placed", description: "Your order has been received", completedAt: "12:30 PM", isCurrent: false },
      { status: "confirmed", title: "Confirmed", description: "Restaurant confirmed your order", completedAt: "12:31 PM", isCurrent: false },
      { status: "preparing", title: "Preparing", description: "Chef is cooking your food", completedAt: null, isCurrent: true },
      { status: "ready", title: "Ready", description: "Ready for pickup/serving", completedAt: null, isCurrent: false },
      { status: "served", title: "Served", description: "Enjoy your meal!", completedAt: null, isCurrent: false },
      { status: "completed", title: "Completed", description: "Thank you!", completedAt: null, isCurrent: false },
    ]
  },
  {
    id: "#1020", items: [{ name: "Wagyu Steak", qty: 1, price: 85 }, { name: "Truffle Pasta", qty: 1, price: 45 }],
    total: 140.40, status: "completed", date: "Today, 11:00 AM", table: "T-01", type: "dine_in", canReview: true,
    tracking: [
      { status: "pending", title: "Order Placed", description: "", completedAt: "11:00 AM", isCurrent: false },
      { status: "confirmed", title: "Confirmed", description: "", completedAt: "11:01 AM", isCurrent: false },
      { status: "preparing", title: "Preparing", description: "", completedAt: "11:05 AM", isCurrent: false },
      { status: "ready", title: "Ready", description: "", completedAt: "11:25 AM", isCurrent: false },
      { status: "served", title: "Served", description: "", completedAt: "11:27 AM", isCurrent: false },
      { status: "completed", title: "Completed", description: "", completedAt: "11:50 AM", isCurrent: true },
    ]
  },
  {
    id: "#1015", items: [{ name: "Caesar Salad", qty: 1, price: 18 }, { name: "Iced Latte", qty: 1, price: 6 }],
    total: 25.92, status: "completed", date: "Yesterday", table: "T-07", type: "dine_in", canReview: true,
    tracking: [
      { status: "pending", title: "Placed", description: "", completedAt: "2:00 PM", isCurrent: false },
      { status: "confirmed", title: "Confirmed", description: "", completedAt: "2:01 PM", isCurrent: false },
      { status: "preparing", title: "Preparing", description: "", completedAt: "2:03 PM", isCurrent: false },
      { status: "ready", title: "Ready", description: "", completedAt: "2:10 PM", isCurrent: false },
      { status: "served", title: "Served", description: "", completedAt: "2:12 PM", isCurrent: false },
      { status: "completed", title: "Completed", description: "", completedAt: "2:30 PM", isCurrent: true },
    ]
  },
  {
    id: "#1010", items: [{ name: "Sushi Platter", qty: 1, price: 55 }, { name: "Matcha Latte", qty: 2, price: 7 }],
    total: 74.52, status: "completed", date: "Mar 5", table: "T-03", type: "dine_in", canReview: true,
    tracking: [
      { status: "pending", title: "Placed", description: "", completedAt: "7:00 PM", isCurrent: false },
      { status: "completed", title: "Completed", description: "", completedAt: "8:15 PM", isCurrent: true },
    ]
  },
];

const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-warning", label: "Pending" },
  confirmed: { icon: CheckCircle2, color: "text-info", label: "Confirmed" },
  preparing: { icon: ChefHat, color: "text-primary", label: "Preparing" },
  ready: { icon: Package, color: "text-success", label: "Ready" },
  served: { icon: UtensilsCrossed, color: "text-success", label: "Served" },
  completed: { icon: CheckCircle2, color: "text-muted-foreground", label: "Completed" },
};

function TrackingTimeline({ steps }: { steps: TrackingStep[] }) {
  return (
    <div className="relative pl-6 space-y-3 py-2">
      <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-border" />
      {steps.map((step, i) => {
        const isDone = step.completedAt !== null;
        const isCurrent = step.isCurrent && !isDone;
        return (
          <div key={i} className="relative flex items-start gap-3">
            <div className={`absolute left-[-13px] w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 ${
              isDone ? "bg-success border-success" : isCurrent ? "bg-primary border-primary animate-pulse" : "bg-muted border-border"
            }`}>
              {isDone && <CheckCircle2 className="w-3 h-3 text-success-foreground" />}
              {step.isCurrent && !isDone && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-semibold ${isDone || step.isCurrent ? "text-foreground" : "text-muted-foreground"}`}>{step.title}</p>
                {step.completedAt && <span className="text-[10px] text-muted-foreground">{step.completedAt}</span>}
              </div>
              {step.description && <p className="text-xs text-muted-foreground">{step.description}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReviewModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedItem, setSelectedItem] = useState(order.items[0]?.name || "");

  const submitReview = () => {
    toast({ title: "Review Submitted! ✍️", description: `You earned 10 coins for your review of ${selectedItem}.` });
    onClose();
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-md bg-background border border-border rounded-2xl p-6 shadow-2xl">
          <h3 className="font-display font-bold text-lg text-foreground mb-1">Rate Your Order</h3>
          <p className="text-sm text-muted-foreground mb-4">Order {order.id} · Earn 10 coins! 🪙</p>

          <div className="mb-4">
            <label className="text-xs text-muted-foreground font-semibold mb-1 block">Select dish</label>
            <div className="flex flex-wrap gap-2">
              {order.items.map(it => (
                <button key={it.name} onClick={() => setSelectedItem(it.name)} className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${selectedItem === it.name ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {it.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs text-muted-foreground font-semibold mb-2 block">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(s => (
                <motion.button key={s} whileTap={{ scale: 0.8 }} onClick={() => setRating(s)}>
                  <Star className={`w-8 h-8 transition-colors ${s <= rating ? "text-warning fill-warning" : "text-muted-foreground"}`} />
                </motion.button>
              ))}
            </div>
          </div>

          <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience..." className="w-full h-20 rounded-xl border border-input bg-background text-foreground text-sm p-3 resize-none focus:ring-2 focus:ring-ring outline-none mb-4" />

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-border text-muted-foreground text-sm font-semibold hover:bg-muted transition-colors">Cancel</button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={submitReview} disabled={rating === 0} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">
              Submit Review
            </motion.button>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default function CustomerOrders() {
  const [expandedId, setExpandedId] = useState<string | null>(orders[0].id);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);

  return (
    <CustomerLayout>
      <PageHeader title="My Orders" subtitle="Track live status and review past orders" />

      <div className="space-y-3">
        {orders.map((order, i) => {
          const sc = statusConfig[order.status] || statusConfig.completed;
          const isExpanded = expandedId === order.id;
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card-elevated overflow-hidden"
            >
              <div className="p-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 ${sc.color}`}>
                      <sc.icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{order.id} · {order.table}</p>
                      <p className="text-sm text-muted-foreground truncate">{order.items.map(it => `${it.qty}x ${it.name}`).join(", ")}</p>
                      <p className="text-xs text-muted-foreground">{order.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      order.status === "preparing" ? "bg-primary/10 text-primary" :
                      order.status === "ready" ? "bg-success/10 text-success" :
                      "bg-muted text-muted-foreground"
                    }`}>{sc.label}</span>
                    <span className="text-lg font-display font-bold text-foreground">${order.total.toFixed(2)}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                {/* Live progress bar for active orders */}
                {order.status !== "completed" && (
                  <div className="mt-3">
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${(order.tracking.filter(s => s.completedAt).length / order.tracking.length) * 100}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 border-t border-border/50">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2">Order Tracking</h4>
                      <TrackingTimeline steps={order.tracking} />

                      <div className="mt-4 pt-3 border-t border-border/50">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Items</h4>
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-sm py-1">
                            <span className="text-foreground">{it.qty}x {it.name}</span>
                            <span className="text-muted-foreground">${(it.qty * it.price).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {order.canReview && (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => { e.stopPropagation(); setReviewOrder(order); }}
                          className="mt-4 w-full py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          <Star className="w-4 h-4" /> Rate & Review · Earn 10 Coins
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {reviewOrder && <ReviewModal order={reviewOrder} onClose={() => setReviewOrder(null)} />}
      </AnimatePresence>
    </CustomerLayout>
  );
}
