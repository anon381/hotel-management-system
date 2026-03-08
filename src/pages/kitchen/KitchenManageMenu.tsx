import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trash2, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { KitchenLayout } from "@/components/KitchenLayout";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "@/hooks/use-toast";

const initialMenuItems = [
  { id: 1, name: "Wagyu Steak", category: "Dinner", price: "$85", emoji: "🥩", available: true },
  { id: 2, name: "Grilled Salmon", category: "Lunch", price: "$45", emoji: "🐟", available: true },
  { id: 3, name: "Margherita Pizza", category: "Lunch", price: "$20", emoji: "🍕", available: true },
  { id: 4, name: "Truffle Pasta", category: "Dinner", price: "$45", emoji: "🍝", available: true },
  { id: 5, name: "Avocado Toast", category: "Breakfast", price: "$14", emoji: "🥑", available: true },
  { id: 6, name: "Pancakes", category: "Breakfast", price: "$16", emoji: "🥞", available: true },
  { id: 7, name: "Iced Latte", category: "Drinks", price: "$6", emoji: "☕", available: true },
  { id: 8, name: "Tiramisu", category: "Desserts", price: "$12", emoji: "🍰", available: true },
  { id: 9, name: "Caesar Salad", category: "Lunch", price: "$18", emoji: "🥗", available: true },
  { id: 10, name: "Eggs Benedict", category: "Breakfast", price: "$17", emoji: "🍳", available: true },
  { id: 11, name: "Lobster Bisque", category: "Dinner", price: "$28", emoji: "🦞", available: false },
  { id: 12, name: "Fish & Chips", category: "Lunch", price: "$22", emoji: "🐠", available: true },
  { id: 13, name: "Matcha Latte", category: "Drinks", price: "$7", emoji: "🍵", available: true },
  { id: 14, name: "Chocolate Lava Cake", category: "Desserts", price: "$14", emoji: "🍫", available: true },
  { id: 15, name: "BBQ Ribs", category: "Dinner", price: "$38", emoji: "🍖", available: false },
  { id: 16, name: "Mushroom Risotto", category: "Dinner", price: "$32", emoji: "🍄", available: true },
  { id: 17, name: "Sushi Platter", category: "Specials", price: "$55", emoji: "🍣", available: true },
  { id: 18, name: "Lamb Chops", category: "Specials", price: "$48", emoji: "🐑", available: true },
];

export default function KitchenManageMenu() {
  const [items, setItems] = useState(initialMenuItems);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const toggleAvailability = (id: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next = { ...item, available: !item.available };
          toast({
            title: next.available ? "Item Available" : "Item Unavailable",
            description: `${item.name} is now ${next.available ? "visible on" : "hidden from"} the menu.`,
          });
          return next;
        }
        return item;
      })
    );
  };

  const deleteItem = (id: number) => {
    const item = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setConfirmDelete(null);
    toast({ title: "Dish Removed", description: `${item?.name} has been removed from the menu.`, variant: "destructive" });
  };

  const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
  const unavailableCount = items.filter((i) => !i.available).length;

  return (
    <KitchenLayout>
      <PageHeader title="Manage Menu" subtitle="Toggle availability or remove dishes from the menu" />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-display font-bold text-foreground">{items.length}</p>
          <p className="text-xs text-muted-foreground">Total Items</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-display font-bold text-success">{items.length - unavailableCount}</p>
          <p className="text-xs text-muted-foreground">Available</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-display font-bold text-destructive">{unavailableCount}</p>
          <p className="text-xs text-muted-foreground">Unavailable</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search dishes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none"
        />
      </div>

      {/* List */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className={`glass-card p-4 flex items-center gap-4 transition-opacity ${!item.available ? "opacity-60" : ""}`}
            >
              <span className="text-3xl">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground text-sm truncate">{item.name}</h3>
                  {!item.available && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">Unavailable</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{item.category} · {item.price}</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Toggle availability */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleAvailability(item.id)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    item.available
                      ? "bg-success/10 text-success hover:bg-success/20"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                  title={item.available ? "Mark as unavailable" : "Mark as available"}
                >
                  {item.available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </motion.button>

                {/* Delete */}
                {confirmDelete === item.id ? (
                  <div className="flex items-center gap-1">
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteItem(item.id)}
                      className="w-9 h-9 rounded-lg bg-destructive text-destructive-foreground flex items-center justify-center"
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setConfirmDelete(null)}
                      className="w-9 h-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold"
                    >
                      ✕
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setConfirmDelete(item.id)}
                    className="w-9 h-9 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center transition-colors"
                    title="Remove from menu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </KitchenLayout>
  );
}
