// components/DiceRoller.tsx
"use client";

import Button from "./ui/button";
import { Dices, History } from "lucide-react";

interface DiceRollerProps {
  rollResult: string | null;
  rollDice: (sides: number) => void;
  onToggleHistory: () => void;
}

const DiceRoller = ({ rollResult, rollDice, onToggleHistory }: DiceRollerProps) => (
  <div className="fixed left-0 top-1/5 p-4 w-48 bg-gray-800/80 backdrop-blur-sm text-white shadow-xl rounded-r-lg space-y-4 z-40 border border-gray-700/50">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Dices className="w-6 h-6" /> Dice
      </h2>
      <button 
        onClick={onToggleHistory}
        className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-blue-400"
        title="Show History"
      >
        <History className="w-5 h-5" />
      </button>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <Button onClick={() => rollDice(4)} className="py-1 px-2 text-xs">d4</Button>
      <Button onClick={() => rollDice(6)} className="py-1 px-2 text-xs">d6</Button>
      <Button onClick={() => rollDice(8)} className="py-1 px-2 text-xs">d8</Button>
      <Button onClick={() => rollDice(10)} className="py-1 px-2 text-xs">d10</Button>
      <Button onClick={() => rollDice(12)} className="py-1 px-2 text-xs">d12</Button>
      <Button onClick={() => rollDice(20)} className="py-1 px-2 text-xs font-bold text-blue-400 border-blue-400/30">d20</Button>
    </div>
    {rollResult && (
      <div className="p-2 bg-gray-900/50 rounded border border-gray-700">
        <p className="text-center text-sm font-bold text-blue-300">{rollResult}</p>
      </div>
    )}
  </div>
);


export default DiceRoller;
