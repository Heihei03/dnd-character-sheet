"use client";

import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import HPSection from "./HP";
import AbilityScoreSection from "./AbilityScoreSection";
import SpeedSection from "./SpeedSection";
import DiceRoller from "./DiceRoller";
import CurrencySection from "./CurrencySection";
import DeathSaves from "./DeathSaves";
import ProficienciesLanguagesSection from "./ProficienciesLanguagesSection";
import ToolChecksSection from "./ToolChecksSection";
import FeaturesSection from "./FeaturesSection";
import ResourcesSection from "./ResourcesSection";
import { TOOL_DATA } from "../data/tools";
import { Character, SavingThrows, Skills, InventoryItem, Currency, CharacterClass, DeathSaves as DeathSavesType, ArmorClass, ToolProficiency, Action, Feature, Sense, Defenses, Spell, SpellSlot, Resource, Condition } from "../types/character";
import SavingThrowsSection from "./SavingThrowsSection";
import SkillsSection from "./SkillsSection";
import InventorySection from "./InventorySection";
import ArmorClassSection from "./ArmorClassSection";
import InitiativeSection from "./InitiativeSection";
import CharacterHeader from "./CharacterHeader";
import SensesSection from "./SensesSection";
import DefensesSection from "./DefensesSection";
import ActionsSection from "./ActionsSection";
import SpellsSection from "./SpellsSection";
import ConditionsSection from "./ConditionsSection";
import { getEffectiveSenses, getEffectiveDefenses, getEffectiveActions, getAllActiveFeatures, getEffectiveAbilityScores, getEffectiveSpells, getEffectiveResources, getEffectiveConditions, getEffectiveSkills, getEffectiveToolProficiencies, getEffectiveWeaponProficiencies, getEffectiveArmorProficiencies, getEffectiveLanguages } from "../utils/character-utils";

