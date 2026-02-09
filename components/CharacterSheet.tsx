"use client";

import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import HPSection from "./HP";
import AbilityScoreSection from "./AbilityScoreSection";
import SpeedSection from "./SpeedSection";
import DiceRoller from "./DiceRoller";
import { classOptions } from "../utils/constants";
import CurrencySection from "./CurrencySection";
import DeathSaves from "./DeathSaves";
import { Character, SavingThrows, Skills, InventoryItem, Currency, CharacterClass, DeathSaves as DeathSavesType, ArmorClass } from "../types/character";
import SavingThrowsSection from "./SavingThrowsSection";
import SkillsSection from "./SkillsSection";
import InventorySection from "./InventorySection";
import ArmorClassSection from "./ArmorClassSection";

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
    classes: character.classes ?? [{ name: "Fighter", level: 1 }],
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
    deathSaves: character.deathSaves ?? {
      successes: 0,
      failures: 0,
    },
    armorClass: character.armorClass ?? {
      baseAC: 10,
      hasDexBonus: true,
      shieldBonus: 0,
      miscBonus: 0,
    },
  };


  // Function to calculate proficiency bonus based on level
  const getProficiencyBonus = (level: number): number => {
    return Math.ceil((level) / 4) + 1;
  };

  // Calculate total level
  const totalLevel = characterWithDefaults.classes.reduce((sum, cls) => sum + cls.level, 0);

  // Calculate proficiency bonus
  const proficiencyBonus = getProficiencyBonus(totalLevel);

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
    setCharacter((prev) => {
      if (!prev) return null;

      const equippedArmor = inventory.find(item => item.equipped && item.itemType === "armor" && item.armorDetails);
      const equippedShield = inventory.find(item => item.equipped && item.itemType === "shield" && item.armorDetails);

      const updatedArmorClass: ArmorClass = prev.armorClass ?? {
        baseAC: 10,
        hasDexBonus: true,
        shieldBonus: 0,
        miscBonus: 0
      };

      if (equippedArmor && equippedArmor.armorDetails) {
        updatedArmorClass.baseAC = equippedArmor.armorDetails.ac;
        updatedArmorClass.hasDexBonus = equippedArmor.armorDetails.dexBonus;
        updatedArmorClass.dexCap = equippedArmor.armorDetails.dexCap;
      } else {
        // Only reset if character HAD armor equipped before but doesn't now
        const hadArmor = (prev.inventory ?? []).some(item => item.equipped && item.itemType === "armor");
        if (hadArmor) {
          updatedArmorClass.baseAC = 10;
          updatedArmorClass.hasDexBonus = true;
          updatedArmorClass.dexCap = undefined;
        }
      }

      if (equippedShield && equippedShield.armorDetails) {
        updatedArmorClass.shieldBonus = equippedShield.armorDetails.ac;
      } else {
        // Only reset if character HAD shield equipped before but doesn't now
        const hadShield = (prev.inventory ?? []).some(item => item.equipped && item.itemType === "shield");
        if (hadShield) {
          updatedArmorClass.shieldBonus = 0;
        }
      }

      return { ...prev, inventory, armorClass: updatedArmorClass };
    });
  };

  const handleCurrencyChange = (currency: Currency) => {
    setCharacter((prev) => (prev ? { ...prev, currency } : null));
  };

  const handleDeathSavesChange = (deathSaves: DeathSavesType) => {
    setCharacter((prev) => (prev ? { ...prev, deathSaves } : null));
  };

  const handleArmorClassChange = (armorClass: ArmorClass) => {
    setCharacter((prev) => (prev ? { ...prev, armorClass } : null));
  };


  const handleClassChange = (index: number, field: keyof CharacterClass, value: any) => {
    setCharacter((prev) => {
      if (!prev) return null;
      const currentClasses = prev.classes ?? [
        { name: (prev as any).characterClass ?? "Fighter", level: (prev as any).level ?? 1 }
      ];
      const newClasses = [...currentClasses];
      newClasses[index] = { ...newClasses[index], [field]: value };
      return { ...prev, classes: newClasses };
    });
  };

  const addClass = () => {
    setCharacter((prev) => {
      if (!prev) return null;
      const currentClasses = prev.classes ?? [
        { name: (prev as any).characterClass ?? "Fighter", level: (prev as any).level ?? 1 }
      ];
      return {
        ...prev,
        classes: [...currentClasses, { name: "Fighter", level: 1 }]
      };
    });
  };

  const removeClass = (index: number) => {
    setCharacter((prev) => {
      if (!prev) return prev;
      const currentClasses = prev.classes ?? [
        { name: (prev as any).characterClass ?? "Fighter", level: (prev as any).level ?? 1 }
      ];
      if (currentClasses.length <= 1) return prev;
      return {
        ...prev,
        classes: currentClasses.filter((_, i) => i !== index)
      };
    });
  };

  const handleChange = (field: keyof Character, value: any) => {
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

        <div className="space-y-4 w-full max-w-md mx-auto">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-4">
              <label className="text-lg font-semibold">Classes</label>
              <button
                onClick={addClass}
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                title="Add Class"
              >
                + Add Class
              </button>
            </div>
            {characterWithDefaults.classes.map((cls, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200 shadow-sm relative group">
                <select
                  value={cls.name}
                  onChange={(e) => handleClassChange(index, "name", e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {classOptions.map((charClass) => (
                    <option key={charClass} value={charClass}>
                      {charClass}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1">
                  <label className="text-xs text-gray-500">Lvl</label>
                  <input
                    type="number"
                    value={cls.level}
                    min={1}
                    max={20}
                    onChange={(e) => handleClassChange(index, "level", parseInt(e.target.value, 10))}
                    className="w-16 p-2 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                {characterWithDefaults.classes.length > 1 && (
                  <button
                    onClick={() => removeClass(index)}
                    className="text-red-500 hover:text-red-700 font-bold px-2"
                    title="Remove Class"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <label className="text-lg">Total Level:</label>
            <span className="font-semibold text-xl">{totalLevel}</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-lg text-gray-500">Proficiency Bonus:</label>
            <span className="font-semibold text-xl text-gray-600">
              +{proficiencyBonus}
            </span>
          </div>
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
                <ArmorClassSection
                  armorClass={characterWithDefaults.armorClass}
                  setArmorClass={handleArmorClassChange}
                  abilityScores={characterWithDefaults.abilityScores}
                />
                {/* HP */}
                <HPSection
                  maxHp={characterWithDefaults.maxHp} setMaxHp={(maxHp) => handleChange("maxHp", maxHp)}
                  hp={characterWithDefaults.hp} setHp={(hp) => handleChange("hp", hp)}
                  tempHp={characterWithDefaults.tempHp} setTempHp={(tempHp) => handleChange("tempHp", tempHp)}
                  classes={characterWithDefaults.classes}
                  abilityScores={characterWithDefaults.abilityScores}
                  onUpdateClasses={(classes) => handleChange("classes", classes)}
                  rollDice={rollDice}
                />
                <DeathSaves
                  deathSaves={characterWithDefaults.deathSaves}
                  onUpdate={handleDeathSavesChange}
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
