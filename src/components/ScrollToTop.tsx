import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useLanguage();

  // Show button when page is scrolled up to given distance
  const toggleVisibility = () => {
    const scrolled = window.pageYOffset;
    if (scrolled > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    // Initial check
    toggleVisibility();
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const translations = {
    en: {
      tooltip: "Scroll to top",
      ariaLabel: "Scroll to top of page"
    },
    vi: {
      tooltip: "Cuộn lên đầu",
      ariaLabel: "Cuộn lên đầu trang"
    },
    ja: {
      tooltip: "トップに戻る",
      ariaLabel: "ページのトップにスクロール"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <>
      {isVisible && (
        <div className="fixed bottom-6 right-6 z-[60]">
          <Button
            onClick={scrollToTop}
            className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-300 hover:scale-110 group"
            aria-label={t.ariaLabel}
            title={t.tooltip}
          >
            <ChevronUp className="h-6 w-6 transition-transform group-hover:-translate-y-1" />
          </Button>
        </div>
      )}
    </>
  );
}
