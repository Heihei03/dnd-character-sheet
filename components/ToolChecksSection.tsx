"use client";

import React, { useState } from "react";
import { AbilityScores, Character, RollDiceFunc, ToolProficiency } from "../types/character";
import { Card, CardContent } from "./ui/card";
import ToolCheckRow from "./tool-checks/ToolCheckRow";
import { Lock, Unlock } from "lucide-react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface ToolChecksSectionProps {
    toolProficiencies: ToolProficiency[];
    onUpdate: (value: ToolProficiency[]) => void;
    abilityScores: AbilityScores;
    proficiencyBonus: number;
    rollDice?: RollDiceFunc;
    onNavigateToFeature?: (featureId: string) => void;
    character: Character;
}

const ToolChecksSection: React.FC<ToolChecksSectionProps> = ({
    toolProficiencies = [],
    onUpdate,
    abilityScores,
    proficiencyBonus,
    rollDice,
    onNavigateToFeature,
    character,
}) => {
    const [isReorderMode, setIsReorderMode] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleUpdateTool = (index: number, updates: Partial<ToolProficiency>) => {
        const newTools = [...toolProficiencies];
        newTools[index] = { ...newTools[index], ...updates };
        // Filter out feature-granted tools before persisting to base character data
        onUpdate(newTools.filter(t => !t.fromFeature));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = toolProficiencies.findIndex((t) => (t.id || t.name) === active.id);
            const newIndex = toolProficiencies.findIndex((t) => (t.id || t.name) === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newTools = arrayMove(toolProficiencies, oldIndex, newIndex);
                // Filter out feature-granted tools before persisting
                onUpdate(newTools.filter(t => !t.fromFeature));
            }
        }
    };

    if (toolProficiencies.length === 0) {
        return null; // Don't show the section if no tools are added
    }

    return (
        <Card className="w-full">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4 relative">
                    <div className="flex-1" />
                    <h2 className="text-2xl font-bold text-center">Tool Checks</h2>
                    <div className="flex-1 flex justify-end">
                        <button
                            onClick={() => setIsReorderMode(!isReorderMode)}
                            className={`p-1.5 rounded-lg hover:bg-secondary/80 transition-all ${isReorderMode ? "text-primary bg-primary/10 ring-1 ring-primary/20" : "text-muted-foreground/40"}`}
                            title={isReorderMode ? "Lock Order" : "Unlock Order (Drag to Reorder)"}
                        >
                            {isReorderMode ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={toolProficiencies.map(t => t.id || t.name)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="grid grid-cols-1 gap-2">
                            {toolProficiencies.map((tool, index) => (
                                <ToolCheckRow
                                    key={tool.id || `${tool.name}-${index}`}
                                    tool={tool}
                                    index={index}
                                    handleUpdateTool={handleUpdateTool}
                                    abilityScores={abilityScores}
                                    proficiencyBonus={proficiencyBonus}
                                    rollDice={rollDice}
                                    onNavigateToFeature={onNavigateToFeature}
                                    character={character}
                                    isReorderMode={isReorderMode}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </CardContent>
        </Card>
    );
};

export default ToolChecksSection;
