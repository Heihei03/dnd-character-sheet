import { Character, Sense, Defenses, DefenseEntry, Feature, ProficiencyLevel, Action, Spell, Resource, Condition, Skills, ToolProficiency, AbilityScores, NormalizedCharacter } from "../types/character";
import { FeatureModifier } from "../types/modifiers";
import { STANDARD_ACTIONS } from "../data/standard-actions";
import { SKILL_LIST, LANGUAGES } from "./constants";
import { WEAPON_DATA } from "../data/weapons";
import { ARMOR_DATA } from "../data/armor";
import { TOOL_DATA } from "../data/tools";

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

/**
 * Resolves a dice expression like "1d10 + Dex + Level" into "1d10 + 7"
 */
export const resolveRollExpression = (
    expr: string,
    abilityScores: AbilityScores,
    totalLevel: number,
    proficiencyBonus: number
): string => {
    if (!expr) return "";

    let resolved = expr.trim();

    // Ability scores (e.g., "Dex", "Strength")
    const abilities = [
        { full: "strength", short: "str" },
        { full: "dexterity", short: "dex" },
        { full: "constitution", short: "con" },
        { full: "intelligence", short: "int" },
        { full: "wisdom", short: "wis" },
        { full: "charisma", short: "cha" }
    ];

    abilities.forEach(a => {
        const mod = getAbilityModifier(abilityScores[a.full as keyof AbilityScores] || 10);
        // Use regex to replace both full and short names, case-insensitive
        const regex = new RegExp(`\\b(${a.full}|${a.short})\\b`, 'gi');
        resolved = resolved.replace(regex, mod >= 0 ? `+${mod}` : `${mod}`);
    });

    // Level and Proficiency
    resolved = resolved.replace(/\blevel\b/gi, `+${totalLevel}`);
    resolved = resolved.replace(/\b(prof|proficiency)\b/gi, `+${proficiencyBonus}`);

    // Clean up double pluses or spaces around signs
    resolved = resolved.replace(/\+\+/g, "+").replace(/\-\+/g, "-").replace(/\+\-/g, "-");

    // Attempt to simplify the numeric parts if it starts with dice
    const diceMatch = resolved.match(/^(\d+d\d+)(.*)/i);
    if (diceMatch) {
        const dicePart = diceMatch[1];
        const modPart = diceMatch[2].trim();

        if (modPart) {
            try {
                // Sanitize: only allow numbers, +, -, and spaces (avoiding * / for simple addition)
                const sanitizedMod = modPart.replace(/[^-+0-9 ]/g, '');
                // Simple sum of parts
                const parts = sanitizedMod.match(/[+-]?\s*\d+/g);
                if (parts) {
                    const sum = parts.reduce((acc, part) => acc + parseInt(part.replace(/\s+/g, '')), 0);
                    return `${dicePart}${sum >= 0 ? "+" : ""}${sum}`;
                }
            } catch (e) {
                // Return unresolved if complex
            }
        }
    }

    return resolved;
};

