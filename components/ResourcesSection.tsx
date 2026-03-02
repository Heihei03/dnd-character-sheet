"use client";

import React from "react";
import { Resource } from "../types/character";
import { Card, CardContent } from "./ui/card";
import { Plus, Minus, RotateCcw } from "lucide-react";

interface ResourcesSectionProps {
    resources: Resource[];
    onUpdateResources: (resources: Resource[]) => void;
}

const ResourcesSection: React.FC<ResourcesSectionProps> = ({ resources = [], onUpdateResources }) => {
    const handleUpdateValue = (id: string, delta: number) => {
        const newResources = resources.map(r => {
            if (r.id === id) {
                const newValue = Math.max(0, Math.min(r.max, r.value + delta));
                return { ...r, value: newValue };
            }
            return r;
        });
        onUpdateResources(newResources);
    };

    const handleReset = (id: string) => {
        const newResources = resources.map(r => {
            if (r.id === id) {
                return { ...r, value: r.max };
            }
            return r;
        });
        onUpdateResources(newResources);
    };

    if (resources.length === 0) {
        return null;
    }

    return (
        <Card className="overflow-hidden border-blue-100 dark:border-blue-900 shadow-sm">
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <div className="w-2 h-5 bg-blue-500 rounded-full" />
                    Resources
                </h3>
            </div>
            <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resources.map((resource) => (
                        <div key={resource.id} className="relative group p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">{resource.name}</h4>
                                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{resource.regain}</span>
                                </div>
                                <button
                                    onClick={() => handleReset(resource.id)}
                                    className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                                    title="Reset to max"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                </button>
                            </div>

                            <div className="flex items-center justify-between gap-4 mt-2">
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="font-mono font-bold text-gray-900 dark:text-gray-100 italic">
                                            {resource.value} <span className="text-gray-400 font-normal">/ {resource.max}</span>
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 min-h-[20px]">
                                        {Array.from({ length: resource.max }).map((_, i) => {
                                            const isAvailable = i < resource.value;
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => handleUpdateValue(resource.id, isAvailable ? -(resource.value - i) : (i + 1 - resource.value))}
                                                    className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 ${isAvailable
                                                        ? "bg-blue-500 border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                                                        : "bg-transparent border-gray-200 dark:border-gray-700 hover:border-blue-300"
                                                        }`}
                                                    title={isAvailable ? `Use charge ${i + 1}` : `Restore to ${i + 1} charges`}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => handleUpdateValue(resource.id, -1)}
                                        disabled={resource.value <= 0}
                                        className="w-7 h-7 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded-lg border border-gray-100 dark:border-gray-700 transition-all disabled:opacity-20"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => handleUpdateValue(resource.id, 1)}
                                        disabled={resource.value >= resource.max}
                                        className="w-7 h-7 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-400 hover:text-green-500 rounded-lg border border-gray-100 dark:border-gray-700 transition-all disabled:opacity-20"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>

                            {resource.fromFeature && (
                                <div className="absolute top-2 right-8 pointer-events-none">
                                    <span className="text-[8px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1 py-0.5 rounded font-bold uppercase tracking-tighter">Feature</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default ResourcesSection;
