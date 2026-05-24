"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import NumericInput from "./ui/NumericInput";
import { AbilityScores, Character, RollDiceFunc, ActiveBonus } from "../types/character";
import { getAdvantageDisadvantage, getEffectiveBonuses } from "../utils/character-utils";
import ProficiencyIcon from "./ui/ProficiencyIcon";
import { Target, PlusCircle } from "lucide-react";

// Define types for props
interface AbilityScoreSectionProps {
  abilityScores: AbilityScores;
  effectiveAbilityScores: AbilityScores;
  setAbilityScore: (key: string, value: number) => void;
  rollDice?: RollDiceFunc;
  character: Character;
  onUpdateActiveBonuses: (bonuses: ActiveBonus[]) => void;
}

const AbilityScoreSection = ({
  abilityScores,
  effectiveAbilityScores,
  setAbilityScore,
  rollDice,
  character,
  onUpdateActiveBonuses,
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

  const handleAbilityScoreChange = (key: string, e: ChangeEvent<HTMLInputElement>) => {
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
    <div className="grid grid-cols-3 md:grid-cols-1 gap-2 w-full justify-items-center">
      {Object.keys(abilityScores).map((key) => {
        const score = abilityScores[key];
        const effectiveScore = effectiveAbilityScores[key];
        const isOverridden = effectiveScore > score;
        const baseModifier = calculateModifier(effectiveScore);
        
        // Calculate bonuses
        const checkTarget = `${formatKey(key)} Checks`;
        const activeBonuses = getEffectiveBonuses(character, checkTarget);
        let bonusModifier = 0;
        activeBonuses.forEach(b => {
          const val = parseInt(b.bonus);
          if (!isNaN(val) && !b.bonus.includes('d')) {
            bonusModifier += val;
          }
        });

        const modifier = baseModifier + bonusModifier;
        const formattedModifier = modifier >= 0 ? `+${modifier}` : `${modifier}`;
        const { advantage, disadvantage, extraAdvantage } = getAdvantageDisadvantage(character, checkTarget, key);
        return (
          <div
            key={key}
            className={`flex flex-col items-center h-24 w-full max-w-[96px] md:max-w-none md:h-[110px] md:w-32 border rounded-lg p-1.5 md:p-2 shadow-sm transition-all hover:shadow-lg relative ${isOverridden
              ? "bg-primary/10 border-primary/30"
              : "bg-secondary/30 border-border"
              }`}
          >
            {/* Ability Name Slot - Fixed Height */}
            <div className="h-6 md:h-8 flex items-center justify-center w-full px-1 md:px-2">
              <div
                className={`uppercase font-black text-[9px] md:text-xs tracking-wider cursor-pointer transition-colors leading-none text-center ${isOverridden ? "text-primary dark:text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                onClick={() => rollDice?.(20, 1, modifier, key, undefined, undefined, undefined, undefined, undefined, advantage, disadvantage, extraAdvantage, 'ability')}
                title={isOverridden ? "Overridden by item/feature" : ""}
              >
                {key}
              </div>
            </div>

            {/* Modifier Slot - Taking remaining space */}
            <div className="flex-1 flex items-center justify-center w-full">
              <button
                onClick={() => rollDice?.(20, 1, modifier, key, undefined, undefined, undefined, undefined, undefined, advantage, disadvantage, extraAdvantage, 'ability')}
                className="text-xl md:text-4xl font-black text-primary hover:opacity-80 transition-all hover:scale-110"
              >
                {formattedModifier}
              </button>
            </div>

            {/* Score Input Slot - Fixed Height */}
            <div className="h-6 md:h-8 flex items-center justify-center w-full mt-0.5">
              <div className="relative flex items-center justify-center bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-full px-1.5 py-px min-w-[2.25rem] md:min-w-[2.75rem] shadow-sm">
                {isOverridden ? (
                  <div className="flex items-center gap-0.5">
                    <span className="text-xs font-bold text-primary">
                      {effectiveScore}
                    </span>
                    <span className="text-[10px] text-muted-foreground line-through decoration-primary/50" title={`Base Score: ${score}`}>
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
                    inputClassName="w-6 md:w-7 text-xs md:text-sm font-bold text-center p-0 h-4 md:h-5"
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
