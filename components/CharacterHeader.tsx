"use client";

import { useState } from "react";
import { CharacterClass } from "../types/character";
import { classOptions } from "../utils/constants";
import Select from "./ui/Select";
import { Card, CardContent } from "./ui/card";
import { Trophy, GraduationCap, User, BookOpen, Star, Plus, Trash2, X, Shield, Camera, Image as ImageIcon, Home, Settings } from "lucide-react";
import SettingsButton from "./ui/SettingsButton";
import NumericInput from "./ui/NumericInput";
import ConfirmationModal from "./ui/ConfirmationModal";
import ThemeSettings from "./ThemeSettings";
import ModalScrollLock from "./ui/ModalScrollLock";

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
    onDelete?: () => void;
    onReturn?: () => void;
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
    onDelete,
    onReturn,
}: CharacterHeaderProps) => {
    const [isEditingClasses, setIsEditingClasses] = useState(false);
    const [isEditingSettings, setIsEditingSettings] = useState(false);
    const [isDeletingCharacter, setIsDeletingCharacter] = useState(false);
    const [classIndexToRemove, setClassIndexToRemove] = useState<number | null>(null);
    const nextLevelExp = totalLevel < 20 ? EXP_THRESHOLDS[totalLevel] : null;

    return (
        <>
            <Card className="w-full max-w-screen-2xl mx-auto shadow-md border-t-4 border-primary overflow-hidden">
                <CardContent className="p-0">
                    {/* Sleek Mobile Navigation / Actions Toolbar (Hidden on Desktop) */}
                    <div className="flex md:hidden justify-between items-center px-4 py-3 bg-secondary/40 border-b border-border shadow-xs">
                        {onReturn ? (
                            <button
                                onClick={onReturn}
                                title="Return to Selection"
                                className="p-2 bg-background hover:bg-secondary rounded-lg border border-border text-foreground transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
                            >
                                <Home size={18} />
                            </button>
                        ) : <div />}

                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setIsEditingSettings(true)}
                                title="Display Settings"
                                className="p-2 bg-background hover:bg-secondary rounded-lg border border-border text-foreground transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
                            >
                                <Settings size={18} />
                            </button>
                            {onDelete && (
                                <button
                                    onClick={() => setIsDeletingCharacter(true)}
                                    title="Delete Character"
                                    className="p-2 bg-background hover:bg-red-500/10 text-red-500 rounded-lg border border-border hover:border-red-500/30 transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12">
                        {/* Character Name and Basics */}
                        <div className="md:col-span-4 p-5 sm:p-6 bg-secondary/30 border-b md:border-b-0 md:border-r border-border flex items-center gap-4 sm:gap-6">
                            {/* Image Upload/Display (Responsive sizing) */}
                            <div className="relative group shrink-0">
                                <div className="w-20 h-20 sm:w-24 md:w-40 md:h-40 rounded-full border-4 border-card bg-background flex items-center justify-center overflow-hidden shadow-md">
                                    {imageUrl ? (
                                        <img src={imageUrl} alt="Character" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon size={24} className="text-gray-300 md:size-8" />
                                    )}
                                </div>
                                <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                    <Camera size={16} className="md:size-5" />
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

                            <div className="space-y-1 flex-1 min-w-0">
                                <label className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1">
                                    <User size={12} className="md:size-3.5" /> Character Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => onNameChange(e.target.value)}
                                    className="w-full text-xl sm:text-2xl md:text-3xl font-black bg-transparent border-b-2 border-transparent hover:border-border focus:border-primary focus:outline-none transition-all py-0.5 truncate"
                                    placeholder="Enter Name..."
                                />
                            </div>
                        </div>

                        {/* Classes and Levels */}
                        <div className="md:col-span-4 p-5 border-b md:border-b-0 md:border-r border-border space-y-2 relative group min-h-[100px] md:min-h-[140px]">
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1">
                                    <GraduationCap size={12} className="md:size-3.5" /> Class & Level
                                </label>
                                <SettingsButton
                                    onClick={() => setIsEditingClasses(true)}
                                    title="Edit Classes"
                                />
                            </div>
                            <div className="space-y-2">
                                {classes.map((cls, index) => (
                                    <div key={index} className="flex flex-col">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-lg md:text-xl font-black italic">
                                                {cls.subclass ? `${cls.subclass} ` : ""}{cls.name}
                                            </span>
                                            <span className="text-[10px] sm:text-xs font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                                                LV {cls.level}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="absolute bottom-3 left-5 flex items-center gap-1 pointer-events-none">
                                <span className="text-[10px] sm:text-xs uppercase font-black text-gray-400">Total Lv</span>
                                <span className="text-[10px] sm:text-xs font-black text-primary">{totalLevel}</span>
                            </div>

                        </div>

                        {/* Meta Info (Species, Background, EXP) */}
                        <div className="md:col-span-4 p-5 bg-secondary/30 flex flex-col gap-4 relative">
                            {/* Desktop Global Actions Overlay (Hidden on Mobile) */}
                            <div className="absolute top-3 right-3 z-10 hidden md:block">
                                <div className="flex items-center gap-1.5 p-1.5 bg-green-500/20 backdrop-blur-sm rounded-full border border-green-500/40 shadow-sm">
                                    {onReturn && (
                                        <button
                                            onClick={onReturn}
                                            title="Return to Selection"
                                            className="p-2 rounded-full transition-colors text-green-800 dark:text-green-200 hover:text-primary hover:bg-green-500/20"
                                        >
                                            <Home size={20} />
                                        </button>
                                    )}
                                    <SettingsButton
                                        onClick={() => setIsEditingSettings(true)}
                                        title="Display Settings"
                                        className="p-2 text-green-800 dark:text-green-200 hover:bg-green-500/20"
                                        iconSize={20}
                                    />
                                    {onDelete && (
                                        <button
                                            onClick={() => setIsDeletingCharacter(true)}
                                            title="Delete Character"
                                            className="p-2 rounded-full transition-colors text-green-800 dark:text-green-200 hover:text-red-500 hover:bg-red-500/20"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Top row: Species & Subspecies */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1">
                                        <BookOpen size={10} className="md:size-3" /> Species
                                    </label>
                                    <input
                                        type="text"
                                        value={species}
                                        onChange={(e) => onSpeciesChange(e.target.value)}
                                        className="w-full text-xs sm:text-sm font-medium bg-transparent border-b border-border hover:border-primary/50 focus:border-primary focus:outline-none transition-all py-0.5"
                                        placeholder="Human..."
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1">
                                        <BookOpen size={10} className="md:size-3" /> Sub Species
                                    </label>
                                    <input
                                        type="text"
                                        value={subSpecies || ""}
                                        onChange={(e) => onSubSpeciesChange(e.target.value)}
                                        className="w-full text-xs sm:text-sm font-medium bg-transparent border-b border-border hover:border-primary/50 focus:border-primary focus:outline-none transition-all py-0.5"
                                        placeholder="Wood Elf..."
                                    />
                                </div>
                            </div>

                            {/* Bottom responsive layout: Background/Experience + Proficiency Badge */}
                            <div className="flex flex-col sm:flex-row items-stretch gap-4">
                                <div className="flex-1 flex flex-col justify-between py-px gap-3 sm:gap-1.5">
                                    <div className="space-y-1">
                                        <label className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1">
                                            <Trophy size={10} className="md:size-3" /> Background
                                        </label>
                                        <input
                                            type="text"
                                            value={background}
                                            onChange={(e) => onBackgroundChange(e.target.value)}
                                            className="w-full text-xs sm:text-sm font-medium bg-transparent border-b border-border hover:border-primary/50 focus:border-primary focus:outline-none transition-all py-0.5"
                                            placeholder="Soldier..."
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1">
                                            <Star size={10} className="md:size-3" /> Experience
                                        </label>
                                        <div className="flex items-center gap-1 border-b border-border hover:border-primary/50 focus-within:border-primary transition-all">
                                            <NumericInput
                                                value={exp ?? ""}
                                                onChange={(val) => onExpChange(val === 0 ? undefined : val)}
                                                variant="horizontal"
                                                className="flex-1 border-none bg-transparent shadow-none"
                                                inputClassName="text-xs sm:text-sm font-medium p-0 pr-5"
                                                placeholder="Current..."
                                            />
                                            {nextLevelExp !== null && (
                                                <div className="flex items-center text-muted-foreground text-[10px] sm:text-xs font-bold">
                                                    <span>/</span>
                                                    <span className="ml-1">{nextLevelExp.toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Proficiency Bonus Badge (Responsive wide row on mobile, tall column on larger screens) */}
                                <div className="flex sm:flex-col items-center justify-between sm:justify-center bg-primary text-primary-foreground rounded-xl px-5 py-3 sm:p-4 min-w-full sm:min-w-[128px] shadow-lg border-2 border-primary/30">
                                    <span className="text-[10px] sm:text-xs uppercase font-black tracking-widest leading-none opacity-90 text-primary-foreground/80 sm:mb-2">Proficiency</span>
                                    <span className="text-2xl sm:text-5xl font-black leading-none animate-in zoom-in duration-500">+{proficiencyBonus}</span>
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

                <ConfirmationModal
                    isOpen={isDeletingCharacter}
                    onClose={() => setIsDeletingCharacter(false)}
                    onConfirm={() => {
                        if (onDelete) onDelete();
                        setIsDeletingCharacter(false);
                    }}
                    title="Delete Character"
                    message={`Are you sure you want to delete ${name}? This action is final and all character data will be lost forever.`}
                    confirmText="Delete"
                />
            </Card>

            {isEditingClasses && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <ModalScrollLock isOpen={isEditingClasses} />
                    <div className="bg-background w-full max-w-2xl rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-secondary/30">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-wider text-foreground">Class & Level</h2>
                            </div>
                            <button
                                onClick={() => setIsEditingClasses(false)}
                                className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {classes.map((cls, index) => (
                                <div key={index} className="space-y-3 p-4 bg-secondary/20 border border-border rounded-xl group relative">
                                    <div className="flex items-center gap-2">
                                        <Select
                                            value={cls.name}
                                            onValueChange={(val) => onClassChange(index, "name", val)}
                                            options={classOptions.map(opt => ({ label: opt, value: opt }))}
                                            className="flex-1"
                                        />
                                        <div className="flex items-center gap-2 bg-background rounded-lg p-1.5 border border-border">
                                            <span className="text-xs font-black text-muted-foreground uppercase ml-1">Lv</span>
                                            <NumericInput
                                                value={cls.level}
                                                min={1}
                                                max={20}
                                                onChange={(val) => onClassChange(index, "level", val || 1)}
                                                variant="horizontal"
                                                className="border-none shadow-none w-20"
                                                inputClassName="text-base font-black p-0 h-8"
                                            />
                                        </div>
                                        {classes.length > 1 && (
                                            <button
                                                onClick={() => setClassIndexToRemove(index)}
                                                className="text-muted-foreground hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs uppercase font-black tracking-widest text-muted-foreground ml-1">Subclass</label>
                                        <input
                                            type="text"
                                            value={cls.subclass || ""}
                                            onChange={(e) => onClassChange(index, "subclass", e.target.value)}
                                            className="w-full text-sm font-bold bg-background border border-border rounded-lg px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all shadow-sm"
                                            placeholder="Enter Subclass..."
                                        />
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={onAddClass}
                                className="w-full py-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-all border border-dashed border-primary/20 mt-2"
                            >
                                <Plus size={16} /> Add Multiclass
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-secondary/30 border-t border-border flex justify-end">
                            <button
                                onClick={() => setIsEditingClasses(false)}
                                className="px-10 py-3 bg-primary text-primary-foreground text-sm font-black uppercase tracking-[0.2em] rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isEditingSettings && (
                <ThemeSettings onClose={() => setIsEditingSettings(false)} />
            )}
        </>
    );
};

export default CharacterHeader;
