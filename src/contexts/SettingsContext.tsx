import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useTheme } from 'next-themes';
import { api, Settings } from '@/lib/api';
import { logger } from '@/lib/logger';

/**
 * Helper function to convert hex to HSL (for CSS variable)
 * This is a utility function used by SettingsProvider
 */
function hexToHsl(hex: string): string {
  // Remove # if present
  let cleanHex = hex.replace('#', '');
  
  // Handle 3-digit hex codes
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(char => char + char).join('');
  }
  
  // Convert to RGB
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
      default: h = 0;
    }
  }
  
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  const lightness = Math.round(l * 100);
  
  return `${h} ${s}% ${lightness}%`;
}

interface SettingsContextType {
  settings: Settings | null;
  isLoading: boolean;
  error: Error | null;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const { setTheme, theme } = useTheme();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedSettings = await api.getSettings();
      setSettings(loadedSettings);
      
      // Apply appearance settings
      if (loadedSettings) {
        // Apply theme (only on initial load or admin update, NEVER override user preference)
        if (loadedSettings.theme) {
          // Check if this is initial load or settings update
          // Use window object to store flags for settings state management
          interface WindowWithFlags extends Window {
            __settingsLoaded?: boolean;
            __settingsThemeUpdate?: boolean;
            __userChangedTheme?: boolean;
          }
          const win = window as WindowWithFlags;
          const isInitialLoad = !win.__settingsLoaded;
          win.__settingsLoaded = true;
          const isSettingsUpdate = win.__settingsThemeUpdate;
          
          // Check if user has manually changed theme (prevents override)
          const userHasManuallyChangedTheme = typeof window !== 'undefined' && win.__userChangedTheme;
          
          // Only apply settings theme if:
          // 1. Initial load (first time) - always apply, OR
          // 2. Settings update from admin AND user hasn't manually changed theme
          // This ensures user preference is respected after they toggle
          if (isInitialLoad || (isSettingsUpdate && !userHasManuallyChangedTheme)) {
            if (loadedSettings.theme === 'auto') {
              setTheme('system');
            } else {
              setTheme(loadedSettings.theme);
            }
          }
          
          // Reset settings update flag
          if (isSettingsUpdate) {
            win.__settingsThemeUpdate = false;
          }
        }
        
        // Apply primary color via CSS variable
        if (loadedSettings.primaryColor) {
          try {
            const hsl = hexToHsl(loadedSettings.primaryColor);
            const [h, s, l] = hsl.split(' ');
            const lightness = parseInt(l.replace('%', ''));
            
            // Set primary color
            document.documentElement.style.setProperty('--primary', hsl);
            
            // Calculate primary-foreground based on lightness
            // If primary is dark, foreground should be light, and vice versa
            const foregroundLightness = lightness < 50 ? 98 : 15;
            document.documentElement.style.setProperty('--primary-foreground', `${h} ${s} ${foregroundLightness}%`);
            
            // Also update ring color (for focus states, borders, etc.)
            document.documentElement.style.setProperty('--ring', hsl);
            
            // Update border color for primary elements
            const borderLightness = Math.max(15, lightness - 10);
            document.documentElement.style.setProperty('--primary-border', `${h} ${s} ${borderLightness}%`);
          } catch (err) {
            logger.error('Error converting primary color to HSL', err);
          }
        }
        
        // Apply favicon
        if (loadedSettings.faviconUrl) {
          const favicon = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (favicon) {
            favicon.href = loadedSettings.faviconUrl;
          } else {
            const link = document.createElement('link');
            link.rel = 'icon';
            link.href = loadedSettings.faviconUrl;
            document.head.appendChild(link);
          }
        }
      }
    } catch (err) {
      logger.error('Error loading settings', err);
      setError(err instanceof Error ? err : new Error('Failed to load settings'));
    } finally {
      setIsLoading(false);
    }
  }, [setTheme]);

  useEffect(() => {
    loadSettings();
    
    // Listen for settings update event
    const handleSettingsUpdate = () => {
      // Set flag to indicate this is a settings update (admin changed theme)
      interface WindowWithFlags extends Window {
        __settingsThemeUpdate?: boolean;
      }
      (window as WindowWithFlags).__settingsThemeUpdate = true;
      loadSettings();
    };
    
    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, [loadSettings, setTheme, theme]);
  
  // Apply primary color changes in real-time when settings change
  useEffect(() => {
    if (settings?.primaryColor) {
      try {
        const hsl = hexToHsl(settings.primaryColor);
        const [h, s, l] = hsl.split(' ');
        const lightness = parseInt(l.replace('%', ''));
        
        // Set primary color
        document.documentElement.style.setProperty('--primary', hsl);
        
        // Calculate primary-foreground based on lightness
        const foregroundLightness = lightness < 50 ? 98 : 15;
        document.documentElement.style.setProperty('--primary-foreground', `${h} ${s} ${foregroundLightness}%`);
        
        // Also update ring color (for focus states, borders, etc.)
        document.documentElement.style.setProperty('--ring', hsl);
        
        // Update border color for primary elements
        const borderLightness = Math.max(15, lightness - 10);
        document.documentElement.style.setProperty('--primary-border', `${h} ${s} ${borderLightness}%`);
      } catch (err) {
        logger.error('Error applying primary color in real-time', err);
      }
    }
  }, [settings?.primaryColor]);
  
  // Don't apply theme changes automatically - only on initial load or admin update
  // This prevents overriding user preference when they toggle theme
  
  // Apply logo changes in real-time when settings change
  useEffect(() => {
    if (settings?.logoUrl && typeof document !== 'undefined') {
      try {
        // Update all logo images in the page
        const logoImages = document.querySelectorAll('img[src*="koshino_logo"], img[src*="logo"], img[alt*="Koshiro"], img[alt*="Japan"]');
        logoImages.forEach((img: HTMLImageElement) => {
          if (img.src && (img.src.includes('koshino_logo') || img.src.includes('logo') || img.alt?.includes(settings.websiteName || 'Koshiro'))) {
            // Only update if it's actually a logo image (not other images)
            if (img.alt?.includes(settings.websiteName || 'Koshiro') || img.alt?.includes('Japan') || img.src.includes('logo')) {
              img.src = settings.logoUrl;
            }
          }
        });
      } catch (err) {
        logger.error('Error applying logo in real-time', err);
      }
    }
  }, [settings?.logoUrl, settings?.websiteName]);
  
  // Apply favicon changes in real-time when settings change
  useEffect(() => {
    if (settings?.faviconUrl && typeof document !== 'undefined') {
      try {
        const favicon = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (favicon) {
          favicon.href = settings.faviconUrl;
        } else {
          const link = document.createElement('link');
          link.rel = 'icon';
          link.href = settings.faviconUrl;
          document.head.appendChild(link);
        }
      } catch (err) {
        logger.error('Error applying favicon in real-time', err);
      }
    }
  }, [settings?.faviconUrl]);

  const refreshSettings = async () => {
    await loadSettings();
  };

  const value: SettingsContextType = {
    settings,
    isLoading,
    error,
    refreshSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

