import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Star, ShoppingCart, Heart } from "lucide-react";
import { CustomerLayout } from "@/components/CustomerLayout";
import { PageHeader } from "@/components/PageHeader";

const categories = ["All", "Breakfast", "Lunch", "Dinner", "Drinks", "Desserts", "Sides", "Specials"];

const menuItems = [
  { name: "Wagyu Steak", category: "Dinner", price: "$85", rating: 4.9, emoji: "🥩", desc: "Premium grade wagyu with truffle butter", tags: ["Chef's Special"] },
  { name: "Grilled Salmon", category: "Lunch", price: "$45", rating: 4.8, emoji: "🐟", desc: "Atlantic salmon with herb crust", tags: ["Healthy"] },
  { name: "Margherita Pizza", category: "Lunch", price: "$20", rating: 4.7, emoji: "🍕", desc: "Fresh mozzarella, basil, tomato", tags: ["Vegetarian"] },
  { name: "Truffle Pasta", category: "Dinner", price: "$45", rating: 4.8, emoji: "🍝", desc: "Black truffle cream sauce", tags: ["Chef's Special"] },
  { name: "Avocado Toast", category: "Breakfast", price: "$14", rating: 4.5, emoji: "🥑", desc: "Sourdough, poached egg, microgreens", tags: ["Healthy", "Vegetarian"] },
  { name: "Pancakes", category: "Breakfast", price: "$16", rating: 4.6, emoji: "🥞", desc: "Buttermilk stack with maple syrup", tags: [] },
  { name: "Iced Latte", category: "Drinks", price: "$6", rating: 4.4, emoji: "☕", desc: "Double shot espresso over ice", tags: [] },
  { name: "Tiramisu", category: "Desserts", price: "$12", rating: 4.9, emoji: "🍰", desc: "Classic Italian coffee dessert", tags: ["Popular"] },
  { name: "Caesar Salad", category: "Lunch", price: "$18", rating: 4.5, emoji: "🥗", desc: "Crisp romaine, parmesan, croutons", tags: ["Healthy"] },
  { name: "Eggs Benedict", category: "Breakfast", price: "$17", rating: 4.7, emoji: "🍳", desc: "Poached eggs, hollandaise, English muffin", tags: ["Popular"] },
  { name: "Lobster Bisque", category: "Dinner", price: "$28", rating: 4.8, emoji: "🦞", desc: "Rich creamy lobster soup with sherry", tags: ["Chef's Special"] },
  { name: "Fish & Chips", category: "Lunch", price: "$22", rating: 4.4, emoji: "🐠", desc: "Beer-battered cod with tartar sauce", tags: [] },
  { name: "Matcha Latte", category: "Drinks", price: "$7", rating: 4.6, emoji: "🍵", desc: "Ceremonial grade matcha with oat milk", tags: ["Healthy"] },
  { name: "Chocolate Lava Cake", category: "Desserts", price: "$14", rating: 4.9, emoji: "🍫", desc: "Warm molten center with vanilla ice cream", tags: ["Popular"] },
  { name: "BBQ Ribs", category: "Dinner", price: "$38", rating: 4.7, emoji: "🍖", desc: "Slow-smoked pork ribs, house BBQ glaze", tags: [] },
  { name: "French Toast", category: "Breakfast", price: "$15", rating: 4.5, emoji: "🍞", desc: "Brioche with berry compote and cream", tags: [] },
  { name: "Mango Smoothie", category: "Drinks", price: "$8", rating: 4.3, emoji: "🥭", desc: "Fresh mango, yogurt, honey blend", tags: ["Healthy"] },
  { name: "Crème Brûlée", category: "Desserts", price: "$13", rating: 4.8, emoji: "🍮", desc: "Vanilla custard with caramelized sugar", tags: [] },
  { name: "Chicken Wings", category: "Sides", price: "$16", rating: 4.6, emoji: "🍗", desc: "Crispy buffalo wings with ranch dip", tags: ["Popular"] },
  { name: "Garlic Bread", category: "Sides", price: "$8", rating: 4.3, emoji: "🧄", desc: "Toasted with herb butter and parmesan", tags: [] },
  { name: "Mushroom Risotto", category: "Dinner", price: "$32", rating: 4.7, emoji: "🍄", desc: "Arborio rice, wild mushrooms, parmesan", tags: ["Vegetarian"] },
  { name: "Tropical Mojito", category: "Drinks", price: "$10", rating: 4.5, emoji: "🍹", desc: "Rum, mint, lime, passion fruit", tags: [] },
  { name: "Sushi Platter", category: "Specials", price: "$55", rating: 4.9, emoji: "🍣", desc: "Chef's selection of 12 premium pieces", tags: ["Chef's Special"] },
  { name: "Lamb Chops", category: "Specials", price: "$48", rating: 4.8, emoji: "🐑", desc: "Herb-crusted with rosemary jus", tags: ["Chef's Special"] },
  { name: "Sweet Potato Fries", category: "Sides", price: "$9", rating: 4.4, emoji: "🍠", desc: "Crispy with chipotle aioli dip", tags: ["Vegetarian"] },
  { name: "Espresso Martini", category: "Drinks", price: "$14", rating: 4.7, emoji: "🍸", desc: "Vodka, espresso, coffee liqueur", tags: ["Popular"] },
];

export default function CustomerMenu() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (name: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const filtered = menuItems.filter(
    (i) => (activeCategory === "All" || i.category === activeCategory) &&
      i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CustomerLayout>
      <PageHeader title="Menu" subtitle="Explore our delicious offerings" />

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {categories.map((cat) => (
          <motion.button
            key={cat}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            whileHover={{ y: -6 }}
            className="glass-card-elevated p-5 group cursor-pointer relative"
          >
            {/* Favorite heart */}
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={() => toggleFavorite(item.name)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center border border-border/30 hover:border-primary/50 transition-colors"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  favorites.has(item.name) ? "text-destructive fill-destructive" : "text-muted-foreground"
                }`}
              />
            </motion.button>

            <div className="text-5xl mb-3">{item.emoji}</div>
            <div className="flex flex-wrap gap-1 mb-2">
              {item.tags.map((t) => (
                <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{t}</span>
              ))}
            </div>
            <h3 className="font-semibold text-foreground">{item.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-lg font-display font-bold text-primary">{item.price}</span>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                <span className="text-xs font-semibold text-foreground">{item.rating}</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-3 w-full py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </motion.button>
          </motion.div>
        ))}
      </div>
    </CustomerLayout>
  );
}
