"use client";

import React from "react";
import { Search, X, SlidersHorizontal, RotateCcw } from "lucide-react";
import Select, { SelectOption } from "./Select";

export type { SelectOption as FilterOption };

export interface FilterConfig {
    id: string;
    value: string;
    onValueChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    className?: string;
}

interface SearchFilterBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    searchPlaceholder?: string;
    // Single filter (backward compatibility)
    filterValue?: string;
    onFilterChange?: (value: string) => void;
    filterOptions?: SelectOption[];
    filterPlaceholder?: string;
    // Multiple filters
    filters?: FilterConfig[];
    className?: string;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
    searchQuery,
    onSearchChange,
    searchPlaceholder = "Search...",
    filterValue,
    onFilterChange,
    filterOptions,
    filterPlaceholder = "Filter by...",
    filters,
    className = ""
}) => {
    const [showFilters, setShowFilters] = React.useState(false);

    // Determine which filters to render
    const filtersToRender: FilterConfig[] = [];
    
    if (filters && filters.length > 0) {
        filtersToRender.push(...filters);
    } else if (filterOptions && onFilterChange) {
        filtersToRender.push({
            id: "default-filter",
            value: filterValue || "",
            onValueChange: onFilterChange,
            options: filterOptions,
            placeholder: filterPlaceholder
        });
    }

    const hasMultipleFilters = filters && filters.length > 1;
    
    // Count active filters (where value is not the first option, typically "All")
    const activeFilterCount = filtersToRender.reduce((count, filter) => {
        const defaultValue = filter.options[0]?.value || "";
        return filter.value !== defaultValue ? count + 1 : count;
    }, 0);

    const handleClearAll = () => {
        filtersToRender.forEach(filter => {
            const defaultValue = filter.options[0]?.value || "";
            filter.onValueChange(defaultValue);
        });
    };

    return (
        <div className={`flex flex-col gap-3 ${className}`}>
            <div className="flex flex-col md:flex-row gap-2 w-full">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Search className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 bg-background border border-border rounded-lg focus:outline-none transition-all text-sm shadow-sm"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearchChange("")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Single filter (Legacy/Simple mode) */}
                {!hasMultipleFilters && filtersToRender.length === 1 && (
                    <div className="min-w-[120px] md:w-48">
                        <Select
                            value={filtersToRender[0].value}
                            onValueChange={filtersToRender[0].onValueChange}
                            options={filtersToRender[0].options}
                            placeholder={filtersToRender[0].placeholder}
                        />
                    </div>
                )}

                {/* Multiple filters toggle */}
                {hasMultipleFilters && (
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-black uppercase tracking-widest transition-all
                            ${showFilters || activeFilterCount > 0 
                                ? "border-primary bg-primary/10 text-primary shadow-md shadow-primary/20" 
                                : "border-border bg-background text-muted-foreground hover:border-primary/30"}
                        `}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span>Filters</span>
                        {activeFilterCount > 0 && (
                            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-black bg-primary text-white rounded-full ml-1">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                )}
            </div>

            {/* Collapsible filters section */}
            {hasMultipleFilters && showFilters && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200 p-5 bg-secondary/30 border border-border rounded-2xl shadow-inner">
                    <div className="flex flex-wrap gap-5">
                        {filtersToRender.map((filter) => (
                            <div key={filter.id} className={`flex flex-col gap-2 flex-1 min-w-[150px] ${filter.className || ""}`}>
                                {filter.placeholder && (
                                    <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground px-1">
                                        {filter.placeholder}
                                    </label>
                                )}
                                <Select
                                    value={filter.value}
                                    onValueChange={filter.onValueChange}
                                    options={filter.options}
                                    placeholder={filter.placeholder}
                                />
                            </div>
                        ))}
                    </div>
                    
                    {activeFilterCount > 0 && (
                        <div className="mt-4 pt-3 border-t border-border flex justify-end">
                            <button
                                onClick={handleClearAll}
                                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchFilterBar;
