"use client";

import React from "react";
import { AbilityScores, ToolProficiency, ProficiencyLevel } from "../types/character";
import { Card, CardContent } from "./ui/card";
import ProficiencyIcon from "./ui/ProficiencyIcon";
import { getAbilityModifier, getProficiencyMultiplier, cycleProficiency, ABILITY_NAMES } from "../utils/character-utils";

interface ToolChecksSectionProps {
    toolProficiencies: ToolProficiency[];
    onUpdate: (value: ToolProficiency[]) => void;
    abilityScores: AbilityScores;
    proficiencyBonus: number;
    rollDice: (sides: number, modifier: number, label: string) => void;
}

const ToolChecksSection: React.FC<ToolChecksSectionProps> = ({
    toolProficiencies = [],
    onUpdate,
    abilityScores,
    proficiencyBonus,
    rollDice,
}) => {
    const handleUpdateTool = (index: number, updates: Partial<ToolProficiency>) => {
        const newTools = [...toolProficiencies];
        newTools[index] = { ...newTools[index], ...updates };
        onUpdate(newTools);
    };

    if (toolProficiencies.length === 0) {
        return null; // Don't show the section if no tools are added
    }

    return (
        <Card className="w-full">
            <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-center mb-4">Tool Checks</h2>
                <div className="grid grid-cols-1 gap-2">
                    {toolProficiencies.map((tool, index) => {
                        const abilityKey = tool.ability.toLowerCase();
                        const abilityScore = abilityScores[abilityKey] || 10;
                        const modifier = getAbilityModifier(abilityScore);
                        const profMultiplier = getProficiencyMultiplier(tool.level);
                        const bonus = Math.floor(proficiencyBonus * profMultiplier);
                        const totalBonus = modifier + bonus;
                        const sign = totalBonus >= 0 ? "+" : "";

                        return (
                            <div
                                key={`${tool.name}-${index}`}
                                className="flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleUpdateTool(index, { level: cycleProficiency(tool.level) })}
                                        className="w-8 h-8 flex items-center justify-center focus:outline-none hover:text-blue-600 transition-transform active:scale-95"
                                        title={`Proficiency: ${tool.level}`}
                                    >
                                        <ProficiencyIcon level={tool.level} />
                                    </button>
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-medium cursor-pointer" onClick={() => rollDice(20, totalBonus, `${tool.name} Check`)}>
                                            {tool.name}
                                        </span>
                                        <div className="flex items-center text-[11px] text-gray-500 font-bold uppercase tracking-tight">
                                            <span>(</span>
                                            <select
                                                value={tool.ability}
                                                onChange={(e) => handleUpdateTool(index, { ability: e.target.value })}
                                                className="bg-transparent border-none p-0 h-auto w-fit text-inherit focus:ring-0 cursor-pointer uppercase font-bold tracking-tight hover:text-blue-600"
                                            >
                                                {ABILITY_NAMES.map(ability => (
                                                    <option key={ability} value={ability}>
                                                        {ability.substring(0, 3)}
                                                    </option>
                                                ))}
                                            </select>
                                            <span>)</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => rollDice(20, totalBonus, `${tool.name} Check (${tool.ability})`)}
                                    className="font-bold text-lg min-w-[3ch] text-right text-blue-600 hover:text-blue-800"
                                    title={`Modifier: ${modifier}, Proficiency: ${bonus}`}
                                >
                                    {sign}{totalBonus}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

export default ToolChecksSection;
