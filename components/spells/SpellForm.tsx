import React, { useState, useEffect } from "react";
import Button from "../ui/button";
import { Spell, AbilityScores, CharacterClass } from "../../types/character";
import { DAMAGE_TYPES, SPELL_SCHOOLS, SPELL_AOE_SHAPES } from "../../utils/constants";
import EntityForm from "../ui/EntityForm";
import Select from "../ui/Select";
import ThemedAutocomplete from "../ui/ThemedAutocomplete";
import { ABILITY_NAMES, getCharacterSpellcastingAbility } from "../../utils/character-utils";

const LEVEL_OPTIONS = [
    { label: "Cantrip", value: "0" },
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(l => ({ label: `Level ${l}`, value: l.toString() }))
];

const SCHOOL_OPTIONS = SPELL_SCHOOLS.map(s => ({ label: s, value: s }));

const AOE_SHAPE_OPTIONS = [
    { label: "Select Shape...", value: "" },
    ...SPELL_AOE_SHAPES.map(s => ({ label: s, value: s }))
];

const ABILITY_OPTIONS = [
    { label: "None", value: "" },
    ...ABILITY_NAMES.map(a => ({ label: a.charAt(0).toUpperCase() + a.slice(1), value: a }))
];

const SAVE_TYPE_OPTIONS = [
    { label: "None", value: "" },
    ...ABILITY_NAMES.map(a => ({ label: a.charAt(0).toUpperCase() + a.slice(1), value: a }))
];

interface SpellFormProps {
    spell: Spell;
    onSave: (spell: Spell) => void;
    onCancel: () => void;
    abilityScores: AbilityScores;
    proficiencyBonus: number;
    totalLevel: number;
    classes: CharacterClass[];
    isEditing: boolean;
    summonStatblocks: any[];
}

