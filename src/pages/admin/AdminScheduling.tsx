import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, User, ArrowRightLeft } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "@/hooks/use-toast";

const staff = [
  { id: "s1", name: "Marco Rossi", role: "Head Chef", avatar: "👨‍🍳" },
  { id: "s2", name: "Sarah Chen", role: "Sous Chef", avatar: "👩‍🍳" },
  { id: "s3", name: "James Wilson", role: "Manager", avatar: "👔" },
  { id: "s4", name: "Emily Park", role: "Cashier", avatar: "💳" },
  { id: "s5", name: "Carlos Martinez", role: "Waiter", avatar: "🍽️" },
  { id: "s6", name: "Anna Schmidt", role: "Pastry Chef", avatar: "🧁" },
  { id: "s7", name: "David Kim", role: "Kitchen Staff", avatar: "🔪" },
  { id: "s8", name: "Lisa Thompson", role: "Hostess", avatar: "🎀" },
];

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Shift {
  staffId: string;
  day: number;
  start: string;
  end: string;
  isSwapRequested?: boolean;
}

const initialShifts: Shift[] = [
  { staffId: "s1", day: 0, start: "06:00", end: "14:00" }, { staffId: "s1", day: 1, start: "06:00", end: "14:00" },
  { staffId: "s1", day: 2, start: "06:00", end: "14:00" }, { staffId: "s1", day: 3, start: "06:00", end: "14:00" },
  { staffId: "s1", day: 4, start: "06:00", end: "14:00" },
  { staffId: "s2", day: 0, start: "08:00", end: "16:00" }, { staffId: "s2", day: 1, start: "08:00", end: "16:00" },
  { staffId: "s2", day: 2, start: "08:00", end: "16:00" }, { staffId: "s2", day: 4, start: "08:00", end: "16:00" },
  { staffId: "s2", day: 5, start: "10:00", end: "18:00" },
  { staffId: "s3", day: 0, start: "09:00", end: "17:00" }, { staffId: "s3", day: 1, start: "09:00", end: "17:00" },
  { staffId: "s3", day: 2, start: "09:00", end: "17:00" }, { staffId: "s3", day: 3, start: "09:00", end: "17:00" },
  { staffId: "s3", day: 4, start: "09:00", end: "17:00" },
  { staffId: "s4", day: 1, start: "10:00", end: "18:00" }, { staffId: "s4", day: 2, start: "10:00", end: "18:00" },
  { staffId: "s4", day: 3, start: "10:00", end: "18:00" }, { staffId: "s4", day: 4, start: "10:00", end: "18:00" },
  { staffId: "s4", day: 5, start: "12:00", end: "20:00" },
  { staffId: "s5", day: 0, start: "11:00", end: "19:00" }, { staffId: "s5", day: 2, start: "11:00", end: "19:00" },
  { staffId: "s5", day: 4, start: "11:00", end: "19:00" }, { staffId: "s5", day: 5, start: "11:00", end: "19:00" },
  { staffId: "s5", day: 6, start: "11:00", end: "19:00" },
  { staffId: "s6", day: 0, start: "05:00", end: "13:00" }, { staffId: "s6", day: 1, start: "05:00", end: "13:00" },
  { staffId: "s6", day: 3, start: "05:00", end: "13:00" }, { staffId: "s6", day: 5, start: "05:00", end: "13:00" },
  { staffId: "s7", day: 0, start: "08:00", end: "16:00" }, { staffId: "s7", day: 1, start: "08:00", end: "16:00" },
  { staffId: "s7", day: 2, start: "08:00", end: "16:00" }, { staffId: "s7", day: 3, start: "08:00", end: "16:00" },
  { staffId: "s7", day: 4, start: "08:00", end: "16:00" }, { staffId: "s7", day: 5, start: "08:00", end: "16:00" },
  { staffId: "s8", day: 3, start: "17:00", end: "23:00" }, { staffId: "s8", day: 4, start: "17:00", end: "23:00" },
  { staffId: "s8", day: 5, start: "17:00", end: "23:00" }, { staffId: "s8", day: 6, start: "17:00", end: "23:00" },
];

