"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "../../lib/utils";

export interface SelectOption {
    label: string;
    value: string;
}

interface SelectProps {
    value: string;
    onValueChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    className?: string;
    id?: string;
    variant?: "default" | "ghost" | "inline";
}

const Select: React.FC<SelectProps> = ({
    value,
    onValueChange,
    options,
    placeholder = "Select an option...",
    className = "",
    id,
    variant = "default"
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const selectedOption = options.find(opt => opt.value === value);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        onValueChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div id={id} ref={containerRef} className={cn("relative", variant !== "inline" ? "w-full" : "w-fit inline-block", className)}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center justify-between text-left transition-all outline-none",
                    variant === "default" && "w-full px-3 py-2 bg-background border rounded-lg text-sm",
                    variant === "ghost" && "w-full px-3 py-2 bg-transparent border-none text-sm hover:text-primary",
                    variant === "inline" && "px-1 bg-transparent border-none text-[11px] font-bold uppercase tracking-tight hover:text-primary",
                    isOpen && variant === "default" 
                        ? "border-primary ring-2 ring-primary/20 shadow-sm" 
                        : (variant === "default" ? "border-border hover:border-primary/50" : "")
                )}
            >
                <span className={cn("truncate", !selectedOption && "text-muted-foreground")}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                {variant !== "inline" && (
                    <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200 ml-2", isOpen && "rotate-180")} />
                )}
            </button>

            {isOpen && (
                <div className={cn(
                    "absolute z-50 mt-1.5 py-1 bg-background border border-border rounded-xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 max-h-60 overflow-y-auto custom-scrollbar",
                    variant === "inline" ? "min-w-[100px] left-0" : "w-full mt-1.5"
                )}>
                    {options.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground italic">No options found.</div>
                    ) : (
                        options.map((option) => {
                            const isSelected = option.value === value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-3 py-2 text-sm transition-all",
                                        isSelected 
                                            ? "bg-primary/10 text-primary font-bold" 
                                            : "hover:bg-primary/5 hover:text-primary"
                                    )}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {isSelected && <Check className="w-3.5 h-3.5" />}
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default Select;
