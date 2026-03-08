import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Clock, Users, CheckCircle2, MapPin } from "lucide-react";
import { CustomerLayout } from "@/components/CustomerLayout";
import { PageHeader } from "@/components/PageHeader";

interface Reservation {
  id: string;
  date: string;
  time: string;
  guests: number;
  table: string;
  status: "confirmed" | "pending" | "cancelled";
}

const timeSlots = ["11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM"];

const tables = [
  { id: "T-01", seats: 2, zone: "Window" },
  { id: "T-02", seats: 4, zone: "Main" },
  { id: "T-03", seats: 4, zone: "Main" },
  { id: "T-05", seats: 6, zone: "VIP" },
  { id: "T-08", seats: 2, zone: "Patio" },
  { id: "T-10", seats: 8, zone: "Private" },
  { id: "T-12", seats: 4, zone: "Window" },
];

const zoneColors: Record<string, string> = {
  Window: "bg-info/10 text-info",
  Main: "bg-primary/10 text-primary",
  VIP: "bg-warning/10 text-warning",
  Patio: "bg-success/10 text-success",
  Private: "bg-accent text-accent-foreground",
};

export default function CustomerReservation() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [selectedTable, setSelectedTable] = useState("");
  const [reservations, setReservations] = useState<Reservation[]>([
    { id: "R-001", date: "2026-03-10", time: "7:00 PM", guests: 4, table: "T-02", status: "confirmed" },
    { id: "R-002", date: "2026-03-12", time: "8:00 PM", guests: 2, table: "T-08", status: "pending" },
  ]);
  const [showSuccess, setShowSuccess] = useState(false);

  const availableTables = tables.filter(t => t.seats >= guests);

  const handleReserve = () => {
    if (!selectedDate || !selectedTime || !selectedTable) return;
    const newRes: Reservation = {
      id: `R-${String(reservations.length + 3).padStart(3, "0")}`,
      date: selectedDate,
      time: selectedTime,
      guests,
      table: selectedTable,
      status: "confirmed",
    };
    setReservations(prev => [newRes, ...prev]);
    setShowSuccess(true);
    setSelectedDate("");
    setSelectedTime("");
    setSelectedTable("");
    setGuests(2);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const cancelReservation = (id: string) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: "cancelled" } : r));
  };

  return (
    <CustomerLayout>
      <PageHeader title="Reserve a Table" subtitle="Book your perfect dining spot at Café X" />

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 rounded-xl bg-success/10 border border-success/30 flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="text-sm font-semibold text-success">Reservation confirmed! We look forward to seeing you.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reservation Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass-card-elevated p-6"
        >
          <h2 className="font-display font-semibold text-lg text-foreground mb-6">New Reservation</h2>

          {/* Date */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" /> Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>

          {/* Guests */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Number of Guests
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <motion.button
                  key={n}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setGuests(n); setSelectedTable(""); }}
                  className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all ${
                    guests === n ? "bg-primary text-primary-foreground shadow-lg" : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {n}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Time */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Select Time
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
              {timeSlots.map(t => (
                <motion.button
                  key={t}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTime(t)}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                    selectedTime === t ? "bg-primary text-primary-foreground" : "bg-muted/50 border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                  }`}
                >
                  {t}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Table Selection */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> Choose a Table ({availableTables.length} available)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {availableTables.map(t => (
                <motion.button
                  key={t.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedTable(t.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedTable === t.id
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-border bg-muted/30 hover:border-primary/30"
                  }`}
                >
                  <p className="font-semibold text-sm text-foreground">{t.id}</p>
                  <p className="text-[11px] text-muted-foreground">{t.seats} seats</p>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded mt-1 inline-block ${zoneColors[t.zone]}`}>
                    {t.zone}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReserve}
            disabled={!selectedDate || !selectedTime || !selectedTable}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg"
          >
            Confirm Reservation
          </motion.button>
        </motion.div>

        {/* My Reservations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card-elevated p-5"
        >
          <h2 className="font-display font-semibold text-lg text-foreground mb-4">My Reservations</h2>
          <div className="space-y-3">
            {reservations.map(r => (
              <motion.div
                key={r.id}
                layout
                className={`p-4 rounded-xl border transition-all ${
                  r.status === "cancelled" ? "border-border opacity-50" : "border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-foreground">{r.id}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    r.status === "confirmed" ? "bg-success/10 text-success" : r.status === "pending" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                  }`}>
                    {r.status}
                  </span>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {r.date}</p>
                  <p className="flex items-center gap-1"><Clock className="w-3 h-3" /> {r.time}</p>
                  <p className="flex items-center gap-1"><Users className="w-3 h-3" /> {r.guests} guests · {r.table}</p>
                </div>
                {r.status !== "cancelled" && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => cancelReservation(r.id)}
                    className="mt-3 text-[11px] font-semibold text-destructive bg-destructive/10 px-3 py-1 rounded-lg w-full"
                  >
                    Cancel Reservation
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </CustomerLayout>
  );
}
