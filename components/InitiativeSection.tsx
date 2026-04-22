"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import SettingsButton from "./ui/SettingsButton";
import NumericInput from "./ui/NumericInput";
import ActiveBonusesList from "./ActiveBonusesList";
import { Initiative, Character, RollDiceFunc, ActiveBonus } from "../types/character";
import { getAdvantageDisadvantage, getEffectiveBonuses } from "../utils/character-utils";
import ModalScrollLock from "./ui/ModalScrollLock";

interface InitiativeSectionProps {
    character: Character;
    dexModifier: number;
    proficiencyBonus: number;
    onUpdate: (initiative: Initiative) => void;
    rollDice?: RollDiceFunc;
    dexScore: number;
    onUpdateActiveBonuses: (bonuses: ActiveBonus[]) => void;
}

const InitiativeSection: React.FC<InitiativeSectionProps> = ({
    character,
    dexModifier,
    proficiencyBonus,
    onUpdate,
    rollDice,
    dexScore,
    onUpdateActiveBonuses,
}) => {
    const [showSettings, setShowSettings] = useState(false);
    const initiative = character.initiative || {
        miscBonus: 0,
        useJackOfAllTrades: false,
        showDexTiebreaker: false,
    };

    const jackOfAllTradesBonus = initiative.useJackOfAllTrades ? Math.floor(proficiencyBonus / 2) : 0;
    
    // Calculate effective bonuses
    const activeBonuses = getEffectiveBonuses(character, 'Initiative');
    let bonusModifier = 0;
    activeBonuses.forEach(b => {
        const val = parseInt(b.bonus);
        if (!isNaN(val) && !b.bonus.includes('d')) {
            bonusModifier += val;
        }
    });

    const totalModifier = dexModifier + jackOfAllTradesBonus + initiative.miscBonus + bonusModifier;

    const tiebreakerValue = initiative.showDexTiebreaker ? dexScore / 100 : 0;
    const displayModifier = totalModifier + tiebreakerValue;

    const { advantage, disadvantage, extraAdvantage } = getAdvantageDisadvantage(character, "Initiative", "dexterity");

    const handleRoll = () => {
        rollDice?.(20, totalModifier, "Initiative", undefined, undefined, undefined, undefined, undefined, advantage, disadvantage, extraAdvantage, 'initiative');
    };

    const handleMiscChange = (val: string) => {
        const num = parseInt(val) || 0;
        onUpdate({ ...initiative, miscBonus: num });
    };

    const handleToggleJack = () => {
        onUpdate({ ...initiative, useJackOfAllTrades: !initiative.useJackOfAllTrades });
    };

    const handleToggleTiebreaker = () => {
        onUpdate({ ...initiative, showDexTiebreaker: !initiative.showDexTiebreaker });
    };

    return (
        <div className="relative p-2">
            {/* Settings Toggle Button */}
            <SettingsButton
                onClick={() => setShowSettings(!showSettings)}
                className={cn(
                    "absolute top-0 right-0 z-20",
                    showSettings ? 'bg-primary/10 text-primary' : ''
                )}
                title="Settings"
            />

            {/* Header */}
            <div className="flex flex-col items-center mb-4">
                <h2 className="text-2xl font-bold text-center">Initiative</h2>
                <div className="flex gap-1 mt-1">
                    {advantage && (
                        <span className="text-xs font-black bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded border border-green-200 dark:border-green-800 uppercase" title="Advantage">ADVANTAGE{extraAdvantage > 0 ? `+${extraAdvantage}` : ''}</span>
                    )}
                    {disadvantage && (
                        <span className="text-xs font-black bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800 uppercase" title="Disadvantage">DISADVANTAGE</span>
                    )}
                </div>
            </div>

            {/* Main Die View */}
            <div className="flex flex-col items-center">
                <div
                    onClick={handleRoll}
                    className="min-w-24 h-24 px-4 flex items-center justify-center border-4 border-primary rounded-xl cursor-pointer hover:bg-primary/5 transition-all group shadow-sm bg-card active:scale-95"
                >
                    <span className="text-4xl font-black text-primary group-hover:scale-110 transition-transform">
                        {displayModifier >= 0 ? "+" : ""}{displayModifier}
                    </span>
                </div>
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <ModalScrollLock isOpen={showSettings} />
                    <div className="bg-background w-full max-w-lg rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-secondary/30">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-wider text-foreground">Initiative</h2>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Tactical Settings</p>
                            </div>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-xl border border-border">
                                <span className="text-sm font-bold uppercase tracking-tight text-foreground">Misc Bonus</span>
                                <NumericInput
                                    value={initiative.miscBonus}
                                    onChange={(val) => onUpdate({ ...initiative, miscBonus: val })}
                                    variant="horizontal"
                                    className="w-24"
                                    inputClassName="text-center font-black text-base p-3"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center justify-between p-4 bg-secondary/10 rounded-xl border border-border/50 cursor-pointer group transition-all hover:bg-secondary/20">
                                    <span className="text-sm font-bold uppercase tracking-tight text-muted-foreground group-hover:text-foreground">Jack of All Trades</span>
                                    <input
                                        type="checkbox"
                                        checked={initiative.useJackOfAllTrades}
                                        onChange={handleToggleJack}
                                        className="w-5 h-5 text-primary rounded-lg focus:ring-primary accent-primary cursor-pointer"
                                    />
                                </label>

                                <label className="flex items-center justify-between p-4 bg-secondary/10 rounded-xl border border-border/50 cursor-pointer group transition-all hover:bg-secondary/20">
                                    <span className="text-sm font-bold uppercase tracking-tight text-muted-foreground group-hover:text-foreground">Dex Tiebreaker</span>
                                    <input
                                        type="checkbox"
                                        checked={initiative.showDexTiebreaker}
                                        onChange={handleToggleTiebreaker}
                                        className="w-5 h-5 text-primary rounded-lg focus:ring-primary accent-primary cursor-pointer"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-secondary/30 border-t border-border flex justify-end">
                            <button
                                onClick={() => setShowSettings(false)}
                                className="px-10 py-3 bg-primary text-primary-foreground text-sm font-black uppercase tracking-[0.2em] rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ActiveBonusesList 
                bonuses={character.activeBonuses || []}
                onUpdateBonuses={onUpdateActiveBonuses}
                target="initiative"
                title="Initiative Bonuses"
                compact={true}
            />
        </div>
    );
};

export default InitiativeSection;
