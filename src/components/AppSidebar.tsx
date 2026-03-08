import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, UtensilsCrossed, ShoppingCart, Grid3X3, ChefHat,
  CreditCard, Package, Users, BarChart3, Heart, Bell, Shield,
  ChevronLeft, ChevronRight, Menu
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const navSections = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, path: "/" },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Menu", icon: UtensilsCrossed, path: "/menu" },
      { title: "Orders", icon: ShoppingCart, path: "/orders" },
      { title: "Tables", icon: Grid3X3, path: "/tables" },
      { title: "Kitchen", icon: ChefHat, path: "/kitchen" },
    ],
  },
  {
    label: "Business",
    items: [
      { title: "Payments", icon: CreditCard, path: "/payments" },
      { title: "Inventory", icon: Package, path: "/inventory" },
      { title: "Staff", icon: Users, path: "/staff" },
      { title: "Reports", icon: BarChart3, path: "/reports" },
    ],
  },
  {
    label: "More",
    items: [
      { title: "Customers", icon: Heart, path: "/customers" },
      { title: "Notifications", icon: Bell, path: "/notifications" },
      { title: "Users & Roles", icon: Shield, path: "/users" },
    ],
  },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center shadow-lg flex-shrink-0">
          <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden">
              <h1 className="font-display text-lg font-bold text-sidebar-foreground whitespace-nowrap">Café X</h1>
              <p className="text-[10px] text-sidebar-foreground/50 whitespace-nowrap">Restaurant Management</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navSections.map((section) => (
          <div key={section.label}>
            <AnimatePresence>
              {!collapsed && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 font-semibold mb-2 px-3"
                >
                  {section.label}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}>
                    <motion.div
                      className={`nav-item ${isActive ? "active" : "text-sidebar-foreground/70"}`}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
                            {item.title}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {isActive && !collapsed && <div className="pulse-dot ml-auto" />}
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="flex justify-center">
          <ThemeToggle />
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center w-full py-2 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center shadow-lg"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[260px] bg-sidebar z-50 shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="hidden lg:block fixed left-0 top-0 bottom-0 bg-sidebar z-30 border-r border-sidebar-border overflow-hidden"
      >
        {sidebarContent}
      </motion.aside>

      {/* Spacer */}
      <motion.div
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="hidden lg:block flex-shrink-0"
      />
    </>
  );
}
