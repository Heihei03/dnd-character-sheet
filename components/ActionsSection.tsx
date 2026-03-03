"use client";

import React, { useState } from "react";
import { Action, ActionType, AbilityScores } from "../types/character";
import { Card, CardContent } from "./ui/card";
import Button from "./ui/button";
import { Pencil, Trash2, ChevronDown, Plus, Zap } from "lucide-react";
import { DAMAGE_TYPES } from "../utils/constants";
import { getAbilityModifier } from "../utils/character-utils";
import { calculateUpcastedValue, calculateScaledCantripValue } from "../utils/dice-utils";
import ResourcePipTracker from "./ResourcePipTracker";
import { Resource } from "../types/character";
import ConfirmationModal from "./ui/ConfirmationModal";

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
    const [editingId, setEditingId] = useState<string | null>(null);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [castLevels, setCastLevels] = useState<Record<string, number>>({});
    const [actionToDelete, setActionToDelete] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<Action>>({
        name: "",
        type: "Action",
        description: "",
        activation: "",
        range: "",
        target: "",
        reach: "",
        damage: "",
        damageType: "Slashing",
        versatileDamage: "",
        ability: undefined,
        proficient: true,
        attackAbility: "strength",
        attackBonus: 0,
        damageDice: "",
        damageAbility: "strength",
        damageBonus: 0,
        versatileDice: "",
    });

    // Moved to utils/dice-utils.ts

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedIds(newExpanded);
    };

    const calculateFinalStrings = (data: Partial<Action>): Partial<Action> => {
        if (data.type !== "Attack") return data;

        const attackAbilityMod = getAbilityModifier(abilityScores[data.attackAbility as keyof AbilityScores] || 10);
        const damageAbilityMod = data.damageAbility ? getAbilityModifier(abilityScores[data.damageAbility as keyof AbilityScores] || 10) : 0;

        const totalAttackBonus = (data.proficient ? proficiencyBonus : 0) + attackAbilityMod + (data.attackBonus || 0);
        const attackString = `${totalAttackBonus >= 0 ? "+" : ""}${totalAttackBonus}`;

        const finalDamageBonus = damageAbilityMod + (data.damageBonus || 0);
        const damageString = data.damageDice ? `${data.damageDice}${finalDamageBonus >= 0 ? "+" : ""}${finalDamageBonus}` : "";
        const versatileString = data.versatileDice ? `${data.versatileDice}${finalDamageBonus >= 0 ? "+" : ""}${finalDamageBonus}` : "";

        return {
            ...data,
            damage: damageString,
            versatileDamage: versatileString,
            ability: data.attackAbility, // Backwards compatibility
        };
    };

    const handleActionsUpdate = (allActions: Action[]) => {
        onUpdate(allActions);
    };

    const handleAdd = () => {
        const processedData = calculateFinalStrings(formData);
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
        };
        handleActionsUpdate([...actions, newAction]);
        setIsAdding(false);
        resetForm();
    };

    const handleSaveEdit = () => {
        if (!editingId) return;
        const processedData = calculateFinalStrings(formData);
        const updatedActions = actions.map((a) =>
            a.id === editingId ? { ...a, ...processedData } as Action : a
        );
        handleActionsUpdate(updatedActions);
        setEditingId(null);
        resetForm();
    };

    const handleDelete = (id: string) => {
        handleActionsUpdate(actions.filter((a) => a.id !== id));
    };

    const startEdit = (action: Action) => {
        setFormData(action);
        setEditingId(action.id);
        setIsAdding(false);
    };

    const handleUpdateResourceValue = (id: string, newValue: number) => {
        if (!onUpdateResources) return;
        const newResources = resources.map(r => r.id === id ? { ...r, value: newValue } : r);
        onUpdateResources(newResources);
    };

    const resetForm = () => {
        setFormData({
            name: "",
            type: "Action",
            description: "",
            activation: "",
            range: "",
            target: "",
            reach: "",
            damage: "",
            damageType: "Slashing",
            versatileDamage: "",
            ability: undefined,
            proficient: true,
            attackAbility: "strength",
            attackBonus: 0,
            damageDice: "",
            damageAbility: "strength",
            damageBonus: 0,
            versatileDice: "",
        });
    };

    const standardActions = actions.filter(a => a.id.startsWith("std-"));
    const otherActions = actions.filter(a => !a.id.startsWith("std-"));

    const groupedActions = ACTION_TYPES.reduce((acc, type) => {
        acc[type] = otherActions.filter(a => a.type === type);
        return acc;
    }, {} as Record<ActionType, Action[]>);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Actions & Attacks</h2>
                <Button onClick={() => { setIsAdding(true); setEditingId(null); resetForm(); }} className="flex items-center gap-2 whitespace-nowrap">
                    <Plus className="w-4 h-4" /> Add Action
                </Button>
            </div>

            {(isAdding || editingId) && (
                <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-900/10 dark:border-blue-800">
                    <CardContent className="p-6 space-y-4">
                        <h3 className="font-bold text-lg">{editingId ? "Edit Action" : "New Action"}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-500">Name</label>
                                <input
                                    type="text"
                                    value={formData.name || ""}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700 font-medium"
                                    placeholder="Action name..."
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-500">Type</label>
                                <select
                                    value={formData.type || "Action"}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ActionType })}
                                    className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                >
                                    {ACTION_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                        </div>

                        {formData.type === "Attack" && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <div className="flex items-center gap-2 pt-6">
                                        <input
                                            type="checkbox"
                                            id="proficient"
                                            checked={!!formData.proficient}
                                            onChange={(e) => setFormData({ ...formData, proficient: e.target.checked })}
                                            className="w-4 h-4"
                                        />
                                        <label htmlFor="proficient" className="text-xs font-bold uppercase text-gray-500 cursor-pointer">Proficient</label>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Attack Ability</label>
                                        <select
                                            value={formData.attackAbility || ""}
                                            onChange={(e) => setFormData({ ...formData, attackAbility: (e.target.value as keyof AbilityScores) || undefined })}
                                            className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                        >
                                            <option value="">None</option>
                                            <option value="strength">Strength</option>
                                            <option value="dexterity">Dexterity</option>
                                            <option value="constitution">Constitution</option>
                                            <option value="intelligence">Intelligence</option>
                                            <option value="wisdom">Wisdom</option>
                                            <option value="charisma">Charisma</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Attack Bonus</label>
                                        <input
                                            type="number"
                                            value={formData.attackBonus ?? 0}
                                            onChange={(e) => setFormData({ ...formData, attackBonus: parseInt(e.target.value) || 0 })}
                                            className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Damage Type</label>
                                        <select
                                            value={formData.damageType || "Slashing"}
                                            onChange={(e) => setFormData({ ...formData, damageType: e.target.value })}
                                            className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                        >
                                            {DAMAGE_TYPES.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Damage Dice</label>
                                        <input
                                            type="text"
                                            value={formData.damageDice || ""}
                                            onChange={(e) => setFormData({ ...formData, damageDice: e.target.value })}
                                            className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                            placeholder="1d8"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Versatile Dice</label>
                                        <input
                                            type="text"
                                            value={formData.versatileDice || ""}
                                            onChange={(e) => setFormData({ ...formData, versatileDice: e.target.value })}
                                            className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                            placeholder="1d10"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Damage Ability</label>
                                        <select
                                            value={formData.damageAbility || ""}
                                            onChange={(e) => setFormData({ ...formData, damageAbility: (e.target.value as keyof AbilityScores) || undefined })}
                                            className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                        >
                                            <option value="">None</option>
                                            <option value="strength">Strength</option>
                                            <option value="dexterity">Dexterity</option>
                                            <option value="constitution">Constitution</option>
                                            <option value="intelligence">Intelligence</option>
                                            <option value="wisdom">Wisdom</option>
                                            <option value="charisma">Charisma</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Damage Bonus</label>
                                        <input
                                            type="number"
                                            value={formData.damageBonus ?? 0}
                                            onChange={(e) => setFormData({ ...formData, damageBonus: parseInt(e.target.value) || 0 })}
                                            className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Reach</label>
                                        <input
                                            type="text"
                                            value={formData.reach || ""}
                                            onChange={(e) => setFormData({ ...formData, reach: e.target.value })}
                                            className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                            placeholder="5 ft"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Range</label>
                                        <input
                                            type="text"
                                            value={formData.range || ""}
                                            onChange={(e) => setFormData({ ...formData, range: e.target.value })}
                                            className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                            placeholder="20/60 ft"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Activation</label>
                                        <input
                                            type="text"
                                            value={formData.activation || ""}
                                            onChange={(e) => setFormData({ ...formData, activation: e.target.value })}
                                            className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                            placeholder="1 Action..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Target</label>
                                        <input
                                            type="text"
                                            value={formData.target || ""}
                                            onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                                            className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                            placeholder="One creature..."
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-500">Description</label>
                            <textarea
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700 h-24"
                                placeholder="Describe the action..."
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button onClick={() => { setIsAdding(false); setEditingId(null); }}>
                                Cancel
                            </Button>
                            <Button onClick={editingId ? handleSaveEdit : handleAdd}>
                                {editingId ? "Save Changes" : "Create Action"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Common Actions Grid */}
            {standardActions.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-[11px] font-bold uppercase text-gray-400 tracking-wider flex items-center gap-2">
                        Common Actions
                        <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {standardActions.map(action => (
                            <div
                                key={action.id}
                                className={`group p-2 rounded-lg border transition-all cursor-pointer flex flex-col justify-between min-h-[44px]
                                    ${expandedIds.has(action.id)
                                        ? "bg-blue-50 border-blue-200 ring-1 ring-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:ring-0"
                                        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700"
                                    }`}
                                onClick={() => toggleExpand(action.id)}
                            >
                                <div className="flex items-center justify-between gap-1">
                                    <span className="font-bold text-[11px] truncate leading-none">{action.name}</span>
                                    <span className={`text-[8px] px-1 py-0.5 rounded uppercase font-black shrink-0
                                        ${action.type === "Action" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" :
                                            action.type === "Reaction" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" :
                                                "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}
                                    `}>
                                        {action.type === "Action" ? "Act" : action.type === "Reaction" ? "Re" : "•"}
                                    </span>
                                </div>
                                {expandedIds.has(action.id) && (
                                    <div className="mt-2 text-[10px] text-gray-600 dark:text-gray-400 leading-snug border-t border-blue-100 dark:border-blue-900/40 pt-2 animate-in fade-in slide-in-from-top-1">
                                        {action.description}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
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
                                    const currentCastLevel = castLevels[action.id] || action.baseLevel || 0;
                                    const damageToUse = action.damage || "";
                                    const upcastedDamage = action.baseLevel === 0 && action.scalesWithCharacterLevel
                                        ? calculateScaledCantripValue(damageToUse, totalLevel)
                                        : (action.baseLevel !== undefined
                                            ? calculateUpcastedValue(damageToUse, action.higherLevelDamage || "", currentCastLevel, action.baseLevel)
                                            : action.damage);

                                    const upcastedHealing = action.damage === undefined && action.higherLevelHealing && action.baseLevel !== undefined
                                        ? calculateUpcastedValue("", action.higherLevelHealing, currentCastLevel, action.baseLevel)
                                        : undefined;

                                    return (
                                        <Card key={action.id} className="overflow-hidden group hover:border-blue-400 transition-colors">
                                            <CardContent className="p-0">
                                                <div
                                                    className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                                    onClick={() => toggleExpand(action.id)}
                                                >
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <div className="min-w-[140px] flex items-center gap-2">
                                                            <h4 className="font-bold">{action.name}</h4>
                                                            {action.type === "Attack" && (
                                                                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-mono font-bold">
                                                                    {(() => {
                                                                        const atkAbilityMod = getAbilityModifier(abilityScores[action.attackAbility as keyof AbilityScores] || 10);
                                                                        const total = (action.proficient ? proficiencyBonus : 0) + atkAbilityMod + (action.attackBonus || 0);
                                                                        return (
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => { e.stopPropagation(); if (rollDice) rollDice(20, total, `${action.name} Attack`); }}
                                                                                title="Roll Attack"
                                                                                className="hover:underline flex items-center gap-1"
                                                                            >
                                                                                {total >= 0 ? "+" : ""}{total}
                                                                            </button>
                                                                        );
                                                                    })()}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {(action.type === "Attack" || action.baseLevel !== undefined) && (upcastedDamage || action.range || action.activation) && (
                                                            <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500">
                                                                {action.activation && <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{action.activation}</span>}
                                                                {upcastedDamage && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.stopPropagation(); if (rollDamage) rollDamage(upcastedDamage || "", `${action.name} Damage`, action.damageType); }}
                                                                        title="Roll Damage"
                                                                        className={`font-mono font-bold hover:underline cursor-pointer ${currentCastLevel > (action.baseLevel || 0) ? "text-blue-600 dark:text-blue-400" : "text-blue-600 dark:text-blue-400"}`}
                                                                    >
                                                                        {upcastedDamage}{action.versatileDamage ? ` / ${action.versatileDamage}` : ""} {action.damageType}
                                                                    </button>
                                                                )}
                                                                {(action.range || action.reach) && (
                                                                    <span>
                                                                        {action.reach}
                                                                        {action.reach && action.range && ", "}
                                                                        {action.range}
                                                                    </span>
                                                                )}

                                                                {/* Upcast Selector in collapsed view */}
                                                                {action.baseLevel !== undefined && action.baseLevel > 0 && (
                                                                    <div
                                                                        className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-800"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <Zap className="w-2.5 h-2.5 text-blue-500" />
                                                                        <select
                                                                            value={currentCastLevel}
                                                                            onChange={(e) => setCastLevels(prev => ({ ...prev, [action.id]: parseInt(e.target.value) }))}
                                                                            className="bg-transparent text-[10px] font-bold text-blue-700 dark:text-blue-300 focus:outline-none"
                                                                        >
                                                                            {Array.from({ length: 10 - action.baseLevel }, (_, i) => action.baseLevel! + i).map(l => (
                                                                                <option key={l} value={l} className="dark:bg-gray-900">Lvl {l}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {!action.fromFeature && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); startEdit(action); }}
                                                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {!action.fromWeapon && !action.fromFeature && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setActionToDelete(action.id); }}
                                                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <ChevronDown className={`w-4 h-4 text-gray-400 transform transition-transform ${expandedIds.has(action.id) ? "rotate-180" : ""}`} />
                                                    </div>
                                                </div>
                                                {expandedIds.has(action.id) && (
                                                    <div className="p-4 pt-0 border-t border-gray-100 dark:border-gray-800 space-y-4 bg-gray-50/50 dark:bg-gray-900/50 text-sm animate-in slide-in-from-top-2 duration-200">
                                                        {(action.type === "Attack" || action.baseLevel !== undefined) && (
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3">
                                                                {action.activation && (
                                                                    <div>
                                                                        <div className="text-[10px] font-bold uppercase text-gray-400">Activation</div>
                                                                        <div className="font-medium">{action.activation}</div>
                                                                    </div>
                                                                )}
                                                                {(upcastedDamage || upcastedHealing) && (
                                                                    <div>
                                                                        <div className="text-[10px] font-bold uppercase text-gray-400">Damage/Effect</div>
                                                                        <div className="font-medium">
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => { e.stopPropagation(); if (rollDamage) rollDamage(upcastedDamage || upcastedHealing || "", `${action.name} Result`, action.damageType); }}
                                                                                title="Roll"
                                                                                className={`hover:underline cursor-pointer font-bold ${currentCastLevel > (action.baseLevel || 0) ? "text-blue-600 dark:text-blue-400" : "text-blue-600 dark:text-blue-400"}`}
                                                                            >
                                                                                {upcastedDamage || upcastedHealing}
                                                                            </button>
                                                                            {action.versatileDamage ? ` (${action.versatileDamage} 2-handed)` : ""} {action.damageType}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {(action.range || action.reach) && (
                                                                    <div>
                                                                        <div className="text-[10px] font-bold uppercase text-gray-400">Range/Reach</div>
                                                                        <div className="font-medium">
                                                                            {action.reach}
                                                                            {action.reach && action.range && " / "}
                                                                            {action.range}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {action.target && (
                                                                    <div>
                                                                        <div className="text-[10px] font-bold uppercase text-gray-400">Target</div>
                                                                        <div className="font-medium">{action.target}</div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className={`whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300 ${action.type === "Attack" || action.baseLevel !== undefined ? "" : "pt-3"}`}>
                                                            {action.description}
                                                        </div>

                                                        {action.atHigherLevels && (
                                                            <div className="mt-2 p-2 bg-blue-50/50 dark:bg-blue-900/10 rounded border border-blue-100 dark:border-blue-800/50 italic text-xs text-gray-600 dark:text-gray-400">
                                                                <strong className="text-blue-700 dark:text-blue-300 text-[10px] uppercase not-italic font-bold">At Higher Levels: </strong>
                                                                {action.atHigherLevels}
                                                            </div>
                                                        )}

                                                        {action.resourceName && (
                                                            <div className="pt-2 animate-in fade-in slide-in-from-bottom-1 duration-300">
                                                                {(() => {
                                                                    const resource = resources.find(r => r.name === action.resourceName);
                                                                    if (!resource) return null;
                                                                    return (
                                                                        <div className="max-w-sm">
                                                                            <ResourcePipTracker
                                                                                resource={resource}
                                                                                onUpdate={(val) => handleUpdateResourceValue(resource.id, val)}
                                                                                compact
                                                                            />
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
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
