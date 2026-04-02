"use client";

import { Plus, Trash2, X } from "lucide-react";
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
    const [inputValues, setInputValues] = useState<Record<string, string>>({});

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
                        updated.value = JSON.stringify({ name: parentName, max: 0, regain: "Long Rest", regainAmount: "All" });
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
            case "Extra Advantage":
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
                    <Plus className="w-3.5 h-3.5" /> Add Modifier
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
                            <div className="col-span-8">
                                {mod.type === "Roll" ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={mod.value || ""}
                                            onChange={(e) => updateModifier(mod.id, { value: e.target.value })}
                                            className="w-24 text-xs p-1.5 border-b border-dashed border-gray-200 dark:border-gray-800 focus:border-blue-500 focus:ring-0 bg-transparent font-mono"
                                            placeholder="Dice..."
                                        />
                                        <input
                                            type="text"
                                            list={`roll-type-${mod.id}`}
                                            value={mod.subType || ""}
                                            onChange={(e) => updateModifier(mod.id, { subType: e.target.value })}
                                            className="flex-1 text-xs p-1.5 border-b border-dashed border-gray-200 dark:border-gray-800 focus:border-blue-500 focus:ring-0 bg-transparent"
                                            placeholder="Type (Fire, Healing...)"
                                        />
                                        <datalist id={`roll-type-${mod.id}`}>
                                            {[...DAMAGE_TYPES, "Healing", "Temp HP"].sort().map(t => (
                                                <option key={t} value={t} />
                                            ))}
                                        </datalist>
                                    </div>
                                ) : mod.type === "Bonus" ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={mod.value || 0}
                                            onChange={(e) => updateModifier(mod.id, { value: parseInt(e.target.value) || 0 })}
                                            className="w-16 text-xs p-1.5 border-b border-dashed border-gray-200 dark:border-gray-800 focus:border-blue-500 focus:ring-0 bg-transparent font-mono"
                                        />
                                        <input
                                            type="text"
                                            list={`bonus-type-${mod.id}`}
                                            value={mod.subType || ""}
                                            onChange={(e) => updateModifier(mod.id, { subType: e.target.value })}
                                            className="flex-1 text-xs p-1.5 border-b border-dashed border-gray-200 dark:border-gray-800 focus:border-blue-500 focus:ring-0 bg-transparent"
                                            placeholder="Target (AC, Init...)"
                                        />
                                        <datalist id={`bonus-type-${mod.id}`}>
                                            {ROLL_TYPES.map(t => <option key={t} value={t} />)}
                                        </datalist>
                                    </div>
                                ) : mod.type === "Spell" ? (
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
                                        </div>
                                    </div>
                                ) : (mod.type === "New Action" || mod.type === "Resource") ? (
                                    <div className="flex items-center h-full px-1.5 italic text-gray-400 text-xs">
                                        Configure below...
                                    </div>
                                ) : mod.type === "Proficiency" ? (
                                    <select
                                        value={mod.value || "Proficient"}
                                        onChange={(e) => updateModifier(mod.id, { value: e.target.value })}
                                        className="w-full text-xs p-1.5 border-b border-dashed border-gray-200 dark:border-gray-800 focus:border-blue-500 focus:ring-0 bg-transparent font-medium"
                                    >
                                        <option value="Proficient">Proficient</option>
                                        <option value="Expertise">Expertise</option>
                                        <option value="Half Proficient">Half Proficient</option>
                                    </select>
                                ) : (mod.type === "Extra Advantage" || mod.type === "Advantage" || mod.type === "Disadvantage") ? (
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap gap-1.5">
                                            {(mod.subType || "").split(",").filter(s => s.trim()).map((tag, idx) => (
                                                <div key={idx} className="flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-[10px] px-2 py-0.5 rounded border border-green-100 dark:border-green-800 shadow-sm">
                                                    <span className="font-bold text-green-700 dark:text-green-400 uppercase">{tag.trim()}</span>
                                                    <button
                                                        onClick={() => {
                                                            const currentTags = (mod.subType || "").split(",").filter(s => s.trim());
                                                            const newTags = currentTags.filter((_, i) => i !== idx);
                                                            updateModifier(mod.id, { subType: newTags.join(", ") });
                                                        }}
                                                        className="text-green-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            {mod.type === "Extra Advantage" && (
                                                <input
                                                    type="number"
                                                    value={mod.value || 0}
                                                    onChange={(e) => updateModifier(mod.id, { value: parseInt(e.target.value) || 0 })}
                                                    className="w-12 text-xs p-1 border-b border-dashed border-gray-200 dark:border-gray-800 focus:border-blue-500 focus:ring-0 bg-transparent font-mono"
                                                    placeholder="1"
                                                    min="1"
                                                />
                                            )}
                                            <div className="relative flex-1">
                                                <input
                                                    type="text"
                                                    list={`roll-type-list-${mod.id}`}
                                                    value={inputValues[mod.id] || ""}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setInputValues({...inputValues, [mod.id]: val});
                                                        
                                                        // Check if the value matches one of the options exactly (which happens when selecting from datalist)
                                                        if (ROLL_TYPES.includes(val)) {
                                                            const currentTags = (mod.subType || "").split(",").filter(s => s.trim());
                                                            if (!currentTags.includes(val)) {
                                                                updateModifier(mod.id, { subType: [...currentTags, val].join(", ") });
                                                            }
                                                            setInputValues({...inputValues, [mod.id]: ""});
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const val = (e.target as HTMLInputElement).value.trim();
                                                            if (val) {
                                                                const currentTags = (mod.subType || "").split(",").filter(s => s.trim());
                                                                if (!currentTags.includes(val)) {
                                                                    updateModifier(mod.id, { subType: [...currentTags, val].join(", ") });
                                                                }
                                                                setInputValues({...inputValues, [mod.id]: ""});
                                                            }
                                                        }
                                                    }}
                                                    className="w-full text-xs p-1 border-b border-dashed border-gray-200 dark:border-gray-800 focus:border-blue-500 focus:ring-0 bg-transparent"
                                                    placeholder="Add target (e.g. Dexterity Attacks)..."
                                                />
                                                <datalist id={`roll-type-list-${mod.id}`}>
                                                    {ROLL_TYPES.map(t => <option key={t} value={t} />)}
                                                </datalist>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <input
                                            type="text"
                                            list={listId}
                                            value={mod.subType || ""}
                                            onChange={(e) => updateModifier(mod.id, { subType: e.target.value })}
                                            className="w-full text-xs p-1.5 border-b border-dashed border-gray-200 dark:border-gray-800 focus:border-blue-500 focus:ring-0 bg-transparent"
                                            placeholder="Type (e.g. Fire, Stealth)..."
                                        />
                                        {suggestions.length > 0 && (
                                            <datalist id={listId}>
                                                {suggestions.map(s => <option key={s} value={s} />)}
                                            </datalist>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="col-span-1 flex justify-end items-center">
                                <button
                                    onClick={() => removeModifier(mod.id)}
                                    className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="col-span-12">
                                {mod.type === "Resource" && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 mt-1 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-1">
                                        <div className="space-y-1">
                                            <label className="text-xs uppercase font-bold text-gray-400">Resource Name</label>
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
                                            <label className="text-xs uppercase font-bold text-gray-400">Max Scaling</label>
                                            <select
                                                value={(() => {
                                                    try {
                                                        const data = JSON.parse(mod.value as string || "{}");
                                                        if (data.useProficiencyBonus) return "pb";
                                                        if (data.useAbilityMod) return data.useAbilityMod;
                                                        if (data.useCharacterLevel) return "level";
                                                        return "fixed";
                                                    } catch { return "fixed"; }
                                                })()}
                                                onChange={(e) => {
                                                    let current = {};
                                                    try { current = JSON.parse(mod.value as string || "{}"); } catch { }
                                                    const val = e.target.value;
                                                    const updates = {
                                                        useProficiencyBonus: val === "pb",
                                                        useAbilityMod: ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"].includes(val) ? val : undefined,
                                                        useCharacterLevel: val === "level"
                                                    };
                                                    updateModifier(mod.id, { value: JSON.stringify({ ...current, ...updates }) });
                                                }}
                                                className="w-full text-xs p-1.5 border rounded bg-white dark:bg-gray-900"
                                            >
                                                <option value="fixed">Fixed</option>
                                                <option value="pb">Prof. Bonus</option>
                                                <option value="level">Level</option>
                                                {["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"].map(a => (
                                                    <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1, 3)} Mod</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs uppercase font-bold text-gray-400">
                                                {(() => {
                                                    try {
                                                        const data = JSON.parse(mod.value as string || "{}");
                                                        return (data.useProficiencyBonus || data.useAbilityMod || data.useCharacterLevel) ? "Multiplier" : "N/A";
                                                    } catch { return "Multiplier"; }
                                                })()}
                                            </label>
                                            <input
                                                type="number"
                                                value={(() => {
                                                    try {
                                                        const data = JSON.parse(mod.value as string || "{}");
                                                        return data.multiplier || 1;
                                                    } catch { return 1; }
                                                })()}
                                                disabled={(() => {
                                                    try {
                                                        const data = JSON.parse(mod.value as string || "{}");
                                                        return !(data.useProficiencyBonus || data.useAbilityMod || data.useCharacterLevel);
                                                    } catch { return true; }
                                                })()}
                                                onChange={(e) => {
                                                    let current = {};
                                                    try { current = JSON.parse(mod.value as string || "{}"); } catch { }
                                                    updateModifier(mod.id, { value: JSON.stringify({ ...current, multiplier: parseFloat(e.target.value) || 1 }) });
                                                }}
                                                className={`w-full text-xs p-1.5 border rounded bg-white dark:bg-gray-900 ${(() => {
                                                    try {
                                                        const data = JSON.parse(mod.value as string || "{}");
                                                        return (data.useProficiencyBonus || data.useAbilityMod || data.useCharacterLevel) ? "" : "bg-gray-100 text-gray-400";
                                                    } catch { return "bg-gray-100 text-gray-400"; }
                                                })()}`}
                                                placeholder="1"
                                                step="0.1"
                                                min="0"
                                            />
                                            {(() => {
                                                try {
                                                    const data = JSON.parse(mod.value as string || "{}");
                                                    return (data.useProficiencyBonus || data.useAbilityMod || data.useCharacterLevel) && (
                                                        <div className="text-[11px] text-gray-500 italic">Use 0.5 for half, etc.</div>
                                                    );
                                                } catch { return null; }
                                            })()}
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs uppercase font-bold text-gray-400">
                                                {(() => {
                                                    try {
                                                        const data = JSON.parse(mod.value as string || "{}");
                                                        return (data.useProficiencyBonus || data.useAbilityMod || data.useCharacterLevel) ? "Bonus" : "Max";
                                                    } catch { return "Max"; }
                                                })()}
                                            </label>
                                            <input
                                                type="number"
                                                value={(() => {
                                                    try {
                                                        const data = JSON.parse(mod.value as string || "{}");
                                                        return data.max || 0;
                                                    } catch { return 0; }
                                                })()}
                                                onChange={(e) => {
                                                    let current = {};
                                                    try { current = JSON.parse(mod.value as string || "{}"); } catch { }
                                                    updateModifier(mod.id, { value: JSON.stringify({ ...current, max: parseInt(e.target.value) || 0 }) });
                                                }}
                                                className="w-full text-xs p-1.5 border rounded bg-white dark:bg-gray-900"
                                                placeholder="0"
                                                min="0"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs uppercase font-bold text-gray-400">Regain On</label>
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
                                        <div className="space-y-1">
                                            <label className="text-xs uppercase font-bold text-gray-400">Regain Amount</label>
                                            <input
                                                type="text"
                                                value={(() => {
                                                    try {
                                                        const data = JSON.parse(mod.value as string || "{}");
                                                        return data.regainAmount || "All";
                                                    } catch {
                                                        return "All";
                                                    }
                                                })()}
                                                onChange={(e) => {
                                                    let current = {};
                                                    try { current = JSON.parse(mod.value as string || "{}"); } catch { /* ignore */ }
                                                    updateModifier(mod.id, { value: JSON.stringify({ ...current, regainAmount: e.target.value }) });
                                                }}
                                                className="w-full text-xs p-1.5 border rounded bg-white dark:bg-gray-900"
                                                placeholder="All, 1d6 + 1, etc."
                                            />
                                        </div>
                                    </div>
                                )}
                                {mod.type === "New Action" && (
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 mt-1 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-1">
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="text-xs uppercase font-bold text-gray-400">Action Name</label>
                                            <input
                                                type="text"
                                                value={(() => {
                                                    try {
                                                        const data = JSON.parse(mod.value as string || "{}");
                                                        return data.name || "";
                                                    } catch { return mod.value as string || ""; }
                                                })()}
                                                onChange={(e) => {
                                                    let current = {};
                                                    try { current = JSON.parse(mod.value as string || "{}"); } catch { }
                                                    updateModifier(mod.id, { value: JSON.stringify({ ...current, name: e.target.value }) });
                                                }}
                                                className="w-full text-xs p-1.5 border rounded bg-white dark:bg-gray-900"
                                                placeholder={parentName || "Action Name"}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs uppercase font-bold text-gray-400">Type</label>
                                            <select
                                                value={(() => {
                                                    try {
                                                        const data = JSON.parse(mod.value as string || "{}");
                                                        return data.type || mod.subType || "Action";
                                                    } catch { return mod.subType || "Action"; }
                                                })()}
                                                onChange={(e) => {
                                                    let current = {};
                                                    try { current = JSON.parse(mod.value as string || "{}"); } catch { }
                                                    updateModifier(mod.id, {
                                                        subType: e.target.value,
                                                        value: JSON.stringify({ ...current, type: e.target.value })
                                                    });
                                                }}
                                                className="w-full text-xs p-1.5 border rounded bg-white dark:bg-gray-900"
                                            >
                                                <option value="Action">Action</option>
                                                <option value="Bonus Action">Bonus Action</option>
                                                <option value="Reaction">Reaction</option>
                                                <option value="Attack">Attack</option>
                                                <option value="Free Action">Free Action</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs uppercase font-bold text-gray-400">Damage Dice</label>
                                            <input
                                                type="text"
                                                value={(() => {
                                                    try {
                                                        const data = JSON.parse(mod.value as string || "{}");
                                                        return data.damageDice || "";
                                                    } catch { return ""; }
                                                })()}
                                                onChange={(e) => {
                                                    let current = {};
                                                    try { current = JSON.parse(mod.value as string || "{}"); } catch { }
                                                    updateModifier(mod.id, { value: JSON.stringify({ ...current, damageDice: e.target.value }) });
                                                }}
                                                className="w-full text-xs p-1.5 border rounded bg-white dark:bg-gray-900 font-mono"
                                                placeholder="1d8"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs uppercase font-bold text-gray-400">Ability</label>
                                            <select
                                                value={(() => {
                                                    try {
                                                        const data = JSON.parse(mod.value as string || "{}");
                                                        return data.damageAbility || "";
                                                    } catch { return ""; }
                                                })()}
                                                onChange={(e) => {
                                                    let current = {};
                                                    try { current = JSON.parse(mod.value as string || "{}"); } catch { }
                                                    updateModifier(mod.id, { value: JSON.stringify({ ...current, damageAbility: e.target.value }) });
                                                }}
                                                className="w-full text-xs p-1.5 border rounded bg-white dark:bg-gray-900"
                                            >
                                                <option value="">None</option>
                                                <option value="strength">STR</option>
                                                <option value="dexterity">DEX</option>
                                                <option value="constitution">CON</option>
                                                <option value="intelligence">INT</option>
                                                <option value="wisdom">WIS</option>
                                                <option value="charisma">CHA</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="text-xs uppercase font-bold text-gray-400">Resource Link</label>
                                            <select
                                                value={(() => {
                                                    try {
                                                        const data = JSON.parse(mod.value as string || "{}");
                                                        return data.resourceId || "";
                                                    } catch { return ""; }
                                                })()}
                                                onChange={(e) => {
                                                    let current = {};
                                                    try { current = JSON.parse(mod.value as string || "{}"); } catch { }
                                                    const resId = e.target.value;
                                                    const linkedRes = modifiers.find(m => m.id === resId);
                                                    let resName = "";
                                                    if (linkedRes) {
                                                        try {
                                                            const resData = JSON.parse(linkedRes.value as string);
                                                            resName = resData.name;
                                                        } catch {
                                                            resName = linkedRes.value as string;
                                                        }
                                                    }
                                                    updateModifier(mod.id, { 
                                                        value: JSON.stringify({ 
                                                            ...current, 
                                                            resourceId: resId,
                                                            resourceName: resName || undefined 
                                                        }) 
                                                    });
                                                }}
                                                className="w-full text-xs p-1.5 border rounded bg-white dark:bg-gray-900"
                                            >
                                                <option value="">No Link</option>
                                                {modifiers
                                                    .filter(m => m.type === "Resource")
                                                    .map(m => {
                                                        let name = "";
                                                        try {
                                                            name = JSON.parse(m.value as string).name || "Unnamed Resource";
                                                        } catch {
                                                            name = m.value as string || "Unnamed Resource";
                                                        }
                                                        return <option key={m.id} value={m.id}>{name}</option>;
                                                    })
                                                }
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
                                    className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor={`attune-${mod.id}`} className="text-xs font-bold text-gray-400 uppercase cursor-pointer select-none">
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
