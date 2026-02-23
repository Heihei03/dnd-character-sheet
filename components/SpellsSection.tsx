import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import Button from "./ui/button";
import { Spell, SpellSlot, AbilityScores } from "../types/character";
import { Plus, Trash2, Edit2 } from "lucide-react";

interface SpellsSectionProps {
    spells: Spell[];
    spellSlots: SpellSlot[];
    onUpdateSpells: (spells: Spell[]) => void;
    onUpdateSpellSlots: (slots: SpellSlot[]) => void;
    abilityScores: AbilityScores;
    proficiencyBonus: number;
}

const SpellsSection: React.FC<SpellsSectionProps> = ({
    spells,
    spellSlots,
    onUpdateSpells,
    onUpdateSpellSlots,
    abilityScores,
    proficiencyBonus
}) => {
    const [editingSpellId, setEditingSpellId] = useState<string | null>(null);

    // Initialize Slots (1-9) if missing
    const slots = Array.from({ length: 9 }, (_, i) => i + 1).map(level => {
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
            components: ["V", "S"],
            duration: "Instantaneous",
            description: "A new spell.",
            prepared: false,
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
                <div className="p-4 border-b">
                    <h3 className="text-xl font-semibold">Spell Slots</h3>
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
                                            value={slot.max || ""}
                                            onChange={(e) => handleUpdateSlot(slot.level, "max", parseInt(e.target.value) || 0)}
                                            className="h-8 text-center border rounded px-2 w-full"
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
                                                            <span className="text-sm text-gray-500 italic">{spell.school}</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-700">
                                                            <div><strong>Time:</strong> {spell.castingTime}</div>
                                                            <div><strong>Range:</strong> {spell.range}</div>
                                                            <div><strong>Components:</strong> {spell.components?.join(", ")}</div>
                                                            <div><strong>Duration:</strong> {spell.duration}</div>
                                                        </div>
                                                        <p className="text-sm whitespace-pre-wrap">{spell.description}</p>
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
