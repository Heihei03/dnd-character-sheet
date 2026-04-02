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

export interface ToolDetails {
  baseTool?: string;
  category: "Artisan Tool" | "Other Tool" | "Gaming Set" | "Musical Instrument";
  ability: string; // e.g., "Dexterity", "Intelligence"
  utilize: string; // Action descriptions from 2024 rules
  craft: string;   // Crafting descriptions from 2024 rules
}

export interface ToolProficiency {
  name: string;
  ability: string;
  level: ProficiencyLevel;
  fromFeature?: boolean;
  fromFeatureId?: string;
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
  itemType?: "weapon" | "armor" | "shield" | "container" | "tool" | "other";
  weaponDetails?: WeaponDetails;
  armorDetails?: ArmorDetails;
  containerDetails?: ContainerDetails;
  toolDetails?: ToolDetails;
  isContainer?: boolean;
  parentId?: string;
  isWondrous?: boolean;
  description?: string;
  features?: Feature[];
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
  subclass?: string;
  usedHitDice?: number;
}

export interface Resource {
  id: string;
  name: string;
  max: number;
  value: number;
  regain: string; // e.g., "Short Rest", "Long Rest", "Dawn"
  regainAmount?: string; // e.g., "1d6 + 1", "All"
  fromFeature?: boolean;
  useAbilityMod?: keyof AbilityScores;
  useCharacterLevel?: boolean;
  useProficiencyBonus?: boolean;
  multiplier?: number;
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

export interface Condition {
  name: string;
  level?: number;
  fromFeature?: boolean;
}

export interface Sense {
  name: string;
  value: string;
  fromFeature?: boolean;
  fromFeatureId?: string;
}

export interface DefenseEntry {
  name: string;
  fromFeature?: boolean;
  fromFeatureId?: string;
}

export interface Defenses {
  resistances: DefenseEntry[];
  vulnerabilities: DefenseEntry[];
  immunities: DefenseEntry[];
}

import { FeatureModifier } from "./modifiers";

export interface Feature {
  id: string;
  name: string;
  description: string;
  origin: string; // "Class", "Background", "Item", "Feat", "Species", "Other"
  subOrigin?: string; // Specific class name, background name, etc.
  subclass?: string; // Optional subclass name
  modifiers?: FeatureModifier[];
  effects?: string[];
  sourceItemId?: string;
  level?: number;
}

export const ACTION_TYPES = ["Action", "Bonus Action", "Reaction", "Free Action"] as const;
export type ActionType = typeof ACTION_TYPES[number];

export interface Action {
  id: string;
  name: string;
  type: ActionType;
  description: string;
  activation?: string;
  range?: string;
  target?: string;
  reach?: string;
  damage?: string;
  damageType?: string;
  versatileDamage?: string;
  ability?: keyof AbilityScores;
  // Structured fields
  proficient?: boolean;
  attackAbility?: keyof AbilityScores;
  attackBonus?: number;
  damageDice?: string;
  damageAbility?: keyof AbilityScores;
  damageBonus?: number;
  versatileDice?: string;
  fromFeature?: boolean;
  fromWeapon?: boolean;
  resourceName?: string;
  // Upcasting
  baseLevel?: number;
  atHigherLevels?: string;
  higherLevelDamage?: string;
  higherLevelHealing?: string;
  healing?: string;
  scalesWithCharacterLevel?: boolean;
  resourceId?: string;
  isAttack?: boolean;
  critRange?: number;
  critExtraDamage?: string;
  critRule?: CritRule;
}

export interface SpellSlot {
  level: number;
  max: number;
  expended: number;
  experience?: number;
  critRule?: "double-dice" | "max-plus-roll" | "double-total";
}

export interface Spell {
  id: string;
  name: string;
  level: number; // 0 for cantrip
  school: string;
  castingTime: string;
  range: string;
  components: {
    v: boolean;
    s: boolean;
    m: boolean;
  };
  material?: string;
  duration: string;
  description: string;
  prepared: boolean;
  isRitual: boolean;
  requiresConcentration: boolean;
  spellcastingAbility?: keyof AbilityScores;
  source?: string;
  attackBonus?: number;
  saveDc?: number;
  damage?: string;
  hasAttack?: boolean;
  hasSave?: boolean;
  hasHeal?: boolean;
  damageOnly?: boolean;
  saveType?: string;
  healing?: string;
  damageType?: string;
  hasAoe?: boolean;
  aoeShape?: string;
  aoeSize?: string;
  atHigherLevels?: string;
  higherLevelDamage?: string;
  higherLevelHealing?: string;
  fromFeature?: boolean;
  fromFeatureId?: string;
  scalesWithCharacterLevel?: boolean;
  classSource?: string;
}

export interface Bio {
  alignment?: string;
  age?: string;
  height?: string;
  weight?: string;
  eyes?: string;
  skin?: string;
  hair?: string;
  personalityTraits?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  backstory?: string;
  alliesAndOrganizations?: string;
  appearance?: string;
  treasure?: string;
}

export interface Character {
  id: number;
  name: string;
  imageUrl?: string;
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
  weaponProficiencies?: string[];
  armorProficiencies?: string[];
  toolProficiencies?: ToolProficiency[];
  languages?: string[];
  features?: Feature[];
  senses?: Sense[];
  defenses?: Defenses;
  actions?: Action[];
  spells?: Spell[];
  spellSlots?: SpellSlot[];
  resources?: Resource[];
  conditions?: Condition[];
  species: string;
  subSpecies?: string;
  background: string;
  exp?: number;
  bio?: Bio;
  critRule?: CritRule;
  critRange?: number;
}

export type CritRule = 'double-dice' | 'max-plus-roll' | 'double-total';

export interface NormalizedCharacter extends Character {
  classes: CharacterClass[];
  abilityScores: AbilityScores;
  savingThrows: SavingThrows;
  skills: Skills;
  speed: Speed;
  inventory: InventoryItem[];
  currency: Currency;
  deathSaves: DeathSaves;
  armorClass: ArmorClass;
  initiative: Initiative;
  weaponProficiencies: string[];
  armorProficiencies: string[];
  toolProficiencies: ToolProficiency[];
  languages: string[];
  features: Feature[];
  senses: Sense[];
  defenses: Defenses;
  actions: Action[];
  spells: Spell[];
  spellSlots: SpellSlot[];
  resources: Resource[];
  conditions: Condition[];
  bio: Bio;
  imageUrl?: string;
  critRule: CritRule;
  critRange: number;
}
export interface RollEntry {
  id: string;
  timestamp: number;
  label: string;
  formula: string;
  rolls: number[];
  modifier: number;
  total: number;
  type: 'check' | 'damage' | 'save' | 'generic';
  damageType?: string;
  damageFormula?: string;
  critExtraDamage?: string;
  critRule?: CritRule;
  isCritical?: boolean;
  isFumble?: boolean;
  formatted: string;
}

export type RollDiceFunc = (
  sides: number,
  modifier?: number,
  label?: string,
  damageFormula?: string,
  damageType?: string,
  critRange?: number,
  critExtraDamage?: string,
  critRule?: CritRule,
  advantage?: boolean,
  disadvantage?: boolean,
  extraAdvantage?: number
) => void;

export type RollDamageFunc = (
  damageString: string,
  label?: string,
  damageType?: string,
  isCritical?: boolean,
  critExtraDamage?: string,
  ruleOverride?: CritRule
) => void;
