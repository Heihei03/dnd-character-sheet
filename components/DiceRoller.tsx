// components/DiceRoller.tsx
"use client";

import { useState, useEffect } from "react";
import Button from "./ui/button";
import { Dices, History, ChevronLeft, Play, X } from "lucide-react";
import NumericInput from "./ui/NumericInput";
import ModalScrollLock from "./ui/ModalScrollLock";

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
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [lastSeenResult, setLastSeenResult] = useState<string | null>(null);

  useEffect(() => {
    if (rollResult) {
      if (rollResult !== lastSeenResult) {
        if (isMobileOpen) {
          setLastSeenResult(rollResult);
          setShowNotification(false);
        } else {
          setShowNotification(true);
        }
      } else if (isMobileOpen) {
        setShowNotification(false);
      }
    } else {
      setShowNotification(false);
    }
  }, [rollResult, isMobileOpen, lastSeenResult]);

  // Swipe-to-dismiss states
  const [startY, setStartY] = useState<number | null>(null);
  const [currentY, setCurrentY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleRoll = () => {
    if (selectedDie) {
      rollDice(selectedDie, diceCount);
      setSelectedDie(null);
      setDiceCount(1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === null) return;
    const deltaY = e.touches[0].clientY - startY;
    // Only allow dragging downwards (closing direction)
    if (deltaY > 0) {
      setCurrentY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    // Dismiss sheet if dragged down more than 100px
    if (currentY > 100) {
      setIsMobileOpen(false);
    }
    setStartY(null);
    setCurrentY(0);
  };

  const quickCounts = [1, 2, 3, 4, 6, 8, 10, 12];

  return (
    <>
      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR VIEW (Hidden on Mobile)                                   */}
      {/* ========================================================================= */}
      <div className="hidden md:block fixed left-0 top-1/4 p-4 w-44 bg-gray-900/95 dark:bg-black/90 backdrop-blur-md text-white shadow-2xl rounded-r-2xl space-y-4 z-50 border border-white/10 transition-all overflow-hidden animate-in slide-in-from-left duration-300">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-2 text-primary">
            <Dices className="w-6 h-6" /> Dice
          </h2>
        </div>

        <button
          onClick={onToggleHistory}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-primary/20 text-gray-300 hover:text-primary rounded-xl border border-white/10 transition-all group active:scale-[0.98] shadow-sm cursor-pointer"
        >
          <History className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-black uppercase tracking-widest text-center">Roll History</span>
        </button>

        <div className="flex flex-col gap-1.5 p-1 bg-black/30 rounded-xl border border-white/5">
          <button
            onClick={() => setGlobalRollMode('advantage')}
            className={`py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer ${globalRollMode === 'advantage' ? 'bg-green-600 text-white shadow-lg shadow-green-900/40 border-green-400' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
          >
            Advantage
          </button>
          <button
            onClick={() => setGlobalRollMode('normal')}
            className={`py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer ${globalRollMode === 'normal' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 border-primary/30' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
          >
            Normal
          </button>
          <button
            onClick={() => setGlobalRollMode('disadvantage')}
            className={`py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer ${globalRollMode === 'disadvantage' ? 'bg-red-600 text-white shadow-lg shadow-red-900/40 border-red-400' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
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
                  className="py-2.5 text-xs font-bold bg-white/5 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all border border-white/10 active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                >
                  d{sides}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
              <button
                onClick={() => setSelectedDie(null)}
                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-gray-400 hover:text-white transition-colors mb-1 group cursor-pointer"
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
                    className={`py-1 text-[9px] font-bold rounded border transition-all cursor-pointer ${diceCount === c ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/20'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <button
                onClick={handleRoll}
                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
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

      {/* ========================================================================= */}
      {/* MOBILE FLOATING ACTION BUTTON (FAB)                                      */}
      {/* ========================================================================= */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-primary/30 border border-primary/30 flex items-center justify-center cursor-pointer z-40 group"
        title="Open Dice Roller"
      >
        <Dices className="w-6 h-6 animate-pulse group-hover:rotate-12 transition-transform duration-300" />
        {showNotification && (
          <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4.5 w-4.5 bg-red-500 text-[8px] font-black items-center justify-center text-white border border-white/20">!</span>
          </span>
        )}
      </button>

      {/* ========================================================================= */}
      {/* MOBILE BOTTOM SHEET BACKDROP AND SCROLL LOCK                              */}
      {/* ========================================================================= */}
      {isMobileOpen && (
        <>
          <ModalScrollLock isOpen={isMobileOpen} />
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          />
        </>
      )}

      {/* ========================================================================= */}
      {/* MOBILE SLIDE-UP BOTTOM SHEET                                             */}
      {/* ========================================================================= */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-gray-950 dark:bg-black text-white px-6 pb-6 pt-2 rounded-t-3xl border-t border-white/10 shadow-2xl transition-all transform"
        style={{
          transform: isMobileOpen 
            ? `translateY(${currentY}px)` 
            : 'translateY(100%)',
          opacity: isMobileOpen ? 1 : 0,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease'
        }}
      >
        {/* Swipe-gesture handle and header container */}
        <div 
          className="w-full pt-1 pb-4 cursor-grab active:cursor-grabbing select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4" />
          
          {/* Header inside Bottom Sheet */}
          <div className="flex justify-between items-center">
            <h2 className="text-base font-black uppercase tracking-wider flex items-center gap-2 text-primary">
              <Dices className="w-5 h-5 text-primary" /> Dice Roller
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onToggleHistory();
                  setIsMobileOpen(false); // Close roller to let history display clean
                }}
                className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white/5 hover:bg-primary/20 text-gray-300 hover:text-primary rounded-lg border border-white/10 transition-all text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                <History className="w-3.5 h-3.5" />
                History
              </button>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-colors border border-white/5 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Advantage Settings Toggle */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/35 rounded-xl border border-white/5 mb-5">
          {[
            { id: "advantage", label: "Advantage", activeBg: "bg-green-600 border-green-400 shadow-green-900/40" },
            { id: "normal", label: "Normal", activeBg: "bg-primary border-primary/30 shadow-primary/20" },
            { id: "disadvantage", label: "Disadvantage", activeBg: "bg-red-600 border-red-400 shadow-red-900/40" }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setGlobalRollMode(mode.id as any)}
              className={`py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all border cursor-pointer ${
                globalRollMode === mode.id
                  ? `${mode.activeBg} text-white shadow-lg`
                  : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Dice Selector Grid / Dice configuration */}
        <div className="relative min-h-[140px]">
          {!selectedDie ? (
            <div className="grid grid-cols-3 gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {[4, 6, 8, 10, 12, 20].map(sides => (
                <button
                  key={sides}
                  onClick={() => setSelectedDie(sides)}
                  className="py-3 bg-white/5 hover:bg-primary hover:text-primary-foreground rounded-xl transition-all border border-white/10 active:scale-95 flex flex-col items-center justify-center gap-1 shadow-sm cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-gray-400">d</span>
                  <span className="text-base font-black text-white">{sides}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setSelectedDie(null)}
                  className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-gray-400 hover:text-white transition-colors group cursor-pointer"
                >
                  <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Change Die
                </button>
                <span className="text-xs font-black text-white bg-primary/20 px-3 py-1 rounded-full border border-primary/30">d{selectedDie}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary block">Dice Amount</span>
                  <NumericInput
                    value={diceCount}
                    onChange={setDiceCount}
                    min={1}
                    max={99}
                    variant="horizontal"
                    className="bg-black/40 border-white/10 w-full"
                    inputClassName="text-sm py-1.5"
                  />
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {quickCounts.slice(0, 8).map(c => (
                    <button
                      key={c}
                      onClick={() => setDiceCount(c)}
                      className={`py-1.5 text-[9px] font-black rounded border transition-all cursor-pointer ${
                        diceCount === c
                          ? "bg-primary border-primary text-white"
                          : "bg-white/5 border-white/5 text-gray-400 hover:border-white/20"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  handleRoll();
                }}
                className="w-full py-3.5 bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl font-black uppercase tracking-[0.25em] text-[11px] shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play size={12} fill="currentColor" /> Roll d{selectedDie}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Results Indicator */}
        {rollResult && !selectedDie && (
          <div className="mt-4 p-3 bg-black/45 rounded-xl border border-primary/30 animate-in fade-in zoom-in-95 duration-200">
            <p className="text-center text-[10px] font-black text-primary leading-snug uppercase tracking-wider">{rollResult}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default DiceRoller;
