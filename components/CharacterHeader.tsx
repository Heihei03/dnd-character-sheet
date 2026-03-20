"use client";

import { useState } from "react";
import { CharacterClass } from "../types/character";
import { classOptions } from "../utils/constants";
import { Card, CardContent } from "./ui/card";
import { Trophy, GraduationCap, User, BookOpen, Star, Plus, Trash2, Settings, X, Shield, Camera, Image as ImageIcon } from "lucide-react";
import ConfirmationModal from "./ui/ConfirmationModal";

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
    imageUrl?: string;
    onImageUrlChange: (value: string) => void;
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
    imageUrl,
    onImageUrlChange,
}: CharacterHeaderProps) => {
    const [isEditingClasses, setIsEditingClasses] = useState(false);
    const [classIndexToRemove, setClassIndexToRemove] = useState<number | null>(null);
    const nextLevelExp = totalLevel < 20 ? EXP_THRESHOLDS[totalLevel] : null;

    return (
        <Card className="w-full max-w-screen-2xl mx-auto bg-white shadow-md border-t-4 border-blue-500 overflow-hidden">
            <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-12">
                    {/* Character Name and Basics */}
                    <div className="md:col-span-4 p-6 bg-gray-50/50 border-r border-gray-100 flex items-center gap-6">
                        {/* Image Upload/Display */}
                        <div className="relative group shrink-0">
                            <div className="w-40 h-40 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center overflow-hidden shadow-md">
                                {imageUrl ? (
                                    <img src={imageUrl} alt="Character" className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon size={32} className="text-gray-300" />
                                )}
                            </div>
                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                <Camera size={20} />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                onImageUrlChange(reader.result as string);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </label>
                        </div>

                        <div className="space-y-1 flex-1">
                            <label className="text-xs uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1">
                                <User size={14} /> Character Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => onNameChange(e.target.value)}
                                className="w-full text-3xl font-black bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-all py-1 mb-1"
                                placeholder="Enter Name..."
                            />
                        </div>
                    </div>

                    {/* Classes and Levels */}
                    <div className="md:col-span-4 p-4 space-y-2 relative group">
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1">
                                <GraduationCap size={14} /> Class & Level
                            </label>
                            <button
                                onClick={() => setIsEditingClasses(true)}
                                className="p-1 px-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-blue-600 focus:outline-none"
                                title="Edit Classes"
                            >
                                <Settings size={20} />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {classes.map((cls, index) => (
                                <div key={index} className="flex flex-col">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xl font-black text-gray-900 dark:text-gray-100 italic">
                                            {cls.subclass ? `${cls.subclass} ` : ""}{cls.name}
                                        </span>
                                        <span className="text-xs font-black bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                                            LV {cls.level}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="absolute bottom-2 left-3 flex items-center gap-1 pointer-events-none">
                            <span className="text-xs uppercase font-black text-gray-400">Total Lv</span>
                            <span className="text-xs font-black text-blue-600">{totalLevel}</span>
                        </div>

                        {/* Class Editor Popup */}
                        {isEditingClasses && (
                            <div className="absolute inset-0 z-50 bg-white dark:bg-gray-950 p-6 shadow-2xl animate-in fade-in zoom-in duration-200 rounded-lg border-2 border-blue-500 overflow-y-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-blue-600">Modify Classes</h3>
                                    <button
                                        onClick={() => setIsEditingClasses(false)}
                                        className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {classes.map((cls, index) => (
                                        <div key={index} className="space-y-2 p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-lg group relative">
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={cls.name}
                                                    onChange={(e) => onClassChange(index, "name", e.target.value)}
                                                    className="flex-1 text-sm font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                                >
                                                    {classOptions.map((opt) => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                                <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-md px-2 py-1.5 border border-gray-200 dark:border-gray-700">
                                                    <span className="text-xs font-bold text-gray-400 uppercase">Lv</span>
                                                    <input
                                                        type="number"
                                                        value={cls.level}
                                                        min={1}
                                                        max={20}
                                                        onChange={(e) => onClassChange(index, "level", parseInt(e.target.value, 10) || 1)}
                                                        className="w-8 text-sm font-bold bg-transparent focus:outline-none text-center dark:text-gray-100"
                                                    />
                                                </div>
                                                {classes.length > 1 && (
                                                    <button
                                                        onClick={() => setClassIndexToRemove(index)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[11px] uppercase font-bold text-gray-400 ml-1">Subclass</label>
                                                <input
                                                    type="text"
                                                    value={cls.subclass || ""}
                                                    onChange={(e) => onClassChange(index, "subclass", e.target.value)}
                                                    className="w-full text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 focus:border-blue-400 focus:outline-none transition-all dark:text-gray-100"
                                                    placeholder="Enter Subclass..."
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        onClick={onAddClass}
                                        className="w-full py-2 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors border border-blue-100 dark:border-blue-800/50 mt-2"
                                    >
                                        <Plus size={14} /> Add Multiclass
                                    </button>

                                    <button
                                        onClick={() => setIsEditingClasses(false)}
                                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-lg shadow-sm transition-all active:scale-[0.98] mt-4"
                                    >
                                        Save & Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Meta Info (Species, Background, EXP) */}
                    <div className="md:col-span-4 p-4 bg-gray-50/50 border-l border-gray-100 flex flex-col gap-3">
                        {/* Top row: Species */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1">
                                    <BookOpen size={12} /> Species
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
                                <label className="text-xs uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1">
                                    <BookOpen size={12} /> Sub Species
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

                        {/* Bottom 2-row block: Background/Experience + Proficiency Badge */}
                        <div className="flex items-stretch gap-4">
                            <div className="flex-1 flex flex-col justify-between py-px">
                                <div className="space-y-1">
                                    <label className="text-xs uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1">
                                        <Trophy size={12} /> Background
                                    </label>
                                    <input
                                        type="text"
                                        value={background}
                                        onChange={(e) => onBackgroundChange(e.target.value)}
                                        className="w-full text-sm font-medium bg-transparent border-b border-gray-200 hover:border-gray-400 focus:border-blue-500 focus:outline-none transition-all py-0.5"
                                        placeholder="Soldier..."
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1">
                                        <Star size={12} /> Experience
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
                            </div>

                            {/* Proficiency Bonus Badge - Spans Background + Experience */}
                            <div className="flex flex-col items-center justify-center bg-blue-600 text-white rounded-xl p-4 min-w-[128px] shadow-lg border-2 border-blue-400/30">
                                <span className="text-xs uppercase font-black tracking-widest leading-none mb-2 opacity-90 text-blue-100">Proficiency</span>
                                <span className="text-5xl font-black leading-none animate-in zoom-in duration-500">+{proficiencyBonus}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </CardContent>

            <ConfirmationModal
                isOpen={classIndexToRemove !== null}
                onClose={() => setClassIndexToRemove(null)}
                onConfirm={() => {
                    if (classIndexToRemove !== null) {
                        onRemoveClass(classIndexToRemove);
                        setClassIndexToRemove(null);
                    }
                }}
                title="Remove Class"
                message={`Are you sure you want to remove the ${classes[classIndexToRemove ?? 0]?.name} class?`}
                confirmText="Remove"
            />
        </Card>
    );
};

export default CharacterHeader;
