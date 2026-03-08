import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Image, DollarSign, Tag, FileText, Utensils } from "lucide-react";
import { KitchenLayout } from "@/components/KitchenLayout";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "@/hooks/use-toast";

const categories = ["Breakfast", "Lunch", "Dinner", "Drinks", "Desserts", "Sides", "Specials"];

export default function KitchenCreateDish() {
  const [form, setForm] = useState({
    name: "",
    category: "Lunch",
    price: "",
    description: "",
    emoji: "🍽️",
    tags: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast({ title: "Missing fields", description: "Name and price are required.", variant: "destructive" });
      return;
    }
    toast({ title: "Dish Created!", description: `${form.name} has been added to the menu.` });
    setForm({ name: "", category: "Lunch", price: "", description: "", emoji: "🍽️", tags: "" });
  };

  const emojiOptions = ["🍽️", "🥩", "🐟", "🍕", "🍝", "🥑", "🥞", "☕", "🍰", "🥗", "🍳", "🦞", "🐠", "🍵", "🍫", "🍖", "🍞", "🥭", "🍮", "🍗", "🧄", "🍄", "🍹", "🍣", "🐑", "🍠", "🍸", "🍔", "🌮", "🍜"];

  return (
    <KitchenLayout>
      <PageHeader title="Create Dish" subtitle="Add a new dish or drink to the menu" />

      <div className="max-w-2xl mx-auto">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="glass-card-elevated p-6 space-y-6"
        >
          {/* Emoji picker */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Choose an Icon</label>
            <div className="flex flex-wrap gap-2">
              {emojiOptions.map((e) => (
                <motion.button
                  key={e}
                  type="button"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setForm({ ...form, emoji: e })}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                    form.emoji === e ? "bg-primary/20 ring-2 ring-primary" : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  {e}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-primary" /> Dish Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Truffle Pasta"
              className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" /> Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    form.category === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" /> Price
            </label>
            <input
              type="text"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="e.g. 25.00"
              className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Short description of the dish..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" /> Tags (comma-separated)
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="e.g. Healthy, Vegetarian, Chef's Special"
              className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none"
            />
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Create Dish
          </motion.button>
        </motion.form>
      </div>
    </KitchenLayout>
  );
}
