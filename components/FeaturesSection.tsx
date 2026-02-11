"use client";

import React, { useState } from "react";
import { Feature } from "../types/character";
import { Card, CardContent } from "./ui/card";
import Button from "./ui/button";

interface FeaturesSectionProps {
    features: Feature[];
    onUpdate: (features: Feature[]) => void;
    availableClasses?: string[];
}

const ORIGIN_OPTIONS = ["Class", "Species", "Background", "Feat", "Item", "Other"];

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ features = [], onUpdate, availableClasses = [] }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const [formData, setFormData] = useState<Partial<Feature>>({
        name: "",
        description: "",
        origin: "Class",
        subOrigin: "",
        tags: [],
        effects: [],
        source: "",
    });

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedIds(newExpanded);
    };

    const handleAdd = () => {
        const newFeature: Feature = {
            id: Date.now().toString(),
            name: formData.name || "New Feature",
            description: formData.description || "",
            origin: formData.origin || "Other",
            subOrigin: formData.origin === "Class" ? (formData.subOrigin || availableClasses[0] || "") : "",
            tags: formData.tags || [],
            effects: formData.effects || [],
            source: formData.source || "",
        };
        onUpdate([...features, newFeature]);
        setIsAdding(false);
        resetForm();
    };

    const handleSaveEdit = () => {
        if (!editingId) return;
        const updatedData = {
            ...formData,
            subOrigin: formData.origin === "Class" ? (formData.subOrigin || availableClasses[0] || "") : ""
        };
        const updatedFeatures = features.map((f) =>
            f.id === editingId ? { ...f, ...updatedData } as Feature : f
        );
        onUpdate(updatedFeatures);
        setEditingId(null);
        resetForm();
    };

    const handleDelete = (id: string) => {
        onUpdate(features.filter((f) => f.id !== id));
    };

    const startEdit = (feature: Feature) => {
        setFormData(feature);
        setEditingId(feature.id);
        setIsAdding(false);
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            origin: "Class",
            subOrigin: "",
            tags: [],
            effects: [],
            source: "",
        });
    };

    const handleTagChange = (tagString: string) => {
        const tags = tagString.split(",").map(t => t.trim()).filter(t => t !== "");
        setFormData({ ...formData, tags });
    };

    const handleEffectChange = (effectString: string) => {
        const effects = effectString.split("\n").map(e => e.trim()).filter(e => e !== "");
        setFormData({ ...formData, effects });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Features & Traits</h2>
                <Button onClick={() => { setIsAdding(true); setEditingId(null); resetForm(); }}>
                    + Add Feature
                </Button>
            </div>

            {(isAdding || editingId) && (
                <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-900/10 dark:border-blue-800">
                    <CardContent className="p-6 space-y-4">
                        <h3 className="font-bold text-lg">{editingId ? "Edit Feature" : "New Feature"}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-500">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                    placeholder="Feature name..."
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-500">Origin</label>
                                <div className="flex gap-2">
                                    <select
                                        value={formData.origin}
                                        onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                                        className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                    >
                                        {ORIGIN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                    {formData.origin === "Class" && availableClasses.length > 0 && (
                                        <select
                                            value={formData.subOrigin || (availableClasses.length > 0 ? availableClasses[0] : "")}
                                            onChange={(e) => setFormData({ ...formData, subOrigin: e.target.value })}
                                            className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700 animate-in fade-in slide-in-from-left-2 duration-200"
                                        >
                                            {availableClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                                        </select>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-500">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700 h-24"
                                placeholder="Describe the feature..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-500">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    value={formData.tags?.join(", ")}
                                    onChange={(e) => handleTagChange(e.target.value)}
                                    className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                    placeholder="Action, Combat, Passive..."
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-500">Source / Link</label>
                                <input
                                    type="text"
                                    value={formData.source}
                                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                    className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                    placeholder="PHB pg. 123..."
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-500">Effects (one per line)</label>
                            <textarea
                                value={formData.effects?.join("\n")}
                                onChange={(e) => handleEffectChange(e.target.value)}
                                className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700 h-20"
                                placeholder="+1 to AC while active..."
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button onClick={() => { setIsAdding(false); setEditingId(null); }}>
                                Cancel
                            </Button>
                            <Button onClick={editingId ? handleSaveEdit : handleAdd}>
                                {editingId ? "Save Changes" : "Create Feature"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-4">
                {features.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="p-12 text-center text-gray-500 italic">
                            No features added yet. Click "+ Add Feature" to begin.
                        </CardContent>
                    </Card>
                ) : (
                    features.map((feature) => (
                        <Card key={feature.id} className="overflow-hidden group hover:border-blue-400 transition-colors">
                            <CardContent className="p-0">
                                <div
                                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                    onClick={() => toggleExpand(feature.id)}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded whitespace-nowrap ${feature.origin === "Class" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" :
                                            feature.origin === "Species" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" :
                                                feature.origin === "Background" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" :
                                                    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                            }`}>
                                            {feature.origin}{feature.subOrigin ? `: ${feature.subOrigin}` : ""}
                                        </div>
                                        <h4 className="font-bold truncate">{feature.name}</h4>
                                        {feature.tags && feature.tags.length > 0 && (
                                            <div className="hidden sm:flex gap-1 overflow-hidden">
                                                {feature.tags.map(tag => (
                                                    <span key={tag} className="text-[10px] bg-blue-50 text-blue-600 px-1 rounded dark:bg-blue-900/20 dark:text-blue-400">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); startEdit(feature); }}
                                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                        >
                                            ✎
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(feature.id); }}
                                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                        >
                                            ✕
                                        </button>
                                        <div className={`transform transition-transform ${expandedIds.has(feature.id) ? "rotate-180" : ""}`}>
                                            ▼
                                        </div>
                                    </div>
                                </div>

                                {expandedIds.has(feature.id) && (
                                    <div className="p-4 pt-0 border-t border-gray-100 dark:border-gray-800 space-y-3 bg-gray-50/50 dark:bg-gray-900/50 text-sm animate-in slide-in-from-top-2 duration-200">
                                        <div className="whitespace-pre-wrap pt-3 leading-relaxed text-gray-700 dark:text-gray-300">
                                            {feature.description}
                                        </div>

                                        {(feature.effects && feature.effects.length > 0) && (
                                            <div className="space-y-1">
                                                <div className="text-[10px] font-bold uppercase text-gray-400">Active Effects</div>
                                                <ul className="list-disc list-inside space-y-0.5 text-blue-700 dark:text-blue-400 font-medium">
                                                    {feature.effects.map((effect, idx) => (
                                                        <li key={idx}>{effect}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {feature.source && (
                                            <div className="text-xs text-gray-500 italic">
                                                Source: {feature.source}
                                            </div>
                                        )}

                                        {/* Mobile tags */}
                                        {feature.tags && feature.tags.length > 0 && (
                                            <div className="flex sm:hidden flex-wrap gap-1 pt-2">
                                                {feature.tags.map(tag => (
                                                    <span key={tag} className="text-[10px] bg-blue-50 text-blue-600 px-1 rounded dark:bg-blue-900/20 dark:text-blue-400">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default FeaturesSection;
