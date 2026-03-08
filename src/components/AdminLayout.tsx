import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AdminSidebar />
      <main className="flex-1 min-w-0">
        <div className="h-14 lg:hidden" />
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
