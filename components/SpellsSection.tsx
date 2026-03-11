import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import Button from "./ui/button";
import { Plus, Calculator } from "lucide-react";
import SectionHeader from "./ui/SectionHeader";
import SpellCard from "./SpellCard";
import ResourcePipTracker from "./ResourcePipTracker";
import { CharacterClass, Spell, SpellSlot, AbilityScores, Resource } from "../types/character";
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
    const [newSpellDraft, setNewSpellDraft] = useState<Spell | null>(null);
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
            id: `spell-draft-${Date.now()}`,
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
            scalesWithCharacterLevel: false,
            damage: "",
            higherLevelDamage: "",
            damageType: "",
            healing: "",
            higherLevelHealing: "",
            atHigherLevels: "",
            material: "",
            aoeShape: "",
            aoeSize: "",
            hasAoe: false,
            spellcastingAbility: undefined
        };
        setNewSpellDraft(newSpell);
        setEditingSpellId(newSpell.id);
    };

    const handleSaveNewSpell = (spell: Spell) => {
        onUpdateSpells([...spells, spell]);
        setNewSpellDraft(null);
        setEditingSpellId(null);
    };

    const handleCancelNewSpell = () => {
        setNewSpellDraft(null);
        setEditingSpellId(null);
    };

    const handleUpdateSpell = (id: string, field: keyof Spell, value: any) => {
        onUpdateSpells(spells.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const handleSaveLocalSpell = (updatedSpell: Spell) => {
        onUpdateSpells(spells.map(s => s.id === updatedSpell.id ? updatedSpell : s));
        setEditingSpellId(null);
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
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {slots.map((slot) => {
                            // Map SpellSlot to Resource for the tracker
                            // Tracking "Available" slots (Max - Expended)
                            const availableValue = Math.max(0, slot.max - slot.expended);
                            const resourceProxy: Resource = {
                                id: `spell-slot-lvl-${slot.level}`,
                                name: `Level ${slot.level}`,
                                max: slot.max,
                                value: availableValue,
                                regain: "Long Rest"
                            };

                            return (
                                <div key={slot.level} className="space-y-2">
                                    <ResourcePipTracker
                                        resource={resourceProxy}
                                        compact={true}
                                        onUpdate={(newAvailable) => {
                                            // newAvailable is current count (Available)
                                            // expended = max - available
                                            handleUpdateSlot(slot.level, "expended", slot.max - newAvailable);
                                        }}
                                    />
                                    <div className="flex items-center justify-end gap-2 px-2">
                                        <label className="text-[10px] font-bold uppercase text-gray-400">Total Max:</label>
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
                                            className={`w-12 h-6 text-center text-xs border rounded ${autoCalculateSlots ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white dark:bg-gray-800'}`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            <SectionHeader 
                title="Spells List" 
                buttonLabel="Add Spell" 
                onAdd={handleAddSpell} 
                isAdding={!!newSpellDraft} 
            />

            {newSpellDraft && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <Card className="border-2 border-blue-500 shadow-md">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-t-lg border-b border-blue-200 dark:border-blue-800 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-blue-700 dark:text-blue-300">New Spell Draft</h3>
                            <Button variant="ghost" className="h-8 w-8 p-0" onClick={handleCancelNewSpell}>
                                <Plus className="w-4 h-4 rotate-45" />
                            </Button>
                        </div>
                        <SpellCard
                            spell={newSpellDraft}
                            level={newSpellDraft.level}
                            editingSpellId={editingSpellId}
                            setEditingSpellId={(id) => {
                                if (id === null) handleCancelNewSpell();
                                else setEditingSpellId(id);
                            }}
                            handleUpdateSpell={(id, field, value) => setNewSpellDraft({ ...newSpellDraft, [field]: value })}
                            handleSaveSpell={handleSaveNewSpell}
                            handleDeleteSpell={handleCancelNewSpell}
                            abilityScores={abilityScores}
                            proficiencyBonus={proficiencyBonus}
                            totalLevel={classes.reduce((sum, cls) => sum + cls.level, 0)}
                            classes={classes}
                        />
                    </Card>
                </div>
            )}

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
                                {levelSpells.map((spell) => {
                                    const totalLevel = classes.reduce((sum, cls) => sum + cls.level, 0);
                                    return (
                                        <SpellCard
                                            key={spell.id}
                                            spell={spell}
                                            level={level}
                                            editingSpellId={editingSpellId}
                                            setEditingSpellId={setEditingSpellId}
                                            handleUpdateSpell={handleUpdateSpell}
                                            handleSaveSpell={handleSaveLocalSpell}
                                            handleDeleteSpell={handleDeleteSpell}
                                            abilityScores={abilityScores}
                                            proficiencyBonus={proficiencyBonus}
                                            totalLevel={totalLevel}
                                            classes={classes}
                                        />
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

export default SpellsSection;
