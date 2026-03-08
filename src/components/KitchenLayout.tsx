import { ReactNode } from "react";
import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, LayoutDashboard, ShoppingCart, Bell, LogOut, Menu, ChevronLeft, ChevronRight, UtensilsCrossed } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { title: "Kitchen Dashboard", icon: LayoutDashboard, path: "/kitchen" },
  { title: "Order Queue", icon: ShoppingCart, path: "/kitchen/orders" },
  { title: "Notifications", icon: Bell, path: "/kitchen/notifications" },
];

function KitchenSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const content = (
    <div className="flex flex-col h-full">
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center shadow-lg flex-shrink-0">
          <ChefHat className="w-5 h-5 text-primary-foreground" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden">
              <h1 className="font-display text-lg font-bold text-sidebar-foreground whitespace-nowrap">Kitchen</h1>
              <p className="text-[10px] text-sidebar-foreground/50 whitespace-nowrap">Staff Portal</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}>
              <motion.div className={`nav-item ${isActive ? "active" : "text-sidebar-foreground/70"}`} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">{item.title}</motion.span>}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="flex justify-center"><ThemeToggle /></div>
        <button onClick={() => navigate("/")} className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sidebar-foreground/50 hover:text-destructive hover:bg-sidebar-accent transition-colors text-sm">
          <LogOut className="w-4 h-4" />{!collapsed && <span>Logout</span>}
        </button>
        <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex items-center justify-center w-full py-2 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center shadow-lg">
        <Menu className="w-5 h-5 text-foreground" />
      </button>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lg:hidden fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="lg:hidden fixed left-0 top-0 bottom-0 w-[260px] bg-sidebar/80 backdrop-blur-2xl backdrop-saturate-150 z-50 shadow-2xl sidebar-curved">
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <motion.aside animate={{ width: collapsed ? 72 : 260 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="hidden lg:block fixed left-0 top-0 bottom-0 bg-sidebar/80 backdrop-blur-2xl backdrop-saturate-150 z-30 border-r border-sidebar-border/50 overflow-hidden sidebar-curved shadow-xl">
        {content}
      </motion.aside>
      <motion.div animate={{ width: collapsed ? 72 : 260 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="hidden lg:block flex-shrink-0" />
    </>
  );
}

export function KitchenLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <KitchenSidebar />
      <main className="flex-1 min-w-0 lg:pl-0">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
