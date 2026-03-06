import { motion } from "framer-motion";
import { BarChart3, TrendingUp, DollarSign, UtensilsCrossed, Users, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";

const weeklyRevenue = [
  { day: "Mon", revenue: 3200 }, { day: "Tue", revenue: 2800 }, { day: "Wed", revenue: 4100 },
  { day: "Thu", revenue: 3600 }, { day: "Fri", revenue: 5200 }, { day: "Sat", revenue: 6800 }, { day: "Sun", revenue: 5500 },
];

const hourlyOrders = [
  { hour: "8AM", orders: 5 }, { hour: "9AM", orders: 12 }, { hour: "10AM", orders: 8 },
  { hour: "11AM", orders: 18 }, { hour: "12PM", orders: 35 }, { hour: "1PM", orders: 42 },
  { hour: "2PM", orders: 28 }, { hour: "3PM", orders: 15 }, { hour: "4PM", orders: 10 },
  { hour: "5PM", orders: 20 }, { hour: "6PM", orders: 38 }, { hour: "7PM", orders: 45 },
  { hour: "8PM", orders: 40 }, { hour: "9PM", orders: 25 }, { hour: "10PM", orders: 12 },
];

const categoryBreakdown = [
  { name: "Main Course", value: 40, color: "hsl(25, 95%, 53%)" },
  { name: "Drinks", value: 25, color: "hsl(160, 60%, 40%)" },
  { name: "Desserts", value: 15, color: "hsl(217, 91%, 60%)" },
  { name: "Appetizers", value: 12, color: "hsl(38, 92%, 50%)" },
  { name: "Breakfast", value: 8, color: "hsl(280, 60%, 50%)" },
];

export default function ReportsPage() {
  return (
    <AppLayout>
      <PageHeader title="Reports & Analytics" subtitle="Business insights and performance metrics" />

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Weekly Revenue", value: "$31,200", change: "+12%", icon: DollarSign },
          { label: "Total Orders", value: "1,024", change: "+8%", icon: UtensilsCrossed },
          { label: "Unique Customers", value: "342", change: "+5%", icon: Users },
          { label: "Avg. Service Time", value: "18 min", change: "-2 min", icon: Clock },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-4"
          >
            <kpi.icon className="w-5 h-5 text-primary mb-2" />
            <p className="text-xl font-display font-bold text-foreground">{kpi.value}</p>
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <span className="text-xs text-success font-semibold">{kpi.change}</span>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card-elevated p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Weekly Revenue</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: 12 }}
              />
              <Bar dataKey="revenue" fill="hsl(25, 95%, 53%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Orders by Hour */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card-elevated p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Orders by Hour</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={hourlyOrders}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: 12 }}
              />
              <Line type="monotone" dataKey="orders" stroke="hsl(160, 60%, 40%)" strokeWidth={2} dot={{ fill: "hsl(160, 60%, 40%)", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Category Breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card-elevated p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">Sales by Category</h3>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie data={categoryBreakdown} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {categoryBreakdown.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-3">
            {categoryBreakdown.map((cat) => (
              <div key={cat.name} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-sm text-foreground flex-1">{cat.name}</span>
                <span className="text-sm font-semibold text-foreground">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
