import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";

// Landing & Auth
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMenu from "./pages/admin/AdminMenu";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminTables from "./pages/admin/AdminTables";
import AdminKitchen from "./pages/admin/AdminKitchen";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminReports from "./pages/admin/AdminReports";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminUsers from "./pages/admin/AdminUsers";

// Kitchen pages
import KitchenDashboard from "./pages/kitchen/KitchenDashboard";
import KitchenOrders from "./pages/kitchen/KitchenOrders";
import KitchenNotifications from "./pages/kitchen/KitchenNotifications";

// Customer pages
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerMenu from "./pages/customer/CustomerMenu";
import CustomerOrders from "./pages/customer/CustomerOrders";
import CustomerFavorites from "./pages/customer/CustomerFavorites";
import CustomerNotifications from "./pages/customer/CustomerNotifications";
import CustomerProfile from "./pages/customer/CustomerProfile";
import CustomerReservation from "./pages/customer/CustomerReservation";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login/:role" element={<PageTransition><AuthPage /></PageTransition>} />

        {/* Admin */}
        <Route path="/admin" element={<PageTransition><AdminDashboard /></PageTransition>} />
        <Route path="/admin/menu" element={<PageTransition><AdminMenu /></PageTransition>} />
        <Route path="/admin/orders" element={<PageTransition><AdminOrders /></PageTransition>} />
        <Route path="/admin/tables" element={<PageTransition><AdminTables /></PageTransition>} />
        <Route path="/admin/kitchen" element={<PageTransition><AdminKitchen /></PageTransition>} />
        <Route path="/admin/payments" element={<PageTransition><AdminPayments /></PageTransition>} />
        <Route path="/admin/inventory" element={<PageTransition><AdminInventory /></PageTransition>} />
        <Route path="/admin/staff" element={<PageTransition><AdminStaff /></PageTransition>} />
        <Route path="/admin/reports" element={<PageTransition><AdminReports /></PageTransition>} />
        <Route path="/admin/customers" element={<PageTransition><AdminCustomers /></PageTransition>} />
        <Route path="/admin/notifications" element={<PageTransition><AdminNotifications /></PageTransition>} />
        <Route path="/admin/users" element={<PageTransition><AdminUsers /></PageTransition>} />

        {/* Kitchen */}
        <Route path="/kitchen" element={<PageTransition><KitchenDashboard /></PageTransition>} />
        <Route path="/kitchen/orders" element={<PageTransition><KitchenOrders /></PageTransition>} />
        <Route path="/kitchen/notifications" element={<PageTransition><KitchenNotifications /></PageTransition>} />

        {/* Customer */}
        <Route path="/customer" element={<PageTransition><CustomerDashboard /></PageTransition>} />
        <Route path="/customer/menu" element={<PageTransition><CustomerMenu /></PageTransition>} />
        <Route path="/customer/orders" element={<PageTransition><CustomerOrders /></PageTransition>} />
        <Route path="/customer/favorites" element={<PageTransition><CustomerFavorites /></PageTransition>} />
        <Route path="/customer/notifications" element={<PageTransition><CustomerNotifications /></PageTransition>} />
        <Route path="/customer/profile" element={<PageTransition><CustomerProfile /></PageTransition>} />
        <Route path="/customer/reservation" element={<PageTransition><CustomerReservation /></PageTransition>} />

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
