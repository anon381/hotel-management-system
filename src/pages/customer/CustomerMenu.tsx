import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, ShoppingCart, Heart, Plus, Minus, X, CalendarDays, Check, ArrowRight, UtensilsCrossed } from "lucide-react";
import { CustomerLayout } from "@/components/CustomerLayout";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "@/hooks/use-toast";

const categories = ["All", "Breakfast", "Lunch", "Dinner", "Drinks", "Desserts", "Sides", "Specials"];

const menuItems = [
  { name: "Wagyu Steak", category: "Dinner", price: 85, rating: 4.9, emoji: "🥩", desc: "Premium grade wagyu with truffle butter", tags: ["Chef's Special"] },
  { name: "Grilled Salmon", category: "Lunch", price: 45, rating: 4.8, emoji: "🐟", desc: "Atlantic salmon with herb crust", tags: ["Healthy"] },
  { name: "Margherita Pizza", category: "Lunch", price: 20, rating: 4.7, emoji: "🍕", desc: "Fresh mozzarella, basil, tomato", tags: ["Vegetarian"] },
  { name: "Truffle Pasta", category: "Dinner", price: 45, rating: 4.8, emoji: "🍝", desc: "Black truffle cream sauce", tags: ["Chef's Special"] },
  { name: "Avocado Toast", category: "Breakfast", price: 14, rating: 4.5, emoji: "🥑", desc: "Sourdough, poached egg, microgreens", tags: ["Healthy", "Vegetarian"] },
  { name: "Pancakes", category: "Breakfast", price: 16, rating: 4.6, emoji: "🥞", desc: "Buttermilk stack with maple syrup", tags: [] },
  { name: "Iced Latte", category: "Drinks", price: 6, rating: 4.4, emoji: "☕", desc: "Double shot espresso over ice", tags: [] },
  { name: "Tiramisu", category: "Desserts", price: 12, rating: 4.9, emoji: "🍰", desc: "Classic Italian coffee dessert", tags: ["Popular"] },
  { name: "Caesar Salad", category: "Lunch", price: 18, rating: 4.5, emoji: "🥗", desc: "Crisp romaine, parmesan, croutons", tags: ["Healthy"] },
  { name: "Eggs Benedict", category: "Breakfast", price: 17, rating: 4.7, emoji: "🍳", desc: "Poached eggs, hollandaise, English muffin", tags: ["Popular"] },
  { name: "Lobster Bisque", category: "Dinner", price: 28, rating: 4.8, emoji: "🦞", desc: "Rich creamy lobster soup with sherry", tags: ["Chef's Special"] },
  { name: "Fish & Chips", category: "Lunch", price: 22, rating: 4.4, emoji: "🐠", desc: "Beer-battered cod with tartar sauce", tags: [] },
  { name: "Matcha Latte", category: "Drinks", price: 7, rating: 4.6, emoji: "🍵", desc: "Ceremonial grade matcha with oat milk", tags: ["Healthy"] },
  { name: "Chocolate Lava Cake", category: "Desserts", price: 14, rating: 4.9, emoji: "🍫", desc: "Warm molten center with vanilla ice cream", tags: ["Popular"] },
  { name: "BBQ Ribs", category: "Dinner", price: 38, rating: 4.7, emoji: "🍖", desc: "Slow-smoked pork ribs, house BBQ glaze", tags: [] },
  { name: "French Toast", category: "Breakfast", price: 15, rating: 4.5, emoji: "🍞", desc: "Brioche with berry compote and cream", tags: [] },
  { name: "Mango Smoothie", category: "Drinks", price: 8, rating: 4.3, emoji: "🥭", desc: "Fresh mango, yogurt, honey blend", tags: ["Healthy"] },
  { name: "Crème Brûlée", category: "Desserts", price: 13, rating: 4.8, emoji: "🍮", desc: "Vanilla custard with caramelized sugar", tags: [] },
  { name: "Chicken Wings", category: "Sides", price: 16, rating: 4.6, emoji: "🍗", desc: "Crispy buffalo wings with ranch dip", tags: ["Popular"] },
  { name: "Garlic Bread", category: "Sides", price: 8, rating: 4.3, emoji: "🧄", desc: "Toasted with herb butter and parmesan", tags: [] },
  { name: "Mushroom Risotto", category: "Dinner", price: 32, rating: 4.7, emoji: "🍄", desc: "Arborio rice, wild mushrooms, parmesan", tags: ["Vegetarian"] },
  { name: "Tropical Mojito", category: "Drinks", price: 10, rating: 4.5, emoji: "🍹", desc: "Rum, mint, lime, passion fruit", tags: [] },
  { name: "Sushi Platter", category: "Specials", price: 55, rating: 4.9, emoji: "🍣", desc: "Chef's selection of 12 premium pieces", tags: ["Chef's Special"] },
  { name: "Lamb Chops", category: "Specials", price: 48, rating: 4.8, emoji: "🐑", desc: "Herb-crusted with rosemary jus", tags: ["Chef's Special"] },
  { name: "Sweet Potato Fries", category: "Sides", price: 9, rating: 4.4, emoji: "🍠", desc: "Crispy with chipotle aioli dip", tags: ["Vegetarian"] },
  { name: "Espresso Martini", category: "Drinks", price: 14, rating: 4.7, emoji: "🍸", desc: "Vodka, espresso, coffee liqueur", tags: ["Popular"] },
];

