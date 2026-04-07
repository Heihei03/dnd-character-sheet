"use client";

import { useState, useEffect } from "react";
import NumericInput from "./ui/NumericInput";

import { AbilityScores, Character, RollDiceFunc } from "../types/character";
import { getAdvantageDisadvantage } from "../utils/character-utils";

// Define types for props
interface AbilityScoreSectionProps {
  abilityScores: AbilityScores;
  effectiveAbilityScores: AbilityScores;
  setAbilityScore: (key: string, value: number) => void;
  rollDice?: RollDiceFunc;
  character: Character;
}

const AbilityScoreSection = ({
  abilityScores,
  effectiveAbilityScores,
  setAbilityScore,
  rollDice,
  character,
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
        const { advantage, disadvantage, extraAdvantage } = getAdvantageDisadvantage(character, `${key} Checks`, key);
        return (
          <div
            key={key}
            className={`flex flex-col items-center h-[110px] w-32 border rounded-lg p-2 shadow-sm transition-all hover:shadow-lg relative ${isOverridden
              ? "bg-primary/10 border-primary/30"
              : "bg-secondary/30 border-border"
              }`}
          >
            {/* Ability Name Slot - Fixed Height */}
            <div className="h-8 flex items-center justify-center w-full px-2">
              <div
                className={`uppercase font-black text-xs tracking-wider cursor-pointer transition-colors leading-none text-center ${isOverridden ? "text-primary dark:text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                onClick={() => rollDice?.(20, modifier, key, undefined, undefined, undefined, undefined, undefined, advantage, disadvantage, extraAdvantage)}
                title={isOverridden ? "Overridden by item/feature" : ""}
              >
                {key}
              </div>
            </div>

            {/* Modifier Slot - Taking remaining space */}
            <div className="flex-1 flex items-center justify-center w-full">
              <button
                onClick={() => rollDice?.(20, modifier, key, undefined, undefined, undefined, undefined, undefined, advantage, disadvantage, extraAdvantage)}
                className="text-4xl font-black text-primary hover:opacity-80 transition-all hover:scale-110"
              >
                {formattedModifier}
              </button>
            </div>

            {/* Score Input Slot - Fixed Height */}
            <div className="h-8 flex items-center justify-center w-full mt-1">
              <div className="relative flex items-center justify-center bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-full px-2 py-0.5 min-w-[2.75rem] shadow-sm">
                {isOverridden ? (
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-primary">
                      {effectiveScore}
                    </span>
                    <span className="text-xs text-muted-foreground line-through decoration-primary/50" title={`Base Score: ${score}`}>
                      ({score})
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                   <NumericInput
                    value={abilityScoresInput[key] ?? ""}
                    onChange={(val) => setAbilityScore(key, val)}
                    onInputChange={(e) => handleAbilityScoreChange(key, e)}
                    variant="horizontal"
                    min={0}
                    className="border-none bg-transparent shadow-none"
                    inputClassName="w-7 text-sm font-bold text-center p-0 h-5"
                  />
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
