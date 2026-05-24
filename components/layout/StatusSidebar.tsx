import React from "react";
import { Card, CardContent } from "../ui/card";
import InitiativeSection from "../InitiativeSection";
import ArmorClassSection from "../ArmorClassSection";
import HPSection from "../HP";
import DeathSaves from "../DeathSaves";
import SpeedSection from "../SpeedSection";
import SensesSection from "../SensesSection";
import DefensesSection from "../DefensesSection";
import ConditionsSection from "../ConditionsSection";
import { 
  AbilityScores,
  ArmorClass, 
  Character,
  Condition, 
  DeathSaves as DeathSavesType, 
  Defenses, 
  NormalizedCharacter, 
  Sense,
  ActiveBonus
} from "../../types/character";

interface StatusSidebarProps {
  characterWithDefaults: NormalizedCharacter;
  effectiveAbilityScores: AbilityScores;
  proficiencyBonus: number;
  handleInitiativeChange: (initiative: any) => void;
  handleArmorClassChange: (armorClass: ArmorClass) => void;
  handleHPChange: (field: keyof Character, value: any) => void;
  handleAdjustHP: (amount: number, isDamage: boolean) => void;
  handleDeathSavesChange: (deathSaves: DeathSavesType) => void;
  handleSpeedChange: (key: string, value: number, from?: string) => void;
  handleUpdateSenses: (senses: Sense[]) => void;
  handleUpdateDefenses: (defenses: Defenses) => void;
  handleUpdateConditions: (conditions: Condition[]) => void;
  handleNavigateToFeature: (featureId: string) => void;
  rollDice: any;
  effectiveSpeed: any;
  effectiveSenses: Sense[];
  effectiveDefenses: Defenses;
  effectiveConditions: Condition[];
  onUpdateActiveBonuses: (bonuses: ActiveBonus[]) => void;
}

const StatusSidebar: React.FC<StatusSidebarProps> = ({
  characterWithDefaults,
  effectiveAbilityScores,
  proficiencyBonus,
  handleInitiativeChange,
  handleArmorClassChange,
  handleHPChange,
  handleAdjustHP,
  handleDeathSavesChange,
  handleSpeedChange,
  handleUpdateSenses,
  handleUpdateDefenses,
  handleUpdateConditions,
  handleNavigateToFeature,
  rollDice,
  effectiveSpeed,
  effectiveSenses,
  effectiveDefenses,
  effectiveConditions,
  onUpdateActiveBonuses,
}) => {
  return (
    <div className="md:col-span-3">
      <Card className="w-full">
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 space-y-0">
          <div className="col-span-1">
            <InitiativeSection
              character={characterWithDefaults}
              dexModifier={Math.floor(((effectiveAbilityScores.dexterity ?? 10) - 10) / 2)}
              proficiencyBonus={proficiencyBonus}
              onUpdate={handleInitiativeChange}
              rollDice={rollDice}
              dexScore={effectiveAbilityScores.dexterity ?? 10}
              onUpdateActiveBonuses={onUpdateActiveBonuses}
            />
          </div>
          <div className="col-span-1">
            <ArmorClassSection
              armorClass={characterWithDefaults.armorClass}
              setArmorClass={handleArmorClassChange}
              abilityScores={effectiveAbilityScores}
              character={characterWithDefaults}
              onUpdateActiveBonuses={onUpdateActiveBonuses}
            />
          </div>
          <div className="sm:col-span-2 md:col-span-1">
            <HPSection
              maxHp={characterWithDefaults.maxHp} 
              setMaxHp={(maxHp) => handleHPChange("maxHp", maxHp)}
              hp={characterWithDefaults.hp} 
              setHp={(hp) => handleHPChange("hp", hp)}
              tempHp={characterWithDefaults.tempHp} 
              setTempHp={(tempHp) => handleHPChange("tempHp", tempHp)}
              classes={characterWithDefaults.classes}
              abilityScores={effectiveAbilityScores}
              onUpdateClasses={(classes) => handleHPChange("classes", classes)}
              rollDice={rollDice}
              onAdjustHP={handleAdjustHP}
            />
          </div>
          <div className="col-span-1">
            <DeathSaves
              deathSaves={characterWithDefaults.deathSaves}
              onUpdate={handleDeathSavesChange}
            />
          </div>
          <div className="col-span-1">
            <SpeedSection
              baseSpeed={characterWithDefaults.speed}
              effectiveSpeed={effectiveSpeed}
              setSpeed={handleSpeedChange}
              onNavigateToFeature={handleNavigateToFeature}
            />
          </div>
          <div className="col-span-1">
            <SensesSection
              senses={effectiveSenses}
              onUpdateSenses={handleUpdateSenses}
              onNavigateToFeature={handleNavigateToFeature}
            />
          </div>
          <div className="col-span-1">
            <ConditionsSection
              conditions={effectiveConditions}
              onUpdateConditions={handleUpdateConditions}
            />
          </div>
          <div className="sm:col-span-2 md:col-span-1">
            <DefensesSection
              defenses={effectiveDefenses}
              onUpdateDefenses={handleUpdateDefenses}
              onNavigateToFeature={handleNavigateToFeature}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusSidebar;
