"use client";

import React from "react";
import { FeatureModifier } from "../../../types/modifiers";
import { ACTION_TYPES } from "../../../types/character";

interface ActionModifierProps {
    modifier: FeatureModifier;
    onUpdate: (updates: Partial<FeatureModifier>) => void;
    parentName?: string;
    availableResources: FeatureModifier[];
}

const ActionModifier: React.FC<ActionModifierProps> = ({ modifier, onUpdate, parentName, availableResources }) => {
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
            <div className="md:col-span-2 space-y-1">
                <label className="text-xs uppercase font-bold text-gray-400">Action Name</label>
                <input
                    type="text"
                    value={data.name || ""}
                    onChange={(e) => updateData({ name: e.target.value })}
                    className="w-full text-xs p-1.5 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none"
                    placeholder={parentName || "Action Name"}
                />
            </div>
            <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-gray-400">Type</label>
                <select
                    value={data.type || modifier.subType || "Action"}
                    onChange={(e) => {
                        onUpdate({
                            subType: e.target.value,
                            value: JSON.stringify({ ...data, type: e.target.value })
                        });
                    }}
                    className="w-full text-xs p-1.5 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none"
                >
                    {ACTION_TYPES.map((t: string) => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
            <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-gray-400">Damage Dice</label>
                <input
                    type="text"
                    value={data.damageDice || ""}
                    onChange={(e) => updateData({ damageDice: e.target.value })}
                    className="w-full text-xs p-1.5 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none font-mono"
                    placeholder="1d8"
                />
            </div>
            <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-gray-400">Ability</label>
                <select
                    value={data.damageAbility || ""}
                    onChange={(e) => updateData({ damageAbility: e.target.value })}
                    className="w-full text-xs p-1.5 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none"
                >
                    <option value="">None</option>
                    <option value="strength">STR</option>
                    <option value="dexterity">DEX</option>
                    <option value="constitution">CON</option>
                    <option value="intelligence">INT</option>
                    <option value="wisdom">WIS</option>
                    <option value="charisma">CHA</option>
                </select>
            </div>
            <div className="md:col-span-2 space-y-1">
                <label className="text-xs uppercase font-bold text-gray-400">Resource Link</label>
                <select
                    value={data.resourceId || ""}
                    onChange={(e) => {
                        const resId = e.target.value;
                        const linkedRes = availableResources.find(m => m.id === resId);
                        let resName = "";
                        if (linkedRes) {
                            try {
                                resName = JSON.parse(linkedRes.value as string).name;
                            } catch {
                                resName = linkedRes.value as string;
                            }
                        }
                        updateData({ 
                            resourceId: resId,
                            resourceName: resName || undefined 
                        });
                    }}
                    className="w-full text-xs p-1.5 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none"
                >
                    <option value="">No Link</option>
                    {availableResources
                        .filter(m => m.type === "Resource")
                        .map(m => {
                            let name = "";
                            try {
                                name = JSON.parse(m.value as string).name || "Unnamed Resource";
                            } catch {
                                name = m.value as string || "Unnamed Resource";
                            }
                            return <option key={m.id} value={m.id}>{name}</option>;
                        })
                    }
                </select>
            </div>
        </div>
    );
};

export default ActionModifier;
