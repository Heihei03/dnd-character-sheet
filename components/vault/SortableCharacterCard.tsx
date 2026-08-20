"use client";

import React from "react";
import Link from "next/link";
import { Character } from "../../types/character";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    GripVertical,
    ChevronLeft,
    ChevronRight,
    Download,
    Trash2,
    UserCircle2,
    ChevronRight as LinkArrowRight,
} from "lucide-react";

interface SortableCharacterCardProps {
    character: Character;
    index: number;
    totalCount: number;
    isReorderMode: boolean;
    onExport: (character: Character) => void;
    onDelete: (character: Character) => void;
    onMove: (fromIndex: number, toIndex: number) => void;
}

export const SortableCharacterCard: React.FC<SortableCharacterCardProps> = ({
    character,
    index,
    totalCount,
    isReorderMode,
    onExport,
    onDelete,
    onMove,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: character.id,
        disabled: !isReorderMode,
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
        zIndex: isDragging ? 50 : "auto",
    };

    const getClassSummary = (char: Character) => {
        if (!char.classes || char.classes.length === 0) return "Classless";
        return char.classes.map((c) => `${c.name} ${c.level}`).join(" / ");
    };

    const getTotalLevel = (char: Character) => {
        return char.classes?.reduce((acc, c) => acc + c.level, 0) || 1;
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative bg-secondary/20 hover:bg-secondary/30 border rounded-2xl p-5 transition-all duration-300 flex flex-col ${
                isDragging
                    ? "border-primary shadow-2xl ring-2 ring-primary/40"
                    : isReorderMode
                    ? "border-primary/40 bg-secondary/25 hover:border-primary"
                    : "border-border hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5"
            }`}
        >
            {/* Main Clickable Area (Active when not in active reorder drag) */}
            <Link
                href={`/characters/${character.id}`}
                className="absolute inset-0 z-10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                aria-label={`Open character sheet for ${character.name}`}
            />

            {/* Top Toolbar / Header Info */}
            <div className="flex items-start gap-4 mb-4">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-xl bg-background border-2 border-border group-hover:border-primary/30 transition-colors overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                    {character.imageUrl ? (
                        <img
                            src={character.imageUrl}
                            alt={character.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <UserCircle2 size={40} className="text-muted-foreground/30" />
                    )}
                </div>

                {/* Info & Badges */}
                <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex items-start justify-between gap-2">
                        <h2 className="text-xl font-black truncate group-hover:text-primary transition-colors">
                            {character.name}
                        </h2>

                        {/* Reorder Grip Handle (Visible only in Reorder Mode) */}
                        {isReorderMode && (
                            <div className="relative z-20 flex items-center shrink-0">
                                <span className="text-[10px] font-black font-mono text-muted-foreground/60 mr-1 select-none">
                                    #{index + 1}
                                </span>
                                <button
                                    type="button"
                                    {...attributes}
                                    {...listeners}
                                    className="p-1.5 rounded-lg border bg-primary/15 border-primary/40 text-primary shadow-sm transition-all touch-none select-none cursor-grab active:cursor-grabbing hover:bg-primary/25"
                                    title="Drag to reorder"
                                    aria-label={`Drag to reorder ${character.name}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                >
                                    <GripVertical size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 uppercase tracking-tighter">
                            Lv {getTotalLevel(character)}
                        </span>
                        <span className="text-xs font-bold text-muted-foreground truncate uppercase border-l border-border pl-2">
                            {character.species || "Unknown"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Middle Content */}
            <div className="space-y-4 flex-1 flex flex-col">
                <div className="bg-background/40 rounded-xl p-3 border border-border/40">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">
                        Class Path
                    </label>
                    <p className="text-xs font-black italic text-foreground tracking-tight line-clamp-1">
                        {getClassSummary(character)}
                    </p>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                    {/* Character Sheet Link Indicator / Reorder Step Buttons */}
                    <div className="flex items-center gap-1.5">
                        {isReorderMode ? (
                            <div className="flex items-center gap-1 relative z-20">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (index > 0) onMove(index, index - 1);
                                    }}
                                    disabled={index === 0}
                                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-black uppercase tracking-wider bg-background/80 hover:bg-primary/20 hover:text-primary border border-border rounded-md disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
                                    title="Move earlier in list"
                                >
                                    <ChevronLeft size={12} />
                                    Move Left
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (index < totalCount - 1) onMove(index, index + 1);
                                    }}
                                    disabled={index >= totalCount - 1}
                                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-black uppercase tracking-wider bg-background/80 hover:bg-primary/20 hover:text-primary border border-border rounded-md disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
                                    title="Move later in list"
                                >
                                    Move Right
                                    <ChevronRight size={12} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity font-black text-[10px] uppercase tracking-widest">
                                Character Sheet <LinkArrowRight size={14} className="animate-pulse" />
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 relative z-20">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onExport(character);
                            }}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                            title="Export Character"
                        >
                            <Download size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onDelete(character);
                            }}
                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Delete Hero"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SortableCharacterCard;
