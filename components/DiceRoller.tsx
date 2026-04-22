// components/DiceRoller.tsx
"use client";

import Button from "./ui/button";
import { Dices, History } from "lucide-react";

interface DiceRollerProps {
  rollResult: string | null;
  rollDice: (sides: number) => void;
  onToggleHistory: () => void;
  globalRollMode: 'normal' | 'advantage' | 'disadvantage';
  setGlobalRollMode: (mode: 'normal' | 'advantage' | 'disadvantage') => void;
}

const DiceRoller = ({ rollResult, rollDice, onToggleHistory, globalRollMode, setGlobalRollMode }: DiceRollerProps) => (
  <div className="fixed left-0 top-1/4 p-4 w-44 bg-gray-900/95 dark:bg-black/90 backdrop-blur-md text-white shadow-2xl rounded-r-2xl space-y-4 z-50 border border-white/10 transition-all">
    <div className="flex justify-between items-center px-1">
      <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-2 text-primary">
        <Dices className="w-6 h-6" /> Dice
      </h2>
    </div>

    <button 
        onClick={onToggleHistory}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-primary/20 text-gray-300 hover:text-primary rounded-xl border border-white/10 transition-all group active:scale-[0.98] shadow-sm"
    >
        <History className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span className="text-[11px] font-black uppercase tracking-widest">Roll History</span>
    </button>

    <div className="flex flex-col gap-1.5 p-1 bg-black/30 rounded-xl border border-white/5">
        <button 
            onClick={() => setGlobalRollMode('advantage')}
            className={`py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${globalRollMode === 'advantage' ? 'bg-green-600 text-white shadow-lg shadow-green-900/40 border-green-400' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
        >
            Advantage
        </button>
        <button 
            onClick={() => setGlobalRollMode('normal')}
            className={`py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${globalRollMode === 'normal' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 border-primary/30' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
        >
            Normal
        </button>
        <button 
            onClick={() => setGlobalRollMode('disadvantage')}
            className={`py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${globalRollMode === 'disadvantage' ? 'bg-red-600 text-white shadow-lg shadow-red-900/40 border-red-400' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
        >
            Disadvantage
        </button>
    </div>

    <div className="grid grid-cols-2 gap-2">
      {[4, 6, 8, 10, 12, 20].map(sides => (
        <button 
          key={sides}
          onClick={() => rollDice(sides)} 
          className="py-2 text-xs font-bold bg-white/5 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all border border-white/10 active:scale-95"
        >
          d{sides}
        </button>
      ))}
    </div>
    {rollResult && (
      <div className="p-3 bg-black/40 rounded-lg border-2 border-primary/20 animate-in fade-in zoom-in-95 duration-200">
        <p className="text-center text-xs font-bold text-primary leading-tight">{rollResult}</p>
      </div>
    )}
  </div>
);


export default DiceRoller;
