"use client";

import React from "react";
import { Plus } from "lucide-react";
import { FeatureModifier, ModifierType } from "../../types/modifiers";

// Modular Modifier Components
import ModifierBase from "./modifiers/ModifierBase";
import RollModifier from "./modifiers/RollModifier";
import BonusModifier from "./modifiers/BonusModifier";
import SpellModifier from "./modifiers/SpellModifier";
import ResourceModifier from "./modifiers/ResourceModifier";
import ActionModifier from "./modifiers/ActionModifier";
import ProficiencyModifier from "./modifiers/ProficiencyModifier";
import RollTargetModifier from "./modifiers/RollTargetModifier";
import ValueModifier from "./modifiers/ValueModifier";

interface FeatureModifierEditorProps {
    modifiers: FeatureModifier[];
    onUpdate: (modifiers: FeatureModifier[]) => void;
    parentName?: string;
}

const FeatureModifierEditor: React.FC<FeatureModifierEditorProps> = ({ modifiers, onUpdate, parentName }) => {
    const addModifier = () => {
        const newModifier: FeatureModifier = {
            id: Date.now().toString(),
            type: "Other",
            subType: "",
            value: "",
        };
        onUpdate([...modifiers, newModifier]);
    };

    const updateModifier = (id: string, updates: Partial<FeatureModifier>) => {
        const newModifiers = modifiers.map(m => {
            if (m.id === id) {
                const updated = { ...m, ...updates };
                
                // Autopopulate name from feature name (parentName) if empty
                if (parentName) {
                    if (updates.type === "New Action" && !updated.value) {
                        updated.value = JSON.stringify({ name: parentName, type: "Action" });
                    } else if (updates.type === "Resource" && (!updated.value || updated.value === "{}")) {
                        updated.value = JSON.stringify({ name: parentName, max: 0, regain: "Long Rest", regainAmount: "All" });
                    }
                }
                return updated;
            }
            return m;
        });
        onUpdate(newModifiers);
    };

    const removeModifier = (id: string) => {
        onUpdate(modifiers.filter(m => m.id !== id));
    };

    const renderModifierContent = (mod: FeatureModifier) => {
        const commonProps = {
            modifier: mod,
            onUpdate: (updates: Partial<FeatureModifier>) => updateModifier(mod.id, updates),
        };

        switch (mod.type) {
            case "Roll":
                return <RollModifier {...commonProps} />;
            case "Bonus":
                return <BonusModifier {...commonProps} />;
            case "Spell":
                return <SpellModifier {...commonProps} />;
            case "Resource":
                return <ResourceModifier {...commonProps} parentName={parentName} />;
            case "New Action":
                return (
                    <ActionModifier 
                        {...commonProps} 
                        parentName={parentName} 
                        availableResources={modifiers} 
                    />
                );
            case "Proficiency":
                return <ProficiencyModifier {...commonProps} />;
            case "Advantage":
            case "Disadvantage":
            case "Extra Advantage":
                return <RollTargetModifier {...commonProps} />;
            default:
                return <ValueModifier {...commonProps} />;
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase text-gray-500">Modifiers</label>
                <button
                    onClick={addModifier}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider flex items-center gap-1 transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" /> Add Modifier
                </button>
            </div>

            <div className="space-y-3">
                {modifiers.map((mod) => (
                    <ModifierBase 
                        key={mod.id} 
                        modifier={mod} 
                        onUpdate={(updates) => updateModifier(mod.id, updates)}
                        onRemove={() => removeModifier(mod.id)}
                    >
                        {renderModifierContent(mod)}
                    </ModifierBase>
                ))}
                
                {modifiers.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-lg">
                        <p className="text-xs text-gray-400 italic">No modifiers added yet. Boost your feature with mechanical effects!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeatureModifierEditor;
