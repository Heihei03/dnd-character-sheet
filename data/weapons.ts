export interface WeaponBaseData {
    name: string;
    category: "Simple" | "Martial";
    rangeType: "Melee" | "Ranged";
    damageDice: string; // e.g. "1d6"
    damageType: string; // e.g. "piercing"
    properties: string[];
    mastery?: string;
    weight: number;
    costGP: number; // Normalized to GP
}

export const WEAPON_DATA: Record<string, WeaponBaseData> = {
    // Simple Melee
    "Club": { name: "Club", category: "Simple", rangeType: "Melee", damageDice: "1d4", damageType: "bludgeoning", properties: ["Light"], mastery: "Slow", weight: 2, costGP: 0.1 },
    "Dagger": { name: "Dagger", category: "Simple", rangeType: "Melee", damageDice: "1d4", damageType: "piercing", properties: ["Finesse", "Light", "Thrown (20/60)"], mastery: "Nick", weight: 1, costGP: 2 },
    "Greatclub": { name: "Greatclub", category: "Simple", rangeType: "Melee", damageDice: "1d8", damageType: "bludgeoning", properties: ["Two-handed"], mastery: "Push", weight: 10, costGP: 0.2 },
    "Handaxe": { name: "Handaxe", category: "Simple", rangeType: "Melee", damageDice: "1d6", damageType: "slashing", properties: ["Light", "Thrown (20/60)"], mastery: "Vex", weight: 2, costGP: 5 },
    "Javelin": { name: "Javelin", category: "Simple", rangeType: "Melee", damageDice: "1d6", damageType: "piercing", properties: ["Thrown (30/120)"], mastery: "Slow", weight: 2, costGP: 0.5 },
    "Light Hammer": { name: "Light Hammer", category: "Simple", rangeType: "Melee", damageDice: "1d4", damageType: "bludgeoning", properties: ["Light", "Thrown (20/60)"], mastery: "Nick", weight: 2, costGP: 2 },
    "Mace": { name: "Mace", category: "Simple", rangeType: "Melee", damageDice: "1d6", damageType: "bludgeoning", properties: [], mastery: "Sap", weight: 4, costGP: 5 },
    "Quarterstaff": { name: "Quarterstaff", category: "Simple", rangeType: "Melee", damageDice: "1d6", damageType: "bludgeoning", properties: ["Versatile (1d8)"], mastery: "Topple", weight: 4, costGP: 0.2 },
    "Sickle": { name: "Sickle", category: "Simple", rangeType: "Melee", damageDice: "1d4", damageType: "slashing", properties: ["Light"], mastery: "Nick", weight: 2, costGP: 1 },
    "Spear": { name: "Spear", category: "Simple", rangeType: "Melee", damageDice: "1d6", damageType: "piercing", properties: ["Thrown (20/60)", "Versatile (1d8)"], mastery: "Sap", weight: 3, costGP: 1 },
    "Unarmed Strike": { name: "Unarmed Strike", category: "Simple", rangeType: "Melee", damageDice: "1", damageType: "bludgeoning", properties: [], weight: 0, costGP: 0 },

    // Simple Ranged
    "Light Crossbow": { name: "Light Crossbow", category: "Simple", rangeType: "Ranged", damageDice: "1d8", damageType: "piercing", properties: ["Ammunition (80/320)", "Loading", "Two-handed"], mastery: "Slow", weight: 5, costGP: 25 },
    "Dart": { name: "Dart", category: "Simple", rangeType: "Ranged", damageDice: "1d4", damageType: "piercing", properties: ["Finesse", "Thrown (20/60)"], mastery: "Vex", weight: 0.25, costGP: 0.05 },
    "Shortbow": { name: "Shortbow", category: "Simple", rangeType: "Ranged", damageDice: "1d6", damageType: "piercing", properties: ["Ammunition (80/320)", "Two-handed"], mastery: "Vex", weight: 2, costGP: 25 },
    "Sling": { name: "Sling", category: "Simple", rangeType: "Ranged", damageDice: "1d4", damageType: "bludgeoning", properties: ["Ammunition (30/120)"], mastery: "Slow", weight: 0, costGP: 0.1 },

    // Martial Melee
    "Battleaxe": { name: "Battleaxe", category: "Martial", rangeType: "Melee", damageDice: "1d8", damageType: "slashing", properties: ["Versatile (1d10)"], mastery: "Topple", weight: 4, costGP: 10 },
    "Flail": { name: "Flail", category: "Martial", rangeType: "Melee", damageDice: "1d8", damageType: "bludgeoning", properties: [], mastery: "Sap", weight: 2, costGP: 10 },
    "Glaive": { name: "Glaive", category: "Martial", rangeType: "Melee", damageDice: "1d10", damageType: "slashing", properties: ["Heavy", "Reach", "Two-handed"], mastery: "Graze", weight: 6, costGP: 20 },
    "Greataxe": { name: "Greataxe", category: "Martial", rangeType: "Melee", damageDice: "1d12", damageType: "slashing", properties: ["Heavy", "Two-handed"], mastery: "Cleave", weight: 7, costGP: 30 },
    "Greatsword": { name: "Greatsword", category: "Martial", rangeType: "Melee", damageDice: "2d6", damageType: "slashing", properties: ["Heavy", "Two-handed"], mastery: "Graze", weight: 6, costGP: 50 },
    "Halberd": { name: "Halberd", category: "Martial", rangeType: "Melee", damageDice: "1d10", damageType: "slashing", properties: ["Heavy", "Reach", "Two-handed"], mastery: "Cleave", weight: 6, costGP: 20 },
    "Lance": { name: "Lance", category: "Martial", rangeType: "Melee", damageDice: "1d12", damageType: "piercing", properties: ["Reach", "Special"], mastery: "Topple", weight: 6, costGP: 10 },
    "Longsword": { name: "Longsword", category: "Martial", rangeType: "Melee", damageDice: "1d8", damageType: "slashing", properties: ["Versatile (1d10)"], mastery: "Sap", weight: 3, costGP: 15 },
    "Maul": { name: "Maul", category: "Martial", rangeType: "Melee", damageDice: "2d6", damageType: "bludgeoning", properties: ["Heavy", "Two-handed"], mastery: "Topple", weight: 10, costGP: 10 },
    "Morningstar": { name: "Morningstar", category: "Martial", rangeType: "Melee", damageDice: "1d8", damageType: "piercing", properties: [], mastery: "Sap", weight: 4, costGP: 15 },
    "Pike": { name: "Pike", category: "Martial", rangeType: "Melee", damageDice: "1d10", damageType: "piercing", properties: ["Heavy", "Reach", "Two-handed"], mastery: "Push", weight: 18, costGP: 5 },
    "Rapier": { name: "Rapier", category: "Martial", rangeType: "Melee", damageDice: "1d8", damageType: "piercing", properties: ["Finesse"], mastery: "Vex", weight: 2, costGP: 25 },
    "Scimitar": { name: "Scimitar", category: "Martial", rangeType: "Melee", damageDice: "1d6", damageType: "slashing", properties: ["Finesse", "Light"], mastery: "Nick", weight: 3, costGP: 25 },
    "Shortsword": { name: "Shortsword", category: "Martial", rangeType: "Melee", damageDice: "1d6", damageType: "piercing", properties: ["Finesse", "Light"], mastery: "Vex", weight: 2, costGP: 10 },
    "Trident": { name: "Trident", category: "Martial", rangeType: "Melee", damageDice: "1d6", damageType: "piercing", properties: ["Thrown (20/60)", "Versatile (1d8)"], mastery: "Topple", weight: 4, costGP: 5 },
    "War Pick": { name: "War Pick", category: "Martial", rangeType: "Melee", damageDice: "1d8", damageType: "piercing", properties: ["Versatile (1d10)"], mastery: "Sap", weight: 2, costGP: 5 },
    "Warhammer": { name: "Warhammer", category: "Martial", rangeType: "Melee", damageDice: "1d8", damageType: "bludgeoning", properties: ["Versatile (1d10)"], mastery: "Push", weight: 2, costGP: 15 },
    "Whip": { name: "Whip", category: "Martial", rangeType: "Melee", damageDice: "1d4", damageType: "slashing", properties: ["Finesse", "Reach"], mastery: "Slow", weight: 3, costGP: 2 },

    // Martial Ranged
    "Blowgun": { name: "Blowgun", category: "Martial", rangeType: "Ranged", damageDice: "1", damageType: "piercing", properties: ["Ammunition (25/100)", "Loading"], mastery: "Vex", weight: 1, costGP: 10 },
    "Hand Crossbow": { name: "Hand Crossbow", category: "Martial", rangeType: "Ranged", damageDice: "1d6", damageType: "piercing", properties: ["Ammunition (30/120)", "Light", "Loading"], mastery: "Vex", weight: 3, costGP: 75 },
    "Heavy Crossbow": { name: "Heavy Crossbow", category: "Martial", rangeType: "Ranged", damageDice: "1d10", damageType: "piercing", properties: ["Ammunition (100/400)", "Heavy", "Loading", "Two-handed"], mastery: "Push", weight: 18, costGP: 50 },
    "Longbow": { name: "Longbow", category: "Martial", rangeType: "Ranged", damageDice: "1d8", damageType: "piercing", properties: ["Ammunition (150/600)", "Heavy", "Two-handed"], mastery: "Slow", weight: 2, costGP: 50 },
};
