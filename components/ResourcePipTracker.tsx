"use client";

import React from "react";
import { Resource } from "../types/character";
import { Plus, Minus, RotateCcw } from "lucide-react";

interface ResourcePipTrackerProps {
    resource: Resource;
    onUpdate: (newValue: number) => void;
    compact?: boolean;
}

const ResourcePipTracker: React.FC<ResourcePipTrackerProps> = ({
    resource,
    onUpdate,
    compact = false
}) => {
    const handleUpdateValue = (delta: number) => {
        const newValue = Math.max(0, Math.min(resource.max, resource.value + delta));
        onUpdate(newValue);
    };

    const handleSetToLevel = (level: number) => {
        onUpdate(level);
    };

    const handleReset = () => {
        onUpdate(resource.max);
    };

    return (
        <div className={`relative group ${compact ? 'p-2' : 'p-3'} bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all w-full`}>
            <div className="flex justify-between items-start mb-1.5 gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`${compact ? 'text-[11px]' : 'text-sm'} font-bold text-gray-900 dark:text-gray-100 truncate`}>
                            {resource.name}
                        </h4>
                        {resource.fromFeature && !compact && (
                            <span className="text-[8px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1 py-0.5 rounded font-bold uppercase tracking-tighter whitespace-nowrap">
                                Feature
                            </span>
                        )}
                    </div>
                    {!compact && <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{resource.regain}</span>}
                </div>
                <button
                    onClick={handleReset}
                    className="p-1 text-gray-400 hover:text-blue-500 transition-colors shrink-0"
                    title="Reset to max"
                >
                    <RotateCcw className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />
                </button>
            </div>

            <div className={`flex items-center justify-between gap-3 ${compact ? 'mt-1' : 'mt-2'}`}>
                <div className="flex-1">
                    <div className="flex justify-between text-[10px] mb-1">
                        <span className="font-mono font-bold text-gray-900 dark:text-gray-100 italic">
                            {resource.value} <span className="text-gray-400 font-normal">/ {resource.max}</span>
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 min-h-[16px]">
                        {Array.from({ length: resource.max }).map((_, i) => {
                            const isAvailable = i < resource.value;
                            return (
                                <button
                                    key={i}
                                    onClick={() => handleSetToLevel(isAvailable ? i : i + 1)}
                                    className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} rounded-full border-2 transition-all duration-200 ${isAvailable
                                        ? "bg-blue-500 border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                                        : "bg-transparent border-gray-200 dark:border-gray-700 hover:border-blue-300"
                                        }`}
                                    title={isAvailable ? `Set to ${i} charges` : `Restore to ${i + 1} charges`}
                                />
                            );
                        })}
                    </div>
                </div>

                <div className={`flex ${compact ? 'flex-row' : 'flex-col'} gap-1`}>
                    <button
                        onClick={() => handleUpdateValue(-1)}
                        disabled={resource.value <= 0}
                        className={`${compact ? 'w-6 h-6' : 'w-7 h-7'} flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded-lg border border-gray-100 dark:border-gray-700 transition-all disabled:opacity-20`}
                    >
                        <Minus className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />
                    </button>
                    <button
                        onClick={() => handleUpdateValue(1)}
                        disabled={resource.value >= resource.max}
                        className={`${compact ? 'w-6 h-6' : 'w-7 h-7'} flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-400 hover:text-green-500 rounded-lg border border-gray-100 dark:border-gray-700 transition-all disabled:opacity-20`}
                    >
                        <Plus className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />
                    </button>
                </div>
            </div>

        </div>
    );
};

export default ResourcePipTracker;
