"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import ConfirmationModal from "./ui/ConfirmationModal";
import { FeatureModifier, ModifierType, MODIFIER_TYPES } from "../types/modifiers";
import { SENSES_LIST, DAMAGE_TYPES, CONDITION_TYPES, speedTypes, SKILL_LIST, LANGUAGES, REGAIN_TYPES, ROLL_TYPES } from "../utils/constants";
import { TOOL_DATA } from "../data/tools";
import { ABILITY_NAMES } from "../utils/character-utils";
import { ACTION_TYPES } from "../types/character";

interface FeatureModifierEditorProps {
    modifiers: FeatureModifier[];
    onUpdate: (modifiers: FeatureModifier[]) => void;
    parentName?: string;
}

const FeatureModifierEditor: React.FC<FeatureModifierEditorProps> = ({ modifiers, onUpdate, parentName }) => {
    const [modToDelete, setModToDelete] = useState<string | null>(null);
    const addModifier = () => {
        const newModifier: FeatureModifier = {
            id: Date.now().toString(),
            type: "Other",
            subType: "",
            value: "",
        };
        onUpdate([...modifiers, newModifier]);
    };

    const updateModifier = (id: string, updates: Partial<FeatureModifier>) => {
        const newModifiers = modifiers.map(m => {
            if (m.id === id) {
                const updated = { ...m, ...updates };
                // Autopopulate name from feature name (parentName) if empty
                if (parentName) {
                    if (updates.type === "New Action" && !updated.value) {
                        updated.value = parentName;
                    } else if (updates.type === "Resource" && (!updated.value || updated.value === "{}")) {
                        updated.value = JSON.stringify({ name: parentName, max: 0, regain: "Long Rest" });
                    }
                }
                return updated;
            }
            return m;
        });
        onUpdate(newModifiers);
    };

    const removeModifier = (id: string) => {
        onUpdate(modifiers.filter(m => m.id !== id));
    };

    const getSuggestionsForType = (type: ModifierType): string[] => {
        switch (type) {
            case "Sense":
                return SENSES_LIST;
            case "Resistance":
            case "Immunity":
            case "Vulnerability":
                return [...DAMAGE_TYPES, ...CONDITION_TYPES];
            case "Speed":
                return speedTypes;
            case "Proficiency":
                return [
                    ...SKILL_LIST.map(s => s.name),
                    ...LANGUAGES,
                    ...Object.keys(TOOL_DATA)
                ].sort();
            case "Bonus":
                return ["AC", "Initiative", "Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma", "Saving Throws", "Global Bonus"].sort();
            case "Override":
                return ABILITY_NAMES;
            case "New Action":
                return [...ACTION_TYPES];
            case "Advantage":
            case "Disadvantage":
                return ROLL_TYPES;
            default:
                return [];
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase text-gray-500">Modifiers</label>
                <button
                    onClick={addModifier}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider flex items-center gap-1"
                >
                    <Plus className="w-3 h-3" /> Add Modifier
                </button>
            </div>
            <div className="space-y-2">
                {modifiers.map((mod) => {
                    const suggestions = getSuggestionsForType(mod.type);
                    const listId = `suggestions-${mod.id}`;

                    return (
                        <div key={mod.id} className="grid grid-cols-12 gap-2 items-start bg-white dark:bg-gray-950 p-2 rounded border border-gray-100 dark:border-gray-800">
                            <div className="col-span-3">
                                <select
                                    value={mod.type}
                                    onChange={(e) => updateModifier(mod.id, { type: e.target.value as ModifierType })}
                                    className="w-full text-xs p-1.5 border-none focus:ring-0 bg-transparent font-bold uppercase"
                                >
                                    {MODIFIER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="col-span-4 relative group">
                                {mod.type !== "Spell" && mod.type !== "Resource" && (
                                    <>
                                        <input
                                            type="text"
                                            list={listId}
                                            value={mod.subType || ""}
                                            onChange={(e) => updateModifier(mod.id, { subType: e.target.value })}
                                            className="w-full text-xs p-1.5 border-b border-dashed border-gray-200 dark:border-gray-800 focus:border-blue-500 focus:ring-0 bg-transparent"
                                            placeholder="Type..."
                                        />
                                        {suggestions.length > 0 && (
                                            <datalist id={listId}>
                                                {suggestions.map(s => <option key={s} value={s} />)}
                                            </datalist>
                                        )}
                                    </>
                                )}
                            </div>
                            <div className="col-span-3">
                                {mod.type === "Spell" ? (
                                    <div className="space-y-1">
                                        <div className="flex flex-wrap gap-2">
                                            {((mod.value as string) || "").split(",").filter(s => s.trim()).map((spellName, idx) => (
                                                <div key={idx} className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-sm px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm transition-all hover:bg-blue-100 dark:hover:bg-blue-900/50">
                                                    <span className="font-semibold text-blue-900 dark:text-blue-100">{spellName.trim()}</span>
                                                    <button
                                                        onClick={() => {
                                                            const currentSpells = ((mod.value as string) || "").split(",").filter(s => s.trim());
                                                            const newSpells = currentSpells.filter((_, i) => i !== idx);
                                                            updateModifier(mod.id, { value: newSpells.join(",") });
                                                        }}
                                                        className="text-blue-400 hover:text-red-500 transition-colors ml-1"
                                                        title="Remove spell"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <input
                                                type="text"
                                                className="flex-1 text-xs p-2 border-b border-dashed border-gray-200 dark:border-gray-800 focus:border-blue-500 focus:ring-0 bg-transparent font-medium"
                                                placeholder="Add spell name (e.g. Fireball)..."
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const target = e.target as HTMLInputElement;
                                                        const val = target.value.trim();
                                                        if (val) {
                                                            const currentSpells = ((mod.value as string) || "").split(",").filter(s => s.trim());
                                                            if (!currentSpells.includes(val)) {
                                                                updateModifier(mod.id, { value: [...currentSpells, val].join(",") });
                                                            }
                                                            target.value = "";
                                                        }
                                                    }
                                                }}
                                            />
                                            <button
                                                onClick={(e) => {
                                                    const input = (e.currentTarget.previousSibling as HTMLInputElement);
                                                    const val = input.value.trim();
                                                    if (val) {
                                                        const currentSpells = ((mod.value as string) || "").split(",").filter(s => s.trim());
                                                        if (!currentSpells.includes(val)) {
                                                            updateModifier(mod.id, { value: [...currentSpells, val].join(",") });
                                                        }
                                                        input.value = "";
                                                    }
                                                }}
                                                className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 p-2 rounded transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : mod.type === "Resource" ? (
                                    <div className="flex items-center h-full px-1.5 italic text-gray-400 text-[10px]">
                                        Configure below...
                                    </div>
                                ) : mod.type === "Advantage" || mod.type === "Disadvantage" || mod.type === "Resistance" || mod.type === "Immunity" || mod.type === "Vulnerability" ? (
                                    <div className="col-span-3" />
                                ) : (
                                    <input
                                        type="text"
                                        value={mod.value || ""}
                                        onChange={(e) => updateModifier(mod.id, { value: e.target.value })}
                                        className="w-full text-xs p-1.5 border-b border-dashed border-gray-200 dark:border-gray-800 focus:border-blue-500 focus:ring-0 bg-transparent"
                                        placeholder={mod.type === "New Action" && parentName ? parentName : "Value..."}
                                    />
                                )}
                            </div>
                            <div className="col-span-12">
                                {mod.type === "Resource" && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 mt-1 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-1">
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-gray-400">Resource Name</label>
                                            <input
                                                type="text"
                                                value={(() => {
                                                    try {
                                                        const data = JSON.parse(mod.value as string || "{}");
                                                        return data.name || "";
                                                    } catch {
                                                        return mod.value as string || "";
                                                    }
                                                })()}
                                                onChange={(e) => {
                                                    let current = {};
                                                    try { current = JSON.parse(mod.value as string || "{}"); } catch { /* ignore */ }
                                                    updateModifier(mod.id, { value: JSON.stringify({ ...current, name: e.target.value }) });
                                                }}
                                                className="w-full text-xs p-1.5 border rounded bg-white dark:bg-gray-900"
                                                placeholder={parentName || "e.g. Ki Points"}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] uppercase font-bold text-gray-400">Max Amount</label>
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="checkbox"
                                                        id={`prof-bonus-${mod.id}`}
                                                        checked={(() => {
                                                            try {
                                                                return !!JSON.parse(mod.value as string || "{}").useProficiencyBonus;
                                                            } catch {
                                                                return false;
                                                            }
                                                        })()}
                                                        onChange={(e) => {
                                                            let current = {};
                                                            try { current = JSON.parse(mod.value as string || "{}"); } catch { /* ignore */ }
                                                            updateModifier(mod.id, { value: JSON.stringify({ ...current, useProficiencyBonus: e.target.checked }) });
                                                        }}
                                                        className="w-3 h-3"
                                                    />
                                                    <label htmlFor={`prof-bonus-${mod.id}`} className="text-[9px] text-gray-500 whitespace-nowrap">Prof. Bonus</label>
                                                </div>
                                            </div>
                                            <input
                                                type="number"
                                                value={(() => {
                                                    try {
                                                        const data = JSON.parse(mod.value as string || "{}");
                                                        if (data.useProficiencyBonus) return "";
                                                        return data.max || 0;
                                                    } catch {
                                                        return 0;
                                                    }
                                                })()}
                                                disabled={(() => {
                                                    try {
                                                        return !!JSON.parse(mod.value as string || "{}").useProficiencyBonus;
                                                    } catch {
                                                        return false;
                                                    }
                                                })()}
                                                onChange={(e) => {
                                                    let current = {};
                                                    try { current = JSON.parse(mod.value as string || "{}"); } catch { /* ignore */ }
                                                    updateModifier(mod.id, { value: JSON.stringify({ ...current, max: parseInt(e.target.value) || 0 }) });
                                                }}
                                                className={`w-full text-xs p-1.5 border rounded bg-white dark:bg-gray-900 ${(() => {
                                                    try {
                                                        return !!JSON.parse(mod.value as string || "{}").useProficiencyBonus;
                                                    } catch {
                                                        return false;
                                                    }
                                                })() ? "bg-gray-100 text-gray-400" : ""
                                                    }`}
                                                placeholder={
                                                    (() => {
                                                        try {
                                                            return !!JSON.parse(mod.value as string || "{}").useProficiencyBonus;
                                                        } catch {
                                                            return false;
                                                        }
                                                    })() ? "Dynamic" : "Max"
                                                }
                                                min="0"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-gray-400">Regain On</label>
                                            <select
                                                value={(() => {
                                                    try {
                                                        return JSON.parse(mod.value as string || "{}").regain || "Long Rest";
                                                    } catch {
                                                        return mod.subType || "Long Rest";
                                                    }
                                                })()}
                                                onChange={(e) => {
                                                    let current = {};
                                                    try { current = JSON.parse(mod.value as string || "{}"); } catch { /* ignore */ }
                                                    const regain = e.target.value;
                                                    updateModifier(mod.id, {
                                                        subType: regain,
                                                        value: JSON.stringify({ ...current, regain })
                                                    });
                                                }}
                                                className="w-full text-xs p-1.5 border rounded bg-white dark:bg-gray-900"
                                            >
                                                {REGAIN_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="col-span-2 flex items-center gap-1.5 pt-1.5">
                                <input
                                    type="checkbox"
                                    id={`attune-${mod.id}`}
                                    checked={!!mod.requiresAttunement}
                                    onChange={(e) => updateModifier(mod.id, { requiresAttunement: e.target.checked })}
                                    className="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor={`attune-${mod.id}`} className="text-[10px] font-bold text-gray-400 uppercase cursor-pointer select-none">
                                    Attunement Required
                                </label>
                            </div>
                            <div className="col-span-1 flex justify-center pt-1.5">
                                <button
                                    onClick={() => setModToDelete(mod.id)}
                                    className="text-gray-400 hover:text-red-500 flex items-center justify-center pt-1"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
                {modifiers.length === 0 && (
                    <p className="text-xs text-gray-400 italic text-center py-2">No modifiers added.</p>
                )}
            </div>

            <ConfirmationModal
                isOpen={modToDelete !== null}
                onClose={() => setModToDelete(null)}
                onConfirm={() => {
                    if (modToDelete) {
                        removeModifier(modToDelete);
                        setModToDelete(null);
                    }
                }}
                title="Remove Modifier"
                message={`Are you sure you want to remove this ${modifiers.find(m => m.id === modToDelete)?.type} modifier?`}
                confirmText="Remove"
            />
        </div>
    );
};

export default FeatureModifierEditor;
