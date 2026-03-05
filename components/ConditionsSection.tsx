"use client";

import React, { useState } from "react";
import { Condition } from "../types/character";
import { CONDITION_TYPES } from "../utils/constants";
import { CONDITION_DATA } from "../data/conditions";
import { Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";
import ConfirmationModal from "./ui/ConfirmationModal";

interface ConditionsSectionProps {
    conditions: Condition[];
    onUpdateConditions: (conditions: Condition[]) => void;
}

const ConditionsSection: React.FC<ConditionsSectionProps> = ({
    conditions = [],
    onUpdateConditions,
}) => {
    const [newConditionName, setNewConditionName] = useState("");
    const [conditionToDelete, setConditionToDelete] = useState<Condition | null>(null);
    const [expandedConditions, setExpandedConditions] = useState<string[]>([]);

    const toggleExpand = (name: string) => {
        setExpandedConditions(prev =>
            prev.includes(name)
                ? prev.filter(c => c !== name)
                : [...prev, name]
        );
    };

    const addCondition = () => {
        if (newConditionName) {
            const manualConditions = conditions.filter(c => !c.fromFeature);
            // Check if already exists
            if (conditions.some(c => c.name.toLowerCase() === newConditionName.toLowerCase())) {
                setNewConditionName("");
                return;
            }
            onUpdateConditions([...manualConditions, { name: newConditionName }]);
            setNewConditionName("");
        }
    };

    const removeCondition = (condition: Condition) => {
        if (condition.fromFeature) return;
        const manualConditions = conditions.filter(c => !c.fromFeature);
        onUpdateConditions(manualConditions.filter(c => c.name !== condition.name));
    };

    return (
        <div className="border p-3 rounded bg-white dark:bg-gray-950 shadow-sm transition-all font-sans space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold text-lg">Conditions</span>
            </div>

            <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                    {conditions.length === 0 && <span className="text-sm text-gray-400 italic">No active conditions.</span>}
                    {conditions.map((condition, idx) => {
                        const isExpanded = expandedConditions.includes(condition.name);
                        const description = CONDITION_DATA[condition.name];

                        return (
                            <div key={idx} className="flex flex-col animate-in slide-in-from-left-2 duration-200">
                                <div
                                    onClick={() => toggleExpand(condition.name)}
                                    className={`flex justify-between items-center bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-t border-x border-t border-gray-200 dark:border-gray-800 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${!isExpanded ? 'rounded-b border-b' : ''} ${condition.fromFeature ? 'border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-950/20' : ''}`}
                                >
                                    <div className="flex items-center gap-2 truncate mr-2">
                                        {description ? (
                                            isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />
                                        ) : (
                                            <div className="w-4" />
                                        )}
                                        <span className="font-semibold text-gray-700 dark:text-gray-300 truncate">{condition.name}</span>
                                        {condition.fromFeature && (
                                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800 tracking-wider">Feature</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        {!condition.fromFeature && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setConditionToDelete(condition);
                                                }}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {isExpanded && description && (
                                    <div className="bg-white dark:bg-gray-950 px-3 py-2 border-x border-b border-gray-200 dark:border-gray-800 rounded-b text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic animate-in fade-in slide-in-from-top-1 duration-200">
                                        {description}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="flex gap-2 items-center">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            list="conditions-list"
                            value={newConditionName}
                            onChange={(e) => setNewConditionName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addCondition()}
                            placeholder="Add condition..."
                            className="w-full text-sm p-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans min-w-0"
                        />
                        <datalist id="conditions-list">
                            {CONDITION_TYPES.map(type => <option key={type} value={type} />)}
                        </datalist>
                    </div>
                    <button
                        onClick={addCondition}
                        className="px-3 py-2 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700 transition-colors shadow-sm shrink-0 flex items-center justify-center min-w-[34px]"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={conditionToDelete !== null}
                onClose={() => setConditionToDelete(null)}
                onConfirm={() => {
                    if (conditionToDelete) {
                        removeCondition(conditionToDelete);
                        setConditionToDelete(null);
                    }
                }}
                title="Remove Condition"
                message={`Are you sure you want to remove the "${conditionToDelete?.name}" condition?`}
                confirmText="Remove"
            />
        </div>
    );
};

export default ConditionsSection;
