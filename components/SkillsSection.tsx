import React from "react";
import { Skills, AbilityScores, ProficiencyLevel, Character, CritRule } from "../types/character";
import { SKILL_LIST } from "../utils/constants";
import { Card, CardContent } from "./ui/card";
import ProficiencyIcon from "./ui/ProficiencyIcon";
import { getAbilityModifier, getProficiencyMultiplier, cycleProficiency, getAdvantageDisadvantage } from "../utils/character-utils";

interface SkillsSectionProps {
    character: Character;
    skills: Skills;
    skillSources?: Record<string, string>;
    setSkills: (key: string, value: string) => void;
    abilityScores: AbilityScores;
    proficiencyBonus: number;
    rollDice?: (sides: number, modifier?: number, label?: string, damageFormula?: string, damageType?: string, critRange?: number, critExtraDamage?: string, critRule?: CritRule) => void;
    onNavigateToFeature?: (featureId: string) => void;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({
    character,
    skills,
    skillSources = {},
    setSkills,
    abilityScores,
    proficiencyBonus,
    rollDice,
    onNavigateToFeature,
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

                        const { advantage, disadvantage } = getAdvantageDisadvantage(character, `${skill.name} Checks`);

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
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium cursor-pointer" onClick={() => rollDice?.(20, totalBonus, skill.name)}>
                                                {skill.name} <span className="text-gray-500 text-sm">({skill.ability.substring(0, 3).toUpperCase()})</span>
                                            </span>
                                            {(skills[skill.key] || "none") !== (character.skills?.[skill.key] || "none") && (
                                                <span
                                                    className="text-[11px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1 rounded border border-blue-200 dark:border-blue-800 uppercase tracking-tighter cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                                                    title="Granted by Feature - Click to view"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const sourceId = skillSources[skill.key];
                                                        if (sourceId && onNavigateToFeature) {
                                                            onNavigateToFeature(sourceId);
                                                        }
                                                    }}
                                                >
                                                    Feature
                                                </span>
                                            )}
                                            {advantage && (
                                                <span className="text-xs font-black bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1 rounded border border-green-200 dark:border-green-800" title="Advantage">ADV</span>
                                            )}
                                            {disadvantage && (
                                                <span className="text-xs font-black bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-1 rounded border border-red-200 dark:border-red-800" title="Disadvantage">DIS</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => rollDice?.(20, totalBonus, skill.name)}
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
