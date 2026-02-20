"use client";

import { useState, useEffect } from "react";

// Define types for props
interface AbilityScoreSectionProps {
  abilityScores: { [key: string]: number };
  effectiveAbilityScores: { [key: string]: number };
  setAbilityScore: (key: string, value: number) => void;
  rollDice: (sides: number, modifier: number, label: string) => void;
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
    <div className="flex flex-col gap-4 w-full">
      {Object.keys(abilityScores).map((key) => {
        const score = abilityScores[key];
        const effectiveScore = effectiveAbilityScores[key];
        const isOverridden = effectiveScore > score;
        const modifier = calculateModifier(effectiveScore);
        const formattedModifier = modifier >= 0 ? `+${modifier}` : `${modifier}`;
        return (
          <div
            key={key}
            className={`flex items-center justify-between border rounded-lg p-2 shadow w-full transition-colors ${isOverridden
              ? "bg-purple-50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-800"
              : "bg-gray-50 border-gray-300 dark:bg-gray-900 dark:border-gray-800"
              }`}
          >
            {/* Ability Name */}
            <div
              className={`uppercase font-semibold text-sm w-20 cursor-pointer transition-colors ${isOverridden ? "text-purple-600 dark:text-purple-400" : "hover:text-blue-500"
                }`}
              onClick={() => rollDice(20, modifier, key)}
              title={isOverridden ? "Overridden by item/feature" : ""}
            >
              {key}
            </div>

            {/* Score Input */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {isOverridden ? (
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-purple-600 animate-in fade-in zoom-in duration-300">
                      {effectiveScore}
                    </span>
                    <span className="text-[10px] text-gray-400 line-through decoration-purple-400/50 -mt-1" title={`Base Score: ${score}`}>
                      Base: {score}
                    </span>
                  </div>
                ) : (
                  <input
                    type="number"
                    value={abilityScoresInput[key] ?? ""}
                    onChange={(e) => handleAbilityScoreChange(key, e)}
                    className="w-16 text-2xl font-bold text-center border-none bg-transparent focus:outline-none"
                  />
                )}
              </div>
            </div>

            {/* Modifier */}
            <div className="text-lg font-semibold w-16 text-center">
              {formattedModifier}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AbilityScoreSection;
