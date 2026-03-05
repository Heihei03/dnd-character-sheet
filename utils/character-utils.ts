import { Character, Sense, Defenses, DefenseEntry, Feature, ProficiencyLevel, Action, Spell, Resource, Condition } from "../types/character";
import { FeatureModifier } from "../types/modifiers";
import { STANDARD_ACTIONS } from "../data/standard-actions";

export const getAbilityModifier = (score: number) => Math.floor((score - 10) / 2);

export const getProficiencyMultiplier = (level: ProficiencyLevel) => {
    switch (level) {
        case "half": return 0.5;
        case "proficient": return 1;
        case "expertise": return 2;
        default: return 0;
    }
};

export const cycleProficiency = (current: ProficiencyLevel): ProficiencyLevel => {
    const levels: ProficiencyLevel[] = ["none", "half", "proficient", "expertise"];
    const currentIndex = levels.indexOf(current);
    const nextIndex = (currentIndex + 1) % levels.length;
    return levels[nextIndex];
};

export const ABILITY_NAMES = ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"];

export const getFeatureModifiersByType = (features: Feature[] = [], type: string): FeatureModifier[] => {
    return features.flatMap(f => (f.modifiers || []).filter(m => m.type === type));
};

export const getEffectiveAbilityScores = (character: Character) => {
    const scores = { ...character.abilityScores };
    const activeFeatures = getAllActiveFeatures(character);
    const overrides = getFeatureModifiersByType(activeFeatures, "Override");

    overrides.forEach(mod => {
        const ability = (mod.subType || "").toLowerCase();
        const value = Number(mod.value);
        if (!isNaN(value) && ability && scores[ability] !== undefined) {
            // Override only applies if it's higher than the current score
            if (value > scores[ability]) {
                scores[ability] = value;
            }
        }
    });

    return scores;
};

export const getAllActiveFeatures = (character: Character): Feature[] => {
    const characterFeatures = character.features || [];
    const itemFeatures = (character.inventory || [])
        .filter(item => {
            if (!item.features || item.features.length === 0) return false;
            // Must be equipped if equippable
            if (item.equippable && !item.equipped) return false;
            return true;
        })
        .flatMap(item => (item.features || []).map(f => {
            // Filter modifiers based on attunement requirement
            const activeModifiers = (f.modifiers || []).filter(mod => {
                if (!mod.requiresAttunement) return true;
                return item.attuned;
            });

            return {
                ...f,
                modifiers: activeModifiers,
                origin: "Item",
                subOrigin: item.name,
                sourceItemId: item.id
            };
        }));

    return [...characterFeatures, ...itemFeatures];
};

export const getEffectiveSenses = (character: Character): Sense[] => {
    const manualSenses = character.senses || [];
    const activeFeatures = getAllActiveFeatures(character);
    const featureSenses = getFeatureModifiersByType(activeFeatures, "Sense").map(m => ({
        name: m.subType,
        value: typeof m.value === 'string' ? m.value : `${m.value}ft`,
        fromFeature: true
    }));

    // Merge by name, feature values override manual ones if they share a name
    const combined = [...manualSenses];
    featureSenses.forEach(fs => {
        const existingIdx = combined.findIndex(s => (s.name || "").toLowerCase() === (fs.name || "").toLowerCase());
        if (existingIdx >= 0) {
            combined[existingIdx] = { ...fs };
        } else {
            combined.push(fs);
        }
    });

    return combined;
};

