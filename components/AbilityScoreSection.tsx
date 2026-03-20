"use client";

import { useState, useEffect } from "react";
import { Minus, Plus } from "lucide-react";

import { CritRule } from "../types/character";

// Define types for props
interface AbilityScoreSectionProps {
  abilityScores: { [key: string]: number };
  effectiveAbilityScores: { [key: string]: number };
  setAbilityScore: (key: string, value: number) => void;
    rollDice?: (sides: number, modifier?: number, label?: string, damageFormula?: string, damageType?: string, critRange?: number, critExtraDamage?: string, critRule?: CritRule) => void;
}

const AbilityScoreSection = ({
  abilityScores,
  effectiveAbilityScores,
  setAbilityScore,
  rollDice,
}: AbilityScoreSectionProps) => {
  const [abilityScoresInput, setAbilityScoresInput] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const initialInputs = Object.keys(abilityScores).reduce((acc, key) => {
      acc[key] = abilityScores[key] ? abilityScores[key].toString() : "";
      return acc;
    }, {} as { [key: string]: string });
    setAbilityScoresInput(initialInputs);
  }, [abilityScores]);

  const calculateModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
  };

  const formatKey = (key: string) =>
    key.charAt(0).toUpperCase() + key.slice(1);

  const handleAbilityScoreChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "") {
      setAbilityScoresInput((prev) => ({ ...prev, [key]: "" }));
      setAbilityScore(key, 0);
    } else {
      const parsedValue = Number(value);
      if (!isNaN(parsedValue)) {
        setAbilityScoresInput((prev) => ({ ...prev, [key]: parsedValue.toString() }));
        setAbilityScore(key, parsedValue);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full items-center">
      {Object.keys(abilityScores).map((key) => {
        const score = abilityScores[key];
        const effectiveScore = effectiveAbilityScores[key];
        const isOverridden = effectiveScore > score;
        const modifier = calculateModifier(effectiveScore);
        const formattedModifier = modifier >= 0 ? `+${modifier}` : `${modifier}`;
        return (
          <div
            key={key}
            className={`flex flex-col items-center h-[110px] w-32 border rounded-lg p-2 shadow-sm transition-all hover:shadow-lg relative ${isOverridden
              ? "bg-purple-50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-800"
              : "bg-gray-50 border-gray-300 dark:bg-gray-900 dark:border-gray-800"
              }`}
          >
            {/* Ability Name Slot - Fixed Height */}
            <div className="h-8 flex items-center justify-center w-full px-2">
              <div
                className={`uppercase font-black text-xs tracking-wider cursor-pointer transition-colors leading-none text-center ${isOverridden ? "text-purple-600 dark:text-purple-400" : "text-gray-400 hover:text-blue-500"
                  }`}
                onClick={() => rollDice?.(20, modifier, key)}
                title={isOverridden ? "Overridden by item/feature" : ""}
              >
                {key}
              </div>
            </div>

            {/* Modifier Slot - Taking remaining space */}
            <div className="flex-1 flex items-center justify-center w-full">
              <button
                onClick={() => rollDice?.(20, modifier, key)}
                className="text-4xl font-black text-blue-600 hover:text-blue-800 transition-all hover:scale-110"
              >
                {formattedModifier}
              </button>
            </div>

            {/* Score Input Slot - Fixed Height */}
            <div className="h-8 flex items-center justify-center w-full mt-1">
              <div className="relative flex items-center justify-center bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-full px-2 py-0.5 min-w-[2.75rem] shadow-sm">
                {isOverridden ? (
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-purple-600">
                      {effectiveScore}
                    </span>
                    <span className="text-[10px] text-gray-400 line-through decoration-purple-400/50" title={`Base Score: ${score}`}>
                      ({score})
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => setAbilityScore(key, Math.max(0, score - 1))}
                      className="text-gray-400 hover:text-blue-500 w-5 flex items-center justify-center transition-colors px-1"
                    >
                      <Minus className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                    <input
                      type="number"
                      value={abilityScoresInput[key] ?? ""}
                      onChange={(e) => handleAbilityScoreChange(key, e)}
                      className="w-7 text-sm font-bold text-center border-none bg-transparent focus:outline-none p-0 h-5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() => setAbilityScore(key, score + 1)}
                      className="text-gray-400 hover:text-blue-500 w-5 flex items-center justify-center transition-colors px-1"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AbilityScoreSection;
