import { motion } from "framer-motion";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { CustomerLayout } from "@/components/CustomerLayout";
import { PageHeader } from "@/components/PageHeader";

const favorites = [
  { name: "Wagyu Steak", price: "$85", rating: 4.9, emoji: "🥩" },
  { name: "Tiramisu", price: "$12", rating: 4.9, emoji: "🍰" },
  { name: "Grilled Salmon", price: "$45", rating: 4.8, emoji: "🐟" },
  { name: "Truffle Pasta", price: "$45", rating: 4.8, emoji: "🍝" },
];

export default function CustomerFavorites() {
  return (
    <CustomerLayout>
      <PageHeader title="Favorites" subtitle="Your saved favorite dishes" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {favorites.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -6 }}
            className="glass-card-elevated p-5 group"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-5xl">{item.emoji}</span>
              <Heart className="w-5 h-5 text-destructive fill-destructive" />
            </div>
            <h3 className="font-semibold text-foreground">{item.name}</h3>
            <div className="flex items-center justify-between mt-2">
              <span className="text-lg font-display font-bold text-primary">{item.price}</span>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                <span className="text-xs font-semibold">{item.rating}</span>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-3 w-full py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors flex items-center justify-center gap-2">
              <ShoppingCart className="w-4 h-4" /> Order Again
            </motion.button>
          </motion.div>
        ))}
      </div>
    </CustomerLayout>
  );
}
