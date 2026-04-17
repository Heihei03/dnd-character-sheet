"use client";

import React from "react";
import { FeatureModifier, ModifierType } from "../../../types/modifiers";
import { SENSES_LIST, DAMAGE_TYPES, CONDITION_TYPES, speedTypes, SKILL_LIST, LANGUAGES } from "../../../utils/constants";
import { TOOL_DATA } from "../../../data/tools";
import { ABILITY_NAMES } from "../../../utils/character-utils";
import MultiSelect from "../../ui/MultiSelect";
import ThemedAutocomplete from "../../ui/ThemedAutocomplete";

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

    // Some types might not make sense for MultiSelect (like Override)
    const isMultiType = ["Sense", "Resistance", "Immunity", "Vulnerability", "Speed", "Proficiency", "Condition"].includes(modifier.type);

    if (isMultiType) {
        return (
            <MultiSelect
                value={modifier.subType || ""}
                onChange={(val: string) => onUpdate({ subType: val })}
                options={suggestions}
                placeholder="Type (e.g. Fire, Stealth)..."
            />
        );
    }

    return (
        <ThemedAutocomplete
            value={modifier.subType || ""}
            onChange={(val: string) => onUpdate({ subType: val })}
            options={suggestions}
            placeholder="Type (e.g. Strength)..."
        />
    );
};

export default ValueModifier;
