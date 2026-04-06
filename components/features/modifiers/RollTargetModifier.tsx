"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { FeatureModifier } from "../../../types/modifiers";
import { ROLL_TYPES } from "../../../utils/constants";

interface RollTargetModifierProps {
    modifier: FeatureModifier;
    onUpdate: (updates: Partial<FeatureModifier>) => void;
}

const RollTargetModifier: React.FC<RollTargetModifierProps> = ({ modifier, onUpdate }) => {
    const [inputValue, setInputValue] = useState("");
    const tags = (modifier.subType || "").split(",").filter((s: string) => s.trim());

    const addTag = (val: string) => {
        const trimmed = val.trim();
        if (trimmed && !tags.includes(trimmed)) {
            onUpdate({ subType: [...tags, trimmed].join(", ") });
        }
        setInputValue("");
    };

    const removeTag = (idx: number) => {
        const newTags = tags.filter((_: string, i: number) => i !== idx);
        onUpdate({ subType: newTags.join(", ") });
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
                {tags.map((tag: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-1 bg-primary/10 text-[10px] px-2 py-0.5 rounded border border-primary/20 shadow-sm">
                        <span className="font-bold text-primary uppercase">{tag.trim()}</span>
                        <button
                            onClick={() => removeTag(idx)}
                            className="text-primary hover:text-red-500 transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                {modifier.type === "Extra Advantage" && (
                    <input
                        type="number"
                        value={modifier.value || 0}
                        onChange={(e) => onUpdate({ value: parseInt(e.target.value) || 0 })}
                        className="w-12 text-xs p-1 border-b border-dashed border-border focus:border-primary focus:ring-0 bg-transparent font-mono"
                        placeholder="1"
                        min="1"
                    />
                )}
                <div className="relative flex-1">
                    <input
                        type="text"
                        list={`roll-type-list-${modifier.id}`}
                        value={inputValue}
                        onChange={(e) => {
                            const val = e.target.value;
                            setInputValue(val);
                            if (ROLL_TYPES.includes(val)) {
                                addTag(val);
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addTag(inputValue);
                            }
                        }}
                        className="w-full text-xs p-1 border-b border-dashed border-border focus:border-primary focus:ring-0 bg-transparent"
                        placeholder="Add target (e.g. Dexterity Attacks)..."
                    />
                    <datalist id={`roll-type-list-${modifier.id}`}>
                        {ROLL_TYPES.map((t: string) => <option key={t} value={t} />)}
                    </datalist>
                </div>
            </div>
        </div>
    );
};

export default RollTargetModifier;
