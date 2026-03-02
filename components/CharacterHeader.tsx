"use client";

import { CharacterClass } from "../types/character";
import { classOptions } from "../utils/constants";
import { Card, CardContent } from "./ui/card";
import { Trophy, GraduationCap, User, BookOpen, Star, Plus, Trash2 } from "lucide-react";

interface CharacterHeaderProps {
    name: string;
    species: string;
    subSpecies?: string;
    background: string;
    exp?: number;
    classes: CharacterClass[];
    proficiencyBonus: number;
    totalLevel: number;
    onNameChange: (value: string) => void;
    onSpeciesChange: (value: string) => void;
    onSubSpeciesChange: (value: string) => void;
    onBackgroundChange: (value: string) => void;
    onExpChange: (value: number | undefined) => void;
    onClassChange: (index: number, field: keyof CharacterClass, value: any) => void;
    onAddClass: () => void;
    onRemoveClass: (index: number) => void;
}

const EXP_THRESHOLDS = [
    0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
    85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
];

const CharacterHeader = ({
    name,
    species,
    subSpecies,
    background,
    exp,
    classes,
    proficiencyBonus,
    totalLevel,
    onNameChange,
    onSpeciesChange,
    onSubSpeciesChange,
    onBackgroundChange,
    onExpChange,
    onClassChange,
    onAddClass,
    onRemoveClass,
}: CharacterHeaderProps) => {
    const nextLevelExp = totalLevel < 20 ? EXP_THRESHOLDS[totalLevel] : null;

    return (
        <Card className="w-full max-w-6xl mx-auto bg-white shadow-md border-t-4 border-blue-500 overflow-hidden">
            <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-12">
                    {/* Character Name and Basics */}
                    <div className="md:col-span-4 p-6 bg-gray-50/50 border-r border-gray-100 flex flex-col justify-center">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1">
                                <User size={12} /> Character Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => onNameChange(e.target.value)}
                                className="w-full text-3xl font-black bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-all py-1"
                                placeholder="Enter Name..."
                            />
                        </div>
                    </div>

                    {/* Classes and Levels */}
                    <div className="md:col-span-4 p-6 space-y-4">
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1">
                                <GraduationCap size={12} /> Class & Level
                            </label>
                            <button
                                onClick={onAddClass}
                                className="text-[10px] font-bold uppercase bg-blue-50 text-blue-600 px-2 py-0.5 rounded hover:bg-blue-100 transition-colors flex items-center gap-1"
                            >
                                <Plus size={10} /> Add Class
                            </button>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {classes.map((cls, index) => (
                                <div key={index} className="space-y-2 p-3 bg-white border border-gray-100 rounded-lg shadow-sm group relative">
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={cls.name}
                                            onChange={(e) => onClassChange(index, "name", e.target.value)}
                                            className="flex-1 text-sm font-semibold bg-white border border-gray-200 rounded-md p-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                        >
                                            {classOptions.map((opt) => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                        <div className="flex items-center gap-1 bg-gray-100 rounded-md px-2 py-1.5 border border-gray-200">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">Lv</span>
                                            <input
                                                type="number"
                                                value={cls.level}
                                                min={1}
                                                max={20}
                                                onChange={(e) => onClassChange(index, "level", parseInt(e.target.value, 10) || 1)}
                                                className="w-8 text-sm font-bold bg-transparent focus:outline-none text-center"
                                            />
                                        </div>
                                        {classes.length > 1 && (
                                            <button
                                                onClick={() => onRemoveClass(index)}
                                                className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[9px] uppercase font-bold text-gray-400">Subclass</label>
                                        <input
                                            type="text"
                                            value={cls.subclass || ""}
                                            onChange={(e) => onClassChange(index, "subclass", e.target.value)}
                                            className="w-full text-xs font-medium bg-gray-50/50 border border-gray-100 rounded px-2 py-1 focus:border-blue-300 focus:outline-none transition-all"
                                            placeholder="Enter Subclass..."
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Meta Info (Species, Background, EXP) */}
                    <div className="md:col-span-4 p-6 bg-gray-50/50 border-l border-gray-100 grid grid-cols-1 gap-4">
                        <div className="grid grid-cols-1 gap-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1">
                                        <BookOpen size={10} /> Species
                                    </label>
                                    <input
                                        type="text"
                                        value={species}
                                        onChange={(e) => onSpeciesChange(e.target.value)}
                                        className="w-full text-sm font-medium bg-transparent border-b border-gray-200 hover:border-gray-400 focus:border-blue-500 focus:outline-none transition-all py-0.5"
                                        placeholder="Human..."
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1">
                                        <BookOpen size={10} /> Sub Species
                                    </label>
                                    <input
                                        type="text"
                                        value={subSpecies || ""}
                                        onChange={(e) => onSubSpeciesChange(e.target.value)}
                                        className="w-full text-sm font-medium bg-transparent border-b border-gray-200 hover:border-gray-400 focus:border-blue-500 focus:outline-none transition-all py-0.5"
                                        placeholder="Wood Elf..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1">
                                    <Trophy size={10} /> Background
                                </label>
                                <input
                                    type="text"
                                    value={background}
                                    onChange={(e) => onBackgroundChange(e.target.value)}
                                    className="w-full text-sm font-medium bg-transparent border-b border-gray-200 hover:border-gray-400 focus:border-blue-500 focus:outline-none transition-all py-0.5"
                                    placeholder="Soldier..."
                                />
                            </div>
                        </div>

                        <div className="flex items-end justify-between gap-4">
                            <div className="flex-1 space-y-1">
                                <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1">
                                    <Star size={10} /> Experience
                                </label>
                                <div className="flex items-center gap-1 border-b border-gray-200 hover:border-gray-400 focus-within:border-blue-500 transition-all">
                                    <input
                                        type="number"
                                        value={exp ?? ""}
                                        onChange={(e) => onExpChange(e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                        className="flex-1 text-sm font-medium bg-transparent focus:outline-none py-0.5"
                                        placeholder="Current..."
                                    />
                                    {nextLevelExp !== null && (
                                        <div className="flex items-center text-gray-400 text-xs font-bold">
                                            <span>/</span>
                                            <span className="ml-1">{nextLevelExp.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Proficiency Bonus Badge */}
                            <div className="flex flex-col items-center justify-center bg-blue-600 text-white rounded-lg p-2 min-w-[64px] shadow-sm">
                                <span className="text-[8px] uppercase font-black leading-none mb-1">Proficiency</span>
                                <span className="text-xl font-black leading-none">+{proficiencyBonus}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer / Summary Line */}
                <div className="px-6 py-2 bg-white border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] uppercase font-bold text-gray-400">Total Level</span>
                            <span className="text-sm font-black text-blue-600">{totalLevel}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default CharacterHeader;
