export type ModifierType = "Sense" | "Speed" | "Proficiency" | "Bonus" | "New Action" | "Spell" | "Resistance" | "Immunity" | "Vulnerability" | "Override" | "Other";

export interface FeatureModifier {
    id: string;
    type: ModifierType;
    subType: string;
    value?: string | number;
    requiresAttunement?: boolean;
}

export const MODIFIER_TYPES: ModifierType[] = ["Sense", "Speed", "Proficiency", "Bonus", "New Action", "Spell", "Resistance", "Immunity", "Vulnerability", "Override", "Other"];
