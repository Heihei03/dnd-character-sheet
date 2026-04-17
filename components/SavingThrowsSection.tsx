import React, { useState } from "react";
import { SavingThrows, Character, AbilityScores, RollDiceFunc, ActiveBonus } from "../types/character";
import ProficiencyIcon from "./ui/ProficiencyIcon";
import { getAdvantageDisadvantage, getEffectiveBonuses } from "../utils/character-utils";
import { Target, PlusCircle } from "lucide-react";

interface SavingThrowsSectionProps {
    character: Character;
    proficiencyBonus: number;
    setSavingThrows: (key: string, value: boolean) => void;
    abilityScores: AbilityScores;
    rollDice?: RollDiceFunc;
    onUpdateActiveBonuses: (bonuses: ActiveBonus[]) => void;
}

const calculateModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
};

const formatKey = (key: string) =>
    key.charAt(0).toUpperCase() + key.slice(1);

const SavingThrowsSection: React.FC<SavingThrowsSectionProps> = ({
    character,
    proficiencyBonus,
    setSavingThrows,
    abilityScores,
    rollDice,
    onUpdateActiveBonuses,
}) => {
    const [isConcMode, setIsConcMode] = useState(false);
    const savingThrows = character.savingThrows || {
        strength: false, dexterity: false, constitution: false,
        intelligence: false, wisdom: false, charisma: false
    };

    const allNotes: string[] = [];

    return (
        <div className="flex flex-col gap-2 w-full items-center">
            {Object.keys(savingThrows).map((key) => {
                const isProficient = savingThrows[key];
                const baseModifier = calculateModifier(abilityScores[key]);
                const saveModifier = baseModifier + (isProficient ? proficiencyBonus : 0);

                const isConstitution = key === 'constitution';
                const showConc = isConstitution && isConcMode;
                const rollType = showConc ? "Concentration" : `${formatKey(key)} Save`;

                // Calculate bonuses
                const activeBonuses = getEffectiveBonuses(character, rollType);
                let bonusModifier = 0;
                activeBonuses.forEach(b => {
                    const val = parseInt(b.bonus);
                    if (!isNaN(val) && !b.bonus.includes('d')) {
                        bonusModifier += val;
                    }
                    if (!allNotes.includes(`${b.name}: ${b.bonus}`)) {
                        allNotes.push(`${b.name}: ${b.bonus}`);
                    }
                });

                const modifier = saveModifier + bonusModifier;
                const displayModifier = modifier >= 0 ? `+${modifier}` : `${modifier}`;
                const label = showConc ? "Concentration" : `${formatKey(key)} Save`;

                const { advantage, disadvantage, extraAdvantage, notes } = getAdvantageDisadvantage(character, label, key);
                notes.forEach(n => { if (!allNotes.includes(n)) allNotes.push(n); });

                return (
                    <div key={key} className="flex flex-col items-center h-[110px] w-32 border border-border rounded-lg p-2 shadow-sm transition-all hover:shadow-lg relative bg-secondary/30">
                        {/* Name & Conc Button Integration Slot - Fixed Height */}
                        <div className="h-8 flex items-center justify-center w-full relative px-2">
                            <div
                                className={`uppercase font-black text-xs tracking-wider cursor-pointer transition-colors leading-none text-center ${showConc ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                                onClick={() => rollDice?.(20, modifier, label, undefined, undefined, undefined, undefined, undefined, advantage, disadvantage, extraAdvantage, 'save')}
                            >
                                {showConc ? "Concentration" : `${key.slice(0, 3)} Save`}
                            </div>
                        </div>

                        {/* Modifier Slot - Taking remaining space */}
                        <div className="flex-1 flex items-center justify-center w-full">
                            <button 
                                onClick={() => rollDice?.(20, modifier, label, undefined, undefined, undefined, undefined, undefined, advantage, disadvantage, extraAdvantage, 'save')}
                                className={`text-4xl font-black transition-all hover:scale-110 ${showConc ? 'text-primary hover:opacity-80' : 'text-primary hover:opacity-90'}`}
                            >
                                {displayModifier}
                            </button>
                        </div>

                        {/* Proficiency Toggle Slot - Centered */}
                        <div className="h-8 flex items-center justify-center w-full mt-1">
                            {showConc ? (
                                <div className="flex items-center justify-center opacity-60">
                                    <ProficiencyIcon level={isProficient ? "proficient" : "none"} className="w-2.5 h-2.5" />
                                </div>
                            ) : (
                                <button
                                    onClick={() => setSavingThrows(key, !isProficient)}
                                    className="flex items-center justify-center transition-transform active:scale-95"
                                    title={isProficient ? "Proficient" : "Not Proficient"}
                                >
                                    <ProficiencyIcon level={isProficient ? "proficient" : "none"} className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Constitution-specific Concentration Toggle - Bottom Right */}
                        {isConstitution && (
                            <button
                                onClick={() => setIsConcMode(!isConcMode)}
                                className={`absolute bottom-1 right-1 p-1 rounded-md transition-all z-10 ${isConcMode ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground/40 hover:text-primary hover:bg-primary/5'}`}
                                title={isConcMode ? "Switch to Saving Throw" : "Switch to Concentration"}
                            >
                                <Target className="w-4 h-4" />
                            </button>
                        )}

                        {/* ADV/DIS Badges - Bottom Left */}
                        <div className="absolute bottom-1 left-1 flex flex-col gap-1 pointer-events-none">
                            {advantage && <span className="text-[11px] font-black bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-1 rounded border border-green-200 dark:border-green-800 uppercase leading-tight">ADV{extraAdvantage > 0 ? `+${extraAdvantage}` : ''}</span>}
                            {disadvantage && <span className="text-[11px] font-black bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-1 rounded border border-red-200 dark:border-red-800 uppercase leading-tight">DIS</span>}
                        </div>
                    </div>
                );
            })}

            {allNotes.length > 0 && (
                <div className="mt-2 pt-1 border-t border-border">
                    <h4 className="text-[11px] uppercase font-bold text-muted-foreground mb-1">Bonuses</h4>
                    <ul className="space-y-0.5">
                        {allNotes.map((note, i) => (
                            <li key={i} className="text-[11px] text-muted-foreground italic leading-tight">
                                • {note}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SavingThrowsSection;
