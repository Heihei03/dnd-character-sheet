import { useState, useCallback } from "react";
import {
  Action,
  ArmorClass,
  Character,
  CharacterClass,
  Condition,
  Currency,
  DeathSaves as DeathSavesType,
  Defenses,
  Feature,
  InventoryItem,
  Resource,
  SavingThrows,
  Sense,
  Skills,
  Spell,
  SpellSlot,
  ToolProficiency,
  Bio,
  RollEntry,
  CritRule,
  ActiveBonus,
  BonusTarget
} from "../types/character";
import {
  getEffectiveAbilityScores,
  getEffectiveArmorProficiencies,
  getEffectiveConditions,
  getEffectiveDefenses,
  getEffectiveLanguages,
  getEffectiveResources,
  getEffectiveSenses,
  getEffectiveSkills,
  getEffectiveSpeed,
  getEffectiveToolProficiencies,
  getEffectiveWeaponProficiencies,
  getEffectiveWeaponMasteries,
  getEffectiveBonuses,
  normalizeCharacter,
  parseDice,
  getDisplayFormula
} from "../utils/character-utils";

export const useCharacterSheet = (
  character: Character | null,
  setCharacter: React.Dispatch<React.SetStateAction<Character | null>>
) => {
  const [activeTab, setActiveTab] = useState<string>("inventory");
  const [focusedFeatureId, setFocusedFeatureId] = useState<string | null>(null);
  const [globalRollMode, setGlobalRollMode] = useState<'normal' | 'advantage' | 'disadvantage'>('normal');
  const [rollResult, setRollResult] = useState<string | null>(null);
  const [rollHistory, setRollHistory] = useState<RollEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const characterWithDefaults = character ? normalizeCharacter(character) : null;

  const handleNavigateToFeature = useCallback((featureId: string) => {
    setActiveTab("features");
    setFocusedFeatureId(featureId);
  }, []);

  // Early return if no character, but we still want to return the state
  if (!characterWithDefaults) {
    return {
      characterWithDefaults: null,
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
      handleNavigateToFeature,
      // ... we'll need placeholders for handlers if needed, but the UI usually checks for character
    };
  }

  const effectiveAbilityScores = getEffectiveAbilityScores(characterWithDefaults);
  const { skills: effectiveSkills, skillSources } = getEffectiveSkills(characterWithDefaults);
  const effectiveToolProficiencies = getEffectiveToolProficiencies(characterWithDefaults);
  const effectiveWeaponProficiencies = getEffectiveWeaponProficiencies(characterWithDefaults);
  const effectiveArmorProficiencies = getEffectiveArmorProficiencies(characterWithDefaults);
  const effectiveLanguages = getEffectiveLanguages(characterWithDefaults);
  const effectiveWeaponMasteries = getEffectiveWeaponMasteries(characterWithDefaults);

  const getProficiencyBonus = (level: number): number => {
    return Math.ceil((level) / 4) + 1;
  };

  const totalLevel = characterWithDefaults.classes.reduce((sum, cls) => sum + cls.level, 0);
  const proficiencyBonus = getProficiencyBonus(totalLevel);
  const effectiveResources = getEffectiveResources(characterWithDefaults, proficiencyBonus);
  const effectiveSpeed = getEffectiveSpeed(characterWithDefaults);
  const effectiveSenses = getEffectiveSenses(characterWithDefaults);
  const effectiveDefenses = getEffectiveDefenses(characterWithDefaults);
  const effectiveConditions = getEffectiveConditions(characterWithDefaults);

  const handleSavingThrowChange = (key: string, value: boolean) => {
    setCharacter((prev) => {
      if (!prev) return null;
      const mergedSavingThrows: SavingThrows = {
        strength: prev.savingThrows?.strength ?? false,
        dexterity: prev.savingThrows?.dexterity ?? false,
        constitution: prev.savingThrows?.constitution ?? false,
        intelligence: prev.savingThrows?.intelligence ?? false,
        wisdom: prev.savingThrows?.wisdom ?? false,
        charisma: prev.savingThrows?.charisma ?? false,
        [key]: value,
      };
      return { ...prev, savingThrows: mergedSavingThrows };
    });
  };

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

  const handleAbilityScoreChange = (key: string, value: number) => {
    setCharacter((prev) =>
      prev
        ? {
          ...prev,
          abilityScores: {
            ...prev.abilityScores,
            [key]: value ?? 10,
          },
        }
        : null
    );
  };

  const handleSpeedChange = (key: string, value: number, from: string = "Custom") => {
    setCharacter((prev) => {
      if (!prev) return null;
      const prevSpeed = prev.speed ?? { walk: { value: 30, from: "Base" } };
      const updatedSpeed = { ...prevSpeed, [key]: { value, from } };
      return { ...prev, speed: updatedSpeed };
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
      const manualActions = allActions.filter(a =>
        !a.fromWeapon && !a.fromFeature && !a.id.startsWith("weapon-") && !a.id.startsWith("feature-")
      );
      const weaponUpdates = allActions.filter(a => a.fromWeapon && a.id.startsWith("weapon-"));
      let newInventory = [...(prev.inventory || [])];
      let inventoryChanged = false;

      weaponUpdates.forEach(update => {
        const weaponId = update.id.replace("weapon-", "");
        newInventory = newInventory.map(item => {
          if (item.id === weaponId && item.weaponDetails) {
            inventoryChanged = true;
            let newProperties = [...(item.weaponDetails.properties || [])];
            if (update.versatileDice) {
              const vIdx = newProperties.findIndex(p => p.startsWith("Versatile"));
              if (vIdx >= 0) newProperties[vIdx] = `Versatile (${update.versatileDice})`;
              else newProperties.push(`Versatile (${update.versatileDice})`);
            }
            if (update.reach !== undefined) {
              if (update.reach === "10 ft") {
                if (!newProperties.includes("Reach")) newProperties.push("Reach");
              } else {
                newProperties = newProperties.filter(p => p !== "Reach");
              }
            }
            if (update.range) {
              const cleanedRange = update.range.replace(/\s*ft$/, "");
              const isRanged = item.weaponDetails.rangeType === "Ranged";
              const propertyPrefix = isRanged ? "Ammunition" : "Thrown";
              const rIdx = newProperties.findIndex(p => p.startsWith(propertyPrefix));
              if (rIdx >= 0) newProperties[rIdx] = `${propertyPrefix} (${cleanedRange})`;
              else if (cleanedRange !== "80/320" && cleanedRange !== "5") newProperties.push(`${propertyPrefix} (${cleanedRange})`);
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

  const handleUpdateBio = (field: keyof Bio, value: string) => {
    setCharacter(prev => {
      if (!prev) return null;
      return { ...prev, bio: { ...(prev.bio || {}), [field]: value } };
    });
  };

  const handleUpdateSpells = (spells: Spell[]) => setCharacter(prev => prev ? { ...prev, spells } : null);
  const handleUpdateSpellSlots = (spellSlots: SpellSlot[]) => setCharacter(prev => prev ? { ...prev, spellSlots } : null);

  const rollDice = (
    sides: number,
    modifier: number = 0,
    label: string = "",
    damageFormula?: string,
    damageType?: string,
    critRange?: number,
    critExtraDamage?: string,
    critRule?: CritRule,
    specificAdvantage?: boolean,
    specificDisadvantage?: boolean,
    extraAdvantage: number = 0,
    rollType?: BonusTarget
  ) => {
    const effectiveCritRange = critRange || characterWithDefaults.critRange || 20;
    let finalAdvantage = specificAdvantage || globalRollMode === 'advantage';
    let finalDisadvantage = specificDisadvantage || globalRollMode === 'disadvantage';
    if (finalAdvantage && finalDisadvantage) {
      finalAdvantage = false;
      finalDisadvantage = false;
    }
    const rolls: number[] = [];
    const baseRoll = Math.floor(Math.random() * sides) + 1;
    rolls.push(baseRoll);
    let resultRoll = baseRoll;
    if (sides === 20 && (finalAdvantage || finalDisadvantage)) {
      const secondaryRoll = Math.floor(Math.random() * sides) + 1;
      rolls.push(secondaryRoll);
      if (finalAdvantage) {
        resultRoll = Math.max(baseRoll, secondaryRoll);
        if (extraAdvantage > 0) {
          for (let i = 0; i < extraAdvantage; i++) {
            const extraRoll = Math.floor(Math.random() * sides) + 1;
            rolls.push(extraRoll);
            resultRoll = Math.max(resultRoll, extraRoll);
          }
        }
      } else {
        resultRoll = Math.min(baseRoll, secondaryRoll);
      }
    }
    
    // Apply Effective Bonuses
    let bonusModifier = 0;
    let bonusBreakdown = "";
    if (rollType) {
      const activeBonuses = getEffectiveBonuses(characterWithDefaults, rollType);
      activeBonuses.forEach(b => {
        const parsed = parseDice(b.bonus);
        if (parsed) {
          const bonusRolls: number[] = [];
          let bonusTotal = 0;
          for (let i = 0; i < parsed.count; i++) {
            const r = Math.floor(Math.random() * parsed.sides) + 1;
            bonusRolls.push(r);
            bonusTotal += r;
          }
          const totalWithMod = parsed.sign === "+" ? bonusTotal + parsed.mod : bonusTotal - parsed.mod;
          bonusModifier += totalWithMod;
          bonusBreakdown += ` + ${b.name}(${totalWithMod})`;
        } else {
          // Flat bonus
          const val = parseInt(b.bonus) || 0;
          bonusModifier += val;
          bonusBreakdown += ` + ${b.name}(${val >= 0 ? "+" : ""}${val})`;
        }
      });
    }

    const total = resultRoll + modifier + bonusModifier;
    let formula = `d${sides}${modifier !== 0 ? ` ${modifier >= 0 ? "+" : ""}${modifier}` : ""}`;
    if (sides === 20 && (finalAdvantage || finalDisadvantage)) {
      const advPrefix = finalAdvantage ? (extraAdvantage > 0 ? `ADV+${extraAdvantage}` : 'ADV') : 'DIS';
      formula = `${advPrefix} ${formula}`;
    }
    let breakdown = `(${rolls.join(", ")})`;
    if (modifier !== 0) breakdown += ` ${modifier >= 0 ? "+" : "-"} ${Math.abs(modifier)}`;
    if (bonusBreakdown) breakdown += bonusBreakdown;
    const formatted = `${label ? label + ": " : ""}${formula}${bonusModifier !== 0 ? ` (+bonuses)` : ""} ${breakdown} = ${total}`;
    setRollResult(formatted);
    const newEntry: RollEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      label: label || `d${sides} Roll`,
      formula,
      rolls,
      modifier,
      total,
      type: 'generic',
      damageFormula,
      damageType,
      critExtraDamage,
      critRule,
      formatted,
      isCritical: sides === 20 && resultRoll >= effectiveCritRange,
      isFumble: sides === 20 && resultRoll === 1
    };
    setRollHistory(prev => [...prev.slice(-49), newEntry]);
  };

  const rollDamage = (
    damageString: string,
    label: string = "",
    damageType?: string,
    isCritical: boolean = false,
    critExtraDamage?: string,
    ruleOverride?: CritRule
  ) => {
    if (!damageString) return;
    const critRule = ruleOverride || characterWithDefaults.critRule || 'double-dice';
    const mainDice = parseDice(damageString);
    if (!mainDice) {
      const formatted = `${label ? label + (isCritical ? " (CRIT)" : "") + ": " : ""}${damageString} ${damageType ? damageType : ""}`.trim();
      setRollResult(formatted);
      return;
    }
    let total = 0;
    const rolls: number[] = [];
    const { count, sides, sign, mod } = mainDice;
    const rollDicePool = (c: number, s: number) => {
      for (let i = 0; i < c; i++) {
        const r = Math.floor(Math.random() * s) + 1;
        rolls.push(r);
        total += r;
      }
    };
    if (isCritical) {
      if (critRule === 'double-dice') rollDicePool(count * 2, sides);
      else if (critRule === 'max-plus-roll') {
        const maxVal = count * sides;
        total += maxVal;
        rolls.push(maxVal); 
        rollDicePool(count, sides);
      } else if (critRule === 'double-total') {
        rollDicePool(count, sides);
        total *= 2;
      }
      if (critExtraDamage) {
        const extra = parseDice(critExtraDamage);
        if (extra) rollDicePool(extra.count, extra.sides);
      }
    } else rollDicePool(count, sides);

    const modifierTotal = sign === "-" ? -mod : mod;
    total += modifierTotal;
    const displayFormula = getDisplayFormula(damageString, isCritical, critRule, critExtraDamage);
    const critLabel = isCritical ? " (CRIT)" : "";
    
    // Apply Effective Bonuses for Damage
    let bonusModifier = 0;
    let bonusBreakdown = "";
    const activeBonuses = getEffectiveBonuses(characterWithDefaults, 'damage');
    activeBonuses.forEach(b => {
      const parsed = parseDice(b.bonus);
      if (parsed) {
          const bonusRolls: number[] = [];
          let bonusTotal = 0;
          for (let i = 0; i < parsed.count; i++) {
            const r = Math.floor(Math.random() * parsed.sides) + 1;
            bonusRolls.push(r);
            bonusTotal += r;
          }
          const totalWithMod = parsed.sign === "+" ? bonusTotal + parsed.mod : bonusTotal - parsed.mod;
          bonusModifier += totalWithMod;
          bonusBreakdown += ` + ${b.name}(${totalWithMod})`;
        } else {
          // Flat bonus
          const val = parseInt(b.bonus) || 0;
          bonusModifier += val;
          bonusBreakdown += ` + ${b.name}(${val >= 0 ? "+" : ""}${val})`;
        }
      });

    let totalWithBonuses = total + bonusModifier;

    let breakdown = `(${rolls.join(" + ")})${modifierTotal !== 0 ? ` ${sign === "+" ? "+" : "-"} ${mod}` : ""}`;
    if (isCritical && critRule === 'double-total') {
      const diceSum = rolls.length > 1 ? `(${rolls.join(" + ")})` : rolls[0];
      breakdown = `(${diceSum} × 2)${modifierTotal !== 0 ? ` ${sign === "+" ? "+" : "-"} ${mod}` : ""}`;
    }
    if (bonusBreakdown) breakdown += bonusBreakdown;

    const formatted = `${label ? label + critLabel + ": " : ""}${displayFormula}${bonusModifier !== 0 ? ` (+bonuses)` : ""} ${breakdown} = ${totalWithBonuses} ${damageType ? damageType : ""}`.trim();
    setRollResult(formatted);
    const newEntry: RollEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      label: (label || "Damage Roll") + critLabel,
      formula: isCritical ? `${displayFormula} (Crit)` : damageString,
      rolls,
      modifier: modifierTotal + bonusModifier,
      total: totalWithBonuses,
      type: 'damage',
      damageType,
      isCritical,
      critRule,
      critExtraDamage,
      formatted
    };
    setRollHistory(prev => [...prev.slice(-49), newEntry]);
  };

  const clearHistory = () => {
    setRollHistory([]);
    setRollResult(null);
  };

  const handleUpdateResources = (resources: Resource[]) => {
    setCharacter(prev => {
      if (!prev) return null;
      const resourcesToSave = resources.map(r => ({
        id: r.id,
        name: r.name,
        value: r.value,
        max: r.max,
        regain: r.regain,
        regainAmount: r.regainAmount
      }));
      return { ...prev, resources: resourcesToSave };
    });
  };

  const handleUpdateActiveBonuses = (activeBonuses: ActiveBonus[]) => {
    setCharacter(prev => (prev ? { ...prev, activeBonuses } : null));
  };

  return {
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
    effectiveWeaponMasteries,
    effectiveLanguages,
    proficiencyBonus,
    totalLevel,
    effectiveResources,
    effectiveSpeed,
    effectiveSenses,
    effectiveDefenses,
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
  };
};
