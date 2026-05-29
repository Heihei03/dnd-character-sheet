import React from "react";
import { ChevronDown, Dices, Pencil, Trash2, Zap } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import ResourcePipTracker from "../ResourcePipTracker";
import Select from "../ui/Select";
import { Action, AbilityScores, Resource, CritRule, Character, RollDiceFunc, RollDamageFunc, ActiveBonus } from "../../types/character";
import {
    getAbilityModifier,
    resolveRollExpression,
    getAdvantageDisadvantage,
    getEffectiveAbilityScores,
    getCharacterSpellcastingAbility,
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
    onUpdateActiveBonuses: (bonuses: ActiveBonus[]) => void;
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
    onUpdateActiveBonuses,
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

    let upcastedHealing =
        action.higherLevelHealing && action.baseLevel !== undefined
            ? calculateUpcastedValue(
                  action.healing || "",
                  action.higherLevelHealing,
                  currentCastLevel,
                  action.baseLevel
              )
            : action.healing;

    if (upcastedHealing && action.addSpellcastingModifier) {
        const ability = action.attackAbility || getCharacterSpellcastingAbility(character);
        const abilityScore = abilityScores[((ability as string)?.toLowerCase() as keyof AbilityScores)] || 10;
        const abilityModifier = getAbilityModifier(abilityScore);
        const combinedFormula = `${upcastedHealing}${abilityModifier >= 0 ? " + " : " - "}${Math.abs(abilityModifier)}`;
        const resolved = resolveRollExpression(combinedFormula, abilityScores, totalLevel, proficiencyBonus);
        upcastedHealing = resolved.replace(/\s*([-+])\s*/g, ' $1 ');
    }

    const handleAttackRoll = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (rollDice) {
            const isProficient = action.useSpellAttack || action.proficient;
            const scoresToUse = action.useSpellAttack ? getEffectiveAbilityScores(character) : abilityScores;
            const charLevel = (character.classes || []).reduce((sum, cls: any) => sum + cls.level, 0);
            const charPB = Math.ceil(charLevel / 4) + 1;
            const pbToUse = action.useSpellAttack ? charPB : proficiencyBonus;

            const attackAbility = action.attackAbility || (action.useSpellAttack ? getCharacterSpellcastingAbility(character) : undefined);
            const atkAbilityMod = getAbilityModifier(
                scoresToUse[((attackAbility as string)?.toLowerCase() as keyof AbilityScores)] || 10
            );
            const total =
                (isProficient ? pbToUse : 0) +
                atkAbilityMod +
                (action.attackBonus || 0);

            const expr = upcastedDamage || upcastedHealing || "";
            const resolvedDamage = resolveRollExpression(
                expr,
                scoresToUse,
                action.useSpellAttack ? charLevel : totalLevel,
                pbToUse
            );

            const { advantage, disadvantage, extraAdvantage } = getAdvantageDisadvantage(character, `${action.name} Attack`, action.attackAbility as string);

            rollDice(20, 1, total, `${action.name} Attack`, resolvedDamage, action.damageType, action.critRange, action.critExtraDamage, action.critRule, advantage, disadvantage, extraAdvantage, 'attack');
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
            const isHealing = !!upcastedHealing && !upcastedDamage;
            rollDamage(resolved, action.name, action.damageType, isHealing ? 'healing' : 'damage');
        }
    };

    return (
        <Card className="group hover:border-primary/50 transition-colors">
            <CardContent className="p-0">
                <div
                    className={`p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-t-lg ${!isExpanded ? "rounded-b-lg" : ""}`}
                    onClick={onToggleExpand}
                >
                    <div className="flex items-center gap-4 flex-1">
                        <div className="min-w-[140px] flex items-center gap-2">
                            <h4 className="font-bold">{action.name}</h4>
                            {action.isAttack && (
                                <span className="text-xs bg-primary/10 dark:bg-primary/20 text-primary px-1.5 py-0.5 rounded font-black uppercase tracking-[0.1em] border border-primary/30">
                                    Attack
                                </span>
                            )}
                            {action.isAttack && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-mono font-bold border border-primary/20 hover:bg-primary/20 transition-all shadow-sm">
                                    <button
                                        type="button"
                                        onClick={handleAttackRoll}
                                        title="Roll Attack"
                                        className="hover:opacity-80 flex items-center gap-1.5 transition-opacity"
                                    >
                                        <Dices className="w-3.5 h-3.5 opacity-70" />
                                        {(() => {
                                            const isProficient = action.useSpellAttack || action.proficient;
                                            const scoresToUse = action.useSpellAttack ? getEffectiveAbilityScores(character) : abilityScores;
                                            const charLevel = (character.classes || []).reduce((sum, cls: any) => sum + cls.level, 0);
                                            const charPB = Math.ceil(charLevel / 4) + 1;
                                            const pbToUse = action.useSpellAttack ? charPB : proficiencyBonus;

                                            const attackAbility = action.attackAbility || (action.useSpellAttack ? getCharacterSpellcastingAbility(character) : undefined);
                                            const atkAbilityMod = getAbilityModifier(
                                                scoresToUse[
                                                    ((attackAbility as string)?.toLowerCase() as keyof AbilityScores)
                                                ] || 10
                                            );
                                            const total =
                                                (isProficient
                                                    ? pbToUse
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
                                        <span className="bg-secondary/50 dark:bg-secondary/30 px-2 py-0.5 rounded font-bold">
                                            {action.activation}
                                        </span>
                                    )}
                                    {(upcastedDamage || upcastedHealing) && (
                                        <button
                                            type="button"
                                            onClick={handleDamageRoll}
                                            title="Roll Damage/Effect"
                                            className="font-mono font-bold hover:bg-primary/20 cursor-pointer flex items-center gap-2 text-primary bg-primary/5 px-2.5 py-1 rounded-full border border-primary/20 transition-all shadow-sm"
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
                                                className="flex items-center gap-1 bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Zap className="w-2.5 h-2.5 text-primary" />
                                                <Select
                                                    value={currentCastLevel.toString()}
                                                    onValueChange={(val: string) =>
                                                        onCastLevelChange(
                                                            parseInt(val)
                                                        )
                                                    }
                                                    variant="inline"
                                                    options={Array.from(
                                                        {
                                                            length:
                                                                10 -
                                                                action.baseLevel,
                                                        },
                                                        (_, i) =>
                                                            (action.baseLevel! + i).toString()
                                                    ).map((l) => ({
                                                        label: `Lvl ${l}`,
                                                        value: l
                                                    }))}
                                                    className="text-primary font-bold"
                                                />
                                            </div>
                                        )}
                                </div>
                            )}
                    </div>
                    <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        {!action.fromFeature && onEdit && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit();
                                }}
                                className="p-1 text-gray-400 hover:text-primary transition-colors"
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
                    <div className="p-4 pt-0 border-t border-border space-y-4 bg-secondary/10 dark:bg-secondary/5 text-sm animate-in slide-in-from-bottom-2 duration-200 rounded-b-lg">
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
                                                className={`hover:bg-primary/20 cursor-pointer font-bold flex items-center gap-2 px-2.5 py-1 rounded-full border border-primary/20 transition-all shadow-sm ${
                                                    currentCastLevel > (action.baseLevel || 0)
                                                        ? "text-primary bg-primary/10"
                                                        : "text-primary bg-primary/5"
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
                            className={`whitespace-pre-wrap leading-relaxed text-foreground/80 ${
                                action.isAttack ||
                                action.baseLevel !== undefined
                                    ? ""
                                    : "pt-3"
                            }`}
                        >
                            {action.description}
                        </div>

                        {action.atHigherLevels && (
                            <div className="mt-2 p-2 bg-primary/5 rounded border border-primary/10 italic text-xs text-gray-600 dark:text-gray-400">
                                <strong className="text-primary text-xs uppercase not-italic font-bold">
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
