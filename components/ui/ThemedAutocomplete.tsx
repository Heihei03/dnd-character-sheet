"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Search, ChevronDown } from "lucide-react";

interface ThemedAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onSelect?: (value: string) => void;
    options: string[];
    placeholder?: string;
    className?: string;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const ThemedAutocomplete: React.FC<ThemedAutocompleteProps> = ({
    value,
    onChange,
    onSelect,
    options,
    placeholder,
    className,
    onKeyDown
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [openUpwards, setOpenUpwards] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(value.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            // Check if we should open upwards
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                const dropdownHeight = 250; // max-h-60 is ~240px + margin
                setOpenUpwards(spaceBelow < dropdownHeight && rect.top > dropdownHeight);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen && filteredOptions.length > 0) {
            setIsOpen(true);
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
                break;
            case "Enter":
                if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                    e.preventDefault();
                    selectOption(filteredOptions[highlightedIndex]);
                } else if (onKeyDown) {
                    onKeyDown(e);
                }
                break;
            case "Escape":
                setIsOpen(false);
                break;
            default:
                if (onKeyDown) onKeyDown(e);
                break;
        }
    };

    const selectOption = (opt: string) => {
        onChange(opt);
        if (onSelect) onSelect(opt);
        setIsOpen(false);
        setHighlightedIndex(-1);
    };

    return (
        <div className={cn("relative group w-full", className)} ref={containerRef}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setIsOpen(true);
                        setHighlightedIndex(0);
                    }}
                    onFocus={() => {
                        setIsOpen(true);
                        setHighlightedIndex(0);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full text-sm p-2.5 pr-8 bg-background border border-border rounded-xl outline-none focus:ring-1 focus:ring-primary transition-all shadow-inner font-medium placeholder:text-muted-foreground/50"
                />
                <ChevronDown 
                    size={16} 
                    className={cn(
                        "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 transition-transform duration-200 pointer-events-none",
                        isOpen && "rotate-180 text-primary/50"
                    )} 
                />
            </div>

            {isOpen && filteredOptions.length > 0 && (
                <div className={cn(
                    "absolute z-[110] w-full bg-background border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200",
                    openUpwards ? "bottom-full mb-2" : "top-full mt-2"
                )}>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                        {filteredOptions.map((opt, index) => (
                            <button
                                key={opt}
                                onClick={() => selectOption(opt)}
                                onMouseEnter={() => setHighlightedIndex(index)}
                                className={cn(
                                    "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between group/opt",
                                    highlightedIndex === index 
                                        ? "bg-primary/10 text-primary" 
                                        : "text-foreground hover:bg-secondary/50"
                                )}
                            >
                                <span className="font-medium">{opt}</span>
                                {highlightedIndex === index && (
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Select</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThemedAutocomplete;
