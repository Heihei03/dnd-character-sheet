"use client";

import React, { useState } from "react";
import { Sense } from "../types/character";
import { SENSES_LIST } from "../utils/constants";

interface SensesSectionProps {
    senses: Sense[];
    onUpdateSenses: (senses: Sense[]) => void;
}

const SensesSection: React.FC<SensesSectionProps> = ({
    senses = [],
    onUpdateSenses,
}) => {
    const [newSense, setNewSense] = useState({ name: "", value: "" });

    const addSense = () => {
        if (newSense.name && newSense.value) {
            onUpdateSenses([...senses, newSense]);
            setNewSense({ name: "", value: "" });
        }
    };

    const removeSense = (index: number) => {
        onUpdateSenses(senses.filter((_, i) => i !== index));
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
                        <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-800 text-sm animate-in slide-in-from-left-2 duration-200">
                            <span className="font-semibold text-gray-700 dark:text-gray-300 truncate mr-2">{sense.name}</span>
                            <div className="flex items-center gap-3 shrink-0">
                                <span className="font-bold text-blue-600 dark:text-blue-400">{sense.value}</span>
                                <button
                                    onClick={() => removeSense(idx)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    ✕
                                </button>
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
                        className="px-3 py-2 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700 transition-colors shadow-sm shrink-0"
                    >
                        +
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SensesSection;
