import React from "react";
import AbilityAndSavingThrows from "../AbilityAndSavingThrows";
import SkillsSection from "../SkillsSection";
import ToolChecksSection from "../ToolChecksSection";
import ProficienciesLanguagesSection from "../ProficienciesLanguagesSection";
import WeaponMasteriesSection from "../WeaponMasteriesSection";
import { AbilityScores, Character, NormalizedCharacter, ToolProficiency, ProficiencyArray, ActiveBonus } from "../../types/character";

interface StatsSidebarProps {
  characterWithDefaults: NormalizedCharacter;
  effectiveAbilityScores: AbilityScores;
  handleAbilityScoreChange: (key: string, value: number) => void;
  rollDice: any;
  proficiencyBonus: number;
  handleSavingThrowChange: (key: string, value: boolean) => void;
  effectiveSkills: any;
  skillSources: any;
  handleSkillChange: (key: string, value: string) => void;
  effectiveToolProficiencies: ToolProficiency[];
  handleToolProficiencyChange: (value: ToolProficiency[]) => void;
  effectiveWeaponProficiencies: ProficiencyArray;
  effectiveArmorProficiencies: ProficiencyArray;
  effectiveWeaponMasteries: ProficiencyArray;
  effectiveLanguages: ProficiencyArray;
  handleProficiencyChange: (field: keyof Character, value: any) => void;
  handleNavigateToFeature: (featureId: string) => void;
  onUpdateActiveBonuses: (bonuses: ActiveBonus[]) => void;
}

const StatsSidebar: React.FC<StatsSidebarProps> = ({
  characterWithDefaults,
  effectiveAbilityScores,
  handleAbilityScoreChange,
  rollDice,
  proficiencyBonus,
  handleSavingThrowChange,
  effectiveSkills,
  skillSources,
  handleSkillChange,
  effectiveToolProficiencies,
  handleToolProficiencyChange,
  effectiveWeaponProficiencies,
  effectiveArmorProficiencies,
  effectiveWeaponMasteries,
  effectiveLanguages,
  handleProficiencyChange,
  handleNavigateToFeature,
  onUpdateActiveBonuses,
}) => {
  return (
    <div className="space-y-6 md:col-span-3">
      <AbilityAndSavingThrows
        character={characterWithDefaults}
        abilityScores={characterWithDefaults.abilityScores}
        effectiveAbilityScores={effectiveAbilityScores}
        setAbilityScore={handleAbilityScoreChange}
        rollDice={rollDice}
        proficiencyBonus={proficiencyBonus}
        setSavingThrows={handleSavingThrowChange}
        onUpdateActiveBonuses={onUpdateActiveBonuses}
      />

      <SkillsSection
        character={characterWithDefaults}
        skills={effectiveSkills}
        skillSources={skillSources}
        setSkills={handleSkillChange}
        abilityScores={effectiveAbilityScores}
        proficiencyBonus={proficiencyBonus}
        rollDice={rollDice}
        onNavigateToFeature={handleNavigateToFeature}
        onUpdateActiveBonuses={onUpdateActiveBonuses}
      />
      <ToolChecksSection
        toolProficiencies={effectiveToolProficiencies}
        onUpdate={handleToolProficiencyChange}
        abilityScores={effectiveAbilityScores}
        proficiencyBonus={proficiencyBonus}
        rollDice={rollDice}
        onNavigateToFeature={handleNavigateToFeature}
        character={characterWithDefaults}
      />
      <WeaponMasteriesSection
        weaponMasteries={effectiveWeaponMasteries}
        onUpdate={handleProficiencyChange}
        onNavigateToFeature={handleNavigateToFeature}
      />
      <ProficienciesLanguagesSection
        weaponProficiencies={effectiveWeaponProficiencies}
        armorProficiencies={effectiveArmorProficiencies}
        toolProficiencies={effectiveToolProficiencies}
        languages={effectiveLanguages}
        onUpdate={handleProficiencyChange}
        onNavigateToFeature={handleNavigateToFeature}
      />
    </div>
  );
};

export default StatsSidebar;
