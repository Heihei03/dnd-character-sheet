"use client";

import React from "react";
import { FeatureModifier } from "../../../types/modifiers";
import { REGAIN_TYPES } from "../../../utils/constants";
import Select from "../../ui/Select";

interface ResourceModifierProps {
    modifier: FeatureModifier;
    onUpdate: (updates: Partial<FeatureModifier>) => void;
    parentName?: string;
}

const ResourceModifier: React.FC<ResourceModifierProps> = ({ modifier, onUpdate, parentName }) => {
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

    const isScaling = data.useProficiencyBonus || data.useAbilityMod || data.useCharacterLevel;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 mt-1 bg-secondary/50 rounded-lg border border-border animate-in fade-in slide-in-from-top-1">
            <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-gray-400">Resource Name</label>
                <input
                    type="text"
                    value={data.name || ""}
                    onChange={(e) => updateData({ name: e.target.value })}
                    className="w-full text-xs p-1.5 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none"
                    placeholder={parentName || "e.g. Ki Points"}
                />
            </div>
            <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-gray-400">Max Scaling</label>
                <Select
                    value={
                        data.useProficiencyBonus ? "pb" :
                        data.useAbilityMod ? data.useAbilityMod :
                        data.useCharacterLevel ? "level" : "fixed"
                    }
                    onValueChange={(val) => {
                        const updates = {
                            useProficiencyBonus: val === "pb",
                            useAbilityMod: ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"].includes(val) ? val : undefined,
                            useCharacterLevel: val === "level"
                        };
                        updateData(updates);
                    }}
                    options={[
                        { label: "Fixed", value: "fixed" },
                        { label: "Prof. Bonus", value: "pb" },
                        { label: "Level", value: "level" },
                        ...["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"].map(a => ({
                            label: `${a.charAt(0).toUpperCase() + a.slice(1, 3)} Mod`,
                            value: a
                        }))
                    ]}
                />
            </div>
            <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-gray-400">
                    {isScaling ? "Multiplier" : "N/A"}
                </label>
                <input
                    type="number"
                    value={data.multiplier || 1}
                    disabled={!isScaling}
                    onChange={(e) => updateData({ multiplier: parseFloat(e.target.value) || 1 })}
                    className={`w-full text-xs p-1.5 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none ${!isScaling ? "opacity-50 grayscale" : ""}`}
                    placeholder="1"
                    step="0.1"
                    min="0"
                />
                {isScaling && (
                    <div className="text-[11px] text-gray-500 italic">Use 0.5 for half, etc.</div>
                )}
            </div>
            <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-gray-400">
                    {isScaling ? "Bonus" : "Max"}
                </label>
                <input
                    type="number"
                    value={data.max || 0}
                    onChange={(e) => updateData({ max: parseInt(e.target.value) || 0 })}
                    className="w-full text-xs p-1.5 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none"
                    placeholder="0"
                    min="0"
                />
            </div>
            <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-gray-400">Regain On</label>
                <Select
                    value={data.regain || "Long Rest"}
                    onValueChange={(regain) => {
                        onUpdate({
                            subType: regain,
                            value: JSON.stringify({ ...data, regain })
                        });
                    }}
                    options={REGAIN_TYPES.map((r: string) => ({ label: r, value: r }))}
                />
            </div>
            <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-gray-400">Regain Amount</label>
                <input
                    type="text"
                    value={data.regainAmount || "All"}
                    onChange={(e) => updateData({ regainAmount: e.target.value })}
                    className="w-full text-xs p-1.5 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none"
                    placeholder="All, 1d6 + 1, etc."
                />
            </div>
        </div>
    );
};

export default ResourceModifier;
