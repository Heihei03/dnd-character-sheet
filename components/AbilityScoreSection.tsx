"use client";

import { useState, useEffect } from "react";

// Define types for props
interface AbilityScoreSectionProps {
  abilityScores: { [key: string]: number };
  setAbilityScore: (key: string, value: number) => void;
  rollDice: (sides: number, modifier: number, label: string) => void;
}

const AbilityScoreSection = ({
  abilityScores,
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
        const modifier = calculateModifier(score);
        const formattedModifier = modifier >= 0 ? `+${modifier}` : `${modifier}`;
        return (
          <div
            key={key}
            className="flex items-center justify-between border border-gray-300 rounded-lg p-2 bg-gray-50 shadow w-full"
          >
            {/* Ability Name */}
            <div
              className="uppercase font-semibold text-sm w-20 cursor-pointer hover:text-blue-500"
              onClick={() => rollDice(20, modifier, key)}
            >
              {key}
            </div>

            {/* Score Input */}
            <input
              type="number"
              value={abilityScoresInput[key] ?? ""}
              onChange={(e) => handleAbilityScoreChange(key, e)}
              className="w-16 text-2xl font-bold text-center border-none bg-transparent focus:outline-none"
            />

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
