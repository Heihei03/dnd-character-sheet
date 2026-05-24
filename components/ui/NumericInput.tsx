"use client";

import React, { useRef, useEffect, useState } from "react";
import { ChevronUp, ChevronDown, Plus, Minus } from "lucide-react";
import { cn } from "../../lib/utils";

interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
    value: number | string;
    onChange: (value: number) => void;
    onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    variant?: "vertical" | "horizontal";
    className?: string;
    inputClassName?: string;
    showArrows?: "always" | "hover" | "none";
}

const NumericInput: React.FC<NumericInputProps> = ({
    value,
    onChange,
    onInputChange,
    variant = "vertical",
    className,
    inputClassName,
    showArrows = "always",
    min,
    max,
    step = 1,
    disabled = false,
    ...props
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    
    // Refs to avoid stale closures in the timer
    const incrementRef = useRef<() => void>(() => {});
    const decrementRef = useRef<() => void>(() => {});
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const isPointerDownRef = useRef(false);

    const handleIncrement = () => {
        if (disabled) return;
        const currentValue = typeof value === "string" ? parseFloat(value) || 0 : value;
        const newValue = currentValue + (Number(step) || 1);
        if (max !== undefined && newValue > Number(max)) return;
        onChange(newValue);
    };

    const handleDecrement = () => {
        if (disabled) return;
        const currentValue = typeof value === "string" ? parseFloat(value) || 0 : value;
        const newValue = currentValue - (Number(step) || 1);
        if (min !== undefined && newValue < Number(min)) return;
        onChange(newValue);
    };

    // Update refs on every render
    useEffect(() => {
        incrementRef.current = handleIncrement;
        decrementRef.current = handleDecrement;
    }, [handleIncrement, handleDecrement]);

    const stopTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        isPointerDownRef.current = false;
    };

    const startTimer = (isIncrement: boolean) => {
        if (disabled) return;
        isPointerDownRef.current = true;
        
        const action = isIncrement ? incrementRef : decrementRef;
        action.current();

        // Initial delay before auto-repeat
        timerRef.current = setTimeout(() => {
            let delay = 120;
            const repeat = () => {
                if (!isPointerDownRef.current) return;
                action.current();
                // Accelerate: decrease delay down to 30ms
                delay = Math.max(30, delay * 0.85);
                timerRef.current = setTimeout(repeat, delay);
            };
            repeat();
        }, 400);
    };

    useEffect(() => {
        return () => stopTimer();
    }, []);

    const showControls = showArrows !== "none" && (showArrows === "always" || isHovered);

    if (variant === "horizontal") {
        return (
            <div 
                className={cn(
                    "flex items-center gap-1 bg-background border border-border rounded-lg p-0.5 transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 group",
                    disabled && "opacity-50 cursor-not-allowed",
                    className
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {showArrows !== "none" && (
                    <button
                        type="button"
                        onPointerDown={(e) => {
                            if (e.button !== 0) return; // Only left click
                            startTimer(false);
                        }}
                        onPointerUp={stopTimer}
                        onPointerLeave={stopTimer}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") handleDecrement();
                        }}
                        disabled={disabled || (min !== undefined && Number(value) <= Number(min))}
                        className="flex-shrink-0 flex items-center justify-center h-full aspect-square rounded-md hover:bg-secondary text-muted-foreground hover:text-primary transition-colors disabled:opacity-30 outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                )}
                
                <input
                    {...props}
                    ref={inputRef}
                    type="number"
                    value={value}
                    onChange={onInputChange || ((e) => onChange(parseFloat(e.target.value) || 0))}
                    disabled={disabled}
                    className={cn(
                        "flex-1 min-w-0 bg-transparent text-center font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                        inputClassName
                    )}
                />

                {showArrows !== "none" && (
                    <button
                        type="button"
                        onPointerDown={(e) => {
                            if (e.button !== 0) return;
                            startTimer(true);
                        }}
                        onPointerUp={stopTimer}
                        onPointerLeave={stopTimer}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") handleIncrement();
                        }}
                        disabled={disabled || (max !== undefined && Number(value) >= Number(max))}
                        className="flex-shrink-0 flex items-center justify-center h-full aspect-square rounded-md hover:bg-secondary text-muted-foreground hover:text-primary transition-colors disabled:opacity-30 outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                )}
            </div>
        );
    }

    return (
        <div 
            className={cn(
                "relative flex items-stretch bg-background border border-border rounded-lg transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 group overflow-hidden",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <input
                {...props}
                ref={inputRef}
                type="number"
                value={value}
                onChange={onInputChange || ((e) => onChange(parseFloat(e.target.value) || 0))}
                disabled={disabled}
                className={cn(
                    "flex-1 min-w-0 bg-transparent py-2 font-medium focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                    showArrows === "hover" ? "px-3 md:pl-3 md:pr-1" : (showArrows !== "none" ? "pl-3 pr-1" : "px-3"),
                    inputClassName
                )}
            />
            
            {showArrows !== "none" && (
                <div className={cn(
                    "flex-col w-6 border-l border-border/10 transition-opacity duration-200",
                    showArrows === "hover" ? "hidden md:flex" : "flex",
                    showControls ? "opacity-100" : "opacity-0"
                )}>
                    <button
                        type="button"
                        onPointerDown={(e) => {
                            if (e.button !== 0) return;
                            startTimer(true);
                        }}
                        onPointerUp={stopTimer}
                        onPointerLeave={stopTimer}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") handleIncrement();
                        }}
                        disabled={disabled || (max !== undefined && Number(value) >= Number(max))}
                        className="flex-1 flex items-center justify-center hover:bg-secondary text-muted-foreground/60 hover:text-primary transition-colors disabled:opacity-30 outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
                    >
                        <ChevronUp className="w-3 h-3" />
                    </button>
                    <div className="h-px bg-border/40" />
                    <button
                        type="button"
                        onPointerDown={(e) => {
                            if (e.button !== 0) return;
                            startTimer(false);
                        }}
                        onPointerUp={stopTimer}
                        onPointerLeave={stopTimer}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") handleDecrement();
                        }}
                        disabled={disabled || (min !== undefined && Number(value) <= Number(min))}
                        className="flex-1 flex items-center justify-center hover:bg-secondary text-muted-foreground/60 hover:text-primary transition-colors disabled:opacity-30 outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
                    >
                        <ChevronDown className="w-3 h-3" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default NumericInput;
