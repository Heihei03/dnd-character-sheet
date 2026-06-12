"use client";

import React from "react";
import { Dices } from "lucide-react";
import ResourcePipTracker from "../ResourcePipTracker";
import { Resource, AbilityScores, CharacterClass } from "../../types/character";
import { FeatureModifier } from "../../types/modifiers";
import { getAbilityModifier, getCharacterSpellcastingAbility, getEffectiveBonuses } from "../../utils/character-utils";

interface FeatureModifierDisplayProps {
    modifiers: FeatureModifier[];
    featureName: string;
    resources: Resource[];
    onUpdateResourceValue: (id: string, newValue: number) => void;
    onRoll: (mod: FeatureModifier, featureName: string) => void;
    abilityScores?: AbilityScores;
    proficiencyBonus?: number;
    classes?: CharacterClass[];
    character?: any;
}

const FeatureModifierDisplay: React.FC<FeatureModifierDisplayProps> = ({
    modifiers,
    featureName,
    resources,
    onUpdateResourceValue,
    onRoll,
    abilityScores,
    proficiencyBonus,
    classes,
    character
}) => {
    if (!modifiers || modifiers.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pt-1">
            {modifiers.map((mod) => {
                const isResource = mod.type === "Resource";
                const isSave = mod.type === "Save";
                let resourceName = "";
                let relevantResource: Resource | undefined;
                let saveDetails = null;

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

                if (isSave) {
                    try {
                        const data = JSON.parse(mod.value as string || "{}");
                        let ability = data.dcAbility || "strength";
                        if (data.dcCalculation === "spellcasting") {
                            ability = getCharacterSpellcastingAbility(character || { classes, abilityScores } as any, undefined);
                        }
                        const abilityScore = abilityScores?.[ability] || 10;
                        const abilityModifier = getAbilityModifier(abilityScore);
                        
                        let saveDcBonusFromActive = 0;
                        if (character) {
                            getEffectiveBonuses(character, 'spell-dc').forEach(b => {
                                const val = parseInt(b.bonus) || 0;
                                saveDcBonusFromActive += val;
                            });
                        }

                        const calculatedDC = data.dcCalculation === "flat"
                            ? (data.flatDc !== undefined ? data.flatDc : 10)
                            : (8 + abilityModifier + (proficiencyBonus || 2) + saveDcBonusFromActive);

                        saveDetails = {
                            dc: calculatedDC,
                            saveType: mod.subType || "Strength",
                            damageDice: data.damageDice || "",
                            damageType: data.damageType || "",
                            effect: data.effect || "",
                            passEffect: data.passEffect || "",
                            saveDcBonusFromActive
                        };
                    } catch {
                        // Fallback in case of parse error
                    }
                }

                if (isSave && saveDetails) {
                    return (
                        <div key={mod.id} className="flex flex-col border-b border-gray-100 dark:border-gray-800 pb-2 sm:col-span-2">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex flex-col">
                                    <span className="text-xs uppercase font-bold text-gray-400 leading-tight">Forced Save</span>
                                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                                        DC {saveDetails.dc} {saveDetails.saveType} Save
                                        {saveDetails.saveDcBonusFromActive > 0 && (
                                            <span className="text-[10px] text-primary ml-1">(+{saveDetails.saveDcBonusFromActive})</span>
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {saveDetails.damageDice && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onRoll(mod, featureName); }}
                                            className="font-mono font-bold hover:bg-primary/20 cursor-pointer flex items-center gap-2 text-primary bg-primary/5 px-2.5 py-1 rounded-full border border-primary/20 transition-all shadow-sm text-xs"
                                            title="Roll Save Damage/Effect"
                                        >
                                            <Dices className="w-3.5 h-3.5" />
                                            {saveDetails.damageDice} {saveDetails.damageType}
                                        </button>
                                    )}
                                </div>
                            </div>
                            {(saveDetails.effect || saveDetails.passEffect) && (
                                <div className="mt-1 space-y-1 pl-1 border-l-2 border-primary/20 text-xs text-muted-foreground">
                                    {saveDetails.effect && (
                                        <div>
                                            <strong className="text-gray-500 dark:text-gray-400">On Failure:</strong> {saveDetails.effect}
                                        </div>
                                    )}
                                    {saveDetails.passEffect && (
                                        <div>
                                            <strong className="text-gray-500 dark:text-gray-400">On Success:</strong> {saveDetails.passEffect}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
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
