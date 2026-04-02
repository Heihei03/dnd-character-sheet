"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import SettingsButton from "./ui/SettingsButton";
import { Initiative, Character, RollDiceFunc } from "../types/character";
import { getAdvantageDisadvantage } from "../utils/character-utils";

interface InitiativeSectionProps {
    character: Character;
    dexModifier: number;
    proficiencyBonus: number;
    onUpdate: (initiative: Initiative) => void;
    rollDice?: RollDiceFunc;
    dexScore: number;
}

const InitiativeSection: React.FC<InitiativeSectionProps> = ({
    character,
    dexModifier,
    proficiencyBonus,
    onUpdate,
    rollDice,
    dexScore,
}) => {
    const [showSettings, setShowSettings] = useState(false);
    const initiative = character.initiative || {
        miscBonus: 0,
        useJackOfAllTrades: false,
        showDexTiebreaker: false,
    };

    const jackOfAllTradesBonus = initiative.useJackOfAllTrades ? Math.floor(proficiencyBonus / 2) : 0;
    const totalModifier = dexModifier + jackOfAllTradesBonus + initiative.miscBonus;

    const tiebreakerValue = initiative.showDexTiebreaker ? dexScore / 100 : 0;
    const displayModifier = totalModifier + tiebreakerValue;

    const { advantage, disadvantage, extraAdvantage } = getAdvantageDisadvantage(character, "Initiative", "dexterity");

    const handleRoll = () => {
        rollDice?.(20, totalModifier, "Initiative", undefined, undefined, undefined, undefined, undefined, advantage, disadvantage, extraAdvantage);
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
                    showSettings ? 'bg-blue-100 text-blue-600' : ''
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
                    className="min-w-24 h-24 px-4 flex items-center justify-center border-4 border-blue-500 rounded-xl cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group shadow-sm bg-white dark:bg-gray-950 active:scale-95"
                >
                    <span className="text-4xl font-black text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                        {displayModifier >= 0 ? "+" : ""}{displayModifier}
                    </span>
                </div>
            </div>

            {/* Settings Overlay - Absolute positioned to avoid shifting items below */}
            {showSettings && (
                <div className="absolute top-10 right-0 z-50 w-64 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center justify-between border-b dark:border-gray-800 pb-2 mb-2">
                        <span className="font-bold text-gray-700 dark:text-gray-300">Settings</span>
                        <button
                            onClick={() => setShowSettings(false)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Misc Bonus</span>
                            <input
                                type="number"
                                value={initiative.miscBonus}
                                onChange={(e) => handleMiscChange(e.target.value)}
                                className="w-16 p-1 border border-gray-300 dark:border-gray-700 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500 bg-transparent dark:text-gray-200"
                            />
                        </div>

                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200">Jack of All Trades</span>
                            <input
                                type="checkbox"
                                checked={initiative.useJackOfAllTrades}
                                onChange={handleToggleJack}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                        </label>

                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200">Dex Tiebreaker</span>
                            <input
                                type="checkbox"
                                checked={initiative.showDexTiebreaker}
                                onChange={handleToggleTiebreaker}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InitiativeSection;
