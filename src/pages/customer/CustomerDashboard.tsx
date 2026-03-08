import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { UtensilsCrossed, ShoppingCart, Clock, Star, ArrowRight, Heart, Gift, CalendarDays, MapPin, Users } from "lucide-react";
import { CustomerLayout } from "@/components/CustomerLayout";
import { PageHeader } from "@/components/PageHeader";

const popularItems = [
  { name: "Wagyu Steak", price: "$85", rating: 4.9, image: "🥩" },
  { name: "Grilled Salmon", price: "$45", rating: 4.8, image: "🐟" },
  { name: "Margherita Pizza", price: "$20", rating: 4.7, image: "🍕" },
  { name: "Truffle Pasta", price: "$45", rating: 4.8, image: "🍝" },
];

const recentOrders = [
  { id: "#1020", items: "Burger Deluxe, Fries", total: "$22.00", status: "Completed", date: "Today" },
  { id: "#1015", items: "Caesar Salad, Lemonade", total: "$18.50", status: "Completed", date: "Yesterday" },
  { id: "#1010", items: "Wagyu Steak, Wine", total: "$120.00", status: "Completed", date: "2 days ago" },
];

const availableTables = [
  { id: "T-01", seats: 2, zone: "Window", available: true },
  { id: "T-02", seats: 4, zone: "Main", available: true },
  { id: "T-05", seats: 6, zone: "VIP", available: false },
  { id: "T-08", seats: 2, zone: "Patio", available: true },
  { id: "T-10", seats: 8, zone: "Private", available: true },
];

const zoneColors: Record<string, string> = {
  Window: "bg-info/10 text-info",
  Main: "bg-primary/10 text-primary",
  VIP: "bg-warning/10 text-warning",
  Patio: "bg-success/10 text-success",
  Private: "bg-accent text-accent-foreground",
};

export default function CustomerDashboard() {
  return (
    <CustomerLayout>
      <PageHeader title="Welcome back, John! 👋" subtitle="What would you like to eat today?" />

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { icon: ShoppingCart, label: "Total Orders", value: "24", color: "bg-primary/10 text-primary" },
          { icon: Heart, label: "Favorites", value: "8", color: "bg-destructive/10 text-destructive" },
          { icon: Gift, label: "Reward Points", value: "1,250", color: "bg-success/10 text-success" },
          { icon: Star, label: "Reviews Given", value: "12", color: "bg-warning/10 text-warning" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card-elevated p-4 text-center"
          >
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-2`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-xl font-display font-bold text-foreground">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link to="/customer/menu">
          <motion.div whileHover={{ y: -4, scale: 1.02 }} className="glass-card-elevated p-5 cursor-pointer group text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
              <UtensilsCrossed className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-foreground mb-1">Browse Menu</h3>
            <p className="text-xs text-muted-foreground">Explore dishes & order</p>
          </motion.div>
        </Link>
        <Link to="/customer/orders">
          <motion.div whileHover={{ y: -4, scale: 1.02 }} className="glass-card-elevated p-5 cursor-pointer group text-center">
            <div className="w-12 h-12 rounded-2xl bg-info/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-info/20 transition-colors">
              <ShoppingCart className="w-6 h-6 text-info" />
            </div>
            <h3 className="font-display font-semibold text-foreground mb-1">My Orders</h3>
            <p className="text-xs text-muted-foreground">Track your orders</p>
          </motion.div>
        </Link>
        <Link to="/customer/reservation">
          <motion.div whileHover={{ y: -4, scale: 1.02 }} className="glass-card-elevated p-5 cursor-pointer group text-center">
            <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-success/20 transition-colors">
              <CalendarDays className="w-6 h-6 text-success" />
            </div>
            <h3 className="font-display font-semibold text-foreground mb-1">Reserve Table</h3>
            <p className="text-xs text-muted-foreground">Book your spot</p>
          </motion.div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg text-foreground">Popular Right Now</h2>
            <Link to="/customer/menu" className="text-sm text-primary flex items-center gap-1 font-medium hover:gap-2 transition-all">
              View Menu <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {popularItems.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                whileHover={{ y: -4 }}
                className="glass-card-elevated p-5 cursor-pointer group"
              >
                <div className="text-4xl mb-3">{item.image}</div>
                <h3 className="font-semibold text-foreground">{item.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-lg font-display font-bold text-primary">{item.price}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                    <span className="text-xs font-semibold text-foreground">{item.rating}</span>
                  </div>
                </div>
                <Link to="/customer/menu">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-3 w-full py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    Add to Order
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right column: Recent orders + Available tables */}
        <div className="space-y-6">
          {/* Recent orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card-elevated p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg text-foreground">Recent Orders</h2>
              <Link to="/customer/orders" className="text-sm text-primary font-medium">View All</Link>
            </div>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{order.id}</p>
                    <p className="text-xs text-muted-foreground truncate">{order.items}</p>
                    <p className="text-[11px] text-muted-foreground">{order.date}</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{order.total}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Available Tables */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card-elevated p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg text-foreground">Available Tables</h2>
              <Link to="/customer/reservation" className="text-sm text-primary font-medium flex items-center gap-1">
                Reserve <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {availableTables.map((table) => (
                <div key={table.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${table.available ? "border-border hover:border-primary/30" : "border-border opacity-50"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{table.id}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" />{table.seats}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${zoneColors[table.zone]}`}>{table.zone}</span>
                      </div>
                    </div>
                  </div>
                  {table.available ? (
                    <Link to="/customer/reservation">
                      <motion.button whileTap={{ scale: 0.95 }} className="text-[11px] font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors">
                        Book
                      </motion.button>
                    </Link>
                  ) : (
                    <span className="text-[11px] font-semibold text-muted-foreground">Occupied</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </CustomerLayout>
  );
}
