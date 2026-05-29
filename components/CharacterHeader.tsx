"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { CharacterClass } from "../types/character";
import { classOptions } from "../utils/constants";
import Select from "./ui/Select";
import { Card, CardContent } from "./ui/card";
import { Trophy, GraduationCap, User, BookOpen, Star, Plus, Trash2, X, Camera, Image as ImageIcon, Home, Settings, Download } from "lucide-react";
import SettingsButton from "./ui/SettingsButton";
import NumericInput from "./ui/NumericInput";
import ConfirmationModal from "./ui/ConfirmationModal";
import ThemeSettings from "./ThemeSettings";
import ModalScrollLock from "./ui/ModalScrollLock";
import { cn } from "../lib/utils";

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
    onExport?: () => void;
    collapsed?: boolean;
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
    onExport,
    collapsed = false,
}: CharacterHeaderProps) => {
    const [isEditingClasses, setIsEditingClasses] = useState(false);
    const [isEditingSettings, setIsEditingSettings] = useState(false);
    const [isDeletingCharacter, setIsDeletingCharacter] = useState(false);
    const [classIndexToRemove, setClassIndexToRemove] = useState<number | null>(null);
    const [isExpandedModalOpen, setIsExpandedModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const nextLevelExp = totalLevel < 20 ? EXP_THRESHOLDS[totalLevel] : null;

    return (
        <>
            {/* Inline Header for Mobile/Sticky - Sleek & Compact Sticky Bar */}
            <Card className={cn("w-full max-w-screen-2xl mx-auto shadow-md border-t-4 border-primary overflow-hidden", collapsed ? "block" : "block md:hidden")}>
                <CardContent className="p-0">
                    <div 
                        onClick={() => setIsExpandedModalOpen(true)}
                        className="flex items-center justify-between p-3 px-4 bg-secondary/20 hover:bg-secondary/30 transition-all cursor-pointer group"
                    >
                        <div className="flex items-center gap-3 sm:gap-4 overflow-hidden min-w-0">
                            {/* Compact Avatar */}
                            <div className="w-9 h-9 rounded-full border-2 border-primary bg-background flex items-center justify-center overflow-hidden shrink-0 shadow-xs transition-transform group-hover:scale-105">
                                {imageUrl ? (
                                    <img src={imageUrl} alt="Character" className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon size={14} className="text-gray-300" />
                                )}
                            </div>
                            {/* Name and Classes */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
                                <h2 className="text-base sm:text-lg font-black truncate text-foreground leading-none">{name}</h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 leading-none whitespace-nowrap">
                                        LV {totalLevel}
                                    </span>
                                    <span className="text-xs text-muted-foreground font-bold italic truncate leading-none">
                                        {classes.map(c => `${c.subclass ? c.subclass + ' ' : ''}${c.name} ${c.level}`).join(' / ')}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {/* Proficiency bonus indicator */}
                            <div className="flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded shadow-xs">
                                <span>Prof:</span>
                                <span>+{proficiencyBonus}</span>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsExpandedModalOpen(true); }}
                                className="p-1.5 hover:bg-secondary rounded-full transition-all text-muted-foreground hover:text-foreground active:scale-95 flex items-center justify-center"
                                title="Edit Profile"
                            >
                                <Settings size={18} />
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Inline Header for Desktop - Full Expanded Card */}
            <Card className={cn("w-full max-w-screen-2xl mx-auto shadow-md border-t-4 border-primary overflow-hidden", collapsed ? "hidden" : "hidden md:block")}>
                <CardContent className="p-6">
                    {/* Navigation & Action Toolbar */}
                    <div className="flex justify-between items-center px-4 py-3 bg-secondary/20 border border-border rounded-xl shadow-xs mb-6">
                        {onReturn ? (
                            <button
                                onClick={onReturn}
                                title="Return to Selection"
                                className="p-2 bg-background hover:bg-secondary rounded-lg border border-border text-foreground transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95 animate-in"
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
                            {onExport && (
                                <button
                                    onClick={onExport}
                                    title="Export Character Sheet"
                                    className="p-2 bg-background hover:bg-secondary rounded-lg border border-border text-foreground transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
                                >
                                    <Download size={18} />
                                </button>
                            )}
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

                    {/* Desktop 3-Column Grid */}
                    <div className="grid grid-cols-12 gap-6">
                        {/* Character Name and Basics */}
                        <div className="col-span-4 p-5 sm:p-6 bg-secondary/10 border border-border rounded-2xl flex items-center gap-4 sm:gap-6">
                            {/* Image Upload/Display */}
                            <div className="relative group shrink-0">
                                <div className="w-20 h-20 sm:w-24 md:w-32 md:h-32 rounded-full border-4 border-card bg-background flex items-center justify-center overflow-hidden shadow-md">
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
                                    className="w-full text-xl sm:text-2xl font-black bg-transparent border-b-2 border-transparent hover:border-border focus:border-primary focus:outline-none transition-all py-0.5 truncate"
                                    placeholder="Enter Name..."
                                />
                            </div>
                        </div>

                        {/* Classes and Levels */}
                        <div className="col-span-4 p-5 bg-secondary/10 border border-border rounded-2xl space-y-2 relative group min-h-[140px]">
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
                                            <span className="text-lg font-black italic">
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
                        <div className="col-span-4 p-5 bg-secondary/10 border border-border rounded-2xl flex flex-col gap-4 relative">
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

                            {/* Bottom layout: Background/Experience + Proficiency Badge */}
                            <div className="flex gap-4">
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

                                {/* Proficiency Bonus Badge */}
                                <div className="flex flex-col items-center justify-center bg-primary text-primary-foreground rounded-xl p-4 min-w-[100px] shadow-lg border border-primary/30 shrink-0">
                                    <span className="text-[10px] uppercase font-black tracking-widest leading-none opacity-90 text-primary-foreground/80 mb-2">Proficiency</span>
                                    <span className="text-3xl font-black leading-none">+{proficiencyBonus}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Premium Character Profile Editor Modal */}
            {mounted && isExpandedModalOpen && createPortal(
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-0 md:p-4 bg-background md:bg-black/60 md:backdrop-blur-sm animate-in fade-in duration-200">
                    <ModalScrollLock isOpen={isExpandedModalOpen} />
                    <div className="bg-background w-full h-full md:h-auto max-w-5xl rounded-none md:rounded-2xl shadow-none md:shadow-2xl border-0 md:border border-border overflow-hidden animate-in md:zoom-in-95 duration-200 flex flex-col justify-between md:max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-secondary/30 shrink-0">
                            <div className="flex items-center gap-2">
                                <User className="text-primary" size={20} />
                                <h2 className="text-xl font-black uppercase tracking-wider text-foreground">Character Profile</h2>
                            </div>
                            <button
                                onClick={() => setIsExpandedModalOpen(false)}
                                className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 md:flex-initial md:max-h-[65vh] overflow-y-auto custom-scrollbar p-6 space-y-6">
                            {/* Navigation & Action Toolbar */}
                            <div className="flex justify-between items-center px-4 py-3 bg-secondary/20 border border-border rounded-xl shadow-xs">
                                {onReturn ? (
                                    <button
                                        onClick={() => {
                                            setIsExpandedModalOpen(false);
                                            onReturn();
                                        }}
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
                                    {onExport && (
                                        <button
                                            onClick={onExport}
                                            title="Export Character Sheet"
                                            className="p-2 bg-background hover:bg-secondary rounded-lg border border-border text-foreground transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
                                        >
                                            <Download size={18} />
                                        </button>
                                    )}
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

                            {/* Responsive Columns */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                {/* Character Name and Basics */}
                                <div className="md:col-span-4 p-5 sm:p-6 bg-secondary/10 border border-border rounded-2xl flex items-center gap-4 sm:gap-6">
                                    {/* Image Upload/Display */}
                                    <div className="relative group shrink-0">
                                        <div className="w-20 h-20 sm:w-24 md:w-32 md:h-32 rounded-full border-4 border-card bg-background flex items-center justify-center overflow-hidden shadow-md">
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
                                            className="w-full text-xl sm:text-2xl font-black bg-transparent border-b-2 border-transparent hover:border-border focus:border-primary focus:outline-none transition-all py-0.5 truncate"
                                            placeholder="Enter Name..."
                                        />
                                    </div>
                                </div>

                                {/* Classes and Levels */}
                                <div className="md:col-span-4 p-5 bg-secondary/10 border border-border rounded-2xl space-y-2 relative group min-h-[140px]">
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
                                                    <span className="text-lg font-black italic">
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
                                <div className="md:col-span-4 p-5 bg-secondary/10 border border-border rounded-2xl flex flex-col gap-4 relative">
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

                                        {/* Proficiency Bonus Badge */}
                                        <div className="flex sm:flex-col items-center justify-between sm:justify-center bg-primary text-primary-foreground rounded-xl px-5 py-3 sm:p-4 min-w-full sm:min-w-[100px] shadow-lg border border-primary/30 shrink-0">
                                            <span className="text-[10px] uppercase font-black tracking-widest leading-none opacity-90 text-primary-foreground/80 sm:mb-2">Proficiency</span>
                                            <span className="text-xl sm:text-3xl font-black leading-none">+{proficiencyBonus}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-secondary/30 border-t border-border flex justify-end shrink-0">
                            <button
                                onClick={() => setIsExpandedModalOpen(false)}
                                className="px-10 py-3 bg-primary text-primary-foreground text-sm font-black uppercase tracking-[0.2em] rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Remove Class Modal */}
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

            {/* Delete Character Modal */}
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

            {mounted && isEditingClasses && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-background md:bg-black/50 md:backdrop-blur-sm animate-in fade-in duration-200">
                    <ModalScrollLock isOpen={isEditingClasses} />
                    <div className="bg-background w-full h-full md:h-auto max-w-2xl rounded-none md:rounded-2xl shadow-none md:shadow-2xl border-0 md:border border-border overflow-hidden animate-in md:zoom-in-95 duration-200 flex flex-col justify-between">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-secondary/30 shrink-0">
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

                        <div className="p-6 space-y-4 flex-1 md:flex-initial md:max-h-[60vh] overflow-y-auto custom-scrollbar">
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
                </div>,
                document.body
            )}

            {isEditingSettings && (
                <ThemeSettings onClose={() => setIsEditingSettings(false)} />
            )}
        </>
    );
};

export default CharacterHeader;
