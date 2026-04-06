"use client";

import React from "react";
import { FeatureModifier } from "../../../types/modifiers";
import { ROLL_TYPES } from "../../../utils/constants";

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
            <input
                type="text"
                list={`bonus-type-${modifier.id}`}
                value={modifier.subType || ""}
                onChange={(e) => onUpdate({ subType: e.target.value })}
                className="flex-1 text-xs p-1.5 border-b border-dashed border-border focus:border-primary focus:ring-0 bg-transparent"
                placeholder="Target (AC, Init...)"
            />
            <datalist id={`bonus-type-${modifier.id}`}>
                {ROLL_TYPES.map((t: string) => <option key={t} value={t} />)}
            </datalist>
        </div>
    );
};

export default BonusModifier;
