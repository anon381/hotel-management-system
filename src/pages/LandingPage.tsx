import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  UtensilsCrossed, ShieldCheck, ChefHat, Users, ArrowRight,
  BarChart3, ShoppingCart, Grid3X3, CreditCard, Package, Bell,
  Zap, Star, Sparkles, Coffee
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HeroScene } from "@/components/Scene3D";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  { icon: ShoppingCart, title: "Order Management", desc: "Track orders from placement to completion with real-time status updates." },
  { icon: ChefHat, title: "Kitchen Dashboard", desc: "Live kitchen queue with priority ordering and instant status sync." },
  { icon: Grid3X3, title: "Table Management", desc: "Visual floor plan with real-time availability and reservation tracking." },
  { icon: CreditCard, title: "Payments & Billing", desc: "Multi-method payments, tax calculation, and receipt generation." },
  { icon: Package, title: "Inventory Control", desc: "Automated stock tracking with low-stock alerts and supplier management." },
  { icon: BarChart3, title: "Analytics & Reports", desc: "Revenue trends, peak hours, top sellers, and performance insights." },
];

const howItWorks = [
  { step: "01", title: "Browse Menu", desc: "Explore our curated menu with rich descriptions, photos, and ratings to find your perfect dish." },
  { step: "02", title: "Choose a Table", desc: "View available tables across zones — Window, Patio, VIP — and reserve your favorite spot." },
  { step: "03", title: "Complete Order", desc: "Add items to your cart, customize your meal, and confirm your order for dine-in or takeaway." },
];

const roles = [
  { icon: ShieldCheck, title: "Admin Portal", desc: "Full system control — menu, staff, inventory, reports, and user management.", path: "/login/admin", color: "from-primary to-purple-700" },
  { icon: Users, title: "Customer Portal", desc: "Browse menus, place orders, track history, and earn loyalty rewards.", path: "/login/customer", color: "from-info to-blue-600" },
  { icon: ChefHat, title: "Kitchen Portal", desc: "Real-time order queue, priority management, and preparation tracking.", path: "/login/kitchen", color: "from-success to-emerald-600" },
];

