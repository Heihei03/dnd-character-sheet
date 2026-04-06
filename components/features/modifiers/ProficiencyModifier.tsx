"use client";

import React from "react";
import { FeatureModifier } from "../../../types/modifiers";
import Select from "../../ui/Select";

interface ProficiencyModifierProps {
    modifier: FeatureModifier;
    onUpdate: (updates: Partial<FeatureModifier>) => void;
}

const ProficiencyModifier: React.FC<ProficiencyModifierProps> = ({ modifier, onUpdate }) => {
    return (
        <Select
            value={modifier.value as string || "Proficient"}
            onValueChange={(val) => onUpdate({ value: val })}
            options={[
                { label: "Proficient", value: "Proficient" },
                { label: "Expertise", value: "Expertise" },
                { label: "Half Proficient", value: "Half Proficient" },
            ]}
        />
    );
};

export default ProficiencyModifier;
