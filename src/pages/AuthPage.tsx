import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck, ChefHat, Users, UtensilsCrossed, Eye, EyeOff,
  ArrowLeft, Mail, Lock, User, Phone, Loader2
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SmallScene3D } from "@/components/Scene3D";
import { api } from "@/lib/api";

const roleConfig = {
  admin: {
    icon: ShieldCheck,
    title: "Admin Portal",
    subtitle: "Full system management & control",
    color: "from-primary to-orange-600",
    redirectTo: "/admin",
  },
  customer: {
    icon: Users,
    title: "Customer Portal",
    subtitle: "Order food & track your meals",
    color: "from-info to-blue-600",
    redirectTo: "/customer",
  },
  kitchen: {
    icon: ChefHat,
    title: "Kitchen Portal",
    subtitle: "Manage orders & preparation",
    color: "from-success to-emerald-600",
    redirectTo: "/kitchen",
  },
};

export default function AuthPage() {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.admin;
  const Icon = config.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Register flow
        const response = await api.post("/auth/signup", {
          full_name: formData.name, // the backend expects 'full_name' not 'name'
          email: formData.email,
          password: formData.password,
          role: role || "customer",
          phone: formData.phone,
        });

        // Registration usually returns a token directly
        if (response.token) {
          localStorage.setItem("token", response.token);
          localStorage.setItem("user", JSON.stringify(response.user));
          navigate(config.redirectTo);
        } else {
          // If no token is returned, meaning they need to log in manually afterwards
          setIsSignUp(false);
          setFormData({ ...formData, password: "" }); // keep email typed in for ease of login
          setError("Registration successful! Please log in.");
        }
      } else {
        // Login flow
        const response = await api.post("/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        // Role-based access control check
        const userRoles = response.roles || [];
        const requestedRole = role || "customer";

        let hasAccess = false;
        if (requestedRole === "admin") {
          hasAccess = userRoles.includes("admin") || userRoles.includes("manager");
        } else if (requestedRole === "kitchen") {
          hasAccess = userRoles.includes("kitchen_staff") || userRoles.includes("admin") || userRoles.includes("manager");
        } else {
          hasAccess = true; // Customers can always log into the customer portal
        }

        if (!hasAccess) {
          setError(`Access denied. This account does not have ${requestedRole} privileges.`);
          setIsLoading(false);
          return;
        }

        // The Supabase backend returns session inside response.session
        const token = response.session?.access_token || response.token;
        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify({ ...response.user, role: requestedRole, roles: userRoles }));
          navigate(config.redirectTo);
        } else {
          setError("Login failed: No access token returned.");
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel - 3D scene (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-hero items-center justify-center">
        <div className="absolute inset-0 opacity-30">
          <SmallScene3D />
        </div>
        <div className="relative z-10 text-center px-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${config.color} flex items-center justify-center mx-auto mb-8 shadow-2xl`}
          >
            <Icon className="w-12 h-12 text-primary-foreground" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-display font-bold text-white mb-4"
          >
            {config.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-white/70"
          >
            {config.subtitle}
          </motion.p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-warm flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-foreground hidden sm:block">Café X</span>
            </Link>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            {/* Mobile role icon */}
            <div className="lg:hidden flex justify-center mb-6">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
                <Icon className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                {isSignUp ? `Sign up for ${config.title}` : `Sign in to ${config.title}`}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div
                    key="phone"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-11 pl-10 pr-11 rounded-xl border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!isSignUp && (
                <div className="flex justify-end">
                  <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
                </div>
              )}

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                className={`w-full h-12 rounded-xl bg-gradient-to-r ${config.color} text-primary-foreground font-semibold text-sm shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSignUp ? "Create Account" : "Sign In"}
              </motion.button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button 
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setFormData({ name: "", email: "", phone: "", password: "" });
                  setError("");
                }} 
                className="text-primary font-semibold hover:underline"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>

            {/* Other portals */}
            <div className="mt-8 pt-6 border-t border-border/50">
              <p className="text-xs text-muted-foreground text-center mb-3">Other portals</p>
              <div className="flex justify-center gap-3">
                {Object.entries(roleConfig)
                  .filter(([key]) => key !== role)
                  .map(([key, cfg]) => (
                    <Link key={key} to={`/login/${key}`}>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center shadow-md`}
                      >
                        <cfg.icon className="w-4 h-4 text-primary-foreground" />
                      </motion.div>
                    </Link>
                  ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