interface CharacterSheetProps {
  character: Character | null;
  setCharacter: React.Dispatch<React.SetStateAction<Character | null>>;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ character, setCharacter }) => {
  const [activeTab, setActiveTab] = useState<string>("inventory");
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
    initiative: character.initiative ?? {
      miscBonus: 0,
      useJackOfAllTrades: false,
      showDexTiebreaker: false,
    },
    weaponProficiencies: character.weaponProficiencies ?? [],
    armorProficiencies: character.armorProficiencies ?? [],
    toolProficiencies: (character.toolProficiencies ?? []).map((tool: any) => {
      if (typeof tool === "string") {
        const toolData = TOOL_DATA[tool];
        return {
          name: tool,
          ability: toolData?.ability || "Intelligence",
          level: "proficient"
        } as ToolProficiency;
      }
      return tool;
    }),
    languages: character.languages ?? ["Common"],
    features: (character.features ?? []).map((f: any) => ({
      ...f,
      modifiers: f.modifiers ?? (f.tags ?? []).map((tag: string) => ({
        id: `migrated-${tag}-${Math.random().toString(36).substr(2, 9)}`,
        type: "Other",
        subType: tag,
        value: ""
      }))
    })),
    senses: character.senses ?? [],
    defenses: character.defenses ?? {
      resistances: [],
      vulnerabilities: [],
      immunities: []
    },
    actions: character.actions ?? [],
    spells: character.spells ?? [],
    spellSlots: character.spellSlots ?? [],
    conditions: character.conditions ?? [],
    species: character.species ?? "",
    subSpecies: character.subSpecies ?? "",
    background: character.background ?? "",
    exp: character.exp ?? 0,
  };

  const effectiveAbilityScores = getEffectiveAbilityScores(characterWithDefaults);
  const effectiveSkills = getEffectiveSkills(characterWithDefaults);
  const effectiveToolProficiencies = getEffectiveToolProficiencies(characterWithDefaults);
  const effectiveWeaponProficiencies = getEffectiveWeaponProficiencies(characterWithDefaults);
  const effectiveArmorProficiencies = getEffectiveArmorProficiencies(characterWithDefaults);
  const effectiveLanguages = getEffectiveLanguages(characterWithDefaults);


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

  const handleInitiativeChange = (initiative: any) => {
    setCharacter((prev) => (prev ? { ...prev, initiative } : null));
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

  const handleNameChange = (value: string) => handleChange("name", value);
  const handleSpeciesChange = (value: string) => handleChange("species", value);
  const handleSubSpeciesChange = (value: string) => handleChange("subSpecies", value);
  const handleBackgroundChange = (value: string) => handleChange("background", value);
  const handleExpChange = (value: number | undefined) => handleChange("exp", value);

  const handleUpdateSenses = (senses: Sense[]) => {
    setCharacter(prev => prev ? { ...prev, senses } : null);
  };

  const handleUpdateDefenses = (defenses: Defenses) => {
    setCharacter(prev => prev ? { ...prev, defenses } : null);
  };

  const handleUpdateConditions = (conditions: Condition[]) => {
    setCharacter(prev => prev ? { ...prev, conditions } : null);
  };

  const handleUpdateItemFeature = (updatedFeature: Feature) => {
    setCharacter(prev => {
      if (!prev) return null;
      const itemId = updatedFeature.sourceItemId;
      if (!itemId) return prev;

      const newInventory = (prev.inventory || []).map(item => {
        if (item.id === itemId) {
          const newFeatures = (item.features || []).map(f =>
            f.id === updatedFeature.id ? updatedFeature : f
          );
          return { ...item, features: newFeatures };
        }
        return item;
      });

      return { ...prev, inventory: newInventory };
    });
  };

  const handleDeleteItemFeature = (featureId: string, itemId: string) => {
    setCharacter(prev => {
      if (!prev) return null;
      if (!itemId) return prev;

      const newInventory = (prev.inventory || []).map(item => {
        if (item.id === itemId) {
          const newFeatures = (item.features || []).filter(f => f.id !== featureId);
          return { ...item, features: newFeatures };
        }
        return item;
      });

      return { ...prev, inventory: newInventory };
    });
  };

  const handleUpdateActions = (allActions: Action[]) => {
    setCharacter(prev => {
      if (!prev) return null;

      // 1. Separate manual actions from weapon updates
      const manualActions = allActions.filter(a =>
        !a.fromWeapon &&
        !a.fromFeature &&
        !a.id.startsWith("weapon-") &&
        !a.id.startsWith("feature-")
      );
      const weaponUpdates = allActions.filter(a => a.fromWeapon && a.id.startsWith("weapon-"));

      // 2. Update inventory if any weapon-derived actions were changed
      let newInventory = [...(prev.inventory || [])];
      let inventoryChanged = false;

      weaponUpdates.forEach(update => {
        const weaponId = update.id.replace("weapon-", "");
        newInventory = newInventory.map(item => {
          if (item.id === weaponId && item.weaponDetails) {
            inventoryChanged = true;

            // Handle Versatile property update if versatileDice changed
            let newProperties = [...(item.weaponDetails.properties || [])];
            if (update.versatileDice) {
              const vIdx = newProperties.findIndex(p => p.startsWith("Versatile"));
              if (vIdx >= 0) {
                newProperties[vIdx] = `Versatile (${update.versatileDice})`;
              } else {
                newProperties.push(`Versatile (${update.versatileDice})`);
              }
            }

            // Handle Reach property update
            if (update.reach !== undefined) {
              if (update.reach === "10 ft") {
                if (!newProperties.includes("Reach")) newProperties.push("Reach");
              } else {
                newProperties = newProperties.filter(p => p !== "Reach");
              }
            }

            // Handle Range property update (Thrown or Ammunition)
            if (update.range) {
              const cleanedRange = update.range.replace(/\s*ft$/, "");
              const isRanged = item.weaponDetails.rangeType === "Ranged";
              const propertyPrefix = isRanged ? "Ammunition" : "Thrown";
              const rIdx = newProperties.findIndex(p => p.startsWith(propertyPrefix));

              if (rIdx >= 0) {
                newProperties[rIdx] = `${propertyPrefix} (${cleanedRange})`;
              } else if (cleanedRange !== "80/320" && cleanedRange !== "5") {
                newProperties.push(`${propertyPrefix} (${cleanedRange})`);
              }
            }

            return {
              ...item,
              name: update.name,
              weaponDetails: {
                ...item.weaponDetails,
                damageDice: update.damageDice || item.weaponDetails.damageDice,
                damageType: update.damageType || item.weaponDetails.damageType,
                properties: newProperties
              }
            };
          }
          return item;
        });
      });

      return {
        ...prev,
        actions: manualActions,
        inventory: inventoryChanged ? newInventory : prev.inventory
      };
    });
  };

  const handleUpdateSpells = (spells: Spell[]) => {
    setCharacter(prev => prev ? { ...prev, spells } : null);
  };

  const handleUpdateSpellSlots = (spellSlots: SpellSlot[]) => {
    setCharacter(prev => prev ? { ...prev, spellSlots } : null);
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

  const rollDamage = (damageString: string, label: string = "", damageType?: string) => {
    if (!damageString) return;

    const match = damageString.trim().match(/^(\d+)[dD](\d+)(?:\s*([+-])\s*(\d+))?/);
    if (!match) {
      setRollResult(`${label ? label + ": " : ""} ${damageString} ${damageType ? damageType : ""}`.trim());
      return;
    }

    const count = parseInt(match[1], 10);
    const sides = parseInt(match[2], 10);
    const sign = match[3];
    const mod = match[4] ? parseInt(match[4], 10) : 0;

    let total = 0;
    const rolls = [];
    for (let i = 0; i < count; i++) {
      const r = Math.floor(Math.random() * sides) + 1;
      total += r;
      rolls.push(r);
    }

    let modifierTotal = 0;
    if (sign && mod) {
      modifierTotal = sign === "-" ? -mod : mod;
      total += modifierTotal;
    }

    const formatted = `${label ? label + ": " : ""}${damageString} (${rolls.join(" + ")}${modifierTotal !== 0 ? ` ${sign} ${mod}` : ""}) = ${total} ${damageType ? damageType : ""}`.trim();
    setRollResult(formatted);
  };

  const handleUpdateResources = (resources: Resource[]) => {
    setCharacter(prev => {
      if (!prev) return null;
      // Save values for all resources by name to persist them
      // We map to a clean version to avoid persisting dynamic flags like fromFeature permanently if not needed
      const resourcesToSave = resources.map(r => ({
        id: r.id,
        name: r.name,
        value: r.value,
        max: r.max,
        regain: r.regain
      }));
      return { ...prev, resources: resourcesToSave };
    });
  };

  const effectiveResources = getEffectiveResources(characterWithDefaults, proficiencyBonus);

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
        />
      </div>

      <div className="space-y-4">


        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full max-w-screen-2xl mx-auto">

          {/* Left Column */}
          <div className="space-y-6 md:col-span-3">
            <Card className="w-full">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start w-full overflow-hidden">
                  <div className="flex-1 pr-2 border-r border-gray-100 dark:border-gray-800 flex flex-col items-center">
                    <div className="flex items-center justify-center border-b pb-2 mb-2 w-full">
                      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center">Ability Scores</h2>
                    </div>
                    <AbilityScoreSection
                      abilityScores={characterWithDefaults.abilityScores}
                      effectiveAbilityScores={effectiveAbilityScores}
                      setAbilityScore={handleAbilityScoreChange}
                      rollDice={rollDice}
                    />
                  </div>
                  <div className="flex-1 pl-2 flex flex-col items-center">
                    <div className="flex items-center justify-center border-b pb-2 mb-2 w-full">
                      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center">Saving Throws</h2>
                    </div>
                    <SavingThrowsSection
                      character={characterWithDefaults}
                      proficiencyBonus={proficiencyBonus}
                      setSavingThrows={handleSavingThrowChange}
                      abilityScores={effectiveAbilityScores}
                      rollDice={rollDice}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <SkillsSection
              character={characterWithDefaults}
              skills={effectiveSkills}
              setSkills={handleSkillChange}
              abilityScores={effectiveAbilityScores}
              proficiencyBonus={proficiencyBonus}
              rollDice={rollDice}
            />
            <ToolChecksSection
              toolProficiencies={effectiveToolProficiencies}
              onUpdate={(value) => handleChange("toolProficiencies", value)}
              abilityScores={effectiveAbilityScores}
              proficiencyBonus={proficiencyBonus}
              rollDice={rollDice}
            />
            <ProficienciesLanguagesSection
              weaponProficiencies={effectiveWeaponProficiencies}
              armorProficiencies={effectiveArmorProficiencies}
              toolProficiencies={effectiveToolProficiencies}
              languages={effectiveLanguages}
              onUpdate={(field, value) => handleChange(field as keyof Character, value)}
            />
          </div>

          {/* Center Column - Functional Tabs */}
          <div className="space-y-6 md:col-span-6">
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
                  className={`py-1.5 px-3 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id
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
                  currency={characterWithDefaults.currency}
                  setCurrency={handleCurrencyChange}
                />
                <InventorySection
                  inventory={characterWithDefaults.inventory}
                  setInventory={handleInventoryChange}
                  resources={effectiveResources}
                  onUpdateResources={handleUpdateResources}
                />
              </div>
            )}

            {activeTab === "spells" && (
              <SpellsSection
                classes={characterWithDefaults.classes || []}
                spells={getEffectiveSpells(characterWithDefaults)}
                spellSlots={characterWithDefaults.spellSlots || []}
                onUpdateSpells={handleUpdateSpells}
                onUpdateSpellSlots={handleUpdateSpellSlots}
                abilityScores={effectiveAbilityScores}
                proficiencyBonus={proficiencyBonus}
              />
            )}

            {activeTab === "features" && (
              <FeaturesSection
                features={characterWithDefaults.features}
                itemFeatures={getAllActiveFeatures(characterWithDefaults).filter((f: Feature) => f.origin === "Item")}
                resources={effectiveResources}
                onUpdate={(value) => handleChange("features", value)}
                onUpdateItemFeature={handleUpdateItemFeature}
                onDeleteItemFeature={handleDeleteItemFeature}
                onUpdateResources={handleUpdateResources}
                classes={characterWithDefaults.classes}
                species={characterWithDefaults.species}
                subSpecies={characterWithDefaults.subSpecies}
                background={characterWithDefaults.background}
              />
            )}

            {activeTab === "actions" && (
              <ActionsSection
                actions={getEffectiveActions(characterWithDefaults)}
                onUpdate={handleUpdateActions}
                abilityScores={effectiveAbilityScores}
                proficiencyBonus={getProficiencyBonus(characterWithDefaults.classes.reduce((sum, cls) => sum + cls.level, 0))}
                totalLevel={totalLevel}
                rollDice={rollDice}
                rollDamage={rollDamage}
                resources={effectiveResources}
                onUpdateResources={handleUpdateResources}
              />
            )}

            {activeTab === "bio" && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-2xl font-bold text-center">Character Bio</h2>
                  <p className="text-gray-500 italic text-center">Your character's history and personality.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="md:col-span-3">
            <Card className="w-full">
              <CardContent className="p-4 space-y-4">
                <InitiativeSection
                  character={characterWithDefaults}
                  dexModifier={Math.floor(((effectiveAbilityScores.dexterity ?? 10) - 10) / 2)}
                  proficiencyBonus={proficiencyBonus}
                  onUpdate={handleInitiativeChange}
                  rollDice={rollDice}
                  dexScore={effectiveAbilityScores.dexterity ?? 10}
                />
                <ArmorClassSection
                  armorClass={characterWithDefaults.armorClass}
                  setArmorClass={handleArmorClassChange}
                  abilityScores={effectiveAbilityScores}
                />
                {/* HP */}
                <HPSection
                  maxHp={characterWithDefaults.maxHp} setMaxHp={(maxHp) => handleChange("maxHp", maxHp)}
                  hp={characterWithDefaults.hp} setHp={(hp) => handleChange("hp", hp)}
                  tempHp={characterWithDefaults.tempHp} setTempHp={(tempHp) => handleChange("tempHp", tempHp)}
                  classes={characterWithDefaults.classes}
                  abilityScores={effectiveAbilityScores}
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
                <SensesSection
                  senses={getEffectiveSenses(characterWithDefaults)}
                  onUpdateSenses={handleUpdateSenses}
                />
                <DefensesSection
                  defenses={getEffectiveDefenses(characterWithDefaults)}
                  onUpdateDefenses={handleUpdateDefenses}
                />
                <ConditionsSection
                  conditions={getEffectiveConditions(characterWithDefaults)}
                  onUpdateConditions={handleUpdateConditions}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <DiceRoller
        rollDice={(sides) => rollDice(sides)}
        rollResult={rollResult}
      />

    </div>

  );
};

export default CharacterSheet;
