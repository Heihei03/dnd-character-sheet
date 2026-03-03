import React, { useState, useEffect } from "react";
import Button from "./ui/button";
import { Edit2, Trash2, Zap } from "lucide-react";
import { Spell, AbilityScores } from "../types/character";
import { DAMAGE_TYPES, SPELL_SCHOOLS, SPELL_AOE_SHAPES } from "../utils/constants";

interface SpellCardProps {
    spell: Spell;
    level: number;
    editingSpellId: string | null;
    setEditingSpellId: (id: string | null) => void;
    handleUpdateSpell: (id: string, field: keyof Spell, value: any) => void;
    handleDeleteSpell: (id: string) => void;
    abilityScores: AbilityScores;
    proficiencyBonus: number;
    totalLevel: number;
}

const SpellCard: React.FC<SpellCardProps> = ({
    spell,
    level,
    editingSpellId,
    setEditingSpellId,
    handleUpdateSpell,
    handleDeleteSpell,
    abilityScores,
    proficiencyBonus,
    totalLevel
}) => {
    const [castLevel, setCastLevel] = useState(spell.level);

    // Reset cast level if spell base level changes
    useEffect(() => {
        setCastLevel(spell.level);
    }, [spell.level]);

    const calculateUpcastedValue = (baseValue: string, higherLevelValue: string, currentLevel: number, baseLevel: number) => {
        if (currentLevel <= baseLevel || !higherLevelValue) return baseValue;

        const diff = currentLevel - baseLevel;

        // Simple dice notation parser: (num)d(sides) + (mod)
        const diceRegex = /(\d+)?d(\d+)(\s*[\+\-]\s*\d+)?/i;
        const baseMatch = baseValue.match(diceRegex);
        const higherMatch = higherLevelValue.match(diceRegex);

        if (baseMatch && higherMatch) {
            const baseNum = parseInt(baseMatch[1] || "1");
            const baseSides = baseMatch[2];
            const baseMod = baseMatch[3] || "";

            const higherNum = parseInt(higherMatch[1] || "1");
            const higherSides = higherMatch[2];

            // Only combine if dice sides match
            if (baseSides === higherSides) {
                const totalNum = baseNum + (higherNum * diff);
                return `${totalNum}d${baseSides}${baseMod}`;
            }
        }

        // If not dice or sides don't match, just show the addition textually
        return `${baseValue} (+${diff}x ${higherLevelValue})`;
    };

    const calculateScaledCantripValue = (baseValue: string, currentLevel: number) => {
        if (!baseValue) return "";

        // 5e Cantrip scaling: 2 dice at 5th, 3 at 11th, 4 at 17th
        let multiplier = 1;
        if (currentLevel >= 17) multiplier = 4;
        else if (currentLevel >= 11) multiplier = 3;
        else if (currentLevel >= 5) multiplier = 2;

        if (multiplier === 1) return baseValue;

        const diceRegex = /(\d+)?d(\d+)(\s*[\+\-]\s*\d+)?/i;
        const match = baseValue.match(diceRegex);

        if (match) {
            const numDice = parseInt(match[1] || "1");
            const sides = match[2];
            const mod = match[3] || "";
            return `${numDice * multiplier}d${sides}${mod}`;
        }

        return `${baseValue} (x${multiplier})`;
    };

    const upcastedDamage = spell.damage
        ? (spell.level === 0 && spell.scalesWithCharacterLevel
            ? calculateScaledCantripValue(spell.damage, totalLevel)
            : calculateUpcastedValue(spell.damage, spell.higherLevelDamage || "", castLevel, spell.level))
        : "";

    const upcastedHealing = spell.healing
        ? (spell.level === 0 && spell.scalesWithCharacterLevel
            ? calculateScaledCantripValue(spell.healing, totalLevel)
            : calculateUpcastedValue(spell.healing, spell.higherLevelHealing || "", castLevel, spell.level))
        : "";

    return (
        <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    {editingSpellId === spell.id ? (
                        <div className="space-y-4 pr-10">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1 font-semibold">Name</label>
                                    <input className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:border-gray-700" value={spell.name || ""} onChange={(e) => handleUpdateSpell(spell.id, "name", e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1 font-semibold">Level</label>
                                    <select
                                        className="border rounded px-3 py-2 w-full text-sm dark:bg-gray-900 dark:border-gray-700"
                                        value={spell.level}
                                        onChange={(e) => handleUpdateSpell(spell.id, "level", parseInt(e.target.value) || 0)}
                                    >
                                        <option value={0}>Cantrip</option>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(l => <option key={l} value={l}>Level {l}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1 font-semibold">School</label>
                                    <select
                                        className="border rounded px-3 py-2 w-full text-sm dark:bg-gray-900 dark:border-gray-700"
                                        value={spell.school || "Evocation"}
                                        onChange={(e) => handleUpdateSpell(spell.id, "school", e.target.value)}
                                    >
                                        {SPELL_SCHOOLS.map((school: string) => (
                                            <option key={school} value={school}>{school}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm mb-1 font-semibold">Casting Time</label>
                                    <input className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:border-gray-700" value={spell.castingTime || ""} onChange={(e) => handleUpdateSpell(spell.id, "castingTime", e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1 font-semibold">Range</label>
                                    <input className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:border-gray-700" value={spell.range || ""} onChange={(e) => handleUpdateSpell(spell.id, "range", e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1 font-semibold">Duration</label>
                                    <input className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:border-gray-700" value={spell.duration || ""} onChange={(e) => handleUpdateSpell(spell.id, "duration", e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm mb-1 font-semibold">Components</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-1 text-sm cursor-pointer">
                                            <input type="checkbox" checked={!Array.isArray(spell.components as any) && (spell.components as any)?.v || Array.isArray(spell.components as any) && (spell.components as any).includes("V")} onChange={(e) => {
                                                const newComp = Array.isArray(spell.components as any) ? { v: (spell.components as any).includes("V"), s: (spell.components as any).includes("S"), m: (spell.components as any).includes("M") } : { ...spell.components } as any;
                                                handleUpdateSpell(spell.id, "components", { ...newComp, v: e.target.checked });
                                            }} /> V
                                        </label>
                                        <label className="flex items-center gap-1 text-sm cursor-pointer">
                                            <input type="checkbox" checked={!Array.isArray(spell.components as any) && (spell.components as any)?.s || Array.isArray(spell.components as any) && (spell.components as any).includes("S")} onChange={(e) => {
                                                const newComp = Array.isArray(spell.components as any) ? { v: (spell.components as any).includes("V"), s: (spell.components as any).includes("S"), m: (spell.components as any).includes("M") } : { ...spell.components } as any;
                                                handleUpdateSpell(spell.id, "components", { ...newComp, s: e.target.checked });
                                            }} /> S
                                        </label>
                                        <label className="flex items-center gap-1 text-sm cursor-pointer">
                                            <input type="checkbox" checked={!Array.isArray(spell.components as any) && (spell.components as any)?.m || Array.isArray(spell.components as any) && (spell.components as any).includes("M")} onChange={(e) => {
                                                const newComp = Array.isArray(spell.components as any) ? { v: (spell.components as any).includes("V"), s: (spell.components as any).includes("S"), m: (spell.components as any).includes("M") } : { ...spell.components } as any;
                                                handleUpdateSpell(spell.id, "components", { ...newComp, m: e.target.checked });
                                            }} /> M
                                        </label>
                                    </div>
                                    {(!Array.isArray(spell.components as any) && (spell.components as any)?.m || Array.isArray(spell.components as any) && (spell.components as any).includes("M")) && (
                                        <input className="border rounded px-3 py-1 w-full mt-1 text-sm dark:bg-gray-900 dark:border-gray-700" placeholder="Material..." value={spell.material || ""} onChange={(e) => handleUpdateSpell(spell.id, "material", e.target.value)} />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm mb-1 font-semibold">Flags & AoE</label>
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                        <label className="flex items-center gap-2 text-xs">
                                            <input type="checkbox" checked={spell.isRitual || false} onChange={(e) => handleUpdateSpell(spell.id, "isRitual", e.target.checked)} /> Ritual
                                        </label>
                                        <label className="flex items-center gap-2 text-xs">
                                            <input type="checkbox" checked={spell.requiresConcentration || false} onChange={(e) => handleUpdateSpell(spell.id, "requiresConcentration", e.target.checked)} /> Concentration
                                        </label>
                                        <label className="flex items-center gap-2 text-xs">
                                            <input type="checkbox" checked={spell.hasAttack || false} onChange={(e) => handleUpdateSpell(spell.id, "hasAttack", e.target.checked)} /> Attack
                                        </label>
                                        <label className="flex items-center gap-2 text-xs">
                                            <input type="checkbox" checked={spell.hasSave || false} onChange={(e) => handleUpdateSpell(spell.id, "hasSave", e.target.checked)} /> Save
                                        </label>
                                        <label className="flex items-center gap-2 text-xs">
                                            <input type="checkbox" checked={spell.hasHeal || false} onChange={(e) => handleUpdateSpell(spell.id, "hasHeal", e.target.checked)} /> Heal
                                        </label>
                                        <label className="flex items-center gap-2 text-xs font-bold text-blue-600">
                                            <input type="checkbox" checked={spell.hasAoe || false} onChange={(e) => handleUpdateSpell(spell.id, "hasAoe", e.target.checked)} /> AoE
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {spell.hasAoe && (
                                <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-blue-700 dark:text-blue-300 mb-1">AoE Shape</label>
                                        <select
                                            className="border rounded px-2 py-1 w-full text-sm dark:bg-gray-800"
                                            value={spell.aoeShape || ""}
                                            onChange={(e) => handleUpdateSpell(spell.id, "aoeShape", e.target.value)}
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
                                            value={spell.aoeSize || ""}
                                            onChange={(e) => handleUpdateSpell(spell.id, "aoeSize", e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1 font-semibold">Spellcasting Ability</label>
                                    <select
                                        className="border rounded px-3 py-2 w-full text-sm dark:bg-gray-900 dark:border-gray-700"
                                        value={spell.spellcastingAbility || ""}
                                        onChange={(e) => handleUpdateSpell(spell.id, "spellcastingAbility", e.target.value || undefined)}
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
                            </div>
                            {spell.level === 0 && (
                                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50 space-y-1 mb-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-blue-700 dark:text-blue-300">Scales with Character Level</label>
                                        <input
                                            type="checkbox"
                                            checked={spell.scalesWithCharacterLevel || false}
                                            onChange={(e) => handleUpdateSpell(spell.id, "scalesWithCharacterLevel", e.target.checked)}
                                            className="w-5 h-5 cursor-pointer accent-blue-600"
                                        />
                                    </div>
                                    <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70 italic leading-tight">
                                        Cantrip damage/healing will increase at levels 5, 11, and 17.
                                    </p>
                                </div>
                            )}

                            {(spell.hasAttack || spell.hasSave || spell.damageOnly || spell.hasHeal) && (
                                <div className="space-y-4 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg border dark:border-gray-800">
                                    <div className="grid grid-cols-2 gap-4">
                                        {(spell.hasAttack || spell.hasSave || spell.damageOnly) && (
                                            <>
                                                <div>
                                                    <label className="block text-sm mb-1 font-medium">Base Damage / Effect</label>
                                                    <input className="border rounded px-3 py-2 w-full text-sm dark:bg-gray-800" placeholder="e.g. 8d6" value={spell.damage || ""} onChange={(e) => handleUpdateSpell(spell.id, "damage", e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm mb-1 font-medium">At Higher Levels (Damage)</label>
                                                    <input className="border rounded px-3 py-2 w-full text-sm dark:bg-gray-800" placeholder="e.g. 1d6" value={spell.higherLevelDamage || ""} onChange={(e) => handleUpdateSpell(spell.id, "higherLevelDamage", e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm mb-1 font-medium">Damage Type</label>
                                                    <select
                                                        className="border rounded px-3 py-2 w-full text-sm dark:bg-gray-800"
                                                        value={spell.damageType || ""}
                                                        onChange={(e) => handleUpdateSpell(spell.id, "damageType", e.target.value || undefined)}
                                                    >
                                                        <option value="">None</option>
                                                        {DAMAGE_TYPES.map((type: string) => (
                                                            <option key={type} value={type}>{type}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {spell.hasSave && (
                                                    <div>
                                                        <label className="block text-sm mb-1 font-medium">Save Type</label>
                                                        <select
                                                            className="border rounded px-3 py-2 w-full text-sm dark:bg-gray-800"
                                                            value={spell.saveType || ""}
                                                            onChange={(e) => handleUpdateSpell(spell.id, "saveType", e.target.value || undefined)}
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
                                        {spell.hasHeal && (
                                            <>
                                                <div>
                                                    <label className="block text-sm mb-1 font-medium">Base Healing</label>
                                                    <input className="border rounded px-3 py-2 w-full text-sm dark:bg-gray-800" placeholder="e.g. 1d4 + 4" value={spell.healing || ""} onChange={(e) => handleUpdateSpell(spell.id, "healing", e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm mb-1 font-medium">At Higher Levels (Healing)</label>
                                                    <input className="border rounded px-3 py-2 w-full text-sm dark:bg-gray-800" placeholder="e.g. 1d4" value={spell.higherLevelHealing || ""} onChange={(e) => handleUpdateSpell(spell.id, "higherLevelHealing", e.target.value)} />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-xs font-bold uppercase text-gray-400">At Higher Levels (Description)</label>
                                        <textarea
                                            className="border rounded px-3 py-2 w-full text-sm dark:bg-gray-800 min-h-[60px]"
                                            placeholder="The damage increases by 1d6 for each slot level above 3rd..."
                                            value={spell.atHigherLevels || ""}
                                            onChange={(e) => handleUpdateSpell(spell.id, "atHigherLevels", e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-sm mb-1 font-semibold">Description</label>
                                <textarea className="border rounded px-3 py-2 w-full min-h-[100px] dark:bg-gray-900 dark:border-gray-700 font-serif" value={spell.description || ""} onChange={(e) => handleUpdateSpell(spell.id, "description", e.target.value)} />
                            </div>
                            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Prepared for Combat</label>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={spell.prepared || false}
                                        onChange={(e) => handleUpdateSpell(spell.id, "prepared", e.target.checked)}
                                        className="w-5 h-5 cursor-pointer accent-blue-600 rounded border-gray-300"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight italic">
                                    {spell.level === 0
                                        ? "Cantrips are always prepared and show in the Actions tab."
                                        : "Level 1+ spells must be prepared to show up in the Actions & Attacks tab."}
                                </p>
                            </div>
                            <div>
                                <Button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm" onClick={() => setEditingSpellId(null)}>Save Changes</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                {level > 0 && (
                                    <div className="flex items-center gap-2 mr-4 group/prepared">
                                        <input
                                            type="checkbox"
                                            checked={spell.prepared}
                                            onChange={(e) => handleUpdateSpell(spell.id, "prepared", e.target.checked)}
                                            title={spell.prepared ? "Unprepare spell" : "Prepare spell for combat"}
                                            className="w-4 h-4 cursor-pointer accent-blue-600"
                                        />
                                        {spell.prepared && (
                                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-800">
                                                Prepared
                                            </span>
                                        )}
                                    </div>
                                )}
                                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{spell.name}</h3>
                                {spell.fromFeature && <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 font-bold uppercase tracking-tight">From Feature</span>}
                                {spell.isRitual && <span className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800 font-bold uppercase tracking-tight">Ritual</span>}
                                {spell.requiresConcentration && <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 font-bold uppercase tracking-tight">Concentration</span>}
                                {spell.hasAttack && <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800 font-bold uppercase tracking-tight">Attack</span>}
                                {spell.hasSave && <span className="text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800 font-bold uppercase tracking-tight">Save</span>}
                                {spell.hasHeal && <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800 font-bold uppercase tracking-tight">Heal</span>}
                                <span className="text-sm text-gray-500 italic ml-1 dark:text-gray-400">{spell.school}</span>

                                {/* Upcasting Selector */}
                                {spell.level > 0 && (
                                    <div className="ml-auto flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg border border-blue-100 dark:border-blue-800">
                                        <Zap className="w-3 h-3 text-blue-500" />
                                        <label className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">Cast At:</label>
                                        <select
                                            value={castLevel}
                                            onChange={(e) => setCastLevel(parseInt(e.target.value))}
                                            className="bg-transparent text-xs font-bold text-blue-700 dark:text-blue-300 focus:outline-none"
                                        >
                                            {Array.from({ length: 10 - spell.level }, (_, i) => spell.level + i).map(l => (
                                                <option key={l} value={l} className="dark:bg-gray-900">Level {l}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-700 dark:text-gray-300">
                                <div className="flex flex-col"><span className="text-[10px] uppercase font-bold text-gray-400 leading-tight">Casting Time</span>{spell.castingTime}</div>
                                <div className="flex flex-col"><span className="text-[10px] uppercase font-bold text-gray-400 leading-tight">Range</span>{spell.range}</div>
                                <div className="flex flex-col"><span className="text-[10px] uppercase font-bold text-gray-400 leading-tight">Duration</span>{spell.duration}</div>
                                <div className="flex flex-col col-span-1 lg:col-span-1">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 leading-tight">Components</span>
                                    <span>
                                        {Array.isArray(spell.components as any)
                                            ? (spell.components as any).join(", ")
                                            : [
                                                (spell.components as any)?.v ? 'V' : null,
                                                (spell.components as any)?.s ? 'S' : null,
                                                (spell.components as any)?.m ? 'M' : null
                                            ].filter(Boolean).join(", ")
                                        } {(!Array.isArray(spell.components as any) && (spell.components as any)?.m || Array.isArray(spell.components as any) && (spell.components as any).includes("M")) && spell.material ? `(${spell.material})` : ""}
                                    </span>
                                </div>
                                {spell.hasAoe && (
                                    <div className="flex flex-col"><span className="text-[10px] uppercase font-bold text-blue-400 leading-tight">AoE</span>{spell.aoeSize} {spell.aoeShape}</div>
                                )}
                                {spell.spellcastingAbility && (
                                    <>
                                        {(() => {
                                            const abilityScore = abilityScores[spell.spellcastingAbility] || 10;
                                            const abilityModifier = Math.floor((abilityScore - 10) / 2);
                                            const attackBonus = abilityModifier + proficiencyBonus;
                                            const saveDC = 8 + abilityModifier + proficiencyBonus;
                                            return (
                                                <>
                                                    {spell.hasAttack && <div className="flex flex-col"><span className="text-[10px] uppercase font-bold text-red-400 leading-tight">Attack</span>+{attackBonus}</div>}
                                                    {spell.hasSave && <div className="flex flex-col"><span className="text-[10px] uppercase font-bold text-orange-400 leading-tight">Save DC</span>{saveDC} {spell.saveType ? `(${spell.saveType.slice(0, 3).toUpperCase()})` : ''}</div>}
                                                </>
                                            )
                                        })()}
                                    </>
                                )}
                                {(spell.hasAttack || spell.hasSave || spell.damageOnly) && spell.damage && (
                                    <div className="flex flex-col col-span-2">
                                        <span className="text-[10px] uppercase font-bold text-red-500 leading-tight">
                                            Damage {spell.level === 0 && spell.scalesWithCharacterLevel ? `(Scaled to Lvl ${totalLevel})` : (castLevel > spell.level ? `(Upcasted to Lvl ${castLevel})` : "")}
                                        </span>
                                        <span className={`font-mono font-bold ${(spell.level === 0 && spell.scalesWithCharacterLevel && totalLevel >= 5) || castLevel > spell.level ? "text-blue-600 dark:text-blue-400" : ""}`}>
                                            {upcastedDamage} {spell.damageType}
                                        </span>
                                    </div>
                                )}
                                {spell.hasHeal && spell.healing && (
                                    <div className="flex flex-col col-span-2">
                                        <span className="text-[10px] uppercase font-bold text-green-500 leading-tight">
                                            Healing {spell.level === 0 && spell.scalesWithCharacterLevel ? `(Scaled to Lvl ${totalLevel})` : (castLevel > spell.level ? `(Upcasted to Lvl ${castLevel})` : "")}
                                        </span>
                                        <span className={`font-mono font-bold ${(spell.level === 0 && spell.scalesWithCharacterLevel && totalLevel >= 5) || castLevel > spell.level ? "text-blue-600 dark:text-blue-400" : ""}`}>
                                            {upcastedHealing}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <p className="text-sm dark:text-gray-300 leading-relaxed font-serif whitespace-pre-wrap mt-2">{spell.description}</p>

                            {spell.atHigherLevels && (
                                <div className="mt-3 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/50 italic text-sm text-gray-600 dark:text-gray-400">
                                    <strong className="text-blue-700 dark:text-blue-300 text-xs uppercase not-italic">At Higher Levels: </strong>
                                    {spell.atHigherLevels}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                    {editingSpellId !== spell.id && (
                        <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={() => setEditingSpellId(spell.id)}>
                            <Edit2 className="w-5 h-5" />
                        </button>
                    )}
                    {!spell.fromFeature && (
                        <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" onClick={() => handleDeleteSpell(spell.id)}>
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SpellCard;
