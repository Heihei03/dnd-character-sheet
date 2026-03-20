"use client";

import React, { useState } from "react";
import { Settings, X } from "lucide-react";
import { Initiative, Character, CritRule } from "../types/character";
import { getAdvantageDisadvantage } from "../utils/character-utils";

interface InitiativeSectionProps {
    character: Character;
    dexModifier: number;
    proficiencyBonus: number;
    onUpdate: (initiative: Initiative) => void;
    rollDice?: (sides: number, modifier?: number, label?: string, damageFormula?: string, damageType?: string, critRange?: number, critExtraDamage?: string, critRule?: CritRule) => void;
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

    const { advantage, disadvantage } = getAdvantageDisadvantage(character, "Initiative");

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

    const handleRoll = () => {
        rollDice?.(20, totalModifier, "Initiative");
    };

    return (
        <div className="relative p-2">
            {/* Settings Toggle Button */}
            <button
                onClick={() => setShowSettings(!showSettings)}
                className="absolute top-0 right-0 p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 z-20"
                title="Settings"
            >
                <Settings className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex flex-col items-center mb-4">
                <h2 className="text-2xl font-bold text-center">Initiative</h2>
                <div className="flex gap-1 mt-1">
                    {advantage && (
                        <span className="text-[10px] font-black bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded border border-green-200 dark:border-green-800" title="Advantage">ADVANTAGE</span>
                    )}
                    {disadvantage && (
                        <span className="text-[10px] font-black bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800" title="Disadvantage">DISADVANTAGE</span>
                    )}
                </div>
            </div>

            {/* Main Die View */}
            <div className="flex flex-col items-center">
                <div
                    onClick={handleRoll}
                    className="min-w-20 h-20 px-4 flex items-center justify-center border-4 border-blue-500 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors group shadow-sm bg-white"
                >
                    <span className="text-3xl font-bold text-blue-600 group-hover:scale-110 transition-transform">
                        {displayModifier >= 0 ? "+" : ""}{displayModifier}
                    </span>
                </div>
            </div>

            {/* Settings Overlay - Absolute positioned to avoid shifting items below */}
            {showSettings && (
                <div className="absolute top-10 right-0 z-50 w-64 p-4 bg-white border border-gray-200 rounded-xl shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center justify-between border-b pb-2 mb-2">
                        <span className="font-bold text-gray-700 font-sans">Settings</span>
                        <button
                            onClick={() => setShowSettings(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600 font-sans">Misc Bonus</span>
                            <input
                                type="number"
                                value={initiative.miscBonus}
                                onChange={(e) => handleMiscChange(e.target.value)}
                                className="w-16 p-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                            />
                        </div>

                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 font-sans">Jack of All Trades</span>
                            <input
                                type="checkbox"
                                checked={initiative.useJackOfAllTrades}
                                onChange={handleToggleJack}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                        </label>

                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 font-sans">Dex Tiebreaker</span>
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
