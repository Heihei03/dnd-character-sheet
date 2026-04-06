"use client";

import React from "react";
import { FeatureModifier } from "../../../types/modifiers";
import { DAMAGE_TYPES } from "../../../utils/constants";
import ThemedAutocomplete from "../../ui/ThemedAutocomplete";

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
                className="w-24 text-xs p-1.5 border-b border-dashed border-border focus:border-primary focus:ring-0 bg-transparent font-mono"
                placeholder="Dice..."
            />
            <ThemedAutocomplete
                value={modifier.subType || ""}
                onChange={(val: string) => onUpdate({ subType: val })}
                options={[...DAMAGE_TYPES, "Healing", "Temp HP"].sort()}
                placeholder="Type (Fire, Healing...)"
                className="flex-1"
            />
        </div>
    );
};

export default RollModifier;
