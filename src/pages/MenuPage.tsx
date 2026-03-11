import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Star, Clock, Flame, Leaf, Edit2, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { AdminLayout as AppLayout } from "@/components/AdminLayout";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";

const categories = ["All", "Breakfast", "Lunch", "Dinner", "Drinks", "Desserts", "Snacks"];

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  emoji: string;
  description: string;
  prep_time_minutes: number;
  labels: string[];
  is_available: boolean;
  is_spicy: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_featured: boolean;
}

const labelIcons: Record<string, { icon: typeof Star; className: string }> = {
  featured: { icon: Star, className: "text-warning" },
  spicy: { icon: Flame, className: "text-destructive" },
  vegetarian: { icon: Leaf, className: "text-success" },
  vegan: { icon: Leaf, className: "text-success" }, // Added vegan just in case
};

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const data = await api.get('/menu');
        // Let's format the data slightly if needed to match UI expectations
        const formattedData = data.map((item: any) => {
           let labels = [];
           if (item.is_featured) labels.push('featured');
           if (item.is_spicy) labels.push('spicy');
           if (item.is_vegetarian) labels.push('vegetarian');
           if (item.is_vegan) labels.push('vegan');

           return {
             ...item,
             labels
           };
        });
        setMenuItems(formattedData);
      } catch (err) {
        console.error("Failed to load menu", err);
        // Might want to add a toast here later!
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

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
      {loading ? (
        <div className="flex justify-center items-center h-64 w-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
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
                className={`glass-card-elevated overflow-hidden group ${!item.is_available ? "opacity-60" : ""}`}
              >
                {/* Image area */}
                <div className="h-36 bg-muted/50 flex items-center justify-center text-5xl relative">
                  <motion.span whileHover={{ scale: 1.2, rotate: 5 }} className="cursor-default">
                    {item.emoji || "🍽️"}
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
                  {!item.is_available && (
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
                      {item.is_available ? <EyeOff className="w-3 h-3 text-foreground" /> : <Eye className="w-3 h-3 text-foreground" />}
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
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Clock className="w-3 h-3" /> {item.prep_time_minutes} min
                    <span className="bg-muted px-2 py-0.5 rounded-full">{item.category}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </AppLayout>
  );
}
