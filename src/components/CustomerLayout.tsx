import { ReactNode } from "react";
import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed, LayoutDashboard, ShoppingCart, Heart, User, Bell, LogOut, Menu, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { title: "Home", icon: LayoutDashboard, path: "/customer" },
  { title: "Menu", icon: UtensilsCrossed, path: "/customer/menu" },
  { title: "My Orders", icon: ShoppingCart, path: "/customer/orders" },
  { title: "Favorites", icon: Heart, path: "/customer/favorites" },
  { title: "Reserve Table", icon: CalendarDays, path: "/customer/reservation" },
  { title: "Notifications", icon: Bell, path: "/customer/notifications" },
  { title: "Profile", icon: User, path: "/customer/profile" },
];

function CustomerSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const content = (
    <div className="flex flex-col h-full">
      <div className="p-4 flex items-center gap-3 border-b border-border/30">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-info to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
          <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden">
              <h1 className="font-display text-lg font-bold text-foreground whitespace-nowrap">Café X</h1>
              <p className="text-[10px] text-muted-foreground whitespace-nowrap">Customer Portal</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}>
              <motion.div className={`nav-item ${isActive ? "active" : "text-muted-foreground hover:text-foreground"}`} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">{item.title}</motion.span>}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border/30 space-y-3">
        <div className="flex justify-center"><ThemeToggle /></div>
        <button onClick={() => navigate("/")} className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted/50 transition-colors text-sm">
          <LogOut className="w-4 h-4" />{!collapsed && <span>Logout</span>}
        </button>
        <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex items-center justify-center w-full py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-background/60 backdrop-blur-xl border border-border/30 flex items-center justify-center shadow-lg">
        <Menu className="w-5 h-5 text-foreground" />
      </button>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lg:hidden fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="lg:hidden fixed left-4 top-4 bottom-4 w-[260px] bg-background/40 backdrop-blur-2xl backdrop-saturate-150 border border-border/20 z-50 shadow-2xl rounded-2xl">
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <motion.aside animate={{ width: collapsed ? 72 : 260 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="hidden lg:block fixed left-0 top-0 bottom-0 bg-background/40 backdrop-blur-2xl backdrop-saturate-150 z-30 border-r border-border/20 overflow-hidden sidebar-curved shadow-[0_8px_32px_-8px_hsl(var(--foreground)/0.08)]">
        {content}
      </motion.aside>
      <motion.div animate={{ width: collapsed ? 72 : 260 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="hidden lg:block flex-shrink-0" />
    </>
  );
}

export function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <CustomerSidebar />
      <main className="flex-1 min-w-0 lg:pl-0">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}