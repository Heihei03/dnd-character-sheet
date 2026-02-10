export interface ToolBaseData {
    name: string;
    category: "Artisan Tool" | "Other Tool" | "Gaming Set" | "Musical Instrument";
    ability: string;
    utilize: string;
    craft: string;
    weight: number;
    costGP: number;
}

export const TOOL_DATA: Record<string, ToolBaseData> = {
    // Artisan Tools
    "Alchemist's Supplies": {
        name: "Alchemist's Supplies",
        category: "Artisan Tool",
        ability: "Intelligence",
        utilize: "Identify a substance (DC 15), or start a fire (DC 15)",
        craft: "Acid, Alchemist’s Fire, Component Pouch, Oil, Paper, Perfume",
        weight: 8,
        costGP: 50
    },
    "Brewer's Supplies": {
        name: "Brewer's Supplies",
        category: "Artisan Tool",
        ability: "Wisdom",
        utilize: "Detect poisoned drink (DC 15), or identify alcohol (DC 10)",
        craft: "Antitoxin",
        weight: 9,
        costGP: 20
    },
    "Calligrapher's Supplies": {
        name: "Calligrapher's Supplies",
        category: "Artisan Tool",
        ability: "Dexterity",
        utilize: "Write text with impressive flourishes that guard against forgery (DC 15)",
        craft: "Ink, Spell Scroll",
        weight: 5,
        costGP: 10
    },
    "Carpenter's Tools": {
        name: "Carpenter's Tools",
        category: "Artisan Tool",
        ability: "Strength",
        utilize: "Seal or pry open a door or container (DC 20)",
        craft: "Club, Greatclub, Quarterstaff, Barrel, Chest, Ladder, Pole, Portable Ram, Torch",
        weight: 6,
        costGP: 8
    },
    "Cartographer's Tools": {
        name: "Cartographer's Tools",
        category: "Artisan Tool",
        ability: "Intelligence",
        utilize: "Draft a map of a small area (DC 15)",
        craft: "Map",
        weight: 6,
        costGP: 15
    },
    "Cobbler's Tools": {
        name: "Cobbler's Tools",
        category: "Artisan Tool",
        ability: "Dexterity",
        utilize: "Modify footwear to give Advantage on the wearer’s next Dexterity (Acrobatics) check (DC 10)",
        craft: "Climber’s Kit",
        weight: 5,
        costGP: 5
    },
    "Cook's Utensils": {
        name: "Cook's Utensils",
        category: "Artisan Tool",
        ability: "Wisdom",
        utilize: "Improve food’s flavor (DC 10), or detect spoiled or poisoned food (DC 15)",
        craft: "Rations",
        weight: 8,
        costGP: 1
    },
    "Glassblower's Tools": {
        name: "Glassblower's Tools",
        category: "Artisan Tool",
        ability: "Dexterity",
        utilize: "Discern what a glass object held in the past 24 hours (DC 15)",
        craft: "Glass Bottle, Magnifying Glass, Spyglass, Vial",
        weight: 5,
        costGP: 30
    },
    "Jeweler's Tools": {
        name: "Jeweler's Tools",
        category: "Artisan Tool",
        ability: "Dexterity",
        utilize: "Discern a gem's value (DC 15)",
        craft: "Arcane Focus, Holy Symbol",
        weight: 2,
        costGP: 25
    },
    "Leatherworker's Tools": {
        name: "Leatherworker's Tools",
        category: "Artisan Tool",
        ability: "Dexterity",
        utilize: "Add a design to a leather item (DC 10)",
        craft: "Sling, Whip, Hide Armor, Leather Armor, Studded Leather Armor, Backpack, Crossbow Bolt Case, Map or Scroll Case, Parchment, Pouch, Quiver, Waterskin",
        weight: 5,
        costGP: 5
    },
    "Mason's Tools": {
        name: "Mason's Tools",
        category: "Artisan Tool",
        ability: "Strength",
        utilize: "Find a weak point in a stone wall.",
        craft: "Stone structures, Statues.",
        weight: 8,
        costGP: 10
    },
    "Painter's Supplies": {
        name: "Painter's Supplies",
        category: "Artisan Tool",
        ability: "Dexterity",
        utilize: "Paint a recognizable image of something you've seen (DC 10)",
        craft: "Druidic Focus, Holy Symbol",
        weight: 5,
        costGP: 10
    },
    "Potter's Tools": {
        name: "Potter's Tools",
        category: "Artisan Tool",
        ability: "Dexterity",
        utilize: "Discern what a ceramic object held in the past 24 hours (DC 15)",
        craft: "Jug, Lamp",
        weight: 3,
        costGP: 10
    },
    "Smith's Tools": {
        name: "Smith's Tools",
        category: "Artisan Tool",
        ability: "Strength",
        utilize: "Pry open a door or container (DC 20)",
        craft: "Any Melee weapon (except Club, Greatclub, Quarterstaff, and Whip), Medium armor (except Hide), Heavy armor, Ball Bearings, Bucket, Caltrops, Chain, Crowbar, Firearm Bullets, Grappling Hook, Iron Pot, Iron Spikes, Sling Bullets",
        weight: 8,
        costGP: 20
    },
    "Tinker's Tools": {
        name: "Tinker's Tools",
        category: "Artisan Tool",
        ability: "Dexterity",
        utilize: "Assemble a Tiny item composed of scrap, which falls apart in 1 minute (DC 20)",
        craft: "Musket, Pistol, Bell, Bullseye Lantern, Flask, Hooded Lantern, Hunting Trap, Lock, Manacles, Mirror, Shovel, Signal Whistle, Tinderbox",
        weight: 10,
        costGP: 50
    },
    "Weaver's Tools": {
        name: "Weaver's Tools",
        category: "Artisan Tool",
        ability: "Dexterity",
        utilize: "Mend a tear in clothing (DC 10), or sew a Tiny design (DC 10)",
        craft: "Padded Armor, Basket, Bedroll, Blanket, Fine Clothes, Net, Robe, Rope, Sack, String, Tent, Traveler's Clothes",
        weight: 5,
        costGP: 1
    },
    "Woodcarver's Tools": {
        name: "Woodcarver's Tools",
        category: "Artisan Tool",
        ability: "Dexterity",
        utilize: "Carve a pattern in wood (DC 10)",
        craft: "Club, Greatclub, Quarterstaff, Ranged weapons (except Pistol, Musket, and Sling), Arcane Focus, Arrows, Bolts, Druidic Focus, Ink Pen, Needles",
        weight: 5,
        costGP: 1
    },

    // Other Tools
    "Disguise Kit": {
        name: "Disguise Kit",
        category: "Other Tool",
        ability: "Charisma",
        utilize: "Apply makeup (DC 10)",
        craft: "Costume",
        weight: 3,
        costGP: 25
    },
    "Forgery Kit": {
        name: "Forgery Kit",
        category: "Other Tool",
        ability: "Intelligence",
        utilize: "Mimic 10 or fewer words of someone else's handwriting (DC 15), or duplicate a wax seal (DC 20)",
        craft: "None.",
        weight: 5,
        costGP: 15
    },
    "Herbalism Kit": {
        name: "Herbalism Kit",
        category: "Other Tool",
        ability: "Intelligence",
        utilize: "Identify a plant (DC 10)",
        craft: "Antitoxin, Candle, Healer’s Kit, Potion of Healing",
        weight: 3,
        costGP: 5
    },
    "Navigator's Tools": {
        name: "Navigator's Tools",
        category: "Other Tool",
        ability: "Intelligence",
        utilize: "Plot a course (DC 10), or determine position by stargazing (DC 15)",
        craft: "Nautical charts.",
        weight: 2,
        costGP: 25
    },
    "Poisoner's Kit": {
        name: "Poisoner's Kit",
        category: "Other Tool",
        ability: "Intelligence",
        utilize: "Detect a poisoned object (DC 10)",
        craft: "Basic Poison",
        weight: 2,
        costGP: 50
    },
    "Thieves' Tools": {
        name: "Thieves' Tools",
        category: "Other Tool",
        ability: "Dexterity",
        utilize: "Pick a lock (DC 15), or disarm a trap (DC 15)",
        craft: "None.",
        weight: 1,
        costGP: 25
    },

    // Gaming Sets
    "Dice Set": {
        name: "Dice Set",
        category: "Gaming Set",
        ability: "Charisma",
        utilize: "Discern whether someone is cheating (DC 10), or win the game (DC 20)",
        craft: "None.",
        weight: 0,
        costGP: 0.1
    },
    "Dragonchess Set": {
        name: "Dragonchess Set",
        category: "Gaming Set",
        ability: "Intelligence",
        utilize: "Discern whether someone is cheating (DC 10), or win the game (DC 20)",
        craft: "None.",
        weight: 0.5,
        costGP: 1
    },
    "Playing Card Set": {
        name: "Playing Card Set",
        category: "Gaming Set",
        ability: "Charisma",
        utilize: "Discern whether someone is cheating (DC 10), or win the game (DC 20)",
        craft: "None.",
        weight: 0,
        costGP: 0.5
    },
    "Three-Dragon Ante Set": {
        name: "Three-Dragon Ante Set",
        category: "Gaming Set",
        ability: "Charisma",
        utilize: "Discern whether someone is cheating (DC 10), or win the game (DC 20)",
        craft: "None.",
        weight: 0,
        costGP: 1
    },

    // Musical Instruments
    "Bagpipes": {
        name: "Bagpipes",
        category: "Musical Instrument",
        ability: "Charisma",
        utilize: "Play a known tune (DC 10), or improvise a song (DC 15)",
        craft: "None.",
        weight: 6,
        costGP: 30
    },
    "Drum": {
        name: "Drum",
        category: "Musical Instrument",
        ability: "Charisma",
        utilize: "Play a known tune (DC 10), or improvise a song (DC 15)",
        craft: "None.",
        weight: 3,
        costGP: 6
    },
    "Dulcimer": {
        name: "Dulcimer",
        category: "Musical Instrument",
        ability: "Charisma",
        utilize: "Play a known tune (DC 10), or improvise a song (DC 15)",
        craft: "None.",
        weight: 10,
        costGP: 25
    },
    "Flute": {
        name: "Flute",
        category: "Musical Instrument",
        ability: "Charisma",
        utilize: "Play a known tune (DC 10), or improvise a song (DC 15)",
        craft: "None.",
        weight: 1,
        costGP: 2
    },
    "Lute": {
        name: "Lute",
        category: "Musical Instrument",
        ability: "Charisma",
        utilize: "Play a known tune (DC 10), or improvise a song (DC 15)",
        craft: "None.",
        weight: 2,
        costGP: 35
    },
    "Lyre": {
        name: "Lyre",
        category: "Musical Instrument",
        ability: "Charisma",
        utilize: "Play a known tune (DC 10), or improvise a song (DC 15)",
        craft: "None.",
        weight: 2,
        costGP: 30
    },
    "Horn": {
        name: "Horn",
        category: "Musical Instrument",
        ability: "Charisma",
        utilize: "Play a known tune (DC 10), or improvise a song (DC 15)",
        craft: "None.",
        weight: 2,
        costGP: 3
    },
    "Pan Flute": {
        name: "Pan Flute",
        category: "Musical Instrument",
        ability: "Charisma",
        utilize: "Play a known tune (DC 10), or improvise a song (DC 15)",
        craft: "None.",
        weight: 2,
        costGP: 12
    },
    "Shawm": {
        name: "Shawm",
        category: "Musical Instrument",
        ability: "Charisma",
        utilize: "Play a known tune (DC 10), or improvise a song (DC 15)",
        craft: "None.",
        weight: 1,
        costGP: 2
    },
    "Viol": {
        name: "Viol",
        category: "Musical Instrument",
        ability: "Charisma",
        utilize: "Play a known tune (DC 10), or improvise a song (DC 15)",
        craft: "None.",
        weight: 1,
        costGP: 30
    },
};
