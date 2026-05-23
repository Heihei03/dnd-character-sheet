"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
type MobileLayout = "tabs" | "stacked";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    primaryColor: string;
    setPrimaryColor: (color: string) => void;
    mobileLayout: MobileLayout;
    setMobileLayout: (layout: MobileLayout) => void;
    resetToDefaults: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_PRIMARY = "#3b82f6"; // A nice blue default

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>("system");
    const [primaryColor, setPrimaryColorState] = useState<string>(DEFAULT_PRIMARY);
    const [mobileLayout, setMobileLayoutState] = useState<MobileLayout>("tabs");
    const [mounted, setMounted] = useState(false);

    // Initial load from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") as Theme | null;
        const savedColor = localStorage.getItem("primary-color");
        const savedMobileLayout = localStorage.getItem("mobile-layout") as MobileLayout | null;

        if (savedTheme) setThemeState(savedTheme);
        if (savedColor) setPrimaryColorState(savedColor);
        if (savedMobileLayout) setMobileLayoutState(savedMobileLayout);
        
        setMounted(true);
    }, []);

    // Apply theme and color changes
    useEffect(() => {
        if (!mounted) return;

        const root = window.document.documentElement;

        // Handle Theme
        const applyTheme = (t: Theme) => {
            root.classList.remove("light", "dark");
            if (t === "system") {
                const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                root.classList.add(systemTheme);
            } else {
                root.classList.add(t);
            }
        };

        applyTheme(theme);
        localStorage.setItem("theme", theme);

        // Handle Primary Color
        root.style.setProperty("--primary", primaryColor);
        localStorage.setItem("primary-color", primaryColor);

        // Update Foreground color for contrast
        const isLight = isColorLight(primaryColor);
        root.style.setProperty("--primary-foreground", isLight ? "oklch(0.145 0 0)" : "oklch(0.985 0 0)");

    }, [theme, primaryColor, mounted]);

    // Handle Mobile Layout persistence
    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem("mobile-layout", mobileLayout);
    }, [mobileLayout, mounted]);

    // Listen for system theme changes
    useEffect(() => {
        if (theme !== "system") return;

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            const root = window.document.documentElement;
            root.classList.remove("light", "dark");
            root.classList.add(mediaQuery.matches ? "dark" : "light");
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);

    const setTheme = (t: Theme) => setThemeState(t);
    const setPrimaryColor = (c: string) => setPrimaryColorState(c);
    const setMobileLayout = (l: MobileLayout) => setMobileLayoutState(l);
    const resetToDefaults = () => {
        setThemeState("system");
        setPrimaryColorState(DEFAULT_PRIMARY);
        setMobileLayoutState("tabs");
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, primaryColor, setPrimaryColor, mobileLayout, setMobileLayout, resetToDefaults }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};

// Helper function to check if a color is light or dark
function isColorLight(color: string): boolean {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Using relative luminance formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6; // Threshold for "light"
}
