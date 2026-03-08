import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Star, ShoppingCart, TrendingUp, Heart, RotateCcw, Lightbulb } from "lucide-react";
import { CustomerLayout } from "@/components/CustomerLayout";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "@/hooks/use-toast";

interface Recommendation {
  name: string;
  emoji: string;
  price: number;
  rating: number;
  category: string;
  reason: string;
  reasonLabel: string;
  score: number;
}

const recommendations: Recommendation[] = [
  { name: "Wagyu Steak", emoji: "🥩", price: 85, rating: 4.9, category: "dinner", reason: "reorder", reasonLabel: "Order Again", score: 0.95 },
  { name: "Truffle Pasta", emoji: "🍝", price: 45, rating: 4.8, category: "dinner", reason: "similar_to_favorites", reasonLabel: "You might like", score: 0.88 },
  { name: "Sushi Platter", emoji: "🍣", price: 55, rating: 4.9, category: "special", reason: "trending", reasonLabel: "Trending", score: 0.82 },
  { name: "Lobster Bisque", emoji: "🦞", price: 28, rating: 4.8, category: "dinner", reason: "similar_to_favorites", reasonLabel: "Based on taste", score: 0.78 },
  { name: "Espresso Martini", emoji: "🍸", price: 14, rating: 4.7, category: "beverage", reason: "popular", reasonLabel: "Popular", score: 0.75 },
  { name: "Chocolate Lava Cake", emoji: "🍫", price: 14, rating: 4.9, category: "dessert", reason: "new_for_you", reasonLabel: "New for you", score: 0.70 },
];

const trendingItems = [
  { name: "Tiramisu", emoji: "🍰", price: 12, orders: 142, rating: 4.9 },
  { name: "Grilled Salmon", emoji: "🐟", price: 45, orders: 128, rating: 4.8 },
  { name: "Margherita Pizza", emoji: "🍕", price: 20, orders: 115, rating: 4.7 },
  { name: "Iced Latte", emoji: "☕", price: 6, orders: 203, rating: 4.4 },
];

const reasonColors: Record<string, string> = {
  reorder: "bg-success/10 text-success",
  similar_to_favorites: "bg-primary/10 text-primary",
  trending: "bg-warning/10 text-warning",
  popular: "bg-info/10 text-info",
  new_for_you: "bg-accent text-accent-foreground",
};

const reasonIcons: Record<string, typeof Sparkles> = {
  reorder: RotateCcw,
  similar_to_favorites: Heart,
  trending: TrendingUp,
  popular: Star,
  new_for_you: Lightbulb,
};

export default function CustomerRecommendations() {
  const [prefs, setPrefs] = useState({ spice: "mild", dietary: [] as string[] });

  const addToCart = (name: string) => {
    toast({ title: "Added to Cart! 🛒", description: `${name} has been added.` });
  };

  return (
    <CustomerLayout>
      <PageHeader title="For You" subtitle="AI-powered personalized recommendations" />

      {/* Personalized Picks */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="font-display font-semibold text-lg text-foreground">Personalized Picks</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {recommendations.map((item, i) => {
          const ReasonIcon = reasonIcons[item.reason] || Sparkles;
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className="glass-card-elevated p-5 group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-4xl">{item.emoji}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${reasonColors[item.reason]}`}>
                  <ReasonIcon className="w-3 h-3" /> {item.reasonLabel}
                </span>
              </div>
              <h3 className="font-semibold text-foreground">{item.name}</h3>
              <div className="flex items-center gap-2 mt-1 mb-3">
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 text-warning fill-warning" />
                  <span className="text-xs font-semibold text-foreground">{item.rating}</span>
                </div>
                <span className="text-xs text-muted-foreground capitalize">{item.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-display font-bold text-primary">${item.price}</span>
                <div className="w-8 h-1.5 rounded-full bg-muted overflow-hidden" title={`Match: ${Math.round(item.score * 100)}%`}>
                  <div className="h-full rounded-full bg-primary" style={{ width: `${item.score * 100}%` }} />
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => addToCart(item.name)}
                className="mt-3 w-full py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* Trending */}
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-warning" />
        <h2 className="font-display font-semibold text-lg text-foreground">Trending Now</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {trendingItems.map((item, i) => (
          <motion.div key={item.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.05 }} className="glass-card p-4 text-center">
            <span className="text-3xl block mb-2">{item.emoji}</span>
            <p className="text-sm font-semibold text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.orders} orders</p>
            <div className="flex items-center justify-center gap-0.5 mt-1">
              <Star className="w-3 h-3 text-warning fill-warning" />
              <span className="text-xs font-semibold text-foreground">{item.rating}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dietary Preferences */}
      <div className="glass-card-elevated p-5">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Your Preferences</h3>
        <p className="text-xs text-muted-foreground mb-3">Help us recommend better dishes for you.</p>
        <div className="flex flex-wrap gap-2">
          {["Vegetarian", "Vegan", "Gluten-Free", "Halal", "No Spicy", "Dairy-Free"].map(pref => {
            const active = prefs.dietary.includes(pref);
            return (
              <button key={pref} onClick={() => setPrefs(p => ({ ...p, dietary: active ? p.dietary.filter(d => d !== pref) : [...p.dietary, pref] }))} className={`text-xs px-3 py-1.5 rounded-full transition-colors ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                {pref}
              </button>
            );
          })}
        </div>
      </div>
    </CustomerLayout>
  );
}
