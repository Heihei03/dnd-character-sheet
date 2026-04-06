"use client";

import React from "react";
import { FeatureModifier } from "../../../types/modifiers";

interface ProficiencyModifierProps {
    modifier: FeatureModifier;
    onUpdate: (updates: Partial<FeatureModifier>) => void;
}

const ProficiencyModifier: React.FC<ProficiencyModifierProps> = ({ modifier, onUpdate }) => {
    return (
        <select
            value={modifier.value || "Proficient"}
            onChange={(e) => onUpdate({ value: e.target.value })}
            className="w-full text-xs p-1.5 border-b border-dashed border-border focus:border-primary focus:ring-0 bg-transparent font-medium"
        >
            <option value="Proficient">Proficient</option>
            <option value="Expertise">Expertise</option>
            <option value="Half Proficient">Half Proficient</option>
        </select>
    );
};

export default ProficiencyModifier;
