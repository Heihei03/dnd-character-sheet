"use client";

import React from "react";
import { AbilityScores, Character, RollDiceFunc, ToolProficiency } from "../../types/character";
import ProficiencyIcon from "../ui/ProficiencyIcon";
import { getAbilityModifier, getProficiencyMultiplier, cycleProficiency, ABILITY_NAMES, getAdvantageDisadvantage, getEffectiveBonuses } from "../../utils/character-utils";
import FeatureNavigationBadge from "../features/FeatureNavigationBadge";
import Select from "../ui/Select";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

const ABILITY_OPTIONS = ABILITY_NAMES.map(ability => ({
    label: ability.substring(0, 3).toUpperCase(),
    value: ability
}));

interface ToolCheckRowProps {
    tool: ToolProficiency;
    index: number;
    handleUpdateTool: (index: number, updates: Partial<ToolProficiency>) => void;
    abilityScores: AbilityScores;
    proficiencyBonus: number;
    rollDice?: RollDiceFunc;
    onNavigateToFeature?: (featureId: string) => void;
    character: Character;
    isReorderMode?: boolean;
}

const ToolCheckRow: React.FC<ToolCheckRowProps> = ({
    tool,
    index,
    handleUpdateTool,
    abilityScores,
    proficiencyBonus,
    rollDice,
    onNavigateToFeature,
    character,
    isReorderMode = false,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: tool.id || `${tool.name}-${index}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : "auto",
        position: (isDragging ? "relative" : "static") as any,
    };

    const abilityKey = tool.ability.toLowerCase();
    const abilityScore = abilityScores[abilityKey] || 10;
    const modifier = getAbilityModifier(abilityScore);
    const profMultiplier = getProficiencyMultiplier(tool.level);
    const bonus = Math.floor(proficiencyBonus * profMultiplier);

    // Calculate bonuses
    const toolTarget = `${tool.name} Check`;
    const activeBonuses = getEffectiveBonuses(character, toolTarget);
    let bonusModifier = 0;
    activeBonuses.forEach(b => {
        const val = parseInt(b.bonus);
        if (!isNaN(val) && !b.bonus.includes('d')) {
            bonusModifier += val;
        }
    });

    const totalBonus = modifier + bonus + bonusModifier;
    const sign = totalBonus >= 0 ? "+" : "";

    const { advantage, disadvantage, extraAdvantage } = getAdvantageDisadvantage(character, toolTarget, abilityKey);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center justify-between p-2 rounded hover:bg-secondary/40 transition-colors ${isDragging ? "bg-primary/10 shadow-inner" : ""}`}
        >
            <div className="flex items-center gap-3 flex-1 overflow-hidden">
                {isReorderMode && (
                    <div className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-primary transition-colors px-1" {...attributes} {...listeners}>
                        <GripVertical className="w-4 h-4" />
                    </div>
                )}
                <button
                    onClick={() => !tool.fromFeature && handleUpdateTool(index, { level: cycleProficiency(tool.level) })}
                    className={`w-8 h-8 flex items-center justify-center focus:outline-none transition-transform active:scale-95 ${tool.fromFeature ? "cursor-default" : "hover:text-primary"}`}
                    title={tool.fromFeature ? `Granted by Feature: ${tool.level}` : `Proficiency: ${tool.level}`}
                >
                    <div className="scale-75">
                        <ProficiencyIcon level={tool.level} />
                    </div>
                </button>
                <div className="flex items-baseline gap-2 flex-1 overflow-hidden">
                    <span className="font-medium cursor-pointer truncate" onClick={() => rollDice?.(20, 1, totalBonus, `${tool.name} Check`, undefined, undefined, undefined, undefined, undefined, advantage, disadvantage, extraAdvantage)}>
                        {tool.name}
                    </span>
                    {tool.fromFeature && (
                        <FeatureNavigationBadge
                            featureId={tool.fromFeatureId}
                            onNavigateToFeature={onNavigateToFeature}
                            variant="compact"
                        />
                    )}
                    <div className="flex items-center text-[11px] text-muted-foreground font-bold uppercase tracking-tight shrink-0">
                        <span>(</span>
                        {tool.fromFeature ? (
                            <span className="cursor-default tracking-tight uppercase font-bold">{tool.ability.substring(0, 3)}</span>
                        ) : (
                            <Select
                                variant="inline"
                                value={tool.ability}
                                onValueChange={(val) => handleUpdateTool(index, { ability: val })}
                                options={ABILITY_OPTIONS}
                            />
                        )}
                        <span>)</span>
                        {advantage && (
                            <span className="ml-1 text-[10px] font-black bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-0.5 rounded border border-green-200 dark:border-green-800" title="Advantage">ADV{extraAdvantage > 0 ? `+${extraAdvantage}` : ''}</span>
                        )}
                        {disadvantage && (
                            <span className="ml-1 text-[10px] font-black bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-0.5 rounded border border-red-200 dark:border-red-800" title="Disadvantage">DIS</span>
                        )}
                    </div>
                </div>
            </div>
            <button
                onClick={() => rollDice?.(20, 1, totalBonus, `${tool.name} Check (${tool.ability})`, undefined, undefined, undefined, undefined, undefined, advantage, disadvantage, extraAdvantage)}
                className="font-bold text-lg min-w-[3ch] text-right text-primary hover:opacity-80 transition-colors ml-2"
                title={`Modifier: ${modifier}, Proficiency: ${bonus}`}
            >
                {sign}{totalBonus}
            </button>
        </div>
    );
};

export default ToolCheckRow;
