"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { FeatureModifier } from "../../../types/modifiers";
import { ROLL_TYPES } from "../../../utils/constants";
import ThemedAutocomplete from "../../ui/ThemedAutocomplete";
import NumericInput from "../../ui/NumericInput";

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
                    <NumericInput
                        value={modifier.value || 0}
                        onChange={(val) => onUpdate({ value: val })}
                        variant="horizontal"
                        min={1}
                        className="w-20 border-none bg-transparent shadow-none"
                        inputClassName="text-xs p-1 border-b border-dashed border-border focus:border-primary font-mono text-center"
                        placeholder="1"
                    />
                )}
                <div className="relative flex-1">
                    <ThemedAutocomplete
                        value={inputValue}
                        onChange={(val: string) => {
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
                        options={ROLL_TYPES}
                        placeholder="Add target (e.g. Dexterity Attacks)..."
                    />
                </div>
            </div>
        </div>
    );
};

export default RollTargetModifier;
