"use client";

import React from "react";
import { Feature } from "../../types/character";
import FeatureModifierEditor from "../FeatureModifierEditor";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import ConfirmationModal from "../ui/ConfirmationModal";

interface ItemFeaturesEditorProps {
    itemName: string;
    features: Feature[];
    onUpdate: (features: Feature[]) => void;
}

const ItemFeaturesEditor: React.FC<ItemFeaturesEditorProps> = ({ itemName, features, onUpdate }) => {
    const [featureToDelete, setFeatureToDelete] = useState<string | null>(null);
    const addFeature = () => {
        const newFeature: Feature = {
            id: `item-feature-${Date.now()}`,
            name: itemName || "New Feature",
            description: "",
            origin: "Item",
            modifiers: [],
            effects: []
        };
        onUpdate([...features, newFeature]);
    };

    const updateFeature = (id: string, updates: Partial<Feature>) => {
        onUpdate(features.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const removeFeature = (id: string) => {
        onUpdate(features.filter(f => f.id !== id));
    };

    return (
        <div className="md:col-span-2 mt-4 space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
            <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Item Features & Modifiers</h4>
                <button
                    onClick={addFeature}
                    className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-2 py-1 rounded font-bold uppercase transition-colors"
                >
                    + Add Feature
                </button>
            </div>

            <div className="space-y-4">
                {features.map((feature) => (
                    <div key={feature.id} className="p-3 bg-white dark:bg-gray-950 rounded-lg border border-gray-100 dark:border-gray-800 space-y-3 shadow-sm">
                        <div className="flex justify-between items-start gap-2">
                            <div className="flex-1 space-y-2">
                                <input
                                    type="text"
                                    value={feature.name}
                                    onChange={e => updateFeature(feature.id, { name: e.target.value })}
                                    className="w-full text-sm font-bold bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-500 focus:ring-0 p-0"
                                    placeholder="Feature Name"
                                />
                                <textarea
                                    value={feature.description}
                                    onChange={e => updateFeature(feature.id, { description: e.target.value })}
                                    className="w-full text-xs text-gray-500 bg-transparent border-none focus:ring-0 p-0 resize-none h-12"
                                    placeholder="Description of the feature/effect..."
                                />
                            </div>
                            <button
                                onClick={() => setFeatureToDelete(feature.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="pt-2 border-t border-gray-50 dark:border-gray-900">
                            <FeatureModifierEditor
                                modifiers={feature.modifiers || []}
                                onUpdate={(mods) => updateFeature(feature.id, { modifiers: mods })}
                                parentName={feature.name}
                            />
                        </div>
                    </div>
                ))}

                {features.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-gray-50 dark:border-gray-900 rounded-xl">
                        <p className="text-xs text-gray-400 italic font-medium uppercase tracking-tight">No active features or modifiers for this item</p>
                        <button
                            onClick={addFeature}
                            className="mt-1 text-xs text-blue-600 font-bold uppercase hover:underline"
                        >
                            + Add One Now
                        </button>
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={featureToDelete !== null}
                onClose={() => setFeatureToDelete(null)}
                onConfirm={() => {
                    if (featureToDelete) {
                        removeFeature(featureToDelete);
                        setFeatureToDelete(null);
                    }
                }}
                title="Remove Feature"
                message={`Are you sure you want to remove the feature "${features.find(f => f.id === featureToDelete)?.name}"?`}
                confirmText="Remove"
            />
        </div>
    );
};

export default ItemFeaturesEditor;
