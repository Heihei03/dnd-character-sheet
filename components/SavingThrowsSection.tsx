
import React from "react";
import { SavingThrows } from "../types/character";

interface SavingThrowsSectionProps {
    savingThrows: SavingThrows;
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
    savingThrows,
    proficiencyBonus,
    setSavingThrows,
    abilityScores,
    rollDice,
}) => {

    const ProficiencyIcon = ({ isProficient }: { isProficient: boolean }) => {
        const baseClasses = "w-5 h-5 text-current";

        if (isProficient) {
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
        }

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
    };

    return (
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-center mb-4">Saving Throws</h2>
            {Object.keys(savingThrows).map((key) => {
                const isProficient = savingThrows[key];
                const modifier = calculateModifier(abilityScores[key]) + (isProficient ? proficiencyBonus : 0);
                const displayModifier = modifier >= 0 ? `+${modifier}` : `${modifier}`;

                return (
                    <div key={key} className="flex items-center justify-between p-1 hover:bg-gray-100 rounded">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSavingThrows(key, !isProficient)}
                                className="w-6 h-6 flex items-center justify-center focus:outline-none hover:text-blue-600 transition-transform active:scale-95"
                                title={isProficient ? "Proficient" : "Not Proficient"}
                            >
                                <ProficiencyIcon isProficient={isProficient} />
                            </button>
                            <span
                                className="capitalize cursor-pointer font-medium"
                                onClick={() => rollDice(20, modifier, `${formatKey(key)} Save`)}
                            >
                                {key}
                            </span>
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
        </div>
    );
};

export default SavingThrowsSection;
