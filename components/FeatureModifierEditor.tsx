"use client";

import React from "react";
import { FeatureModifier, ModifierType, MODIFIER_TYPES } from "../types/modifiers";

interface FeatureModifierEditorProps {
    modifiers: FeatureModifier[];
    onUpdate: (modifiers: FeatureModifier[]) => void;
}

const FeatureModifierEditor: React.FC<FeatureModifierEditorProps> = ({ modifiers, onUpdate }) => {
    const addModifier = () => {
        const newModifier: FeatureModifier = {
            id: Date.now().toString(),
            type: "Other",
            subType: "",
            value: "",
        };
        onUpdate([...modifiers, newModifier]);
    };

    const updateModifier = (id: string, updates: Partial<FeatureModifier>) => {
        const newModifiers = modifiers.map(m =>
            m.id === id ? { ...m, ...updates } : m
        );
        onUpdate(newModifiers);
    };

    const removeModifier = (id: string) => {
        onUpdate(modifiers.filter(m => m.id !== id));
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase text-gray-500">Modifiers</label>
                <button
                    onClick={addModifier}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider"
                >
                    + Add Modifier
                </button>
            </div>
            <div className="space-y-2">
                {modifiers.map((mod) => (
                    <div key={mod.id} className="grid grid-cols-12 gap-2 items-start bg-white dark:bg-gray-950 p-2 rounded border border-gray-100 dark:border-gray-800">
                        <div className="col-span-3">
                            <select
                                value={mod.type}
                                onChange={(e) => updateModifier(mod.id, { type: e.target.value as ModifierType })}
                                className="w-full text-xs p-1.5 border-none focus:ring-0 bg-transparent font-bold uppercase"
                            >
                                {MODIFIER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="col-span-4">
                            <input
                                type="text"
                                value={mod.subType}
                                onChange={(e) => updateModifier(mod.id, { subType: e.target.value })}
                                className="w-full text-xs p-1.5 border-b border-dashed focus:border-blue-500 focus:ring-0 bg-transparent"
                                placeholder="e.g. AC, Speed..."
                            />
                        </div>
                        <div className="col-span-4">
                            <input
                                type="text"
                                value={mod.value}
                                onChange={(e) => updateModifier(mod.id, { value: e.target.value })}
                                className="w-full text-xs p-1.5 border-b border-dashed focus:border-blue-500 focus:ring-0 bg-transparent"
                                placeholder="Value..."
                            />
                        </div>
                        <div className="col-span-1 flex justify-center pt-1.5">
                            <button
                                onClick={() => removeModifier(mod.id)}
                                className="text-gray-400 hover:text-red-500 text-sm"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}
                {modifiers.length === 0 && (
                    <p className="text-xs text-gray-400 italic text-center py-2">No modifiers added.</p>
                )}
            </div>
        </div>
    );
};

export default FeatureModifierEditor;
