"use client";

import React from "react";
import { FeatureModifier } from "../../../types/modifiers";
import { ROLL_TYPES } from "../../../utils/constants";
import MultiSelect from "../../ui/MultiSelect";
import NumericInput from "../../ui/NumericInput";

interface BonusModifierProps {
    modifier: FeatureModifier;
    onUpdate: (updates: Partial<FeatureModifier>) => void;
}

const BonusModifier: React.FC<BonusModifierProps> = ({ modifier, onUpdate }) => {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-center">
                 <NumericInput
                    value={modifier.value || 0}
                    onChange={(val) => onUpdate({ value: val })}
                    variant="horizontal"
                    className="w-20 border-none bg-transparent shadow-none"
                    inputClassName="text-xs p-1.5 border-b border-dashed border-border focus:border-primary font-mono text-center"
                />
                <span className="text-[10px] font-black uppercase text-muted-foreground whitespace-nowrap">Bonus to:</span>
            </div>
            <MultiSelect
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