export default function LandingPage() {
  const mainRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const howRef = useRef<HTMLDivElement>(null);
  const portalsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Navbar shrink on scroll
      ScrollTrigger.create({
        trigger: mainRef.current,
        start: "top top",
        end: "100px top",
        onUpdate: (self) => {
          if (navRef.current) {
            const progress = self.progress;
            gsap.to(navRef.current, {
              backdropFilter: `blur(${8 + progress * 16}px)`,
              borderBottomWidth: `${progress}px`,
              duration: 0.3,
            });
          }
        },
      });

      // Features cards - simple fade up
      if (featuresRef.current) {
        const cards = featuresRef.current.querySelectorAll(".feature-card");
        cards.forEach((card, i) => {
          gsap.set(card, { y: 60, opacity: 0 });
          ScrollTrigger.create({
            trigger: card,
            start: "top 90%",
            onEnter: () => {
              gsap.to(card, { y: 0, opacity: 1, duration: 0.7, delay: i * 0.08, ease: "power2.out" });
            },
            once: true,
          });
        });
      }

      // How it works steps
      if (howRef.current) {
        const steps = howRef.current.querySelectorAll(".step-card");
        steps.forEach((step, i) => {
          gsap.set(step, { y: 50, opacity: 0 });
          ScrollTrigger.create({
            trigger: step,
            start: "top 90%",
            onEnter: () => {
              gsap.to(step, { y: 0, opacity: 1, duration: 0.7, delay: i * 0.12, ease: "power2.out" });
            },
            once: true,
          });
        });
      }

      // Portal cards
      if (portalsRef.current) {
        const portalCards = portalsRef.current.querySelectorAll(".portal-card");
        portalCards.forEach((card, i) => {
          gsap.set(card, { y: 60, opacity: 0 });
          ScrollTrigger.create({
            trigger: card,
            start: "top 90%",
            onEnter: () => {
              gsap.to(card, { y: 0, opacity: 1, duration: 0.8, delay: i * 0.12, ease: "power2.out" });
            },
            once: true,
          });
        });
      }

      // Simple parallax on decorative blobs
      gsap.utils.toArray<HTMLElement>(".parallax-blob").forEach((el) => {
        const speed = Number(el.dataset.speed ?? 0.3);
        gsap.to(el, {
          yPercent: -30 * speed,
          ease: "none",
          scrollTrigger: {
            trigger: mainRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
        });
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={mainRef} className="min-h-screen bg-background overflow-x-hidden">
      {/* Animated Navbar */}
      <motion.nav
        ref={navRef}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 120 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center relative overflow-hidden"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <UtensilsCrossed className="w-5 h-5 text-primary-foreground relative z-10" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
            <div>
              <span className="font-display font-bold text-lg text-foreground">Café X</span>
              <motion.div
                className="h-0.5 bg-gradient-to-r from-primary to-accent rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </div>
          </motion.div>

          <div className="hidden md:flex items-center gap-1">
            {[
              { label: "Features", href: "#features" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "Portals", href: "#portals" },
            ].map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="relative px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full group-hover:w-3/4 transition-all duration-300" />
              </motion.a>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <ThemeToggle />
            </motion.div>
            <Link to="/login/admin">
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Navbar decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-px">
          <motion.div
            className="h-full bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>
      </motion.nav>

      {/* Hero - Full screen 3D */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* 3D Scene - full coverage */}
        <div className="absolute inset-0 z-0">
          <HeroScene />
        </div>

        {/* Parallax decorative blobs */}
        <div className="absolute inset-0 z-[1] pointer-events-none">
          <div data-speed="1.2" className="parallax-blob absolute top-[10%] left-[5%] w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div data-speed="0.8" className="parallax-blob absolute top-[30%] right-[5%] w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
          <div data-speed="1.5" className="parallax-blob absolute bottom-[20%] left-[8%] w-96 h-96 bg-accent/8 rounded-full blur-3xl" />
          <div data-speed="0.6" className="parallax-blob absolute bottom-[30%] right-[10%] w-64 h-64 bg-primary/6 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6 backdrop-blur-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">Next-Gen Restaurant Management</span>
            </motion.div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold text-foreground leading-tight mb-6">
              Welcome to <br />
              <motion.span
                className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%]"
                animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                Café X
              </motion.span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              A complete system for orders, kitchen, tables, payments, inventory, and analytics — beautifully designed for every role.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login/admin">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -15px hsla(var(--primary), 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3.5 rounded-xl gradient-warm text-primary-foreground font-semibold text-base shadow-lg transition-shadow flex items-center gap-2"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <a href="#features">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3.5 rounded-xl bg-secondary/80 backdrop-blur-sm text-secondary-foreground font-semibold text-base border border-border hover:bg-secondary transition-colors"
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
              { label: "Active Tables", value: "20+", icon: Coffee },
              { label: "Orders/Day", value: "500+", icon: ShoppingCart },
              { label: "Menu Items", value: "120+", icon: UtensilsCrossed },
              { label: "Staff Members", value: "50+", icon: Users },
            ].map((s) => (
              <motion.div
                key={s.label}
                whileHover={{ y: -4, scale: 1.02 }}
                className="glass-card p-4 text-center backdrop-blur-md"
              >
                <s.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-2xl sm:text-3xl font-display font-bold text-primary">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1">
            <motion.div
              className="w-1.5 h-3 rounded-full bg-primary"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Transition: Hero → Features */}
      <div className="relative -mt-16 h-32 sm:h-40 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
        <svg className="absolute bottom-0 left-0 w-full h-24 sm:h-32" viewBox="0 0 1440 140" preserveAspectRatio="none">
          <path d="M0,120 C160,80 300,130 460,95 C620,60 780,120 940,85 C1100,50 1280,100 1440,70 L1440,140 L0,140 Z" fill="hsl(var(--primary) / 0.15)" />
          <path d="M0,132 C320,115 700,138 1020,118 C1220,105 1340,110 1440,114 L1440,140 L0,140 Z" className="fill-background" />
        </svg>
      </div>

      {/* Features */}
      <section id="features" className="pt-10 sm:pt-14 pb-20 sm:pb-32 relative">
        <div ref={featuresRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Everything You Need</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mt-3">Powerful Features</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Every module designed to streamline your restaurant operations.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="feature-card glass-card-elevated p-6 group hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transition: Features → How It Works */}
      <div className="relative -mt-1">
        <svg className="w-full h-20 sm:h-28" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path d="M0,0 L0,60 C360,100 720,20 1080,80 C1260,100 1380,40 1440,60 L1440,0 Z" className="fill-background" />
          <path d="M0,80 C360,50 720,90 1080,60 C1260,50 1380,70 1440,80 L1440,100 L0,100 Z" fill="hsl(var(--muted) / 0.3)" />
        </svg>
      </div>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 sm:py-32 bg-muted/30 relative overflow-hidden">
        <div data-depth="34" className="parallax-bg parallax-shift absolute -top-20 left-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
        <div data-depth="42" className="parallax-bg parallax-shift absolute -bottom-20 right-0 w-60 h-60 bg-accent/5 rounded-full blur-3xl" />
        <div ref={howRef} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Simple & Effective</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mt-3">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((h) => (
              <div key={h.step} className="step-card text-center">
                <div className="w-16 h-16 rounded-2xl gradient-warm text-primary-foreground font-display font-bold text-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {h.step}
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">{h.title}</h3>
                <p className="text-sm text-muted-foreground">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transition: How It Works → Portals */}
      <div className="transition-band relative -mt-1">
        <svg className="parallax-shift w-full h-20 sm:h-28" data-depth="26" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="wave-grad-3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
              <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.15" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path d="M0,0 L0,50 C240,80 480,20 720,60 C960,90 1200,30 1440,50 L1440,0 Z" fill="hsl(var(--muted) / 0.3)" />
          <path d="M0,40 C360,80 720,30 1080,70 C1260,90 1380,50 1440,40 L1440,100 L0,100 Z" fill="url(#wave-grad-3)" />
          <path d="M0,70 C480,50 960,80 1440,60 L1440,100 L0,100 Z" className="fill-background" />
        </svg>
      </div>

      {/* Portals */}
      <section id="portals" className="py-20 sm:py-32">
        <div ref={portalsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Role-Based Access</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mt-3">Choose Your Portal</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((r) => (
              <Link key={r.title} to={r.path} className="portal-card">
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="glass-card-elevated p-8 text-center group cursor-pointer h-full"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${r.color} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                    <r.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-foreground mb-3">{r.title}</h3>
                  <p className="text-sm text-muted-foreground mb-5">{r.desc}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                    Enter Portal <ArrowRight className="w-4 h-4" />
                  </span>
                </motion.div>
              </Link>
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
            <span className="font-display font-bold text-foreground">Café X</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Café X Restaurant Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
