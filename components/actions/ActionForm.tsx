import React, { useState, useEffect, useRef } from "react";
import EntityForm from "../ui/EntityForm";
import { Action, ActionType, AbilityScores, Resource, CritRule } from "../../types/character";
import { DAMAGE_TYPES, ACTION_TARGETS } from "../../utils/constants";
import { getAbilityModifier, ABILITY_NAMES } from "../../utils/character-utils";
import ThemedAutocomplete from "../ui/ThemedAutocomplete";
import Select from "../ui/Select";
import NumericInput from "../ui/NumericInput";

const ACTION_TYPE_OPTIONS = [
    { label: "Action", value: "Action" },
    { label: "Bonus Action", value: "Bonus Action" },
    { label: "Reaction", value: "Reaction" },
    { label: "Free Action", value: "Free Action" },
];

const ABILITY_OPTIONS = [
    { label: "None", value: "" },
    ...ABILITY_NAMES.map(a => ({ label: a.charAt(0).toUpperCase() + a.slice(1), value: a }))
];

const CRIT_RULE_OPTIONS = [
    { label: "Global Default", value: "" },
    { label: "Double Dice", value: "double-dice" },
    { label: "Max Roll", value: "max-plus-roll" },
    { label: "Double Total", value: "double-total" },
];

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
    const containerRef = useRef<HTMLDivElement>(null);
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
        if (containerRef.current) {
            containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
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
        <div ref={containerRef} className="scroll-mt-24">
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
                            className="w-full p-2 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none font-medium text-foreground"
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
                                    className="w-4 h-4 cursor-pointer accent-primary"
                                />
                                <label htmlFor="isAttack" className="cursor-pointer">is attack?</label>
                            </div>
                        </label>
                        <Select
                            value={formData.type || "Action"}
                            onValueChange={(val) =>
                                setFormData({
                                    ...formData,
                                    type: val as ActionType,
                                })
                            }
                            options={ACTION_TYPE_OPTIONS}
                        />
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
                                    className="w-4 h-4 cursor-pointer accent-primary"
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
                                <Select
                                    value={(formData.attackAbility as string) || ""}
                                    onValueChange={(val) =>
                                        setFormData({
                                            ...formData,
                                            attackAbility:
                                                (val as keyof AbilityScores) ||
                                                undefined,
                                        })
                                    }
                                    options={ABILITY_OPTIONS}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-500">
                                    Attack Bonus
                                </label>
                                 <NumericInput
                                    value={formData.attackBonus ?? 0}
                                    onChange={(val) =>
                                        setFormData({
                                            ...formData,
                                            attackBonus: val,
                                        })
                                    }
                                    variant="horizontal"
                                    className="w-full"
                                    inputClassName="text-foreground p-2"
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-500">
                                    Damage Type
                                </label>
                                <ThemedAutocomplete
                                    value={formData.damageType || ""}
                                    onValueChange={(val) =>
                                        setFormData({
                                            ...formData,
                                            damageType: val,
                                        })
                                    }
                                    options={Array.from(DAMAGE_TYPES)}
                                    placeholder="Damage type..."
                                />
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
                                    className="w-full p-2 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none text-foreground"
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
                                    className="w-full p-2 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none text-foreground"
                                    placeholder="1d10"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-500">
                                    Damage Ability
                                </label>
                                <Select
                                    value={(formData.damageAbility as string) || ""}
                                    onValueChange={(val) =>
                                        setFormData({
                                            ...formData,
                                            damageAbility:
                                                (val as keyof AbilityScores) ||
                                                undefined,
                                        })
                                    }
                                    options={ABILITY_OPTIONS}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-500">
                                    Damage Bonus
                                </label>
                                 <NumericInput
                                    value={formData.damageBonus ?? 0}
                                    onChange={(val) =>
                                        setFormData({
                                            ...formData,
                                            damageBonus: val,
                                        })
                                    }
                                    variant="horizontal"
                                    className="w-full"
                                    inputClassName="text-foreground p-2"
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
                                    className="w-full p-2 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none text-foreground"
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
                                    className="w-full p-2 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none text-foreground"
                                    placeholder="20/60 ft"
                                />
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
                                    className="w-full p-2 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none text-foreground"
                                    placeholder="1 Action..."
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-500">
                                    Target
                                </label>
                                <ThemedAutocomplete
                                    value={formData.target || ""}
                                    onValueChange={(val: string) =>
                                        setFormData({
                                            ...formData,
                                            target: val,
                                        })
                                    }
                                    options={ACTION_TARGETS}
                                    placeholder="One creature..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-500">
                                    Resource Name
                                </label>
                                <ThemedAutocomplete
                                    value={formData.resourceName || ""}
                                    onValueChange={(val: string) =>
                                        setFormData({
                                            ...formData,
                                            resourceName: val,
                                        })
                                    }
                                    options={resources?.map((r) => r.name) || []}
                                    placeholder="e.g. Ki Points"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-500">
                                    Crit Range Override
                                </label>
                                <NumericInput
                                    value={formData.critRange || 20}
                                    onChange={(val) =>
                                        setFormData({
                                            ...formData,
                                            critRange: val,
                                        })
                                    }
                                    variant="horizontal"
                                    className="w-full"
                                    inputClassName="text-foreground p-2"
                                    placeholder="20"
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
                                    className="w-full p-2 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none text-foreground"
                                    placeholder="e.g. 1d8"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-500">
                                    Crit Rule Override
                                </label>
                                <Select
                                    value={formData.critRule || ""}
                                    onValueChange={(val) =>
                                        setFormData({
                                            ...formData,
                                            critRule: (val as CritRule) || undefined,
                                        })
                                    }
                                    options={CRIT_RULE_OPTIONS}
                                />
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
                        className="w-full p-2 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none h-24 text-foreground"
                        placeholder="Describe the action..."
                    />
                </div>
            </EntityForm>
        </div>
    );
};

export default ActionForm;
