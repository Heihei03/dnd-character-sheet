"use client";

import React from "react";
import { Dices } from "lucide-react";
import ResourcePipTracker from "../ResourcePipTracker";
import { Resource } from "../../types/character";
import { FeatureModifier } from "../../types/modifiers";

interface FeatureModifierDisplayProps {
    modifiers: FeatureModifier[];
    featureName: string;
    resources: Resource[];
    onUpdateResourceValue: (id: string, newValue: number) => void;
    onRoll: (mod: FeatureModifier, featureName: string) => void;
}

const FeatureModifierDisplay: React.FC<FeatureModifierDisplayProps> = ({
    modifiers,
    featureName,
    resources,
    onUpdateResourceValue,
    onRoll
}) => {
    if (!modifiers || modifiers.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pt-1">
            {modifiers.map((mod) => {
                const isResource = mod.type === "Resource";
                let resourceName = "";
                let relevantResource: Resource | undefined;

                if (isResource) {
                    try {
                        const data = JSON.parse(mod.value as string || "{}");
                        resourceName = data.name || mod.subType || "";
                        relevantResource = resources.find(r => r.id === mod.id) || 
                                          resources.find(r => r.name.toLowerCase() === resourceName.toLowerCase());
                    } catch {
                        resourceName = (mod.value as string) || mod.subType || "";
                        relevantResource = resources.find(r => r.id === mod.id) || 
                                          resources.find(r => r.name.toLowerCase() === resourceName.toLowerCase());
                    }
                }

                return (
                    <div key={mod.id} className={`flex flex-col border-b border-gray-100 dark:border-gray-800 pb-2 ${isResource ? "sm:col-span-2" : ""}`}>
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex flex-col">
                                <span className="text-xs uppercase font-bold text-gray-400 leading-tight">{mod.type}</span>
                                <span className="font-semibold text-gray-700 dark:text-gray-200">{isResource ? resourceName : mod.subType}</span>
                            </div>
                            {!isResource && mod.type !== "Resistance" && mod.type !== "Immunity" && mod.type !== "Vulnerability" && (
                                <div className="flex items-center gap-2">
                                    <div className="font-mono bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-100 dark:border-gray-700 shadow-sm text-blue-600 dark:text-blue-400 text-xs">
                                        {mod.value}
                                    </div>
                                    {(mod.type === "Roll" || mod.type === "New Action") && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onRoll(mod, featureName); }}
                                            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                            title="Roll"
                                        >
                                            <Dices className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            )}
                            {isResource && relevantResource && (
                                <div className="mt-1">
                                    <ResourcePipTracker
                                        resource={relevantResource}
                                        onUpdate={(val) => onUpdateResourceValue(relevantResource!.id, val)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default FeatureModifierDisplay;
