"use client";

import React from "react";
import { Skills, AbilityScores, ProficiencyLevel } from "../types/character";
import { SKILL_LIST } from "../utils/constants";
import { Card, CardContent } from "./ui/card";
import ProficiencyIcon from "./ui/ProficiencyIcon";
import { getAbilityModifier, getProficiencyMultiplier, cycleProficiency } from "../utils/character-utils";

interface SkillsSectionProps {
    skills: Skills;
    setSkills: (key: string, value: string) => void;
    abilityScores: AbilityScores;
    proficiencyBonus: number;
    rollDice: (sides: number, modifier: number, label: string) => void;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({
    skills,
    setSkills,
    abilityScores,
    proficiencyBonus,
    rollDice,
}) => {
    return (
        <Card className="w-full">
            <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-center mb-4">Skills</h2>
                <div className="grid grid-cols-1 gap-2">
                    {SKILL_LIST.map((skill) => {
                        const proficiencyLevel = (skills[skill.key] || "none") as ProficiencyLevel;
                        const abilityScore = abilityScores[skill.ability] || 10;
                        const modifier = getAbilityModifier(abilityScore);

                        const profMultiplier = getProficiencyMultiplier(proficiencyLevel);
                        const bonus = Math.floor(proficiencyBonus * profMultiplier);
                        const totalBonus = modifier + bonus;

                        const sign = totalBonus >= 0 ? "+" : "";

                        return (
                            <div
                                key={skill.key}
                                className="flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setSkills(skill.key, cycleProficiency(proficiencyLevel))}
                                        className="w-8 h-8 flex items-center justify-center focus:outline-none hover:text-blue-600 transition-transform active:scale-95"
                                        title={`Current: ${proficiencyLevel}`}
                                    >
                                        <ProficiencyIcon level={proficiencyLevel} />
                                    </button>
                                    <span className="font-medium cursor-pointer" onClick={() => rollDice(20, totalBonus, skill.name)}>
                                        {skill.name} <span className="text-gray-500 text-sm">({skill.ability.substring(0, 3).toUpperCase()})</span>
                                    </span>
                                </div>
                                <button
                                    onClick={() => rollDice(20, totalBonus, skill.name)}
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

export default SkillsSection;
