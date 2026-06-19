"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Coffee, Moon, Dices, Heart, Shield, Sparkles } from "lucide-react";

// UI Components
import { Card, CardContent } from "./ui/card";
import Button from "./ui/button";

// Types
import { NormalizedCharacter, CharacterClass, RollDiceFunc } from "../types/character";

// Utils
import { classHitDice } from "../utils/constants";

interface RestModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: NormalizedCharacter;
  rollDice: RollDiceFunc;
  handleAdjustHP: (amount: number, isDamage: boolean) => void;
  handleClassChange: (index: number, field: keyof CharacterClass, value: any) => void;
  handleShortRestComplete: () => void;
  handleLongRest: () => void;
}

const RestModal: React.FC<RestModalProps> = ({
  isOpen,
  onClose,
  character,
  rollDice,
  handleAdjustHP,
  handleClassChange,
  handleShortRestComplete,
  handleLongRest,
}) => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"short" | "long">("short");
  const [rollFeedback, setRollFeedback] = useState<{ [classIndex: number]: string }>({});

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const getConModifier = () => {
    const con = character.abilityScores.constitution ?? 10;
    return Math.floor((con - 10) / 2);
  };

  const conModifier = getConModifier();

  // Spend hit die for a specific class
  const handleRollHitDie = (cls: CharacterClass, index: number) => {
    const available = cls.level - (cls.usedHitDice || 0);
    if (available <= 0 || character.hp >= character.maxHp) return;

    const sides = classHitDice[cls.name.toLowerCase()] || 8;
    const dieRoll = Math.floor(Math.random() * sides) + 1;
    const totalHealed = Math.max(0, dieRoll + conModifier);

    // Apply the healing to the character sheet immediately
    handleAdjustHP(totalHealed, false);

    // Record the used hit die in the sheet immediately
    handleClassChange(index, "usedHitDice", (cls.usedHitDice || 0) + 1);

    // Trigger the official dice roller so the roll is printed in the Chat/History
    rollDice(sides, 1, conModifier, `Hit Die (${cls.name})`, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, "healing");

    // Display localized feedback in the modal
    setRollFeedback((prev) => ({
      ...prev,
      [index]: `Rolled a d${sides}: ${dieRoll} + ${conModifier >= 0 ? "+" : ""}${conModifier} (Con) = ${totalHealed} HP!`,
    }));
  };

  // Perform Short Rest Complete actions
  const triggerShortRest = () => {
    handleShortRestComplete();
    onClose();
  };

  // Perform Long Rest actions
  const triggerLongRest = () => {
    handleLongRest();
    onClose();
  };

  // Calculate total class level and hit dice to recover on a long rest (half of total level, min 1)
  const totalLevel = character.classes.reduce((sum, cls) => sum + cls.level, 0);
  const hitDiceToRecover = Math.max(1, Math.floor(totalLevel / 2));

  // Determine resources that will recover on Short Rest
  const shortRestResources = character.resources.filter(
    (r) => r.regain === "Short Rest" || r.regain === "Short or Long Rest"
  );

  // Determine resources that will recover on Long Rest
  const longRestResources = character.resources.filter(
    (r) =>
      r.regain === "Short Rest" ||
      r.regain === "Long Rest" ||
      r.regain === "Short or Long Rest" ||
      r.regain === "Dawn"
  );

  const hpPercentage = character.maxHp > 0 ? (character.hp / character.maxHp) * 100 : 0;
  const barColor = hpPercentage > 50 ? "bg-green-500" : hpPercentage > 25 ? "bg-amber-500" : "bg-red-500";

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-background md:bg-black/50 md:backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full h-full md:h-auto max-w-2xl shadow-none md:shadow-2xl border-0 md:border border-border rounded-none md:rounded-2xl overflow-hidden animate-in md:zoom-in-95 duration-200 flex flex-col md:max-h-[90vh]">
        <CardContent className="p-0 h-full flex flex-col justify-between overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-secondary/30 shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="text-primary w-5 h-5 animate-pulse" />
              <h2 className="text-xl font-black uppercase tracking-wider text-foreground">Rest Character</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground active:scale-95"
            >
              <X size={20} />
            </button>
          </div>

          {/* Rest Mode Tabs */}
          <div className="flex border-b border-border shrink-0 bg-secondary/10">
            <button
              onClick={() => setActiveTab("short")}
              className={`flex-1 py-3.5 px-6 font-black uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === "short"
                  ? "border-primary text-primary bg-background/50"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/20"
              }`}
            >
              <Coffee size={16} />
              Short Rest
            </button>
            <button
              onClick={() => setActiveTab("long")}
              className={`flex-1 py-3.5 px-6 font-black uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === "long"
                  ? "border-primary text-primary bg-background/50"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/20"
              }`}
            >
              <Moon size={16} />
              Long Rest
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {activeTab === "short" ? (
              <div className="space-y-6">
                <div className="bg-secondary/20 border border-border p-4 rounded-xl">
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                    A <strong>Short Rest</strong> is a period of downtime (at least 1 hour). 
                    You can spend one or more Hit Dice to regain HP. Resources and Pact Magic slots 
                    regained on a short rest will be restored.
                  </p>
                </div>

                {/* HP Status Display */}
                <div className="space-y-2 bg-card border border-border p-4 rounded-xl shadow-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Heart size={14} className="text-red-500" /> Current Hit Points
                    </span>
                    <span className="text-lg font-black tracking-tight">
                      {character.hp} <span className="text-muted-foreground font-bold">/ {character.maxHp} HP</span>
                    </span>
                  </div>
                  <div className="h-3 w-full bg-secondary rounded-full overflow-hidden border border-border/60 p-0.5 shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${Math.min(100, hpPercentage)}%` }}
                    />
                  </div>
                </div>

                {/* Hit Dice List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Available Hit Dice (Con Mod: {conModifier >= 0 ? "+" : ""}{conModifier})
                  </h3>
                  <div className="grid grid-cols-1 gap-2.5">
                    {character.classes.map((cls, index) => {
                      const maxDice = cls.level;
                      const available = maxDice - (cls.usedHitDice || 0);
                      const sides = classHitDice[cls.name.toLowerCase()] || 8;
                      const isFull = character.hp >= character.maxHp;

                      return (
                        <div
                          key={index}
                          className="flex flex-col bg-card border border-border rounded-xl p-3.5 shadow-xs transition-all hover:border-border/80"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs font-black text-gray-400 uppercase tracking-wider block">
                                {cls.name}
                              </span>
                              <span className="text-sm font-black text-foreground">
                                d{sides} <span className="text-xs text-muted-foreground font-bold">({available} left)</span>
                              </span>
                            </div>
                            <Button
                              onClick={() => handleRollHitDie(cls, index)}
                              disabled={available <= 0 || isFull}
                              variant={isFull ? "ghost" : "primary"}
                              className="text-xs font-black uppercase px-4 py-2 h-9 rounded-lg flex items-center gap-1.5 tracking-wider active:scale-95 transition-all shadow-sm"
                            >
                              <Dices size={14} />
                              {isFull ? "HP Full" : "Spend Die"}
                            </Button>
                          </div>
                          {rollFeedback[index] && (
                            <div className="mt-2.5 text-xs font-black text-primary bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/10 animate-in fade-in slide-in-from-top-1">
                              {rollFeedback[index]}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Short Rest Resources Regained summary */}
                {shortRestResources.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                      Resources to regain:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {shortRestResources.map((res) => (
                        <span
                          key={res.id}
                          className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20"
                        >
                          {res.name} (Max {res.max})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-secondary/20 border border-border p-4 rounded-xl">
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                    A <strong>Long Rest</strong> is a period of extended downtime (at least 8 hours). 
                    Taking a long rest completely restores your health and sets you up fresh for the day.
                  </p>
                </div>

                {/* Long Rest Benefits Summary Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-card border border-border p-4 rounded-xl flex items-start gap-3 shadow-xs">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 flex items-center justify-center shrink-0">
                      <Heart size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Hit Points</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Fully restore HP to {character.maxHp}. Temporary HP is cleared.</p>
                    </div>
                  </div>

                  <div className="bg-card border border-border p-4 rounded-xl flex items-start gap-3 shadow-xs">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                      <Dices size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Hit Dice</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Regain up to <strong>{hitDiceToRecover}</strong> spent Hit Dice.</p>
                    </div>
                  </div>

                  <div className="bg-card border border-border p-4 rounded-xl flex items-start gap-3 shadow-xs">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                      <Shield size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Death Saves</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Successes and Failures will be reset to 0.</p>
                    </div>
                  </div>

                  <div className="bg-card border border-border p-4 rounded-xl flex items-start gap-3 shadow-xs">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Spell Slots & Resources</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">All spent spell slots and class features fully recover.</p>
                    </div>
                  </div>
                </div>

                {/* Long Rest Resources regain details */}
                {longRestResources.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                      Feature Resources to fully restore:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {longRestResources.map((res) => (
                        <span
                          key={res.id}
                          className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20"
                        >
                          {res.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="px-6 py-4 bg-secondary/30 border-t border-border flex justify-end gap-3 shrink-0">
            <Button
              variant="ghost"
              onClick={onClose}
              className="border border-border font-bold text-sm px-6 py-2.5 active:scale-95"
            >
              Cancel
            </Button>
            {activeTab === "short" ? (
              <Button
                variant="primary"
                onClick={triggerShortRest}
                className="font-black text-sm uppercase tracking-widest shadow-md shadow-primary/20 px-8 py-2.5 active:scale-95"
              >
                Complete Short Rest
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={triggerLongRest}
                className="font-black text-sm uppercase tracking-widest shadow-md shadow-primary/20 px-8 py-2.5 active:scale-95"
              >
                Take Long Rest
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default RestModal;
