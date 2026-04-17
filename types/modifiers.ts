export type ModifierType = "Sense" | "Speed" | "Proficiency" | "Bonus" | "New Action" | "Spell" | "Resource" | "Resistance" | "Immunity" | "Vulnerability" | "Condition" | "Override" | "Advantage" | "Disadvantage" | "Roll" | "Extra Advantage" | "Other";

export interface FeatureModifier {
    id: string;
    type: ModifierType;
    subType: string;
    value?: string | number;
    requiresAttunement?: boolean;
    damageType?: string;
}

export const MODIFIER_TYPES: ModifierType[] = ["Sense", "Speed", "Proficiency", "Bonus", "New Action", "Spell", "Resource", "Resistance", "Immunity", "Vulnerability", "Condition", "Override", "Advantage", "Disadvantage", "Roll", "Extra Advantage", "Other"];
