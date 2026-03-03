import React, { useState } from "react";
import { SavingThrows, Character } from "../types/character";
import ProficiencyIcon from "./ui/ProficiencyIcon";
import { getAdvantageDisadvantage } from "../utils/character-utils";
import { Target } from "lucide-react";

interface SavingThrowsSectionProps {
    character: Character;
    proficiencyBonus: number;
    setSavingThrows: (key: string, value: boolean) => void;
    abilityScores: { [key: string]: number };
    rollDice: (sides: number, modifier: number, label: string) => void;
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

                const modifier = saveModifier;
                const displayModifier = modifier >= 0 ? `+${modifier}` : `${modifier}`;
                const label = showConc ? "Concentration" : `${formatKey(key)} Save`;

                const { advantage, disadvantage, notes } = getAdvantageDisadvantage(character, label);
                notes.forEach(n => { if (!allNotes.includes(n)) allNotes.push(n); });

                return (
                    <div key={key} className="flex flex-col items-center h-[110px] w-32 border rounded-lg p-2 shadow-sm transition-all hover:shadow-lg relative bg-gray-50 border-gray-300 dark:bg-gray-900 dark:border-gray-800">
                        {/* Name & Conc Button Integration Slot - Fixed Height */}
                        <div className="h-8 flex items-center justify-center w-full relative px-2">
                            <div
                                className={`uppercase font-black text-xs tracking-wider cursor-pointer transition-colors leading-none text-center ${showConc ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
                                onClick={() => rollDice(20, modifier, label)}
                            >
                                {showConc ? "Concentration" : `${key.slice(0, 3)} Save`}
                            </div>
                        </div>

                        {/* Modifier Slot - Taking remaining space */}
                        <div className="flex-1 flex items-center justify-center w-full">
                            <button
                                onClick={() => rollDice(20, modifier, label)}
                                className={`text-4xl font-black transition-all hover:scale-110 ${showConc ? 'text-blue-500 hover:text-blue-600' : 'text-blue-600 hover:text-blue-800'}`}
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
                                    <ProficiencyIcon level={isProficient ? "proficient" : "none"} className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Constitution-specific Concentration Toggle - Bottom Right */}
                        {isConstitution && (
                            <button
                                onClick={() => setIsConcMode(!isConcMode)}
                                className={`absolute bottom-1 right-1 p-1 rounded-md transition-all z-10 ${isConcMode ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800' : 'text-gray-300 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                title={isConcMode ? "Switch to Saving Throw" : "Switch to Concentration"}
                            >
                                <Target className="w-3.5 h-3.5" />
                            </button>
                        )}

                        {/* ADV/DIS Badges - Top Right */}
                        <div className="absolute top-1 right-1 flex flex-col gap-1 pointer-events-none">
                            {advantage && <span className="text-[8px] font-black bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-1 rounded border border-green-200 dark:border-green-800">ADV</span>}
                            {disadvantage && <span className="text-[8px] font-black bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-1 rounded border border-red-200 dark:border-red-800">DIS</span>}
                        </div>
                    </div>
                );
            })}

            {allNotes.length > 0 && (
                <div className="mt-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                    <h4 className="text-[8px] uppercase font-bold text-gray-400 mb-1">Bonuses</h4>
                    <ul className="space-y-0.5">
                        {allNotes.map((note, i) => (
                            <li key={i} className="text-[9px] text-gray-500 dark:text-gray-400 italic leading-tight">
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
