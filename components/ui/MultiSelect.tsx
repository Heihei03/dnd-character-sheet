"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import ThemedAutocomplete from "./ThemedAutocomplete";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
    className?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ value, onChange, options, placeholder, className }) => {
    const [inputValue, setInputValue] = useState("");
    const tags = value.split(",").map(s => s.trim()).filter(Boolean);

    const addTag = (val: string) => {
        const trimmed = val.trim();
        if (trimmed && !tags.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
            onChange([...tags, trimmed].join(", "));
        }
        setInputValue("");
    };

    const removeTag = (idx: number) => {
        const newTags = tags.filter((_, i) => i !== idx);
        onChange(newTags.join(", "));
    };

    return (
        <div className={cn("space-y-2 w-full min-w-0 max-w-full", className)}>
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 min-h-[24px] max-w-full overflow-hidden">
                    {tags.map((tag, idx) => (
                        <div 
                            key={`${tag}-${idx}`} 
                            className="flex items-center gap-1 bg-primary/10 text-[10px] px-2 py-0.5 rounded border border-primary/20 shadow-sm animate-in fade-in zoom-in-95 duration-200"
                        >
                            <span className="font-black text-primary uppercase tracking-tight">{tag}</span>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    removeTag(idx);
                                }}
                                className="text-primary hover:text-red-500 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <div className="relative">
                <ThemedAutocomplete
                    value={inputValue}
                    onChange={(val) => {
                        setInputValue(val);
                        // If it's a perfect match from options, add it immediately
                        if (options.some(opt => opt.toLowerCase() === val.toLowerCase())) {
                            const match = options.find(opt => opt.toLowerCase() === val.toLowerCase());
                            if (match) addTag(match);
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && inputValue.trim()) {
                            e.preventDefault();
                            addTag(inputValue);
                        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
                            removeTag(tags.length - 1);
                        }
                    }}
                    options={options}
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
};

export default MultiSelect;
