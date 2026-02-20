import { Character, Sense, Defenses, DefenseEntry, Feature, ProficiencyLevel, Action } from "../types/character";
import { FeatureModifier } from "../types/modifiers";

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

export const getEffectiveSenses = (character: Character): Sense[] => {
    const manualSenses = character.senses || [];
    const featureSenses = getFeatureModifiersByType(character.features, "Sense").map(m => ({
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

    // Helper to ensure we're working with DefenseEntry objects
    const toEntry = (d: string | DefenseEntry): DefenseEntry =>
        typeof d === 'string' ? { name: d } : d;

    const featureResistances = getFeatureModifiersByType(character.features, "Resistance").map(m => ({ name: m.subType, fromFeature: true }));
    const featureImmunities = getFeatureModifiersByType(character.features, "Immunity").map(m => ({ name: m.subType, fromFeature: true }));
    const featureVulnerabilities = getFeatureModifiersByType(character.features, "Vulnerability").map(m => ({ name: m.subType, fromFeature: true }));

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
    const manualActions = character.actions || [];

    const weaponActions: Action[] = (character.inventory || [])
        .filter(item => item.equipped && item.itemType === "weapon" && item.weaponDetails)
        .map(weapon => {
            const details = weapon.weaponDetails!;
            const totalLevel = (character.classes || []).reduce((sum, cls) => sum + cls.level, 0);
            const proficiencyBonus = Math.ceil(totalLevel / 4) + 1;

            // Determine which ability to use (Finesse logic simplified for now)
            const isFinesse = details.properties?.includes("Finesse");
            const strMod = getAbilityModifier(character.abilityScores.strength ?? 10);
            const dexMod = getAbilityModifier(character.abilityScores.dexterity ?? 10);

            let ability = details.rangeType === "Ranged" ? "dexterity" : "strength";
            if (isFinesse && dexMod > strMod) {
                ability = "dexterity";
            }

            const abilityModifier = getAbilityModifier(character.abilityScores[ability] ?? 10);
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

            return {
                id: `weapon-${weapon.id}`,
                name: weapon.name,
                type: "Attack",
                description: `A ${details.category.toLowerCase()} ${details.rangeType.toLowerCase()} weapon attack. Properties: ${details.properties?.join(", ") || "None"}.`,
                damage: `${details.damageDice}${damageBonus >= 0 ? "+" : ""}${damageBonus}`,
                damageType: details.damageType,
                versatileDamage: versatileDamage,
                range: details.rangeType === "Ranged" ? "80/320" : "5 ft", // default ranges, ideally should be in weaponDetails
                reach: details.rangeType === "Melee" ? "5 ft" : undefined,
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

    // Merge manual and weapon actions, prioritizing manual if IDs conflict (though they shouldn't)
    const combined = [...manualActions];
    weaponActions.forEach(wa => {
        if (!combined.some(a => a.id === wa.id)) {
            combined.push(wa);
        }
    });

    return combined;
};
