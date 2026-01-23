"use client";

import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import HPSection from "./HP";
import AbilityScoreSection from "./AbilityScoreSection";
import SpeedSection from "./SpeedSection";
import DiceRoller from "./DiceRoller";
import { classOptions } from "../utils/constants";
import { Character, SavingThrows, Skills, InventoryItem, Currency } from "../types/character";
import SavingThrowsSection from "./SavingThrowsSection";
import SkillsSection from "./SkillsSection";
import InventorySection from "./InventorySection";
import CurrencySection from "./CurrencySection";

interface CharacterSheetProps {
  character: Character | null;
  setCharacter: React.Dispatch<React.SetStateAction<Character | null>>;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ character, setCharacter }) => {
  const [activeTab, setActiveTab] = useState<string>("coreStats");
  const [rollResult, setRollResult] = useState<string | null>(null);

  // Ensure character is not null before rendering the component
  if (!character) {
    return <div>Loading...</div>; // You can show a loading indicator or fallback here
  }

  // Fallback default values if `character.abilityScores` is undefined
  const characterWithDefaults = {
    ...character,
    characterClass: character.characterClass ?? "Fighter",
    abilityScores: character.abilityScores ?? {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    savingThrows: character.savingThrows ?? {
      strength: false,
      dexterity: false,
      constitution: false,
      intelligence: false,
      wisdom: false,
      charisma: false,
    },
    skills: character.skills ?? {
      acrobatics: "none",
      animalHandling: "none",
      arcana: "none",
      athletics: "none",
      deception: "none",
      history: "none",
      insight: "none",
      intimidation: "none",
      investigation: "none",
      medicine: "none",
      nature: "none",
      perception: "none",
      performance: "none",
      persuasion: "none",
      religion: "none",
      sleightOfHand: "none",
      stealth: "none",
      survival: "none",
    },
    speed: character.speed ?? {
      walk: { value: 30, from: "Base" },
    },
    inventory: character.inventory ?? [],
    currency: character.currency ?? {
      cp: 0,
      sp: 0,
      ep: 0,
      gp: 0,
      pp: 0,
    },
  };


  // Function to calculate proficiency bonus based on level
  const getProficiencyBonus = (level: number): number => {
    return Math.ceil((level) / 4) + 1;
  };

  // Calculate proficiency bonus
  const proficiencyBonus = getProficiencyBonus(character.level);

  // Handle updating saving throws
  const handleSavingThrowChange = (key: string, value: boolean) => {
    setCharacter((prev) => {
      if (!prev) return null;

      // Fill in missing keys with false, then override the changed key
      const mergedSavingThrows: SavingThrows = {
        strength: prev.savingThrows?.strength ?? false,
        dexterity: prev.savingThrows?.dexterity ?? false,
        constitution: prev.savingThrows?.constitution ?? false,
        intelligence: prev.savingThrows?.intelligence ?? false,
        wisdom: prev.savingThrows?.wisdom ?? false,
        charisma: prev.savingThrows?.charisma ?? false,
        [key]: value,
      };

      return {
        ...prev,
        savingThrows: mergedSavingThrows,
      };
    });
  };

  // Handle updating skills
  const handleSkillChange = (key: string, value: string) => {
    setCharacter((prev) => {
      if (!prev) return null;

      return {
        ...prev,
        skills: {
          ...prev.skills,
          [key]: value
        } as Skills
      };
    });
  };

  // Handle updating ability scores
  const handleAbilityScoreChange = (key: string, value: number) => {
    setCharacter((prev) =>
      prev
        ? {
          ...prev,
          abilityScores: {
            ...prev.abilityScores,
            [key]: value ?? 10, // Set to a default value if null or undefined
          },
        }
        : null
    );
  };

  const handleSpeedChange = (
    key: string,
    value: number,
    from: string = "Custom"
  ) => {
    setCharacter((prev) => {
      if (!prev) return null;

      const prevSpeed = prev.speed ?? {
        walk: { value: 30, from: "Base" },
      };

      const updatedSpeed = {
        ...prevSpeed,
        [key]: { value, from },
      };

      return {
        ...prev,
        speed: updatedSpeed,
      };
    });
  };

  const handleInventoryChange = (inventory: InventoryItem[]) => {
    setCharacter((prev) => (prev ? { ...prev, inventory } : null));
  };

  const handleCurrencyChange = (currency: Currency) => {
    setCharacter((prev) => (prev ? { ...prev, currency } : null));
  };


  const handleChange = (field: keyof Character, value: number | string) => {
    setCharacter((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const rollDice = (sides: number, modifier: number = 0, label: string = "") => {
    const baseRoll = Math.floor(Math.random() * sides) + 1;
    const total = baseRoll + modifier;
    const formatted =
      `${label ? label + ": " : ""}d${sides}` +
      `${modifier !== 0 ? ` ${modifier >= 0 ? "+" : ""}${modifier}` : ""}` +
      ` (${baseRoll}${modifier !== 0 ? ` ${modifier >= 0 ? "+" : ""} ${modifier}` : ""})` +
      ` = ${total}`;
    setRollResult(formatted);
  };

  return (
    <div className="flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-6">Character Details</h1>

      <div className="space-y-4">
        <input
          type="text"
          value={characterWithDefaults.name}
          onChange={(e) => handleChange("name", e.target.value as any)}
          className="flex mx-auto p-2 border border-gray-300 rounded-lg shadow-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex items-center justify-center gap-2">
          <label className="text-lg">Class:</label>
          <select
            value={character.characterClass}
            onChange={(e) => handleChange("characterClass", e.target.value)}
            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a class</option>
            {classOptions.map((charClass) => (
              <option key={charClass} value={charClass}>
                {charClass}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-center gap-2">
          <label className="text-lg">Level:</label>
          <input
            type="number"
            value={character.level}
            min={1}
            max={20}
            onChange={(e) => handleChange("level", parseInt(e.target.value, 10))}
            className="w-20 p-2 border border-gray-300 rounded-lg shadow-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-center gap-2">
          <label className="text-lg">Proficiency Bonus:</label>
          <span className="font-semibold text-xl">
            +{getProficiencyBonus(character.level)}
          </span>
        </div>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("coreStats")}
            className={`py-2 px-4 rounded-lg ${activeTab === "coreStats" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Core Stats
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`py-2 px-4 rounded-lg ${activeTab === "inventory" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Inventory
          </button>
          <button
            onClick={() => setActiveTab("bio")}
            className={`py-2 px-4 rounded-lg ${activeTab === "bio" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Bio
          </button>
          <button
            onClick={() => setActiveTab("spells")}
            className={`py-2 px-4 rounded-lg ${activeTab === "spells" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Spells
          </button>
        </div>

        {activeTab === "coreStats" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-8xl mx-auto">

            {/* Left Card */}
            <Card className="w-full">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-bold text-center mb-4">Ability Scores</h2>
                <div className="flex flex-col items-center">
                  {/* Ability Score Inputs */}
                  <AbilityScoreSection
                    abilityScores={characterWithDefaults.abilityScores}
                    setAbilityScore={handleAbilityScoreChange}
                    rollDice={rollDice}
                  />
                  <SavingThrowsSection
                    savingThrows={characterWithDefaults.savingThrows}
                    proficiencyBonus={proficiencyBonus}
                    setSavingThrows={handleSavingThrowChange}
                    abilityScores={characterWithDefaults.abilityScores}
                    rollDice={rollDice}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Center Card */}
            <Card className="w-full">
              <CardContent className="p-4 space-y-4">
                {/* HP */}
                <HPSection
                  maxHp={characterWithDefaults.maxHp} setMaxHp={(maxHp) => handleChange("maxHp", maxHp)}
                  hp={characterWithDefaults.hp} setHp={(hp) => handleChange("hp", hp)}
                  tempHp={characterWithDefaults.tempHp} setTempHp={(tempHp) => handleChange("tempHp", tempHp)}
                />
                <SpeedSection
                  speed={characterWithDefaults.speed}
                  setSpeed={handleSpeedChange}
                />
              </CardContent>
            </Card>

            {/* Right Card */}
            <SkillsSection
              skills={characterWithDefaults.skills}
              setSkills={handleSkillChange}
              abilityScores={characterWithDefaults.abilityScores}
              proficiencyBonus={proficiencyBonus}
              rollDice={rollDice}
            />
          </div>
        )}

        {activeTab === "inventory" && (
          <div className="w-full max-w-4xl mx-auto space-y-6">
            <CurrencySection
              currency={characterWithDefaults.currency}
              setCurrency={handleCurrencyChange}
            />
            <InventorySection
              inventory={characterWithDefaults.inventory}
              setInventory={handleInventoryChange}
            />
          </div>
        )}

        {activeTab === "bio" && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold text-center">Character Bio</h2>
              <p>Add your character's biography here.</p>
            </CardContent>
          </Card>
        )}

        {activeTab === "spells" && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold text-center">Character Spells</h2>
              <p>List your character's spells and their details here.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <DiceRoller
        rollDice={(sides) => rollDice(sides)}
        rollResult={rollResult}
      />

    </div>

  );
};

export default CharacterSheet;
