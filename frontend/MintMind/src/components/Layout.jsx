import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export function Layout({ children }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-900">
        <AppSidebar />
        <SidebarInset className="flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
          <main className="flex-1">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
