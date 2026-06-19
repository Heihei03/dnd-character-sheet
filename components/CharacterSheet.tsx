"use client";

import React, { useState } from "react";
import { useTheme } from "./providers/ThemeProvider";
import { Shield, BookOpen, Heart } from "lucide-react";

// UI Components
import DiceRoller from "./DiceRoller";
import RollHistory from "./RollHistory";
import RestModal from "./RestModal";
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
  onExport?: () => void;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ character, setCharacter, onDelete, onReturn, onExport }) => {
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
    handleUpdateSummonStatblocks,
    handleAdjustHP,
    handleAdjustSummonHP,
    handleShortRestComplete,
    handleLongRest,
  } = useCharacterSheet(character, setCharacter);

  const { mobileLayout } = useTheme();

  const [mobileColumn, setMobileColumn] = useState<"stats" | "sheet" | "status">("sheet");
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");
  const [isRestModalOpen, setIsRestModalOpen] = useState(false);

  const changeMobileColumn = (newCol: "stats" | "sheet" | "status") => {
    const columns: ("stats" | "sheet" | "status")[] = ["stats", "sheet", "status"];
    const currentIndex = columns.indexOf(mobileColumn);
    const newIndex = columns.indexOf(newCol);
    if (newIndex !== currentIndex) {
      setSlideDirection(newIndex > currentIndex ? "right" : "left");
      setMobileColumn(newCol);
    }
  };

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (mobileLayout !== "tabs") return;
    
    // Ignore multi-touch gestures
    if (e.touches.length > 1) return;

    // Ignore swipe if we start touch in a scrollable / input / draggable widget
    const target = e.target as HTMLElement;
    if (
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest("select") ||
      target.closest("button") ||
      target.closest('[role="button"]') ||
      target.closest('[role="slider"]') ||
      target.closest(".no-swipe") ||
      target.closest(".fixed") ||
      target.closest(".sticky")
    ) {
      return;
    }

    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    if (showHistory) return; // Don't swipe if Roll History overlay is open

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    const minSwipeDistance = 60; // in pixels
    const minHorizontalRatio = 1.8; // diffX must be at least this factor greater than diffY

    if (Math.abs(diffX) > minSwipeDistance && Math.abs(diffX) > Math.abs(diffY) * minHorizontalRatio) {
      if (diffX > 0) {
        // Swiped right -> Go to tab on the left (status -> sheet -> stats)
        if (mobileColumn === "status") {
          changeMobileColumn("sheet");
        } else if (mobileColumn === "sheet") {
          changeMobileColumn("stats");
        }
      } else {
        // Swiped left -> Go to tab on the right (stats -> sheet -> status)
        if (mobileColumn === "stats") {
          changeMobileColumn("sheet");
        } else if (mobileColumn === "sheet") {
          changeMobileColumn("status");
        }
      }
    }

    setTouchStartX(null);
    setTouchStartY(null);
  };

  const customNavigateToFeature = (featureId: string) => {
    handleNavigateToFeature(featureId);
    changeMobileColumn("sheet");
  };

  const handleSummonFromStatblock = (statblockId: string) => {
    const statblock = (characterWithDefaults?.summonStatblocks || []).find(s => s.id === statblockId);
    if (statblock) {
      const newInstance = {
        ...statblock,
        id: Date.now().toString(),
        hp: { ...statblock.hp, current: statblock.hp.max, temp: 0 },
        active: true
      };
      handleUpdateSummons([...(characterWithDefaults?.summons || []), newInstance]);
    }
  };

  const localHandleChange = (field: keyof Character, value: any) => {
    setCharacter((prev) => {
      if (!prev) return null;
      let finalValue = value;
      if (field === "hp" || field === "maxHp" || field === "tempHp" || field === "exp") {
        const num = Number(value);
        finalValue = isNaN(num) ? (prev[field] || 0) : num;
      }

      let next = { ...prev, [field]: finalValue };

      // Enforce HP cap
      if (field === "hp" || field === "maxHp") {
        const currentHp = field === "hp" ? Number(finalValue) : Number(prev.hp ?? 0);
        const maxHp = field === "maxHp" ? Number(finalValue) : Number(prev.maxHp ?? 0);
        if (currentHp > maxHp) {
          next.hp = maxHp;
        }
      }

      return next;
    });
  };

  if (!character || !characterWithDefaults) {
    return <div>Loading...</div>;
  }

  const handleNameChange = (value: string) => localHandleChange("name", value);
  const handleSpeciesChange = (value: string) => localHandleChange("species", value);
  const handleSubSpeciesChange = (value: string) => localHandleChange("subSpecies", value);
  const handleBackgroundChange = (value: string) => localHandleChange("background", value);
  const handleExpChange = (value: number | undefined) => localHandleChange("exp", value);
  const handleImageUrlChange = (value: string) => localHandleChange("imageUrl", value);
  const handleUpdateClasses = (value: CharacterClass[]) => localHandleChange("classes", value);

  return (
    <div className="flex flex-col items-center pt-1 px-2.5 sm:px-4 md:px-8 pb-8 w-full">
      {/* Sticky header container for mobile only; static container on desktop */}
      <div className="w-full z-40 transition-all duration-300 sticky md:static top-0 bg-background/95 md:bg-transparent backdrop-blur-md md:backdrop-blur-none py-2 md:py-0 px-2.5 sm:px-4 md:px-0 -mx-2.5 sm:-mx-4 md:mx-0 border-b md:border-b-0 border-border/60 shadow-xs md:shadow-none mb-4 md:mb-6">
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
          onExport={onExport}
          onRestClick={() => setIsRestModalOpen(true)}
        />
      </div>

      <div 
        className="w-full space-y-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Mobile Tab Switcher */}
        {mobileLayout === "tabs" && (
          <div className="relative flex md:hidden w-full max-w-screen-2xl mx-auto bg-gray-50 dark:bg-gray-900/50 p-1 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
            {/* Sliding backdrop indicator */}
            <div
              className="absolute top-1 bottom-1 rounded-lg bg-primary shadow-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-0"
              style={{
                width: "calc(100% / 3 - 8px)",
                left:
                  mobileColumn === "stats"
                    ? "4px"
                    : mobileColumn === "sheet"
                    ? "calc(100% / 3 + 4px)"
                    : "calc(200% / 3 + 4px)",
              }}
            />
            {[
              { id: "stats", label: "Stats", icon: Shield },
              { id: "sheet", label: "Sheet", icon: BookOpen },
              { id: "status", label: "Status", icon: Heart },
            ].map((col) => (
              <button
                key={col.id}
                onClick={() => changeMobileColumn(col.id as any)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all z-10 relative ${
                  mobileColumn === col.id
                    ? "text-primary-foreground scale-[1.02]"
                    : "text-gray-500 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 dark:text-gray-400"
                }`}
              >
                <col.icon
                  size={14}
                  className={`transition-transform duration-300 ${
                    mobileColumn === col.id ? "scale-110 rotate-3 text-primary-foreground" : "text-gray-400"
                  }`}
                />
                <span className="transition-colors duration-300">
                  {col.label}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full max-w-screen-2xl mx-auto">
          
          {/* Left Column */}
          <div
            className={`${
              mobileLayout === "tabs"
                ? mobileColumn === "stats"
                  ? slideDirection === "right"
                    ? "block animate-slide-in-right"
                    : "block animate-slide-in-left"
                  : "hidden md:block"
                : "block"
            } md:col-span-3`}
          >
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
              handleNavigateToFeature={customNavigateToFeature}
              onUpdateActiveBonuses={handleUpdateActiveBonuses}
            />
          </div>

          {/* Center Column - Functional Tabs */}
          <div
            className={`${
              mobileLayout === "tabs"
                ? mobileColumn === "sheet"
                  ? slideDirection === "right"
                    ? "block animate-slide-in-right"
                    : "block animate-slide-in-left"
                  : "hidden md:block"
                : "block"
            } md:col-span-6`}
          >
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
              handleUpdateSummonStatblocks={handleUpdateSummonStatblocks}
              handleAdjustSummonHP={handleAdjustSummonHP}
              onSummonFromStatblock={handleSummonFromStatblock}
              onChange={handleChange}
            />
          </div>

          {/* Right Column */}
          <div
            className={`${
              mobileLayout === "tabs"
                ? mobileColumn === "status"
                  ? slideDirection === "right"
                    ? "block animate-slide-in-right"
                    : "block animate-slide-in-left"
                  : "hidden md:block"
                : "block"
            } md:col-span-3`}
          >
            <StatusSidebar
              characterWithDefaults={characterWithDefaults}
              effectiveAbilityScores={effectiveAbilityScores}
              proficiencyBonus={proficiencyBonus}
              handleInitiativeChange={handleInitiativeChange}
              handleArmorClassChange={handleArmorClassChange}
              handleHPChange={localHandleChange}
              handleDeathSavesChange={handleDeathSavesChange}
              handleSpeedChange={handleSpeedChange}
              handleUpdateSenses={handleUpdateSenses}
              handleUpdateDefenses={handleUpdateDefenses}
              handleUpdateConditions={handleUpdateConditions}
              handleNavigateToFeature={customNavigateToFeature}
              rollDice={rollDice}
              effectiveSpeed={effectiveSpeed}
              effectiveSenses={effectiveSenses}
              effectiveDefenses={effectiveDefenses}
              effectiveConditions={effectiveConditions}
              onUpdateActiveBonuses={handleUpdateActiveBonuses}
              handleAdjustHP={handleAdjustHP}
            />
          </div>
        </div>
      </div>

      <DiceRoller
        rollDice={(sides: number, count: number) => rollDice(sides, count)}
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

      {isRestModalOpen && characterWithDefaults && (
        <RestModal
          isOpen={isRestModalOpen}
          onClose={() => setIsRestModalOpen(false)}
          character={characterWithDefaults}
          rollDice={rollDice}
          handleAdjustHP={handleAdjustHP}
          handleClassChange={handleClassChange}
          handleShortRestComplete={handleShortRestComplete}
          handleLongRest={handleLongRest}
        />
      )}
    </div>
  );
};

export default CharacterSheet;
