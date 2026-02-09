export interface ArmorBaseData {
    name: string;
    category: "Light" | "Medium" | "Heavy" | "Shield";
    ac: number;
    dexBonus: boolean;
    dexCap?: number;
    strengthRequirement?: number;
    stealthDisadvantage: boolean;
    weight: number;
    costGP: number;
}

export const ARMOR_DATA: Record<string, ArmorBaseData> = {
    // Light Armor
    "Padded Armor": { name: "Padded Armor", category: "Light", ac: 11, dexBonus: true, stealthDisadvantage: true, weight: 8, costGP: 5 },
    "Leather Armor": { name: "Leather Armor", category: "Light", ac: 11, dexBonus: true, stealthDisadvantage: false, weight: 10, costGP: 10 },
    "Studded Leather Armor": { name: "Studded Leather Armor", category: "Light", ac: 12, dexBonus: true, stealthDisadvantage: false, weight: 13, costGP: 45 },

    // Medium Armor
    "Hide Armor": { name: "Hide Armor", category: "Medium", ac: 12, dexBonus: true, dexCap: 2, stealthDisadvantage: false, weight: 12, costGP: 10 },
    "Chain Shirt": { name: "Chain Shirt", category: "Medium", ac: 13, dexBonus: true, dexCap: 2, stealthDisadvantage: false, weight: 20, costGP: 50 },
    "Scale Mail": { name: "Scale Mail", category: "Medium", ac: 14, dexBonus: true, dexCap: 2, stealthDisadvantage: true, weight: 45, costGP: 50 },
    "Breastplate": { name: "Breastplate", category: "Medium", ac: 14, dexBonus: true, dexCap: 2, stealthDisadvantage: false, weight: 20, costGP: 400 },
    "Half Plate Armor": { name: "Half Plate Armor", category: "Medium", ac: 15, dexBonus: true, dexCap: 2, stealthDisadvantage: true, weight: 40, costGP: 750 },

    // Heavy Armor
    "Ring Mail": { name: "Ring Mail", category: "Heavy", ac: 14, dexBonus: false, stealthDisadvantage: true, weight: 40, costGP: 30 },
    "Chain Mail": { name: "Chain Mail", category: "Heavy", ac: 16, dexBonus: false, strengthRequirement: 13, stealthDisadvantage: true, weight: 55, costGP: 75 },
    "Splint Armor": { name: "Splint Armor", category: "Heavy", ac: 17, dexBonus: false, strengthRequirement: 15, stealthDisadvantage: true, weight: 60, costGP: 200 },
    "Plate Armor": { name: "Plate Armor", category: "Heavy", ac: 18, dexBonus: false, strengthRequirement: 15, stealthDisadvantage: true, weight: 65, costGP: 1500 },

    // Shield
    "Shield": { name: "Shield", category: "Shield", ac: 2, dexBonus: false, stealthDisadvantage: false, weight: 6, costGP: 10 },
};
