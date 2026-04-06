"use client";

import React from "react";
import { ChevronDown, Dices, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import FeatureForm from "./FeatureForm";
import FeatureModifierDisplay from "./FeatureModifierDisplay";
import ResourcePipTracker from "../ResourcePipTracker";
import { Feature, CharacterClass, AbilityScores, Resource, RollDamageFunc } from "../../types/character";
import { resolveRollExpression } from "../../utils/character-utils";
import { FeatureModifier } from "../../types/modifiers";

interface FeatureItemProps {
    feature: Feature;
    isEditing: boolean;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onStartEdit: () => void;
    onCancelEdit: () => void;
    onSaveEdit: (data: Partial<Feature>) => void;
    onDelete: () => void;
    highlighted?: boolean;
    resources: Resource[];
    onUpdateResourceValue: (id: string, newValue: number) => void;
    abilityScores: AbilityScores;
    proficiencyBonus: number;
    totalLevel: number;
    rollDamage?: RollDamageFunc;
    classes: CharacterClass[];
    species: string;
    subSpecies?: string;
    background: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({
    feature,
    isEditing,
    isExpanded,
    onToggleExpand,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    onDelete,
    highlighted,
    resources,
    onUpdateResourceValue,
    abilityScores,
    proficiencyBonus,
    totalLevel,
    rollDamage,
    classes,
    species,
    subSpecies,
    background
}) => {
    const handleRoll = (mod: FeatureModifier, featureName: string) => {
        if (!rollDamage) return;

        let expr = "";
        let label = featureName;

        if (mod.type === "Roll") {
            expr = mod.value as string;
            if (mod.subType && mod.subType !== "all") label = `${featureName} (${mod.subType})`;
        } else if (mod.type === "New Action") {
            try {
                const data = JSON.parse(mod.value as string || "{}");
                expr = data.damageDice;
                label = data.name || featureName;
            } catch { return; }
        }

        if (expr) {
            const resolved = resolveRollExpression(expr, abilityScores, totalLevel, proficiencyBonus);
            rollDamage(resolved, label);
        }
    };

    if (isEditing) {
        return (
            <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg border-2 border-blue-100 dark:border-blue-900/30 my-2 shadow-inner">
                <FeatureForm
                    initialData={feature}
                    onSave={onSaveEdit}
                    onCancel={onCancelEdit}
                    isEditing={true}
                    classes={classes}
                    species={species}
                    subSpecies={subSpecies}
                    background={background}
                />
            </div>
        );
    }

    return (
        <Card
            id={`feature-${feature.id}`}
            className={`overflow-hidden group border-none rounded-none shadow-none hover:shadow transition-all duration-200 ${highlighted ? "ring-2 ring-blue-500 ring-opacity-50 relative z-10" : ""}`}
        >
            <CardContent className="p-0">
                <div
                    className="p-3 px-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    onClick={onToggleExpand}
                >
                    <div className="flex items-center gap-3 overflow-hidden flex-1">
                        <div className={`text-xs font-black uppercase px-1.5 py-0.5 rounded whitespace-nowrap ${feature.origin === "Class" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" :
                            feature.origin === "Species" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" :
                                feature.origin === "Background" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" :
                                    feature.origin === "Item" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                                        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            }`}>
                            {feature.origin}: {feature.subclass ? `${feature.subclass} ` : ""}{feature.subOrigin || ""}
                            {feature.level && feature.origin === "Class" ? ` Lvl ${feature.level}` : ""}
                        </div>
                        <h4 className="font-bold truncate">{feature.name}</h4>
                        {feature.modifiers && feature.modifiers.length > 0 && (
                            <div className="hidden sm:flex gap-1 overflow-hidden">
                                {feature.modifiers.map(mod => (
                                    <span key={mod.id} className={`text-[11px] font-bold px-1.5 rounded uppercase tracking-tighter ${mod.type === "Sense" ? "bg-amber-100 text-amber-700" :
                                        mod.type === "Speed" ? "bg-emerald-100 text-emerald-700" :
                                            mod.type === "Bonus" ? "bg-rose-100 text-rose-700" :
                                                "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                        }`}>
                                        {mod.subType || mod.type}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Roll Button for unexpanded view */}
                        {!isExpanded && (() => {
                            const rollableMod = (feature.modifiers || []).find(m => {
                                if (m.type === "Roll" && m.value) return true;
                                if (m.type === "New Action") {
                                    try {
                                        const data = JSON.parse(m.value as string || "{}");
                                        return !!data.damageDice;
                                    } catch { return false; }
                                }
                                return false;
                            });

                            if (!rollableMod) return null;

                            return (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleRoll(rollableMod, feature.name); }}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors flex items-center gap-1.5"
                                    title="Quick Roll"
                                >
                                    <Dices className="w-4 h-4" />
                                    {rollableMod.type === "Roll" && <span className="text-xs font-bold font-mono">{rollableMod.value}</span>}
                                </button>
                            );
                        })()}

                        {/* Resource Tracker for unexpanded view - Always Visible */}
                        {!isExpanded && feature.modifiers?.some(m => m.type === "Resource") && (
                            <div
                                className="hidden md:block w-56"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {feature.modifiers
                                    .filter(m => m.type === "Resource")
                                    .map(mod => {
                                        let resourceName = "";
                                        let relevantResource: Resource | undefined;
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

                                        if (!relevantResource) return null;

                                        return (
                                            <div key={mod.id} className="scale-90 origin-right translate-x-1">
                                                <ResourcePipTracker
                                                    resource={relevantResource}
                                                    onUpdate={(val) => onUpdateResourceValue(relevantResource!.id, val)}
                                                    compact={true}
                                                />
                                            </div>
                                        );
                                    })}
                            </div>
                        )}

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => { e.stopPropagation(); onStartEdit(); }}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            {feature.origin !== "Item" && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            <ChevronDown className={`w-4 h-4 text-gray-400 transform transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </div>
                    </div>
                </div>

                {isExpanded && (
                    <div className="p-4 pt-0 border-t border-gray-100 dark:border-gray-800 space-y-4 bg-gray-50/50 dark:bg-gray-900/50 text-sm animate-in slide-in-from-top-2 duration-200">
                        <div className="whitespace-pre-wrap pt-3 leading-relaxed text-gray-700 dark:text-gray-300">
                            {feature.description}
                        </div>

                        <FeatureModifierDisplay
                            modifiers={feature.modifiers || []}
                            featureName={feature.name}
                            resources={resources}
                            onUpdateResourceValue={onUpdateResourceValue}
                            onRoll={handleRoll}
                        />

                        {(feature.effects && feature.effects.length > 0) && (
                            <div className="space-y-1">
                                <div className="text-xs font-bold uppercase text-gray-400">Additional Effects</div>
                                <ul className="list-disc list-inside space-y-0.5 text-gray-600 dark:text-gray-400">
                                    {feature.effects.map((effect, idx) => (
                                        <li key={idx}>{effect}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default FeatureItem;
