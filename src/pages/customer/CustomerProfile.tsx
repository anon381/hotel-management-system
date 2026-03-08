import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Gift, Star, ShoppingCart, Calendar } from "lucide-react";
import { CustomerLayout } from "@/components/CustomerLayout";
import { PageHeader } from "@/components/PageHeader";

export default function CustomerProfile() {
  return (
    <CustomerLayout>
      <PageHeader title="My Profile" subtitle="Manage your account details" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card-elevated p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h3 className="font-display font-bold text-xl text-foreground">John Doe</h3>
          <p className="text-sm text-muted-foreground">Premium Member</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-success/10 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-success">1,250</p>
              <p className="text-[11px] text-muted-foreground">Points</p>
            </div>
            <div className="bg-warning/10 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-warning">Gold</p>
              <p className="text-[11px] text-muted-foreground">Tier</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 glass-card-elevated p-6">
          <h3 className="font-display font-semibold text-lg text-foreground mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: User, label: "Full Name", value: "John Doe" },
              { icon: Mail, label: "Email", value: "john@example.com" },
              { icon: Phone, label: "Phone", value: "+1 (555) 123-4567" },
              { icon: MapPin, label: "Address", value: "123 Main St, NYC" },
              { icon: Calendar, label: "Member Since", value: "January 2024" },
              { icon: ShoppingCart, label: "Total Orders", value: "24 orders" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <f.icon className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-[11px] text-muted-foreground">{f.label}</p>
                  <p className="text-sm font-medium text-foreground">{f.value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </CustomerLayout>
  );
}
