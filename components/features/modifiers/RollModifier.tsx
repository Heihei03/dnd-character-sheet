"use client";

import React from "react";
import { FeatureModifier } from "../../../types/modifiers";
import { DAMAGE_TYPES } from "../../../utils/constants";

interface RollModifierProps {
    modifier: FeatureModifier;
    onUpdate: (updates: Partial<FeatureModifier>) => void;
}

const RollModifier: React.FC<RollModifierProps> = ({ modifier, onUpdate }) => {
    return (
        <div className="flex gap-2">
            <input
                type="text"
                value={modifier.value || ""}
                onChange={(e) => onUpdate({ value: e.target.value })}
                className="w-24 text-xs p-1.5 border-b border-dashed border-gray-200 dark:border-gray-800 focus:border-blue-500 focus:ring-0 bg-transparent font-mono"
                placeholder="Dice..."
            />
            <input
                type="text"
                list={`roll-type-${modifier.id}`}
                value={modifier.subType || ""}
                onChange={(e) => onUpdate({ subType: e.target.value })}
                className="flex-1 text-xs p-1.5 border-b border-dashed border-gray-200 dark:border-gray-800 focus:border-blue-500 focus:ring-0 bg-transparent"
                placeholder="Type (Fire, Healing...)"
            />
            <datalist id={`roll-type-${modifier.id}`}>
                {[...DAMAGE_TYPES, "Healing", "Temp HP"].sort().map(t => (
                    <option key={t} value={t} />
                ))}
            </datalist>
        </div>
    );
};

export default RollModifier;
