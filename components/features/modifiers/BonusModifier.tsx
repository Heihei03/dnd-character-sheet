"use client";

import React from "react";
import { FeatureModifier } from "../../../types/modifiers";
import { ROLL_TYPES } from "../../../utils/constants";
import ThemedAutocomplete from "../../ui/ThemedAutocomplete";
import NumericInput from "../../ui/NumericInput";

interface BonusModifierProps {
    modifier: FeatureModifier;
    onUpdate: (updates: Partial<FeatureModifier>) => void;
}

const BonusModifier: React.FC<BonusModifierProps> = ({ modifier, onUpdate }) => {
    return (
        <div className="flex gap-2">
             <NumericInput
                value={modifier.value || 0}
                onChange={(val) => onUpdate({ value: val })}
                variant="horizontal"
                className="w-20 border-none bg-transparent shadow-none"
                inputClassName="text-xs p-1.5 border-b border-dashed border-border focus:border-primary font-mono text-center"
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
