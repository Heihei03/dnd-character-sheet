import { Character, Sense, Defenses, DefenseEntry, Feature, ProficiencyLevel } from "../types/character";
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
