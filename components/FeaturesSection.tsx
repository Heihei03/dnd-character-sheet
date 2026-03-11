"use client";

import React, { useEffect, useState } from "react";
import { 
  ChevronDown, 
  Dices, 
  Minus, 
  Pencil, 
  Plus, 
  RotateCcw, 
  Search, 
  Trash2, 
  X 
} from "lucide-react";

// UI Components
import Button from "./ui/button";
import { Card, CardContent } from "./ui/card";
import ConfirmationModal from "./ui/ConfirmationModal";
import EntityForm from "./ui/EntityForm";
import SectionHeader from "./ui/SectionHeader";

// Components
import FeatureModifierEditor from "./FeatureModifierEditor";
import ResourcePipTracker from "./ResourcePipTracker";

// Types
import { AbilityScores, CharacterClass, Feature, Resource } from "../types/character";

// Utils
import { resolveRollExpression } from "../utils/character-utils";

interface FeaturesSectionProps {
    features: Feature[];
    itemFeatures?: Feature[];
    onUpdate: (features: Feature[]) => void;
    onUpdateItemFeature?: (feature: Feature) => void;
    onDeleteItemFeature?: (featureId: string, itemId: string) => void;
    resources?: Resource[];
    onUpdateResources?: (resources: Resource[]) => void;
    classes?: CharacterClass[];
    abilityScores: AbilityScores;
    proficiencyBonus: number;
    totalLevel: number;
    rollDice?: (sides: number, modifier?: number, label?: string) => void;
    rollDamage?: (damageString: string, label?: string, damageType?: string) => void;
    species?: string;
    subSpecies?: string;
    background?: string;
    focusedId?: string | null;
    onFocusedIdChange?: (id: string | null) => void;
}

const ORIGIN_OPTIONS = ["Class", "Species", "Background", "Feat", "Item", "Other"];
const FILTER_OPTIONS = ["All", "Class", "Subclass", "Species", "Background", "Feat", "Item", "Other"];

