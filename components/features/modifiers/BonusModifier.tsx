"use client";

import React from "react";
import { FeatureModifier } from "../../../types/modifiers";
import { ROLL_TYPES } from "../../../utils/constants";
import ThemedAutocomplete from "../../ui/ThemedAutocomplete";

interface BonusModifierProps {
    modifier: FeatureModifier;
    onUpdate: (updates: Partial<FeatureModifier>) => void;
}

const BonusModifier: React.FC<BonusModifierProps> = ({ modifier, onUpdate }) => {
    return (
        <div className="flex gap-2">
            <input
                type="number"
                value={modifier.value || 0}
                onChange={(e) => onUpdate({ value: parseInt(e.target.value) || 0 })}
                className="w-16 text-xs p-1.5 border-b border-dashed border-border focus:border-primary focus:ring-0 bg-transparent font-mono"
            />
            <ThemedAutocomplete
                value={modifier.subType || ""}
                onChange={(val: string) => onUpdate({ subType: val })}
                options={ROLL_TYPES}
                placeholder="Target (AC, Init...)"
                className="flex-1"
            />
        </div>
    );
};

export default BonusModifier;
