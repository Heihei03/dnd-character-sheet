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
        // Filter out feature-granted tools before persisting to base character data
        onUpdate(newTools.filter(t => !t.fromFeature));
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
                                        onClick={() => !tool.fromFeature && handleUpdateTool(index, { level: cycleProficiency(tool.level) })}
                                        className={`w-8 h-8 flex items-center justify-center focus:outline-none transition-transform active:scale-95 ${tool.fromFeature ? "cursor-default" : "hover:text-blue-600"}`}
                                        title={tool.fromFeature ? `Granted by Feature: ${tool.level}` : `Proficiency: ${tool.level}`}
                                    >
                                        <ProficiencyIcon level={tool.level} />
                                    </button>
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-medium cursor-pointer" onClick={() => rollDice(20, totalBonus, `${tool.name} Check`)}>
                                            {tool.name}
                                        </span>
                                        {tool.fromFeature && (
                                            <span className="text-[9px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1 rounded border border-blue-200 dark:border-blue-800 uppercase tracking-tighter" title="Granted by Feature">Feature</span>
                                        )}
                                        <div className="flex items-center text-[11px] text-gray-500 font-bold uppercase tracking-tight">
                                            <span>(</span>
                                            {tool.fromFeature ? (
                                                <span className="cursor-default">{tool.ability.substring(0, 3)}</span>
                                            ) : (
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
                                            )}
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
