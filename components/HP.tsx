"use client";

import { useState, useEffect } from "react";
import Button from "./ui/button";
import NumericInput from "./ui/NumericInput";
import HitDiceTracker from "./HitDiceTracker";
import { CharacterClass, AbilityScores, RollDiceFunc } from "../types/character";
import { classHitDice } from "../utils/constants";
import { Plus, Minus, Heart, Shield, Activity } from "lucide-react";
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
  rollDice?: RollDiceFunc;
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

  const handleMaxHpChange = (value: number) => {
    setMaxHpInput(String(value));
    setMaxHp(value);
  };

  const handleHpChange = (value: number) => {
    setHpInput(String(value));
    setHp(value);
  };

  const handleTempHpChange = (value: number) => {
    setTempHpInput(String(value));
    setTempHp(value);
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
        <div className="flex flex-col items-center p-3 bg-card rounded-xl border border-border shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
           <Heart className="absolute -right-2 -top-2 w-10 h-10 text-red-500 opacity-5 rotate-12 group-hover:scale-110 transition-transform" />
           <span className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Current</span>
           <NumericInput
            value={hpInput}
            onChange={handleHpChange}
            onInputChange={(e) => setHpInput(e.target.value)}
            className="border-none bg-transparent shadow-none focus-within:ring-0 w-full"
            inputClassName="text-xl font-black text-center text-primary p-0 h-auto"
            showArrows="none"
          />
        </div>

        <div className="flex flex-col items-center p-3 bg-card rounded-xl border border-border shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
           <Activity className="absolute -right-2 -top-2 w-10 h-10 text-gray-400 opacity-5 rotate-12 group-hover:scale-110 transition-transform" />
           <span className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Max HP</span>
           <NumericInput
            value={maxHpInput}
            onChange={handleMaxHpChange}
            onInputChange={(e) => setMaxHpInput(e.target.value)}
            className="border-none bg-transparent shadow-none focus-within:ring-0 w-full"
            inputClassName="text-xl font-black text-center text-gray-700 dark:text-gray-200 p-0 h-auto"
            showArrows="none"
          />
        </div>

        <div className="flex flex-col items-center p-3 bg-card rounded-xl border border-border shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
            <Shield className="absolute -right-2 -top-2 w-10 h-10 text-primary opacity-5 rotate-12 group-hover:scale-110 transition-transform" />
           <span className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Temp HP</span>
           <NumericInput
            value={tempHpInput}
            onChange={handleTempHpChange}
            onInputChange={(e) => setTempHpInput(e.target.value)}
            className="border-none bg-transparent shadow-none focus-within:ring-0 w-full"
            inputClassName="text-xl font-black text-center text-primary/80 p-0 h-auto"
            showArrows="none"
          />
        </div>
      </div>

      {/* Visual HP Bar */}
      <div className="space-y-1.5">
        <div className="h-4 w-full bg-gray-100 dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-800 p-0.5 flex items-center overflow-hidden shadow-inner">
          <div 
            className={cn("h-full rounded-full transition-all duration-700 ease-out flex items-center justify-center shadow-sm", barColor)}
            style={{ width: `${Math.min(100, hpPercentage)}%` }}
          >
            {hpPercentage > 30 && <span className="text-[11px] font-black text-white drop-shadow-sm">{Math.round(hpPercentage)}%</span>}
          </div>
        </div>
        {tempHp > 0 && (
          <div className="h-1.5 w-full bg-primary/5 rounded-full overflow-hidden border border-primary/10">
            <div className="h-full bg-primary/40 w-full animate-pulse transition-all duration-500"></div>
          </div>
        )}
      </div>

      {/* Damage / Heal Controls */}
      <div className="flex items-center gap-4 px-3 p-1.5 bg-secondary rounded-xl border border-border shadow-inner">
        <Button
          onClick={() => handleAction("damage")}
          variant="danger"
          className="w-12 h-12 p-0 flex-shrink-0 rounded-lg shadow-sm"
          title="Apply Damage"
        >
          <Minus className="w-6 h-6" />
        </Button>
        
        <div className="flex-1 flex flex-col items-center min-w-0">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Adjustment</span>
           <NumericInput
            value={hpDiff}
            onChange={(val) => setHpDiff(Math.max(0, val))}
            variant="vertical"
            className="border-none bg-transparent shadow-none focus-within:ring-0 w-full"
            inputClassName="text-xl font-black text-center text-gray-900 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-700"
            placeholder="0"
          />
        </div>

        <Button
          onClick={() => handleAction("heal")}
          variant="success"
          className="w-12 h-12 p-0 flex-shrink-0 rounded-lg shadow-sm"
          title="Apply Healing"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Hit Dice */}
      <HitDiceTracker 
        classes={classes}
        abilityScores={abilityScores}
        onUpdateClasses={onUpdateClasses}
        rollDice={rollDice}
      />
    </div>
  );
};

export default HPSection;
