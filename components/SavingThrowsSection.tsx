import React from "react";
import { SavingThrows, Character } from "../types/character";
import ProficiencyIcon from "./ui/ProficiencyIcon";
import { getAdvantageDisadvantage } from "../utils/character-utils";

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
    const savingThrows = character.savingThrows || {
        strength: false, dexterity: false, constitution: false,
        intelligence: false, wisdom: false, charisma: false
    };

    const allNotes: string[] = [];

    return (
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-center mb-4">Saving Throws</h2>
            {Object.keys(savingThrows).map((key) => {
                const isProficient = savingThrows[key];
                const modifier = calculateModifier(abilityScores[key]) + (isProficient ? proficiencyBonus : 0);
                const displayModifier = modifier >= 0 ? `+${modifier}` : `${modifier}`;

                const { advantage, disadvantage, notes } = getAdvantageDisadvantage(character, `${formatKey(key)} Saves`);
                notes.forEach(n => { if (!allNotes.includes(n)) allNotes.push(n); });

                return (
                    <div key={key} className="group flex items-center justify-between p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSavingThrows(key, !isProficient)}
                                className="w-6 h-6 flex items-center justify-center focus:outline-none hover:text-blue-600 transition-transform active:scale-95"
                                title={isProficient ? "Proficient" : "Not Proficient"}
                            >
                                <ProficiencyIcon level={isProficient ? "proficient" : "none"} className="w-4 h-4" />
                            </button>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span
                                        className="capitalize cursor-pointer font-medium text-sm sm:text-base"
                                        onClick={() => rollDice(20, modifier, `${formatKey(key)} Save`)}
                                    >
                                        {key}
                                    </span>
                                    {advantage && (
                                        <span className="text-[10px] font-black bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1 rounded border border-green-200 dark:border-green-800" title="Advantage">ADV</span>
                                    )}
                                    {disadvantage && (
                                        <span className="text-[10px] font-black bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-1 rounded border border-red-200 dark:border-red-800" title="Disadvantage">DIS</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => rollDice(20, modifier, `${formatKey(key)} Save`)}
                            className="font-bold text-lg min-w-[3ch] text-right text-blue-600 hover:text-blue-800"
                        >
                            {displayModifier}
                        </button>
                    </div>
                );
            })}

            {/* Special: Concentration */}
            <div className="group flex items-center justify-between p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors mt-2 pt-2 border-t border-gray-50 dark:border-gray-900">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center opacity-30">
                        <ProficiencyIcon level="none" className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span
                                className="capitalize cursor-pointer font-bold text-sm sm:text-base text-gray-700 dark:text-gray-300"
                                onClick={() => rollDice(20, calculateModifier(abilityScores.constitution), "Concentration Check")}
                            >
                                Concentration
                            </span>
                            {(() => {
                                const { advantage, disadvantage, notes } = getAdvantageDisadvantage(character, "Concentration");
                                notes.forEach(n => { if (!allNotes.includes(n)) allNotes.push(n); });
                                return (
                                    <>
                                        {advantage && <span className="text-[10px] font-black bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1 rounded border border-green-200 dark:border-green-800">ADV</span>}
                                        {disadvantage && <span className="text-[10px] font-black bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-1 rounded border border-red-200 dark:border-red-800">DIS</span>}
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => rollDice(20, calculateModifier(abilityScores.constitution), "Concentration Check")}
                    className="font-bold text-lg min-w-[3ch] text-right text-blue-600 hover:text-blue-800"
                >
                    {calculateModifier(abilityScores.constitution) >= 0 ? `+${calculateModifier(abilityScores.constitution)}` : calculateModifier(abilityScores.constitution)}
                </button>
            </div>
            {allNotes.length > 0 && (
                <div className="mt-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-1">Contextual Bonuses</h4>
                    <ul className="space-y-1">
                        {allNotes.map((note, i) => (
                            <li key={i} className="text-[11px] text-gray-600 dark:text-gray-400 italic leading-tight">
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
