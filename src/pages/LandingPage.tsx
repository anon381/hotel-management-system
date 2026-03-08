import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  UtensilsCrossed, ChefHat, Users, ArrowRight,
  BarChart3, ShoppingCart, Grid3X3, CreditCard, Package,
  Zap, Star, Sparkles, Coffee
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
  { step: "01", title: "Browse Menu", desc: "Explore our curated menu with rich descriptions, photos, and ratings to find your perfect dish." },
  { step: "02", title: "Choose a Table", desc: "View available tables across zones — Window, Patio, VIP — and reserve your favorite spot." },
  { step: "03", title: "Complete Order", desc: "Add items to your cart, customize your meal, and confirm your order for dine-in or takeaway." },
];


export default function LandingPage() {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = Number(el.dataset.delay ?? 0);
            setTimeout(() => el.classList.add("animate-visible"), delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1 }
    );

    const animatedElements = mainRef.current?.querySelectorAll(".animate-on-scroll");
    animatedElements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={mainRef} className="min-h-screen bg-background overflow-x-hidden">
      {/* Animated Navbar */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 120 }}
        className="fixed top-4 left-4 right-4 z-50 bg-background/40 backdrop-blur-2xl backdrop-saturate-150 border border-border/20 rounded-2xl shadow-[0_8px_32px_-8px_hsl(var(--foreground)/0.08),0_2px_8px_-2px_hsl(var(--foreground)/0.04)]"
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
              { label: "Home", href: "#hero" },
              { label: "Our Story", href: "#portals" },
              { label: "Features", href: "#features" },
              { label: "How It Works", href: "#how-it-works" },
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
      <section id="hero" className="relative min-h-screen flex items-center justify-center pt-16">
        {/* 3D Scene - full coverage */}
        <div className="absolute inset-0 z-0">
          <HeroScene />
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

      {/* Our Story Timeline */}
      <section id="portals" className="py-20 sm:py-32 relative overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Since 2000</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mt-3">Our Story</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">From a single café to a beloved brand — here's how Café X grew over the years.</p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <motion.div
              className="absolute left-6 sm:left-1/2 sm:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/60 via-accent/40 to-primary/20 rounded-full"
              initial={{ scaleY: 0, originY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />

            {[
              { year: "2000", title: "The Beginning", desc: "Chef Marco Valentino opens the first Café X in downtown Milan — a 20-seat bistro with a dream of redefining casual dining.", icon: Coffee },
              { year: "2005", title: "Second Branch", desc: "Café X expands to a second location in Rome, doubling capacity and introducing our signature brunch menu.", icon: UtensilsCrossed },
              { year: "2010", title: "Award-Winning", desc: "Recognized as 'Best Urban Café' by Gourmet Weekly, with our espresso blend winning three international taste awards.", icon: Star },
              { year: "2015", title: "Going Digital", desc: "Launched our first online ordering system and loyalty program, serving 1,000+ digital orders in the first month.", icon: Zap },
              { year: "2020", title: "Five Locations", desc: "Expanded to five branches across Europe with a unified kitchen management system and centralized supply chain.", icon: Users },
              { year: "2026", title: "Café X Platform", desc: "Introducing our full-stack restaurant management platform — the system you're looking at right now.", icon: Sparkles },
            ].map((item, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: isLeft ? -60 : 60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className={`relative flex items-start gap-4 sm:gap-0 mb-12 last:mb-0 ${
                    isLeft ? "sm:flex-row" : "sm:flex-row-reverse"
                  }`}
                >
                  {/* Dot on timeline */}
                  <motion.div
                    className="absolute left-6 sm:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-lg shadow-primary/30 z-10"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                  />

                  {/* Content card */}
                  <div className={`ml-14 sm:ml-0 sm:w-[calc(50%-2rem)] ${isLeft ? "sm:pr-0 sm:text-right" : "sm:pl-0 sm:text-left"}`}>
                    <motion.div
                      whileHover={{ y: -4, scale: 1.02 }}
                      transition={{ duration: 0.25 }}
                      className="glass-card-elevated p-5 group hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                    >
                      <div className={`flex items-center gap-3 mb-3 ${isLeft ? "sm:flex-row-reverse" : ""}`}>
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <item.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-primary tracking-wider">{item.year}</span>
                          <h3 className="font-display font-semibold text-foreground">{item.title}</h3>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                      <motion.div
                        className={`h-0.5 bg-gradient-to-r from-primary/60 to-accent/40 rounded-full mt-3 ${isLeft ? "sm:origin-right origin-left" : "origin-left"}`}
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="pt-10 sm:pt-14 pb-20 sm:pb-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Everything You Need</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mt-3">Powerful Features</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Every module designed to streamline your restaurant operations.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.25 } }}
                className="glass-card-elevated p-6 group hover:border-primary/30 transition-colors duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-default"
              >
                <motion.div
                  className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300"
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <f.icon className="w-6 h-6 text-primary" />
                </motion.div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                <motion.div
                  className="h-0.5 bg-gradient-to-r from-primary/60 to-accent/40 rounded-full mt-4 origin-left"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 sm:py-32 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-success/5 rounded-full blur-3xl" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-success">Simple & Seamless</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mt-3">How It Works</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Three simple steps to enjoy the full Café X experience.</p>
          </div>

          {/* Step Progress Layout */}
          <div className="relative">
            {/* Horizontal connector line (desktop) */}
            <motion.div
              className="hidden md:block absolute top-[3.25rem] left-[16.67%] right-[16.67%] h-0.5 bg-border"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <motion.div
              className="hidden md:block absolute top-[3.25rem] left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-success via-success/80 to-success/40 origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
            />

            {/* Vertical connector line (mobile) */}
            <motion.div
              className="md:hidden absolute top-0 bottom-0 left-7 w-0.5 bg-border"
              initial={{ scaleY: 0, originY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            />
            <motion.div
              className="md:hidden absolute top-0 bottom-0 left-7 w-0.5 bg-gradient-to-b from-success via-success/80 to-success/40 origin-top"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.5 }}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-8">
              {howItWorks.map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="flex md:flex-col items-start md:items-center text-left md:text-center relative pb-10 md:pb-0 pl-16 md:pl-0"
                >
                  {/* Step circle */}
                  <motion.div
                    className="absolute left-0 md:relative md:left-auto w-14 h-14 rounded-full border-[3px] border-success bg-background flex items-center justify-center z-10 shadow-[0_0_16px_-4px_hsl(var(--success)/0.4)]"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.25, type: "spring", stiffness: 300, damping: 15 }}
                    whileHover={{ scale: 1.15, boxShadow: "0 0 24px -4px hsl(142 71% 45% / 0.5)" }}
                  >
                    <span className="text-xl font-display font-bold text-success">{item.step}</span>
                  </motion.div>

                  {/* Check pulse ring */}
                  <motion.div
                    className="absolute left-0 md:relative md:left-auto md:top-[-3.5rem] w-14 h-14 rounded-full border-2 border-success/30 pointer-events-none"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                    style={{ position: "absolute", top: 0 }}
                  />

                  {/* Content */}
                  <motion.div
                    className="md:mt-6 flex-1"
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="font-display font-semibold text-lg text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{item.desc}</p>
                    
                    {/* Completion indicator */}
                    <motion.div
                      className="flex items-center gap-2 mt-4 md:justify-center"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8 + i * 0.25 }}
                    >
                      <motion.div
                        className="w-5 h-5 rounded-full bg-success/15 flex items-center justify-center"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1 + i * 0.25, type: "spring" }}
                      >
                        <motion.svg
                          width="12" height="12" viewBox="0 0 12 12" fill="none"
                          className="text-success"
                          initial={{ pathLength: 0 }}
                          whileInView={{ pathLength: 1 }}
                          viewport={{ once: true }}
                        >
                          <motion.path
                            d="M2.5 6L5 8.5L9.5 3.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 1.1 + i * 0.25, duration: 0.4 }}
                          />
                        </motion.svg>
                      </motion.div>
                      <span className="text-xs font-medium text-success">Step {item.step}</span>
                    </motion.div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
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
