"use client";

import React from "react";
import { FeatureModifier } from "../../../types/modifiers";
import { ROLL_TYPES, DAMAGE_TYPES } from "../../../utils/constants";
import MultiSelect from "../../ui/MultiSelect";
import NumericInput from "../../ui/NumericInput";
import Select from "../../ui/Select";

interface BonusModifierProps {
    modifier: FeatureModifier;
    onUpdate: (updates: Partial<FeatureModifier>) => void;
}

const BonusModifier: React.FC<BonusModifierProps> = ({ modifier, onUpdate }) => {
    const isDamageBonus = (modifier.subType || "").toLowerCase().includes("damage rolls");

    return (
        <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-center flex-wrap">
                 <NumericInput
                    value={modifier.value || 0}
                    onChange={(val) => onUpdate({ value: val })}
                    variant="horizontal"
                    className="w-20 border-none bg-transparent shadow-none"
                    inputClassName="text-xs p-1.5 border-b border-dashed border-border focus:border-primary font-mono text-center"
                />
                <span className="text-[10px] font-black uppercase text-muted-foreground whitespace-nowrap">Bonus to:</span>
                
                {isDamageBonus && (
                    <div className="flex items-center gap-1.5 ml-auto animate-in fade-in slide-in-from-right-1">
                        <span className="text-[10px] font-black uppercase text-muted-foreground whitespace-nowrap">Type:</span>
                        <div className="w-28">
                            <Select
                                value={modifier.damageType || ""}
                                onValueChange={(val) => onUpdate({ damageType: val })}
                                options={[
                                    { label: "None", value: "" },
                                    ...DAMAGE_TYPES.map(t => ({ label: t, value: t }))
                                ]}
                            />
                        </div>
                    </div>
                )}
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
