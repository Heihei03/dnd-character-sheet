"use client";

import React from "react";
import { FeatureModifier, ModifierType } from "../../../types/modifiers";
import { SENSES_LIST, DAMAGE_TYPES, CONDITION_TYPES, speedTypes, SKILL_LIST, LANGUAGES } from "../../../utils/constants";
import { TOOL_DATA } from "../../../data/tools";
import { ABILITY_NAMES } from "../../../utils/character-utils";
import MultiSelect from "../../ui/MultiSelect";
import ThemedAutocomplete from "../../ui/ThemedAutocomplete";
import CategoryToggle from "../../ui/CategoryToggle";

interface ValueModifierProps {
    modifier: FeatureModifier;
    onUpdate: (updates: Partial<FeatureModifier>) => void;
}

const ValueModifier: React.FC<ValueModifierProps> = ({ modifier, onUpdate }) => {
    const [category, setCategory] = React.useState("Damage Types");

    const getSuggestionsForType = (type: ModifierType): string[] => {
        switch (type) {
            case "Sense":
                return SENSES_LIST;
            case "Resistance":
            case "Immunity":
            case "Vulnerability":
                return category === "Damage Types" ? [...DAMAGE_TYPES] : [...CONDITION_TYPES];
            case "Condition":
                return [...CONDITION_TYPES];
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

    const isMultiType = ["Sense", "Resistance", "Immunity", "Vulnerability", "Speed", "Proficiency", "Condition"].includes(modifier.type);
    const hasCategories = ["Resistance", "Immunity", "Vulnerability"].includes(modifier.type);

    if (isMultiType) {
        return (
            <div className="flex flex-col gap-2">
                {hasCategories && (
                    <CategoryToggle
                        categories={["Damage Types", "Conditions"]}
                        activeCategory={category}
                        onSelect={setCategory}
                    />
                )}
                <MultiSelect
                    value={modifier.subType || ""}
                    onChange={(val: string) => onUpdate({ subType: val })}
                    options={suggestions}
                    placeholder={`Select ${hasCategories ? (category === "Damage Types" ? "Damage Type" : "Condition") : modifier.type}...`}
                />
            </div>
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
