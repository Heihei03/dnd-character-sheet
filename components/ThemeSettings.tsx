"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "./providers/ThemeProvider";
import { Moon, Sun, Monitor, RotateCcw, X, Check, Smartphone, Columns } from "lucide-react";
import { cn } from "@/lib/utils";
import ModalScrollLock from "./ui/ModalScrollLock";

interface ThemeSettingsProps {
    onClose: () => void;
}

const CLASS_PRESETS = [
    { name: "Barbarian", color: "#e11d48", label: "BAR" },
    { name: "Bard", color: "#d946ef", label: "BRD" },
    { name: "Cleric", color: "#f59e0b", label: "CLR" },
    { name: "Druid", color: "#10b981", label: "DRD" },
    { name: "Fighter", color: "#4b5563", label: "FTR" },
    { name: "Monk", color: "#06b6d4", label: "MNK" },
    { name: "Paladin", color: "#fbbf24", label: "PAL" },
    { name: "Ranger", color: "#16a34a", label: "RGR" },
    { name: "Rogue", color: "#1f2937", label: "ROG" },
    { name: "Sorcerer", color: "#f43f5e", label: "SOR" },
    { name: "Warlock", color: "#7c3aed", label: "WAR" },
    { name: "Wizard", color: "#2563eb", label: "WIZ" },
];

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ onClose }) => {
    const { theme, setTheme, primaryColor, setPrimaryColor, mobileLayout, setMobileLayout, resetToDefaults } = useTheme();
    const [tempColor, setTempColor] = useState(primaryColor);

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTempColor(e.target.value);
        setPrimaryColor(e.target.value);
    };

    const handlePresetSelect = (hex: string) => {
        setTempColor(hex);
        setPrimaryColor(hex);
    };

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-background md:bg-black/50 md:backdrop-blur-sm animate-in fade-in duration-200">
            <ModalScrollLock isOpen={true} />
            <div className="bg-background w-full h-full md:h-auto max-w-xl rounded-none md:rounded-2xl shadow-none md:shadow-2xl border-0 md:border border-border overflow-hidden animate-in md:zoom-in-95 duration-200 flex flex-col justify-between">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-secondary/30">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-wider text-foreground">Display Settings</h2>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Customize your experience</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6 flex-1 md:flex-initial md:max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {/* Theme Toggle */}
                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            Appearance
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: "light", icon: Sun, label: "Light" },
                                { id: "dark", icon: Moon, label: "Dark" },
                                { id: "system", icon: Monitor, label: "System" },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setTheme(item.id as any)}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
                                        theme === item.id
                                            ? "border-primary bg-primary/5 text-primary shadow-sm"
                                            : "border-border bg-secondary/20 text-muted-foreground hover:border-primary/30"
                                    )}
                                >
                                    <item.icon size={24} />
                                    <span className="text-sm font-bold uppercase tracking-tighter">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mobile Layout Toggle */}
                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                            Mobile Layout Style
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                {
                                    id: "tabs",
                                    icon: Smartphone,
                                    label: "Tabbed Panels (Modern)",
                                    desc: "Optimized. Switch between Stats, Sheet, and Status as tabs on mobile screens."
                                },
                                {
                                    id: "stacked",
                                    icon: Columns,
                                    label: "Classic Column Stack",
                                    desc: "Traditional. Renders everything in one long vertical scrolling page."
                                },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setMobileLayout(item.id as any)}
                                    className={cn(
                                        "flex flex-col items-start gap-2 p-3.5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer relative group w-full",
                                        mobileLayout === item.id
                                            ? "border-primary bg-primary/5 text-primary shadow-sm"
                                            : "border-border bg-secondary/20 text-muted-foreground hover:border-primary/30"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <item.icon size={18} className={mobileLayout === item.id ? "text-primary" : "text-muted-foreground"} />
                                        <span className="text-sm font-bold uppercase tracking-tight">{item.label}</span>
                                    </div>
                                    <p className="text-[11px] font-semibold leading-relaxed opacity-80 mt-1">
                                        {item.desc}
                                    </p>
                                    {mobileLayout === item.id && (
                                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm">
                                            <Check size={8} strokeWidth={4} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Class Presets */}
                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                            Class Presets
                        </label>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {CLASS_PRESETS.map((preset) => (
                                <button
                                    key={preset.name}
                                    onClick={() => handlePresetSelect(preset.color)}
                                    className={cn(
                                        "group relative flex flex-col items-center gap-1 p-2 rounded-lg border border-border transition-all hover:border-primary/50",
                                        primaryColor === preset.color.toLowerCase() ? "bg-primary/10 border-primary" : "bg-secondary/10"
                                    )}
                                    title={preset.name}
                                >
                                    <div 
                                        className="w-6 h-6 rounded-full border border-white/20 shadow-sm"
                                        style={{ backgroundColor: preset.color }}
                                    />
                                    <span className="text-xs font-black text-muted-foreground group-hover:text-primary transition-colors">
                                        {preset.label}
                                    </span>
                                    {primaryColor === preset.color.toLowerCase() && (
                                        <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm">
                                            <Check size={8} strokeWidth={4} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Color Picker */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                Custom Color
                            </label>
                            <span className="text-sm font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded uppercase border border-primary/20">
                                {primaryColor}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-secondary/20 rounded-xl border border-border group transition-all hover:border-primary/30">
                            <div
                                className="w-12 h-12 rounded-lg shadow-inner shrink-0 border-2 border-background"
                                style={{ backgroundColor: primaryColor }}
                            />
                            <div className="flex-1">
                                <input
                                    type="color"
                                    value={tempColor}
                                    onChange={handleColorChange}
                                    className="w-full h-10 bg-transparent cursor-pointer rounded-lg overflow-hidden border-none p-0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Reset */}
                    <div className="pt-2">
                        <button
                            onClick={resetToDefaults}
                            className="w-full py-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all border border-dashed border-border hover:border-primary/30"
                        >
                            <RotateCcw size={14} /> Reset to Defaults
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-secondary/30 border-t border-border flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-10 py-3 bg-primary text-primary-foreground text-sm font-black uppercase tracking-widest rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ThemeSettings;
