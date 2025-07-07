import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export function Layout({ children }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          {/* <div className="flex items-center gap-4 p-4 border-b bg-white/80 backdrop-blur-sm">
            <SidebarTrigger className="shrink-0" />
          </div> */}
          <main className="flex-1">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
