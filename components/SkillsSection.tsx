import { Skills, AbilityScores, ProficiencyLevel, Character, RollDiceFunc, ActiveBonus } from "../types/character";
import { SKILL_LIST } from "../utils/constants";
import { Card, CardContent } from "./ui/card";
import ProficiencyIcon from "./ui/ProficiencyIcon";
import { getAbilityModifier, getProficiencyMultiplier, cycleProficiency, getAdvantageDisadvantage } from "../utils/character-utils";
import FeatureNavigationBadge from "./features/FeatureNavigationBadge";
import ActiveBonusesList from "./ActiveBonusesList";

interface SkillsSectionProps {
    character: Character;
    skills: Skills;
    skillSources?: Record<string, string>;
    setSkills: (key: string, value: string) => void;
    abilityScores: AbilityScores;
    proficiencyBonus: number;
    rollDice?: RollDiceFunc;
    onNavigateToFeature?: (featureId: string) => void;
    onUpdateActiveBonuses: (bonuses: ActiveBonus[]) => void;
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
    onUpdateActiveBonuses,
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

                        const { advantage, disadvantage, extraAdvantage } = getAdvantageDisadvantage(character, `${skill.name} Checks`, skill.ability);

                        return (
                            <div
                                key={skill.key}
                                className="flex items-center justify-between p-2 rounded hover:bg-secondary/40 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setSkills(skill.key, cycleProficiency(proficiencyLevel))}
                                        className="w-8 h-8 flex items-center justify-center focus:outline-none hover:text-primary transition-transform active:scale-95"
                                        title={`Current: ${proficiencyLevel}`}
                                    >
                                        <div className="scale-75">
                                            <ProficiencyIcon level={proficiencyLevel} />
                                        </div>
                                    </button>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium cursor-pointer" onClick={() => rollDice?.(20, totalBonus, skill.name, undefined, undefined, undefined, undefined, undefined, advantage, disadvantage, extraAdvantage, 'skill')}>
                                                {skill.name} <span className="text-muted-foreground text-sm">({skill.ability.substring(0, 3).toUpperCase()})</span>
                                            </span>
                                            {skillSources[skill.key] && (skills[skill.key] || "none") !== (character.skills?.[skill.key] || "none") && (
                                                <FeatureNavigationBadge
                                                    featureId={skillSources[skill.key]}
                                                    onNavigateToFeature={onNavigateToFeature}
                                                    variant="compact"
                                                />
                                            )}
                                            {advantage && (
                                                <span className="text-xs font-black bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1 rounded border border-green-200 dark:border-green-800" title="Advantage">ADV{extraAdvantage > 0 ? `+${extraAdvantage}` : ''}</span>
                                            )}
                                            {disadvantage && (
                                                <span className="text-xs font-black bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-1 rounded border border-red-200 dark:border-red-800" title="Disadvantage">DIS</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => rollDice?.(20, totalBonus, skill.name, undefined, undefined, undefined, undefined, undefined, advantage, disadvantage, extraAdvantage, 'skill')}
                                    className="font-bold text-lg min-w-[3ch] text-right text-primary hover:opacity-80 transition-colors"
                                    title={`Modifier: ${modifier}, Proficiency: ${bonus}`}
                                >
                                    {sign}{totalBonus}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <ActiveBonusesList
                    bonuses={character.activeBonuses || []}
                    onUpdateBonuses={onUpdateActiveBonuses}
                    target="skill"
                />
            </CardContent>
        </Card>
    );
};

export default SkillsSection;
