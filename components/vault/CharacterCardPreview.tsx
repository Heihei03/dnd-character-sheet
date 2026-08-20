"use client";

import React from "react";
import { Character } from "../../types/character";
import { GripVertical, UserCircle2 } from "lucide-react";

interface CharacterCardPreviewProps {
    character: Character;
    index?: number;
}

export const CharacterCardPreview: React.FC<CharacterCardPreviewProps> = ({
    character,
    index,
}) => {
    const getClassSummary = (char: Character) => {
        if (!char.classes || char.classes.length === 0) return "Classless";
        return char.classes.map((c) => `${c.name} ${c.level}`).join(" / ");
    };

    const getTotalLevel = (char: Character) => {
        return char.classes?.reduce((acc, c) => acc + c.level, 0) || 1;
    };

    return (
        <div className="bg-secondary/40 border-2 border-primary rounded-2xl p-5 shadow-2xl shadow-primary/20 cursor-grabbing flex flex-col scale-[1.03] backdrop-blur-sm pointer-events-none rotate-1">
            {/* Top Toolbar / Header Info */}
            <div className="flex items-start gap-4 mb-4">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-xl bg-background border-2 border-primary/40 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
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
                        <h2 className="text-xl font-black truncate text-primary">
                            {character.name}
                        </h2>

                        <div className="p-1.5 rounded-lg border bg-primary/20 border-primary/40 text-primary shadow-sm">
                            <GripVertical size={16} />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/30 uppercase tracking-tighter">
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
                <div className="bg-background/60 rounded-xl p-3 border border-border/40">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">
                        Class Path
                    </label>
                    <p className="text-xs font-black italic text-foreground tracking-tight line-clamp-1">
                        {getClassSummary(character)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CharacterCardPreview;
