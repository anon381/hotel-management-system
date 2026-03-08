// App entry
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login/:role" element={<AuthPage />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/menu" element={<AdminMenu />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/tables" element={<AdminTables />} />
            <Route path="/admin/kitchen" element={<AdminKitchen />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/inventory" element={<AdminInventory />} />
            <Route path="/admin/staff" element={<AdminStaff />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="/admin/users" element={<AdminUsers />} />

            {/* Kitchen */}
            <Route path="/kitchen" element={<KitchenDashboard />} />
            <Route path="/kitchen/orders" element={<KitchenOrders />} />
            <Route path="/kitchen/notifications" element={<KitchenNotifications />} />

            {/* Customer */}
            <Route path="/customer" element={<CustomerDashboard />} />
            <Route path="/customer/menu" element={<CustomerMenu />} />
            <Route path="/customer/orders" element={<CustomerOrders />} />
            <Route path="/customer/favorites" element={<CustomerFavorites />} />
            <Route path="/customer/notifications" element={<CustomerNotifications />} />
            <Route path="/customer/profile" element={<CustomerProfile />} />
            <Route path="/customer/reservation" element={<CustomerReservation />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
