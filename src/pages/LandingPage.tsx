import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

function TypingText({ text, className }: { text: string; className?: string }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, 28);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <p className={className}>
      {displayed}
      {!done && <span className="inline-block w-0.5 h-5 bg-primary ml-0.5 animate-pulse align-middle" />}
    </p>
  );
}

export default function LandingPage() {
  const mainRef = useRef<HTMLDivElement>(null);
  const hasVisited = useRef(sessionStorage.getItem("cafex-visited") === "true");
  const [sceneReady, setSceneReady] = useState(hasVisited.current);
  const [loadProgress, setLoadProgress] = useState(0);
  const [showTapHint, setShowTapHint] = useState(false);

  // Simulate progress and mark visited
  useEffect(() => {
    if (hasVisited.current) return;
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 8 + 2;
      if (progress >= 100) progress = 100;
      setLoadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => setShowTapHint(true), 400);
      }
    }, 120);
    return () => clearInterval(interval);
  }, []);

  const handleDismissLoader = () => {
    if (loadProgress < 100) return;
    sessionStorage.setItem("cafex-visited", "true");
    setSceneReady(true);
  };

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
    <>
      {/* Loading Screen - only on first visit / reload */}
      <AnimatePresence>
        {!sceneReady && (
          <motion.div
            key="loader"
            exit={{ opacity: 0, scale: 1.08, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[999] bg-background flex flex-col items-center justify-center overflow-hidden cursor-pointer"
            onClick={handleDismissLoader}
          >
            {/* Radial gradient bg */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08)_0%,transparent_70%)]" />

            {/* Floating food emojis with interactive hover */}
            {["🍔", "🍕", "☕", "🍩", "🥐", "🍣", "🍰", "🌮", "🍝", "🍦", "🥑", "🧁"].map((emoji, i) => (
              <motion.span
                key={i}
                className="absolute text-3xl sm:text-5xl md:text-6xl select-none cursor-pointer"
                style={{
                  left: `${8 + (i * 15) % 84}%`,
                  top: `${5 + (i * 19) % 85}%`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 0.12, 0.08, 0.12],
                  scale: [0, 1, 0.9, 1],
                  y: [0, -25, 5, -25],
                  rotate: [0, 20, -10, 0],
                  x: [0, i % 2 === 0 ? 10 : -10, 0],
                }}
                whileHover={{
                  scale: 1.8,
                  opacity: 0.6,
                  rotate: [0, -20, 20, 0],
                  transition: { duration: 0.3 },
                }}
                whileTap={{ scale: 2.2, opacity: 0.8 }}
                transition={{
                  duration: 4 + i * 0.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.15,
                }}
              >
                {emoji}
              </motion.span>
            ))}

            {/* Center content */}
            <div className="relative z-10 flex flex-col items-center gap-5 px-6 max-w-md w-full">
              {/* Animated icon with concentric rings */}
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border border-primary/30"
                    animate={{
                      scale: [1, 1.4 + i * 0.3, 1],
                      opacity: [0.3, 0, 0.3],
                      rotate: [0, 120 * (i % 2 === 0 ? 1 : -1)],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeOut",
                      delay: i * 0.35,
                    }}
                  />
                ))}
                <motion.div
                  initial={{ scale: 0, rotate: -270 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 180, damping: 12 }}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl gradient-warm flex items-center justify-center shadow-2xl relative"
                >
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <UtensilsCrossed className="w-10 h-10 sm:w-12 sm:h-12 text-primary-foreground" />
                  </motion.div>
                </motion.div>
              </div>

              {/* Brand */}
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 120 }}
                className="font-display text-4xl sm:text-5xl font-bold text-foreground tracking-tight"
              >
                Café X
              </motion.h2>

              {/* Tagline with character-staggered reveal */}
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                {["Ready", "to", "enjoy", "your", "meal?", "🍽️"].map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20, filter: "blur(8px)", scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.5, type: "spring" }}
                    className="text-base sm:text-lg text-muted-foreground font-medium"
                  >
                    {word}
                  </motion.span>
                ))}
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-xs mt-2">
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full gradient-warm"
                    initial={{ width: "0%" }}
                    animate={{ width: `${loadProgress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-xs text-muted-foreground text-center mt-2"
                >
                  {loadProgress < 100 ? "Preparing your experience..." : ""}
                </motion.p>
              </div>

              {/* Tap to enter hint */}
              <AnimatePresence>
                {showTapHint && (
                  <motion.button
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    onClick={handleDismissLoader}
                    className="mt-2 px-8 py-3 rounded-2xl gradient-warm text-primary-foreground font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-shadow"
                  >
                    <motion.span
                      className="flex items-center gap-2"
                      animate={{ scale: [1, 1.03, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Sparkles className="w-5 h-5" />
                      Tap to Enter
                      <ArrowRight className="w-5 h-5" />
                    </motion.span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
      <section id="hero" className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* 3D Scene - full coverage */}
        <div className="absolute inset-0 z-0">
          <HeroScene onReady={() => setSceneReady(true)} />
        </div>

        {/* Left edge floating food emojis */}
        <div className="absolute left-0 top-0 bottom-0 w-28 sm:w-48 lg:w-72 z-[1] pointer-events-none">
          {["🍔", "🍕", "🍩", "☕", "🥐", "🍣", "🎂"].map((emoji, i) => (
            <motion.div
              key={`l${i}`}
              className="absolute text-3xl sm:text-4xl lg:text-5xl select-none"
              style={{
                left: 8 + (i % 3) * 28,
                top: `${10 + i * 12}%`,
                filter: `drop-shadow(0 0 8px hsl(var(--primary) / 0.2))`,
              }}
              animate={{
                y: [0, -15 - i * 4, 8, 0],
                x: [0, 10, -5, 0],
                rotate: [0, 8, -8, 0],
                opacity: [0.15, 0.35, 0.2, 0.15],
                scale: [1, 1.1, 0.95, 1],
              }}
              transition={{
                duration: 5 + i * 0.7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            >
              {emoji}
            </motion.div>
          ))}
          <motion.div
            className="absolute left-6 sm:left-12 top-[5%] bottom-[5%] w-px rounded-full"
            style={{ background: "linear-gradient(to bottom, transparent, hsl(var(--primary) / 0.15), transparent)" }}
            animate={{ opacity: [0.15, 0.4, 0.15] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>

        {/* Right edge floating food emojis */}
        <div className="absolute right-0 top-0 bottom-0 w-28 sm:w-48 lg:w-72 z-[1] pointer-events-none">
          {["🍰", "🥗", "🍦", "🌮", "🍷", "🧁", "🍝"].map((emoji, i) => (
            <motion.div
              key={`r${i}`}
              className="absolute text-3xl sm:text-4xl lg:text-5xl select-none"
              style={{
                right: 10 + (i % 3) * 24,
                top: `${8 + i * 13}%`,
                filter: `drop-shadow(0 0 8px hsl(var(--accent) / 0.2))`,
              }}
              animate={{
                y: [0, 12 + i * 3, -10, 0],
                x: [0, -12, 6, 0],
                rotate: [0, -10, 10, 0],
                opacity: [0.15, 0.35, 0.18, 0.15],
                scale: [1, 1.12, 0.92, 1],
              }}
              transition={{
                duration: 5.5 + i * 0.6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.45,
              }}
            >
              {emoji}
            </motion.div>
          ))}
          <motion.div
            className="absolute right-6 sm:right-12 top-[5%] bottom-[5%] w-px rounded-full"
            style={{ background: "linear-gradient(to bottom, transparent, hsl(var(--accent) / 0.15), transparent)" }}
            animate={{ opacity: [0.15, 0.4, 0.15] }}
            transition={{ duration: 3.5, repeat: Infinity }}
          />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
            <p className="text-xl sm:text-2xl text-foreground max-w-2xl mx-auto mb-8 [text-shadow:_0_1px_2px_hsl(var(--foreground)/0.15)]">
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Simple & Seamless</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mt-3">How It Works</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Three simple steps to enjoy the full Café X experience.</p>
          </div>

          {/* Step Progress Layout */}
          <div className="relative">
            {/* Horizontal connector line (desktop) */}
            <motion.div
              className="hidden md:block absolute top-[3.25rem] left-[16.67%] right-[16.67%] h-1 bg-border rounded-full"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            <motion.div
              className="hidden md:block absolute top-[3.25rem] left-[16.67%] right-[16.67%] h-1 bg-gradient-to-r from-[hsl(270,80%,60%)] via-[hsl(290,75%,55%)] to-[hsl(250,80%,60%)] origin-left rounded-full"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2.5, delay: 0.8, ease: "easeOut" }}
            />

            {/* Vertical connector line (mobile) */}
            <motion.div
              className="md:hidden absolute top-0 bottom-0 left-7 w-1 bg-border rounded-full"
              initial={{ scaleY: 0, originY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5 }}
            />
            <motion.div
              className="md:hidden absolute top-0 bottom-0 left-7 w-1 bg-gradient-to-b from-[hsl(270,80%,60%)] via-[hsl(290,75%,55%)] to-[hsl(250,80%,60%)] origin-top rounded-full"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2.5, delay: 0.8 }}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-8">
              {howItWorks.map((item, i) => {
                const gradients = [
                  "from-[hsl(270,80%,60%)] to-[hsl(300,70%,55%)]",
                  "from-[hsl(290,75%,55%)] to-[hsl(330,80%,60%)]",
                  "from-[hsl(250,80%,60%)] to-[hsl(280,90%,65%)]",
                ];
                const shadowColors = [
                  "shadow-[0_0_24px_-2px_hsl(285,75%,58%,0.5)]",
                  "shadow-[0_0_24px_-2px_hsl(310,78%,58%,0.5)]",
                  "shadow-[0_0_24px_-2px_hsl(265,85%,63%,0.5)]",
                ];
                return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.7, delay: 0.4 + i * 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="flex md:flex-col items-start md:items-center text-left md:text-center relative pb-10 md:pb-0 pl-16 md:pl-0"
                >
                  {/* Step circle with unique gradient */}
                  <motion.div
                    className={`absolute left-0 md:relative md:left-auto w-14 h-14 rounded-full bg-gradient-to-br ${gradients[i]} flex items-center justify-center z-10 ${shadowColors[i]}`}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 + i * 0.35, type: "spring", stiffness: 200, damping: 18 }}
                    whileHover={{ scale: 1.15 }}
                  >
                    <span className="text-xl font-display font-bold text-primary-foreground">{item.step}</span>
                  </motion.div>

                  {/* Pulse ring */}
                  <motion.div
                    className={`absolute left-0 md:relative md:left-auto md:top-[-3.5rem] w-14 h-14 rounded-full border-2 border-primary/30 pointer-events-none`}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.7 }}
                    style={{ position: "absolute", top: 0 }}
                  />

                  {/* Content */}
                  <motion.div
                    className="md:mt-6 flex-1"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.8 + i * 0.35, ease: "easeOut" }}
                    whileHover={{ y: -4 }}
                  >
                    <motion.h3 
                      className="font-display font-semibold text-lg text-foreground mb-2"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.9 + i * 0.35 }}
                    >
                      {item.title}
                    </motion.h3>
                    <motion.p 
                      className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 1.0 + i * 0.35 }}
                    >
                      {item.desc}
                    </motion.p>
                    
                    {/* Completion indicator */}
                    <motion.div
                      className="flex items-center gap-2 mt-4 md:justify-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 1.2 + i * 0.35, duration: 0.4 }}
                    >
                      <motion.div
                        className={`w-5 h-5 rounded-full bg-gradient-to-br ${gradients[i]} flex items-center justify-center`}
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1.3 + i * 0.35, type: "spring", stiffness: 200 }}
                      >
                        <motion.svg
                          width="12" height="12" viewBox="0 0 12 12" fill="none"
                          className="text-primary-foreground"
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
                            transition={{ delay: 1.4 + i * 0.35, duration: 0.5 }}
                          />
                        </motion.svg>
                      </motion.div>
                      <motion.span 
                        className="text-xs font-medium bg-gradient-to-r from-[hsl(270,80%,60%)] to-[hsl(290,75%,55%)] bg-clip-text text-transparent"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1.5 + i * 0.35 }}
                      >
                        Step {item.step}
                      </motion.span>
                    </motion.div>
                  </motion.div>
                </motion.div>
                );
              })}
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
    </>
  );
}
