"use client";

import React from "react";

// UI Components
import DiceRoller from "./DiceRoller";
import RollHistory from "./RollHistory";
import CharacterHeader from "./CharacterHeader";
import CharacterTabs from "./CharacterTabs";
import StatsSidebar from "./layout/StatsSidebar";
import StatusSidebar from "./layout/StatusSidebar";

// Hooks
import { useCharacterSheet } from "../hooks/useCharacterSheet";

// Types
import { Character, Feature, CharacterClass } from "../types/character";

interface CharacterSheetProps {
  character: Character | null;
  setCharacter: React.Dispatch<React.SetStateAction<Character | null>>;
  onDelete?: () => void;
  onReturn?: () => void;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ character, setCharacter, onDelete, onReturn }) => {
  const {
    characterWithDefaults,
    activeTab,
    setActiveTab,
    focusedFeatureId,
    setFocusedFeatureId,
    globalRollMode,
    setGlobalRollMode,
    rollResult,
    rollHistory,
    showHistory,
    setShowHistory,
    effectiveAbilityScores,
    effectiveSkills,
    skillSources,
    effectiveToolProficiencies,
    effectiveWeaponProficiencies,
    effectiveArmorProficiencies,
    effectiveLanguages,
    proficiencyBonus,
    totalLevel,
    effectiveResources,
    effectiveSpeed,
    effectiveSenses,
    effectiveDefenses,
    effectiveWeaponMasteries,
    effectiveConditions,
    handleNavigateToFeature,
    handleSavingThrowChange,
    handleSkillChange,
    handleAbilityScoreChange,
    handleSpeedChange,
    handleInventoryChange,
    handleCurrencyChange,
    handleDeathSavesChange,
    handleArmorClassChange,
    handleInitiativeChange,
    handleClassChange,
    addClass,
    removeClass,
    handleChange,
    handleUpdateSenses,
    handleUpdateDefenses,
    handleUpdateConditions,
    handleUpdateItemFeature,
    handleDeleteItemFeature,
    handleUpdateActions,
    handleUpdateBio,
    handleUpdateSpells,
    handleUpdateSpellSlots,
    rollDice,
    rollDamage,
    clearHistory,
    handleUpdateResources,
    handleUpdateActiveBonuses,
    handleUpdateSummons,
  } = useCharacterSheet(character, setCharacter);

  if (!character || !characterWithDefaults) {
    return <div>Loading...</div>;
  }

  const handleNameChange = (value: string) => handleChange("name", value);
  const handleSpeciesChange = (value: string) => handleChange("species", value);
  const handleSubSpeciesChange = (value: string) => handleChange("subSpecies", value);
  const handleBackgroundChange = (value: string) => handleChange("background", value);
  const handleExpChange = (value: number | undefined) => handleChange("exp", value);
  const handleImageUrlChange = (value: string) => handleChange("imageUrl", value);
  const handleUpdateClasses = (value: CharacterClass[]) => handleChange("classes", value);

  return (
    <div className="flex flex-col items-center pt-1 px-8 pb-8">
      <div className="w-full mb-4">
        <CharacterHeader
          name={characterWithDefaults.name}
          species={characterWithDefaults.species}
          subSpecies={characterWithDefaults.subSpecies}
          background={characterWithDefaults.background}
          exp={characterWithDefaults.exp}
          classes={characterWithDefaults.classes}
          proficiencyBonus={proficiencyBonus}
          totalLevel={totalLevel}
          onNameChange={handleNameChange}
          onSpeciesChange={handleSpeciesChange}
          onSubSpeciesChange={handleSubSpeciesChange}
          onBackgroundChange={handleBackgroundChange}
          onExpChange={handleExpChange}
          onClassChange={handleClassChange}
          onAddClass={addClass}
          onRemoveClass={removeClass}
          imageUrl={characterWithDefaults.imageUrl}
          onImageUrlChange={handleImageUrlChange}
          onDelete={onDelete}
          onReturn={onReturn}
        />
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full max-w-screen-2xl mx-auto">
          
          {/* Left Column */}
          <StatsSidebar
            characterWithDefaults={characterWithDefaults}
            effectiveAbilityScores={effectiveAbilityScores}
            handleAbilityScoreChange={handleAbilityScoreChange}
            rollDice={rollDice}
            proficiencyBonus={proficiencyBonus}
            handleSavingThrowChange={handleSavingThrowChange}
            effectiveSkills={effectiveSkills}
            skillSources={skillSources}
            handleSkillChange={handleSkillChange}
            effectiveToolProficiencies={effectiveToolProficiencies}
            handleToolProficiencyChange={(value) => handleChange("toolProficiencies", value)}
            effectiveWeaponProficiencies={effectiveWeaponProficiencies}
            effectiveArmorProficiencies={effectiveArmorProficiencies}
            effectiveWeaponMasteries={effectiveWeaponMasteries}
            effectiveLanguages={effectiveLanguages}
            handleProficiencyChange={handleChange}
            handleNavigateToFeature={handleNavigateToFeature}
            onUpdateActiveBonuses={handleUpdateActiveBonuses}
          />

          {/* Center Column - Functional Tabs */}
          <div className="md:col-span-6">
            <CharacterTabs
              character={characterWithDefaults}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              focusedFeatureId={focusedFeatureId}
              setFocusedFeatureId={setFocusedFeatureId}
              proficiencyBonus={proficiencyBonus}
              totalLevel={totalLevel}
              effectiveAbilityScores={effectiveAbilityScores}
              effectiveResources={effectiveResources}
              handleInventoryChange={handleInventoryChange}
              handleCurrencyChange={handleCurrencyChange}
              handleUpdateResources={handleUpdateResources}
              handleUpdateSpells={handleUpdateSpells}
              handleUpdateSpellSlots={handleUpdateSpellSlots}
              handleUpdateItemFeature={handleUpdateItemFeature}
              handleDeleteItemFeature={handleDeleteItemFeature}
              handleUpdateActions={handleUpdateActions}
              handleUpdateBio={handleUpdateBio}
              handleUpdateFeatures={(value: Feature[]) => handleChange("features", value)}
              handleUpdateClasses={(value: CharacterClass[]) => handleChange("classes", value)}
              rollDice={rollDice}
              rollDamage={rollDamage}
              critRule={characterWithDefaults.critRule}
              onCritRuleChange={(rule) => handleChange("critRule", rule)}
              critRange={characterWithDefaults.critRange}
              onCritRangeChange={(range) => handleChange("critRange", range)}
              onUpdateActiveBonuses={handleUpdateActiveBonuses}
              handleUpdateSummons={handleUpdateSummons}
            />
          </div>

          {/* Right Column */}
          <StatusSidebar
            characterWithDefaults={characterWithDefaults}
            effectiveAbilityScores={effectiveAbilityScores}
            proficiencyBonus={proficiencyBonus}
            handleInitiativeChange={handleInitiativeChange}
            handleArmorClassChange={handleArmorClassChange}
            handleHPChange={handleChange}
            handleDeathSavesChange={handleDeathSavesChange}
            handleSpeedChange={handleSpeedChange}
            handleUpdateSenses={handleUpdateSenses}
            handleUpdateDefenses={handleUpdateDefenses}
            handleUpdateConditions={handleUpdateConditions}
            handleNavigateToFeature={handleNavigateToFeature}
            rollDice={rollDice}
            effectiveSpeed={effectiveSpeed}
            effectiveSenses={effectiveSenses}
            effectiveDefenses={effectiveDefenses}
            effectiveConditions={effectiveConditions}
            onUpdateActiveBonuses={handleUpdateActiveBonuses}
          />
        </div>
      </div>

      <DiceRoller
        rollDice={(sides: number) => rollDice(sides)}
        rollResult={rollResult}
        onToggleHistory={() => setShowHistory(!showHistory)}
        globalRollMode={globalRollMode}
        setGlobalRollMode={setGlobalRollMode}
      />

      {showHistory && (
        <RollHistory
          history={rollHistory}
          onClear={clearHistory}
          onClose={() => setShowHistory(false)}
          onRollDamage={rollDamage}
        />
      )}
    </div>
  );
};

export default CharacterSheet;
