"use client";

import { CharacterClass } from "../types/character";
import { classOptions } from "../utils/constants";

interface ClassLevelSectionProps {
    classes: CharacterClass[];
    onClassChange: (index: number, field: keyof CharacterClass, value: any) => void;
    onAddClass: () => void;
    onRemoveClass: (index: number) => void;
    totalLevel: number;
    proficiencyBonus: number;
}

const ClassLevelSection = ({
    classes,
    onClassChange,
    onAddClass,
    onRemoveClass,
    totalLevel,
    proficiencyBonus,
}: ClassLevelSectionProps) => {
    return (
        <div className="space-y-4 w-full">
            <div className="space-y-4 w-full max-w-md mx-auto">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center px-4">
                        <label className="text-lg font-semibold">Classes</label>
                        <button
                            onClick={onAddClass}
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                            title="Add Class"
                        >
                            + Add Class
                        </button>
                    </div>
                    {classes.map((cls, index) => (
                        <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200 shadow-sm relative group">
                            <select
                                value={cls.name}
                                onChange={(e) => onClassChange(index, "name", e.target.value)}
                                className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                {classOptions.map((charClass) => (
                                    <option key={charClass} value={charClass}>
                                        {charClass}
                                    </option>
                                ))}
                            </select>
                            <div className="flex items-center gap-1">
                                <label className="text-xs text-gray-500">Lvl</label>
                                <input
                                    type="number"
                                    value={cls.level}
                                    min={1}
                                    max={20}
                                    onChange={(e) => onClassChange(index, "level", parseInt(e.target.value, 10))}
                                    className="w-16 p-2 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            {classes.length > 1 && (
                                <button
                                    onClick={() => onRemoveClass(index)}
                                    className="text-red-500 hover:text-red-700 font-bold text-[20px] px-2"
                                    title="Remove Class"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                    <label className="text-lg">Total Level:</label>
                    <span className="font-semibold text-xl">{totalLevel}</span>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-lg text-gray-500">Proficiency Bonus:</label>
                    <span className="font-semibold text-xl text-gray-600">
                        +{proficiencyBonus}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ClassLevelSection;
