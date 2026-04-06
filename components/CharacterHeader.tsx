"use client";

import { useState } from "react";
import { CharacterClass } from "../types/character";
import { classOptions } from "../utils/constants";
import Select from "./ui/Select";
import { Card, CardContent } from "./ui/card";
import { Trophy, GraduationCap, User, BookOpen, Star, Plus, Trash2, X, Shield, Camera, Image as ImageIcon } from "lucide-react";
import SettingsButton from "./ui/SettingsButton";
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
    const [isEditingSettings, setIsEditingSettings] = useState(false);
    const [classIndexToRemove, setClassIndexToRemove] = useState<number | null>(null);
    const nextLevelExp = totalLevel < 20 ? EXP_THRESHOLDS[totalLevel] : null;

    return (
        <>
        <Card className="w-full max-w-screen-2xl mx-auto shadow-md border-t-4 border-primary overflow-hidden">
            <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-12">
                    {/* Character Name and Basics */}
                    <div className="md:col-span-4 p-6 bg-secondary/30 border-r border-border flex items-center gap-6">
                        {/* Image Upload/Display */}
                        <div className="relative group shrink-0">
                            <div className="w-40 h-40 rounded-full border-4 border-card bg-background flex items-center justify-center overflow-hidden shadow-md">
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
                                className="w-full text-3xl font-black bg-transparent border-b-2 border-transparent hover:border-border focus:border-primary focus:outline-none transition-all py-1 mb-1"
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
                            <SettingsButton
                                onClick={() => setIsEditingClasses(true)}
                                title="Edit Classes"
                            />
                        </div>
                        <div className="space-y-2">
                            {classes.map((cls, index) => (
                                <div key={index} className="flex flex-col">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xl font-black italic">
                                            {cls.subclass ? `${cls.subclass} ` : ""}{cls.name}
                                        </span>
                                        <span className="text-xs font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                                            LV {cls.level}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="absolute bottom-2 left-3 flex items-center gap-1 pointer-events-none">
                            <span className="text-xs uppercase font-black text-gray-400">Total Lv</span>
                            <span className="text-xs font-black text-primary">{totalLevel}</span>
                        </div>

                    </div>

                    {/* Meta Info (Species, Background, EXP) */}
                    <div className="md:col-span-4 p-4 bg-secondary/30 border-l border-border flex flex-col gap-3">
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
                                    className="w-full text-sm font-medium bg-transparent border-b border-border hover:border-primary/50 focus:border-primary focus:outline-none transition-all py-0.5"
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
                                    className="w-full text-sm font-medium bg-transparent border-b border-border hover:border-primary/50 focus:border-primary focus:outline-none transition-all py-0.5"
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
                                        className="w-full text-sm font-medium bg-transparent border-b border-border hover:border-primary/50 focus:border-primary focus:outline-none transition-all py-0.5"
                                        placeholder="Soldier..."
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1">
                                        <Star size={12} /> Experience
                                    </label>
                                    <div className="flex items-center gap-1 border-b border-border hover:border-primary/50 focus-within:border-primary transition-all">
                                        <input
                                            type="number"
                                            value={exp ?? ""}
                                            onChange={(e) => onExpChange(e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                            className="flex-1 text-sm font-medium bg-transparent focus:outline-none py-0.5"
                                            placeholder="Current..."
                                        />
                                        {nextLevelExp !== null && (
                                            <div className="flex items-center text-muted-foreground text-xs font-bold">
                                                <span>/</span>
                                                <span className="ml-1">{nextLevelExp.toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Proficiency Bonus Badge - Spans Background + Experience */}
                            <div className="flex flex-col items-center justify-center bg-primary text-primary-foreground rounded-xl p-4 min-w-[128px] shadow-lg border-2 border-primary/30">
                                <span className="text-xs uppercase font-black tracking-widest leading-none mb-2 opacity-90 text-primary-foreground/80">Proficiency</span>
                                <span className="text-5xl font-black leading-none animate-in zoom-in duration-500">+{proficiencyBonus}</span>
                            </div>

                            {/* Global Settings Trigger */}
                            <div className="flex flex-col gap-2">
                                <SettingsButton
                                    onClick={() => setIsEditingSettings(true)}
                                    title="Display Settings"
                                    className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary/50 text-gray-500 hover:text-primary transition-all"
                                />
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

        {isEditingClasses && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                <ModalScrollLock isOpen={isEditingClasses} />
                <div className="bg-background w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-secondary/30">
                        <div>
                            <h2 className="text-lg font-black uppercase tracking-wider text-foreground">Class & Level</h2>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Manage your heroic path</p>
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
                                    <div className="flex items-center gap-1 bg-background rounded-lg px-3 py-2 border border-border">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase">Lv</span>
                                        <input
                                            type="number"
                                            value={cls.level}
                                            min={1}
                                            max={20}
                                            onChange={(e) => onClassChange(index, "level", parseInt(e.target.value, 10) || 1)}
                                            className="w-8 text-sm font-black bg-transparent focus:outline-none text-center"
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
                                    <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Subclass</label>
                                    <input
                                        type="text"
                                        value={cls.subclass || ""}
                                        onChange={(e) => onClassChange(index, "subclass", e.target.value)}
                                        className="w-full text-xs font-bold bg-background border border-border rounded-lg px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all shadow-sm"
                                        placeholder="Enter Subclass..."
                                    />
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={onAddClass}
                            className="w-full py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-all border border-dashed border-primary/20 mt-2"
                        >
                            <Plus size={14} /> Add Multiclass
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-secondary/30 border-t border-border flex justify-end">
                        <button
                            onClick={() => setIsEditingClasses(false)}
                            className="px-8 py-2.5 bg-primary text-primary-foreground text-xs font-black uppercase tracking-[0.2em] rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
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
