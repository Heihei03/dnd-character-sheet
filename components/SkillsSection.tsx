
import React from "react";
import { Skills, AbilityScores } from "../types/character";
import { SKILL_LIST } from "../utils/constants";
import { Card, CardContent } from "./ui/card";

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
    const getAbilityModifier = (score: number) => Math.floor((score - 10) / 2);

    const getProficiencyMultiplier = (level: string) => {
        switch (level) {
            case "half": return 0.5;
            case "proficient": return 1;
            case "expertise": return 2;
            default: return 0;
        }
    };

    const cycleProficiency = (current: string) => {
        const levels = ["none", "half", "proficient", "expertise"];
        const currentIndex = levels.indexOf(current);
        const nextIndex = (currentIndex + 1) % levels.length;
        return levels[nextIndex];
    };

    const ProficiencyIcon = ({ level }: { level: string }) => {
        const baseClasses = "w-5 h-5 text-current";

        switch (level) {
            case "half":
                return (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={baseClasses}
                    >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2a10 10 0 0 0 0 20Z" fill="currentColor" stroke="none" />
                        <line x1="12" y1="2" x2="12" y2="22" />
                    </svg>
                );
            case "proficient":
                return (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={baseClasses}
                    >
                        <circle cx="12" cy="12" r="10" />
                    </svg>
                );
            case "expertise":
                return (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={baseClasses}
                    >
                        <path
                            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                            transform="scale(1.15)"
                            style={{ transformOrigin: "center" }}
                        />
                    </svg>
                );

            default: // none
                return (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={baseClasses}
                    >
                        <circle cx="12" cy="12" r="10" />
                    </svg>
                );
        }
    };

    return (
        <Card className="w-full">
            <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-center mb-4">Skills</h2>
                <div className="grid grid-cols-1 gap-2">
                    {SKILL_LIST.map((skill) => {
                        const proficiencyLevel = skills[skill.key] || "none";
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
