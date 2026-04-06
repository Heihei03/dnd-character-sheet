"use client";

import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { WEAPON_DATA } from "../data/weapons";
import { ARMOR_DATA } from "../data/armor";
import { TOOL_DATA } from "../data/tools";
import { Plus, X } from "lucide-react";
import Button from "./ui/button";
import FeatureItemPill from "./features/FeatureItemPill";
import { ToolProficiency, Character } from "../types/character";

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
                    <span className="text-muted-foreground/50 text-xs italic py-1">No proficiencies added</span>
                )}
            </div>
            {showAdd && (
                <div className="flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            autoFocus
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") addItem();
                                if (e.key === "Escape") setShowAdd(false);
                            }}
                            placeholder={`Add ${title.toLowerCase().split(' ')[0]}...`}
                            className="w-full p-2 text-sm border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none transition-all"
                            list={`${field}-options-visible`}
                        />
                        <datalist id={`${field}-options-visible`}>
                            {options.map((opt) => (
                                <option key={opt} value={opt} />
                            ))}
                        </datalist>
                    </div>
                    <Button
                        onClick={addItem}
                        className="py-1"
                    >
                        Add
                    </Button>
                </div>
            )}
        </div>
    );
};

interface ProficienciesLanguagesSectionProps {
    weaponProficiencies?: (string | { name: string, fromFeature: boolean, fromFeatureId?: string })[];
    armorProficiencies?: (string | { name: string, fromFeature: boolean, fromFeatureId?: string })[];
    toolProficiencies?: ToolProficiency[];
    languages?: (string | { name: string, fromFeature: boolean, fromFeatureId?: string })[];
    onUpdate: (field: keyof Character, value: (string | ToolProficiency | { name: string, fromFeature: boolean })[]) => void;
    onNavigateToFeature?: (featureId: string) => void;
}

const weaponOptions = ["Simple Weapons", "Martial Weapons", ...Object.keys(WEAPON_DATA)];
const armorOptions = ["Light Armor", "Medium Armor", "Heavy Armor", "Shields", ...Object.keys(ARMOR_DATA)];
const toolOptions = Object.keys(TOOL_DATA);
import { LANGUAGES } from "../utils/constants";

const ProficienciesLanguagesSection: React.FC<ProficienciesLanguagesSectionProps> = ({
    weaponProficiencies = [],
    armorProficiencies = [],
    toolProficiencies = [],
    languages = [],
    onUpdate,
    onNavigateToFeature,
}) => {
    const handleUpdate = (field: keyof Character, value: (string | ToolProficiency | { name: string, fromFeature: boolean })[]) => {
        // Filter out feature-granted items so they aren't persisted in the character's base data
        const baseValues = value
            .filter(item => {
                if (typeof item === 'object' && (item as any).fromFeature) return false;
                return true;
            })
            .map(item => {
                // For weapons, armor, and languages, convert the descriptive objects (if any remained) back to strings
                if (typeof item === 'object' && field !== "toolProficiencies") {
                    return (item as any).name as string;
                }
                return item;
            });

        onUpdate(field, baseValues as (string | ToolProficiency)[]);
    };

    return (
        <Card className="w-full h-fit">
            <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-center mb-4">Proficiencies & Languages</h2>
                <div className="space-y-2">
                    <ProficiencyList
                        title="Weapon Proficiencies"
                        items={weaponProficiencies}
                        field="weaponProficiencies"
                        onUpdate={handleUpdate}
                        options={weaponOptions}
                        onNavigateToFeature={onNavigateToFeature}
                    />
                    <ProficiencyList
                        title="Armor Proficiencies"
                        items={armorProficiencies}
                        field="armorProficiencies"
                        onUpdate={handleUpdate}
                        options={armorOptions}
                        onNavigateToFeature={onNavigateToFeature}
                    />
                    <ProficiencyList
                        title="Tool Proficiencies"
                        items={toolProficiencies}
                        field="toolProficiencies"
                        onUpdate={handleUpdate}
                        options={toolOptions}
                        onNavigateToFeature={onNavigateToFeature}
                    />
                    <ProficiencyList
                        title="Languages"
                        items={languages}
                        field="languages"
                        onUpdate={handleUpdate}
                        options={LANGUAGES}
                        onNavigateToFeature={onNavigateToFeature}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default ProficienciesLanguagesSection;