export const getFeatureModifiersWithSource = (features: Feature[] = [], type: string): (FeatureModifier & { fromFeatureId?: string })[] => {
    return features.flatMap(f => (f.modifiers || []).filter(m => m.type === type).map(m => ({ ...m, fromFeatureId: f.id })));
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
    const featureSenses = getFeatureModifiersWithSource(activeFeatures, "Sense").map(m => ({
        name: m.subType,
        value: typeof m.value === 'string' ? m.value : `${m.value}ft`,
        fromFeature: true,
        fromFeatureId: m.fromFeatureId
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

    const featureResistances = getFeatureModifiersWithSource(activeFeatures, "Resistance").map(m => ({ name: m.subType, fromFeature: true, fromFeatureId: m.fromFeatureId }));
    const featureImmunities = getFeatureModifiersWithSource(activeFeatures, "Immunity").map(m => ({ name: m.subType, fromFeature: true, fromFeatureId: m.fromFeatureId }));
    const featureVulnerabilities = getFeatureModifiersWithSource(activeFeatures, "Vulnerability").map(m => ({ name: m.subType, fromFeature: true, fromFeatureId: m.fromFeatureId }));

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
                            fromFeature: true,
                            fromFeatureId: f.id
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
                            fromFeature: true,
                            fromFeatureId: f.id
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
                        try {
                            const firstRes = JSON.parse(resourceModifiers[0].value as string);
                            resourceName = firstRes.name || f.name;
                        } catch {
                            resourceName = resourceModifiers[0].value || f.name;
                        }
                    }

                    // Calculate damage string if dice and ability are provided
                    let damage = data.damage;
                    if (data.damageDice) {
                        const abilityMod = data.damageAbility ? getAbilityModifier(effectiveAbilityScores[data.damageAbility] || 10) : 0;
                        damage = `${data.damageDice}${abilityMod >= 0 ? "+" : ""}${abilityMod}`;
                    }

                    let description = data.description || "";
                    if (f.description) {
                        description = description ? `${description}\n\nFeature Description:\n${f.description}` : f.description;
                    }

                    action = {
                        name: actionName,
                        type: (data.type || m.subType) as any || "Action",
                        ...data,
                        description: description || `Action granted by feature: ${f.name}`,
                        activation: data.activation || (data.type || m.subType) as any || "1 Action",
                        damage: damage,
                        resourceName,
                        resourceId: data.resourceId || m.id, // Link to resource with ID
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
                        description: f.description || `Action granted by feature: ${f.name}`,
                        activation: "1 Action",
                        fromFeature: true,
                        resourceName,
                        resourceId: m.id // Link to resource with the same ID
                    } as Action;
                }
                extraActions.push(action);
            }
        });
    });

    // Merge manual, weapon, standard actions, spell actions, and feature actions
    const combined: Action[] = [...STANDARD_ACTIONS];

    const dynamicActions = [...weaponActions, ...spellActions, ...extraActions];
    dynamicActions.forEach(da => {
        if (!combined.some(a => a.id === da.id)) {
            combined.push(da);
        }
    });

    manualActions.forEach(ma => {
        if (!combined.some(a => a.id === ma.id)) {
            combined.push(ma);
        }
    });

    // 5. Apply "Roll" modifiers (bonus dice/flat damage)
    const rollModifiers = getFeatureModifiersByType(activeFeatures, "Roll");

    combined.forEach(action => {
        rollModifiers.forEach(mod => {
            const target = (mod.subType || "").toLowerCase().trim();
            const actionName = action.name.toLowerCase().trim();

            // Match by specific name or "all", or "melee", "ranged" (if we had those tags, but for now name or all)
            const isMatch = target === "all" || target === actionName ||
                (target === "melee" && action.range === undefined) || // Simple heuristic
                (target === "ranged" && action.range !== undefined);

            if (isMatch && mod.value) {
                // Append the bonus to the damage string
                const bonus = mod.value.toString().trim();
                if (bonus) {
                    // Check if it's already a dice string or just a number
                    const separator = (bonus.startsWith("+") || bonus.startsWith("-")) ? "" : "+";
                    action.damage = `${action.damage}${separator}${bonus}`;

                    // Also update structured field if applicable
                    if (action.damageDice) {
                        action.damageDice = `${action.damageDice}${separator}${bonus}`;
                    } else {
                        action.damageDice = bonus;
                    }
                }
            }
        });
    });

    return combined;
};

