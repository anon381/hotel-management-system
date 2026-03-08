import { motion } from "framer-motion";
import { Package, AlertTriangle, TrendingDown, Plus, Search, Truck, Pencil, Trash2 } from "lucide-react";
import { AdminLayout as AppLayout } from "@/components/AdminLayout";
import { PageHeader } from "@/components/PageHeader";

const inventory = [
  { name: "Wagyu Beef", stock: 2, unit: "kg", threshold: 5, supplier: "Premium Meats Co.", lastOrder: "Mar 1", status: "critical" },
  { name: "Truffle Oil", stock: 1, unit: "bottles", threshold: 3, supplier: "Gourmet Imports", lastOrder: "Feb 28", status: "critical" },
  { name: "Fresh Salmon", stock: 3, unit: "kg", threshold: 8, supplier: "Ocean Fresh Ltd.", lastOrder: "Mar 3", status: "low" },
  { name: "Chicken Breast", stock: 12, unit: "kg", threshold: 10, supplier: "Local Farm Supply", lastOrder: "Mar 4", status: "ok" },
  { name: "Rice (Jasmine)", stock: 25, unit: "kg", threshold: 15, supplier: "Asian Imports Inc.", lastOrder: "Feb 25", status: "ok" },
  { name: "Olive Oil", stock: 8, unit: "L", threshold: 5, supplier: "Mediterranean Foods", lastOrder: "Mar 2", status: "ok" },
  { name: "Mozzarella", stock: 4, unit: "kg", threshold: 6, supplier: "Dairy Direct", lastOrder: "Mar 3", status: "low" },
  { name: "Fresh Basil", stock: 0.5, unit: "kg", threshold: 2, supplier: "Herb Garden Co.", lastOrder: "Mar 5", status: "critical" },
  { name: "All-Purpose Flour", stock: 20, unit: "kg", threshold: 10, supplier: "Baker's Best", lastOrder: "Feb 27", status: "ok" },
  { name: "Heavy Cream", stock: 6, unit: "L", threshold: 4, supplier: "Dairy Direct", lastOrder: "Mar 4", status: "ok" },
];

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: "bg-destructive/10", text: "text-destructive", label: "Critical" },
  low: { bg: "bg-warning/10", text: "text-warning", label: "Low Stock" },
  ok: { bg: "bg-success/10", text: "text-success", label: "In Stock" },
};

export default function InventoryPage() {
  const criticalCount = inventory.filter(i => i.status === "critical").length;
  const lowCount = inventory.filter(i => i.status === "low").length;

  return (
    <AppLayout>
      <PageHeader
        title="Inventory Management"
        subtitle="Track ingredients, supplies, and stock levels"
        actions={
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="gradient-warm text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" /> Add Item
          </motion.button>
        }
      />

      {/* Alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-foreground">{criticalCount}</p>
            <p className="text-sm text-muted-foreground">Critical Items</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-foreground">{lowCount}</p>
            <p className="text-sm text-muted-foreground">Low Stock</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
            <Package className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-foreground">{inventory.length}</p>
            <p className="text-sm text-muted-foreground">Total Items</p>
          </div>
        </motion.div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border/50">
                <th className="text-left p-4">Item</th>
                <th className="text-right p-4">Stock</th>
                <th className="text-right p-4">Threshold</th>
                <th className="text-left p-4">Supplier</th>
                <th className="text-left p-4">Last Order</th>
                <th className="text-left p-4">Status</th>
                <th className="text-right p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item, i) => {
                const style = statusStyles[item.status];
                const pct = Math.min((item.stock / item.threshold) * 100, 100);
                return (
                  <motion.tr
                    key={item.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.04 }}
                    className="border-t border-border/30 hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4 font-medium text-foreground text-sm">{item.name}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${item.status === "critical" ? "bg-destructive" : item.status === "low" ? "bg-warning" : "bg-success"}`}
                            style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm text-foreground">{item.stock} {item.unit}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right text-sm text-muted-foreground">{item.threshold} {item.unit}</td>
                    <td className="p-4 text-sm text-muted-foreground flex items-center gap-1"><Truck className="w-3 h-3" /> {item.supplier}</td>
                    <td className="p-4 text-sm text-muted-foreground">{item.lastOrder}</td>
                    <td className="p-4"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>{style.label}</span></td>
                    <td className="p-4 text-right">
                      <motion.button whileTap={{ scale: 0.9 }} className="text-xs font-semibold text-primary hover:underline">Reorder</motion.button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </AppLayout>
  );
}
