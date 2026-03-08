import { Moon, Sun, Stars, CloudMoon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-20 h-10 rounded-full border border-border/50 p-1 flex items-center overflow-hidden"
      whileTap={{ scale: 0.92 }}
      style={{
        background: isDark
          ? "linear-gradient(135deg, hsl(250 40% 12%), hsl(270 50% 18%))"
          : "linear-gradient(135deg, hsl(200 80% 85%), hsl(40 90% 88%))",
      }}
    >
      {/* Background decorations */}
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="stars"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 overflow-hidden"
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-primary-foreground/60"
                style={{
                  top: `${15 + Math.random() * 70}%`,
                  left: `${5 + Math.random() * 50}%`,
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 1.5 + Math.random(),
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
            <CloudMoon className="absolute bottom-1 left-2 w-3 h-3 text-primary-foreground/20" />
          </motion.div>
        ) : (
          <motion.div
            key="clouds"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 overflow-hidden"
          >
            <motion.div
              className="absolute w-4 h-2 rounded-full bg-white/40"
              style={{ top: "20%", right: "15%" }}
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="absolute w-3 h-1.5 rounded-full bg-white/30"
              style={{ bottom: "25%", right: "30%" }}
              animate={{ x: [0, -2, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sliding orb */}
      <motion.div
        className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
        animate={{
          x: isDark ? 38 : 0,
          background: isDark
            ? "linear-gradient(135deg, hsl(260 60% 50%), hsl(280 70% 40%))"
            : "linear-gradient(135deg, hsl(40 95% 55%), hsl(30 90% 50%))",
          boxShadow: isDark
            ? "0 0 16px 4px hsl(270 60% 50% / 0.5), 0 0 30px 8px hsl(280 70% 40% / 0.3)"
            : "0 0 16px 4px hsl(40 90% 55% / 0.5), 0 0 30px 8px hsl(30 80% 50% / 0.3)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="moon-icon"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="w-4 h-4 text-primary-foreground" />
            </motion.div>
          ) : (
            <motion.div
              key="sun-icon"
              initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="w-4 h-4 text-primary-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.button>
  );
}
