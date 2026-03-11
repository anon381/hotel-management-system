import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart, DollarSign, Grid3X3, TrendingUp, ChefHat, Clock,
  ArrowUpRight, UtensilsCrossed, AlertTriangle, Loader2
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { api } from "@/lib/api";

const statusColors: Record<string, string> = {
  Pending: "bg-warning/10 text-warning",
  Preparing: "bg-info/10 text-info",
  Ready: "bg-success/10 text-success",
  Completed: "bg-muted text-muted-foreground",
  pending: "bg-warning/10 text-warning",
  preparing: "bg-info/10 text-info",
  ready: "bg-success/10 text-success",
  completed: "bg-muted text-muted-foreground",
  served: "bg-muted text-muted-foreground",
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
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topItems, setTopItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Assuming your backend has routes like /api/dashboard/stats, /api/orders
        const [statsData, ordersData, topMenuData] = await Promise.all([
          api.get('/dashboard/stats').catch(() => null),
          api.get('/orders').catch(() => []),
          api.get('/dashboard/top-sellers').catch(() => null)
        ]);
        
        if (statsData) setStats(statsData);
        if (ordersData) setRecentOrders(ordersData.slice(0, 5)); // First 5
        if (topMenuData) setTopItems(topMenuData.slice(0, 4));
        
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // For this demo, keep the layout but populate with real data or fallback to defaults
  // You might need to adjust variable names depending on the exact structure returned by your backend

  const totalOrders = stats?.total_orders || 0;
  const revenue = stats?.total_revenue ? `$${stats.total_revenue}` : "$0.00";
  const availableTables = stats?.available_tables || 0;
  // If no stats, fallback to 0

  return (
    <AppLayout>
      <PageHeader title="Dashboard" subtitle="Welcome back, Chef. Here's today's overview." />

      {loading ? (
        <div className="flex justify-center items-center h-64 mt-12 w-full">
           <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={ShoppingCart} title="Total Orders" value={totalOrders.toString()} change="" changeType="neutral" delay={0} />
            <StatCard icon={DollarSign} title="Revenue Today" value={revenue} change="" changeType="neutral" delay={0.1} />
            <StatCard icon={Grid3X3} title="Available Tables" value={availableTables.toString()} change="" changeType="neutral" delay={0.2} />
            <StatCard icon={TrendingUp} title="Avg. Order Value" value={"---"} change="" changeType="neutral" delay={0.3} />
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
                {recentOrders.length === 0 ? <div className="p-5 text-muted-foreground text-center">No recent orders.</div> : null}
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
                        <p className="text-sm font-semibold text-foreground">#{order.id.slice(0, 6)} · T-{order.table_id?.slice(0, 4) || '??'}</p>
                        <p className="text-xs text-muted-foreground truncate">{order.total_amount ? `$${order.total_amount}` : 'Various items'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                      <span className={`text-[11px] uppercase font-semibold px-2 py-0.5 rounded-full ${statusColors[order.status] || 'bg-muted text-foreground'}`}>
                        {order.status}
                      </span>
                      <span className="text-sm font-semibold text-foreground hidden sm:block">${order.total_amount || 0}</span>
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
                  {!topItems || topItems.length === 0 ? <p className="text-sm text-muted-foreground">Not enough data.</p> : null}
                  {topItems?.map((item, i) => (
                    <motion.div
                      key={item.id || item.name}
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
                          <p className="text-[11px] text-muted-foreground">{item.orders || 0} orders</p>
                        </div>
                      </div>
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
                    <p className="text-2xl font-display font-bold text-info">?</p>
                    <p className="text-[11px] text-muted-foreground">Preparing</p>
                  </div>
                  <div className="bg-warning/10 rounded-lg p-3 text-center">
                    <p className="text-2xl font-display font-bold text-warning">?</p>
                    <p className="text-[11px] text-muted-foreground">Pending</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}