export const getEffectiveDefenses = (character: Character): Defenses => {
    const manual = character.defenses || { resistances: [], vulnerabilities: [], immunities: [] };
    const activeFeatures = getAllActiveFeatures(character);

    // Helper to ensure we're working with DefenseEntry objects
    const toEntry = (d: string | DefenseEntry): DefenseEntry =>
        typeof d === 'string' ? { name: d } : d;

    const featureResistances = getFeatureModifiersByType(activeFeatures, "Resistance").map(m => ({ name: m.subType, fromFeature: true }));
    const featureImmunities = getFeatureModifiersByType(activeFeatures, "Immunity").map(m => ({ name: m.subType, fromFeature: true }));
    const featureVulnerabilities = getFeatureModifiersByType(activeFeatures, "Vulnerability").map(m => ({ name: m.subType, fromFeature: true }));

    const merge = (manualList: (string | DefenseEntry)[], featureList: DefenseEntry[]): DefenseEntry[] => {
        const combined = manualList.map(toEntry);
        featureList.forEach(fe => {
            if (!combined.some(ce => (ce.name || "").toLowerCase() === (fe.name || "").toLowerCase())) {
                combined.push(fe);
            }
        });
        return combined;
    };

    return {
        resistances: merge(manual.resistances, featureResistances),
        immunities: merge(manual.immunities, featureImmunities),
        vulnerabilities: merge(manual.vulnerabilities, featureVulnerabilities),
    };
};

export const getEffectiveSpells = (character: Character): Spell[] => {
    const rawManualSpells = character.spells || [];
    // Separate purely manual spells from potential feature overrides/stale feature spells
    const purelyManualSpells = rawManualSpells.filter(s => !s.fromFeature);
    const manualOverrides = rawManualSpells.filter(s => s.fromFeature);

    const activeFeatures = getAllActiveFeatures(character);
    const featureSpells: Spell[] = [];

    activeFeatures.forEach(f => {
        const spellModifiers = (f.modifiers || []).filter(m => m.type === "Spell");
        spellModifiers.forEach(m => {
            if (m.value && typeof m.value === 'string') {
                const spellNames = m.value.split(",").map(s => s.trim()).filter(Boolean);
                spellNames.forEach((spellName, idx) => {
                    // Check if this spell name is already in ANY list to avoid duplicates from DIFFERENT features
                    const alreadyFound = featureSpells.find(s => (s.name || "").toLowerCase() === (spellName || "").toLowerCase());
                    if (alreadyFound) return;

                    // Check if there's a manual override for this feature spell
                    const override = manualOverrides.find(s => (s.name || "").toLowerCase() === (spellName || "").toLowerCase());

                    if (override) {
                        // Use the override but ensure fromFeature is true and unique ID
                        featureSpells.push({
                            ...override,
                            id: `feature-spell-${m.id}-${idx}`,
                            fromFeature: true
                        });
                    } else {
                        // Create default
                        featureSpells.push({
                            id: `feature-spell-${m.id}-${idx}`,
                            name: spellName,
                            level: 0,
                            school: "Evocation",
                            castingTime: "1 Action",
                            range: "60 ft",
                            components: { v: true, s: true, m: false },
                            duration: "Instantaneous",
                            description: `Added by feature: ${f.name}`,
                            prepared: true,
                            isRitual: false,
                            requiresConcentration: false,
                            fromFeature: true
                        } as Spell);
                    }
                });
            }
        });
    });

    return [...purelyManualSpells, ...featureSpells];
};

