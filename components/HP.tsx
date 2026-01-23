"use client";

import { useState, useEffect } from "react";
import Button from "./ui/button";

interface HPSectionProps {
  maxHp: number;
  hp: number;
  tempHp: number;
  setMaxHp: (maxHp: number) => void;
  setHp: (hp: number) => void;
  setTempHp: (tempHp: number) => void;
}

const HPSection = ({ maxHp, hp, tempHp, setMaxHp, setHp, setTempHp }: HPSectionProps) => {
  const [hpDiff, setHpDiff] = useState(0);
  const [maxHpInput, setMaxHpInput] = useState<string>(String(maxHp));
  const [hpInput, setHpInput] = useState<string>(String(hp));
  const [tempHpInput, setTempHpInput] = useState<string>(String(tempHp));

  useEffect(() => setHpInput(String(hp)), [hp]);
  useEffect(() => setTempHpInput(String(tempHp)), [tempHp]);
  useEffect(() => setMaxHpInput(String(maxHp)), [maxHp]);

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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-start">
        <label className="text-lg">Max HP:</label>
        <input
          type="number"
          value={maxHpInput} // Use the string value for the input field
          onChange={handleMaxHpChange}
          className="w-20 mx-auto p-2 border border-gray-300 rounded-lg shadow-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center justify-start">
        <label className="text-lg">HP:</label>
        <input
          type="number"
          value={hpInput} // Use the string value for the input field
          onChange={handleHpChange}
          className="w-20 mx-auto p-2 border border-gray-300 rounded-lg shadow-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center justify-start">
        <label className="text-lg">Temp HP:</label>
        <input
          type="number"
          value={tempHpInput} // Use the string value for the input field
          onChange={handleTempHpChange}
          className="w-20 mx-auto p-2 border border-gray-300 rounded-lg shadow-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center justify-center gap-4 mt-2">
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
            onClick={() => handleAction("damage")}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Damage
          </Button>
          <Button
            onClick={() => handleAction("heal")}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Heal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HPSection;
