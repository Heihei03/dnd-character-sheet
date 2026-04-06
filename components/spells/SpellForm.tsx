import React, { useState, useEffect } from "react";
import Button from "../ui/button";
import { Spell, AbilityScores, CharacterClass } from "../../types/character";
import { DAMAGE_TYPES, SPELL_SCHOOLS, SPELL_AOE_SHAPES } from "../../utils/constants";
import EntityForm from "../ui/EntityForm";

interface SpellFormProps {
    spell: Spell;
    onSave: (spell: Spell) => void;
    onCancel: () => void;
    abilityScores: AbilityScores;
    proficiencyBonus: number;
    totalLevel: number;
    classes: CharacterClass[];
    isEditing: boolean;
}

const SpellForm: React.FC<SpellFormProps> = ({
    spell,
    onSave,
    onCancel,
    abilityScores,
    proficiencyBonus,
    totalLevel,
    classes,
    isEditing
}) => {
    const [localSpell, setLocalSpell] = useState<Spell>(spell);

    useEffect(() => {
        setLocalSpell(spell);
    }, [spell]);

    const handleLocalUpdate = (field: keyof Spell, value: any) => {
        setLocalSpell(prev => ({ ...prev, [field]: value }));
    };

    const handleLocalComponentUpdate = (component: keyof Spell["components"], value: boolean) => {
        setLocalSpell(prev => ({
            ...prev,
            components: { ...prev.components, [component]: value }
        }));
    };

    const handleSave = () => {
        onSave(localSpell);
    };

    return (
        <EntityForm
            title={isEditing ? `Edit ${spell.name}` : "New Spell"}
            onSave={handleSave}
            onCancel={onCancel}
            saveLabel={isEditing ? "Save Changes" : "Add Spell"}
            isEditing={isEditing}
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm mb-1 font-semibold text-gray-500 uppercase text-xs">Name</label>
                        <input
                            className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:border-gray-700"
                            value={localSpell.name || ""}
                            onChange={(e) => handleLocalUpdate("name", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1 font-semibold text-gray-500 uppercase text-xs">Level</label>
                        <select
                            className="border rounded px-3 py-2 w-full text-sm dark:bg-gray-900 dark:border-gray-700 font-medium"
                            value={localSpell.level}
                            onChange={(e) => handleLocalUpdate("level", parseInt(e.target.value) || 0)}
                        >
                            <option value={0}>Cantrip</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(l => <option key={l} value={l}>Level {l}</option>)}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm mb-1 font-semibold text-gray-500 uppercase text-xs">School</label>
                        <select
                            className="border rounded px-3 py-2 w-full text-sm dark:bg-gray-900 dark:border-gray-700 font-medium"
                            value={localSpell.school || "Evocation"}
                            onChange={(e) => handleLocalUpdate("school", e.target.value)}
                        >
                            {SPELL_SCHOOLS.map((school: string) => (
                                <option key={school} value={school}>{school}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm mb-1 font-semibold text-gray-500 uppercase text-xs">Casting Time</label>
                        <input
                            className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:border-gray-700"
                            value={localSpell.castingTime || ""}
                            onChange={(e) => handleLocalUpdate("castingTime", e.target.value)}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm mb-1 font-semibold text-gray-500 uppercase text-xs">Range</label>
                        <input
                            className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:border-gray-700"
                            value={localSpell.range || ""}
                            onChange={(e) => handleLocalUpdate("range", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1 font-semibold text-gray-500 uppercase text-xs">Duration</label>
                        <input
                            className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:border-gray-700"
                            value={localSpell.duration || ""}
                            onChange={(e) => handleLocalUpdate("duration", e.target.value)}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm mb-1 font-semibold text-gray-500 uppercase text-xs">Components</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-1 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={localSpell.components?.v}
                                    onChange={(e) => handleLocalComponentUpdate("v", e.target.checked)}
                                /> V
                            </label>
                            <label className="flex items-center gap-1 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={localSpell.components?.s}
                                    onChange={(e) => handleLocalComponentUpdate("s", e.target.checked)}
                                /> S
                            </label>
                            <label className="flex items-center gap-1 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={localSpell.components?.m}
                                    onChange={(e) => handleLocalComponentUpdate("m", e.target.checked)}
                                /> M
                            </label>
                        </div>
                        {localSpell.components?.m && (
                            <input
                                className="border rounded px-3 py-1 w-full mt-1 text-sm dark:bg-gray-900 dark:border-gray-700"
                                placeholder="Material..."
                                value={localSpell.material || ""}
                                onChange={(e) => handleLocalUpdate("material", e.target.value)}
                            />
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm mb-1 font-semibold text-gray-500 uppercase text-xs">Flags & AoE</label>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                            <label className="flex items-center gap-2 text-xs">
                                <input type="checkbox" checked={localSpell.isRitual || false} onChange={(e) => handleLocalUpdate("isRitual", e.target.checked)} /> Ritual
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                                <input type="checkbox" checked={localSpell.requiresConcentration || false} onChange={(e) => handleLocalUpdate("requiresConcentration", e.target.checked)} /> Concentration
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                                <input type="checkbox" checked={localSpell.hasAttack || false} onChange={(e) => handleLocalUpdate("hasAttack", e.target.checked)} /> Attack
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                                <input type="checkbox" checked={localSpell.hasSave || false} onChange={(e) => handleLocalUpdate("hasSave", e.target.checked)} /> Save
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                                <input type="checkbox" checked={localSpell.hasHeal || false} onChange={(e) => handleLocalUpdate("hasHeal", e.target.checked)} /> Heal
                            </label>
                            <label className="flex items-center gap-2 text-xs font-bold text-blue-600">
                                <input type="checkbox" checked={localSpell.hasAoe || false} onChange={(e) => handleLocalUpdate("hasAoe", e.target.checked)} /> AoE
                            </label>
                        </div>
                    </div>
                </div>

                {localSpell.hasAoe && (
                    <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div>
                            <label className="block text-xs font-bold uppercase text-blue-700 dark:text-blue-300 mb-1">AoE Shape</label>
                            <select
                                className="border rounded px-2 py-1 w-full text-sm dark:bg-gray-800"
                                value={localSpell.aoeShape || ""}
                                onChange={(e) => handleLocalUpdate("aoeShape", e.target.value)}
                            >
                                <option value="">Select Shape...</option>
                                {SPELL_AOE_SHAPES.map(shape => (
                                    <option key={shape} value={shape}>{shape}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-blue-700 dark:text-blue-300 mb-1">AoE Size</label>
                            <input
                                className="border rounded px-2 py-1 w-full text-sm dark:bg-gray-800"
                                placeholder="e.g. 15 ft"
                                value={localSpell.aoeSize || ""}
                                onChange={(e) => handleLocalUpdate("aoeSize", e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm mb-1 font-semibold text-gray-500 uppercase text-xs">Spellcasting Ability</label>
                        <select
                            className="border rounded px-3 py-2 w-full text-sm dark:bg-gray-900 dark:border-gray-700 font-medium"
                            value={localSpell.spellcastingAbility || ""}
                            onChange={(e) => handleLocalUpdate("spellcastingAbility", e.target.value || undefined)}
                        >
                            <option value="">None</option>
                            <option value="strength">Strength</option>
                            <option value="dexterity">Dexterity</option>
                            <option value="constitution">Constitution</option>
                            <option value="intelligence">Intelligence</option>
                            <option value="wisdom">Wisdom</option>
                            <option value="charisma">Charisma</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm mb-1 font-semibold text-gray-500 uppercase text-xs">Source Class</label>
                        <select
                            className="border rounded px-3 py-2 w-full text-sm dark:bg-gray-900 dark:border-gray-700 font-medium"
                            value={localSpell.classSource || ""}
                            onChange={(e) => handleLocalUpdate("classSource", e.target.value || undefined)}
                        >
                            <option value="">None (General)</option>
                            {classes.map(cls => (
                                <option key={cls.name} value={cls.name}>{cls.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {localSpell.level === 0 && (
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50 space-y-1">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-blue-700 dark:text-blue-300">Scales with Character Level</label>
                            <input
                                type="checkbox"
                                checked={localSpell.scalesWithCharacterLevel || false}
                                onChange={(e) => handleLocalUpdate("scalesWithCharacterLevel", e.target.checked)}
                                className="w-5 h-5 cursor-pointer accent-blue-600"
                            />
                        </div>
                        <p className="text-xs text-blue-600/70 dark:text-blue-400/70 italic leading-tight">
                            Cantrip damage/healing will increase at levels 5, 11, and 17.
                        </p>
                    </div>
                )}

                {(localSpell.hasAttack || localSpell.hasSave || localSpell.damageOnly || localSpell.hasHeal) && (
                    <div className="space-y-4 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg border dark:border-gray-800">
                        <div className="grid grid-cols-2 gap-4">
                            {(localSpell.hasAttack || localSpell.hasSave || localSpell.damageOnly) && (
                                <>
                                    <div>
                                        <label className="block text-sm mb-1 font-medium text-gray-500 uppercase text-[10px]">Base Damage / Effect</label>
                                        <input
                                            className="border rounded px-3 py-2 w-full text-sm dark:bg-gray-800 font-mono"
                                            placeholder="e.g. 8d6"
                                            value={localSpell.damage || ""}
                                            onChange={(e) => handleLocalUpdate("damage", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1 font-medium text-gray-500 uppercase text-[10px]">At Higher Levels (Damage)</label>
                                        <input
                                            className="border rounded px-3 py-2 w-full text-sm dark:bg-gray-800 font-mono"
                                            placeholder="e.g. 1d6"
                                            value={localSpell.higherLevelDamage || ""}
                                            onChange={(e) => handleLocalUpdate("higherLevelDamage", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1 font-medium text-gray-500 uppercase text-[10px]">Damage Type</label>
                                        <select
                                            className="border rounded px-3 py-2 w-full text-sm dark:bg-gray-800"
                                            value={localSpell.damageType || ""}
                                            onChange={(e) => handleLocalUpdate("damageType", e.target.value || undefined)}
                                        >
                                            <option value="">None</option>
                                            {DAMAGE_TYPES.map((type: string) => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {localSpell.hasSave && (
                                        <div>
                                            <label className="block text-sm mb-1 font-medium text-gray-500 uppercase text-[10px]">Save Type</label>
                                            <select
                                                className="border rounded px-3 py-2 w-full text-sm dark:bg-gray-800 font-medium"
                                                value={localSpell.saveType || ""}
                                                onChange={(e) => handleLocalUpdate("saveType", e.target.value || undefined)}
                                            >
                                                <option value="">None</option>
                                                <option value="strength">Strength</option>
                                                <option value="dexterity">Dexterity</option>
                                                <option value="constitution">Constitution</option>
                                                <option value="intelligence">Intelligence</option>
                                                <option value="wisdom">Wisdom</option>
                                                <option value="charisma">Charisma</option>
                                            </select>
                                        </div>
                                    )}
                                </>
                            )}
                            {localSpell.hasHeal && (
                                <>
                                    <div>
                                        <label className="block text-sm mb-1 font-medium text-gray-500 uppercase text-[10px]">Base Healing</label>
                                        <input
                                            className="border rounded px-3 py-2 w-full text-sm dark:bg-gray-800 font-mono"
                                            placeholder="e.g. 1d4 + 4"
                                            value={localSpell.healing || ""}
                                            onChange={(e) => handleLocalUpdate("healing", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1 font-medium text-gray-500 uppercase text-[10px]">At Higher Levels (Healing)</label>
                                        <input
                                            className="border rounded px-3 py-2 w-full text-sm dark:bg-gray-800 font-mono"
                                            placeholder="e.g. 1d4"
                                            value={localSpell.higherLevelHealing || ""}
                                            onChange={(e) => handleLocalUpdate("higherLevelHealing", e.target.value)}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="space-y-1">
                            <label className="block text-xs font-bold uppercase text-gray-400">At Higher Levels (Description)</label>
                            <textarea
                                className="border rounded px-3 py-2 w-full text-sm dark:bg-gray-800 min-h-[60px]"
                                placeholder="The damage increases by 1d6 for each slot level above 3rd..."
                                value={localSpell.atHigherLevels || ""}
                                onChange={(e) => handleLocalUpdate("atHigherLevels", e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="block text-sm mb-1 font-semibold text-gray-500 uppercase text-xs">Description</label>
                    <textarea 
                        className="border rounded px-3 py-2 w-full min-h-[100px] dark:bg-gray-900 dark:border-gray-700 font-serif text-sm" 
                        value={localSpell.description || ""} 
                        onChange={(e) => handleLocalUpdate("description", e.target.value)} 
                    />
                </div>
                
                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50 space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Prepared for Combat</label>
                        <input
                            type="checkbox"
                            checked={localSpell.prepared || false}
                            onChange={(e) => handleLocalUpdate("prepared", e.target.checked)}
                            className="w-5 h-5 cursor-pointer accent-blue-600 rounded border-gray-300"
                        />
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight italic">
                        {localSpell.level === 0
                            ? "Cantrips are always prepared and show in the Actions tab."
                            : "Level 1+ spells must be prepared to show up in the Actions & Attacks tab."}
                    </p>
                </div>
            </div>
        </EntityForm>
    );
};

export default SpellForm;