export const getEffectiveActions = (character: Character): Action[] => {
    const effectiveAbilityScores = getEffectiveAbilityScores(character);
    const activeFeatures = getAllActiveFeatures(character);
    const totalLevel = (character.classes || []).reduce((sum, cls) => sum + cls.level, 0);
    const proficiencyBonus = Math.ceil(totalLevel / 4) + 1;

    // 1. Purely manual actions (no weapons, no features)
    const manualActions = (character.actions || []).filter(a =>
        !a.fromWeapon &&
        !a.fromFeature &&
        !a.id.startsWith("weapon-") &&
        !a.id.startsWith("feature-")
    );

    // 2. Weapon actions (dynamic)
    const weaponActions: Action[] = (character.inventory || [])
        .filter(item => item.equipped && item.itemType === "weapon" && item.weaponDetails)
        .map(weapon => {
            const details = weapon.weaponDetails!;

            // Determine which ability to use (Finesse logic simplified for now)
            const isFinesse = details.properties?.includes("Finesse");
            const strMod = getAbilityModifier(effectiveAbilityScores.strength ?? 10);
            const dexMod = getAbilityModifier(effectiveAbilityScores.dexterity ?? 10);

            let ability = details.rangeType === "Ranged" ? "dexterity" : "strength";
            if (isFinesse && dexMod > strMod) {
                ability = "dexterity";
            }

            const abilityModifier = getAbilityModifier(effectiveAbilityScores[ability] ?? 10);
            const attackBonus = proficiencyBonus + abilityModifier;
            const damageBonus = abilityModifier;

            // Handle Versatile property
            const versatileProp = details.properties?.find(p => p.startsWith("Versatile"));
            let versatileDamage = undefined;
            let versatileDice = undefined;
            if (versatileProp) {
                const match = versatileProp.match(/\(([^)]+)\)/);
                if (match) {
                    versatileDice = match[1];
                    versatileDamage = `${match[1]}${damageBonus >= 0 ? "+" : ""}${damageBonus}`;
                }
            }

            // Handle Thrown or Ammunition property for range
            const rangeProp = details.properties?.find(p => p.startsWith("Thrown") || p.startsWith("Ammunition"));
            let range = undefined;
            if (rangeProp) {
                const match = rangeProp.match(/\(([^)]+)\)/);
                if (match) {
                    const rawRange = match[1];
                    range = rawRange.endsWith("ft") ? rawRange : rawRange + " ft";
                }
            } else if (details.rangeType === "Ranged") {
                range = "80/320 ft";
            }

            // Handle Reach property
            let reach = undefined;
            if (details.rangeType === "Melee") {
                reach = details.properties?.some(p => p === "Reach") ? "10 ft" : "5 ft";
            }

            // Suppress range if it's identical to reach (fixes stale "5 ft" range defaults)
            if (range === reach) {
                range = undefined;
            }

            // Normalize damage type and check for magical status
            let damageType = details.damageType || "Slashing";
            // Capitalize (e.g. "slashing" -> "Slashing")
            damageType = damageType.charAt(0).toUpperCase() + damageType.slice(1).toLowerCase();

            const isMagical = weapon.name.includes("+") ||
                details.properties?.some(p => p?.toLowerCase().includes("magical")) ||
                weapon.description?.toLowerCase().includes("magical");

            if (isMagical && ["Bludgeoning", "Piercing", "Slashing"].includes(damageType)) {
                damageType = `Magical ${damageType}`;
            }

            return {
                id: `weapon-${weapon.id}`,
                name: weapon.name,
                type: "Attack",
                description: `A ${(details.category || "").toLowerCase()} ${(details.rangeType || "").toLowerCase()} weapon attack. Properties: ${details.properties?.join(", ") || "None"}.`,
                damage: `${details.damageDice}${damageBonus >= 0 ? "+" : ""}${damageBonus}`,
                damageType: damageType,
                versatileDamage: versatileDamage,
                range: range,
                reach: reach,
                activation: "1 Action",
                fromWeapon: true,
                ability: ability as any,
                // Structured fields
                proficient: true,
                attackAbility: ability as any,
                attackBonus: 0,
                damageDice: details.damageDice,
                damageAbility: ability as any,
                damageBonus: 0,
                versatileDice: versatileDice
            };
        });

    // 3. Spell actions (dynamic from effective spells)
    const effectiveSpells = getEffectiveSpells(character);
    const spellActions: Action[] = effectiveSpells
        .filter(spell => {
            if (spell.level > 0 && !spell.prepared) return false;
            const ct = (spell.castingTime || "").toLowerCase().trim();
            return ct.includes("1 action") || ct.includes("bonus action") || ct.includes("reaction");
        })
        .map(spell => {
            const ct = (spell.castingTime || "").toLowerCase();
            let type: "Action" | "Bonus Action" | "Reaction" | "Free Action" | "Attack" = "Action";
            if (ct.includes("bonus action")) type = "Bonus Action";
            else if (ct.includes("reaction")) type = "Reaction";

            let description = `Level: ${spell.level > 0 ? spell.level : "Cantrip"} (${spell.school})\n`;
            description += `Range: ${spell.range}\n`;

            description += `Duration: ${spell.duration}\n\n`;
            description += spell.description;

            const isAttack = spell.hasAttack;
            const actionType = isAttack ? "Attack" : type;

            return {
                id: `spell-${spell.id}`,
                name: spell.name,
                type: actionType,
                description: description,
                activation: spell.castingTime,
                range: spell.range,
                damage: spell.damage,
                damageType: spell.damageType,
                atHigherLevels: spell.atHigherLevels,
                higherLevelDamage: spell.higherLevelDamage,
                higherLevelHealing: spell.higherLevelHealing,
                baseLevel: spell.level,
                proficient: true,
                attackAbility: spell.spellcastingAbility as any,
                damageDice: spell.damage,
                attackBonus: 0,
                damageBonus: 0,
                scalesWithCharacterLevel: spell.scalesWithCharacterLevel,
            } as Action;
        });

    // 4. Feature "New Action" modifiers (dynamic)
    const extraActions: Action[] = [];
    activeFeatures.forEach(f => {
        const actionModifiers = (f.modifiers || []).filter(m => m.type === "New Action");
        const resourceModifiers = (f.modifiers || []).filter(m => m.type === "Resource");

        actionModifiers.forEach((m, idx) => {
            if (m.value && typeof m.value === 'string') {
                // Check if value is JSON (advanced usage) or simple name
                let action: Action;
                try {
                    const data = JSON.parse(m.value);
                    const actionName = data.name || f.name;

                    // Try to link to a resource in the same feature
                    let resourceName = data.resourceName;
                    if (!resourceName && resourceModifiers.length > 0) {
                        // Default to the first resource in the same feature if not specified
                        try {
                            const firstRes = JSON.parse(resourceModifiers[0].value as string);
                            resourceName = firstRes.name || f.name;
                        } catch {
                            resourceName = resourceModifiers[0].value || f.name;
                        }
                    }

                    action = {
                        name: actionName,
                        ...data,
                        resourceName,
                        id: `feature-action-${m.id}-${idx}`,
                        fromFeature: true
                    };
                } catch (e) {
                    // Try to link to a resource in the same feature even for simple actions
                    let resourceName = undefined;
                    if (resourceModifiers.length > 0) {
                        try {
                            const firstRes = JSON.parse(resourceModifiers[0].value as string);
                            resourceName = firstRes.name || f.name;
                        } catch {
                            resourceName = resourceModifiers[0].value || f.name;
                        }
                    }

                    action = {
                        id: `feature-action-${m.id}-${idx}`,
                        name: m.value || f.name,
                        type: m.subType as any || "Action",
                        description: `Action granted by feature: ${f.name}`,
                        activation: "1 Action",
                        fromFeature: true,
                        resourceName
                    } as Action;
                }
                extraActions.push(action);
            }
        });
    });

    // Merge manual, weapon, standard actions, spell actions, and feature actions
    const combined = [...STANDARD_ACTIONS];

    // Use a map to ensure unique IDs for weapon/spell/feature actions
    const dynamicActions = [...weaponActions, ...spellActions, ...extraActions];
    dynamicActions.forEach(da => {
        if (!combined.some(a => a.id === da.id)) {
            combined.push(da);
        }
    });

    // Add manual actions, ensuring they don't duplicate standard or dynamic actions by ID
    manualActions.forEach(ma => {
        if (!combined.some(a => a.id === ma.id)) {
            combined.push(ma);
        }
    });

    return combined;
};