const FeaturesSection: React.FC<FeaturesSectionProps> = ({
    features = [],
    itemFeatures = [],
    onUpdate,
    onUpdateItemFeature,
    onDeleteItemFeature,
    resources = [],
    onUpdateResources,
    classes = [],
    abilityScores,
    proficiencyBonus,
    totalLevel,
    rollDice,
    rollDamage,
    species = "",
    subSpecies = "",
    background = "",
    focusedId = null,
    onFocusedIdChange
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedOrigin, setSelectedOrigin] = useState("All");
    const [featureToDelete, setFeatureToDelete] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<Feature>>({
        name: "",
        description: "",
        origin: "Class",
        subOrigin: "",
        subclass: "",
        modifiers: [],
        effects: [],
    });

    useEffect(() => {
        if (focusedId) {
            // Expand the feature
            setExpandedIds(prev => {
                const next = new Set(prev);
                next.add(focusedId);
                return next;
            });

            // Scroll to it after a short delay to ensure it's rendered/expanded
            const timer = setTimeout(() => {
                const element = document.getElementById(`feature-${focusedId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Visual feedback: briefly highlight
                    // Add relative and z-10 to ensure the ring isn't hidden by adjacent cards (gap-0)
                    element.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50', 'relative', 'z-10');
                    setTimeout(() => {
                        element.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50', 'relative', 'z-10');
                    }, 2000);
                }
                // Reset focusedId so it can be re-triggered
                if (onFocusedIdChange) {
                    onFocusedIdChange(null);
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [focusedId, onFocusedIdChange]);

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
        const currentClass = classes.find(c => c.name === (formData.subOrigin || classes[0]?.name));

        const newFeature: Feature = {
            id: Date.now().toString(),
            name: formData.name || "New Feature",
            description: formData.description || "",
            origin: formData.origin || "Other",
            subOrigin: formData.origin === "Class" ? (formData.subOrigin || classes[0]?.name || "") :
                formData.origin === "Species" ? (formData.subOrigin || subSpecies || species || "") :
                    formData.origin === "Background" ? (formData.subOrigin || background || "") : "",
            subclass: formData.origin === "Class" ? formData.subclass : "",
            modifiers: formData.modifiers || [],
            effects: formData.effects || [],
        };
        onUpdate([...features, newFeature]);
        setIsAdding(false);
        resetForm();
    };

    const handleSaveEdit = () => {
        if (!editingId) return;
        const updatedData = {
            ...formData,
            subOrigin: formData.origin === "Class" ? (formData.subOrigin || classes[0]?.name || "") :
                formData.origin === "Species" ? (formData.subOrigin || subSpecies || species || "") :
                    formData.origin === "Background" ? (formData.subOrigin || background || "") : "",
            subclass: formData.origin === "Class" ? formData.subclass : ""
        } as Feature;

        if (formData.origin === "Item" && onUpdateItemFeature) {
            onUpdateItemFeature(updatedData);
        } else {
            const updatedFeatures = features.map((f) =>
                f.id === editingId ? { ...f, ...updatedData } as Feature : f
            );
            onUpdate(updatedFeatures);
        }
        setEditingId(null);
        resetForm();
    };

    const handleDelete = (id: string) => {
        const featureToDelete = allFeatures.find(f => f.id === id);
        if (featureToDelete?.origin === "Item" && onDeleteItemFeature) {
            onDeleteItemFeature(id, featureToDelete.sourceItemId || "");
        } else {
            onUpdate(features.filter((f) => f.id !== id));
        }
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
            subclass: "",
            modifiers: [],
            effects: [],
            level: undefined,
        });
    };

    const handleUpdateResourceValue = (id: string, newValue: number) => {
        if (!onUpdateResources) return;
        const newResources = resources.map(r => r.id === id ? { ...r, value: newValue } : r);
        onUpdateResources(newResources);
    };

    const handleRoll = (mod: any, featureName: string) => {
        if (!rollDamage) return;

        let expr = "";
        let label = featureName;

        if (mod.type === "Roll") {
            expr = mod.value as string;
            if (mod.subType && mod.subType !== "all") label = `${featureName} (${mod.subType})`;
        } else if (mod.type === "New Action") {
            try {
                const data = JSON.parse(mod.value as string || "{}");
                expr = data.damageDice;
                label = data.name || featureName;
            } catch { return; }
        }

        if (expr) {
            const resolved = resolveRollExpression(expr, abilityScores, totalLevel, proficiencyBonus);
            rollDamage(resolved, label);
        }
    };

    const allFeatures = [...features, ...itemFeatures]
        .filter(feature => {
            let matchesOrigin = true;
            if (selectedOrigin === "All") {
                matchesOrigin = true;
            } else if (selectedOrigin === "Subclass") {
                matchesOrigin = feature.origin === "Class" && !!feature.subclass;
            } else {
                matchesOrigin = feature.origin === selectedOrigin;
            }

            const matchesSearch = feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                feature.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesOrigin && matchesSearch;
        })
        .sort((a, b) => {
            // Sort by origin first (Class -> Species -> Background -> Feat -> Item -> Other)
            const originOrder: Record<string, number> = { "Class": 0, "Species": 1, "Background": 2, "Feat": 3, "Item": 4, "Other": 5 };
            const orderA = originOrder[a.origin] ?? 99;
            const orderB = originOrder[b.origin] ?? 99;

            if (orderA !== orderB) return orderA - orderB;

            // Within Class features, sort by level
            if (a.origin === "Class" && b.origin === "Class") {
                const levelA = a.level ?? 0;
                const levelB = b.level ?? 0;
                if (levelA !== levelB) return levelA - levelB;
            }

            // Finally sort by name
            return a.name.localeCompare(b.name);
        });

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Features & Traits"
                buttonLabel="Add Feature"
                onAdd={() => { setIsAdding(true); setEditingId(null); resetForm(); }}
                isAdding={isAdding || !!editingId}
            />

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Search className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search features..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <div className="w-full md:w-48">
                    <select
                        value={selectedOrigin}
                        onChange={(e) => setSelectedOrigin(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm appearance-none"
                    >
                        {FILTER_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt === "All" ? "All Origins" : opt}</option>
                        ))}
                    </select>
                </div>
            </div>

            {(isAdding || editingId) && (
                <EntityForm
                    title={editingId ? "Edit Feature" : "New Feature"}
                    onSave={editingId ? handleSaveEdit : handleAdd}
                    onCancel={() => { setIsAdding(false); setEditingId(null); resetForm(); }}
                    saveLabel={editingId ? "Save Changes" : "Create Feature"}
                    isEditing={!!editingId}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-500">Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700 font-medium"
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

                                {formData.origin === "Class" && classes.length > 0 && (
                                    <div className="flex flex-col gap-2 w-full">
                                        <select
                                            value={formData.subOrigin || (classes.length > 0 ? classes[0].name : "")}
                                            onChange={(e) => setFormData({ ...formData, subOrigin: e.target.value, subclass: "" })}
                                            className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700 animate-in fade-in slide-in-from-left-2 duration-200"
                                        >
                                            {classes.map(cls => <option key={cls.name} value={cls.name}>{cls.name}</option>)}
                                        </select>

                                        {/* Subclass Selection */}
                                        {classes.find(c => c.name === (formData.subOrigin || classes[0].name))?.subclass && (
                                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                                <label className="text-[10px] font-bold uppercase text-gray-400 whitespace-nowrap">Subclass Feature?</label>
                                                <select
                                                    value={formData.subclass || ""}
                                                    onChange={(e) => setFormData({ ...formData, subclass: e.target.value })}
                                                    className="flex-1 p-1 text-xs border rounded dark:bg-gray-900 dark:border-gray-700"
                                                >
                                                    <option value="">None (Base Class)</option>
                                                    <option value={classes.find(c => c.name === (formData.subOrigin || classes[0].name))?.subclass}>
                                                        {classes.find(c => c.name === (formData.subOrigin || classes[0].name))?.subclass}
                                                    </option>
                                                </select>
                                            </div>
                                        )}

                                        {/* Level Selection */}
                                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200 mt-1">
                                            <label className="text-[10px] font-bold uppercase text-gray-400 whitespace-nowrap">Level Gained</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="20"
                                                value={formData.level || ""}
                                                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || undefined })}
                                                className="w-16 p-1 text-xs border rounded dark:bg-gray-900 dark:border-gray-700"
                                                placeholder="Lvl..."
                                            />
                                        </div>
                                    </div>
                                )}
                                {formData.origin === "Species" && (
                                    <select
                                        value={formData.subOrigin || (subSpecies || species || "")}
                                        onChange={(e) => setFormData({ ...formData, subOrigin: e.target.value })}
                                        className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700 animate-in fade-in slide-in-from-left-2 duration-200"
                                    >
                                        <option value={species}>{species}</option>
                                        {subSpecies && <option value={subSpecies}>{subSpecies}</option>}
                                        <option value="">Other...</option>
                                    </select>
                                )}
                                {formData.origin === "Background" && (
                                    <input
                                        type="text"
                                        value={formData.subOrigin || background || ""}
                                        onChange={(e) => setFormData({ ...formData, subOrigin: e.target.value })}
                                        className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700 animate-in fade-in slide-in-from-left-2 duration-200"
                                        placeholder="Background name..."
                                    />
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

                    <FeatureModifierEditor
                        modifiers={formData.modifiers || []}
                        onUpdate={(modifiers) => setFormData({ ...formData, modifiers })}
                        parentName={formData.name}
                    />
                </EntityForm>
            )}

            <div className="grid grid-cols-1 gap-0">
                {allFeatures.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="p-12 text-center text-gray-500 italic">
                            No features added yet. Click "+ Add Feature" to begin.
                        </CardContent>
                    </Card>
                ) : (
                    allFeatures.map((feature) => (
                        <Card
                            key={feature.id}
                            id={`feature-${feature.id}`}
                            className="overflow-hidden group border-none rounded-none shadow-none hover:shadow transition-all duration-200"
                        >
                            <CardContent className="p-0">
                                <div
                                    className="p-3 px-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                    onClick={() => toggleExpand(feature.id)}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden flex-1">
                                        <div className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded whitespace-nowrap ${feature.origin === "Class" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" :
                                            feature.origin === "Species" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" :
                                                feature.origin === "Background" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" :
                                                    feature.origin === "Item" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                                                        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                            }`}>
                                            {feature.origin}: {feature.subclass ? `${feature.subclass} ` : ""}{feature.subOrigin || ""}
                                            {feature.level && feature.origin === "Class" ? ` Lvl ${feature.level}` : ""}
                                        </div>
                                        <h4 className="font-bold truncate">{feature.name}</h4>
                                        {feature.modifiers && feature.modifiers.length > 0 && (
                                            <div className="hidden sm:flex gap-1 overflow-hidden">
                                                {feature.modifiers.map(mod => (
                                                    <span key={mod.id} className={`text-[9px] font-bold px-1.5 rounded uppercase tracking-tighter ${mod.type === "Sense" ? "bg-amber-100 text-amber-700" :
                                                        mod.type === "Speed" ? "bg-emerald-100 text-emerald-700" :
                                                            mod.type === "Bonus" ? "bg-rose-100 text-rose-700" :
                                                                "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                                        }`}>
                                                        {mod.subType || mod.type}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {/* Roll Button for unexpanded view */}
                                        {!expandedIds.has(feature.id) && (() => {
                                            const rollableMod = (feature.modifiers || []).find(m => {
                                                if (m.type === "Roll" && m.value) return true;
                                                if (m.type === "New Action") {
                                                    try {
                                                        const data = JSON.parse(m.value as string || "{}");
                                                        return !!data.damageDice;
                                                    } catch { return false; }
                                                }
                                                return false;
                                            });

                                            if (!rollableMod) return null;

                                            return (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleRoll(rollableMod, feature.name); }}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors flex items-center gap-1.5"
                                                    title="Quick Roll"
                                                >
                                                    <Dices className="w-4 h-4" />
                                                    {rollableMod.type === "Roll" && <span className="text-[10px] font-bold font-mono">{rollableMod.value}</span>}
                                                </button>
                                            );
                                        })()}

                                        {/* Resource Tracker for unexpanded view - Always Visible */}
                                        {!expandedIds.has(feature.id) && feature.modifiers?.some(m => m.type === "Resource") && (
                                            <div
                                                className="hidden md:block w-56"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {feature.modifiers
                                                    .filter(m => m.type === "Resource")
                                                    .map(mod => {
                                                        let resourceName = "";
                                                        let relevantResource: Resource | undefined;
                                                        try {
                                                            const data = JSON.parse(mod.value as string || "{}");
                                                            resourceName = data.name || mod.subType || "";
                                                            relevantResource = resources.find(r => r.name.toLowerCase() === resourceName.toLowerCase());
                                                        } catch {
                                                            resourceName = (mod.value as string) || mod.subType || "";
                                                            relevantResource = resources.find(r => r.name.toLowerCase() === resourceName.toLowerCase());
                                                        }

                                                        if (!relevantResource) return null;

                                                        return (
                                                            <div key={mod.id} className="scale-90 origin-right translate-x-1">
                                                                <ResourcePipTracker
                                                                    resource={relevantResource}
                                                                    onUpdate={(val) => handleUpdateResourceValue(relevantResource!.id, val)}
                                                                    compact={true}
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); startEdit(feature); }}
                                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setFeatureToDelete(feature.id); }}
                                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <ChevronDown className={`w-4 h-4 text-gray-400 transform transition-transform ${expandedIds.has(feature.id) ? "rotate-180" : ""}`} />
                                        </div>
                                    </div>
                                </div>

                                {expandedIds.has(feature.id) && (
                                    <div className="p-4 pt-0 border-t border-gray-100 dark:border-gray-800 space-y-4 bg-gray-50/50 dark:bg-gray-900/50 text-sm animate-in slide-in-from-top-2 duration-200">
                                        <div className="whitespace-pre-wrap pt-3 leading-relaxed text-gray-700 dark:text-gray-300">
                                            {feature.description}
                                        </div>

                                        {(feature.modifiers && feature.modifiers.length > 0) && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pt-1">
                                                {feature.modifiers.map((mod) => {
                                                    const isResource = mod.type === "Resource";
                                                    let resourceName = "";
                                                    let relevantResource: Resource | undefined;

                                                    if (isResource) {
                                                        try {
                                                            const data = JSON.parse(mod.value as string || "{}");
                                                            resourceName = data.name || mod.subType || "";
                                                            relevantResource = resources.find(r => r.name.toLowerCase() === resourceName.toLowerCase());
                                                        } catch {
                                                            resourceName = (mod.value as string) || mod.subType || "";
                                                            relevantResource = resources.find(r => r.name.toLowerCase() === resourceName.toLowerCase());
                                                        }
                                                    }

                                                    return (
                                                        <div key={mod.id} className={`flex flex-col border-b border-gray-100 dark:border-gray-800 pb-2 ${isResource ? "sm:col-span-2" : ""}`}>
                                                            <div className="flex items-center justify-between mb-1">
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] uppercase font-bold text-gray-400 leading-tight">{mod.type}</span>
                                                                    <span className="font-semibold text-gray-700 dark:text-gray-200">{isResource ? resourceName : mod.subType}</span>
                                                                </div>
                                                                {!isResource && mod.type !== "Resistance" && mod.type !== "Immunity" && mod.type !== "Vulnerability" && (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="font-mono bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-100 dark:border-gray-700 shadow-sm text-blue-600 dark:text-blue-400 text-xs">
                                                                            {mod.value}
                                                                        </div>
                                                                        {(mod.type === "Roll" || mod.type === "New Action") && (
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); handleRoll(mod, feature.name); }}
                                                                                className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                                                                title="Roll"
                                                                            >
                                                                                <Dices className="w-4 h-4" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                {isResource && relevantResource && (
                                                                    <div className="mt-1">
                                                                        <ResourcePipTracker
                                                                            resource={relevantResource}
                                                                            onUpdate={(val) => handleUpdateResourceValue(relevantResource.id, val)}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {(feature.effects && feature.effects.length > 0) && (
                                            <div className="space-y-1">
                                                <div className="text-[10px] font-bold uppercase text-gray-400">Additional Effects</div>
                                                <ul className="list-disc list-inside space-y-0.5 text-gray-600 dark:text-gray-400">
                                                    {feature.effects.map((effect, idx) => (
                                                        <li key={idx}>{effect}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <ConfirmationModal
                isOpen={featureToDelete !== null}
                onClose={() => setFeatureToDelete(null)}
                onConfirm={() => {
                    if (featureToDelete) {
                        handleDelete(featureToDelete);
                        setFeatureToDelete(null);
                    }
                }}
                title="Delete Feature"
                message={`Are you sure you want to delete "${allFeatures.find(f => f.id === featureToDelete)?.name}"? This action cannot be undone.`}
                confirmText="Delete"
            />
        </div>
    );
};

export default FeaturesSection;
