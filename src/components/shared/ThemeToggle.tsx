import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useSettings } from "@/contexts";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const { theme, setTheme, systemTheme } = useTheme();
  const { settings } = useSettings();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before accessing theme (avoid hydration mismatch)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't apply settings theme if user has toggled - respect user preference
  // Settings theme will only apply on initial load, not after user interaction

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const handleToggle = () => {
    // Get current effective theme
    const currentTheme = theme === 'system' ? (systemTheme || 'light') : theme;
    
    // Mark that user has manually changed theme (prevent settings from overriding)
    interface WindowWithFlags extends Window {
      __userChangedTheme?: boolean;
    }
    (window as WindowWithFlags).__userChangedTheme = true;
    
    // Toggle between light and dark
    if (currentTheme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  // Determine which icon to show based on current effective theme
  const currentTheme = theme === 'system' ? (systemTheme || 'light') : theme;
  const isDark = currentTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative"
    >
      <Sun className={`h-4 w-4 transition-all ${isDark ? 'rotate-90 scale-0 absolute' : 'rotate-0 scale-100'}`} />
      <Moon className={`h-4 w-4 transition-all absolute ${isDark ? 'rotate-0 scale-100' : '-rotate-90 scale-0'}`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeToggle;