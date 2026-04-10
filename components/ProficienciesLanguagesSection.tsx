"use client";

import React from "react";
import { Card, CardContent } from "./ui/card";
import ProficiencyList from "./ui/ProficiencyList";
import { WEAPON_DATA } from "../data/weapons";
import { ARMOR_DATA } from "../data/armor";
import { TOOL_DATA } from "../data/tools";
import { ToolProficiency, Character } from "../types/character";
import { LANGUAGES } from "../utils/constants";

interface ProficienciesLanguagesSectionProps {
    weaponProficiencies?: (string | { name: string, fromFeature: boolean, fromFeatureId?: string })[];
    armorProficiencies?: (string | { name: string, fromFeature: boolean, fromFeatureId?: string })[];
    toolProficiencies?: ToolProficiency[];
    languages?: (string | { name: string, fromFeature: boolean, fromFeatureId?: string })[];
    onUpdate: (field: keyof Character, value: (string | ToolProficiency | { name: string, fromFeature: boolean })[]) => void;
    onNavigateToFeature?: (featureId: string) => void;
}

const weaponOptions = ["Simple Weapons", "Martial Weapons", ...Object.keys(WEAPON_DATA)];
const armorOptions = ["Light Armor", "Medium Armor", "Heavy Armor", "Shields", ...Object.keys(ARMOR_DATA)];
const toolOptions = Object.keys(TOOL_DATA);

const ProficienciesLanguagesSection: React.FC<ProficienciesLanguagesSectionProps> = ({
    weaponProficiencies = [],
    armorProficiencies = [],
    toolProficiencies = [],
    languages = [],
    onUpdate,
    onNavigateToFeature,
}) => {
    const handleUpdate = (field: keyof Character, value: (string | ToolProficiency | { name: string, fromFeature: boolean })[]) => {
        // Filter out feature-granted items so they aren't persisted in the character's base data
        const baseValues = value
            .filter(item => {
                if (typeof item === 'object' && (item as any).fromFeature) return false;
                return true;
            })
            .map(item => {
                // For weapons, armor, and languages, convert the descriptive objects (if any remained) back to strings
                if (typeof item === 'object' && field !== "toolProficiencies") {
                    return (item as any).name as string;
                }
                return item;
            });

        onUpdate(field, baseValues as (string | ToolProficiency)[]);
    };

    return (
        <Card className="w-full h-fit">
            <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-center mb-4">Proficiencies & Languages</h2>
                <div className="space-y-2">
                    <ProficiencyList
                        title="Weapon Proficiencies"
                        items={weaponProficiencies}
                        field="weaponProficiencies"
                        onUpdate={handleUpdate}
                        options={weaponOptions}
                        onNavigateToFeature={onNavigateToFeature}
                    />
                    <ProficiencyList
                        title="Armor Proficiencies"
                        items={armorProficiencies}
                        field="armorProficiencies"
                        onUpdate={handleUpdate}
                        options={armorOptions}
                        onNavigateToFeature={onNavigateToFeature}
                    />
                    <ProficiencyList
                        title="Tool Proficiencies"
                        items={toolProficiencies}
                        field="toolProficiencies"
                        onUpdate={handleUpdate}
                        options={toolOptions}
                        onNavigateToFeature={onNavigateToFeature}
                    />
                    <ProficiencyList
                        title="Languages"
                        items={languages}
                        field="languages"
                        onUpdate={handleUpdate}
                        options={LANGUAGES}
                        onNavigateToFeature={onNavigateToFeature}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default ProficienciesLanguagesSection;
