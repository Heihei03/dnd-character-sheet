// components/DiceRoller.tsx
"use client";

import { useState } from "react";
import Button from "./ui/button";
import { Dices, History, ChevronLeft, Play } from "lucide-react";
import NumericInput from "./ui/NumericInput";

interface DiceRollerProps {
  rollResult: string | null;
  rollDice: (sides: number, count: number) => void;
  onToggleHistory: () => void;
  globalRollMode: 'normal' | 'advantage' | 'disadvantage';
  setGlobalRollMode: (mode: 'normal' | 'advantage' | 'disadvantage') => void;
}

const DiceRoller = ({ rollResult, rollDice, onToggleHistory, globalRollMode, setGlobalRollMode }: DiceRollerProps) => {
  const [selectedDie, setSelectedDie] = useState<number | null>(null);
  const [diceCount, setDiceCount] = useState<number>(1);

  const handleRoll = () => {
    if (selectedDie) {
      rollDice(selectedDie, diceCount);
      setSelectedDie(null);
      setDiceCount(1);
    }
  };

  const quickCounts = [1, 2, 3, 4, 6, 8, 10, 12];

  return (
    <div className="fixed left-0 top-1/4 p-4 w-44 bg-gray-900/95 dark:bg-black/90 backdrop-blur-md text-white shadow-2xl rounded-r-2xl space-y-4 z-50 border border-white/10 transition-all overflow-hidden">
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
        <span className="text-[11px] font-black uppercase tracking-widest text-center">Roll History</span>
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

      <div className="relative min-h-[140px]">
        {!selectedDie ? (
          <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
            {[4, 6, 8, 10, 12, 20].map(sides => (
              <button
                key={sides}
                onClick={() => setSelectedDie(sides)}
                className="py-2.5 text-xs font-bold bg-white/5 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all border border-white/10 active:scale-95 flex items-center justify-center gap-1"
              >
                d{sides}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
            <button
              onClick={() => setSelectedDie(null)}
              className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-gray-400 hover:text-white transition-colors mb-1 group"
            >
              <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Back
            </button>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Amount</span>
                <span className="text-xs font-black text-white bg-primary/20 px-2 py-0.5 rounded-full border border-primary/30">d{selectedDie}</span>
              </div>
              <NumericInput
                value={diceCount}
                onChange={setDiceCount}
                min={1}
                max={99}
                variant="horizontal"
                className="bg-black/40 border-white/10"
                inputClassName="text-sm py-1.5"
              />
            </div>

            <div className="grid grid-cols-4 gap-1">
              {quickCounts.slice(0, 8).map(c => (
                <button
                  key={c}
                  onClick={() => setDiceCount(c)}
                  className={`py-1 text-[9px] font-bold rounded border transition-all ${diceCount === c ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/20'}`}
                >
                  {c}
                </button>
              ))}
            </div>

            <button
              onClick={handleRoll}
              className="w-full py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Play size={12} fill="currentColor" /> Roll
            </button>
          </div>
        )}
      </div>

      {rollResult && !selectedDie && (
        <div className="p-3 bg-black/40 rounded-lg border-2 border-primary/20 animate-in fade-in zoom-in-95 duration-200">
          <p className="text-center text-[10px] font-black text-primary leading-tight uppercase tracking-tight">{rollResult}</p>
        </div>
      )}
    </div>
  );
};

export default DiceRoller;
