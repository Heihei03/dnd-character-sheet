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
  BonusTarget,
  RollDamageFunc,
  Summon
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
  getDisplayFormula,
  resolveRollExpression,
  evaluateRoll
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
      effectiveAbilityScores: {} as any,
      effectiveSkills: {} as any,
      skillSources: {} as any,
      effectiveToolProficiencies: [] as any,
      effectiveWeaponProficiencies: [] as any,
      effectiveArmorProficiencies: [] as any,
      effectiveWeaponMasteries: [] as any,
      effectiveLanguages: [] as any,
      proficiencyBonus: 2,
      totalLevel: 1,
      effectiveResources: [] as any,
      effectiveSpeed: {} as any,
      effectiveSenses: [] as any,
      effectiveDefenses: {} as any,
      effectiveConditions: [] as any,
      handleSavingThrowChange: () => {},
      handleSkillChange: () => {},
      handleAbilityScoreChange: () => {},
      handleSpeedChange: () => {},
      handleInventoryChange: () => {},
      handleCurrencyChange: () => {},
      handleDeathSavesChange: () => {},
      handleArmorClassChange: () => {},
      handleInitiativeChange: () => {},
      handleClassChange: () => {},
      addClass: () => {},
      removeClass: () => {},
      handleChange: () => {},
      handleUpdateSenses: () => {},
      handleUpdateDefenses: () => {},
      handleUpdateConditions: () => {},
      handleUpdateItemFeature: () => {},
      handleDeleteItemFeature: () => {},
      handleUpdateActions: () => {},
      handleUpdateBio: () => {},
      handleUpdateSpells: () => {},
      handleUpdateSpellSlots: () => {},
      rollDice: () => {},
      rollDamage: () => {},
      clearHistory: () => {},
      handleUpdateResources: () => {},
      handleUpdateActiveBonuses: () => {},
      handleUpdateSummons: () => {},
      handleUpdateSummonStatblocks: () => {},
      handleAdjustHP: () => {},
      handleAdjustSummonHP: () => {},
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
    setCharacter((prev) => {
      if (!prev) return null;
      let finalValue = value;
      
      // Ensure numeric fields are actually numbers
      if (field === "hp" || field === "maxHp" || field === "tempHp" || field === "exp") {
        finalValue = Number(value);
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

  const handleAdjustHP = (amount: number, isDamage: boolean) => {
    setCharacter((prev) => {
      if (!prev) return null;
      const currentHp = Number(prev.hp ?? 0);
      const currentTemp = Number(prev.tempHp ?? 0);
      const maxHp = Number(prev.maxHp ?? 0);
      const adjustment = Number(amount);
      
      let next = { ...prev };

      if (isDamage) {
        if (currentTemp > 0) {
          const absorbed = Math.min(currentTemp, adjustment);
          next.tempHp = currentTemp - absorbed;
          const remainingDamage = adjustment - absorbed;
          if (remainingDamage > 0) {
            next.hp = Math.max(0, currentHp - remainingDamage);
          }
        } else {
          next.hp = Math.max(0, currentHp - adjustment);
        }
      } else {
        // Healing
        next.hp = Math.min(maxHp, currentHp + adjustment);
      }
      
      return next;
    });
  };

  const handleAdjustSummonHP = (summonId: string, amount: number, isDamage: boolean) => {
    setCharacter((prev) => {
      if (!prev || !prev.summons) return prev;
      const newSummons = prev.summons.map(s => {
        if (s.id !== summonId) return s;
        
        const nextHp = { ...s.hp };
        if (isDamage) {
          const currentTemp = Number(s.hp.temp ?? 0);
          const currentHp = Number(s.hp.current ?? 0);
          const damageAmount = Number(amount);
          
          if (currentTemp > 0) {
            const absorbed = Math.min(currentTemp, damageAmount);
            nextHp.temp = currentTemp - absorbed;
            const remainingDamage = damageAmount - absorbed;
            nextHp.current = Math.max(0, currentHp - remainingDamage);
          } else {
            nextHp.current = Math.max(0, currentHp - damageAmount);
          }
        } else {
          // Healing
          const healAmount = Number(amount);
          nextHp.current = Math.min(s.hp.max, s.hp.current + healAmount);
        }
        
        return { ...s, hp: nextHp };
      });
      return { ...prev, summons: newSummons };
    });
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
        !a.fromWeapon && !a.fromFeature && !a.id.startsWith("weapon-") && !a.id.startsWith("feature-") && !a.id.startsWith("spell-")
      );
      const weaponUpdates = allActions.filter(a => a.fromWeapon && a.id.startsWith("weapon-"));
      const spellUpdates = allActions.filter(a => a.id.startsWith("spell-"));
      
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

      let updatedSpells = [...(prev.spells || [])];
      
      // Handle deleted spells
      const existingSpellIds = (prev.spells || []).map(s => `spell-${s.id}`);
      const remainingSpellIds = new Set(spellUpdates.map(a => a.id));
      const spellsToDelete = existingSpellIds.filter(id => !remainingSpellIds.has(id));
      
      if (spellsToDelete.length > 0) {
        const toDeleteIds = new Set(spellsToDelete.map(id => id.replace("spell-", "")));
        updatedSpells = updatedSpells.filter(s => !toDeleteIds.has(s.id));
      }

      // Handle modified spells
      updatedSpells = updatedSpells.map(spell => {
        const update = spellUpdates.find(u => u.id === `spell-${spell.id}`);
        if (update) {
          return {
            ...spell,
            name: update.name,
            castingTime: update.activation || spell.castingTime,
            range: update.range || spell.range,
            damage: update.damageDice || update.damage || spell.damage,
            damageType: update.damageType || spell.damageType,
            healing: update.healing || spell.healing,
            description: update.description ? update.description.replace(/^Level:[\s\S]*?\nRange:[\s\S]*?\nDuration:[\s\S]*?\n\n/, "") : spell.description,
            spellcastingAbility: update.attackAbility || spell.spellcastingAbility,
            attackBonus: update.attackBonus !== undefined ? update.attackBonus : spell.attackBonus,
            addSpellcastingModifier: update.addSpellcastingModifier !== undefined ? update.addSpellcastingModifier : spell.addSpellcastingModifier,
            effect: update.effect !== undefined ? update.effect : spell.effect,
            passEffect: update.passEffect !== undefined ? update.passEffect : spell.passEffect,
          };
        }
        return spell;
      });

      return {
        ...prev,
        actions: manualActions,
        spells: updatedSpells,
        inventory: inventoryChanged ? newInventory : prev.inventory
      };
    });
  };

  const handleUpdateBio = (field: keyof Bio, value: any) => {
    setCharacter(prev => {
      if (!prev) return null;
      return { ...prev, bio: { ...(prev.bio || {}), [field]: value } };
    });
  };

  const handleUpdateSpells = (spells: Spell[]) => setCharacter(prev => prev ? { ...prev, spells } : null);
  const handleUpdateSpellSlots = (spellSlots: SpellSlot[]) => setCharacter(prev => prev ? { ...prev, spellSlots } : null);

  const rollDice = (
    sides: number,
    count: number = 1,
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
    let resultRoll = 0;

    // Handle advantage/disadvantage only for single d20 rolls
    if (sides === 20 && count === 1 && (finalAdvantage || finalDisadvantage)) {
      const baseRoll = Math.floor(Math.random() * sides) + 1;
      rolls.push(baseRoll);
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
    } else {
      // Normal roll(s)
      for (let i = 0; i < count; i++) {
        const r = Math.floor(Math.random() * sides) + 1;
        rolls.push(r);
        resultRoll += r;
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
    const formulaSides = count > 1 ? `${count}d${sides}` : `d${sides}`;
    let formula = `${formulaSides}${modifier !== 0 ? ` ${modifier >= 0 ? "+" : ""}${modifier}` : ""}`;
    if (sides === 20 && count === 1 && (finalAdvantage || finalDisadvantage)) {
      const advPrefix = finalAdvantage ? (extraAdvantage > 0 ? `ADV+${extraAdvantage}` : 'ADV') : 'DIS';
      formula = `${advPrefix} ${formula}`;
    }
    let breakdown = `(${rolls.join(" + ")})`;
    if (modifier !== 0) breakdown += ` ${modifier >= 0 ? "+" : "-"} ${Math.abs(modifier)}`;
    if (bonusBreakdown) breakdown += bonusBreakdown;
    const formatted = `${label ? label + ": " : ""}${formula}${bonusModifier !== 0 ? ` (+bonuses)` : ""} ${breakdown} = ${total}`;
    setRollResult(formatted);
    const newEntry: RollEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      label: label || `${formulaSides} Roll`,
      formula,
      rolls,
      modifier,
      total,
      type: 'generic',
      damageFormula,
      damageType,
      critExtraDamage,
      critRule,
      bonusModifier,
      bonusBreakdown,
      formatted,
      isCritical: sides === 20 && count === 1 && resultRoll >= effectiveCritRange,
      isFumble: sides === 20 && count === 1 && resultRoll === 1
    };
    setRollHistory(prev => [...prev.slice(-49), newEntry]);
  };

  const rollDamage: RollDamageFunc = (damageString, label, damageType, rollType = 'damage', isCritical = false, critExtraDamage = "", critRuleOverride) => {
    if (!damageString) return;
    const critRule: CritRule = critRuleOverride || characterWithDefaults.critRule || 'double-dice';
    const critLabel = isCritical ? " (CRIT)" : "";

    const resolvedFormula = resolveRollExpression(
      damageString,
      effectiveAbilityScores,
      totalLevel,
      proficiencyBonus
    );

    const { total, rolls, modifierTotal, sign, mod, formula: displayFormula } = evaluateRoll(resolvedFormula);
    
    // Apply Effective Bonuses for the specific roll type
    let bonusModifier = 0;
    let bonusBreakdown = "";
    const bonusDamageTypes: Record<string, number> = {};

    const activeBonuses = getEffectiveBonuses(characterWithDefaults, rollType);
    activeBonuses.forEach(b => {
      const parsed = parseDice(b.bonus);
      let totalWithMod = 0;
      if (parsed) {
          const bonusRolls: number[] = [];
          let bonusTotal = 0;
          for (let i = 0; i < parsed.count; i++) {
            const r = Math.floor(Math.random() * parsed.sides) + 1;
            bonusRolls.push(r);
            bonusTotal += r;
          }
          totalWithMod = parsed.sign === "+" ? bonusTotal + parsed.mod : bonusTotal - parsed.mod;
        } else {
          // Flat bonus
          totalWithMod = parseInt(b.bonus) || 0;
        }

        if (totalWithMod !== 0) {
            bonusModifier += totalWithMod;
            bonusBreakdown += ` + ${b.name}(${totalWithMod >= 0 ? "+" : ""}${totalWithMod}${b.damageType ? ` ${b.damageType}` : ""})`;
            
            if (b.damageType) {
                bonusDamageTypes[b.damageType] = (bonusDamageTypes[b.damageType] || 0) + totalWithMod;
            }
        }
      });

    let totalWithBonuses = total + bonusModifier;

    let breakdown = `(${rolls.join(" + ")})${modifierTotal !== 0 ? ` ${sign === "+" ? "+" : "-"} ${mod}` : ""}`;
    if (isCritical && critRule === 'double-total') {
      const diceSum = rolls.length > 1 ? `(${rolls.join(" + ")})` : rolls[0];
      breakdown = `(${diceSum} × 2)${modifierTotal !== 0 ? ` ${sign === "+" ? "+" : "-"} ${mod}` : ""}`;
    }
    if (bonusBreakdown) breakdown += bonusBreakdown;

    const bonusTypesStr = Object.entries(bonusDamageTypes)
        .map(([type, val]) => `${val >= 0 ? "+" : ""}${val} ${type}`)
        .join(", ");

    const formatted = `${label ? label + critLabel + ": " : ""}${displayFormula}${bonusModifier !== 0 ? ` (+bonuses)` : ""} ${breakdown} = ${totalWithBonuses} ${damageType ? damageType : ""}${bonusTypesStr ? ` [${bonusTypesStr}]` : ""}`.trim();
    setRollResult(formatted);
    const newEntry: RollEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      label: (label || (rollType === 'healing' ? "Healing Roll" : "Damage Roll")) + critLabel,
      formula: isCritical ? `${displayFormula} (Crit)` : damageString,
      rolls,
      modifier: modifierTotal,
      bonusModifier,
      bonusBreakdown,
      total: totalWithBonuses,
      type: rollType === 'healing' ? 'healing' : 'damage',
      damageType: rollType === 'healing' ? 'Healing' : damageType,
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

  const handleUpdateSummons = (summons: Summon[]) => {
    setCharacter(prev => (prev ? { ...prev, summons } : null));
  };

  const handleUpdateSummonStatblocks = (summonStatblocks: Summon[]) => {
    setCharacter(prev => (prev ? { ...prev, summonStatblocks } : null));
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
    handleUpdateSummons,
    handleUpdateSummonStatblocks,
    handleAdjustHP,
    handleAdjustSummonHP,
  };
};
