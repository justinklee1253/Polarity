import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  LayoutDashboard,
  UserRound,
  Rocket,
  LogOut,
  PanelRight,
  Shield,
  Sparkles,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Ask Spark",
    url: "/spark",
    icon: Rocket,
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { state, toggleSidebar } = useSidebar();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      toast({
        title: "Logged out successfully",
        description: "See you next time!",
      });
      navigate("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/auth");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleProfileEdit = () => {
    navigate("/edit-profile");
  };

  const isCollapsed = state === "collapsed";
  const sidebarWidth = isCollapsed ? "4.5rem" : "16rem"; // Skinny bar is about 2/5 of expanded width

  return (
    <Sidebar
      collapsible="icon"
      className="bg-slate-900/90 backdrop-blur-xl border-r border-white/10 [&[data-state]]:bg-slate-900/90 [&]:bg-slate-900/90 [&>*]:bg-transparent"
    >
      <div
        className="flex flex-col h-full transition-all duration-300 ease-out backdrop-blur-xl bg-slate-900/90 border-r border-white/10 shadow-2xl shadow-black/20 relative overflow-hidden"
        style={{
          width: sidebarWidth,
          minWidth: sidebarWidth,
          maxWidth: sidebarWidth,
        }}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/10 via-transparent to-cyan-900/10" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
        {isCollapsed ? (
          <>
            {/* Collapsed Header */}
            <SidebarHeader className="relative z-10 p-4 flex flex-col items-center justify-center gap-3">
              {/* <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-110">
                <Sparkles className="w-6 h-6 text-white" />
              </div> */}
              {/* User Avatar */}
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-white/10 cursor-pointer mt-4 transition-all duration-300 hover:scale-105 group"
                      onClick={handleProfileEdit}
                    >
                      <Avatar className="h-8 w-8 group-hover:scale-110 transition-transform duration-300">
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-cyan-500 text-white text-sm border-2 border-white/20">
                          <UserRound className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="ml-2 bg-slate-800 border-white/10 text-white"
                  >
                    Edit Profile
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {/* Expand Button below avatar */}
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={toggleSidebar}
                      className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-slate-300 hover:text-emerald-400 transition-all duration-300 mt-2 hover:scale-110 group"
                    >
                      <PanelRight className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="ml-2 bg-slate-800 border-white/10 text-white"
                  >
                    Expand Sidebar
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </SidebarHeader>
            {/* Collapsed Content: Navigation Icons */}
            <SidebarContent className="relative z-10 flex-1 flex flex-col items-center gap-3 px-2 mt-6">
              {menuItems.map((item, index) => (
                <TooltipProvider key={item.title} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={`relative w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 group overflow-hidden ${
                          location.pathname === item.url
                            ? "bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/25 scale-105"
                            : "hover:bg-white/10 hover:text-cyan-400 text-slate-400 hover:scale-105"
                        }`}
                        onClick={() => navigate(item.url)}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <item.icon
                          className={`h-5 w-5 transition-all duration-300 ${
                            location.pathname === item.url
                              ? "scale-110"
                              : "group-hover:scale-110 group-hover:rotate-6"
                          }`}
                        />
                        {location.pathname === item.url && (
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 rounded-xl" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="ml-2 bg-slate-800 border-white/10 text-white"
                    >
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </SidebarContent>
            {/* Collapsed Footer: Logout Button */}
            <SidebarFooter className="relative z-10 p-4 flex flex-col items-center gap-2">
              <div className="w-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-3" />
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-12 h-12 flex items-center justify-center rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all duration-300 hover:scale-105 group"
                    >
                      <LogOut
                        className={`h-5 w-5 transition-transform duration-300 ${
                          isLoggingOut
                            ? "animate-spin"
                            : "group-hover:scale-110"
                        }`}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="ml-2 bg-slate-800 border-white/10 text-white"
                  >
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </SidebarFooter>
          </>
        ) : (
          <>
            {/* Expanded Header */}
            <SidebarHeader className="relative z-10 p-6 w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500 bg-clip-text text-transparent">
                    Polarity
                  </span>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-emerald-400 transition-all duration-300 hover:scale-110 group"
                >
                  <PanelRight className="h-5 w-5 rotate-180 group-hover:-rotate-12 transition-transform duration-300" />
                </button>
              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-4" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-auto p-4 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-[1.02] border border-white/10 hover:border-emerald-500/30"
                  >
                    <Avatar className="h-10 w-10 hover:scale-110 transition-transform duration-300">
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-cyan-500 text-white text-sm border-2 border-white/20">
                        <UserRound className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold text-white">
                        Profile
                      </span>
                      <span className="text-xs text-slate-400">
                        Manage account
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 backdrop-blur-xl bg-slate-900/90 border border-white/10 shadow-2xl"
                >
                  <DropdownMenuItem
                    onClick={handleProfileEdit}
                    className="text-slate-300 hover:text-white hover:bg-white/10 transition-colors duration-300"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Edit Profile
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarHeader>

            {/* Expanded Content */}
            <SidebarContent className="relative z-10 mt-4">
              <SidebarGroup>
                <SidebarGroupContent className="px-4">
                  <SidebarMenu className="space-y-2">
                    {menuItems.map((item, index) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname === item.url}
                          className={`relative rounded-xl transition-all duration-500 hover:bg-white/10 hover:text-cyan-400 hover:scale-[1.02] ${
                            location.pathname === item.url
                              ? "bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/25 scale-[1.02]"
                              : "text-slate-400"
                          }`}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <a
                            href={item.url}
                            onClick={(e) => {
                              e.preventDefault();
                              navigate(item.url);
                            }}
                            className="flex items-center gap-3 p-3 w-full group"
                          >
                            <item.icon
                              className={`h-5 w-5 transition-all duration-300 ${
                                location.pathname === item.url
                                  ? "scale-110"
                                  : "group-hover:scale-110 group-hover:rotate-6"
                              }`}
                            />
                            <span className="font-medium">{item.title}</span>
                            {location.pathname === item.url && (
                              <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-l-full" />
                            )}
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            {/* Expanded Footer */}
            <SidebarFooter className="relative z-10 p-6 w-full">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4" />
              <Button
                onClick={handleLogout}
                disabled={isLoggingOut}
                variant="ghost"
                className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all duration-300 hover:scale-[1.02] p-3 border border-red-500/20 hover:border-red-500/40"
              >
                <LogOut
                  className={`h-5 w-5 transition-transform duration-300 ${
                    isLoggingOut ? "animate-spin" : "hover:scale-110"
                  }`}
                />
                <span className="font-medium">
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </span>
              </Button>
            </SidebarFooter>
          </>
        )}
      </div>
    </Sidebar>
  );
}
