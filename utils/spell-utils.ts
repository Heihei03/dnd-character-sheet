import { CharacterClass } from "../types/character";

export const CASTER_TYPES = {
    FULL: ["Bard", "Cleric", "Druid", "Sorcerer", "Wizard"],
    HALF: ["Paladin", "Ranger", "Artificer"],
    THIRD: ["Eldritch Knight", "Arcane Trickster"], // Assuming these might be added as subclasses later, or added as classes
    WARLOCK: ["Warlock"], // Warlocks use Pact Magic, calculated separately
} as const;

export function calculateCasterLevel(classes: CharacterClass[]): number {
    let totalLevel = 0;

    for (const cls of classes) {
        if ((CASTER_TYPES.FULL as readonly string[]).includes(cls.name)) {
            totalLevel += cls.level;
        } else if ((CASTER_TYPES.HALF as readonly string[]).includes(cls.name)) {
            totalLevel += Math.ceil(cls.level / 2);
        } else if ((CASTER_TYPES.THIRD as readonly string[]).includes(cls.name)) {
            totalLevel += Math.floor(cls.level / 3);
        }
    }

    return totalLevel;
}

const SPELL_SLOTS_TABLE: Record<number, number[]> = {
    0: [],
    1: [2],
    2: [3],
    3: [4, 2],
    4: [4, 3],
    5: [4, 3, 2],
    6: [4, 3, 3],
    7: [4, 3, 3, 1],
    8: [4, 3, 3, 2],
    9: [4, 3, 3, 3, 1],
    10: [4, 3, 3, 3, 2],
    11: [4, 3, 3, 3, 2, 1],
    12: [4, 3, 3, 3, 2, 1],
    13: [4, 3, 3, 3, 2, 1, 1],
    14: [4, 3, 3, 3, 2, 1, 1],
    15: [4, 3, 3, 3, 2, 1, 1, 1],
    16: [4, 3, 3, 3, 2, 1, 1, 1],
    17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
    18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
    19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
    20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
};

const WARLOCK_SPELL_SLOTS: Record<number, { level: number, slots: number }> = {
    0: { level: 0, slots: 0 },
    1: { level: 1, slots: 1 },
    2: { level: 1, slots: 2 },
    3: { level: 2, slots: 2 },
    4: { level: 2, slots: 2 },
    5: { level: 3, slots: 2 },
    6: { level: 3, slots: 2 },
    7: { level: 4, slots: 2 },
    8: { level: 4, slots: 2 },
    9: { level: 5, slots: 2 },
    10: { level: 5, slots: 2 },
    11: { level: 5, slots: 3 },
    12: { level: 5, slots: 3 },
    13: { level: 5, slots: 3 },
    14: { level: 5, slots: 3 },
    15: { level: 5, slots: 3 },
    16: { level: 5, slots: 3 },
    17: { level: 5, slots: 4 },
    18: { level: 5, slots: 4 },
    19: { level: 5, slots: 4 },
    20: { level: 5, slots: 4 },
};

export function calculateSpellSlots(classes: CharacterClass[]): { level: number, max: number }[] {
    const casterLevel = calculateCasterLevel(classes);
    const slots = [...(SPELL_SLOTS_TABLE[casterLevel] || [])];

    const result = Array.from({ length: 9 }, (_, i) => ({
        level: i + 1,
        max: slots[i] || 0
    }));

    // Handle Warlock (Pact Magic)
    let warlockLevel = 0;
    for (const cls of classes) {
        if ((CASTER_TYPES.WARLOCK as readonly string[]).includes(cls.name)) {
            warlockLevel += cls.level;
        }
    }

    if (warlockLevel > 0) {
        const pactMagic = WARLOCK_SPELL_SLOTS[warlockLevel];
        if (pactMagic && pactMagic.slots > 0) {
            // Add pact magic slots to the generic slots
            const pactLevel = pactMagic.level;
            const existingSlot = result[pactLevel - 1];
            existingSlot.max += pactMagic.slots;
        }
    }

    return result;
}
