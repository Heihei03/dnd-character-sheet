import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import Button from "./ui/button";
import { Plus, Trash2, Edit2, Calculator } from "lucide-react";
import { CharacterClass, Spell, SpellSlot, AbilityScores } from "../types/character";
import { calculateSpellSlots } from "../utils/spell-utils";

interface SpellsSectionProps {
    classes: CharacterClass[];
    spells: Spell[];
    spellSlots: SpellSlot[];
    onUpdateSpells: (spells: Spell[]) => void;
    onUpdateSpellSlots: (slots: SpellSlot[]) => void;
    abilityScores: AbilityScores;
    proficiencyBonus: number;
}

const SpellsSection: React.FC<SpellsSectionProps> = ({
    classes,
    spells,
    spellSlots,
    onUpdateSpells,
    onUpdateSpellSlots,
    abilityScores,
    proficiencyBonus
}) => {
    const [editingSpellId, setEditingSpellId] = useState<string | null>(null);
    const [autoCalculateSlots, setAutoCalculateSlots] = useState(true);

    const calculatedSlots = calculateSpellSlots(classes);

    // Initialize Slots (1-9) if missing
    const slots = Array.from({ length: 9 }, (_, i) => i + 1).map(level => {
        if (autoCalculateSlots) {
            const calculated = calculatedSlots[level - 1];
            return spellSlots.find(s => s.level === level) || { level, max: calculated ? calculated.max : 0, expended: 0 };
        }
        return spellSlots.find(s => s.level === level) || { level, max: 0, expended: 0 };
    });

    const handleUpdateSlot = (level: number, field: keyof SpellSlot, value: number) => {
        const newSlots = [...slots];
        const index = newSlots.findIndex(s => s.level === level);
        if (index !== -1) {
            newSlots[index] = { ...newSlots[index], [field]: value };
        }
        // Filter out only those with max > 0 or expended > 0
        onUpdateSpellSlots(newSlots.filter(s => s.max > 0 || s.expended > 0));
    };

    const handleAddSpell = () => {
        const newSpell: Spell = {
            id: `spell-${Date.now()}`,
            name: "New Spell",
            level: 0,
            school: "Evocation",
            castingTime: "1 Action",
            range: "60 ft",
            components: { v: true, s: true, m: false },
            duration: "Instantaneous",
            description: "A new spell.",
            prepared: false,
            isRitual: false,
            requiresConcentration: false,
        };
        onUpdateSpells([...spells, newSpell]);
        setEditingSpellId(newSpell.id);
    };

    const handleUpdateSpell = (id: string, field: keyof Spell, value: any) => {
        onUpdateSpells(spells.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const handleDeleteSpell = (id: string) => {
        onUpdateSpells(spells.filter(s => s.id !== id));
    };

    const spellsByLevel = spells.reduce((acc, spell) => {
        const lvl = spell.level || 0;
        if (!acc[lvl]) acc[lvl] = [];
        acc[lvl].push(spell);
        return acc;
    }, {} as Record<number, Spell[]>);

    return (
        <div className="space-y-6">
            <Card>
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Spell Slots</h3>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={autoCalculateSlots}
                            onChange={(e) => {
                                setAutoCalculateSlots(e.target.checked);
                                if (e.target.checked) {
                                    // Update max slots based on calculation
                                    const updatedSlots = slots.map(slot => {
                                        const calc = calculatedSlots[slot.level - 1];
                                        return { ...slot, max: calc ? calc.max : 0 };
                                    });
                                    onUpdateSpellSlots(updatedSlots.filter(s => s.max > 0 || s.expended > 0));
                                }
                            }}
                            className="w-4 h-4 cursor-pointer"
                            id="auto-calc-slots"
                        />
                        <label htmlFor="auto-calc-slots" className="text-sm font-medium cursor-pointer flex items-center">
                            <Calculator className="w-4 h-4 mr-1" />
                            Auto-calculate Max Slots
                        </label>
                    </div>
                </div>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {slots.map((slot) => (
                            <div key={slot.level} className="flex flex-col items-center bg-gray-50 p-2 rounded-lg border">
                                <span className="font-semibold mb-2">Level {slot.level}</span>
                                <div className="flex gap-2 w-full">
                                    <div className="flex flex-col w-1/2">
                                        <label className="text-xs text-center mb-1">Max</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={autoCalculateSlots ? (calculatedSlots[slot.level - 1]?.max || 0) : (slot.max || "")}
                                            onChange={(e) => {
                                                if (!autoCalculateSlots) {
                                                    handleUpdateSlot(slot.level, "max", parseInt(e.target.value) || 0);
                                                }
                                            }}
                                            disabled={autoCalculateSlots}
                                            className={`h-8 text-center border rounded px-2 w-full ${autoCalculateSlots ? 'bg-gray-100 text-gray-500' : ''}`}
                                        />
                                    </div>
                                    <div className="flex flex-col w-1/2">
                                        <label className="text-xs text-center mb-1">Used</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={slot.max || 0}
                                            value={slot.expended || ""}
                                            onChange={(e) => handleUpdateSlot(slot.level, "expended", parseInt(e.target.value) || 0)}
                                            className="h-8 text-center border rounded px-2 w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Spells List</h2>
                <Button onClick={handleAddSpell}><Plus className="w-4 h-4 mr-2" /> Add Spell</Button>
            </div>

            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
                const levelSpells = spellsByLevel[level] || [];
                if (levelSpells.length === 0) return null;

                return (
                    <Card key={level}>
                        <div className="p-4 bg-gray-100 rounded-t-lg border-b">
                            <h3 className="text-lg font-semibold">{level === 0 ? "Cantrips" : `Level ${level}`}</h3>
                        </div>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {levelSpells.map((spell) => (
                                    <div key={spell.id} className="p-4 hover:bg-gray-50">
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
                                                                <label className="block text-sm mb-1">Level (0 = Cantrip)</label>
                                                                <input className="border rounded px-3 py-2 w-full" type="number" min="0" max="9" value={spell.level} onChange={(e) => handleUpdateSpell(spell.id, "level", parseInt(e.target.value) || 0)} />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm mb-1">School</label>
                                                                <input className="border rounded px-3 py-2 w-full" value={spell.school} onChange={(e) => handleUpdateSpell(spell.id, "school", e.target.value)} />
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
                                                            <span className="text-sm text-gray-500 italic ml-2">{spell.school}</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-700">
                                                            <div><strong>Time:</strong> {spell.castingTime}</div>
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
                                                                                <div><strong>Attack:</strong> {attackBonus >= 0 ? `+${attackBonus}` : attackBonus}</div>
                                                                                <div><strong>Save DC:</strong> {saveDC}</div>
                                                                            </>
                                                                        )
                                                                    })()}
                                                                </>
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
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

export default SpellsSection;
