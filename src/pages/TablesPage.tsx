import { motion } from "framer-motion";
import { Users, Utensils, Clock, Sparkles, ArrowRightLeft } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";

type TableStatus = "Available" | "Occupied" | "Reserved" | "Cleaning";

interface Table {
  id: number;
  number: string;
  seats: number;
  status: TableStatus;
  order?: string;
  guest?: string;
  time?: string;
}

const tables: Table[] = [
  { id: 1, number: "T-01", seats: 2, status: "Occupied", order: "#1020", guest: "Walk-in", time: "45m" },
  { id: 2, number: "T-02", seats: 4, status: "Available", seats: 4 },
  { id: 3, number: "T-03", seats: 4, status: "Occupied", order: "#1022", guest: "Mike R.", time: "1h 10m" },
  { id: 4, number: "T-04", seats: 2, status: "Available" },
  { id: 5, number: "T-05", seats: 6, status: "Occupied", order: "#1024", guest: "John D.", time: "15m" },
  { id: 6, number: "T-06", seats: 4, status: "Reserved", guest: "Party @ 7PM" },
  { id: 7, number: "T-07", seats: 2, status: "Cleaning" },
  { id: 8, number: "T-08", seats: 4, status: "Occupied", order: "#1021", guest: "Emma L.", time: "5m" },
  { id: 9, number: "T-09", seats: 8, status: "Reserved", guest: "Birthday @ 8PM" },
  { id: 10, number: "T-10", seats: 2, status: "Available" },
  { id: 11, number: "T-11", seats: 4, status: "Available" },
  { id: 12, number: "T-12", seats: 6, status: "Occupied", order: "#1023", guest: "Sarah M.", time: "22m" },
  { id: 13, number: "T-13", seats: 2, status: "Cleaning" },
  { id: 14, number: "T-14", seats: 4, status: "Available" },
  { id: 15, number: "T-15", seats: 4, status: "Occupied", order: "#1019", guest: "David K.", time: "1h 30m" },
  { id: 16, number: "T-16", seats: 2, status: "Available" },
  { id: 17, number: "T-17", seats: 6, status: "Reserved", guest: "Corporate @ 6PM" },
  { id: 18, number: "T-18", seats: 4, status: "Available" },
  { id: 19, number: "T-19", seats: 2, status: "Available" },
  { id: 20, number: "T-20", seats: 8, status: "Available" },
];

const statusConfig: Record<TableStatus, { bg: string; border: string; dot: string; label: string }> = {
  Available: { bg: "bg-success/5", border: "border-success/30", dot: "bg-success", label: "Available" },
  Occupied: { bg: "bg-primary/5", border: "border-primary/30", dot: "bg-primary", label: "Occupied" },
  Reserved: { bg: "bg-warning/5", border: "border-warning/30", dot: "bg-warning", label: "Reserved" },
  Cleaning: { bg: "bg-muted", border: "border-border", dot: "bg-muted-foreground", label: "Cleaning" },
};

export default function TablesPage() {
  const counts = {
    Available: tables.filter(t => t.status === "Available").length,
    Occupied: tables.filter(t => t.status === "Occupied").length,
    Reserved: tables.filter(t => t.status === "Reserved").length,
    Cleaning: tables.filter(t => t.status === "Cleaning").length,
  };

  return (
    <AppLayout>
      <PageHeader title="Table Management" subtitle="Real-time table availability and assignments" />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {(Object.keys(counts) as TableStatus[]).map((status, i) => {
          const cfg = statusConfig[status];
          return (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-xl p-4 border ${cfg.bg} ${cfg.border} text-center`}
            >
              <div className={`w-3 h-3 rounded-full ${cfg.dot} mx-auto mb-2`} />
              <p className="text-2xl font-display font-bold text-foreground">{counts[status]}</p>
              <p className="text-xs text-muted-foreground">{cfg.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Floor plan grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tables.map((table, i) => {
          const cfg = statusConfig[table.status];
          return (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className={`relative rounded-2xl border-2 ${cfg.border} ${cfg.bg} p-4 cursor-pointer group transition-shadow hover:shadow-lg`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-display font-bold text-foreground">{table.number}</span>
                <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot} ${table.status === "Occupied" ? "animate-pulse" : ""}`} />
              </div>

              {/* Table visual */}
              <div className="w-full aspect-square rounded-xl bg-card border border-border/50 flex flex-col items-center justify-center mb-3 shadow-inner">
                <Utensils className="w-5 h-5 text-muted-foreground/40 mb-1" />
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" /> {table.seats}
                </div>
              </div>

              {table.status === "Occupied" && (
                <div className="text-center">
                  <p className="text-xs font-semibold text-foreground">{table.guest}</p>
                  <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                    <Clock className="w-2.5 h-2.5" /> {table.time}
                  </div>
                </div>
              )}
              {table.status === "Reserved" && (
                <p className="text-[11px] text-center text-warning font-medium">{table.guest}</p>
              )}
              {table.status === "Cleaning" && (
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Sparkles className="w-3 h-3" /> Cleaning
                </div>
              )}
              {table.status === "Available" && (
                <p className="text-xs text-center text-success font-medium">Ready</p>
              )}

              {/* Hover actions */}
              <div className="absolute inset-0 rounded-2xl bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                <motion.button whileTap={{ scale: 0.9 }} className="text-[10px] font-semibold bg-card/90 border border-border px-3 py-1.5 rounded-lg flex items-center gap-1 shadow">
                  <ArrowRightLeft className="w-3 h-3" /> Manage
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </AppLayout>
  );
}
