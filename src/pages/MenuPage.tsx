import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Star, Clock, Flame, Leaf, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";

const categories = ["All", "Breakfast", "Lunch", "Dinner", "Drinks", "Desserts", "Snacks"];

const menuItems = [
  { id: 1, name: "Wagyu Steak", category: "Dinner", price: 85, image: "🥩", desc: "Premium A5 wagyu, grilled to perfection", time: "25 min", labels: ["chef"], available: true },
  { id: 2, name: "Grilled Salmon", category: "Lunch", price: 45, image: "🐟", desc: "Atlantic salmon with herb butter", time: "18 min", labels: ["chef"], available: true },
  { id: 3, name: "Margherita Pizza", category: "Lunch", price: 20, image: "🍕", desc: "Fresh mozzarella, basil, tomato sauce", time: "15 min", labels: ["vegetarian"], available: true },
  { id: 4, name: "Truffle Pasta", category: "Dinner", price: 45, image: "🍝", desc: "Handmade pasta with truffle cream", time: "20 min", labels: ["chef"], available: true },
  { id: 5, name: "Caesar Salad", category: "Lunch", price: 16, image: "🥗", desc: "Romaine, parmesan, croutons", time: "8 min", labels: ["vegetarian"], available: true },
  { id: 6, name: "Burger Deluxe", category: "Lunch", price: 22, image: "🍔", desc: "Angus beef, cheddar, special sauce", time: "12 min", labels: ["spicy"], available: true },
  { id: 7, name: "Pancake Stack", category: "Breakfast", price: 14, image: "🥞", desc: "Fluffy pancakes, maple syrup, berries", time: "10 min", labels: [], available: true },
  { id: 8, name: "Eggs Benedict", category: "Breakfast", price: 18, image: "🍳", desc: "Poached eggs, hollandaise, ham", time: "12 min", labels: ["chef"], available: false },
  { id: 9, name: "Tiramisu", category: "Desserts", price: 12, image: "🍰", desc: "Classic Italian coffee dessert", time: "5 min", labels: [], available: true },
  { id: 10, name: "Mojito", category: "Drinks", price: 10, image: "🍹", desc: "Fresh mint, lime, rum", time: "3 min", labels: [], available: true },
  { id: 11, name: "Espresso", category: "Drinks", price: 4, image: "☕", desc: "Double shot, Italian roast", time: "2 min", labels: [], available: true },
  { id: 12, name: "Spring Rolls", category: "Snacks", price: 8, image: "🥟", desc: "Crispy veggie rolls, sweet chili", time: "7 min", labels: ["vegetarian", "spicy"], available: true },
];

const labelIcons: Record<string, { icon: typeof Star; className: string }> = {
  chef: { icon: Star, className: "text-warning" },
  spicy: { icon: Flame, className: "text-destructive" },
  vegetarian: { icon: Leaf, className: "text-success" },
};

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = menuItems.filter((item) => {
    const matchCat = activeCategory === "All" || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <AppLayout>
      <PageHeader
        title="Menu Management"
        subtitle="Manage your restaurant's menu items"
        actions={
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="gradient-warm text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" /> Add Item
          </motion.button>
        }
      />

      {/* Search & Categories */}
      <div className="mb-6 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu items..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "gradient-warm text-primary-foreground shadow-md"
                  : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`glass-card-elevated overflow-hidden group ${!item.available ? "opacity-60" : ""}`}
            >
              {/* Image area */}
              <div className="h-36 bg-muted/50 flex items-center justify-center text-5xl relative">
                <motion.span whileHover={{ scale: 1.2, rotate: 5 }} className="cursor-default">
                  {item.image}
                </motion.span>
                {/* Labels */}
                <div className="absolute top-2 left-2 flex gap-1">
                  {item.labels.map((l) => {
                    const info = labelIcons[l];
                    if (!info) return null;
                    const LIcon = info.icon;
                    return <LIcon key={l} className={`w-4 h-4 ${info.className}`} />;
                  })}
                </div>
                {!item.available && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                    <span className="text-sm font-semibold text-destructive bg-destructive/10 px-3 py-1 rounded-full">Unavailable</span>
                  </div>
                )}
                {/* Actions */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-7 h-7 rounded-lg bg-card/90 border border-border flex items-center justify-center hover:bg-muted">
                    <Edit2 className="w-3 h-3 text-foreground" />
                  </button>
                  <button className="w-7 h-7 rounded-lg bg-card/90 border border-border flex items-center justify-center hover:bg-muted">
                    {item.available ? <EyeOff className="w-3 h-3 text-foreground" /> : <Eye className="w-3 h-3 text-foreground" />}
                  </button>
                  <button className="w-7 h-7 rounded-lg bg-card/90 border border-border flex items-center justify-center hover:bg-destructive/10">
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-display font-semibold text-foreground">{item.name}</h3>
                  <span className="text-primary font-bold">${item.price}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{item.desc}</p>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Clock className="w-3 h-3" /> {item.time}
                  <span className="bg-muted px-2 py-0.5 rounded-full">{item.category}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </AppLayout>
  );
}
