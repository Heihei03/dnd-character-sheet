"use client";

import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import ConfirmationModal from "../../ui/ConfirmationModal";
import { FeatureModifier, ModifierType, MODIFIER_TYPES } from "../../../types/modifiers";

interface ModifierBaseProps {
    modifier: FeatureModifier;
    onUpdate: (updates: Partial<FeatureModifier>) => void;
    onRemove: () => void;
    children: React.ReactNode;
}

const ModifierBase: React.FC<ModifierBaseProps> = ({ modifier, onUpdate, onRemove, children }) => {
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    return (
        <div className="grid grid-cols-12 gap-2 items-start bg-white dark:bg-gray-950 p-2 rounded border border-gray-100 dark:border-gray-800 transition-all hover:border-gray-200 dark:hover:border-gray-700">
            {/* Type Selector */}
            <div className="col-span-3">
                <select
                    value={modifier.type}
                    onChange={(e) => onUpdate({ type: e.target.value as ModifierType })}
                    className="w-full text-xs p-1.5 border-none focus:ring-0 bg-transparent font-bold uppercase"
                >
                    {MODIFIER_TYPES.map((t: ModifierType) => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            {/* Main Content Area */}
            <div className="col-span-8">
                {children}
            </div>

            {/* Actions (Delete button) */}
            <div className="col-span-1 flex justify-end items-center">
                <button
                    onClick={() => setIsConfirmingDelete(true)}
                    className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Footer: Attunement Checkbox and Delete Confirmation */}
            <div className="col-span-12 flex items-center gap-1.5 pt-1.5 border-t border-gray-50 dark:border-gray-900 mt-1">
                <div className="flex items-center gap-1.5">
                    <input
                        type="checkbox"
                        id={`attune-${modifier.id}`}
                        checked={!!modifier.requiresAttunement}
                        onChange={(e) => onUpdate({ requiresAttunement: e.target.checked })}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`attune-${modifier.id}`} className="text-[10px] font-bold text-gray-400 uppercase cursor-pointer select-none">
                        Attunement Required
                    </label>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isConfirmingDelete}
                onClose={() => setIsConfirmingDelete(false)}
                onConfirm={() => {
                    onRemove();
                    setIsConfirmingDelete(false);
                }}
                title="Remove Modifier"
                message={`Are you sure you want to remove this ${modifier.type} modifier?`}
                confirmText="Remove"
            />
        </div>
    );
};

export default ModifierBase;
