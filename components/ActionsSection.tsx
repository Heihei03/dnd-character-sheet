"use client";

import React, { useState } from "react";

// UI Components
import { Card, CardContent } from "./ui/card";
import ConfirmationModal from "./ui/ConfirmationModal";
import SectionHeader from "./ui/SectionHeader";
import SearchFilterBar from "./ui/SearchFilterBar";

// Action Components
import ActionCard from "./actions/ActionCard";
import ActionForm from "./actions/ActionForm";
import CommonActionsGrid from "./actions/CommonActionsGrid";

// Types
import { AbilityScores, Action, ActionType, Resource } from "../types/character";

interface ActionsSectionProps {
    actions: Action[];
    onUpdate: (actions: Action[]) => void;
    abilityScores: AbilityScores;
    proficiencyBonus: number;
    totalLevel: number;
    rollDice?: (sides: number, modifier?: number, label?: string) => void;
    rollDamage?: (damageString: string, label?: string, damageType?: string) => void;
    resources?: Resource[];
    onUpdateResources?: (resources: Resource[]) => void;
}

const ACTION_TYPES: ActionType[] = ["Attack", "Action", "Bonus Action", "Reaction", "Free Action"];

const ActionsSection: React.FC<ActionsSectionProps> = ({
    actions = [],
    onUpdate,
    abilityScores,
    proficiencyBonus,
    totalLevel,
    rollDice,
    rollDamage,
    resources = [],
    onUpdateResources
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingAction, setEditingAction] = useState<Partial<Action> | null>(null);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [castLevels, setCastLevels] = useState<Record<string, number>>({});
    const [actionToDelete, setActionToDelete] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState("All");

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedIds(newExpanded);
    };

    const handleActionsUpdate = (allActions: Action[]) => {
        onUpdate(allActions);
    };

    const handleSave = (processedData: Partial<Action>) => {
        if (editingAction && editingAction.id) {
            // Edit existing
            const updatedActions = actions.map((a) =>
                a.id === editingAction.id ? { ...a, ...processedData } as Action : a
            );
            handleActionsUpdate(updatedActions);
        } else {
            // Add new
            const newAction: Action = {
                id: Date.now().toString(),
                name: processedData.name || "New Action",
                type: processedData.type as ActionType || "Action",
                description: processedData.description || "",
                activation: processedData.activation,
                range: processedData.range,
                target: processedData.target,
                reach: processedData.reach,
                damage: processedData.damage,
                damageType: processedData.damageType,
                versatileDamage: processedData.versatileDamage,
                ability: processedData.ability,
                proficient: processedData.proficient,
                attackAbility: processedData.attackAbility,
                attackBonus: processedData.attackBonus,
                damageDice: processedData.damageDice,
                damageAbility: processedData.damageAbility,
                damageBonus: processedData.damageBonus,
                versatileDice: processedData.versatileDice,
                resourceName: processedData.resourceName,
                ...processedData
            } as Action;
            handleActionsUpdate([...actions, newAction]);
        }
        setIsAdding(false);
        setEditingAction(null);
    };

    const handleDelete = (id: string) => {
        handleActionsUpdate(actions.filter((a) => a.id !== id));
    };

    const startEdit = (action: Action) => {
        setEditingAction(action);
        setIsAdding(false);
    };

    const handleUpdateResourceValue = (id: string, newValue: number) => {
        if (!onUpdateResources) return;
        const newResources = resources.map(r => r.id === id ? { ...r, value: newValue } : r);
        onUpdateResources(newResources);
    };

    const standardActions = actions.filter(a => a.id.startsWith("std-"));
    const otherActions = actions.filter(a => !a.id.startsWith("std-"));

    const filteredActions = otherActions.filter(action => {
        const matchesSearch = action.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             action.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === "All" || action.type === selectedType;
        return matchesSearch && matchesType;
    });

    const groupedActions = ACTION_TYPES.reduce((acc, type) => {
        acc[type] = filteredActions.filter(a => a.type === type);
        return acc;
    }, {} as Record<ActionType, Action[]>);

    return (
        <div className="space-y-6">
            <SectionHeader 
                title="Actions & Attacks" 
                buttonLabel="Add Action" 
                onAdd={() => { setIsAdding(true); setEditingAction(null); }} 
                isAdding={isAdding || !!editingAction} 
            />

            <SearchFilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search actions..."
                filterValue={selectedType}
                onFilterChange={setSelectedType}
                filterOptions={[
                    { label: "All Types", value: "All" },
                    ...ACTION_TYPES.map(type => ({ label: type, value: type }))
                ]}
            />

            {(isAdding || editingAction) && (
                <ActionForm
                    initialData={editingAction || undefined}
                    isEditing={!!editingAction}
                    resources={resources}
                    abilityScores={abilityScores}
                    proficiencyBonus={proficiencyBonus}
                    onSave={handleSave}
                    onCancel={() => { setIsAdding(false); setEditingAction(null); }}
                />
            )}

            {/* Common Actions Grid */}
            {standardActions.length > 0 && (
                <div className="space-y-2">
                    <CommonActionsGrid
                        actions={standardActions}
                        expandedIds={expandedIds}
                        toggleExpand={toggleExpand}
                    />
                </div>
            )}

            <div className="space-y-8">
                {ACTION_TYPES.map(type => (
                    groupedActions[type].length > 0 && (
                        <div key={type} className="space-y-4">
                            <h3 className="text-lg font-bold border-b pb-1 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${type === "Attack" ? "bg-red-500" :
                                    type === "Action" ? "bg-blue-500" :
                                        type === "Bonus Action" ? "bg-orange-500" :
                                            type === "Reaction" ? "bg-purple-500" :
                                                "bg-gray-500"
                                    }`} />
                                {type}s
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                {groupedActions[type].map(action => {
                                    const resource = resources.find(r => r.id === action.resourceId) || 
                                                     resources.find(r => r.name.toLowerCase() === action.resourceName?.toLowerCase());
                                    
                                    return (
                                        <ActionCard
                                            key={action.id}
                                            action={action}
                                            abilityScores={abilityScores}
                                            proficiencyBonus={proficiencyBonus}
                                            totalLevel={totalLevel}
                                            isExpanded={expandedIds.has(action.id)}
                                            onToggleExpand={() => toggleExpand(action.id)}
                                            onEdit={!action.fromFeature ? () => startEdit(action) : undefined}
                                            onDelete={!action.fromWeapon && !action.fromFeature ? () => setActionToDelete(action.id) : undefined}
                                            rollDice={rollDice}
                                            rollDamage={rollDamage}
                                            resource={resource}
                                            onUpdateResourceValue={onUpdateResources ? handleUpdateResourceValue : undefined}
                                            currentCastLevel={castLevels[action.id] || action.baseLevel || 0}
                                            onCastLevelChange={(level) => setCastLevels(prev => ({ ...prev, [action.id]: level }))}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )
                ))}

                {actions.length === 0 && !isAdding && (
                    <Card className="border-dashed">
                        <CardContent className="p-12 text-center text-gray-500 italic">
                            No actions added yet. Click "+ Add Action" to begin.
                        </CardContent>
                    </Card>
                )}
            </div>

            <ConfirmationModal
                isOpen={actionToDelete !== null}
                onClose={() => setActionToDelete(null)}
                onConfirm={() => {
                    if (actionToDelete) {
                        handleDelete(actionToDelete);
                        setActionToDelete(null);
                    }
                }}
                title="Delete Action"
                message={`Are you sure you want to delete "${actions.find(a => a.id === actionToDelete)?.name}"? This action cannot be undone.`}
                confirmText="Delete"
            />
        </div>
    );
};

export default ActionsSection;
