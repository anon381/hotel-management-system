import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, UtensilsCrossed, ShoppingCart, Grid3X3, ChefHat,
  CreditCard, Package, Users, BarChart3, Heart, Bell, Shield,
  ChevronLeft, ChevronRight, Menu, LogOut
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const navSections = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Menu", icon: UtensilsCrossed, path: "/admin/menu" },
      { title: "Orders", icon: ShoppingCart, path: "/admin/orders" },
      { title: "Tables", icon: Grid3X3, path: "/admin/tables" },
      { title: "Kitchen", icon: ChefHat, path: "/admin/kitchen" },
    ],
  },
  {
    label: "Business",
    items: [
      { title: "Payments", icon: CreditCard, path: "/admin/payments" },
      { title: "Inventory", icon: Package, path: "/admin/inventory" },
      { title: "Staff", icon: Users, path: "/admin/staff" },
      { title: "Reports", icon: BarChart3, path: "/admin/reports" },
    ],
  },
  {
    label: "More",
    items: [
      { title: "Customers", icon: Heart, path: "/admin/customers" },
      { title: "Notifications", icon: Bell, path: "/admin/notifications" },
      { title: "Users & Roles", icon: Shield, path: "/admin/users" },
    ],
  },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 flex items-center gap-3 border-b border-border/30">
        <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center shadow-lg flex-shrink-0">
          <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden">
              <h1 className="font-display text-lg font-bold text-foreground whitespace-nowrap">Café X</h1>
              <p className="text-[10px] text-muted-foreground whitespace-nowrap">Admin Portal</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navSections.map((section) => (
          <div key={section.label}>
            <AnimatePresence>
              {!collapsed && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold mb-2 px-3"
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
                      className={`nav-item ${isActive ? "active" : "text-muted-foreground hover:text-foreground"}`}
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

      <div className="p-4 border-t border-border/30 space-y-3">
        <div className="flex justify-center">
          <ThemeToggle />
        </div>
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted/50 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Logout</span>}
        </button>
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
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center shadow-lg"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>
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
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[260px] bg-sidebar/80 backdrop-blur-2xl backdrop-saturate-150 z-50 shadow-2xl sidebar-curved"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="hidden lg:block fixed left-0 top-0 bottom-0 bg-sidebar/80 backdrop-blur-2xl backdrop-saturate-150 z-30 border-r border-sidebar-border/50 overflow-hidden sidebar-curved shadow-xl"
      >
        {sidebarContent}
      </motion.aside>
      <motion.div
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="hidden lg:block flex-shrink-0"
      />
    </>
  );
}
