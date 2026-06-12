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
import { Card, CardContent } from "../ui/card";
import ConfirmationModal from "../ui/ConfirmationModal";
import SectionHeader from "../ui/SectionHeader";
import SearchFilterBar from "../ui/SearchFilterBar";

// Components
import FeatureItem from "./FeatureItem";
import FeatureForm from "./FeatureForm";

// Types
import { Feature, AbilityScores, RollDiceFunc, RollDamageFunc, Resource, CharacterClass } from "../../types/character";

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
    rollDice?: RollDiceFunc;
    rollDamage?: RollDamageFunc;
    species?: string;
    subSpecies?: string;
    background?: string;
    focusedId?: string | null;
    onFocusedIdChange?: (id: string | null) => void;
    character?: any;
}

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
    onFocusedIdChange,
    character
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedOrigin, setSelectedOrigin] = useState("All");
    const [highlightedId, setHighlightedId] = useState<string | null>(null);
    const [featureToDelete, setFeatureToDelete] = useState<string | null>(null);

    useEffect(() => {
        if (focusedId) {
            // Expand the feature
            setExpandedIds(prev => {
                const next = new Set(prev);
                next.add(focusedId);
                return next;
            });

            // Set the highlight state
            setHighlightedId(focusedId);

            // Scroll to it after a short delay to ensure it's rendered/expanded
            const timer = setTimeout(() => {
                const element = document.getElementById(`feature-${focusedId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                
                // Keep the highlight for 2 seconds
                setTimeout(() => {
                    setHighlightedId(null);
                }, 2000);

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

    const handleAdd = (formData: Partial<Feature>) => {
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
            level: formData.level,
        };
        onUpdate([...features, newFeature]);
        setIsAdding(false);
    };

    const handleSaveEdit = (updatedData: Partial<Feature>) => {
        if (!editingId) return;

        const finalData = {
            ...updatedData,
            subOrigin: updatedData.origin === "Class" ? (updatedData.subOrigin || classes[0]?.name || "") :
                updatedData.origin === "Species" ? (updatedData.subOrigin || subSpecies || species || "") :
                    updatedData.origin === "Background" ? (updatedData.subOrigin || background || "") : "",
            subclass: updatedData.origin === "Class" ? updatedData.subclass : "",
        } as Feature;

        if (finalData.origin === "Item" && onUpdateItemFeature) {
            onUpdateItemFeature(finalData);
        } else {
            const updatedFeatures = features.map((f) =>
                f.id === editingId ? { ...f, ...finalData } as Feature : f
            );
            onUpdate(updatedFeatures);
        }
        setEditingId(null);
    };

    const handleDelete = (id: string) => {
        const featureToDelete = allFeatures.find(f => f.id === id);
        if (featureToDelete?.origin === "Item" && onDeleteItemFeature) {
            onDeleteItemFeature(id, featureToDelete.sourceItemId || "");
        } else {
            onUpdate(features.filter((f) => f.id !== id));
        }
    };

    const handleUpdateResourceValue = (id: string, newValue: number) => {
        if (!onUpdateResources) return;
        const newResources = resources.map(r => r.id === id ? { ...r, value: newValue } : r);
        onUpdateResources(newResources);
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
            const originOrder: Record<string, number> = { "Class": 0, "Species": 1, "Background": 2, "Feat": 3, "Item": 4, "Other": 5 };
            const orderA = originOrder[a.origin] ?? 99;
            const orderB = originOrder[b.origin] ?? 99;

            if (orderA !== orderB) return orderA - orderB;

            if (a.origin === "Class" && b.origin === "Class") {
                const levelA = a.level ?? 0;
                const levelB = b.level ?? 0;
                if (levelA !== levelB) return levelA - levelB;
            }

            return a.name.localeCompare(b.name);
        });

    return (
        <div className="space-y-6 pb-20">
            <SectionHeader
                title="Features & Traits"
                buttonLabel="Add Feature"
                onAdd={() => { setIsAdding(true); setEditingId(null); }}
                isAdding={isAdding || !!editingId}
            />

            <SearchFilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search features..."
                filterValue={selectedOrigin}
                onFilterChange={setSelectedOrigin}
                filterOptions={FILTER_OPTIONS.map(opt => ({
                    label: opt === "All" ? "All Origins" : opt,
                    value: opt
                }))}
            />

            {isAdding && (
                <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <FeatureForm
                        initialData={{ origin: "Class", modifiers: [], effects: [] }}
                        onSave={handleAdd}
                        onCancel={() => setIsAdding(false)}
                        isEditing={false}
                        classes={classes}
                        species={species}
                        subSpecies={subSpecies}
                        background={background}
                    />
                </div>
            )}

            <div className="grid grid-cols-1 gap-1 p-2 overflow-visible">
                {allFeatures.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="p-12 text-center text-gray-500 italic">
                            No features added yet. Click "+ Add Feature" to begin.
                        </CardContent>
                    </Card>
                ) : (
                    allFeatures.map((feature) => (
                        <FeatureItem
                            key={feature.id}
                            feature={feature}
                            isEditing={feature.id === editingId}
                            isExpanded={expandedIds.has(feature.id)}
                            highlighted={feature.id === highlightedId}
                            onToggleExpand={() => toggleExpand(feature.id)}
                            onStartEdit={() => setEditingId(feature.id)}
                            onCancelEdit={() => setEditingId(null)}
                            onSaveEdit={handleSaveEdit}
                            onDelete={() => setFeatureToDelete(feature.id)}
                            resources={resources}
                            onUpdateResourceValue={handleUpdateResourceValue}
                            abilityScores={abilityScores}
                            proficiencyBonus={proficiencyBonus}
                            totalLevel={totalLevel}
                            rollDamage={rollDamage}
                            classes={classes}
                            species={species}
                            subSpecies={subSpecies}
                            background={background}
                            character={character}
                        />
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
