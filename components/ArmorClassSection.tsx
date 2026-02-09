"use client";

import { useState } from "react";
import { ArmorClass, AbilityScores } from "../types/character";
import { calculateAC } from "../utils/acUtils";

interface ArmorClassSectionProps {
    armorClass: ArmorClass;
    setArmorClass: (ac: ArmorClass) => void;
    abilityScores: AbilityScores;
}

const ArmorClassSection: React.FC<ArmorClassSectionProps> = ({
    armorClass,
    setArmorClass,
    abilityScores,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const currentAC = calculateAC(armorClass, abilityScores);

    const handleChange = (field: keyof ArmorClass, value: any) => {
        setArmorClass({
            ...armorClass,
            [field]: value,
        });
    };

    const abilityOptions: (keyof AbilityScores)[] = [
        "strength",
        "dexterity",
        "constitution",
        "intelligence",
        "wisdom",
        "charisma",
    ];

    return (
        <div className="border p-3 rounded bg-white shadow-sm">
            <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span className="font-bold text-lg">Armor Class</span>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border-2 border-blue-100">
                        {currentAC}
                    </span>
                    <span className="text-gray-400 text-sm">{isExpanded ? "▲" : "▼"}</span>
                </div>
            </div>

            {isExpanded && (
                <div className="mt-4 space-y-4 border-t pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Base AC</label>
                            <input
                                type="number"
                                value={armorClass.baseAC}
                                onChange={(e) => handleChange("baseAC", parseInt(e.target.value) || 0)}
                                className="p-2 border rounded text-center font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Manual Override</label>
                            <input
                                type="number"
                                placeholder="Auto"
                                value={armorClass.manualOverride ?? ""}
                                onChange={(e) => {
                                    const val = e.target.value === "" ? undefined : parseInt(e.target.value);
                                    handleChange("manualOverride", val);
                                }}
                                className="p-2 border rounded text-center font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50"
                            />
                        </div>
                    </div>

                    <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">Add DEX Bonus</label>
                            <input
                                type="checkbox"
                                checked={armorClass.hasDexBonus}
                                onChange={(e) => handleChange("hasDexBonus", e.target.checked)}
                                className="w-5 h-5 accent-blue-500"
                            />
                        </div>

                        {armorClass.hasDexBonus && (
                            <div className="flex items-center justify-between pl-4 border-l-2 border-blue-200">
                                <label className="text-sm text-gray-600">DEX Cap</label>
                                <input
                                    type="number"
                                    placeholder="None"
                                    value={armorClass.dexCap ?? ""}
                                    onChange={(e) => {
                                        const val = e.target.value === "" ? undefined : parseInt(e.target.value);
                                        handleChange("dexCap", val);
                                    }}
                                    className="w-20 p-1 border rounded text-center text-sm"
                                />
                            </div>
                        )}

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">Secondary Ability Bonus</label>
                            <select
                                value={armorClass.secondaryAbility || ""}
                                onChange={(e) => handleChange("secondaryAbility", e.target.value || undefined)}
                                className="p-2 border rounded text-sm bg-white"
                            >
                                <option value="">None</option>
                                {abilityOptions.map((ability) => (
                                    <option key={ability} value={ability}>
                                        {(ability as string).charAt(0).toUpperCase() + (ability as string).slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Shield</label>
                            <input
                                type="number"
                                value={armorClass.shieldBonus}
                                onChange={(e) => handleChange("shieldBonus", parseInt(e.target.value) || 0)}
                                className="p-2 border rounded text-center font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Misc Bonus</label>
                            <input
                                type="number"
                                value={armorClass.miscBonus}
                                onChange={(e) => handleChange("miscBonus", parseInt(e.target.value) || 0)}
                                className="p-2 border rounded text-center font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArmorClassSection;
