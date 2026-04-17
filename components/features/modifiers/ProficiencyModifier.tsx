"use client";

import React from "react";
import { FeatureModifier } from "../../../types/modifiers";
import Select from "../../ui/Select";
import MultiSelect from "../../ui/MultiSelect";
import { SKILL_LIST, LANGUAGES } from "../../../utils/constants";
import { TOOL_DATA } from "../../../data/tools";

import CategoryToggle from "../../ui/CategoryToggle";

interface ProficiencyModifierProps {
    modifier: FeatureModifier;
    onUpdate: (updates: Partial<FeatureModifier>) => void;
}

const ProficiencyModifier: React.FC<ProficiencyModifierProps> = ({ modifier, onUpdate }) => {
    const [category, setCategory] = React.useState("Skills");

    const getOptions = () => {
        switch (category) {
            case "Skills":
                return SKILL_LIST.map(s => s.name);
            case "Tools":
                return Object.keys(TOOL_DATA);
            case "Languages":
                return LANGUAGES;
            default:
                return [];
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <CategoryToggle
                categories={["Skills", "Tools", "Languages"]}
                activeCategory={category}
                onSelect={setCategory}
            />
            <MultiSelect
                value={modifier.subType || ""}
                onChange={(val) => onUpdate({ subType: val })}
                options={getOptions().sort()}
                placeholder={`Select ${category}...`}
            />
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase text-muted-foreground whitespace-nowrap">Proficiency Level:</span>
                <div className="flex-1 min-w-[120px]">
                    <Select
                        value={modifier.value as string || "proficient"}
                        onValueChange={(val) => onUpdate({ value: val })}
                        options={[
                            { label: "Proficient", value: "proficient" },
                            { label: "Expertise", value: "expertise" },
                            { label: "Half Proficient", value: "half" },
                        ]}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProficiencyModifier;
