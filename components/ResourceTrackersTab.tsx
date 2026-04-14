"use client";

import React from "react";

// Components
import ResourcesSection from "./ResourcesSection";
import SpellSlotsTracker from "./SpellSlotsTracker";
import HitDiceTracker from "./HitDiceTracker";

// Types
import { 
    CharacterClass, 
    AbilityScores, 
    Resource, 
    SpellSlot, 
    RollDiceFunc 
} from "../types/character";

interface ResourceTrackersTabProps {
    resources: Resource[];
    onUpdateResources: (resources: Resource[]) => void;
    spellSlots: SpellSlot[];
    onUpdateSpellSlots: (slots: SpellSlot[]) => void;
    classes: CharacterClass[];
    abilityScores: AbilityScores;
    onUpdateClasses: (classes: CharacterClass[]) => void;
    rollDice?: RollDiceFunc;
}

const ResourceTrackersTab: React.FC<ResourceTrackersTabProps> = ({
    resources,
    onUpdateResources,
    spellSlots,
    onUpdateSpellSlots,
    classes,
    abilityScores,
    onUpdateClasses,
    rollDice
}) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Class / General Resources */}
            <ResourcesSection 
                resources={resources} 
                onUpdateResources={onUpdateResources} 
            />

            {/* Spell Slots */}
            <SpellSlotsTracker 
                classes={classes}
                spellSlots={spellSlots}
                onUpdateSpellSlots={onUpdateSpellSlots}
            />

            {/* Hit Dice */}
            <HitDiceTracker 
                classes={classes}
                abilityScores={abilityScores}
                onUpdateClasses={onUpdateClasses}
                rollDice={rollDice}
            />
        </div>
    );
};

export default ResourceTrackersTab;
