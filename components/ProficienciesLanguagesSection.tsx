"use client";

import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { WEAPON_DATA } from "../data/weapons";
import { ARMOR_DATA } from "../data/armor";
import { TOOL_DATA } from "../data/tools";
import { ToolProficiency } from "../types/character";
import { Plus, X } from "lucide-react";

interface ProficiencyListProps {
    title: string;
    items: (string | ToolProficiency | { name: string, fromFeature: boolean })[];
    field: string;
    onUpdate: (field: string, value: (string | ToolProficiency | { name: string, fromFeature: boolean })[]) => void;
    options?: string[];
}

const ProficiencyList: React.FC<ProficiencyListProps> = ({
    title, items, field, onUpdate, options = []
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
        <div className="space-y-2 pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
            <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-tight">{title}</h3>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors flex items-center gap-1"
                >
                    {showAdd ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />} {showAdd ? "Cancel" : "Add"}
                </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-w-full">
                {items.length > 0 ? (
                    items.map((item, index) => {
                        const itemName = typeof item === 'string' ? item : item.name;
                        const isFromFeature = typeof item === 'object' && item.fromFeature;

                        return (
                            <div
                                key={index}
                                className={`px-1.5 py-0.5 rounded border text-[13px] flex items-center gap-1 group whitespace-nowrap overflow-hidden text-ellipsis transition-colors ${isFromFeature
                                    ? "bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
                                    : "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/50 text-blue-700 dark:text-blue-300"
                                    }`}
                            >
                                <span className="flex items-center gap-1 min-w-0">
                                    <span className="truncate">{itemName}</span>
                                    {isFromFeature && (
                                        <span className="text-[8px] font-black bg-blue-500 text-white px-0.5 rounded uppercase leading-tight">F</span>
                                    )}
                                </span>
                                {!isFromFeature && (
                                    <button
                                        onClick={() => removeItem(index)}
                                        className="text-blue-300 hover:text-red-500 dark:text-blue-700 dark:hover:text-red-400 transition-colors px-0.5 ml-0.5 flex items-center justify-center font-bold"
                                        title="Remove"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <span className="text-gray-400 dark:text-gray-600 text-xs italic py-1">No proficiencies added</span>
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
                            className="w-full p-2 text-sm border dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900 focus:ring-1 focus:ring-blue-500 outline-none"
                            list={`${field}-options-visible`}
                        />
                        <datalist id={`${field}-options-visible`}>
                            {options.map((opt) => (
                                <option key={opt} value={opt} />
                            ))}
                        </datalist>
                    </div>
                    <button
                        onClick={addItem}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors whitespace-nowrap font-medium"
                    >
                        Add
                    </button>
                </div>
            )}
        </div>
    );
};

interface ProficienciesLanguagesSectionProps {
    weaponProficiencies?: (string | { name: string, fromFeature: boolean })[];
    armorProficiencies?: (string | { name: string, fromFeature: boolean })[];
    toolProficiencies?: ToolProficiency[];
    languages?: (string | { name: string, fromFeature: boolean })[];
    onUpdate: (field: string, value: (string | ToolProficiency | { name: string, fromFeature: boolean })[]) => void;
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
}) => {
    const handleUpdate = (field: string, value: (string | ToolProficiency | { name: string, fromFeature: boolean })[]) => {
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
                    />
                    <ProficiencyList
                        title="Armor Proficiencies"
                        items={armorProficiencies}
                        field="armorProficiencies"
                        onUpdate={handleUpdate}
                        options={armorOptions}
                    />
                    <ProficiencyList
                        title="Tool Proficiencies"
                        items={toolProficiencies}
                        field="toolProficiencies"
                        onUpdate={handleUpdate}
                        options={toolOptions}
                    />
                    <ProficiencyList
                        title="Languages"
                        items={languages}
                        field="languages"
                        onUpdate={handleUpdate}
                        options={LANGUAGES}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default ProficienciesLanguagesSection;
