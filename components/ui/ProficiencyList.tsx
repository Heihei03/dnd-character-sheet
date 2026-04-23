"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import FeatureItemPill from "../features/FeatureItemPill";
import ThemedAutocomplete from "./ThemedAutocomplete";
import { ToolProficiency, Character } from "../../types/character";
import { TOOL_DATA } from "../../data/tools";

interface ProficiencyListProps {
    title: string;
    items: (string | ToolProficiency | { name: string, fromFeature: boolean })[];
    field: keyof Character;
    onUpdate: (field: keyof Character, value: (string | ToolProficiency | { name: string, fromFeature: boolean })[]) => void;
    options?: string[];
    onNavigateToFeature?: (featureId: string) => void;
}

const ProficiencyList: React.FC<ProficiencyListProps> = ({
    title, items, field, onUpdate, options = [], onNavigateToFeature
}) => {
    const [newItem, setNewItem] = useState("");
    const [showAdd, setShowAdd] = useState(false);

    const addItem = () => {
        const trimmed = newItem.trim();
        if (trimmed) {
            const itemNames = items.map(i => typeof i === 'string' ? i : i.name);
            const isDuplicate = itemNames.some(
                (name) => name.toLowerCase() === trimmed.toLowerCase()
            );

            if (!isDuplicate) {
                if (field === "toolProficiencies") {
                    const toolData = TOOL_DATA[trimmed];
                    const newTool: ToolProficiency = {
                        id: `tool-${Math.random().toString(36).substr(2, 9)}`,
                        name: trimmed,
                        ability: toolData?.ability || "Intelligence",
                        level: "proficient"
                    };
                    onUpdate(field, [...items, newTool]);
                } else {
                    onUpdate(field, [...items, trimmed]);
                }
            }
            setNewItem("");
            setShowAdd(false);
        }
    };

    const removeItem = (index: number) => {
        onUpdate(field, items.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-2 pb-3 border-b border-border last:border-0 last:pb-0">
            <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-tight">{title}</h3>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="text-xs text-primary hover:opacity-80 font-medium transition-colors flex items-center gap-1"
                >
                    {showAdd ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />} {showAdd ? "Cancel" : "Add"}
                </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-w-full">
                {items.length > 0 ? (
                    items.map((item, index) => {
                        const itemName = typeof item === 'string' ? item : item.name;
                        const isFromFeature = typeof item === 'object' && item.fromFeature;

                        return (
                            <FeatureItemPill
                                key={index}
                                isFromFeature={isFromFeature}
                                featureId={isFromFeature ? (item as any).fromFeatureId : undefined}
                                onNavigateToFeature={onNavigateToFeature}
                            >
                                <span className="flex items-center gap-1 min-w-0">
                                    <span className="truncate">{itemName}</span>
                                </span>
                                {!isFromFeature && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeItem(index);
                                        }}
                                        className="text-primary/50 hover:text-red-500 transition-colors px-0.5 ml-0.5 flex items-center justify-center font-bold"
                                        title="Remove"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </FeatureItemPill>
                        );
                    })
                ) : (
                    <span className="text-muted-foreground/50 text-xs italic py-1">No {title.toLowerCase()} added</span>
                )}
            </div>
            {showAdd && (
                <div className="flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <ThemedAutocomplete
                        value={newItem}
                        onChange={setNewItem}
                        options={options}
                        placeholder={`Add ${title.toLowerCase().split(' ')[0]}...`}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                addItem();
                            }
                            if (e.key === "Escape") setShowAdd(false);
                        }}
                        className="flex-1"
                    />
                    <button
                        onClick={addItem}
                        className="p-2 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center justify-center min-w-[44px]"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProficiencyList;
