export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  [key: string]: number;
}

export interface SavingThrows {
  strength: boolean;
  dexterity: boolean;
  constitution: boolean;
  intelligence: boolean;
  wisdom: boolean;
  charisma: boolean;
  [key: string]: boolean;
}

export interface SpeedEntry {
  value: number;
  from?: string;
}

export interface Speed {
  walk: SpeedEntry;
  fly?: SpeedEntry;
  swim?: SpeedEntry;
  climb?: SpeedEntry;
  burrow?: SpeedEntry;
  [key: string]: SpeedEntry | undefined;
}

export type ProficiencyLevel = "none" | "half" | "proficient" | "expertise";

export interface Skills {
  acrobatics: ProficiencyLevel;
  animalHandling: ProficiencyLevel;
  arcana: ProficiencyLevel;
  athletics: ProficiencyLevel;
  deception: ProficiencyLevel;
  history: ProficiencyLevel;
  insight: ProficiencyLevel;
  intimidation: ProficiencyLevel;
  investigation: ProficiencyLevel;
  medicine: ProficiencyLevel;
  nature: ProficiencyLevel;
  perception: ProficiencyLevel;
  performance: ProficiencyLevel;
  persuasion: ProficiencyLevel;
  religion: ProficiencyLevel;
  sleightOfHand: ProficiencyLevel;
  stealth: ProficiencyLevel;
  survival: ProficiencyLevel;
  [key: string]: ProficiencyLevel;
}

export interface WeaponDetails {
  baseWeapon?: string;
  category: "Simple" | "Martial";
  rangeType: "Melee" | "Ranged";
  properties: string[];
  mastery?: string;
  damageDice?: string;
  damageType?: string;
}

export interface ArmorDetails {
  baseArmor?: string;
  category: "Light" | "Medium" | "Heavy" | "Shield";
  ac: number;
  dexBonus: boolean;
  dexCap?: number;
  strengthRequirement?: number;
  stealthDisadvantage: boolean;
}

export interface ContainerDetails {
  capacityWeight?: number;
  contentsWeightMultiplier: number; // 0 for Bag of Holding, 1 for normal backpack
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  weight: number;
  costGP?: number;
  equipped?: boolean;
  attuned?: boolean;
  equippable?: boolean;
  attunable?: boolean;
  itemType?: "weapon" | "armor" | "shield" | "container" | "other";
  weaponDetails?: WeaponDetails;
  armorDetails?: ArmorDetails;
  containerDetails?: ContainerDetails;
  isContainer?: boolean;
  parentId?: string;
  description?: string;
}

export interface Currency {
  cp: number;
  sp: number;
  ep: number;
  gp: number;
  pp: number;
}

export interface CharacterClass {
  name: string;
  level: number;
  usedHitDice?: number;
}

export interface DeathSaves {
  successes: number;
  failures: number;
}

export interface ArmorClass {
  baseAC: number;
  hasDexBonus: boolean;
  dexCap?: number;
  secondaryAbility?: keyof AbilityScores;
  shieldBonus: number;
  miscBonus: number;
  manualOverride?: number;
}

export interface Initiative {
  miscBonus: number;
  useJackOfAllTrades: boolean;
  showDexTiebreaker: boolean;
}

export interface Character {
  id: number;
  name: string;
  maxHp: number;
  hp: number;
  tempHp: number;
  classes: CharacterClass[];
  abilityScores: AbilityScores;
  savingThrows?: SavingThrows;
  skills?: Skills;
  speed?: Speed;
  inventory?: InventoryItem[];
  currency?: Currency;
  deathSaves?: DeathSaves;
  armorClass?: ArmorClass;
  initiative?: Initiative;
}
