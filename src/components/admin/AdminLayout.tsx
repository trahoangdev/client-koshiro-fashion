import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminSidebar from "./AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
        <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center space-x-2 flex-shrink-0">
              <img 
                src="/koshino_logo_dark.png" 
                alt="KOSHIRO" 
                className="h-6 w-6 sm:h-7 sm:w-7 dark:hidden"
              />
              <img 
                src="/koshino_logo.png" 
                alt="KOSHIRO" 
                className="h-6 w-6 sm:h-7 sm:w-7 hidden dark:block"
              />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-base sm:text-lg truncate">KOSHIRO</h1>
              <p className="text-xs text-muted-foreground truncate">Admin Panel</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="flex-shrink-0">
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
        />

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 min-w-0">
          <div className="min-h-screen">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 