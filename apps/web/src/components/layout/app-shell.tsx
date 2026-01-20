import * as React from "react"
import { Link, Outlet, useLocation } from "@tanstack/react-router"
import { 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  Menu,
  Plus,
  X
} from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { useCanvas } from "@/context/canvas-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { CanvasRenderer } from "@/components/canvas/canvas-renderer"

interface NavItemProps {
  to: string
  icon: React.ElementType
  label: string
  collapsed?: boolean
}

function NavItem({ to, icon: Icon, label, collapsed }: NavItemProps) {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
        isActive ? "bg-secondary text-primary" : "text-muted-foreground",
        collapsed && "justify-center px-2"
      )}
    >
      <Icon className="h-4 w-4" />
      {!collapsed && <span className="text-sm font-medium">{label}</span>}
    </Link>
  )
}

function SidebarContent({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex h-full flex-col gap-4 py-4">
      <div className={cn("px-4 py-2", collapsed && "px-2 text-center")}>
        <h2 className={cn("text-lg font-semibold tracking-tight", collapsed && "sr-only")}>
          AI-Chart
        </h2>
        {collapsed && <span className="text-xl font-bold">A</span>}
      </div>
      <div className="px-2">
        <div className="space-y-1">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} />
          <NavItem to="/chat/new" icon={MessageSquare} label="New Chat" collapsed={collapsed} />
        </div>
      </div>
      <Separator />
      <div className="flex-1 px-2">
        <div className="space-y-1">
          <p className={cn("px-2 text-xs font-semibold uppercase text-muted-foreground mb-2", collapsed && "sr-only")}>
            History
          </p>
          {/* Mock history items */}
          <ScrollArea className="h-[300px]">
             {!collapsed && (
               <div className="space-y-1">
                 {[1, 2, 3].map((i) => (
                   <Link
                     key={i}
                     to="/chat/$chatId"
                     params={{ chatId: `session-${i}` }}
                     className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-primary truncate"
                   >
                     Health Record Analysis {i}
                   </Link>
                 ))}
               </div>
             )}
          </ScrollArea>
        </div>
      </div>
      <Separator />
      <div className="px-2">
        <NavItem to="/settings" icon={Settings} label="Settings" collapsed={collapsed} />
        <div className={cn("mt-4 flex items-center gap-3 px-3", collapsed && "justify-center px-0")}>
          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xs font-medium">John Doe</span>
              <span className="text-[10px] text-muted-foreground">Pro Plan</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function AppShell() {
  const isMobile = useIsMobile()
  const { isOpen, closeCanvas } = useCanvas()
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)

  if (isMobile) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        {/* Header */}
        <header className="flex h-14 items-center gap-4 border-b px-4 shrink-0">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="flex-1 font-semibold truncate">AI-Chart</div>
          <Button variant="ghost" size="icon">
            <Plus className="h-5 w-5" />
          </Button>
        </header>

        {/* Main Content */}
        <main className="relative flex-1 overflow-hidden">
          <Outlet />
          
          {/* Mobile Canvas Overlay (using Sheet for Bottom Drawer) */}
          <Sheet open={isOpen} onOpenChange={(open) => !open && closeCanvas()}>
            <SheetContent side="bottom" className="h-[80vh] p-0">
              <div className="flex h-full flex-col">
                <div className="flex items-center border-b px-4 py-3 shrink-0">
                  <span className="font-semibold text-sm">Analysis Result</span>
                </div>
                <div className="flex-1 overflow-auto">
                  <CanvasRenderer />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </main>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background">
      <ResizablePanelGroup orientation="horizontal">
        {/* Left Sidebar */}
        <ResizablePanel
          defaultSize="15%"
          minSize="5%"
          maxSize="20%"
          collapsible={true}
          onResize={(size) => {
            setSidebarCollapsed(size.asPercentage === 0)
          }}
          className={cn(
            "border-r transition-all duration-300 ease-in-out",
            sidebarCollapsed && "min-w-[60px]"
          )}
        >
          <SidebarContent collapsed={sidebarCollapsed} />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Center - Main Chat Area */}
        <ResizablePanel defaultSize={isOpen ? "45%" : "85%"}>
          <main className="h-full overflow-hidden flex flex-col">
            <header className="h-14 border-b flex items-center px-6 shrink-0 justify-between">
               <span className="font-medium">Current Session</span>
               {!isOpen && (
                 <Button variant="outline" size="sm" onClick={() => {/* Action to open canvas */}}>
                   View Insights
                 </Button>
               )}
            </header>
            <div className="flex-1 overflow-hidden relative">
              <Outlet />
            </div>
          </main>
        </ResizablePanel>

        {isOpen && (
          <>
            <ResizableHandle withHandle />
            {/* Right Canvas */}
            <ResizablePanel defaultSize="40%" minSize="20%">
              <div className="h-full flex flex-col border-l">
                <header className="h-14 border-b flex items-center px-4 shrink-0 justify-between bg-muted/30">
                  <span className="text-sm font-semibold">Artifacts / Canvas</span>
                  <Button variant="ghost" size="icon" onClick={closeCanvas}>
                    <X className="h-4 w-4" />
                  </Button>
                </header>
                <div className="flex-1 overflow-auto p-6">
                  <div className="rounded-xl border-2 border-dashed h-full flex items-center justify-center text-muted-foreground italic">
                    Canvas Content (Charts/Forms) will appear here
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  )
}
