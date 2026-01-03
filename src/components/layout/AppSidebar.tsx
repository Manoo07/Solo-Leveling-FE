import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  Trophy,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  User,
  ListTodo,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useCurrentUser, useLogout } from "@/hooks/api";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Todos", url: "/todos", icon: ListTodo },
  { title: "Goals & Achievements", url: "/goals", icon: Trophy },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state, toggleSidebar, isMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate();
  };

  const getUserInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar
      className={cn(
        "border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed && !isMobile ? "w-[3.5rem]" : "w-60"
      )}
      collapsible="icon"
    >
      <SidebarHeader
        className={cn(
          "p-3 border-b border-sidebar-border",
          collapsed && !isMobile ? "px-2" : "px-3"
        )}
      >
        <div
          className={cn(
            "flex items-center",
            collapsed && !isMobile ? "justify-center" : "justify-between"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-2",
              collapsed && !isMobile && "justify-center"
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <CheckSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            {(!collapsed || isMobile) && (
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm text-sidebar-foreground truncate">
                  Solo Leveling
                </span>
                <span className="text-[10px] text-sidebar-foreground/60">
                  Level up daily
                </span>
              </div>
            )}
          </div>
          {(!collapsed || isMobile) && !isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 flex-shrink-0 hover:bg-sidebar-accent text-sidebar-foreground"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Expand button when collapsed (desktop only) */}
              {collapsed && !isMobile && (
                <SidebarMenuItem className="mb-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="w-full h-8 flex items-center justify-center hover:bg-sidebar-accent text-sidebar-foreground"
                  >
                    <PanelLeft className="h-4 w-4" />
                  </Button>
                </SidebarMenuItem>
              )}

              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.url ||
                  (item.url !== "/" && location.pathname.startsWith(item.url));

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={collapsed ? item.title : undefined}
                    >
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className={cn(
                          "flex items-center gap-3 rounded-md transition-colors",
                          collapsed && !isMobile ? "justify-center px-0 py-2" : "px-3 py-2",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          isActive &&
                            "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        )}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        {(!collapsed || isMobile) && (
                          <span className="truncate">{item.title}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Footer */}
      <SidebarFooter className="p-2 border-t border-sidebar-border">
        {collapsed && !isMobile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-full h-10 hover:bg-sidebar-accent"
              >
                <Avatar className="w-7 h-7">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {getUserInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">{user?.name || "User"}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start h-auto p-2 hover:bg-sidebar-accent"
              >
                <div className="flex items-center gap-2 w-full">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {getUserInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="text-sm font-medium text-sidebar-foreground truncate text-left">
                      {user?.name || "User"}
                    </span>
                    <span className="text-xs text-sidebar-foreground/60 truncate text-left">
                      {user?.email}
                    </span>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