const swapRequests = [
  { from: "Anna Schmidt", to: "Sarah Chen", date: "Mar 12", shift: "05:00-13:00", reason: "Personal appointment" },
];

export default function AdminScheduling() {
  const [shifts] = useState<Shift[]>(initialShifts);
  const [weekOffset, setWeekOffset] = useState(0);

  const getWeekDates = () => {
    const start = new Date();
    start.setDate(start.getDate() - start.getDay() + 1 + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates();

  return (
    <AdminLayout>
      <PageHeader
        title="Staff Scheduling"
        subtitle="Weekly shift calendar with swap management"
        actions={
          <motion.button whileTap={{ scale: 0.95 }} className="gradient-warm text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg">
            <Plus className="w-4 h-4" /> Add Shift
          </motion.button>
        }
      />

      {/* Week Nav */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setWeekOffset(w => w - 1)} className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground">
            {weekDates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} — {weekDates[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
        <button onClick={() => setWeekOffset(w => w + 1)} className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Swap Requests */}
      {swapRequests.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2"><ArrowRightLeft className="w-4 h-4 text-warning" /> Pending Swap Requests</h3>
          {swapRequests.map((swap, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{swap.from} → {swap.to}</p>
                <p className="text-xs text-muted-foreground">{swap.date} · {swap.shift} · {swap.reason}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toast({ title: "Swap Approved ✅" })} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-success/10 text-success hover:bg-success hover:text-success-foreground transition-colors">Approve</button>
                <button onClick={() => toast({ title: "Swap Rejected" })} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors">Reject</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Schedule Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Day headers */}
          <div className="grid grid-cols-8 gap-2 mb-2">
            <div className="text-xs font-semibold text-muted-foreground p-2">Staff</div>
            {daysOfWeek.map((day, i) => (
              <div key={day} className="text-center p-2">
                <p className="text-xs font-semibold text-muted-foreground">{day}</p>
                <p className="text-[10px] text-muted-foreground">{weekDates[i].getDate()}</p>
              </div>
            ))}
          </div>

          {/* Staff rows */}
          {staff.map((member) => (
            <motion.div key={member.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-8 gap-2 mb-2">
              <div className="flex items-center gap-2 p-2">
                <span className="text-lg">{member.avatar}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{member.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{member.role}</p>
                </div>
              </div>
              {daysOfWeek.map((_, dayIdx) => {
                const shift = shifts.find(s => s.staffId === member.id && s.day === dayIdx);
                return (
                  <div key={dayIdx} className="p-1 min-h-[50px] flex items-center justify-center">
                    {shift ? (
                      <div className="w-full rounded-lg bg-primary/10 text-primary text-center py-1.5 px-1">
                        <p className="text-[10px] font-bold">{shift.start}</p>
                        <p className="text-[9px]">{shift.end}</p>
                      </div>
                    ) : (
                      <div className="w-full rounded-lg border border-dashed border-border text-center py-2 text-[10px] text-muted-foreground">—</div>
                    )}
                  </div>
                );
              })}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        <div className="glass-card p-4 text-center">
          <p className="text-xl font-display font-bold text-foreground">{staff.length}</p>
          <p className="text-xs text-muted-foreground">Total Staff</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-xl font-display font-bold text-primary">{shifts.length}</p>
          <p className="text-xs text-muted-foreground">Shifts This Week</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-xl font-display font-bold text-warning">{swapRequests.length}</p>
          <p className="text-xs text-muted-foreground">Swap Requests</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-xl font-display font-bold text-success">{Math.round(shifts.length * 8)}</p>
          <p className="text-xs text-muted-foreground">Total Hours</p>
        </div>
      </div>
    </AdminLayout>
  );
}
