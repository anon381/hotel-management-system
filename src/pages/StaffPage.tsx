import { motion } from "framer-motion";
import { Users, Plus, Search, Mail, Phone, Clock, Star, MoreVertical, Calendar } from "lucide-react";
import { AdminLayout as AppLayout } from "@/components/AdminLayout";
import { PageHeader } from "@/components/PageHeader";

const staff = [
  { id: 1, name: "Marco Rossi", role: "Head Chef", avatar: "👨‍🍳", email: "marco@cafeluxe.com", phone: "+1 555-0101", hours: "8AM-4PM", rating: 4.9, status: "On Duty" },
  { id: 2, name: "Sarah Chen", role: "Sous Chef", avatar: "👩‍🍳", email: "sarah@cafeluxe.com", phone: "+1 555-0102", hours: "8AM-4PM", rating: 4.7, status: "On Duty" },
  { id: 3, name: "James Wilson", role: "Manager", avatar: "👔", email: "james@cafeluxe.com", phone: "+1 555-0103", hours: "9AM-5PM", rating: 4.8, status: "On Duty" },
  { id: 4, name: "Emily Park", role: "Cashier", avatar: "💳", email: "emily@cafeluxe.com", phone: "+1 555-0104", hours: "10AM-6PM", rating: 4.5, status: "On Break" },
  { id: 5, name: "Carlos Martinez", role: "Waiter", avatar: "🍽️", email: "carlos@cafeluxe.com", phone: "+1 555-0105", hours: "11AM-7PM", rating: 4.6, status: "On Duty" },
  { id: 6, name: "Anna Schmidt", role: "Pastry Chef", avatar: "🧁", email: "anna@cafeluxe.com", phone: "+1 555-0106", hours: "6AM-2PM", rating: 4.9, status: "Off Duty" },
  { id: 7, name: "David Kim", role: "Kitchen Staff", avatar: "🔪", email: "david@cafeluxe.com", phone: "+1 555-0107", hours: "8AM-4PM", rating: 4.3, status: "On Duty" },
  { id: 8, name: "Lisa Thompson", role: "Hostess", avatar: "🎀", email: "lisa@cafeluxe.com", phone: "+1 555-0108", hours: "5PM-11PM", rating: 4.7, status: "Off Duty" },
];

const statusColors: Record<string, string> = {
  "On Duty": "bg-success/10 text-success",
  "On Break": "bg-warning/10 text-warning",
  "Off Duty": "bg-muted text-muted-foreground",
};

export default function StaffPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Staff Management"
        subtitle="Manage employees, schedules, and performance"
        actions={
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="gradient-warm text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" /> Add Staff
          </motion.button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {staff.map((member, i) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -4 }}
            className="glass-card-elevated p-5 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-2xl">
                {member.avatar}
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusColors[member.status]}`}>
                {member.status}
              </span>
            </div>

            <h3 className="font-display font-semibold text-foreground text-lg">{member.name}</h3>
            <p className="text-sm text-primary font-medium mb-3">{member.role}</p>

            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Mail className="w-3 h-3" /> {member.email}</div>
              <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> {member.phone}</div>
              <div className="flex items-center gap-2"><Clock className="w-3 h-3" /> {member.hours}</div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                <span className="text-sm font-semibold text-foreground">{member.rating}</span>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Schedule
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </AppLayout>
  );
}
