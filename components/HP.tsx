"use client";

import { useState, useEffect } from "react";
import Button from "./ui/button";
import { CharacterClass, AbilityScores, CritRule } from "../types/character";
import { classHitDice } from "../utils/constants";
import { Plus, Minus, Heart, Shield, Activity, Dna } from "lucide-react";
import { cn } from "../lib/utils";

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
  rollDice?: (sides: number, modifier?: number, label?: string, damageFormula?: string, damageType?: string, critRange?: number, critExtraDamage?: string, critRule?: CritRule) => void;
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
    const amount = hpDiff || 0;
    if (type === "damage") {
      if (tempHp > 0) {
        const remainingTemp = Math.max(0, tempHp - amount);
        const overflow = Math.max(0, amount - tempHp);
        setTempHp(remainingTemp);
        if (overflow > 0) {
          const newHp = Math.max(0, hp - overflow);
          setHp(newHp);
        }
      } else {
        const newHp = Math.max(0, hp - amount);
        setHp(newHp);
      }
    } else {
      setHp(Math.min(maxHp, hp + amount));
    }
    setHpDiff(0);
  };

  const handleRollHitDice = (index: number) => {
    const cls = classes[index];
    const available = cls.level - (cls.usedHitDice || 0);

    if (available <= 0) return;

    const sides = classHitDice[cls.name.toLowerCase()] || 8;
    const conMod = getModifier(abilityScores.constitution);
    const roll = Math.floor(Math.random() * sides) + 1;
    const healAmount = Math.max(1, roll + conMod);

    setHp(Math.min(maxHp, hp + healAmount));

    const updatedClasses = [...classes];
    updatedClasses[index] = {
      ...cls,
      usedHitDice: (cls.usedHitDice || 0) + 1
    };
    onUpdateClasses(updatedClasses);

    rollDice?.(sides, conMod, `Hit Die (${cls.name})`);
  };

  const handleMaxHpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMaxHpInput(value);
    const parsedValue = parseInt(value);
    if (!isNaN(parsedValue)) {
      setMaxHp(parsedValue);
    }
  };

  const handleHpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHpInput(value);
    const parsedValue = parseInt(value);
    if (!isNaN(parsedValue)) {
      setHp(parsedValue);
    }
  };

  const handleTempHpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTempHpInput(value);
    const parsedValue = parseInt(value);
    if (!isNaN(parsedValue)) {
      setTempHp(parsedValue);
    }
  };

  const handleHitDiceChange = (index: number, newValue: number) => {
    const cls = classes[index];
    const updatedClasses = [...classes];
    const newUsed = Math.max(0, Math.min(cls.level, cls.level - newValue));
    updatedClasses[index] = {
      ...cls,
      usedHitDice: newUsed
    };
    onUpdateClasses(updatedClasses);
  };

  const hpPercentage = maxHp > 0 ? (hp / maxHp) * 100 : 0;
  const barColor = hpPercentage > 50 ? "bg-green-500" : hpPercentage > 25 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="flex flex-col gap-6 p-2">
      {/* HP Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center p-3 bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
           <Heart className="absolute -right-2 -top-2 w-10 h-10 text-red-500 opacity-5 rotate-12 group-hover:scale-110 transition-transform" />
           <span className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Current</span>
           <input
            type="number"
            value={hpInput}
            onChange={handleHpChange}
            className="w-full bg-transparent text-2xl font-black text-center text-blue-600 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none relative z-10"
          />
        </div>

        <div className="flex flex-col items-center p-3 bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
           <Activity className="absolute -right-2 -top-2 w-10 h-10 text-gray-400 opacity-5 rotate-12 group-hover:scale-110 transition-transform" />
           <span className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Max HP</span>
           <input
            type="number"
            value={maxHpInput}
            onChange={handleMaxHpChange}
            className="w-full bg-transparent text-2xl font-black text-center text-gray-700 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none relative z-10"
          />
        </div>

        <div className="flex flex-col items-center p-3 bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
           <Shield className="absolute -right-2 -top-2 w-10 h-10 text-blue-500 opacity-5 rotate-12 group-hover:scale-110 transition-transform" />
           <span className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Temp HP</span>
           <input
            type="number"
            value={tempHpInput}
            onChange={handleTempHpChange}
            className="w-full bg-transparent text-2xl font-black text-center text-sky-600 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none relative z-10"
          />
        </div>
      </div>

      {/* Visual HP Bar */}
      <div className="space-y-1.5">
        <div className="h-4 w-full bg-gray-100 rounded-full border border-gray-200 p-0.5 flex items-center overflow-hidden shadow-inner">
          <div 
            className={cn("h-full rounded-full transition-all duration-700 ease-out flex items-center justify-center shadow-sm", barColor)}
            style={{ width: `${Math.min(100, hpPercentage)}%` }}
          >
            {hpPercentage > 30 && <span className="text-[11px] font-black text-white drop-shadow-sm">{Math.round(hpPercentage)}%</span>}
          </div>
        </div>
        {tempHp > 0 && (
          <div className="h-1.5 w-full bg-blue-50 rounded-full overflow-hidden border border-blue-100/50">
            <div className="h-full bg-blue-400 w-full animate-pulse transition-all duration-500"></div>
          </div>
        )}
      </div>

      {/* Damage / Heal Controls */}
      <div className="flex items-center gap-3 p-1.5 bg-gray-50 rounded-xl border border-gray-200 shadow-inner">
        <Button
          onClick={() => handleAction("damage")}
          variant="danger"
          className="w-12 h-12 p-0 flex-shrink-0 rounded-lg"
          title="Apply Damage"
        >
          <Minus className="w-6 h-6" />
        </Button>
        
        <div className="flex-1 flex flex-col items-center">
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Adjustment</span>
          <input
            type="number"
            value={hpDiff || ""}
            onChange={(e) => setHpDiff(Math.max(0, parseInt(e.target.value) || 0))}
            placeholder="0"
            className="w-full bg-transparent text-xl font-black text-center focus:outline-none placeholder:text-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        <Button
          onClick={() => handleAction("heal")}
          variant="success"
          className="w-12 h-12 p-0 flex-shrink-0 rounded-lg"
          title="Apply Healing"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Hit Dice */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-[0.2em] px-1">
          <Dna className="w-3.5 h-3.5" />
          <span>Hit Dice Management</span>
          <div className="flex-1 h-px bg-gray-100"></div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {classes.map((cls, index) => {
            const available = cls.level - (cls.usedHitDice || 0);
            const sides = classHitDice[cls.name.toLowerCase()] || 8;
            return (
              <div key={index} className="flex items-center justify-between bg-white px-3 py-2.5 rounded-xl border border-gray-100 shadow-sm transition-all hover:border-blue-200 group">
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-gray-400 uppercase tracking-tight leading-none">{cls.name}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-sm font-black text-gray-700">d{sides}</span>
                    <span className="text-[11px] font-bold text-gray-400">Dice</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                    <input
                      type="number"
                      value={available}
                      onChange={(e) => handleHitDiceChange(index, parseInt(e.target.value) || 0)}
                      min={0}
                      max={cls.level}
                      className="w-5 text-sm font-black text-blue-600 bg-transparent text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-xs font-black text-gray-300">/ {cls.level}</span>
                  </div>

                  <Button
                    onClick={() => handleRollHitDice(index)}
                    disabled={available <= 0}
                    variant="primary"
                    className="text-xs font-black uppercase px-3 py-1.5 h-auto rounded-lg shadow-sm tracking-widest"
                    title="Roll Hit Die to Heal"
                  >
                    Roll
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HPSection;