const SpellForm: React.FC<SpellFormProps> = ({
    spell,
    onSave,
    onCancel,
    abilityScores,
    proficiencyBonus,
    totalLevel,
    classes,
    isEditing,
    summonStatblocks
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
                            className="border border-border rounded px-3 py-2 w-full bg-background focus:ring-1 focus:ring-primary outline-none"
                            value={localSpell.name || ""}
                            onChange={(e) => handleLocalUpdate("name", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1 font-semibold text-gray-500 uppercase text-xs">Level</label>
                        <Select
                            value={localSpell.level.toString()}
                            onValueChange={(val) => handleLocalUpdate("level", parseInt(val) || 0)}
                            options={LEVEL_OPTIONS}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm mb-1 font-semibold text-gray-500 uppercase text-xs">School</label>
                        <Select
                            value={localSpell.school || "Evocation"}
                            onValueChange={(val) => handleLocalUpdate("school", val)}
                            options={SCHOOL_OPTIONS}
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1 font-semibold text-gray-500 uppercase text-xs">Casting Time</label>
                        <input
                            className="border border-border rounded px-3 py-2 w-full bg-background focus:ring-1 focus:ring-primary outline-none"
                            value={localSpell.castingTime || ""}
                            onChange={(e) => handleLocalUpdate("castingTime", e.target.value)}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm mb-1 font-semibold text-gray-500 uppercase text-xs">Range</label>
                        <input
                            className="border border-border rounded px-3 py-2 w-full bg-background focus:ring-1 focus:ring-primary outline-none"
                            value={localSpell.range || ""}
                            onChange={(e) => handleLocalUpdate("range", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1 font-semibold text-gray-500 uppercase text-xs">Duration</label>
                        <input
                            className="border border-border rounded px-3 py-2 w-full bg-background focus:ring-1 focus:ring-primary outline-none"
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
                                    className="accent-primary"
                                /> V
                            </label>
                            <label className="flex items-center gap-1 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={localSpell.components?.s}
                                    onChange={(e) => handleLocalComponentUpdate("s", e.target.checked)}
                                    className="accent-primary"
                                /> S
                            </label>
                            <label className="flex items-center gap-1 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={localSpell.components?.m}
                                    onChange={(e) => handleLocalComponentUpdate("m", e.target.checked)}
                                    className="accent-primary"
                                /> M
                            </label>
                        </div>
                        {localSpell.components?.m && (
                            <input
                                className="border border-border rounded px-3 py-1 w-full mt-1 text-sm bg-background focus:ring-1 focus:ring-primary outline-none"
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
                                <input type="checkbox" className="accent-primary" checked={localSpell.isRitual || false} onChange={(e) => handleLocalUpdate("isRitual", e.target.checked)} /> Ritual
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                                <input type="checkbox" className="accent-primary" checked={localSpell.requiresConcentration || false} onChange={(e) => handleLocalUpdate("requiresConcentration", e.target.checked)} /> Concentration
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                                <input type="checkbox" className="accent-primary" checked={localSpell.hasAttack || false} onChange={(e) => handleLocalUpdate("hasAttack", e.target.checked)} /> Attack
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                                <input type="checkbox" className="accent-primary" checked={localSpell.hasSave || false} onChange={(e) => handleLocalUpdate("hasSave", e.target.checked)} /> Save
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                                <input type="checkbox" className="accent-primary" checked={localSpell.hasHeal || false} onChange={(e) => handleLocalUpdate("hasHeal", e.target.checked)} /> Heal
                            </label>
                            <label className="flex items-center gap-2 text-xs font-bold text-primary">
                                <input type="checkbox" className="accent-primary" checked={localSpell.hasAoe || false} onChange={(e) => handleLocalUpdate("hasAoe", e.target.checked)} /> AoE
                            </label>
                        </div>
                    </div>
                </div>

                {localSpell.hasAoe && (
                    <div className="grid grid-cols-2 gap-4 p-3 bg-primary/10 rounded-lg border border-primary/20 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div>
                            <label className="block text-xs font-bold uppercase text-blue-700 dark:text-blue-300 mb-1">AoE Shape</label>
                            <Select
                                value={localSpell.aoeShape || ""}
                                onValueChange={(val) => handleLocalUpdate("aoeShape", val)}
                                options={AOE_SHAPE_OPTIONS}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-blue-700 dark:text-blue-300 mb-1">AoE Size</label>
                            <input
                                className="border border-border rounded px-2 py-1 w-full text-sm bg-background focus:ring-1 focus:ring-primary outline-none"
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
                        <Select
                            value={(localSpell.spellcastingAbility as string) || ""}
                            onValueChange={(val) => handleLocalUpdate("spellcastingAbility", val || undefined)}
                            options={ABILITY_OPTIONS}
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1 font-semibold text-gray-500 uppercase text-xs">Source Class</label>
                        <Select
                            value={localSpell.classSource || ""}
                            onValueChange={(val) => handleLocalUpdate("classSource", val || undefined)}
                            options={[
                                { label: "None (General)", value: "" },
                                ...classes.map(cls => ({ label: cls.name, value: cls.name }))
                            ]}
                        />
                    </div>
                </div>

                {localSpell.level === 0 && (
                    <div className="bg-primary/10 p-3 rounded-lg border border-primary/20 space-y-1">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-primary">Scales with Character Level</label>
                            <input
                                type="checkbox"
                                checked={localSpell.scalesWithCharacterLevel || false}
                                onChange={(e) => handleLocalUpdate("scalesWithCharacterLevel", e.target.checked)}
                                className="w-5 h-5 cursor-pointer accent-primary"
                            />
                        </div>
                        <p className="text-xs text-blue-600/70 dark:text-blue-400/70 italic leading-tight">
                            Cantrip damage/healing will increase at levels 5, 11, and 17.
                        </p>
                    </div>
                )}

                {(localSpell.hasAttack || localSpell.hasSave || localSpell.damageOnly || localSpell.hasHeal) && (
                    <div className="space-y-4 p-3 bg-secondary/30 rounded-lg border border-border">
                        <div className="grid grid-cols-2 gap-4">
                            {(localSpell.hasAttack || localSpell.hasSave || localSpell.damageOnly) && (
                                <>
                                    <div>
                                        <label className="block text-sm mb-1 font-medium text-gray-500 uppercase text-[10px]">Base Damage / Effect</label>
                                        <input
                                            className="border border-border rounded px-3 py-2 w-full text-sm bg-background focus:ring-1 focus:ring-primary outline-none font-mono"
                                            placeholder="e.g. 8d6"
                                            value={localSpell.damage || ""}
                                            onChange={(e) => handleLocalUpdate("damage", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1 font-medium text-gray-500 uppercase text-[10px]">At Higher Levels (Damage)</label>
                                        <input
                                            className="border border-border rounded px-3 py-2 w-full text-sm bg-background focus:ring-1 focus:ring-primary outline-none font-mono"
                                            placeholder="e.g. 1d6"
                                            value={localSpell.higherLevelDamage || ""}
                                            onChange={(e) => handleLocalUpdate("higherLevelDamage", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1 font-medium text-gray-500 uppercase text-[10px]">Damage Type</label>
                                        <ThemedAutocomplete
                                            value={localSpell.damageType || ""}
                                            onChange={(val: string) => handleLocalUpdate("damageType", val || undefined)}
                                            options={Array.from(DAMAGE_TYPES)}
                                            placeholder="None"
                                        />
                                    </div>
                                    {localSpell.hasSave && (
                                        <div>
                                            <label className="block text-sm mb-1 font-medium text-gray-500 uppercase text-[10px]">Save Type</label>
                                            <Select
                                                value={(localSpell.saveType as string) || ""}
                                                onValueChange={(val) => handleLocalUpdate("saveType", val || undefined)}
                                                options={SAVE_TYPE_OPTIONS}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                            {localSpell.hasHeal && (
                                <>
                                    <div>
                                        <label className="block text-sm mb-1 font-medium text-gray-500 uppercase text-[10px]">Base Healing</label>
                                        <input
                                            className="border border-border rounded px-3 py-2 w-full text-sm bg-background focus:ring-1 focus:ring-primary outline-none font-mono"
                                            placeholder="e.g. 1d4 + 4"
                                            value={localSpell.healing || ""}
                                            onChange={(e) => handleLocalUpdate("healing", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1 font-medium text-gray-500 uppercase text-[10px]">At Higher Levels (Healing)</label>
                                        <input
                                            className="border border-border rounded px-3 py-2 w-full text-sm bg-background focus:ring-1 focus:ring-primary outline-none font-mono"
                                            placeholder="e.g. 1d4"
                                            value={localSpell.higherLevelHealing || ""}
                                            onChange={(e) => handleLocalUpdate("higherLevelHealing", e.target.value)}
                                        />
                                    </div>
                                    {(() => {
                                        const deducedAbility = getCharacterSpellcastingAbility({ classes, abilityScores } as any, localSpell);
                                        const deducedAbilityStr = String(deducedAbility);
                                        const deducedAbilityName = deducedAbilityStr.charAt(0).toUpperCase() + deducedAbilityStr.slice(1);
                                        return (
                                            <div className="col-span-2 mt-2 bg-green-500/5 dark:bg-green-500/10 p-3 rounded-lg border border-green-500/20 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-bold text-green-700 dark:text-green-400 cursor-pointer select-none" htmlFor="add-spellcasting-mod">
                                                        Add Spellcasting Ability Modifier
                                                    </label>
                                                    <input
                                                        id="add-spellcasting-mod"
                                                        type="checkbox"
                                                        checked={localSpell.addSpellcastingModifier || false}
                                                        onChange={(e) => handleLocalUpdate("addSpellcastingModifier", e.target.checked)}
                                                        className="w-5 h-5 cursor-pointer accent-green-600 rounded border-green-500/20"
                                                    />
                                                </div>
                                                <p className="text-[10px] text-green-600/70 dark:text-green-400/70 italic leading-tight">
                                                    Adds your spellcasting modifier ({deducedAbilityName}) to healing rolls.
                                                </p>
                                            </div>
                                        );
                                    })()}
                                </>
                            )}
                        </div>
                        <div className="space-y-1">
                            <label className="block text-xs font-bold uppercase text-gray-400">At Higher Levels (Description)</label>
                            <textarea
                                className="border border-border rounded px-3 py-2 w-full text-sm bg-background focus:ring-1 focus:ring-primary outline-none min-h-[60px]"
                                placeholder="The damage increases by 1d6 for each slot level above 3rd..."
                                value={localSpell.atHigherLevels || ""}
                                onChange={(e) => handleLocalUpdate("atHigherLevels", e.target.value)}
                            />
                        </div>
                        {(localSpell.hasAttack || localSpell.hasSave) && (
                            <div className="space-y-1">
                                <label className="block text-xs font-bold uppercase text-gray-400">Additional Effect (in addition to damage)</label>
                                <input
                                    className="border border-border rounded px-3 py-2 w-full text-sm bg-background focus:ring-1 focus:ring-primary outline-none"
                                    placeholder="e.g. Target is knocked prone, poisoned, etc."
                                    value={localSpell.effect || ""}
                                    onChange={(e) => handleLocalUpdate("effect", e.target.value)}
                                />
                            </div>
                        )}
                        {localSpell.hasSave && (
                            <div className="space-y-1">
                                <label className="block text-xs font-bold uppercase text-gray-400">On Successful Save</label>
                                <input
                                    className="border border-border rounded px-3 py-2 w-full text-sm bg-background focus:ring-1 focus:ring-primary outline-none"
                                    placeholder="e.g. Half damage, Negates effect"
                                    value={localSpell.passEffect || ""}
                                    onChange={(e) => handleLocalUpdate("passEffect", e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="block text-sm mb-1 font-semibold text-gray-500 uppercase text-xs">Description</label>
                    <textarea 
                        className="border border-border rounded px-3 py-2 w-full min-h-[100px] bg-background focus:ring-1 focus:ring-primary outline-none font-serif text-sm" 
                        value={localSpell.description || ""} 
                        onChange={(e) => handleLocalUpdate("description", e.target.value)} 
                    />
                </div>

                <div className="bg-secondary/30 p-3 rounded-lg border border-border space-y-2">
                    <label className="block text-sm font-bold text-gray-500 uppercase text-xs">Linked Summon Statblock</label>
                    <Select
                        value={localSpell.linkedSummonStatblockId || ""}
                        onValueChange={(val) => handleLocalUpdate("linkedSummonStatblockId", val || undefined)}
                        options={[
                            { label: "None", value: "" },
                            ...summonStatblocks.map(s => ({ label: s.name, value: s.id }))
                        ]}
                    />
                    <p className="text-[10px] text-gray-500 italic leading-tight">
                        Link a creature template to add a quick "Summon" button to this spell.
                    </p>
                </div>
                
                <div className="bg-primary/10 p-3 rounded-lg border border-primary/20 space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Prepared for Combat</label>
                        <input
                            type="checkbox"
                            checked={localSpell.prepared || false}
                            onChange={(e) => handleLocalUpdate("prepared", e.target.checked)}
                            className="w-5 h-5 cursor-pointer accent-primary rounded border-border"
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
