import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Plus, Search, UserCheck, UserX, Key, Activity, Edit2, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";

type Role = "Admin" | "Manager" | "Cashier" | "Kitchen Staff" | "Customer";

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: "Active" | "Inactive";
  lastActive: string;
  avatar: string;
}

const users: User[] = [
  { id: 1, name: "Alex Thompson", email: "alex@cafeluxe.com", role: "Admin", status: "Active", lastActive: "Online now", avatar: "🛡️" },
  { id: 2, name: "James Wilson", email: "james@cafeluxe.com", role: "Manager", status: "Active", lastActive: "5 min ago", avatar: "👔" },
  { id: 3, name: "Marco Rossi", email: "marco@cafeluxe.com", role: "Kitchen Staff", status: "Active", lastActive: "Online now", avatar: "👨‍🍳" },
  { id: 4, name: "Emily Park", email: "emily@cafeluxe.com", role: "Cashier", status: "Active", lastActive: "12 min ago", avatar: "💳" },
  { id: 5, name: "Sarah Chen", email: "sarah@cafeluxe.com", role: "Kitchen Staff", status: "Active", lastActive: "Online now", avatar: "👩‍🍳" },
  { id: 6, name: "Guest User", email: "guest@example.com", role: "Customer", status: "Inactive", lastActive: "3 days ago", avatar: "👤" },
];

const roleColors: Record<Role, string> = {
  Admin: "bg-destructive/10 text-destructive",
  Manager: "bg-primary/10 text-primary",
  Cashier: "bg-info/10 text-info",
  "Kitchen Staff": "bg-success/10 text-success",
  Customer: "bg-muted text-muted-foreground",
};

const rolePermissions: Record<Role, string[]> = {
  Admin: ["Full system control", "User management", "Reports access", "System settings"],
  Manager: ["Menu management", "Staff management", "Reports", "Order management"],
  Cashier: ["Order management", "Payments", "Basic reports"],
  "Kitchen Staff": ["View orders", "Update preparation status", "Mark orders ready"],
  Customer: ["View menu", "Place orders", "View order history"],
};

export default function UsersPage() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  return (
    <AppLayout>
      <PageHeader
        title="Users & Role Management"
        subtitle="Manage user access, roles, and permissions"
        actions={
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="gradient-warm text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" /> Add User
          </motion.button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users list */}
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card-elevated overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border/50">
                    <th className="text-left p-4">User</th>
                    <th className="text-left p-4">Role</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Last Active</th>
                    <th className="text-right p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-t border-border/30 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{user.avatar}</span>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <button onClick={() => setSelectedRole(user.role)}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${roleColors[user.role]} cursor-pointer hover:opacity-80`}
                        >{user.role}</button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          {user.status === "Active" ? (
                            <><UserCheck className="w-3.5 h-3.5 text-success" /><span className="text-xs text-success font-medium">Active</span></>
                          ) : (
                            <><UserX className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground font-medium">Inactive</span></>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">{user.lastActive}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <motion.button whileTap={{ scale: 0.9 }} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center">
                            <Edit2 className="w-3.5 h-3.5 text-foreground" />
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.9 }} className="w-7 h-7 rounded-lg hover:bg-destructive/10 flex items-center justify-center">
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Role Permissions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card-elevated p-5 h-fit sticky top-8">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-foreground">Role Permissions</h2>
          </div>
          <div className="space-y-4">
            {(Object.keys(rolePermissions) as Role[]).map((role) => (
              <motion.div
                key={role}
                whileHover={{ x: 4 }}
                onClick={() => setSelectedRole(role)}
                className={`p-3 rounded-xl cursor-pointer transition-all ${selectedRole === role ? "bg-primary/10 border border-primary/30" : "hover:bg-muted"}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${roleColors[role]}`}>{role}</span>
                </div>
                <ul className="space-y-1">
                  {rolePermissions[role].map((perm) => (
                    <li key={perm} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-primary" /> {perm}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