export const getEffectiveResources = (character: Character, proficiencyBonus: number): Resource[] => {
    const manualResources = character.resources || [];
    const activeFeatures = getAllActiveFeatures(character);
    const featureResources: Resource[] = [];

    activeFeatures.forEach(f => {
        const resourceModifiers = (f.modifiers || []).filter(m => m.type === "Resource");
        resourceModifiers.forEach((m, idx) => {
            if (m.value && typeof m.value === 'string') {
                try {
                    const data = JSON.parse(m.value);
                    const resourceName = data.name || f.name; // Fallback to feature name
                    // Check if this resource is already in featureResources to avoid duplicates from DIFFERENT features
                    const alreadyFound = featureResources.find(r => (r.name || "").toLowerCase() === (resourceName || "").toLowerCase());
                    if (alreadyFound) return;

                    let max = data.max || 0;
                    if (data.useProficiencyBonus) {
                        max = proficiencyBonus;
                    }

                    featureResources.push({
                        ...data,
                        name: resourceName,
                        id: `feature-resource-${m.id}-${idx}`,
                        fromFeature: true,
                        max: max,
                        value: data.value ?? max // Default value to max if not specified
                    });
                } catch (e) {
                    // If not JSON, it might just be a link or simple name
                    const val = m.value?.toString() || f.name; // Fallback to feature name
                    const alreadyFound = featureResources.find(r => (r.name || "").toLowerCase() === (val || "").toLowerCase());
                    if (alreadyFound) return;

                    featureResources.push({
                        id: `feature-resource-${m.id}-${idx}`,
                        name: val,
                        max: 1,
                        value: 1,
                        regain: m.subType || "Long Rest",
                        fromFeature: true
                    });
                }
            }
        });
    });

    // Merge manual and feature resources
    const combined = [...manualResources];
    featureResources.forEach(fr => {
        const existingIdx = combined.findIndex(r => (r.name || "").toLowerCase() === (fr.name || "").toLowerCase());
        if (existingIdx >= 0) {
            // Keep manual value if it exists, but update max/regain from feature if they are linking
            // For now, let's treat feature resources as authoritative if they have the same name
            combined[existingIdx] = {
                ...fr,
                value: combined[existingIdx].value // Keep current usage
            };
        } else {
            combined.push(fr);
        }
    });

    return combined;
};

