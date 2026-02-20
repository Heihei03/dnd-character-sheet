"use client";

import React, { useState } from "react";
import { Action, ActionType, AbilityScores } from "../types/character";
import { Card, CardContent } from "./ui/card";
import Button from "./ui/button";
import { DAMAGE_TYPES } from "../utils/constants";
import { getAbilityModifier } from "../utils/character-utils";

interface ActionsSectionProps {
    actions: Action[];
    onUpdate: (actions: Action[]) => void;
    abilityScores: AbilityScores;
    proficiencyBonus: number;
}

const ACTION_TYPES: ActionType[] = ["Attack", "Action", "Bonus Action", "Reaction", "Free Action"];

const ActionsSection: React.FC<ActionsSectionProps> = ({ actions = [], onUpdate, abilityScores, proficiencyBonus }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

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

    const groupedActions = ACTION_TYPES.reduce((acc, type) => {
        acc[type] = actions.filter(a => a.type === type);
        return acc;
    }, {} as Record<ActionType, Action[]>);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Actions & Attacks</h2>
                <Button onClick={() => { setIsAdding(true); setEditingId(null); resetForm(); }}>
                    + Add Action
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
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700 font-medium"
                                    placeholder="Action name..."
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-500">Type</label>
                                <select
                                    value={formData.type}
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
                                            checked={formData.proficient}
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
                                            value={formData.attackBonus}
                                            onChange={(e) => setFormData({ ...formData, attackBonus: parseInt(e.target.value) || 0 })}
                                            className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Damage Type</label>
                                        <select
                                            value={formData.damageType}
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
                                            value={formData.damageDice}
                                            onChange={(e) => setFormData({ ...formData, damageDice: e.target.value })}
                                            className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                            placeholder="1d8"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Versatile Dice</label>
                                        <input
                                            type="text"
                                            value={formData.versatileDice}
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
                                            value={formData.damageBonus}
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
                                            value={formData.reach}
                                            onChange={(e) => setFormData({ ...formData, reach: e.target.value })}
                                            className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                            placeholder="5 ft"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Range</label>
                                        <input
                                            type="text"
                                            value={formData.range}
                                            onChange={(e) => setFormData({ ...formData, range: e.target.value })}
                                            className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                            placeholder="20/60 ft"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Activation</label>
                                        <input
                                            type="text"
                                            value={formData.activation}
                                            onChange={(e) => setFormData({ ...formData, activation: e.target.value })}
                                            className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                            placeholder="1 Action..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Target</label>
                                        <input
                                            type="text"
                                            value={formData.target}
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
                                value={formData.description}
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
                                {groupedActions[type].map(action => (
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
                                                                    return `${total >= 0 ? "+" : ""}${total}`;
                                                                })()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {(action.type === "Attack") && (action.damage || action.range || action.activation) && (
                                                        <div className="hidden sm:flex gap-3 text-xs text-gray-500">
                                                            {action.activation && <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{action.activation}</span>}
                                                            {action.damage && (
                                                                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                                                                    {action.damage}{action.versatileDamage ? ` / ${action.versatileDamage}` : ""} {action.damageType}
                                                                </span>
                                                            )}
                                                            {(action.range || action.reach) && (
                                                                <span>
                                                                    {action.reach}
                                                                    {action.reach && action.range && ", "}
                                                                    {action.range}
                                                                </span>
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
                                                            ✎
                                                        </button>
                                                    )}
                                                    {!action.fromWeapon && !action.fromFeature && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(action.id); }}
                                                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                    <div className={`transform transition-transform ${expandedIds.has(action.id) ? "rotate-180" : ""}`}>
                                                        ▼
                                                    </div>
                                                </div>
                                            </div>
                                            {expandedIds.has(action.id) && (
                                                <div className="p-4 pt-0 border-t border-gray-100 dark:border-gray-800 space-y-4 bg-gray-50/50 dark:bg-gray-900/50 text-sm animate-in slide-in-from-top-2 duration-200">
                                                    {action.type === "Attack" && (
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3">
                                                            {action.activation && (
                                                                <div>
                                                                    <div className="text-[10px] font-bold uppercase text-gray-400">Activation</div>
                                                                    <div className="font-medium">{action.activation}</div>
                                                                </div>
                                                            )}
                                                            {action.damage && (
                                                                <div>
                                                                    <div className="text-[10px] font-bold uppercase text-gray-400">Damage</div>
                                                                    <div className="font-medium">
                                                                        {action.damage}{action.versatileDamage ? ` (${action.versatileDamage} 2-handed)` : ""} {action.damageType}
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
                                                    <div className={`whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300 ${action.type === "Attack" ? "" : "pt-3"}`}>
                                                        {action.description}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
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
        </div>
    );
};

export default ActionsSection;