interface CartItem {
  name: string;
  emoji: string;
  price: number;
  quantity: number;
}

const tableZones = [
  { zone: "Window", tables: ["W1", "W2", "W3", "W4"] },
  { zone: "Patio", tables: ["P1", "P2", "P3"] },
  { zone: "VIP", tables: ["V1", "V2"] },
  { zone: "Main", tables: ["M1", "M2", "M3", "M4", "M5"] },
];

export default function CustomerMenu() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [quantityModal, setQuantityModal] = useState<{ name: string; emoji: string; price: number } | null>(null);
  const [tempQty, setTempQty] = useState(1);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  // After adding: show "Add More" or "View Cart"
  const [justAdded, setJustAdded] = useState<string | null>(null);
  // Post-order: ask about table reservation
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderSummary, setOrderSummary] = useState<{ count: number; total: number } | null>(null);

  const toggleFavorite = (name: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const openQuantityModal = (item: { name: string; emoji: string; price: number }) => {
    setQuantityModal(item);
    setTempQty(1);
    setJustAdded(null);
  };

  const addToCart = () => {
    if (!quantityModal) return;
    setCart((prev) => {
      const existing = prev.find((c) => c.name === quantityModal.name);
      if (existing) {
        return prev.map((c) => c.name === quantityModal.name ? { ...c, quantity: c.quantity + tempQty } : c);
      }
      return [...prev, { name: quantityModal.name, emoji: quantityModal.emoji, price: quantityModal.price, quantity: tempQty }];
    });
    setJustAdded(quantityModal.name);
  };

  const updateCartQty = (name: string, delta: number) => {
    setCart((prev) =>
      prev.map((c) => c.name === name ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c).filter((c) => c.quantity > 0)
    );
  };

  const removeFromCart = (name: string) => {
    setCart((prev) => prev.filter((c) => c.name !== name));
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const placeOrder = () => {
    setOrderSummary({ count: cartCount, total: cartTotal });
    setCart([]);
    setCheckoutOpen(false);
    setCartOpen(false);
    setOrderPlaced(true);
  };

  const confirmReservation = () => {
    toast({
      title: "🎉 Order Confirmed!",
      description: `${orderSummary?.count} items — $${orderSummary?.total}${selectedTable ? ` · Table ${selectedTable} reserved` : " · Takeaway"}`,
    });
    setOrderPlaced(false);
    setOrderSummary(null);
    setSelectedTable(null);
  };

  const skipReservation = () => {
    toast({
      title: "🎉 Order Placed!",
      description: `${orderSummary?.count} items — $${orderSummary?.total} · Takeaway`,
    });
    setOrderPlaced(false);
    setOrderSummary(null);
    setSelectedTable(null);
  };

  const filtered = menuItems.filter(
    (i) => (activeCategory === "All" || i.category === activeCategory) &&
      i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CustomerLayout>
      <div className="flex items-center justify-between mb-2">
        <PageHeader title="Menu" subtitle="Explore our delicious offerings" />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setCartOpen(true)}
          className="relative w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
        >
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center"
            >
              {cartCount}
            </motion.span>
          )}
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search menu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none"
        />
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
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={() => toggleFavorite(item.name)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center border border-border/30 hover:border-primary/50 transition-colors"
            >
              <Heart className={`w-4 h-4 transition-colors ${favorites.has(item.name) ? "text-destructive fill-destructive" : "text-muted-foreground"}`} />
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
              <span className="text-lg font-display font-bold text-primary">${item.price}</span>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                <span className="text-xs font-semibold text-foreground">{item.rating}</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openQuantityModal(item)}
              className="mt-3 w-full py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Quantity Modal — with "Add More" / "View Cart" after adding */}
      <AnimatePresence>
        {quantityModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50" onClick={() => setQuantityModal(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-sm bg-background border border-border rounded-2xl p-6 shadow-2xl"
            >
              <AnimatePresence mode="wait">
                {!justAdded ? (
                  <motion.div key="pick-qty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="text-center mb-4">
                      <span className="text-5xl">{quantityModal.emoji}</span>
                      <h3 className="font-display font-bold text-lg text-foreground mt-2">{quantityModal.name}</h3>
                      <p className="text-sm text-muted-foreground">${quantityModal.price} each</p>
                    </div>
                    <div className="flex items-center justify-center gap-4 mb-6">
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setTempQty(Math.max(1, tempQty - 1))} className="w-10 h-10 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center">
                        <Minus className="w-4 h-4" />
                      </motion.button>
                      <span className="text-3xl font-display font-bold text-foreground w-12 text-center">{tempQty}</span>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setTempQty(tempQty + 1)} className="w-10 h-10 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center">
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setQuantityModal(null)} className="flex-1 py-3 rounded-xl border border-border text-muted-foreground text-sm font-semibold hover:bg-muted transition-colors">Cancel</button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={addToCart} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
                        Add · ${quantityModal.price * tempQty}
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="added" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="text-center mb-5">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3"
                      >
                        <Check className="w-8 h-8 text-primary" />
                      </motion.div>
                      <h3 className="font-display font-bold text-lg text-foreground">Added to Cart!</h3>
                      <p className="text-sm text-muted-foreground mt-1">{tempQty}x {quantityModal.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{cartCount} item{cartCount !== 1 ? "s" : ""} in cart · ${cartTotal}</p>
                    </div>
                    <div className="flex gap-3">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setJustAdded(null);
                          setTempQty(1);
                          requestAnimationFrame(() => setQuantityModal(null));
                        }}
                        className="flex-1 py-3 rounded-xl border border-border text-foreground text-sm font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Add More
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setQuantityModal(null); setCartOpen(true); }}
                        className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2"
                      >
                        View Cart <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Drawer (items list only) */}
      <AnimatePresence>
        {cartOpen && !checkoutOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50" onClick={() => setCartOpen(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border z-50 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="font-display font-bold text-lg text-foreground">Your Cart ({cartCount})</h2>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCartOpen(false)} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Your cart is empty</p>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCartOpen(false)}
                      className="mt-4 px-6 py-2 rounded-xl bg-primary/10 text-primary text-sm font-semibold"
                    >
                      Browse Menu
                    </motion.button>
                  </div>
                ) : (
                  cart.map((c) => (
                    <motion.div key={c.name} layout className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                      <span className="text-2xl">{c.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{c.name}</p>
                        <p className="text-xs text-muted-foreground">${c.price} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateCartQty(c.name, -1)} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                          <Minus className="w-3 h-3" />
                        </motion.button>
                        <span className="text-sm font-bold w-6 text-center text-foreground">{c.quantity}</span>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateCartQty(c.name, 1)} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                          <Plus className="w-3 h-3" />
                        </motion.button>
                      </div>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => removeFromCart(c.name)} className="w-7 h-7 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </motion.button>
                    </motion.div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div className="p-5 border-t border-border space-y-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setCartOpen(false)}
                    className="w-full py-2.5 rounded-xl border border-dashed border-primary/40 text-primary text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add More Items
                  </motion.button>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-display font-bold text-lg text-foreground">${cartTotal}</span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
                    className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
                  >
                    Proceed to Checkout
                  </motion.button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal (centered) */}
      <AnimatePresence>
        {checkoutOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50" onClick={() => setCheckoutOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[92%] max-w-md bg-background border border-border rounded-2xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <h3 className="font-display font-bold text-lg text-foreground mb-4">Checkout</h3>
              <div className="space-y-2 mb-4">
                {cart.map((c) => (
                  <div key={c.name} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{c.quantity}x {c.name}</span>
                    <span className="text-foreground font-medium">${c.price * c.quantity}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-border flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-display font-bold text-lg text-primary">${cartTotal}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setCheckoutOpen(false)} className="flex-1 py-3 rounded-xl border border-border text-muted-foreground text-sm font-semibold hover:bg-muted transition-colors">Back</button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={placeOrder}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Place Order
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>



      {/* Post-Order: Reserve Table Modal */}
      <AnimatePresence>
        {orderPlaced && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-[60]" />
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-md bg-background border border-border rounded-2xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="text-center mb-5">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3"
                >
                  <UtensilsCrossed className="w-8 h-8 text-primary" />
                </motion.div>
                <h3 className="font-display font-bold text-xl text-foreground">Order Placed! 🎉</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {orderSummary?.count} items · ${orderSummary?.total}
                </p>
              </div>

              <div className="bg-secondary/50 rounded-xl p-4 mb-5">
                <p className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-primary" /> Want to dine in?
                </p>
                <p className="text-xs text-muted-foreground">Reserve a table for your meal, or skip for takeaway.</p>
              </div>

              {/* Table selection */}
              <div className="space-y-3 mb-5 max-h-48 overflow-y-auto">
                {tableZones.map((zone) => (
                  <div key={zone.zone}>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">{zone.zone} Zone</p>
                    <div className="flex flex-wrap gap-2">
                      {zone.tables.map((t) => (
                        <motion.button
                          key={t}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setSelectedTable(selectedTable === t ? null : t)}
                          className={`w-12 h-12 rounded-xl text-xs font-bold flex items-center justify-center transition-colors ${
                            selectedTable === t
                              ? "bg-primary text-primary-foreground shadow-lg"
                              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          }`}
                        >
                          {t}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={skipReservation}
                  className="flex-1 py-3 rounded-xl border border-border text-muted-foreground text-sm font-semibold hover:bg-muted transition-colors"
                >
                  Skip · Takeaway
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={confirmReservation}
                  disabled={!selectedTable}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                    selectedTable
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  <CalendarDays className="w-4 h-4" /> Reserve {selectedTable || "Table"}
                </motion.button>
              </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </CustomerLayout>
  );
}
