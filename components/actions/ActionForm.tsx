import React, { useState, useEffect } from "react";
import EntityForm from "../ui/EntityForm";
import { Action, ActionType, AbilityScores, Resource, CritRule } from "../../types/character";
import { DAMAGE_TYPES } from "../../utils/constants";
import { getAbilityModifier } from "../../utils/character-utils";

interface ActionFormProps {
    initialData?: Partial<Action>;
    isEditing: boolean;
    resources: Resource[];
    abilityScores: AbilityScores;
    proficiencyBonus: number;
    onSave: (data: Partial<Action>) => void;
    onCancel: () => void;
}

const ACTION_TYPES: ActionType[] = [
    "Action",
    "Bonus Action",
    "Reaction",
    "Free Action",
];

const ActionForm: React.FC<ActionFormProps> = ({
    initialData,
    isEditing,
    resources,
    abilityScores,
    proficiencyBonus,
    onSave,
    onCancel,
}) => {
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
        resourceName: "",
        ...initialData,
    });

    useEffect(() => {
        if (initialData) {
            setFormData({ ...formData, ...initialData });
        }
    }, [initialData]);

    const calculateFinalStrings = (data: Partial<Action>): Partial<Action> => {
        if (!data.isAttack) return data;

        const attackAbilityMod = getAbilityModifier(
            abilityScores[(data.attackAbility as keyof AbilityScores)] || 10
        );
        const damageAbilityMod = data.damageAbility
            ? getAbilityModifier(
                  abilityScores[(data.damageAbility as keyof AbilityScores)] || 10
              )
            : 0;

        const totalAttackBonus =
            (data.proficient ? proficiencyBonus : 0) +
            attackAbilityMod +
            (data.attackBonus || 0);

        const finalDamageBonus = damageAbilityMod + (data.damageBonus || 0);
        const damageString = data.damageDice
            ? `${data.damageDice}${
                  finalDamageBonus >= 0 ? "+" : ""
              }${finalDamageBonus}`
            : "";
        const versatileString = data.versatileDice
            ? `${data.versatileDice}${
                  finalDamageBonus >= 0 ? "+" : ""
              }${finalDamageBonus}`
            : "";

        return {
            ...data,
            damage: damageString,
            versatileDamage: versatileString,
            ability: data.attackAbility, // Backwards compatibility
        };
    };

    const handleSave = () => {
        const processedData = calculateFinalStrings(formData);
        onSave(processedData);
    };

    return (
        <EntityForm
            title={isEditing ? "Edit Action" : "New Action"}
            onSave={handleSave}
            onCancel={onCancel}
            saveLabel={isEditing ? "Save Changes" : "Create Action"}
            isEditing={isEditing}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-gray-500">
                        Name
                    </label>
                    <input
                        type="text"
                        value={formData.name || ""}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700 font-medium"
                        placeholder="Action name..."
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-gray-500 flex justify-between items-center">
                        Type
                        <div className="flex items-center gap-1.5 lowercase font-normal normal-case">
                            <input
                                type="checkbox"
                                id="isAttack"
                                checked={!!formData.isAttack}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        isAttack: e.target.checked
                                    })
                                }
                                className="w-4 h-4"
                            />
                            <label htmlFor="isAttack" className="cursor-pointer">is attack?</label>
                        </div>
                    </label>
                    <select
                        value={formData.type || "Action"}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                type: e.target.value as ActionType,
                            })
                        }
                        className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700 font-medium"
                    >
                        {ACTION_TYPES.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {formData.isAttack && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="flex items-center gap-2 pt-6">
                            <input
                                type="checkbox"
                                id="proficient"
                                checked={!!formData.proficient}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        proficient: e.target.checked,
                                    })
                                }
                                className="w-4 h-4"
                            />
                            <label
                                htmlFor="proficient"
                                className="text-xs font-bold uppercase text-gray-500 cursor-pointer"
                            >
                                Proficient
                            </label>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-500">
                                Attack Ability
                            </label>
                            <select
                                value={formData.attackAbility || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        attackAbility:
                                            (e.target.value as keyof AbilityScores) ||
                                            undefined,
                                    })
                                }
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
                            <label className="text-xs font-bold uppercase text-gray-500">
                                Attack Bonus
                            </label>
                            <input
                                type="number"
                                value={formData.attackBonus ?? 0}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        attackBonus:
                                            parseInt(e.target.value) || 0,
                                    })
                                }
                                className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-500">
                                Damage Type
                            </label>
                            <select
                                value={formData.damageType || "Slashing"}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        damageType: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                            >
                                {DAMAGE_TYPES.map((dt) => (
                                    <option key={dt} value={dt}>
                                        {dt}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-500">
                                Damage Dice
                            </label>
                            <input
                                type="text"
                                value={formData.damageDice || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        damageDice: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                placeholder="1d8"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-500">
                                Versatile Dice
                            </label>
                            <input
                                type="text"
                                value={formData.versatileDice || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        versatileDice: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                placeholder="1d10"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-500">
                                Damage Ability
                            </label>
                            <select
                                value={formData.damageAbility || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        damageAbility:
                                            (e.target.value as keyof AbilityScores) ||
                                            undefined,
                                    })
                                }
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
                            <label className="text-xs font-bold uppercase text-gray-500">
                                Damage Bonus
                            </label>
                            <input
                                type="number"
                                value={formData.damageBonus ?? 0}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        damageBonus:
                                            parseInt(e.target.value) || 0,
                                    })
                                }
                                className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-500">
                                Reach
                            </label>
                            <input
                                type="text"
                                value={formData.reach || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        reach: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                placeholder="5 ft"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-500">
                                Range
                            </label>
                            <input
                                type="text"
                                value={formData.range || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        range: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                placeholder="20/60 ft"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-500">
                                Crit Range Override
                            </label>
                            <input
                                type="number"
                                value={formData.critRange || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        critRange: e.target.value === "" ? undefined : parseInt(e.target.value),
                                    })
                                }
                                min={1}
                                max={20}
                                className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                placeholder="Global Default"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-500">
                                Crit Extra Damage
                            </label>
                            <input
                                type="text"
                                value={formData.critExtraDamage || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        critExtraDamage: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                placeholder="e.g. 1d8"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-500">
                                Crit Rule Override
                            </label>
                            <select
                                value={formData.critRule || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        critRule: (e.target.value as CritRule) || undefined,
                                    })
                                }
                                className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                            >
                                <option value="">Global Default</option>
                                <option value="double-dice">Double Dice</option>
                                <option value="max-plus-roll">Max Roll</option>
                                <option value="double-total">Double Total</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-500">
                                Activation
                            </label>
                            <input
                                type="text"
                                value={formData.activation || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        activation: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                placeholder="1 Action..."
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-500">
                                Target
                            </label>
                            <input
                                type="text"
                                value={formData.target || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        target: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                                placeholder="One creature..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-500">
                                Resource Name
                            </label>
                            <input
                                type="text"
                                list="resource-suggestions"
                                value={formData.resourceName || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        resourceName: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700 font-medium"
                                placeholder="e.g. Ki Points"
                            />
                            <datalist id="resource-suggestions">
                                {resources?.map((r) => (
                                    <option key={r.id} value={r.name} />
                                ))}
                            </datalist>
                        </div>
                    </div>
                </>
            )}

            <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500">
                    Description
                </label>
                <textarea
                    value={formData.description || ""}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            description: e.target.value,
                        })
                    }
                    className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700 h-24"
                    placeholder="Describe the action..."
                />
            </div>
        </EntityForm>
    );
};

export default ActionForm;
