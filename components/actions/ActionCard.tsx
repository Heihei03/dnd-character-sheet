import React from "react";
import { ChevronDown, Dices, Pencil, Trash2, Zap } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import ResourcePipTracker from "../ResourcePipTracker";
import { Action, AbilityScores, Resource, CritRule, Character, RollDiceFunc, RollDamageFunc } from "../../types/character";
import {
    getAbilityModifier,
    resolveRollExpression,
    getAdvantageDisadvantage,
} from "../../utils/character-utils";
import {
    calculateScaledCantripValue,
    calculateUpcastedValue,
} from "../../utils/dice-utils";

interface ActionCardProps {
    action: Action;
    abilityScores: AbilityScores;
    proficiencyBonus: number;
    totalLevel: number;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    rollDice?: RollDiceFunc;
    rollDamage?: RollDamageFunc;
    resource?: Resource;
    onUpdateResourceValue?: (id: string, value: number) => void;
    currentCastLevel: number;
    onCastLevelChange: (level: number) => void;
    character: Character;
}

const ActionCard: React.FC<ActionCardProps> = ({
    action,
    abilityScores,
    proficiencyBonus,
    totalLevel,
    isExpanded,
    onToggleExpand,
    onEdit,
    onDelete,
    rollDice,
    rollDamage,
    resource,
    onUpdateResourceValue,
    currentCastLevel,
    onCastLevelChange,
    character,
}) => {
    const damageToUse = action.damage || "";
    const upcastedDamage =
        action.baseLevel === 0 && action.scalesWithCharacterLevel
            ? calculateScaledCantripValue(damageToUse, totalLevel)
            : action.baseLevel !== undefined
            ? calculateUpcastedValue(
                  damageToUse,
                  action.higherLevelDamage || "",
                  currentCastLevel,
                  action.baseLevel
              )
            : action.damage;

    const upcastedHealing =
        action.higherLevelHealing && action.baseLevel !== undefined
            ? calculateUpcastedValue(
                  action.healing || "",
                  action.higherLevelHealing,
                  currentCastLevel,
                  action.baseLevel
              )
            : action.healing;

    const handleAttackRoll = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (rollDice) {
            const atkAbilityMod = getAbilityModifier(
                abilityScores[(action.attackAbility as keyof AbilityScores)] || 10
            );
            const total =
                (action.proficient ? proficiencyBonus : 0) +
                atkAbilityMod +
                (action.attackBonus || 0);

            const expr = upcastedDamage || upcastedHealing || "";
            const resolvedDamage = resolveRollExpression(
                expr,
                abilityScores,
                totalLevel,
                proficiencyBonus
            );

            const { advantage, disadvantage, extraAdvantage } = getAdvantageDisadvantage(character, `${action.name} Attack`, action.attackAbility as string);

            rollDice(20, total, `${action.name} Attack`, resolvedDamage, action.damageType, action.critRange, action.critExtraDamage, action.critRule, advantage, disadvantage, extraAdvantage);
        }
    };

    const handleDamageRoll = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (rollDamage) {
            const expr = upcastedDamage || upcastedHealing || "";
            const resolved = resolveRollExpression(
                expr,
                abilityScores,
                totalLevel,
                proficiencyBonus
            );
            rollDamage(resolved, action.name, action.damageType);
        }
    };

    return (
        <Card className="overflow-hidden group hover:border-blue-400 transition-colors">
            <CardContent className="p-0">
                <div
                    className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    onClick={onToggleExpand}
                >
                    <div className="flex items-center gap-4 flex-1">
                        <div className="min-w-[140px] flex items-center gap-2">
                            <h4 className="font-bold">{action.name}</h4>
                            {action.isAttack && (
                                <span className="text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-red-100 dark:border-red-800/50">
                                    Attack
                                </span>
                            )}
                            {action.isAttack && (
                                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-mono font-bold">
                                    <button
                                        type="button"
                                        onClick={handleAttackRoll}
                                        title="Roll Attack"
                                        className="hover:underline flex items-center gap-1.5"
                                    >
                                        <Dices className="w-3.5 h-3.5 opacity-70" />
                                        {(() => {
                                            const atkAbilityMod = getAbilityModifier(
                                                abilityScores[
                                                    (action.attackAbility as keyof AbilityScores)
                                                ] || 10
                                            );
                                            const total =
                                                (action.proficient
                                                    ? proficiencyBonus
                                                    : 0) +
                                                atkAbilityMod +
                                                (action.attackBonus || 0);
                                            return `${total >= 0 ? "+" : ""}${total}`;
                                        })()}
                                    </button>
                                </span>
                            )}
                        </div>

                        {/* Resource Tracker in collapsed view - MOVED HERE to be always visible */}
                        {!isExpanded && resource && onUpdateResourceValue && (
                            <div
                                className="flex-1 max-w-[180px]"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <ResourcePipTracker
                                    resource={resource}
                                    onUpdate={(val) =>
                                        onUpdateResourceValue(resource.id, val)
                                    }
                                    compact
                                />
                            </div>
                        )}
                        {(action.isAttack ||
                            action.baseLevel !== undefined ||
                            upcastedDamage ||
                            upcastedHealing) &&
                            (upcastedDamage ||
                                upcastedHealing ||
                                action.range ||
                                action.activation) && (
                                <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500">
                                    {action.activation && (
                                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                            {action.activation}
                                        </span>
                                    )}
                                    {(upcastedDamage || upcastedHealing) && (
                                        <button
                                            type="button"
                                            onClick={handleDamageRoll}
                                            title="Roll Damage/Effect"
                                            className="font-mono font-bold hover:underline cursor-pointer flex items-center gap-1.5 text-blue-600 dark:text-blue-400"
                                        >
                                            <Dices className="w-3.5 h-3.5" />
                                            {upcastedDamage || upcastedHealing}
                                            {action.versatileDamage
                                                ? ` / ${action.versatileDamage}`
                                                : ""}{" "}
                                            {action.damageType}
                                        </button>
                                    )}
                                    {(action.range || action.reach) && (
                                        <span>
                                            {action.reach}
                                            {action.reach &&
                                                action.range &&
                                                ", "}
                                            {action.range}
                                        </span>
                                    )}

                                    {/* Upcast Selector in collapsed view */}
                                    {action.baseLevel !== undefined &&
                                        action.baseLevel > 0 && (
                                            <div
                                                className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-800"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Zap className="w-2.5 h-2.5 text-blue-500" />
                                                <select
                                                    value={currentCastLevel}
                                                    onChange={(e) =>
                                                        onCastLevelChange(
                                                            parseInt(e.target.value)
                                                        )
                                                    }
                                                    className="bg-transparent text-xs font-bold text-blue-700 dark:text-blue-300 focus:outline-none"
                                                >
                                                    {Array.from(
                                                        {
                                                            length:
                                                                10 -
                                                                action.baseLevel,
                                                        },
                                                        (_, i) =>
                                                            action.baseLevel! + i
                                                    ).map((l) => (
                                                        <option
                                                            key={l}
                                                            value={l}
                                                            className="dark:bg-gray-900"
                                                        >
                                                            Lvl {l}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                </div>
                            )}
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!action.fromFeature && onEdit && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit();
                                }}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                        )}
                        {!action.fromWeapon &&
                            !action.fromFeature &&
                            onDelete && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete();
                                    }}
                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        <ChevronDown
                            className={`w-4 h-4 text-gray-400 transform transition-transform ${
                                isExpanded ? "rotate-180" : ""
                            }`}
                        />
                    </div>
                </div>
                {isExpanded && (
                    <div className="p-4 pt-0 border-t border-gray-100 dark:border-gray-800 space-y-4 bg-gray-50/50 dark:bg-gray-900/50 text-sm animate-in slide-in-from-top-2 duration-200">
                        {(action.isAttack ||
                            action.baseLevel !== undefined) && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3">
                                {action.activation && (
                                    <div>
                                        <div className="text-xs font-bold uppercase text-gray-400">
                                            Activation
                                        </div>
                                        <div className="font-medium">
                                            {action.activation}
                                        </div>
                                    </div>
                                )}
                                {(upcastedDamage || upcastedHealing) && (
                                    <div>
                                        <div className="text-xs font-bold uppercase text-gray-400">
                                            Damage/Effect
                                        </div>
                                        <div className="font-medium">
                                            <button
                                                type="button"
                                                onClick={handleDamageRoll}
                                                title="Roll"
                                                className={`hover:underline cursor-pointer font-bold flex items-center gap-1.5 ${
                                                    currentCastLevel >
                                                    (action.baseLevel || 0)
                                                        ? "text-blue-600 dark:text-blue-400"
                                                        : "text-blue-600 dark:text-blue-400"
                                                }`}
                                            >
                                                <Dices className="w-3.5 h-3.5" />
                                                {upcastedDamage ||
                                                    upcastedHealing}
                                            </button>
                                            {action.versatileDamage
                                                ? ` (${action.versatileDamage} 2-handed)`
                                                : ""}{" "}
                                            {action.damageType}
                                        </div>
                                    </div>
                                )}
                                {(action.range || action.reach) && (
                                    <div>
                                        <div className="text-xs font-bold uppercase text-gray-400">
                                            Range/Reach
                                        </div>
                                        <div className="font-medium">
                                            {action.reach}
                                            {action.reach &&
                                                action.range &&
                                                " / "}
                                            {action.range}
                                        </div>
                                    </div>
                                )}
                                {action.target && (
                                    <div>
                                        <div className="text-xs font-bold uppercase text-gray-400">
                                            Target
                                        </div>
                                        <div className="font-medium">
                                            {action.target}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <div
                            className={`whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300 ${
                                action.isAttack ||
                                action.baseLevel !== undefined
                                    ? ""
                                    : "pt-3"
                            }`}
                        >
                            {action.description}
                        </div>

                        {action.atHigherLevels && (
                            <div className="mt-2 p-2 bg-blue-50/50 dark:bg-blue-900/10 rounded border border-blue-100 dark:border-blue-800/50 italic text-xs text-gray-600 dark:text-gray-400">
                                <strong className="text-blue-700 dark:text-blue-300 text-xs uppercase not-italic font-bold">
                                    At Higher Levels:{" "}
                                </strong>
                                {action.atHigherLevels}
                            </div>
                        )}

                        {resource && onUpdateResourceValue && (
                            <div className="pt-2 animate-in fade-in slide-in-from-bottom-1 duration-300">
                                <div className="max-w-sm">
                                    <ResourcePipTracker
                                        resource={resource}
                                        onUpdate={(val) =>
                                            onUpdateResourceValue(resource.id, val)
                                        }
                                        compact
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ActionCard;