export const getAdvantageDisadvantage = (character: Character, key: string): { advantage: boolean, disadvantage: boolean, notes: string[] } => {
    const activeFeatures = getAllActiveFeatures(character);
    const advMods = getFeatureModifiersByType(activeFeatures, "Advantage");
    const disMods = getFeatureModifiersByType(activeFeatures, "Disadvantage");

    const matches = (mod: FeatureModifier, target: string) => {
        const sub = (mod.subType || "").toLowerCase();
        const t = (target || "").toLowerCase();

        // Exact match
        if (sub === t) return true;

        // "Saving Throws" matches specific saves (e.g. "Wisdom Saves")
        if (sub === "saving throws" && t.endsWith("saves")) return true;

        // "Checks" or "Ability Checks" matches specific checks (e.g. "Perception Checks")
        if ((sub === "checks" || sub === "ability checks") && t.endsWith("checks")) return true;

        return false;
    };

    const relevantAdv = advMods.filter(m => matches(m, key));
    const relevantDis = disMods.filter(m => matches(m, key));

    // Notes for more specific or contextual modifiers
    const notes = [...advMods, ...disMods]
        .filter(m => {
            const sub = (m.subType || "").toLowerCase();
            const t = (key || "").toLowerCase();

            // If checking a broad category, include specific notes
            if (t === "saving throws" && (sub.endsWith("saves") || sub === "concentration")) return true;
            if (t === "ability checks" && sub.endsWith("checks")) return true;

            // If checking a specific save, include contextual saves (e.g. "Saves against Charms")
            if (t.endsWith("saves") && (sub.startsWith("saves against") || (t === "constitution saves" && sub === "concentration"))) return true;

            // If checking broad "adv/dis" like "Initiative", don't add redundant notes if already matched
            if (sub === t) return false;

            return false;
        })
        .map(m => `${m.type === "Advantage" ? "ADV" : "DIS"}: ${m.subType}${m.value ? ` (${m.value})` : ""}`);

    return {
        advantage: relevantAdv.length > 0,
        disadvantage: relevantDis.length > 0,
        notes: notes
    };
};

export const getEffectiveConditions = (character: Character): Condition[] => {
    const manualConditions = character.conditions || [];
    const activeFeatures = getAllActiveFeatures(character);
    const featureConditions = getFeatureModifiersByType(activeFeatures, "Condition").map(m => ({
        name: m.subType,
        fromFeature: true
    }));

    // Merge by name
    const combined = [...manualConditions];
    featureConditions.forEach(fc => {
        if (!combined.some(c => (c.name || "").toLowerCase() === (fc.name || "").toLowerCase())) {
            combined.push(fc);
        }
    });

    return combined;
};
