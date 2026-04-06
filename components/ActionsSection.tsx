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
import { Action, Resource, AbilityScores, Character, RollDiceFunc, RollDamageFunc, CritRule, ActionType } from "../types/character";

interface ActionsSectionProps {
    actions: Action[];
    onUpdate: (actions: Action[]) => void;
    abilityScores: AbilityScores;
    proficiencyBonus: number;
    totalLevel: number;
    rollDice?: RollDiceFunc;
    rollDamage?: RollDamageFunc;
    resources?: Resource[];
    onUpdateResources?: (resources: Resource[]) => void;
    critRule?: CritRule;
    onCritRuleChange?: (rule: CritRule) => void;
    critRange?: number;
    onCritRangeChange?: (range: number) => void;
    character: Character;
}

const ACTION_TYPES: ActionType[] = ["Action", "Bonus Action", "Reaction", "Free Action"];

const ActionsSection: React.FC<ActionsSectionProps> = ({
    actions = [],
    onUpdate,
    abilityScores,
    proficiencyBonus,
    totalLevel,
    rollDice,
    rollDamage,
    resources = [],
    onUpdateResources,
    critRule = "double-dice",
    onCritRuleChange,
    critRange = 20,
    onCritRangeChange,
    character
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

    const rollActions = filteredActions.filter(a => a.id.startsWith("roll-mod-"));
    const standardFilteredActions = filteredActions
        .filter(a => !a.id.startsWith("roll-mod-"))
        .map(a => {
            // Runtime migration for legacy Attack types
            if (a.type as string === "Attack") {
                return { ...a, type: "Action" as ActionType, isAttack: true };
            }
            return a;
        });

    const groupedActions = ACTION_TYPES.reduce((acc, type) => {
        acc[type] = standardFilteredActions.filter(a => a.type === type);
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

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 bg-secondary/30 p-5 rounded-xl border border-border shadow-sm">
                <div className="flex-1">
                    <h4 className="text-[11px] font-black uppercase text-primary tracking-[0.2em] mb-1">Global Roll Settings</h4>
                    <p className="text-[11px] text-muted-foreground/70 font-medium">Configure default critical rules for all automated attacks.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-6 items-stretch sm:items-center">
                    <div className="flex flex-col">
                        <label className="text-[11px] font-black uppercase text-muted-foreground mb-1.5 tracking-tighter ml-1">Crit Range</label>
                        <input
                            type="number"
                            value={critRange || 20}
                            onChange={(e) => onCritRangeChange?.(parseInt(e.target.value) || 20)}
                            className="w-20 h-9 bg-background border border-border rounded-lg text-center text-sm font-black focus:ring-1 focus:ring-primary outline-none transition-all shadow-inner"
                            min="1"
                            max="20"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-[11px] font-black uppercase text-muted-foreground mb-1.5 tracking-tighter ml-1">Crit Damage Rule</label>
                        <div className="flex gap-1.5 p-1 bg-background/50 rounded-lg border border-border">
                            {(['double-dice', 'max-plus-roll', 'double-total'] as const).map((rule) => (
                                <button
                                    key={rule}
                                    onClick={() => onCritRuleChange?.(rule)}
                                    className={`text-[11px] font-black uppercase py-2 px-3 rounded-md transition-all whitespace-nowrap tracking-tight ${critRule === rule
                                        ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                                        : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                                        }`}
                                >
                                    {rule.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {isAdding && (
                <ActionForm
                    initialData={undefined}
                    isEditing={false}
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
                                <span className={`w-2.5 h-2.5 rounded-full ${type === "Action" ? "bg-blue-500" :
                                    type === "Bonus Action" ? "bg-orange-500" :
                                        type === "Reaction" ? "bg-purple-500" :
                                            "bg-gray-500"
                                    }`} />
                                {type}s
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                {groupedActions[type].map(action => {
                                    if (editingAction && editingAction.id === action.id) {
                                        return (
                                            <div key={action.id} className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg border-2 border-blue-100 dark:border-blue-900/30 my-1 shadow-inner">
                                                <ActionForm
                                                    initialData={editingAction}
                                                    isEditing={true}
                                                    resources={resources}
                                                    abilityScores={abilityScores}
                                                    proficiencyBonus={proficiencyBonus}
                                                    onSave={handleSave}
                                                    onCancel={() => setEditingAction(null)}
                                                />
                                            </div>
                                        );
                                    }

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
                                            character={character}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )
                ))}

                {rollActions.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold border-b pb-1 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            Rolls
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            {rollActions.map(action => {
                                if (editingAction && editingAction.id === action.id) {
                                    return (
                                        <div key={action.id} className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg border-2 border-blue-100 dark:border-blue-900/30 my-1 shadow-inner">
                                            <ActionForm
                                                initialData={editingAction}
                                                isEditing={true}
                                                resources={resources}
                                                abilityScores={abilityScores}
                                                proficiencyBonus={proficiencyBonus}
                                                onSave={handleSave}
                                                onCancel={() => setEditingAction(null)}
                                            />
                                        </div>
                                    );
                                }

                                return (
                                    <ActionCard
                                        key={action.id}
                                        action={action}
                                        abilityScores={abilityScores}
                                        proficiencyBonus={proficiencyBonus}
                                        totalLevel={totalLevel}
                                        isExpanded={expandedIds.has(action.id)}
                                        onToggleExpand={() => toggleExpand(action.id)}
                                        rollDice={rollDice}
                                        rollDamage={rollDamage}
                                        currentCastLevel={0}
                                        onCastLevelChange={() => { }}
                                        character={character}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {actions.length === 0 && !isAdding && (
                <Card className="border-dashed">
                    <CardContent className="p-12 text-center text-gray-500 italic">
                        No actions added yet. Click "+ Add Action" to begin.
                    </CardContent>
                </Card>
            )}

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
