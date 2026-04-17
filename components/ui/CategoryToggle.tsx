"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CategoryToggleProps {
    categories: string[];
    activeCategory: string;
    onSelect: (category: string) => void;
    className?: string;
}

const CategoryToggle: React.FC<CategoryToggleProps> = ({ categories, activeCategory, onSelect, className }) => {
    return (
        <div className={cn("flex items-center gap-1 p-1 bg-secondary/30 rounded-lg w-fit", className)}>
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={(e) => {
                        e.preventDefault();
                        onSelect(cat);
                    }}
                    className={cn(
                        "px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-all rounded-md whitespace-nowrap",
                        activeCategory === cat
                            ? "bg-primary text-white shadow-sm scale-105"
                            : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                    )}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
};

export default CategoryToggle;
