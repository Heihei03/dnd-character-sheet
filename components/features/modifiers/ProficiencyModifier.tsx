"use client";

import React from "react";
import { FeatureModifier } from "../../../types/modifiers";
import Select from "../../ui/Select";
import MultiSelect from "../../ui/MultiSelect";
import { SKILL_LIST, LANGUAGES } from "../../../utils/constants";
import { TOOL_DATA } from "../../../data/tools";

interface ProficiencyModifierProps {
    modifier: FeatureModifier;
    onUpdate: (updates: Partial<FeatureModifier>) => void;
}

const ProficiencyModifier: React.FC<ProficiencyModifierProps> = ({ modifier, onUpdate }) => {
    const proficiencyOptions = [
        ...SKILL_LIST.map(s => s.name),
        ...LANGUAGES,
        ...Object.keys(TOOL_DATA)
    ].sort();

    return (
        <div className="flex flex-col gap-3">
            <MultiSelect
                value={modifier.subType || ""}
                onChange={(val) => onUpdate({ subType: val })}
                options={proficiencyOptions}
                placeholder="Select Skill, Tool or Language..."
            />
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase text-muted-foreground whitespace-nowrap">Proficiency Level:</span>
                <div className="flex-1 min-w-[120px]">
                    <Select
                        value={modifier.value as string || "Proficient"}
                        onValueChange={(val) => onUpdate({ value: val })}
                        options={[
                            { label: "Proficient", value: "Proficient" },
                            { label: "Expertise", value: "Expertise" },
                            { label: "Half Proficient", value: "Half Proficient" },
                        ]}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProficiencyModifier;
