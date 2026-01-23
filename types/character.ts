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
  description?: string;
}

export interface Currency {
  cp: number;
  sp: number;
  ep: number;
  gp: number;
  pp: number;
}

export interface Character {
  id: number;
  name: string;
  maxHp: number;
  hp: number;
  tempHp: number;
  level: number;
  characterClass: string;
  abilityScores: AbilityScores;
  savingThrows?: SavingThrows;
  skills?: Skills;
  speed?: Speed;
  inventory?: InventoryItem[];
  currency?: Currency;
}
