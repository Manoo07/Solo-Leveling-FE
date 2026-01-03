import { ReactNode } from "react";
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { PanelLeft, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: ReactNode;
}

function MobileHeader() {
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="h-9 w-9"
      >
        <PanelLeft className="h-5 w-5" />
      </Button>
      <div className="flex items-center gap-2">
        <CheckSquare className="w-5 h-5 text-primary" />
        <span className="font-semibold text-base">Solo Leveling</span>
      </div>
      <div className="w-9" /> {/* Spacer for centering */}
    </header>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <MobileHeader />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
