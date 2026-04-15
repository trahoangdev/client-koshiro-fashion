"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon, ChevronRight } from "lucide-react";
import { motion, useScroll } from "framer-motion";
import { cn } from "@/lib/utils";

const STYLE_ID = "koshiro-hero-animations";

const getRootTheme = () => {
    if (typeof document === "undefined") {
        if (typeof window !== "undefined" && window.matchMedia) {
            return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        return "light";
    }

    const root = document.documentElement;
    if (root.classList.contains("dark")) return "dark";
    if (root.getAttribute("data-theme") === "dark" || root.dataset?.theme === "dark") return "dark";
    if (root.classList.contains("light")) return "light";

    if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    return "light";
};

const useThemeSync = () => {
    const [theme, setTheme] = useState(() => getRootTheme());

    useEffect(() => {
        if (typeof document === "undefined") return;

        const sync = () => {
            const next = getRootTheme();
            setTheme((prev) => (prev === next ? prev : next));
        };

        sync();

        const observer = new MutationObserver(sync);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class", "data-theme"],
        });

        const media =
            typeof window !== "undefined" && window.matchMedia
                ? window.matchMedia("(prefers-color-scheme: dark)")
                : null;

        const onMedia = () => sync();
        media?.addEventListener("change", onMedia);

        const onStorage = (event: StorageEvent) => {
            if (event.key === "koshiro-theme") sync();
        };

        if (typeof window !== "undefined") {
            window.addEventListener("storage", onStorage);
        }

        return () => {
            observer.disconnect();
            media?.removeEventListener("change", onMedia);
            if (typeof window !== "undefined") {
                window.removeEventListener("storage", onStorage);
            }
        };
    }, []);

    return [theme, setTheme] as const;
};

interface KoshiroHeroProps {
    badge?: string;
    title: string;
    subtitle: string;
    primaryAction?: {
        text: string;
        href: string;
    };
    secondaryAction?: {
        text: string;
        href: string;
    };
    images: string[];
}

export function KoshiroHero({
    badge = "Bộ sưu tập mới 2024",
    title = "Koshiro",
    subtitle = "Phong cách cổ điển kết hợp hiện đại. Thời trang tinh tế cho người sành điệu.",
    primaryAction = { text: "Khám phá bộ sưu tập", href: "#" },
    secondaryAction = { text: "Liên hệ", href: "#" },
    images = [
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&auto=format&fit=crop&q=80",
    ],
}: KoshiroHeroProps) {
    const [menuState, setMenuState] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { scrollYProgress } = useScroll();

    useEffect(() => {
        const unsubscribe = scrollYProgress.on('change', (latest) => {
            setScrolled(latest > 0.05);
        });
        return () => unsubscribe();
    }, [scrollYProgress]);



    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header omitted as it duplicates existing layout functionality usually found in Layout/Header components, 
                but can be added if requested. Ideally this component should just be the Hero section. */}

            <main className="relative min-h-screen overflow-hidden">
                <section className="relative h-screen flex items-center justify-center">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background z-10" />
                        <img
                            src={"/images/banners/koshiro-hero-bg.png"}
                            alt="Fashion Model"
                            className="w-full h-full object-cover grayscale opacity-80"
                        />
                    </div>

                    <div className="relative z-20 mx-auto max-w-7xl px-6 lg:px-12 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="space-y-8">
                            <h1 className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tighter text-white drop-shadow-lg">
                                {title}
                                <br />
                                <span className="bg-gradient-to-r from-white via-yellow-400 to-white bg-clip-text text-transparent">
                                    {badge}
                                </span>
                            </h1>

                            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-light tracking-wide drop-shadow-md">
                                {subtitle}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                                <Button
                                    size="lg"
                                    onClick={() => {
                                        if (primaryAction?.href) window.location.href = primaryAction.href;
                                    }}
                                    className="group relative overflow-hidden h-14 px-8 text-base bg-foreground text-background hover:bg-foreground/90 rounded-none cursor-pointer">
                                    <span className="mr-8 transition-opacity duration-500 group-hover:opacity-0">
                                        {primaryAction?.text || "Shop Collection"}
                                    </span>
                                    <i className="absolute right-1 top-1 bottom-1 z-10 grid w-1/4 place-items-center transition-all duration-500 bg-background/15 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95">
                                        <ChevronRight size={20} strokeWidth={2} aria-hidden="true" />
                                    </i>
                                </Button>

                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => {
                                        if (secondaryAction?.href) window.location.href = secondaryAction.href;
                                    }}
                                    className="h-14 px-8 text-base border-2 border-foreground/20 hover:bg-foreground/5 rounded-none cursor-pointer">
                                    <span>{secondaryAction?.text || "Explore Lookbook"}</span>
                                </Button>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <span className="text-xs tracking-widest uppercase">Scroll to explore</span>
                            <motion.div
                                animate={{ y: [0, 8, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                className="w-px h-12 bg-gradient-to-b from-transparent via-foreground/50 to-transparent"
                            />
                        </div>
                    </motion.div>
                </section>


            </main>
        </div>
    );
}
