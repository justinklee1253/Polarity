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
  Calendar,
  LogOut,
  PanelRight,
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
  {
    title: "Plan Budget",
    url: "/plan-budget",
    icon: Calendar,
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

  const handleProfileView = () => {
    toast({
      title: "Profile View",
      description: "Profile view feature coming soon!",
    });
  };

  const handleProfileEdit = () => {
    toast({
      title: "Edit Profile",
      description: "Edit profile feature coming soon!",
    });
  };

  const isCollapsed = state === "collapsed";
  const sidebarWidth = isCollapsed ? "4.5rem" : "16rem"; // Skinny bar is about 2/5 of expanded width

  return (
    <Sidebar collapsible="icon">
      <div
        className="flex flex-col h-full transition-all duration-300 ease-in-out bg-white border-r"
        style={{
          width: sidebarWidth,
          minWidth: sidebarWidth,
          maxWidth: sidebarWidth,
        }}
      >
        {isCollapsed ? (
          <>
            {/* Collapsed Header */}
            <SidebarHeader className="p-4 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              {/* User Avatar */}
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-sky-50 cursor-pointer mt-4">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-sm">
                          <UserRound className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="ml-2">
                    Profile
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {/* Expand Button below avatar */}
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={toggleSidebar}
                      className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors mt-2"
                    >
                      <PanelRight className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="ml-2">
                    Expand Sidebar
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </SidebarHeader>
            {/* Collapsed Content: Navigation Icons */}
            <SidebarContent className="flex-1 flex flex-col items-center gap-2 px-2 mt-4">
              {menuItems.map((item) => (
                <TooltipProvider key={item.title} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                          location.pathname === item.url
                            ? "bg-sky-100 text-sky-700"
                            : "hover:bg-sky-50 hover:text-sky-700 text-gray-600"
                        }`}
                        onClick={() => navigate(item.url)}
                      >
                        <item.icon className="h-5 w-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="ml-2">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </SidebarContent>
            {/* Collapsed Footer: Logout Button */}
            <SidebarFooter className="p-4 flex flex-col items-center gap-2">
              <div className="w-full h-px bg-gray-200 mb-2" />
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-10 h-10 flex items-center justify-center rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="ml-2">
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </SidebarFooter>
          </>
        ) : (
          <>
            {/* Expanded Header */}
            <SidebarHeader className="p-4 w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">P</span>
                  </div>
                  <span className="font-semibold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
                    Polarity
                  </span>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                >
                  <PanelRight className="h-4 w-4 rotate-180" />
                </button>
              </div>
              <SidebarSeparator className="my-3" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-auto p-3 hover:bg-sky-50"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-sm">
                        <UserRound className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">Profile</span>
                      <span className="text-xs text-gray-500">
                        Manage account
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleProfileView}>
                    <UserRound className="h-4 w-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleProfileEdit}>
                    <UserRound className="h-4 w-4 mr-2" />
                    Edit Profile
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarHeader>

            {/* Expanded Content */}
            <SidebarContent className="mt-16">
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {menuItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname === item.url}
                          className="hover:bg-sky-50 hover:text-sky-700 data-[active=true]:bg-sky-100 data-[active=true]:text-sky-700 data-[active=true]:border-r-2 data-[active=true]:border-sky-500"
                        >
                          <a
                            href={item.url}
                            onClick={(e) => {
                              e.preventDefault();
                              navigate(item.url);
                            }}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            {/* Expanded Footer */}
            <SidebarFooter className="p-4 w-full">
              <SidebarSeparator />
              <Button
                onClick={handleLogout}
                disabled={isLoggingOut}
                variant="ghost"
                className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 mt-4"
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            </SidebarFooter>
          </>
        )}
      </div>
    </Sidebar>
  );
}
