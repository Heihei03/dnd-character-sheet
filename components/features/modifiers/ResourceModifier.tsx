"use client";

import React from "react";
import { FeatureModifier } from "../../../types/modifiers";
import { REGAIN_TYPES } from "../../../utils/constants";

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 mt-1 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-1">
            <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-gray-400">Resource Name</label>
                <input
                    type="text"
                    value={data.name || ""}
                    onChange={(e) => updateData({ name: e.target.value })}
                    className="w-full text-xs p-1.5 border rounded bg-white dark:bg-gray-900"
                    placeholder={parentName || "e.g. Ki Points"}
                />
            </div>
            <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-gray-400">Max Scaling</label>
                <select
                    value={
                        data.useProficiencyBonus ? "pb" :
                        data.useAbilityMod ? data.useAbilityMod :
                        data.useCharacterLevel ? "level" : "fixed"
                    }
                    onChange={(e) => {
                        const val = e.target.value;
                        const updates = {
                            useProficiencyBonus: val === "pb",
                            useAbilityMod: ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"].includes(val) ? val : undefined,
                            useCharacterLevel: val === "level"
                        };
                        updateData(updates);
                    }}
                    className="w-full text-xs p-1.5 border rounded bg-white dark:bg-gray-900"
                >
                    <option value="fixed">Fixed</option>
                    <option value="pb">Prof. Bonus</option>
                    <option value="level">Level</option>
                    {["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"].map(a => (
                        <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1, 3)} Mod</option>
                    ))}
                </select>
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
                    className={`w-full text-xs p-1.5 border rounded bg-white dark:bg-gray-900 ${!isScaling ? "bg-gray-100 text-gray-400" : ""}`}
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
                    className="w-full text-xs p-1.5 border rounded bg-white dark:bg-gray-900"
                    placeholder="0"
                    min="0"
                />
            </div>
            <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-gray-400">Regain On</label>
                <select
                    value={data.regain || "Long Rest"}
                    onChange={(e) => {
                        const regain = e.target.value;
                        onUpdate({
                            subType: regain,
                            value: JSON.stringify({ ...data, regain })
                        });
                    }}
                    className="w-full text-xs p-1.5 border rounded bg-white dark:bg-gray-900"
                >
                    {REGAIN_TYPES.map((r: string) => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>
            <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-gray-400">Regain Amount</label>
                <input
                    type="text"
                    value={data.regainAmount || "All"}
                    onChange={(e) => updateData({ regainAmount: e.target.value })}
                    className="w-full text-xs p-1.5 border rounded bg-white dark:bg-gray-900"
                    placeholder="All, 1d6 + 1, etc."
                />
            </div>
        </div>
    );
};

export default ResourceModifier;
