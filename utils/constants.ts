// utils/constants.ts
export const classOptions = [
  "Barbarian",
  "Bard",
  "Cleric",
  "Druid",
  "Fighter",
  "Monk",
  "Paladin",
  "Ranger",
  "Rogue",
  "Sorcerer",
  "Warlock",
  "Wizard",
  "Artificer",
];

export const classHitDice: { [key: string]: number } = {
  barbarian: 12,
  bard: 8,
  cleric: 8,
  druid: 8,
  fighter: 10,
  monk: 8,
  paladin: 10,
  ranger: 10,
  rogue: 8,
  sorcerer: 6,
  warlock: 8,
  wizard: 6,
  artificer: 8,
};

export const speedTypes = ["walk", "fly", "swim", "climb", "burrow"];

export const SKILL_LIST = [
  { name: "Acrobatics", key: "acrobatics", ability: "dexterity" },
  { name: "Animal Handling", key: "animalHandling", ability: "wisdom" },
  { name: "Arcana", key: "arcana", ability: "intelligence" },
  { name: "Athletics", key: "athletics", ability: "strength" },
  { name: "Deception", key: "deception", ability: "charisma" },
  { name: "History", key: "history", ability: "intelligence" },
  { name: "Insight", key: "insight", ability: "wisdom" },
  { name: "Intimidation", key: "intimidation", ability: "charisma" },
  { name: "Investigation", key: "investigation", ability: "intelligence" },
  { name: "Medicine", key: "medicine", ability: "wisdom" },
  { name: "Nature", key: "nature", ability: "intelligence" },
  { name: "Perception", key: "perception", ability: "wisdom" },
  { name: "Performance", key: "performance", ability: "charisma" },
  { name: "Persuasion", key: "persuasion", ability: "charisma" },
  { name: "Religion", key: "religion", ability: "intelligence" },
  { name: "Sleight of Hand", key: "sleightOfHand", ability: "dexterity" },
  { name: "Stealth", key: "stealth", ability: "dexterity" },
  { name: "Survival", key: "survival", ability: "wisdom" },
];

export const LANGUAGES = [
  "Common",
  "Dwarvish",
  "Elvish",
  "Giant",
  "Gnomish",
  "Goblin",
  "Halfling",
  "Orc",
  "Abyssal",
  "Celestial",
  "Draconic",
  "Deep Speech",
  "Infernal",
  "Primordial",
  "Sylvan",
  "Undercommon",
];
