import { motion } from "framer-motion";
import {
  ShoppingCart, DollarSign, Grid3X3, TrendingUp, ChefHat, Clock,
  ArrowUpRight, UtensilsCrossed, AlertTriangle
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";

const recentOrders = [
  { id: "#1024", table: "T-05", items: "Grilled Salmon, Caesar Salad", total: "$42.50", status: "Preparing", time: "2 min ago" },
  { id: "#1023", table: "T-12", items: "Margherita Pizza, Tiramisu", total: "$28.00", status: "Ready", time: "5 min ago" },
  { id: "#1022", table: "T-03", items: "Wagyu Steak, Wine", total: "$85.00", status: "Completed", time: "12 min ago" },
  { id: "#1021", table: "T-08", items: "Pasta Carbonara", total: "$18.50", status: "Pending", time: "15 min ago" },
  { id: "#1020", table: "T-01", items: "Burger Deluxe, Fries", total: "$22.00", status: "Completed", time: "20 min ago" },
];

const topItems = [
  { name: "Wagyu Steak", orders: 45, revenue: "$3,825", trend: "+12%" },
  { name: "Grilled Salmon", orders: 38, revenue: "$1,710", trend: "+8%" },
  { name: "Margherita Pizza", orders: 52, revenue: "$1,040", trend: "+15%" },
  { name: "Truffle Pasta", orders: 29, revenue: "$1,305", trend: "+5%" },
];

const lowStock = [
  { name: "Wagyu Beef", current: 2, unit: "kg", threshold: 5 },
  { name: "Truffle Oil", current: 1, unit: "bottles", threshold: 3 },
  { name: "Fresh Salmon", current: 3, unit: "kg", threshold: 8 },
];

const statusColors: Record<string, string> = {
  Pending: "bg-warning/10 text-warning",
  Preparing: "bg-info/10 text-info",
  Ready: "bg-success/10 text-success",
  Completed: "bg-muted text-muted-foreground",
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  return (
    <AppLayout>
      <PageHeader title="Dashboard" subtitle="Welcome back, Chef. Here's today's overview." />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={ShoppingCart} title="Total Orders" value="156" change="+12%" changeType="positive" delay={0} />
        <StatCard icon={DollarSign} title="Revenue Today" value="$4,280" change="+8%" changeType="positive" delay={0.1} />
        <StatCard icon={Grid3X3} title="Available Tables" value="8/20" change="60%" changeType="neutral" delay={0.2} />
        <StatCard icon={TrendingUp} title="Avg. Order Value" value="$27.40" change="+3%" changeType="positive" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass-card-elevated overflow-hidden"
        >
          <div className="p-5 border-b border-border/50 flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg text-foreground">Recent Orders</h2>
            <motion.button whileHover={{ x: 4 }} className="text-sm text-primary flex items-center gap-1 font-medium">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
          <motion.div variants={container} initial="hidden" animate="show">
            {recentOrders.map((order) => (
              <motion.div
                key={order.id}
                variants={item}
                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors border-b border-border/30 last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <UtensilsCrossed className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{order.id} · {order.table}</p>
                    <p className="text-xs text-muted-foreground truncate">{order.items}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                  <span className="text-sm font-semibold text-foreground hidden sm:block">{order.total}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Top Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card-elevated p-5"
          >
            <h2 className="font-display font-semibold text-lg text-foreground mb-4">Top Sellers</h2>
            <div className="space-y-3">
              {topItems.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full gradient-warm text-[11px] font-bold text-primary-foreground flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground">{item.orders} orders</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-success">{item.trend}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Low Stock */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card-elevated p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <h2 className="font-display font-semibold text-lg text-foreground">Low Stock</h2>
            </div>
            <div className="space-y-3">
              {lowStock.map((s, i) => (
                <motion.div
                  key={s.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                  className="flex items-center justify-between"
                >
                  <p className="text-sm text-foreground">{s.name}</p>
                  <span className="text-xs font-semibold text-destructive">{s.current} {s.unit} left</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Kitchen Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card-elevated p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <ChefHat className="w-4 h-4 text-primary" />
              <h2 className="font-display font-semibold text-foreground">Kitchen Status</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-info/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-display font-bold text-info">7</p>
                <p className="text-[11px] text-muted-foreground">Preparing</p>
              </div>
              <div className="bg-success/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-display font-bold text-success">3</p>
                <p className="text-[11px] text-muted-foreground">Ready</p>
              </div>
              <div className="bg-warning/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-display font-bold text-warning">5</p>
                <p className="text-[11px] text-muted-foreground">Pending</p>
              </div>
              <div className="bg-muted rounded-lg p-3 text-center flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-sm font-semibold text-muted-foreground">~12m</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
