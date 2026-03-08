import { motion } from "framer-motion";
import { Clock, CheckCircle2, Package, ChefHat } from "lucide-react";
import { CustomerLayout } from "@/components/CustomerLayout";
import { PageHeader } from "@/components/PageHeader";

const orders = [
  { id: "#1024", items: "Grilled Salmon, Caesar Salad", total: "$42.50", status: "Preparing", date: "Today, 12:30 PM", table: "T-05" },
  { id: "#1020", items: "Burger Deluxe, Fries", total: "$22.00", status: "Completed", date: "Today, 11:00 AM", table: "T-01" },
  { id: "#1015", items: "Caesar Salad, Lemonade", total: "$18.50", status: "Completed", date: "Yesterday", table: "T-07" },
  { id: "#1010", items: "Wagyu Steak, Wine", total: "$120.00", status: "Completed", date: "Mar 5", table: "T-03" },
  { id: "#1005", items: "Pancakes, Coffee", total: "$22.00", status: "Completed", date: "Mar 4", table: "T-12" },
];

const statusConfig: Record<string, { icon: typeof Clock; color: string }> = {
  Pending: { icon: Clock, color: "text-warning" },
  Preparing: { icon: ChefHat, color: "text-info" },
  Ready: { icon: Package, color: "text-success" },
  Completed: { icon: CheckCircle2, color: "text-muted-foreground" },
};

export default function CustomerOrders() {
  return (
    <CustomerLayout>
      <PageHeader title="My Orders" subtitle="Track and review your order history" />
      <div className="space-y-3">
        {orders.map((order, i) => {
          const sc = statusConfig[order.status] || statusConfig.Completed;
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card-elevated p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center ${sc.color}`}>
                  <sc.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{order.id} · {order.table}</p>
                  <p className="text-sm text-muted-foreground truncate">{order.items}</p>
                  <p className="text-xs text-muted-foreground">{order.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${order.status === "Preparing" ? "bg-info/10 text-info" : "bg-muted text-muted-foreground"}`}>
                  {order.status}
                </span>
                <span className="text-lg font-display font-bold text-foreground">{order.total}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </CustomerLayout>
  );
}
