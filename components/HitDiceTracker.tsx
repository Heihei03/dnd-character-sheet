"use client";

import React from "react";
import { Heart } from "lucide-react";

// UI Components
import { Card, CardContent } from "./ui/card";
import Button from "./ui/button";
import NumericInput from "./ui/NumericInput";

// Types
import { CharacterClass, AbilityScores, RollDiceFunc } from "../types/character";

// Utils
import { classHitDice } from "../utils/constants";

interface HitDiceTrackerProps {
    classes: CharacterClass[];
    abilityScores: AbilityScores;
    onUpdateClasses: (classes: CharacterClass[]) => void;
    rollDice?: RollDiceFunc;
}

const HitDiceTracker: React.FC<HitDiceTrackerProps> = ({
    classes,
    abilityScores,
    onUpdateClasses,
    rollDice
}) => {
    const getModifier = (score: number) => Math.floor((score - 10) / 2);

    const handleRollHitDice = (index: number) => {
        const cls = classes[index];
        const available = cls.level - (cls.usedHitDice || 0);

        if (available <= 0) return;

        const sides = classHitDice[cls.name.toLowerCase()] || 8;
        const conMod = getModifier(abilityScores.constitution);
        
        // Let the actual rolling be handled by the parent or a global dice roller if provided
        // But we still need to update the state
        const updatedClasses = [...classes];
        updatedClasses[index] = {
            ...cls,
            usedHitDice: (cls.usedHitDice || 0) + 1
        };
        onUpdateClasses(updatedClasses);

        rollDice?.(sides, 1, conMod, `Hit Die (${cls.name})`);
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

    return (
        <Card className="overflow-hidden border-border shadow-sm">
            <div className="p-4 bg-secondary/30 border-b border-border flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <div className="w-2 h-5 bg-red-500 rounded-full" />
                    Hit Dice
                </h3>
            </div>
            <CardContent className="p-4 bg-background/50">
                <div className="grid grid-cols-1 gap-2">
                    {classes.map((cls, index) => {
                        const available = cls.level - (cls.usedHitDice || 0);
                        const sides = classHitDice[cls.name.toLowerCase()] || 8;
                        return (
                            <div key={index} className="flex items-center justify-between bg-card px-3 py-2.5 rounded-xl border border-border shadow-sm transition-all hover:border-primary/30 group">
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-tight leading-none">{cls.name}</span>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-sm font-black text-gray-700 dark:text-gray-300">d{sides}</span>
                                        <span className="text-[11px] font-bold text-gray-400">Dice</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center bg-background rounded-lg border border-border overflow-hidden">
                                        <NumericInput
                                            value={available}
                                            onChange={(val) => handleHitDiceChange(index, val)}
                                            variant="horizontal"
                                            min={0}
                                            max={cls.level}
                                            className="border-none shadow-none w-20"
                                            inputClassName="text-sm font-black text-primary p-0 h-8"
                                            showArrows="none"
                                        />
                                        <span className="text-xs font-black text-gray-300 pr-2">/ {cls.level}</span>
                                    </div>

                                    <Button
                                        onClick={() => handleRollHitDice(index)}
                                        disabled={available <= 0}
                                        variant="primary"
                                        className="text-[10px] font-black uppercase px-3 py-1.5 h-8 rounded-lg shadow-sm tracking-widest"
                                        title="Roll Hit Die to Heal"
                                    >
                                        Roll
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                    {classes.length === 0 && (
                        <div className="py-4 text-center text-muted-foreground italic text-sm">
                            No classes defined.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default HitDiceTracker;
