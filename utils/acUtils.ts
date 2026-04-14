import { ArmorClass, AbilityScores, Character, ActiveBonus } from "../types/character";

export const getModifier = (score: number) => Math.floor((score - 10) / 2);

export const calculateAC = (ac: ArmorClass, scores: AbilityScores, character?: Character): number => {
    if (ac.manualOverride !== undefined && ac.manualOverride !== null) {
        return ac.manualOverride;
    }

    let total = ac.baseAC;

    // Add DEX bonus
    if (ac.hasDexBonus) {
        const dexMod = getModifier(scores.dexterity);
        if (ac.dexCap !== undefined && ac.dexCap !== null) {
            total += Math.min(dexMod, ac.dexCap);
        } else {
            total += dexMod;
        }
    }

    // Add Secondary Ability bonus
    if (ac.secondaryAbility) {
        const secondaryMod = getModifier(scores[ac.secondaryAbility]);
        total += secondaryMod;
    }

    // Add Shield and Misc bonuses
    total += (ac.shieldBonus || 0);
    total += (ac.miscBonus || 0);

    // Add Active Bonuses
    if (character?.activeBonuses) {
        character.activeBonuses.forEach(b => {
            if (b.active && b.targets.includes('ac')) {
                const val = parseInt(b.bonus) || 0;
                total += val;
            }
        });
    }

    return total;
};
