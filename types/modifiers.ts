export type ModifierType = "Sense" | "Speed" | "Proficiency" | "Bonus" | "Action" | "Resistance" | "Immunity" | "Vulnerability" | "Override" | "Other";

export interface FeatureModifier {
    id: string;
    type: ModifierType;
    subType: string;
    value?: string | number;
}

export const MODIFIER_TYPES: ModifierType[] = ["Sense", "Speed", "Proficiency", "Bonus", "Action", "Resistance", "Immunity", "Vulnerability", "Override", "Other"];
