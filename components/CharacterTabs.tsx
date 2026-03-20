"use client";

import React from "react";

// UI Components
import { Card, CardContent } from "./ui/card";

// Components
import ActionsSection from "./ActionsSection";
import CurrencySection from "./CurrencySection";
import FeaturesSection from "./FeaturesSection";
import InventorySection from "./InventorySection";
import SpellsSection from "./SpellsSection";
import BioSection from "./BioSection";

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
  CritRule
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
  rollDice: (sides: number, modifier?: number, label?: string, damageFormula?: string, damageType?: string, critRange?: number, critExtraDamage?: string, critRule?: CritRule) => void;
  rollDamage: (damageString: string, label?: string, damageType?: string, isCritical?: boolean, extraDamage?: string, ruleOverride?: CritRule) => void;
  critRule?: "double-dice" | "max-plus-roll" | "double-total";
  onCritRuleChange?: (rule: "double-dice" | "max-plus-roll" | "double-total") => void;
  critRange?: number;
  onCritRangeChange?: (range: number) => void;
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
  rollDice,
  rollDamage,
  critRule,
  onCritRuleChange,
  critRange,
  onCritRangeChange,
}) => {
  const handleNavigateToFeature = (featureId: string) => {
    setActiveTab("features");
    setFocusedFeatureId(featureId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 justify-center bg-gray-50 dark:bg-gray-900/50 p-2 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
        {[
          { id: "inventory", label: "Inventory" },
          { id: "spells", label: "Spells" },
          { id: "features", label: "Features" },
          { id: "actions", label: "Actions" },
          { id: "bio", label: "Bio" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-1.5 px-3 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab.id
                ? "bg-blue-500 text-white shadow-md scale-105"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "inventory" && (
        <div className="space-y-6">
          <CurrencySection
            currency={character.currency}
            setCurrency={handleCurrencyChange}
          />
          <InventorySection
            inventory={character.inventory}
            setInventory={handleInventoryChange}
            resources={effectiveResources}
            onUpdateResources={handleUpdateResources}
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
        />
      )}

      {activeTab === "bio" && (
        <BioSection bio={character.bio} onUpdate={handleUpdateBio} />
      )}
    </div>
  );
};

export default CharacterTabs;
