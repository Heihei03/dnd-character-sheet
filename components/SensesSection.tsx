"use client";

import React, { useState } from "react";
import { Sense } from "../types/character";
import { SENSES_LIST } from "../utils/constants";
import { Trash2, Plus } from "lucide-react";
import ConfirmationModal from "./ui/ConfirmationModal";

interface SensesSectionProps {
    senses: Sense[];
    onUpdateSenses: (senses: Sense[]) => void;
    onNavigateToFeature?: (featureId: string) => void;
}

const SensesSection: React.FC<SensesSectionProps> = ({
    senses = [],
    onUpdateSenses,
    onNavigateToFeature,
}) => {
    const [newSense, setNewSense] = useState({ name: "", value: "" });
    const [senseToDelete, setSenseToDelete] = useState<Sense | null>(null);

    const addSense = () => {
        if (newSense.name && newSense.value) {
            const manualSenses = senses.filter(s => !s.fromFeature);
            onUpdateSenses([...manualSenses, newSense]);
            setNewSense({ name: "", value: "" });
        }
    };

    const removeSense = (sense: Sense) => {
        if (sense.fromFeature) return;
        const manualSenses = senses.filter(s => !s.fromFeature);
        onUpdateSenses(manualSenses.filter(s => s.name !== sense.name));
    };

    return (
        <div className="border p-3 rounded bg-white dark:bg-gray-950 shadow-sm transition-all font-sans space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold text-lg">Senses</span>
            </div>

            <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                    {senses.length === 0 && <span className="text-sm text-gray-400 italic">No special senses.</span>}
                    {senses.map((sense, idx) => (
                        <div key={idx} className={`flex justify-between items-center bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-800 text-sm animate-in slide-in-from-left-2 duration-200 ${sense.fromFeature ? 'border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-950/20' : ''}`}>
                            <div className="flex items-center gap-2 truncate mr-2">
                                <span className="font-semibold text-gray-700 dark:text-gray-300 truncate">{sense.name}</span>
                                {sense.fromFeature && (
                                    <span
                                        className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800 tracking-wider cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                                        title="Granted by Feature - Click to view"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (sense.fromFeatureId && onNavigateToFeature) {
                                                onNavigateToFeature(sense.fromFeatureId);
                                            }
                                        }}
                                    >
                                        Feature
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <span className="font-bold text-blue-600 dark:text-blue-400">{sense.value}</span>
                                {!sense.fromFeature && (
                                    <button
                                        onClick={() => setSenseToDelete(sense)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 items-center">
                    <div className="flex-[2] relative">
                        <input
                            type="text"
                            list="senses-list"
                            value={newSense.name}
                            onChange={(e) => setNewSense({ ...newSense, name: e.target.value })}
                            placeholder="Sense..."
                            className="w-full text-sm p-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans min-w-0"
                        />
                        <datalist id="senses-list">
                            {SENSES_LIST.map(sense => <option key={sense} value={sense} />)}
                        </datalist>
                    </div>
                    <input
                        type="text"
                        value={newSense.value}
                        onChange={(e) => setNewSense({ ...newSense, value: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && addSense()}
                        placeholder="Range..."
                        className="flex-1 text-sm p-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans min-w-0"
                    />
                    <button
                        onClick={addSense}
                        className="px-3 py-2 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700 transition-colors shadow-sm shrink-0 flex items-center justify-center min-w-[34px]"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={senseToDelete !== null}
                onClose={() => setSenseToDelete(null)}
                onConfirm={() => {
                    if (senseToDelete) {
                        removeSense(senseToDelete);
                        setSenseToDelete(null);
                    }
                }}
                title="Remove Sense"
                message={`Are you sure you want to remove "${senseToDelete?.name}"?`}
                confirmText="Remove"
            />
        </div>
    );
};

export default SensesSection;
