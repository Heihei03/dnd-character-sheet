"use client";

import React from "react";
import { Search, X, ChevronDown, SlidersHorizontal, RotateCcw } from "lucide-react";

export interface FilterOption {
    label: string;
    value: string;
}

export interface FilterConfig {
    id: string;
    value: string;
    onValueChange: (value: string) => void;
    options: FilterOption[];
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
    filterOptions?: FilterOption[];
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
                        className="w-full pl-10 pr-10 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
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
                    <div className="relative min-w-[120px] md:w-48">
                        <select
                            value={filtersToRender[0].value}
                            onChange={(e) => filtersToRender[0].onValueChange(e.target.value)}
                            className="w-full pl-3 pr-8 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm appearance-none cursor-pointer"
                        >
                            {filtersToRender[0].options.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-gray-400">
                            <ChevronDown className="h-4 w-4" />
                        </div>
                    </div>
                )}

                {/* Multiple filters toggle */}
                {hasMultipleFilters && (
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all
                            ${showFilters || activeFilterCount > 0 
                                ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                                : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-gray-300"}
                        `}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span>Filters</span>
                        {activeFilterCount > 0 && (
                            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold bg-blue-500 text-white rounded-full">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                )}
            </div>

            {/* Collapsible filters section */}
            {hasMultipleFilters && showFilters && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200 p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl">
                    <div className="flex flex-wrap gap-4">
                        {filtersToRender.map((filter) => (
                            <div key={filter.id} className={`flex flex-col gap-1.5 flex-1 min-w-[140px] ${filter.className || ""}`}>
                                {filter.placeholder && (
                                    <label className="text-xs uppercase font-bold text-gray-400 px-1">
                                        {filter.placeholder}
                                    </label>
                                )}
                                <div className="relative">
                                    <select
                                        value={filter.value}
                                        onChange={(e) => filter.onValueChange(e.target.value)}
                                        className="w-full pl-3 pr-8 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm appearance-none cursor-pointer"
                                    >
                                        {filter.options.map(opt => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-gray-400">
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {activeFilterCount > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-end">
                            <button
                                onClick={handleClearAll}
                                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
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
