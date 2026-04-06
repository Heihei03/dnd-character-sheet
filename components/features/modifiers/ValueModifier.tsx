"use client";

import React from "react";
import { FeatureModifier, ModifierType } from "../../../types/modifiers";
import { SENSES_LIST, DAMAGE_TYPES, CONDITION_TYPES, speedTypes, SKILL_LIST, LANGUAGES } from "../../../utils/constants";
import { TOOL_DATA } from "../../../data/tools";
import { ABILITY_NAMES } from "../../../utils/character-utils";

interface ValueModifierProps {
    modifier: FeatureModifier;
    onUpdate: (updates: Partial<FeatureModifier>) => void;
}

const ValueModifier: React.FC<ValueModifierProps> = ({ modifier, onUpdate }) => {
    const getSuggestionsForType = (type: ModifierType): string[] => {
        switch (type) {
            case "Sense":
                return SENSES_LIST;
            case "Resistance":
            case "Immunity":
            case "Vulnerability":
                return [...DAMAGE_TYPES, ...CONDITION_TYPES];
            case "Speed":
                return speedTypes;
            case "Proficiency":
                return [
                    ...SKILL_LIST.map(s => s.name),
                    ...LANGUAGES,
                    ...Object.keys(TOOL_DATA)
                ].sort();
            case "Override":
                return ABILITY_NAMES;
            default:
                return [];
        }
    };

    const suggestions = getSuggestionsForType(modifier.type);
    const listId = `suggestions-${modifier.id}`;

    return (
        <div className="relative">
            <input
                type="text"
                list={listId}
                value={modifier.subType || ""}
                onChange={(e) => onUpdate({ subType: e.target.value })}
                className="w-full text-xs p-1.5 border-b border-dashed border-gray-200 dark:border-gray-800 focus:border-blue-500 focus:ring-0 bg-transparent"
                placeholder="Type (e.g. Fire, Stealth)..."
            />
            {suggestions.length > 0 && (
                <datalist id={listId}>
                    {suggestions.map((s: string) => <option key={s} value={s} />)}
                </datalist>
            )}
        </div>
    );
};

export default ValueModifier;