export const getEffectiveResources = (character: Character, proficiencyBonus: number): Resource[] => {
    const manualResources = character.resources || [];
    const activeFeatures = getAllActiveFeatures(character);
    const featureResources: Resource[] = [];
    const effectiveAbilityScores = getEffectiveAbilityScores(character);
    const totalLevel = (character.classes || []).reduce((sum, cls) => sum + cls.level, 0);

    activeFeatures.forEach(f => {
        const resourceModifiers = (f.modifiers || []).filter(m => m.type === "Resource");
        resourceModifiers.forEach((m, idx) => {
            if (m.value && typeof m.value === 'string') {
                try {
                    const data = JSON.parse(m.value) as Resource;
                    const resourceName = data.name || f.name; // Fallback to feature name
                    // Check if this resource is already in featureResources to avoid duplicates from DIFFERENT features
                    const alreadyFound = featureResources.find(r => (r.name || "").toLowerCase() === (resourceName || "").toLowerCase());
                    if (alreadyFound) return;

                    let max = 0;
                    const multiplier = data.multiplier || 1;
                    if (data.useProficiencyBonus) {
                        max = Math.floor((proficiencyBonus * multiplier) + (data.max || 0));
                    } else if (data.useAbilityMod) {
                        max = Math.floor((getAbilityModifier(effectiveAbilityScores[data.useAbilityMod] || 10) * multiplier) + (data.max || 0));
                    } else if (data.useCharacterLevel) {
                        max = Math.floor((totalLevel * multiplier) + (data.max || 0));
                    } else {
                        max = data.max || 0;
                    }

                    featureResources.push({
                        ...data,
                        name: resourceName,
                        id: m.id, // Use modifier ID as the stable resource ID
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
                        id: m.id, // Use modifier ID as the stable resource ID
                        name: val,
                        max: 1,
                        value: 1,
                        regain: m.subType || "Long Rest",
                        regainAmount: "All",
                        fromFeature: true
                    });
                }
            }
        });
    });

    // Merge manual and feature resources
    const combined: Resource[] = manualResources.map(r => {
        let max = 0;
        const multiplier = r.multiplier || 1;
        if (r.useProficiencyBonus) {
            max = Math.floor((proficiencyBonus * multiplier) + (r.max || 0));
        } else if (r.useAbilityMod) {
            max = Math.floor((getAbilityModifier(effectiveAbilityScores[r.useAbilityMod] || 10) * multiplier) + (r.max || 0));
        } else if (r.useCharacterLevel) {
            max = Math.floor((totalLevel * multiplier) + (r.max || 0));
        } else {
            max = r.max || 0;
        }
        return { ...r, max };
    });

    featureResources.forEach(fr => {
        // First try to merge by ID (the robust way)
        let existingIdx = combined.findIndex(r => r.id === fr.id);

        // Fallback: merge by name if ID doesn't match AND it's a manual resource
        // This allows feature resources to link to manually created ones, 
        // but prevents feature resources with different IDs (e.g. from different items) from clashing.
        if (existingIdx === -1) {
            existingIdx = combined.findIndex(r =>
                !r.fromFeature &&
                (r.name || "").toLowerCase() === (fr.name || "").toLowerCase()
            );
        }

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

export const getEffectiveSkills = (character: Character): { skills: Skills, skillSources: Record<string, string> } => {
    // Start with a copy of skills or a default empty skills object
    const baseSkills: any = { ...(character.skills || {}) };
    const skillSources: Record<string, string> = {};
    const activeFeatures = getAllActiveFeatures(character);
    const profMods = getFeatureModifiersWithSource(activeFeatures, "Proficiency");

    profMods.forEach(mod => {
        const subTypeStr = String(mod.subType || "").trim();
        if (!subTypeStr) return;

        // Safer matching: find in SKILL_LIST by name or key
        const skill = SKILL_LIST.find(s =>
            s.name.toLowerCase() === subTypeStr.toLowerCase() ||
            s.key.toLowerCase() === subTypeStr.toLowerCase()
        );

        if (skill) {
            const skillKey = skill.key;
            const currentLevel = baseSkills[skillKey] || "none";
            const modValue = String(mod.value || "proficient").toLowerCase() as ProficiencyLevel;

            // Upgrade if the mod value is "higher" than current
            const progression: ProficiencyLevel[] = ["none", "half", "proficient", "expertise"];
            const currentIdx = progression.indexOf(currentLevel as ProficiencyLevel);
            const modIdx = progression.indexOf(modValue);

            if (modIdx > currentIdx) {
                baseSkills[skillKey] = modValue;
                if (mod.fromFeatureId) {
                    skillSources[skillKey] = mod.fromFeatureId;
                }
            }
        }
    });

    return { skills: baseSkills as Skills, skillSources };
};

export const getEffectiveWeaponProficiencies = (character: Character): (string | { name: string, fromFeature: boolean, fromFeatureId?: string })[] => {
    const baseProf = [...(character.weaponProficiencies || [])];
    const activeFeatures = getAllActiveFeatures(character);
    const profMods = getFeatureModifiersWithSource(activeFeatures, "Proficiency");

    const result: (string | { name: string, fromFeature: boolean, fromFeatureId?: string })[] = [...baseProf];

    const weaponCategories = ["Simple Weapons", "Martial Weapons"];

    profMods.forEach(mod => {
        const name = String(mod.subType || "");
        if (!name) return;

        // Filtering: Is it a weapon or category?
        const isWeapon = WEAPON_DATA[name] !== undefined || weaponCategories.some(c => c.toLowerCase() === name.toLowerCase());
        if (!isWeapon) return;

        const alreadyHas = baseProf.some((p: any) => {
            const pName = typeof p === 'string' ? p : (p && (p as any).name);
            return pName && pName.toLowerCase() === name.toLowerCase();
        });

        if (!alreadyHas) {
            if (!result.some(r => (typeof r === 'string' ? r : (r as any).name).toLowerCase() === name.toLowerCase())) {
                result.push({ name, fromFeature: true, fromFeatureId: mod.fromFeatureId });
            }
        }
    });

    return result;
};

export const getEffectiveArmorProficiencies = (character: Character): (string | { name: string, fromFeature: boolean, fromFeatureId?: string })[] => {
    const baseProf = [...(character.armorProficiencies || [])];
    const activeFeatures = getAllActiveFeatures(character);
    const profMods = getFeatureModifiersWithSource(activeFeatures, "Proficiency");

    const result: (string | { name: string, fromFeature: boolean, fromFeatureId?: string })[] = [...baseProf];

    const armorCategories = ["Light Armor", "Medium Armor", "Heavy Armor", "Shields"];

    profMods.forEach(mod => {
        const name = String(mod.subType || "");
        if (!name) return;

        // Filtering: Is it armor or category?
        const isArmor = ARMOR_DATA[name] !== undefined || armorCategories.some(c => c.toLowerCase() === name.toLowerCase());
        if (!isArmor) return;

        const alreadyHas = baseProf.some((p: any) => {
            const pName = typeof p === 'string' ? p : (p && (p as any).name);
            return pName && pName.toLowerCase() === name.toLowerCase();
        });

        if (!alreadyHas) {
            if (!result.some(r => (typeof r === 'string' ? r : (r as any).name).toLowerCase() === name.toLowerCase())) {
                result.push({ name, fromFeature: true, fromFeatureId: mod.fromFeatureId });
            }
        }
    });

    return result;
};

export const getEffectiveLanguages = (character: Character): (string | { name: string, fromFeature: boolean, fromFeatureId?: string })[] => {
    const baseLang = [...(character.languages || [])];
    const activeFeatures = getAllActiveFeatures(character);
    const profMods = getFeatureModifiersWithSource(activeFeatures, "Proficiency");

    const result: (string | { name: string, fromFeature: boolean, fromFeatureId?: string })[] = [...baseLang];

    profMods.forEach(mod => {
        const name = String(mod.subType || "");
        if (!name) return;

        // Filtering: Is it a language?
        const isLanguage = LANGUAGES.some(l => l.toLowerCase() === name.toLowerCase());
        if (!isLanguage) return;

        const alreadyHas = baseLang.some((p: any) => {
            const pName = typeof p === 'string' ? p : (p && (p as any).name);
            return pName && pName.toLowerCase() === name.toLowerCase();
        });

        if (!alreadyHas) {
            if (!result.some(r => (typeof r === 'string' ? r : (r as any).name).toLowerCase() === name.toLowerCase())) {
                result.push({ name, fromFeature: true, fromFeatureId: mod.fromFeatureId });
            }
        }
    });

    return result;
};

export const normalizeCharacter = (character: any): NormalizedCharacter => {
    if (!character) return character;

    return {
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
};

export const getEffectiveToolProficiencies = (character: Character): ToolProficiency[] => {
    const baseTools = [...(character.toolProficiencies || [])];
    const activeFeatures = getAllActiveFeatures(character);
    const profMods = getFeatureModifiersWithSource(activeFeatures, "Proficiency");

    const skillKeys = SKILL_LIST.map(s => s.key);
    const skillNames = SKILL_LIST.map(s => s.name);
    const armorCategories = ["Light Armor", "Medium Armor", "Heavy Armor", "Shields"];
    const weaponCategories = ["Simple Weapons", "Martial Weapons"];

    profMods.forEach(mod => {
        const name = String(mod.subType || "");
        if (!name) return;

        // Filtering: Exclude things that definitively belong elsewhere
        const isSkill = skillNames.some(n => n.toLowerCase() === name.toLowerCase()) ||
            skillKeys.some(k => k.toLowerCase() === name.toLowerCase());
        const isLanguage = LANGUAGES.some(l => l.toLowerCase() === name.toLowerCase());
        const isWeapon = WEAPON_DATA[name] !== undefined || weaponCategories.some(c => c.toLowerCase() === name.toLowerCase());
        const isArmor = ARMOR_DATA[name] !== undefined || armorCategories.some(c => c.toLowerCase() === name.toLowerCase());

        if (isSkill || isLanguage || isWeapon || isArmor) return;

        // If it's not any of those, it's either a Tool (from data) or a custom Proficiency
        const existingIdx = baseTools.findIndex(t => (t.name || "").toLowerCase() === name.toLowerCase());
        const modValue = String(mod.value || "proficient").toLowerCase() as ProficiencyLevel;

        if (existingIdx >= 0) {
            const currentLevel = baseTools[existingIdx].level || "proficient";
            const progression: ProficiencyLevel[] = ["none", "half", "proficient", "expertise"];
            const currentIdx = progression.indexOf(currentLevel);
            const modIdx = progression.indexOf(modValue);

            if (modIdx > currentIdx) {
                baseTools[existingIdx] = { ...baseTools[existingIdx], level: modValue, fromFeature: true, fromFeatureId: mod.fromFeatureId };
            }
        } else {
            // New proficiency (Tool or Other)
            const toolData = TOOL_DATA[name];
            baseTools.push({
                name: name,
                ability: toolData?.ability || "Intelligence",
                level: modValue,
                fromFeature: true,
                fromFeatureId: mod.fromFeatureId
            });
        }
    });

    return baseTools;
};

