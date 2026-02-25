import React from "react";
import Button from "./ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { Spell, AbilityScores } from "../types/character";
import { DAMAGE_TYPES, SPELL_SCHOOLS } from "../utils/constants";

interface SpellCardProps {
    spell: Spell;
    level: number;
    editingSpellId: string | null;
    setEditingSpellId: (id: string | null) => void;
    handleUpdateSpell: (id: string, field: keyof Spell, value: any) => void;
    handleDeleteSpell: (id: string) => void;
    abilityScores: AbilityScores;
    proficiencyBonus: number;
}

const SpellCard: React.FC<SpellCardProps> = ({
    spell,
    level,
    editingSpellId,
    setEditingSpellId,
    handleUpdateSpell,
    handleDeleteSpell,
    abilityScores,
    proficiencyBonus
}) => {
    return (
        <div className="p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    {editingSpellId === spell.id ? (
                        <div className="space-y-4 pr-10">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1">Name</label>
                                    <input className="border rounded px-3 py-2 w-full" value={spell.name} onChange={(e) => handleUpdateSpell(spell.id, "name", e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Level</label>
                                    <select
                                        className="border rounded px-3 py-2 w-full text-sm"
                                        value={spell.level}
                                        onChange={(e) => handleUpdateSpell(spell.id, "level", parseInt(e.target.value) || 0)}
                                    >
                                        <option value={0}>Cantrip</option>
                                        <option value={1}>Level 1</option>
                                        <option value={2}>Level 2</option>
                                        <option value={3}>Level 3</option>
                                        <option value={4}>Level 4</option>
                                        <option value={5}>Level 5</option>
                                        <option value={6}>Level 6</option>
                                        <option value={7}>Level 7</option>
                                        <option value={8}>Level 8</option>
                                        <option value={9}>Level 9</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1">School</label>
                                    <select
                                        className="border rounded px-3 py-2 w-full text-sm"
                                        value={spell.school}
                                        onChange={(e) => handleUpdateSpell(spell.id, "school", e.target.value)}
                                    >
                                        {SPELL_SCHOOLS.map((school: string) => (
                                            <option key={school} value={school}>{school}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Casting Time</label>
                                    <input className="border rounded px-3 py-2 w-full" value={spell.castingTime} onChange={(e) => handleUpdateSpell(spell.id, "castingTime", e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1">Range</label>
                                    <input className="border rounded px-3 py-2 w-full" value={spell.range} onChange={(e) => handleUpdateSpell(spell.id, "range", e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Duration</label>
                                    <input className="border rounded px-3 py-2 w-full" value={spell.duration} onChange={(e) => handleUpdateSpell(spell.id, "duration", e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm mb-1 font-semibold">Components</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-1 text-sm">
                                            <input type="checkbox" checked={!Array.isArray(spell.components as any) && (spell.components as any)?.v || Array.isArray(spell.components as any) && (spell.components as any).includes("V")} onChange={(e) => {
                                                const newComp = Array.isArray(spell.components as any) ? { v: (spell.components as any).includes("V"), s: (spell.components as any).includes("S"), m: (spell.components as any).includes("M") } : { ...spell.components } as any;
                                                handleUpdateSpell(spell.id, "components", { ...newComp, v: e.target.checked });
                                            }} /> V
                                        </label>
                                        <label className="flex items-center gap-1 text-sm">
                                            <input type="checkbox" checked={!Array.isArray(spell.components as any) && (spell.components as any)?.s || Array.isArray(spell.components as any) && (spell.components as any).includes("S")} onChange={(e) => {
                                                const newComp = Array.isArray(spell.components as any) ? { v: (spell.components as any).includes("V"), s: (spell.components as any).includes("S"), m: (spell.components as any).includes("M") } : { ...spell.components } as any;
                                                handleUpdateSpell(spell.id, "components", { ...newComp, s: e.target.checked });
                                            }} /> S
                                        </label>
                                        <label className="flex items-center gap-1 text-sm">
                                            <input type="checkbox" checked={!Array.isArray(spell.components as any) && (spell.components as any)?.m || Array.isArray(spell.components as any) && (spell.components as any).includes("M")} onChange={(e) => {
                                                const newComp = Array.isArray(spell.components as any) ? { v: (spell.components as any).includes("V"), s: (spell.components as any).includes("S"), m: (spell.components as any).includes("M") } : { ...spell.components } as any;
                                                handleUpdateSpell(spell.id, "components", { ...newComp, m: e.target.checked });
                                            }} /> M
                                        </label>
                                    </div>
                                    {(!Array.isArray(spell.components as any) && (spell.components as any)?.m || Array.isArray(spell.components as any) && (spell.components as any).includes("M")) && (
                                        <input className="border rounded px-3 py-1 w-full mt-1 text-sm" placeholder="Material..." value={spell.material || ""} onChange={(e) => handleUpdateSpell(spell.id, "material", e.target.value)} />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm mb-1 font-semibold">Tags</label>
                                    <div className="flex flex-col gap-2">
                                        <label className="flex items-center gap-2 text-sm">
                                            <input type="checkbox" checked={spell.isRitual || false} onChange={(e) => handleUpdateSpell(spell.id, "isRitual", e.target.checked)} /> Ritual
                                        </label>
                                        <label className="flex items-center gap-2 text-sm">
                                            <input type="checkbox" checked={spell.requiresConcentration || false} onChange={(e) => handleUpdateSpell(spell.id, "requiresConcentration", e.target.checked)} /> Concentration
                                        </label>
                                        <label className="flex items-center gap-2 text-sm">
                                            <input type="checkbox" checked={spell.hasAttack || false} onChange={(e) => handleUpdateSpell(spell.id, "hasAttack", e.target.checked)} /> Attack
                                        </label>
                                        <label className="flex items-center gap-2 text-sm">
                                            <input type="checkbox" checked={spell.hasSave || false} onChange={(e) => handleUpdateSpell(spell.id, "hasSave", e.target.checked)} /> Save
                                        </label>
                                        <label className="flex items-center gap-2 text-sm">
                                            <input type="checkbox" checked={spell.hasHeal || false} onChange={(e) => handleUpdateSpell(spell.id, "hasHeal", e.target.checked)} /> Heal
                                        </label>
                                        <label className="flex items-center gap-2 text-sm">
                                            <input type="checkbox" checked={spell.damageOnly || false} onChange={(e) => handleUpdateSpell(spell.id, "damageOnly", e.target.checked)} /> Damage Only
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1">Spellcasting Ability</label>
                                    <select
                                        className="border rounded px-3 py-2 w-full text-sm"
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

                            {(spell.hasAttack || spell.hasSave || spell.damageOnly || spell.hasHeal) && (
                                <div className="grid grid-cols-2 gap-4">
                                    {(spell.hasAttack || spell.hasSave || spell.damageOnly) && (
                                        <>
                                            <div>
                                                <label className="block text-sm mb-1">Damage / Effect</label>
                                                <input className="border rounded px-3 py-2 w-full text-sm" placeholder="e.g. 8d6" value={spell.damage || ""} onChange={(e) => handleUpdateSpell(spell.id, "damage", e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="block text-sm mb-1">Damage Type</label>
                                                <select
                                                    className="border rounded px-3 py-2 w-full text-sm"
                                                    value={spell.damageType || ""}
                                                    onChange={(e) => handleUpdateSpell(spell.id, "damageType", e.target.value || undefined)}
                                                >
                                                    <option value="">None</option>
                                                    {DAMAGE_TYPES.map((type: string) => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </>
                                    )}
                                    {spell.hasHeal && (
                                        <div>
                                            <label className="block text-sm mb-1">Healing</label>
                                            <input className="border rounded px-3 py-2 w-full text-sm" placeholder="e.g. 1d4 + 4" value={spell.healing || ""} onChange={(e) => handleUpdateSpell(spell.id, "healing", e.target.value)} />
                                        </div>
                                    )}
                                    {spell.hasSave && (
                                        <div>
                                            <label className="block text-sm mb-1">Save Type</label>
                                            <select
                                                className="border rounded px-3 py-2 w-full text-sm"
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
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-sm mb-1">Description</label>
                                <textarea className="border rounded px-3 py-2 w-full min-h-[100px]" value={spell.description} onChange={(e) => handleUpdateSpell(spell.id, "description", e.target.value)} />
                            </div>
                            <div className="flex items-center space-x-2 pb-2">
                                <label className="text-sm">Prepared</label>
                                <input
                                    type="checkbox"
                                    checked={spell.prepared}
                                    onChange={(e) => handleUpdateSpell(spell.id, "prepared", e.target.checked)}
                                    className="w-4 h-4 cursor-pointer"
                                />
                            </div>
                            <div>
                                <Button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => setEditingSpellId(null)}>Done</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                {level > 0 && (
                                    <div className="flex items-center mr-2">
                                        <input
                                            type="checkbox"
                                            checked={spell.prepared}
                                            onChange={(e) => handleUpdateSpell(spell.id, "prepared", e.target.checked)}
                                            title="Prepared"
                                            className="w-4 h-4 cursor-pointer"
                                        />
                                    </div>
                                )}
                                <h3 className="font-bold text-lg">{spell.name}</h3>
                                {spell.isRitual && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200">Ritual</span>}
                                {spell.requiresConcentration && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">Concentration</span>}
                                {spell.hasAttack && <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full border border-red-200">Attack</span>}
                                {spell.hasSave && <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full border border-orange-200">Save</span>}
                                {spell.hasHeal && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full border border-green-200">Heal</span>}
                                {spell.damageOnly && <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full border border-gray-200">Damage Only</span>}
                                <span className="text-sm text-gray-500 italic ml-2">{spell.school}</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-700">
                                <div><strong>Casting Time:</strong> {spell.castingTime}</div>
                                <div><strong>Range:</strong> {spell.range}</div>
                                <div className="col-span-2">
                                    <strong>Components:</strong> {
                                        Array.isArray(spell.components as any)
                                            ? (spell.components as any).join(", ")
                                            : [
                                                (spell.components as any)?.v ? 'V' : null,
                                                (spell.components as any)?.s ? 'S' : null,
                                                (spell.components as any)?.m ? 'M' : null
                                            ].filter(Boolean).join(", ")
                                    } {(!Array.isArray(spell.components as any) && (spell.components as any)?.m || Array.isArray(spell.components as any) && (spell.components as any).includes("M")) && spell.material ? `(${spell.material})` : ""}
                                </div>
                                <div><strong>Duration:</strong> {spell.duration}</div>
                                {spell.spellcastingAbility && (
                                    <>
                                        {(() => {
                                            const abilityScore = abilityScores[spell.spellcastingAbility] || 10;
                                            const abilityModifier = Math.floor((abilityScore - 10) / 2);
                                            const attackBonus = abilityModifier + proficiencyBonus;
                                            const saveDC = 8 + abilityModifier + proficiencyBonus;
                                            return (
                                                <>
                                                    {spell.hasAttack && <div><strong>Attack:</strong> {attackBonus >= 0 ? `+${attackBonus}` : attackBonus}</div>}
                                                    {spell.hasSave && <div><strong>Save DC:</strong> {saveDC} {spell.saveType ? `(${spell.saveType.slice(0, 3).toUpperCase()})` : ''}</div>}
                                                </>
                                            )
                                        })()}
                                    </>
                                )}
                                {(spell.hasAttack || spell.hasSave || spell.damageOnly) && spell.damage && (
                                    <div><strong>Damage:</strong> {spell.damage} {spell.damageType}</div>
                                )}
                                {spell.hasHeal && spell.healing && (
                                    <div><strong>Healing:</strong> {spell.healing}</div>
                                )}
                            </div>
                            <p className="text-sm whitespace-pre-wrap mt-2">{spell.description}</p>
                        </div>
                    )}
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                    {editingSpellId !== spell.id && (
                        <button className="text-gray-500 hover:text-gray-700" onClick={() => setEditingSpellId(spell.id)}>
                            <Edit2 className="w-5 h-5" />
                        </button>
                    )}
                    <button className="text-red-500 hover:text-red-700" onClick={() => handleDeleteSpell(spell.id)}>
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SpellCard;
