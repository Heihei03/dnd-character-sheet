"use client";

import React, { useState } from "react";
import { Defenses, DefenseEntry } from "../types/character";
import { DAMAGE_TYPES, CONDITION_TYPES } from "../utils/constants";
import { Trash2, Plus } from "lucide-react";
import ConfirmationModal from "./ui/ConfirmationModal";
import FeatureItemPill from "./features/FeatureItemPill";
import ThemedAutocomplete from "./ui/ThemedAutocomplete";

interface DefensesSectionProps {
    defenses: Defenses;
    onUpdateDefenses: (defenses: Defenses) => void;
    onNavigateToFeature?: (featureId: string) => void;
}

const DefensesSection: React.FC<DefensesSectionProps> = ({
    defenses = { resistances: [], vulnerabilities: [], immunities: [] },
    onUpdateDefenses,
    onNavigateToFeature,
}) => {
    const [newResistance, setNewResistance] = useState("");
    const [newVulnerability, setNewVulnerability] = useState("");
    const [newImmunity, setNewImmunity] = useState("");
    const [defenseToDelete, setDefenseToDelete] = useState<{ category: keyof Defenses, entry: DefenseEntry } | null>(null);

    const ALL_DEFENSE_TYPES = [...DAMAGE_TYPES, ...CONDITION_TYPES].sort();

    const addDefense = (category: keyof Defenses, value: string, setter: (val: string) => void) => {
        if (value) {
            // Check if already exists in this category (case-insensitive)
            if (defenses[category].some(d => d.name.toLowerCase() === value.toLowerCase())) {
                setter("");
                return;
            }

            // Extract ONLY manual defenses from all categories to avoid saving feature-based ones
            const manualDefenses: Defenses = {
                resistances: defenses.resistances.filter(d => !d.fromFeature),
                vulnerabilities: defenses.vulnerabilities.filter(d => !d.fromFeature),
                immunities: defenses.immunities.filter(d => !d.fromFeature)
            };

            onUpdateDefenses({
                ...manualDefenses,
                [category]: [...manualDefenses[category], { name: value }]
            });
            setter("");
        }
    };

    const removeDefense = (category: keyof Defenses, entry: DefenseEntry) => {
        if (entry.fromFeature) return;

        // Extract ONLY manual defenses from all categories to avoid saving feature-based ones
        const manualDefenses: Defenses = {
            resistances: defenses.resistances.filter(d => !d.fromFeature),
            vulnerabilities: defenses.vulnerabilities.filter(d => !d.fromFeature),
            immunities: defenses.immunities.filter(d => !d.fromFeature)
        };

        onUpdateDefenses({
            ...manualDefenses,
            [category]: manualDefenses[category].filter(d => d.name !== entry.name)
        });
    };

    const DefenseList = ({
        title,
        items,
        category,
        newValue,
        setNewValue,
        colorClass
    }: {
        title: string,
        items: DefenseEntry[],
        category: keyof Defenses,
        newValue: string,
        setNewValue: (val: string) => void,
        colorClass: string,
        onNavigateToFeature?: (featureId: string) => void
    }) => (
        <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</h4>
            <div className="flex flex-wrap gap-1.5 min-h-[1.5rem]">
                {items.length === 0 && <span className="text-sm text-gray-400 italic">None</span>}
                {items.map((item, idx) => (
                    <FeatureItemPill
                        key={idx}
                        isFromFeature={item.fromFeature}
                        featureId={item.fromFeatureId}
                        onNavigateToFeature={onNavigateToFeature}
                        colorClass={colorClass}
                    >
                        {item.name}
                        {!item.fromFeature && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDefenseToDelete({ category, entry: item });
                                }}
                                className="text-current opacity-60 hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </FeatureItemPill>
                ))}
            </div>
            <div className="flex gap-2 items-center pt-1">
                <ThemedAutocomplete
                    value={newValue}
                    onChange={setNewValue}
                    options={ALL_DEFENSE_TYPES}
                    placeholder={`Add ${title.toLowerCase()}...`}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            addDefense(category, newValue, setNewValue);
                        }
                    }}
                />
                <button
                    onClick={() => addDefense(category, newValue, setNewValue)}
                    className="p-2.5 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center justify-center min-w-[44px]"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>
        </div>
    );

    return (
        <div className="border p-3 rounded bg-white dark:bg-gray-950 shadow-sm transition-all font-sans space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold text-lg">Defenses</span>
            </div>

            <div className="space-y-5 px-1">
                <DefenseList
                    title="Resistances"
                    items={defenses.resistances}
                    category="resistances"
                    newValue={newResistance}
                    setNewValue={setNewResistance}
                    colorClass="bg-primary/10 text-primary border border-primary/20 dark:border-primary/40 shadow-sm"
                    onNavigateToFeature={onNavigateToFeature}
                />
                <DefenseList
                    title="Immunities"
                    items={defenses.immunities}
                    category="immunities"
                    newValue={newImmunity}
                    setNewValue={setNewImmunity}
                    colorClass="bg-secondary text-secondary-foreground border border-secondary/20 shadow-sm"
                    onNavigateToFeature={onNavigateToFeature}
                />
                <DefenseList
                    title="Vulnerabilities"
                    items={defenses.vulnerabilities}
                    category="vulnerabilities"
                    newValue={newVulnerability}
                    setNewValue={setNewVulnerability}
                    colorClass="bg-muted text-muted-foreground border border-border shadow-sm"
                    onNavigateToFeature={onNavigateToFeature}
                />
            </div>

            <ConfirmationModal
                isOpen={defenseToDelete !== null}
                onClose={() => setDefenseToDelete(null)}
                onConfirm={() => {
                    if (defenseToDelete) {
                        removeDefense(defenseToDelete.category, defenseToDelete.entry);
                        setDefenseToDelete(null);
                    }
                }}
                title="Remove Defense"
                message={`Are you sure you want to remove "${defenseToDelete?.entry.name}" from ${defenseToDelete?.category}?`}
                confirmText="Remove"
            />
        </div>
    );
};

export default DefensesSection;
