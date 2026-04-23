import React, { useState } from "react";
import { Calculator, Plus } from "lucide-react";
import { cn } from "@/lib/utils";


// UI Components
import Button from "../ui/button";
import { Card, CardContent } from "../ui/card";
import EntityForm from "../ui/EntityForm";
import SectionHeader from "../ui/SectionHeader";
import SearchFilterBar from "../ui/SearchFilterBar";
import NumericInput from "../ui/NumericInput";

// Components
import ResourcePipTracker from "../ResourcePipTracker";
import SpellSlotsTracker from "../SpellSlotsTracker";
import SpellCard from "./SpellCard";
import SpellForm from "./SpellForm";
import ActiveBonusesList from "../ActiveBonusesList";

// Types
import { AbilityScores, CharacterClass, Resource, Spell, SpellSlot, ActiveBonus, RollDiceFunc, RollDamageFunc } from "../../types/character";

// Utils
import { calculateSpellSlots } from "../../utils/spell-utils";

interface SpellsSectionProps {
    classes: CharacterClass[];
    spells: Spell[];
    spellSlots: SpellSlot[];
    onUpdateSpells: (spells: Spell[]) => void;
    onUpdateSpellSlots: (slots: SpellSlot[]) => void;
    abilityScores: AbilityScores;
    proficiencyBonus: number;
    onNavigateToFeature?: (featureId: string) => void;
    onUpdateActiveBonuses: (bonuses: ActiveBonus[]) => void;
    character: any;
    rollDice?: RollDiceFunc;
    rollDamage?: RollDamageFunc;
}

const SpellsSection: React.FC<SpellsSectionProps> = ({
    classes,
    spells,
    spellSlots,
    onUpdateSpells,
    onUpdateSpellSlots,
    abilityScores,
    proficiencyBonus,
    onNavigateToFeature,
    onUpdateActiveBonuses,
    character,
    rollDice,
    rollDamage
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
            <SpellSlotsTracker 
                classes={classes}
                spellSlots={spellSlots}
                onUpdateSpellSlots={onUpdateSpellSlots}
            />

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
                    <SpellForm
                        spell={newSpellDraft}
                        isEditing={false}
                        onSave={handleSaveNewSpell}
                        onCancel={handleCancelNewSpell}
                        abilityScores={abilityScores}
                        proficiencyBonus={proficiencyBonus}
                        totalLevel={classes.reduce((sum, cls) => sum + cls.level, 0)}
                        classes={classes}
                    />
                </div>
            )}

            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
                const levelSpells = spellsByLevel[level] || [];
                if (levelSpells.length === 0) return null;

                return (
                    <Card key={level}>
                        <div className="p-4 bg-secondary/50 rounded-t-lg border-b border-border">
                            <h3 className="text-lg font-semibold">{level === 0 ? "Cantrips" : `Level ${level}`}</h3>
                        </div>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border">
                                {levelSpells.map((spell, index) => {
                                    const totalLevel = classes.reduce((sum, cls) => sum + cls.level, 0);
                                    
                                    if (editingSpellId === spell.id) {
                                        return (
                                            <div key={spell.id} className="p-4 bg-secondary/30 rounded-lg border-2 border-primary/20 my-2 shadow-inner mx-4">
                                                <SpellForm
                                                    spell={spell}
                                                    isEditing={true}
                                                    onSave={handleSaveLocalSpell}
                                                    onCancel={() => setEditingSpellId(null)}
                                                    abilityScores={abilityScores}
                                                    proficiencyBonus={proficiencyBonus}
                                                    totalLevel={totalLevel}
                                                    classes={classes}
                                                />
                                            </div>
                                        );
                                    }

                                    return (
                                        <SpellCard
                                            key={spell.id}
                                            spell={spell}
                                            level={level}
                                            abilityScores={abilityScores}
                                            proficiencyBonus={proficiencyBonus}
                                            totalLevel={totalLevel}
                                            onEdit={() => setEditingSpellId(spell.id)}
                                            onDelete={() => handleDeleteSpell(spell.id)}
                                            onUpdateActiveBonuses={onUpdateActiveBonuses}
                                            rollDice={rollDice}
                                            rollDamage={rollDamage}
                                            handleUpdateSpell={handleUpdateSpell}
                                            character={character}
                                            className={index === levelSpells.length - 1 ? "rounded-b-lg" : ""}
                                        />
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 border-t pt-6">
                <ActiveBonusesList 
                    bonuses={character.activeBonuses || []}
                    onUpdateBonuses={onUpdateActiveBonuses}
                    target="attack"
                    title="Spell Attack Bonuses"
                />
                <ActiveBonusesList 
                    bonuses={character.activeBonuses || []}
                    onUpdateBonuses={onUpdateActiveBonuses}
                    target="damage"
                    title="Spell Damage Bonuses"
                />
                <ActiveBonusesList 
                    bonuses={character.activeBonuses || []}
                    onUpdateBonuses={onUpdateActiveBonuses}
                    target="spell-dc"
                    title="Spell DC Bonuses"
                />
            </div>
        </div>
    );
};

export default SpellsSection;
