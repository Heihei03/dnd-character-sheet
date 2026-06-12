"use client";

import React from "react";
import { FeatureModifier } from "../../../types/modifiers";
import { DAMAGE_TYPES } from "../../../utils/constants";
import Select from "../../ui/Select";
import ThemedAutocomplete from "../../ui/ThemedAutocomplete";

interface SaveModifierProps {
    modifier: FeatureModifier;
    onUpdate: (updates: Partial<FeatureModifier>) => void;
    availableModifiers?: FeatureModifier[];
}

const ABILITY_OPTIONS = [
    { label: "Strength", value: "strength" },
    { label: "Dexterity", value: "dexterity" },
    { label: "Constitution", value: "constitution" },
    { label: "Intelligence", value: "intelligence" },
    { label: "Wisdom", value: "wisdom" },
    { label: "Charisma", value: "charisma" },
];

const DC_CALCULATION_OPTIONS = [
    { label: "Spellcasting Save DC", value: "spellcasting" },
    { label: "Custom Ability (8 + Prof + Mod)", value: "ability" },
    { label: "Flat DC", value: "flat" },
];

const SaveModifier: React.FC<SaveModifierProps> = ({ modifier, onUpdate, availableModifiers }) => {
    const data = (() => {
        try {
            return JSON.parse(modifier.value as string || "{}");
        } catch {
            return {};
        }
    })();

    const updateData = (updates: any) => {
        onUpdate({ value: JSON.stringify({ ...data, ...updates }) });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 mt-1 bg-secondary/50 rounded-lg border border-border animate-in fade-in slide-in-from-top-1">
            {/* Link to Action Modifier */}
            <div className="md:col-span-2 space-y-1">
                <label className="text-xs uppercase font-bold text-gray-400">Link to Action Modifier</label>
                <Select
                    value={data.actionModifierId || ""}
                    onValueChange={(val) => {
                        updateData({ actionModifierId: val || undefined });
                    }}
                    options={[
                        { label: "No Action", value: "" },
                        ...((availableModifiers || [])
                            .filter(m => m.type === "New Action")
                            .map(m => {
                                let name = "";
                                try {
                                    name = JSON.parse(m.value as string).name || "Unnamed Action";
                                } catch {
                                    name = m.value as string || "Unnamed Action";
                                }
                                return { label: name, value: m.id };
                            }))
                    ]}
                />
            </div>

            {/* Save Type (Ability scores the target rolls) */}
            <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-gray-400">Save Type</label>
                <Select
                    value={modifier.subType || "Strength"}
                    onValueChange={(val) => {
                        onUpdate({ subType: val });
                    }}
                    options={ABILITY_OPTIONS.map(opt => ({ label: opt.label, value: opt.label }))}
                />
            </div>

            {/* DC Calculation Method */}
            <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-gray-400">DC Calculation</label>
                <Select
                    value={data.dcCalculation || "spellcasting"}
                    onValueChange={(val) => {
                        updateData({ dcCalculation: val });
                    }}
                    options={DC_CALCULATION_OPTIONS}
                />
            </div>

            {/* If Custom Ability is selected, show which Ability score to use */}
            {data.dcCalculation === "ability" && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="text-xs uppercase font-bold text-gray-400">DC Ability Mod</label>
                    <Select
                        value={data.dcAbility || "strength"}
                        onValueChange={(val) => {
                            updateData({ dcAbility: val });
                        }}
                        options={ABILITY_OPTIONS}
                    />
                </div>
            )}

            {/* If Flat DC is selected, show numeric/text input */}
            {data.dcCalculation === "flat" && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="text-xs uppercase font-bold text-gray-400">Flat DC Value</label>
                    <input
                        type="number"
                        min={1}
                        max={30}
                        value={data.flatDc !== undefined ? data.flatDc : 10}
                        onChange={(e) => updateData({ flatDc: parseInt(e.target.value) || 10 })}
                        className="w-full text-xs p-1.5 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none"
                    />
                </div>
            )}

            {/* Damage Dice */}
            <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-gray-400">Damage Dice</label>
                <input
                    type="text"
                    value={data.damageDice || ""}
                    onChange={(e) => updateData({ damageDice: e.target.value })}
                    className="w-full text-xs p-1.5 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none font-mono"
                    placeholder="e.g. 2d6"
                />
            </div>

            {/* Damage Type */}
            <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-gray-400">Damage Type</label>
                <ThemedAutocomplete
                    value={data.damageType || ""}
                    onChange={(val: string) => updateData({ damageType: val })}
                    options={Array.from(DAMAGE_TYPES)}
                    placeholder="None"
                />
            </div>

            {/* Effect on Failure */}
            <div className="md:col-span-2 space-y-1">
                <label className="text-xs uppercase font-bold text-gray-400">On Failure Effect</label>
                <input
                    type="text"
                    value={data.effect || ""}
                    onChange={(e) => updateData({ effect: e.target.value })}
                    className="w-full text-xs p-1.5 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none"
                    placeholder="e.g. Target is knocked prone"
                />
            </div>

            {/* Effect on Success */}
            <div className="md:col-span-2 space-y-1">
                <label className="text-xs uppercase font-bold text-gray-400">On Success Effect</label>
                <input
                    type="text"
                    value={data.passEffect || ""}
                    onChange={(e) => updateData({ passEffect: e.target.value })}
                    className="w-full text-xs p-1.5 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none"
                    placeholder="e.g. Half damage, no other effects"
                />
            </div>
        </div>
    );
};

export default SaveModifier;
