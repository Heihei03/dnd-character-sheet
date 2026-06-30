import React, { useState } from "react";
import { Calculator, Plus, Brain, ZapOff, Dices } from "lucide-react";
import { cn } from "@/lib/utils";


// UI Components
import Button from "../ui/button";
import { Card, CardContent } from "../ui/card";
import EntityForm from "../ui/EntityForm";
import SectionHeader from "../ui/SectionHeader";
import SearchFilterBar from "../ui/SearchFilterBar";
import NumericInput from "../ui/NumericInput";
import Select from "../ui/Select";

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
import { getAbilityModifier, getEffectiveBonuses, getCharacterSpellcastingAbility, getAdvantageDisadvantage, getAllActiveFeatures } from "../../utils/character-utils";

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
    summonStatblocks?: any[];
    onSummonFromStatblock?: (statblockId: string) => void;
    onChange?: (field: any, value: any) => void;
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
    rollDamage,
    summonStatblocks = [],
    onSummonFromStatblock,
    onChange
}) => {
    const [editingSpellId, setEditingSpellId] = useState<string | null>(null);
    const [newSpellDraft, setNewSpellDraft] = useState<Spell | null>(null);
    const [autoCalculateSlots, setAutoCalculateSlots] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [damageTaken, setDamageTaken] = useState<number | "">("");

    const activeConcentrationSpell = spells.find(s => s.id === character.concentrationSpellId);
    const calculatedDc = damageTaken === "" ? 10 : Math.max(10, Math.floor(Number(damageTaken) / 2));

    const label = "Concentration";
    const { advantage: hasAdvantage, disadvantage: hasDisadvantage, extraAdvantage } = getAdvantageDisadvantage(character, label, 'constitution');

    const activeFeatures = getAllActiveFeatures(character);
    const advantageSources = activeFeatures
        .filter(f => 
            (f.modifiers || []).some(m => {
                if (m.type !== "Advantage") return false;
                const subTypes = (m.subType || "").split(",").map(s => s.trim().toLowerCase());
                return subTypes.some(sub => 
                    sub === "concentration" || 
                    sub === "saving throws" || 
                    sub === "constitution saves"
                );
            })
        )
        .map(f => f.name);

    const disadvantageSources = activeFeatures
        .filter(f => 
            (f.modifiers || []).some(m => {
                if (m.type !== "Disadvantage") return false;
                const subTypes = (m.subType || "").split(",").map(s => s.trim().toLowerCase());
                return subTypes.some(sub => 
                    sub === "concentration" || 
                    sub === "saving throws" || 
                    sub === "constitution saves"
                );
            })
        )
        .map(f => f.name);

    if (hasDisadvantage && disadvantageSources.length === 0) {
        if (character.encumbranceEnabled && character.encumbranceRule === 'variant') {
            disadvantageSources.push("Heavy Encumbrance");
        }
    }

    const handleRollConcentrationSave = () => {
        if (!rollDice) return;
        
        const conScore = abilityScores.constitution ?? 10;
        const conMod = Math.floor((conScore - 10) / 2);
        const hasConSaveProf = character.savingThrows?.constitution ?? false;
        const conSaveModifier = conMod + (hasConSaveProf ? proficiencyBonus : 0);
        
        const activeBonuses = getEffectiveBonuses(character, label);
        let bonusModifier = 0;
        activeBonuses.forEach(b => {
            const val = parseInt(b.bonus);
            if (!isNaN(val) && !b.bonus.includes('d')) {
                bonusModifier += val;
            }
        });
        
        const totalModifier = conSaveModifier + bonusModifier;
        const dcLabel = `Concentration Save (DC ${calculatedDc})`;
        rollDice(20, 1, totalModifier, dcLabel, undefined, undefined, undefined, undefined, undefined, hasAdvantage, hasDisadvantage, extraAdvantage, 'save');
    };

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
            spellcastingAbility: undefined,
            addSpellcastingModifier: false,
            effect: "",
            passEffect: ""
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

    const primaryAbility = getCharacterSpellcastingAbility(character);
    const abilityScore = abilityScores[primaryAbility] || 10;
    const abilityModifier = getAbilityModifier(abilityScore);
    
    let attackBonusFromActive = 0;
    let attackBonusDice: string[] = [];
    getEffectiveBonuses(character, 'attack').forEach(b => {
        const dice = b.bonus.match(/(\d+d\d+)/);
        if (dice) {
            attackBonusDice.push(dice[0]);
        } else {
            const val = parseInt(b.bonus) || 0;
            attackBonusFromActive += val;
        }
    });

    let saveDcBonusFromActive = 0;
    let saveDcBonusDice: string[] = [];
    getEffectiveBonuses(character, 'spell-dc').forEach(b => {
        const dice = b.bonus.match(/(\d+d\d+)/);
        if (dice) {
            saveDcBonusDice.push(dice[0]);
        } else {
            const val = parseInt(b.bonus) || 0;
            saveDcBonusFromActive += val;
        }
    });

    const baseAttackBonus = abilityModifier + proficiencyBonus + attackBonusFromActive;
    const baseSaveDC = 8 + abilityModifier + proficiencyBonus + saveDcBonusFromActive;

    const displayAttackBonus = `+${baseAttackBonus}${attackBonusDice.length > 0 ? ` + ${attackBonusDice.join(" + ")}` : ""}`;
    const displaySaveDC = `${baseSaveDC}${saveDcBonusDice.length > 0 ? ` + ${saveDcBonusDice.join(" + ")}` : ""}`;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
                <Card className="bg-primary/5 border-primary/20 shadow-none">
                    <CardContent className="p-2 px-3 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase font-black text-primary/60 tracking-widest">Spell Attack</span>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase leading-tight">{String(primaryAbility).charAt(0).toUpperCase() + String(primaryAbility).slice(1)} + prof</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-primary">{displayAttackBonus}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-orange-500/5 border-orange-500/20 shadow-none">
                    <CardContent className="p-2 px-3 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase font-black text-orange-500/60 tracking-widest">Spell Save DC</span>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase leading-tight">8 + {String(primaryAbility).charAt(0).toUpperCase() + String(primaryAbility).slice(1)} + prof</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-orange-600">{displaySaveDC}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Concentration Section */}
            <Card className="border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10 shadow-none">
                <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Brain className="w-5 h-5 text-amber-500 animate-pulse" />
                        <h3 className="text-sm font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                            Spell Concentration
                        </h3>
                    </div>

                    {activeConcentrationSpell ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                            {/* Left: Active Spell Info */}
                            <div className="flex flex-col justify-between h-full space-y-2">
                                <div>
                                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Currently Concentrating On</div>
                                    <div className="text-lg font-black text-foreground flex items-center gap-2 flex-wrap">
                                        {activeConcentrationSpell.name}
                                        <span className="text-xs bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/20 font-bold uppercase tracking-tight">
                                            {activeConcentrationSpell.level === 0 ? "Cantrip" : `Lvl ${activeConcentrationSpell.level}`}
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground italic mt-0.5">
                                        {activeConcentrationSpell.school} • Duration: {activeConcentrationSpell.duration}
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onChange?.("concentrationSpellId", null)}
                                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20 hover:border-red-500/30 flex items-center gap-1.5 font-bold"
                                    >
                                        <ZapOff className="w-4 h-4" />
                                        End Concentration
                                    </Button>
                                </div>
                            </div>

                            {/* Right: Saving Throw Roller */}
                            <div className="bg-secondary/40 p-3 rounded-xl border border-border flex flex-col items-stretch gap-3">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-1.5 flex-1">
                                        <div className="flex items-center justify-between">
                                            <div className="text-[10px] text-muted-foreground uppercase font-black tracking-wider leading-none">Concentration Save Helper</div>
                                            <div className="flex gap-1">
                                                {hasAdvantage && (
                                                    <span className="text-[8px] font-black bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-1 py-0.5 rounded border border-green-200 dark:border-green-800 uppercase leading-none">ADV</span>
                                                )}
                                                {hasDisadvantage && (
                                                    <span className="text-[8px] font-black bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-1 py-0.5 rounded border border-red-200 dark:border-red-800 uppercase leading-none">DIS</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Damage Taken</span>
                                                <NumericInput
                                                    value={damageTaken}
                                                    onChange={(val) => setDamageTaken(val === null ? "" : val)}
                                                    placeholder="0"
                                                    min={0}
                                                    className="w-20 h-8 text-sm font-bold"
                                                />
                                            </div>
                                            <div className="flex flex-col items-center justify-center bg-background px-3 py-1.5 rounded-lg border border-border h-[42px] mt-4">
                                                <span className="text-[8px] text-muted-foreground uppercase font-bold leading-none mb-0.5">Required DC</span>
                                                <span className="text-base font-black text-amber-600 dark:text-amber-400">{calculatedDc}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full md:w-auto mt-4 md:mt-0 flex items-end">
                                        <Button
                                            onClick={handleRollConcentrationSave}
                                            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center justify-center gap-2 shadow-sm shadow-amber-500/10 transition-all active:scale-95 h-10"
                                        >
                                            <Dices className="w-4 h-4" />
                                            Roll Save
                                        </Button>
                                    </div>
                                </div>

                                {(advantageSources.length > 0 || disadvantageSources.length > 0) && (
                                    <div className="text-[10px] text-muted-foreground italic leading-tight border-t border-border pt-2 space-y-1">
                                        {advantageSources.length > 0 && (
                                            <div>
                                                <span className="font-bold text-green-600 dark:text-green-400">Advantage from:</span> {advantageSources.join(", ")}
                                            </div>
                                        )}
                                        {disadvantageSources.length > 0 && (
                                            <div>
                                                <span className="font-bold text-red-600 dark:text-red-400">Disadvantage from:</span> {disadvantageSources.join(", ")}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-2">
                            <div className="text-sm text-muted-foreground italic text-center md:text-left">
                                Not concentrating on any spell.
                            </div>
                            
                            {/* Quick Start Selector if they have concentration spells */}
                            {spells.filter(s => s.requiresConcentration).length > 0 && (
                                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                    <label className="text-xs font-bold uppercase text-muted-foreground whitespace-nowrap">Start:</label>
                                    <Select
                                        value=""
                                        onValueChange={(val) => {
                                            if (val) onChange?.("concentrationSpellId", val);
                                        }}
                                        placeholder="Select a spell..."
                                        options={[
                                            { label: "Select a spell...", value: "" },
                                            ...spells
                                                .filter(s => s.requiresConcentration)
                                                .map(s => ({
                                                    label: `${s.name} (${s.level === 0 ? "Cantrip" : `Lvl ${s.level}`})`,
                                                    value: s.id
                                                }))
                                        ]}
                                        className="w-48 md:w-56 text-sm"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

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
                        summonStatblocks={summonStatblocks}
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
                                                    summonStatblocks={summonStatblocks}
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
                                            onSummonFromStatblock={onSummonFromStatblock}
                                            onChange={onChange}
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
