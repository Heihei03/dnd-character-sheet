"use client";

import React from "react";
import { Card, CardContent } from "./ui/card";
import ProficiencyList from "./ui/ProficiencyList";
import { WEAPON_DATA } from "../data/weapons";
import { Character, ToolProficiency } from "../types/character";

interface WeaponMasteriesSectionProps {
    weaponMasteries?: (string | { name: string, fromFeature: boolean, fromFeatureId?: string })[];
    onUpdate: (field: keyof Character, value: (string | ToolProficiency | { name: string, fromFeature: boolean })[]) => void;
    onNavigateToFeature?: (featureId: string) => void;
}

const masteryOptions = [...Object.keys(WEAPON_DATA)];

const WeaponMasteriesSection: React.FC<WeaponMasteriesSectionProps> = ({
    weaponMasteries = [],
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
                if (typeof item === 'object') {
                    return (item as any).name as string;
                }
                return item;
            });

        onUpdate(field, baseValues as string[]);
    };

    return (
        <Card className="w-full h-fit">
            <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-center mb-4">Weapon Masteries</h2>
                <div className="space-y-2">
                    <ProficiencyList
                        title="Mastered Weapons"
                        items={weaponMasteries}
                        field="weaponMasteries"
                        onUpdate={handleUpdate}
                        options={masteryOptions}
                        onNavigateToFeature={onNavigateToFeature}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default WeaponMasteriesSection;
