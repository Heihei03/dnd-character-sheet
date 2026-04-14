import React from "react";
import { Card, CardContent } from "./ui/card";
import AbilityScoreSection from "./AbilityScoreSection";
import SavingThrowsSection from "./SavingThrowsSection";
import { AbilityScores, NormalizedCharacter, SavingThrows, ActiveBonus } from "../types/character";
import ActiveBonusesList from "./ActiveBonusesList";

interface AbilityAndSavingThrowsProps {
  character: NormalizedCharacter;
  abilityScores: AbilityScores;
  effectiveAbilityScores: AbilityScores;
  setAbilityScore: (key: string, value: number) => void;
  rollDice: any;
  proficiencyBonus: number;
  setSavingThrows: (key: string, value: boolean) => void;
  onUpdateActiveBonuses: (bonuses: ActiveBonus[]) => void;
}

const AbilityAndSavingThrows: React.FC<AbilityAndSavingThrowsProps> = ({
  character,
  abilityScores,
  effectiveAbilityScores,
  setAbilityScore,
  rollDice,
  proficiencyBonus,
  setSavingThrows,
  onUpdateActiveBonuses,
}) => {
  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start w-full overflow-hidden">
          <div className="flex-1 pr-2 border-r border-gray-100 dark:border-gray-800 flex flex-col items-center">
            <div className="flex items-center justify-center border-b pb-2 mb-2 w-full">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center">Ability Scores</h2>
            </div>
            <AbilityScoreSection
              abilityScores={abilityScores}
              effectiveAbilityScores={effectiveAbilityScores}
              setAbilityScore={setAbilityScore}
              rollDice={rollDice}
              character={character}
              onUpdateActiveBonuses={onUpdateActiveBonuses}
            />
            <ActiveBonusesList 
              bonuses={character.activeBonuses || []}
              onUpdateBonuses={onUpdateActiveBonuses}
              target="ability"
              title="Ability Bonuses"
              compact={true}
            />
          </div>
          <div className="flex-1 pl-2 flex flex-col items-center">
            <div className="flex items-center justify-center border-b pb-2 mb-2 w-full">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center">Saving Throws</h2>
            </div>
            <SavingThrowsSection
              character={character}
              proficiencyBonus={proficiencyBonus}
              setSavingThrows={setSavingThrows}
              abilityScores={effectiveAbilityScores}
              rollDice={rollDice}
              onUpdateActiveBonuses={onUpdateActiveBonuses}
            />
            <ActiveBonusesList 
              bonuses={character.activeBonuses || []}
              onUpdateBonuses={onUpdateActiveBonuses}
              target="save"
              title="Save Bonuses"
              compact={true}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AbilityAndSavingThrows;
