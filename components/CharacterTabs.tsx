"use client";

import React from "react";

// UI Components
import { Card, CardContent } from "./ui/card";

// Components
import ActionsSection from "./ActionsSection";
import CurrencySection from "./CurrencySection";
import FeaturesSection from "./features/FeaturesSection";
import InventorySection from "./InventorySection";
import SpellsSection from "./spells/SpellsSection";
import BioSection from "./BioSection";
import ResourceTrackersTab from "./ResourceTrackersTab";
import SummonsSection from "./summons/SummonsSection";

// Types
import {
  AbilityScores,
  Action,
  Currency,
  Feature,
  InventoryItem,
  NormalizedCharacter,
  Resource,
  Spell,
  SpellSlot,
  Bio,
  CharacterClass,
  CritRule,
  RollDiceFunc,
  RollDamageFunc,
  ActiveBonus,
  Summon
} from "../types/character";

// Utils
import {
  getAllActiveFeatures,
  getEffectiveActions,
  getEffectiveSpells
} from "../utils/character-utils";

interface CharacterTabsProps {
  character: NormalizedCharacter;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  focusedFeatureId: string | null;
  setFocusedFeatureId: (id: string | null) => void;
  proficiencyBonus: number;
  totalLevel: number;
  effectiveAbilityScores: AbilityScores;
  effectiveResources: Resource[];
  handleInventoryChange: (inventory: InventoryItem[]) => void;
  handleCurrencyChange: (currency: Currency) => void;
  handleUpdateResources: (resources: Resource[]) => void;
  handleUpdateSpells: (spells: Spell[]) => void;
  handleUpdateSpellSlots: (slots: SpellSlot[]) => void;
  handleUpdateItemFeature: (feature: Feature) => void;
  handleDeleteItemFeature: (featureId: string, itemId: string) => void;
  handleUpdateActions: (actions: Action[]) => void;
  handleUpdateBio: (field: keyof Bio, value: string) => void;
  handleUpdateFeatures: (features: Feature[]) => void;
  handleUpdateClasses: (classes: CharacterClass[]) => void;
  rollDice: RollDiceFunc;
  rollDamage: RollDamageFunc;
  critRule?: CritRule;
  onCritRuleChange?: (rule: CritRule) => void;
  critRange?: number;
  onCritRangeChange?: (range: number) => void;
  onUpdateActiveBonuses: (bonuses: ActiveBonus[]) => void;
  handleUpdateSummons: (summons: Summon[]) => void;
  handleUpdateSummonStatblocks: (summonStatblocks: Summon[]) => void;
  handleAdjustSummonHP: (summonId: string, amount: number, isDamage: boolean) => void;
  onChange: (field: any, value: any) => void;
}

