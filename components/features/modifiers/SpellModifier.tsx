"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { FeatureModifier } from "../../../types/modifiers";

interface SpellModifierProps {
    modifier: FeatureModifier;
    onUpdate: (updates: Partial<FeatureModifier>) => void;
}

const SpellModifier: React.FC<SpellModifierProps> = ({ modifier, onUpdate }) => {
    const currentSpells = ((modifier.value as string) || "").split(",").filter(s => s.trim());

    return (
        <div className="space-y-1">
            <div className="flex flex-wrap gap-2">
                {currentSpells.map((spellName, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-sm px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm transition-all hover:bg-blue-100 dark:hover:bg-blue-900/50">
                        <span className="font-semibold text-blue-900 dark:text-blue-100">{spellName.trim()}</span>
                        <button
                            onClick={() => {
                                const newSpells = currentSpells.filter((_, i) => i !== idx);
                                onUpdate({ value: newSpells.join(",") });
                            }}
                            className="text-blue-400 hover:text-red-500 transition-colors ml-1"
                            title="Remove spell"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
            <div className="flex gap-2 mt-2">
                <input
                    type="text"
                    className="flex-1 text-xs p-2 border-b border-dashed border-gray-200 dark:border-gray-800 focus:border-blue-500 focus:ring-0 bg-transparent font-medium"
                    placeholder="Add spell name (e.g. Fireball)..."
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            const target = e.target as HTMLInputElement;
                            const val = target.value.trim();
                            if (val) {
                                if (!currentSpells.includes(val)) {
                                    onUpdate({ value: [...currentSpells, val].join(",") });
                                }
                                target.value = "";
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default SpellModifier;
