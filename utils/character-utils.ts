import { Character, Sense, Defenses, DefenseEntry, Feature, ProficiencyLevel, Action } from "../types/character";
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
        const ability = mod.subType.toLowerCase();
        const value = Number(mod.value);
        if (!isNaN(value) && scores[ability] !== undefined) {
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
            // Must be attuned if attunable
            if (item.attunable && !item.attuned) return false;
            return true;
        })
        .flatMap(item => (item.features || []).map(f => ({
            ...f,
            origin: "Item",
            subOrigin: item.name,
            sourceItemId: item.id
        })));

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
        const existingIdx = combined.findIndex(s => s.name.toLowerCase() === fs.name.toLowerCase());
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
            if (!combined.some(ce => ce.name.toLowerCase() === fe.name.toLowerCase())) {
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

export const getEffectiveActions = (character: Character): Action[] => {
    const effectiveAbilityScores = getEffectiveAbilityScores(character);
    const manualActions = (character.actions || []).filter(a =>
        !a.fromWeapon &&
        !a.fromFeature &&
        !a.id.startsWith("weapon-") &&
        !a.id.startsWith("feature-")
    );

    const weaponActions: Action[] = (character.inventory || [])
        .filter(item => item.equipped && item.itemType === "weapon" && item.weaponDetails)
        .map(weapon => {
            const details = weapon.weaponDetails!;
            const totalLevel = (character.classes || []).reduce((sum, cls) => sum + cls.level, 0);
            const proficiencyBonus = Math.ceil(totalLevel / 4) + 1;

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
                details.properties?.some(p => p.toLowerCase().includes("magical")) ||
                weapon.description?.toLowerCase().includes("magical");

            if (isMagical && ["Bludgeoning", "Piercing", "Slashing"].includes(damageType)) {
                damageType = `Magical ${damageType}`;
            }

            return {
                id: `weapon-${weapon.id}`,
                name: weapon.name,
                type: "Attack",
                description: `A ${details.category.toLowerCase()} ${details.rangeType.toLowerCase()} weapon attack. Properties: ${details.properties?.join(", ") || "None"}.`,
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

    // Merge manual, weapon, and standard actions
    const combined = [...STANDARD_ACTIONS, ...manualActions];
    weaponActions.forEach(wa => {
        if (!combined.some(a => a.id === wa.id)) {
            combined.push(wa);
        }
    });

    return combined;
};
