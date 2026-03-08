import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  UtensilsCrossed, ShieldCheck, ChefHat, Users, ArrowRight,
  BarChart3, ShoppingCart, Grid3X3, CreditCard, Package, Bell,
  CheckCircle2, Star, Zap, Globe
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HeroScene } from "@/components/Scene3D";

const features = [
  { icon: ShoppingCart, title: "Order Management", desc: "Track orders from placement to completion with real-time status updates." },
  { icon: ChefHat, title: "Kitchen Dashboard", desc: "Live kitchen queue with priority ordering and instant status sync." },
  { icon: Grid3X3, title: "Table Management", desc: "Visual floor plan with real-time availability and reservation tracking." },
  { icon: CreditCard, title: "Payments & Billing", desc: "Multi-method payments, tax calculation, and receipt generation." },
  { icon: Package, title: "Inventory Control", desc: "Automated stock tracking with low-stock alerts and supplier management." },
  { icon: BarChart3, title: "Analytics & Reports", desc: "Revenue trends, peak hours, top sellers, and performance insights." },
];

const howItWorks = [
  { step: "01", title: "Sign In", desc: "Each role gets a tailored interface — Admin, Kitchen Staff, or Customer." },
  { step: "02", title: "Manage Everything", desc: "From menus to orders, tables to inventory — all from one unified system." },
  { step: "03", title: "Track & Optimize", desc: "Real-time analytics help you make data-driven decisions for growth." },
];

const roles = [
  { icon: ShieldCheck, title: "Admin Portal", desc: "Full system control — menu, staff, inventory, reports, and user management.", path: "/login/admin", color: "from-primary to-orange-600" },
  { icon: Users, title: "Customer Portal", desc: "Browse menus, place orders, track history, and earn loyalty rewards.", path: "/login/customer", color: "from-info to-blue-600" },
  { icon: ChefHat, title: "Kitchen Portal", desc: "Real-time order queue, priority management, and preparation tracking.", path: "/login/kitchen", color: "from-success to-emerald-600" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-warm flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">Café Luxe</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#portals" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Portals</a>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login/admin" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <HeroScene />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">Next-Gen Restaurant Management</span>
            </motion.div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold text-foreground leading-tight mb-6">
              Manage Your <br />
              <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">Restaurant</span>
              <br />Like Never Before
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              A complete system for orders, kitchen, tables, payments, inventory, and analytics — beautifully designed for every role.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login/admin">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3.5 rounded-xl gradient-warm text-primary-foreground font-semibold text-base shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
                >
                  Enter Admin Portal <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <a href="#features">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-base border border-border hover:bg-secondary/80 transition-colors"
                >
                  Explore Features
                </motion.button>
              </a>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6"
          >
            {[
              { label: "Active Tables", value: "20+" },
              { label: "Orders/Day", value: "500+" },
              { label: "Menu Items", value: "120+" },
              { label: "Staff Members", value: "50+" },
            ].map((s) => (
              <div key={s.label} className="glass-card p-4 text-center">
                <p className="text-2xl sm:text-3xl font-display font-bold text-primary">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Everything You Need</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mt-3">Powerful Features</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Every module designed to streamline your restaurant operations.</p>
          </motion.div>
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <motion.div key={f.title} variants={item} className="glass-card-elevated p-6 group hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 sm:py-32 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Simple & Effective</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mt-3">How It Works</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((h, i) => (
              <motion.div
                key={h.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl gradient-warm text-primary-foreground font-display font-bold text-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {h.step}
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">{h.title}</h3>
                <p className="text-sm text-muted-foreground">{h.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portals */}
      <section id="portals" className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Role-Based Access</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mt-3">Choose Your Portal</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={r.path}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="glass-card-elevated p-8 text-center group cursor-pointer h-full"
                  >
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${r.color} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:shadow-xl transition-shadow`}>
                      <r.icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h3 className="font-display font-bold text-xl text-foreground mb-3">{r.title}</h3>
                    <p className="text-sm text-muted-foreground mb-5">{r.desc}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                      Enter Portal <ArrowRight className="w-4 h-4" />
                    </span>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border/50 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-warm flex items-center justify-center">
              <UtensilsCrossed className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">Café Luxe</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Café Luxe Restaurant Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
