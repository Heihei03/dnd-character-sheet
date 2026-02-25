import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import Button from "./ui/button";
import { Plus, Calculator } from "lucide-react";
import SpellCard from "./SpellCard";
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
            hasAttack: false,
            hasSave: false,
            hasHeal: false,
            damageOnly: false,
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
                                    <SpellCard
                                        key={spell.id}
                                        spell={spell}
                                        level={level}
                                        editingSpellId={editingSpellId}
                                        setEditingSpellId={setEditingSpellId}
                                        handleUpdateSpell={handleUpdateSpell}
                                        handleDeleteSpell={handleDeleteSpell}
                                        abilityScores={abilityScores}
                                        proficiencyBonus={proficiencyBonus}
                                    />
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
