import React, { useState } from "react";
import { Calculator, Plus } from "lucide-react";

// UI Components
import Button from "./ui/button";
import { Card, CardContent } from "./ui/card";
import EntityForm from "./ui/EntityForm";
import SectionHeader from "./ui/SectionHeader";
import SearchFilterBar from "./ui/SearchFilterBar";

// Components
import ResourcePipTracker from "./ResourcePipTracker";
import SpellCard from "./SpellCard";

// Types
import { AbilityScores, CharacterClass, Resource, Spell, SpellSlot } from "../types/character";

// Utils
import { calculateSpellSlots } from "../utils/spell-utils";

interface SpellsSectionProps {
    classes: CharacterClass[];
    spells: Spell[];
    spellSlots: SpellSlot[];
    onUpdateSpells: (spells: Spell[]) => void;
    onUpdateSpellSlots: (slots: SpellSlot[]) => void;
    abilityScores: AbilityScores;
    proficiencyBonus: number;
    onNavigateToFeature?: (featureId: string) => void;
}

const SpellsSection: React.FC<SpellsSectionProps> = ({
    classes,
    spells,
    spellSlots,
    onUpdateSpells,
    onUpdateSpellSlots,
    abilityScores,
    proficiencyBonus,
    onNavigateToFeature
}) => {
    const [editingSpellId, setEditingSpellId] = useState<string | null>(null);
    const [newSpellDraft, setNewSpellDraft] = useState<Spell | null>(null);
    const [autoCalculateSlots, setAutoCalculateSlots] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Filters
    const [selectedLevel, setSelectedLevel] = useState("All");
    const [selectedSchool, setSelectedSchool] = useState("All");
    const [selectedPrepared, setSelectedPrepared] = useState("All");
    const [selectedRitual, setSelectedRitual] = useState("All");
    const [selectedConcentration, setSelectedConcentration] = useState("All");
    const [selectedClass, setSelectedClass] = useState("All");
    const [selectedType, setSelectedType] = useState("All");

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

    const filteredSpells = spells.filter(spell => {
        const matchesSearch = spell.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             spell.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesLevel = selectedLevel === "All" || spell.level.toString() === selectedLevel;
        const matchesSchool = selectedSchool === "All" || spell.school === selectedSchool;
        
        const matchesPrepared = selectedPrepared === "All" || 
                               (selectedPrepared === "Yes" ? spell.prepared : !spell.prepared);
                               
        const matchesRitual = selectedRitual === "All" || 
                             (selectedRitual === "Yes" ? spell.isRitual : !spell.isRitual);
                             
        const matchesConcentration = selectedConcentration === "All" || 
                                    (selectedConcentration === "Yes" ? spell.requiresConcentration : !spell.requiresConcentration);
        
        const matchesClass = selectedClass === "All" || spell.classSource === selectedClass;
        
        const matchesType = selectedType === "All" || 
                           (selectedType === "Attack" && spell.hasAttack) ||
                           (selectedType === "Save" && spell.hasSave) ||
                           (selectedType === "Utility" && !spell.hasAttack && !spell.hasSave);
        
        return matchesSearch && matchesLevel && matchesSchool && matchesPrepared && matchesRitual && matchesConcentration && matchesClass && matchesType;
    });

    const spellsByLevel = filteredSpells.reduce((acc, spell) => {
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

            <SearchFilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search spells..."
                className="mb-4"
                filters={[
                    {
                        id: "level",
                        value: selectedLevel,
                        onValueChange: setSelectedLevel,
                        options: [
                            { label: "All Levels", value: "All" },
                            { label: "Cantrip", value: "0" },
                            ...Array.from({ length: 9 }, (_, i) => ({ label: `Level ${i + 1}`, value: (i + 1).toString() }))
                        ],
                        placeholder: "Level"
                    },
                    {
                        id: "school",
                        value: selectedSchool,
                        onValueChange: setSelectedSchool,
                        options: [
                            { label: "All Schools", value: "All" },
                            { label: "Abjuration", value: "Abjuration" },
                            { label: "Conjuration", value: "Conjuration" },
                            { label: "Divination", value: "Divination" },
                            { label: "Enchantment", value: "Enchantment" },
                            { label: "Evocation", value: "Evocation" },
                            { label: "Illusion", value: "Illusion" },
                            { label: "Necromancy", value: "Necromancy" },
                            { label: "Transmutation", value: "Transmutation" }
                        ],
                        placeholder: "School"
                    },
                    {
                        id: "prepared",
                        value: selectedPrepared,
                        onValueChange: setSelectedPrepared,
                        options: [
                            { label: "All Prep", value: "All" },
                            { label: "Prepared", value: "Yes" },
                            { label: "Unprepared", value: "No" }
                        ],
                        placeholder: "Prepared"
                    },
                    {
                        id: "ritual",
                        value: selectedRitual,
                        onValueChange: setSelectedRitual,
                        options: [
                            { label: "All Rituals", value: "All" },
                            { label: "Ritual", value: "Yes" },
                            { label: "Non-Ritual", value: "No" }
                        ],
                        placeholder: "Ritual"
                    },
                    {
                        id: "concentration",
                        value: selectedConcentration,
                        onValueChange: setSelectedConcentration,
                        options: [
                            { label: "All Conc.", value: "All" },
                            { label: "Concentration", value: "Yes" },
                            { label: "Non-Conc.", value: "No" }
                        ],
                        placeholder: "Concentration"
                    },
                    {
                        id: "class",
                        value: selectedClass,
                        onValueChange: setSelectedClass,
                        options: [
                            { label: "All Classes", value: "All" },
                            ...classes.map(cls => ({ label: cls.name, value: cls.name })),
                            { label: "Other", value: "Other" }
                        ],
                        placeholder: "Source Class"
                    },
                    {
                        id: "type",
                        value: selectedType,
                        onValueChange: setSelectedType,
                        options: [
                            { label: "All Types", value: "All" },
                            { label: "Attack", value: "Attack" },
                            { label: "Save", value: "Save" },
                            { label: "Utility", value: "Utility" }
                        ],
                        placeholder: "Combat Type"
                    }
                ]}
            />

            {newSpellDraft && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <EntityForm
                        title="New Spell"
                        onSave={() => handleSaveNewSpell(newSpellDraft)}
                        onCancel={handleCancelNewSpell}
                        saveLabel="Add Spell"
                        className="shadow-md p-0"
                    >
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
                            hideFooter={true} // New prop to hide internal buttons
                            onNavigateToFeature={onNavigateToFeature}
                        />
                    </EntityForm>
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
                                            onNavigateToFeature={onNavigateToFeature}
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