const CharacterTabs: React.FC<CharacterTabsProps> = ({
  character,
  activeTab,
  setActiveTab,
  focusedFeatureId,
  setFocusedFeatureId,
  proficiencyBonus,
  totalLevel,
  effectiveAbilityScores,
  effectiveResources,
  handleInventoryChange,
  handleCurrencyChange,
  handleUpdateResources,
  handleUpdateSpells,
  handleUpdateSpellSlots,
  handleUpdateItemFeature,
  handleDeleteItemFeature,
  handleUpdateActions,
  handleUpdateBio,
  handleUpdateFeatures,
  handleUpdateClasses,
  rollDice,
  rollDamage,
  critRule,
  onCritRuleChange,
  critRange,
  onCritRangeChange,
  onUpdateActiveBonuses,
  handleUpdateSummons,
  handleUpdateSummonStatblocks,
  handleAdjustSummonHP,
  onChange,
}) => {
  const handleNavigateToFeature = (featureId: string) => {
    setActiveTab("features");
    setFocusedFeatureId(featureId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 justify-center bg-gray-50 dark:bg-gray-900/50 p-2 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
        {[
          { id: "resources", label: "Resources" },
          { id: "inventory", label: "Inventory" },
          { id: "spells", label: "Spells" },
          { id: "features", label: "Features" },
          { id: "actions", label: "Actions" },
          { id: "summons", label: "Summons" },
          { id: "bio", label: "Bio" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-1.5 px-3 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-md scale-105"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {activeTab === "resources" && (
        <ResourceTrackersTab 
          resources={effectiveResources}
          onUpdateResources={handleUpdateResources}
          spellSlots={character.spellSlots || []}
          onUpdateSpellSlots={handleUpdateSpellSlots}
          classes={character.classes || []}
          abilityScores={effectiveAbilityScores}
          onUpdateClasses={handleUpdateClasses}
          rollDice={rollDice}
          inventory={character.inventory || []}
          onUpdateInventory={handleInventoryChange}
        />
      )}

      {activeTab === "inventory" && (
        <div className="space-y-6">
          <CurrencySection
            currency={character.currency}
            setCurrency={handleCurrencyChange}
          />
          <InventorySection
            character={character}
            setInventory={handleInventoryChange}
            resources={effectiveResources}
            onUpdateResources={handleUpdateResources}
            onChange={onChange}
          />
        </div>
      )}

      {activeTab === "spells" && (
        <SpellsSection
          classes={character.classes || []}
          spells={getEffectiveSpells(character)}
          spellSlots={character.spellSlots || []}
          onUpdateSpells={handleUpdateSpells}
          onUpdateSpellSlots={handleUpdateSpellSlots}
          abilityScores={effectiveAbilityScores}
          proficiencyBonus={proficiencyBonus}
          onNavigateToFeature={handleNavigateToFeature}
          onUpdateActiveBonuses={onUpdateActiveBonuses}
          character={character}
          rollDice={rollDice}
          rollDamage={rollDamage}
        />
      )}

      {activeTab === "features" && (
        <FeaturesSection
          features={character.features}
          itemFeatures={getAllActiveFeatures(character).filter((f: Feature) => f.origin === "Item")}
          resources={effectiveResources}
          onUpdate={handleUpdateFeatures}
          onUpdateItemFeature={handleUpdateItemFeature}
          onDeleteItemFeature={handleDeleteItemFeature}
          onUpdateResources={handleUpdateResources}
          classes={character.classes}
          abilityScores={effectiveAbilityScores}
          proficiencyBonus={proficiencyBonus}
          totalLevel={totalLevel}
          rollDice={rollDice}
          rollDamage={rollDamage}
          species={character.species}
          subSpecies={character.subSpecies}
          background={character.background}
          focusedId={focusedFeatureId}
          onFocusedIdChange={setFocusedFeatureId}
        />
      )}

      {activeTab === "actions" && (
        <ActionsSection
          actions={getEffectiveActions(character)}
          onUpdate={handleUpdateActions}
          abilityScores={effectiveAbilityScores}
          proficiencyBonus={proficiencyBonus}
          totalLevel={totalLevel}
          rollDice={rollDice}
          rollDamage={rollDamage}
          resources={effectiveResources}
          onUpdateResources={handleUpdateResources}
          critRule={critRule}
          onCritRuleChange={onCritRuleChange}
          critRange={critRange}
          onCritRangeChange={onCritRangeChange}
          character={character as any}
          onUpdateActiveBonuses={onUpdateActiveBonuses}
        />
      )}

      {activeTab === "summons" && (
        <SummonsSection 
          summons={character.summons}
          onUpdateSummons={handleUpdateSummons}
          summonStatblocks={character.summonStatblocks}
          onUpdateSummonStatblocks={handleUpdateSummonStatblocks}
          rollDice={rollDice}
          rollDamage={rollDamage}
          character={character}
          proficiencyBonus={proficiencyBonus}
          handleAdjustSummonHP={handleAdjustSummonHP}
        />
      )}

      {activeTab === "bio" && (
        <BioSection bio={character.bio} onUpdate={handleUpdateBio} />
      )}
    </div>
  );
};

export default CharacterTabs;
