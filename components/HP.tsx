"use client";

import { useState, useEffect } from "react";
import Button from "./ui/button";
import { CharacterClass, AbilityScores } from "../types/character";
import { classHitDice } from "../utils/constants";
import { Plus, Minus } from "lucide-react";

interface HPSectionProps {
  maxHp: number;
  hp: number;
  tempHp: number;
  setMaxHp: (maxHp: number) => void;
  setHp: (hp: number) => void;
  setTempHp: (tempHp: number) => void;
  classes: CharacterClass[];
  abilityScores: AbilityScores;
  onUpdateClasses: (classes: CharacterClass[]) => void;
  rollDice: (sides: number, modifier?: number, label?: string) => void;
}

const HPSection = ({
  maxHp,
  hp,
  tempHp,
  setMaxHp,
  setHp,
  setTempHp,
  classes,
  abilityScores,
  onUpdateClasses,
  rollDice
}: HPSectionProps) => {
  const [hpDiff, setHpDiff] = useState(0);
  const [maxHpInput, setMaxHpInput] = useState<string>(String(maxHp));
  const [hpInput, setHpInput] = useState<string>(String(hp));
  const [tempHpInput, setTempHpInput] = useState<string>(String(tempHp));

  useEffect(() => setHpInput(String(hp)), [hp]);
  useEffect(() => setTempHpInput(String(tempHp)), [tempHp]);
  useEffect(() => setMaxHpInput(String(maxHp)), [maxHp]);

  const getModifier = (score: number) => Math.floor((score - 10) / 2);

  const handleAction = (type: "damage" | "heal") => {
    if (type === "damage") {
      if (tempHp > 0) {
        // Damage first reduces temp HP
        const remainingTemp = Math.max(0, tempHp - hpDiff);
        const overflow = Math.max(0, hpDiff - tempHp);
        setTempHp(remainingTemp);
        if (overflow > 0) {
          const newHp = Math.max(0, hp - overflow);
          setHp(newHp);
        }
      } else {
        // No temp HP, apply directly to current HP
        const newHp = Math.max(0, hp - hpDiff);
        setHp(newHp);
      }
    } else {
      setHp(Math.min(maxHp, hp + hpDiff)); // Heal but not exceed max HP
    }
  };

  const handleRollHitDice = (index: number) => {
    const cls = classes[index];
    const available = cls.level - (cls.usedHitDice || 0);

    if (available <= 0) return;

    const sides = classHitDice[cls.name.toLowerCase()] || 8;
    const conMod = getModifier(abilityScores.constitution);
    const roll = Math.floor(Math.random() * sides) + 1;
    const healAmount = Math.max(1, roll + conMod);

    // Update HP
    setHp(Math.min(maxHp, hp + healAmount));

    // Update Used Hit Dice
    const updatedClasses = [...classes];
    updatedClasses[index] = {
      ...cls,
      usedHitDice: (cls.usedHitDice || 0) + 1
    };
    onUpdateClasses(updatedClasses);

    // Show roll result using main dice roller
    rollDice(sides, conMod, `Hit Die (${cls.name})`);
  };

  const handleMaxHpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setMaxHpInput("");
      setMaxHp(0);
    } else {
      const parsedValue = Number(value);
      if (!isNaN(parsedValue)) {
        setMaxHpInput(parsedValue.toString());
        setMaxHp(parsedValue);
      }
    }
  };

  const handleHpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setHpInput("");
      setHp(0);
    } else {
      const parsedValue = Number(value);
      if (!isNaN(parsedValue)) {
        setHpInput(parsedValue.toString());
        setHp(parsedValue);
      }
    }
  };

  const handleTempHpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setTempHpInput("");
      setTempHp(0);
    } else {
      const parsedValue = Number(value);
      if (!isNaN(parsedValue)) {
        setTempHpInput(parsedValue.toString());
        setTempHp(parsedValue);
      }
    }
  };

  const handleHitDiceChange = (index: number, newValue: number) => {
    const cls = classes[index];
    const updatedClasses = [...classes];
    // available = level - usedHitDice => usedHitDice = level - available
    const newUsed = Math.max(0, Math.min(cls.level, cls.level - newValue));
    updatedClasses[index] = {
      ...cls,
      usedHitDice: newUsed
    };
    onUpdateClasses(updatedClasses);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-2">
          <label className="text-lg">Max HP:</label>
          <input
            type="number"
            value={maxHpInput}
            onChange={handleMaxHpChange}
            className="w-20 p-2 border border-gray-300 rounded-lg shadow-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center justify-between px-2">
          <label className="text-lg">HP:</label>
          <input
            type="number"
            value={hpInput}
            onChange={handleHpChange}
            className="w-20 p-2 border border-gray-300 rounded-lg shadow-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center justify-between px-2">
          <label className="text-lg">Temp HP:</label>
          <input
            type="number"
            value={tempHpInput}
            onChange={handleTempHpChange}
            className="w-20 p-2 border border-gray-300 rounded-lg shadow-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mt-2 border-t pt-4">
        <input
          type="number"
          value={hpDiff}
          onChange={(e) => setHpDiff(Math.max(0, Number(e.target.value)))}
          placeholder="Amount"
          className="w-24 p-2 border border-gray-300 rounded-lg shadow-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
        />
        <div className="flex gap-2">
          <Button
            variant="danger"
            onClick={() => handleAction("damage")}
            className="flex items-center gap-2"
          >
            <Minus className="w-4 h-4" /> Damage
          </Button>
          <Button
            variant="success"
            onClick={() => handleAction("heal")}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Heal
          </Button>
        </div>
      </div>

      <div className="border-t pt-4 space-y-2">
        <h3 className="text-md font-semibold text-center">Hit Dice</h3>
        {classes.map((cls, index) => {
          const available = cls.level - (cls.usedHitDice || 0);
          const sides = classHitDice[cls.name.toLowerCase()] || 8;
          return (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-100">
              <span className="text-sm font-medium">{cls.name}</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm font-medium">
                  <input
                    type="number"
                    value={available}
                    onChange={(e) => handleHitDiceChange(index, parseInt(e.target.value) || 0)}
                    min={0}
                    max={cls.level}
                    className="w-10 p-1 border border-gray-300 rounded bg-white text-center font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-gray-600">/ {cls.level} d{sides}</span>
                </div>
                <Button
                  variant="primary"
                  onClick={() => handleRollHitDice(index)}
                  disabled={available <= 0}
                  className="text-xs px-2 py-1 h-7"
                >
                  Roll
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HPSection;
