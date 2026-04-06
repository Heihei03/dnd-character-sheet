"use client";

import React, { useState } from "react";
import { Defenses, DefenseEntry } from "../types/character";
import { DAMAGE_TYPES, CONDITION_TYPES } from "../utils/constants";
import { Trash2, Plus } from "lucide-react";
import ConfirmationModal from "./ui/ConfirmationModal";
import FeatureItemPill from "./features/FeatureItemPill";

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
            const manualDefenses = defenses[category].filter(d => !d.fromFeature);
            onUpdateDefenses({
                ...defenses,
                [category]: [...manualDefenses, { name: value }]
            });
            setter("");
        }
    };

    const removeDefense = (category: keyof Defenses, entry: DefenseEntry) => {
        if (entry.fromFeature) return;
        const manualDefenses = defenses[category].filter(d => !d.fromFeature);
        onUpdateDefenses({
            ...defenses,
            [category]: manualDefenses.filter(d => d.name !== entry.name)
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
            <div className="flex gap-1 relative">
                <input
                    type="text"
                    list="defense-types-list"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addDefense(category, newValue, setNewValue)}
                    placeholder={`Add ${title.toLowerCase()}...`}
                    className="flex-1 text-sm p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded focus:ring-2 focus:ring-primary focus:outline-none transition-all font-sans min-w-0"
                />
                <button
                    onClick={() => addDefense(category, newValue, setNewValue)}
                    className="px-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-bold flex items-center justify-center min-w-[34px]"
                >
                    <Plus className="w-4 h-4" />
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
                <datalist id="defense-types-list">
                    {ALL_DEFENSE_TYPES.map(type => <option key={type} value={type} />)}
                </datalist>
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
                    colorClass="bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-100 dark:border-purple-800/50 shadow-sm"
                    onNavigateToFeature={onNavigateToFeature}
                />
                <DefenseList
                    title="Vulnerabilities"
                    items={defenses.vulnerabilities}
                    category="vulnerabilities"
                    newValue={newVulnerability}
                    setNewValue={setNewVulnerability}
                    colorClass="bg-orange-50 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border border-orange-100 dark:border-orange-800/50 shadow-sm"
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
