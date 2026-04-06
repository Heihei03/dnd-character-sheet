import React from "react";
import AbilityAndSavingThrows from "../AbilityAndSavingThrows";
import SkillsSection from "../SkillsSection";
import ToolChecksSection from "../ToolChecksSection";
import ProficienciesLanguagesSection from "../ProficienciesLanguagesSection";
import { AbilityScores, Character, NormalizedCharacter, ToolProficiency, ProficiencyArray } from "../../types/character";

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
  effectiveLanguages: ProficiencyArray;
  handleProficiencyChange: (field: keyof Character, value: any) => void;
  handleNavigateToFeature: (featureId: string) => void;
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
  effectiveLanguages,
  handleProficiencyChange,
  handleNavigateToFeature,
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
