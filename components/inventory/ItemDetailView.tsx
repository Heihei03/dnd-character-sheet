import { InventoryItem, Resource } from "../../types/character";
import ItemFeaturesEditor from "./ItemFeaturesEditor";
import ResourcePipTracker from "../ResourcePipTracker";
import Select from "../ui/Select";
import {
    DAMAGE_TYPES,
    WEAPON_PROPERTIES,
    WEAPON_MASTERY_TYPES
} from "../../utils/constants";
import { ABILITY_NAMES } from "../../utils/character-utils";
import ThemedAutocomplete from "../ui/ThemedAutocomplete";
import { WEAPON_DATA } from "../../data/weapons";

interface ItemDetailViewProps {
    item: InventoryItem;
    containers: InventoryItem[];
    updateItem: (id: string, field: keyof InventoryItem, value: any) => void;
    resources?: Resource[];
    onUpdateResources?: (resources: Resource[]) => void;
    summonStatblocks?: any[];
}

const ItemDetailView: React.FC<ItemDetailViewProps> = ({
    item,
    containers,
    updateItem,
    resources = [],
    onUpdateResources,
    summonStatblocks = []
}) => {
    const handleUpdateResourceValue = (id: string, newValue: number) => {
        if (!onUpdateResources) return;
        const newResources = resources.map(r => r.id === id ? { ...r, value: newValue } : r);
        onUpdateResources(newResources);
    };

    // Find all resources associated with this item's features
    const itemResources = (item.features || []).flatMap(f =>
        (f.modifiers || [])
            .filter(m => m.type === "Resource")
            .map(m => {
                let name = "";
                try {
                    const data = JSON.parse(m.value as string);
                    name = data.name || f.name;
                } catch {
                    name = m.value as string || f.name;
                }
                return resources.find(r => r.id === m.id) || resources.find(r => r.name === name);
            })
            .filter((r): r is Resource => !!r)
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 flex items-center gap-4 bg-secondary/30 p-2 rounded border border-border">
                <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase whitespace-nowrap">Item Type:</label>
                    <Select
                        value={item.itemType || "other"}
                        onValueChange={(val) => updateItem(item.id, "itemType", val)}
                        options={[
                            { label: "Other", value: "other" },
                            { label: "Weapon", value: "weapon" },
                            { label: "Armor", value: "armor" },
                            { label: "Shield", value: "shield" },
                            { label: "Container", value: "container" },
                            { label: "Tool", value: "tool" },
                            { label: "Ammunition", value: "ammunition" },
                        ]}
                        className="min-w-[120px]"
                    />
                </div>
            </div>

            <div className="md:col-span-2 space-y-2">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase">Description</label>
                <textarea
                    value={item.description || ""}
                    onChange={e => updateItem(item.id, "description", e.target.value)}
                    className="w-full p-2 border border-border rounded text-xs bg-background focus:ring-1 focus:ring-primary outline-none"
                    rows={6}
                    placeholder="No description..."
                />
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                        <input
                            type="checkbox"
                            checked={item.equippable || false}
                            onChange={e => updateItem(item.id, "equippable", e.target.checked)}
                            className="w-3.5 h-3.5 accent-primary"
                        />
                        Equippable
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                        <input
                            type="checkbox"
                            checked={item.attunable || false}
                            onChange={e => updateItem(item.id, "attunable", e.target.checked)}
                            className="w-3.5 h-3.5 accent-primary"
                        />
                        Attunable
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                        <input
                            type="checkbox"
                            checked={item.isWondrous || false}
                            onChange={e => updateItem(item.id, "isWondrous", e.target.checked)}
                            className="w-3.5 h-3.5 accent-primary"
                        />
                        Wondrous
                    </label>
                </div>
            </div>
            <div className="md:col-span-2 space-y-2">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase">Location / Container</label>
                <Select
                    value={item.parentId || ""}
                    onValueChange={(val) => updateItem(item.id, "parentId", val || undefined)}
                    options={[
                        { label: "Carried (Root)", value: "" },
                        ...containers
                            .filter(c => c.id !== item.id)
                            .map(c => ({ label: `Inside: ${c.name}`, value: c.id }))
                    ]}
                />

                {item.isContainer && item.containerDetails && (
                    <div className="p-3 bg-primary/5 rounded border border-primary/20 space-y-3 mt-2">
                        <label className="block text-[10px] font-black text-primary uppercase tracking-widest">Container Settings</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-1">Capacity (lbs)</label>
                                <input
                                    type="number"
                                    value={item.containerDetails.capacityWeight ?? ""}
                                    onChange={e => updateItem(item.id, "containerDetails", { ...item.containerDetails, capacityWeight: parseInt(e.target.value) || undefined })}
                                    className="w-full p-2 border border-border rounded text-xs bg-background focus:ring-1 focus:ring-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-1">Wt Mult</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={item.containerDetails.contentsWeightMultiplier}
                                    onChange={e => updateItem(item.id, "containerDetails", { ...item.containerDetails, contentsWeightMultiplier: parseFloat(e.target.value) || 0 })}
                                    className="w-full p-2 border border-border rounded text-xs bg-background focus:ring-1 focus:ring-primary outline-none"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="md:col-span-2 p-3 bg-secondary/30 rounded-lg border border-border space-y-2 mt-2">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase">Linked Summon Statblock</label>
                <Select
                    value={item.linkedSummonStatblockId || ""}
                    onValueChange={(val) => updateItem(item.id, "linkedSummonStatblockId", val || undefined)}
                    options={[
                        { label: "None", value: "" },
                        ...summonStatblocks.map(s => ({ label: s.name, value: s.id }))
                    ]}
                />
                <p className="text-[10px] text-gray-500 italic leading-tight">
                    Link a creature template to add a quick "Summon" button to this item.
                </p>
            </div>

            {/* Nested Specific Detail Editors */}
            {item.itemType === "weapon" && item.weaponDetails && (
                <div className="md:col-span-2 mt-2 p-3 bg-primary/5 rounded border border-primary/20 space-y-3">
                    <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-1">Weapon Stats</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                        <div>
                            <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-1">Category</label>
                            <Select
                                value={item.weaponDetails.category}
                                onValueChange={val => updateItem(item.id, "weaponDetails", { ...item.weaponDetails, category: val as any })}
                                options={[
                                    { label: "Simple", value: "Simple" },
                                    { label: "Martial", value: "Martial" },
                                ]}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-1">Range</label>
                            <Select
                                value={item.weaponDetails.rangeType}
                                onValueChange={val => updateItem(item.id, "weaponDetails", { ...item.weaponDetails, rangeType: val as any })}
                                options={[
                                    { label: "Melee", value: "Melee" },
                                    { label: "Ranged", value: "Ranged" },
                                ]}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-1">Damage</label>
                            <input
                                type="text"
                                value={item.weaponDetails.damageDice}
                                onChange={e => updateItem(item.id, "weaponDetails", { ...item.weaponDetails, damageDice: e.target.value })}
                                className="w-full p-2 border border-border rounded text-xs bg-background focus:ring-1 focus:ring-primary outline-none font-mono"
                                placeholder="1d6"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-1">Type</label>
                            <ThemedAutocomplete
                                value={item.weaponDetails.damageType || ""}
                                onChange={val => updateItem(item.id, "weaponDetails", { ...item.weaponDetails, damageType: val })}
                                options={Array.from(DAMAGE_TYPES)}
                                placeholder="slashing"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-1">Properties</label>
                            <ThemedAutocomplete
                                value={item.weaponDetails.properties.join(", ")}
                                onChange={val => updateItem(item.id, "weaponDetails", {
                                    ...item.weaponDetails,
                                    properties: val.split(",").map(p => p.trim()).filter(p => p !== "")
                                })}
                                options={WEAPON_PROPERTIES}
                                placeholder="Finesse, Light, etc."
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-1">Mastery</label>
                            <ThemedAutocomplete
                                value={item.weaponDetails.mastery || ""}
                                onChange={val => updateItem(item.id, "weaponDetails", { ...item.weaponDetails, mastery: val })}
                                options={WEAPON_MASTERY_TYPES}
                                placeholder="Vex, Nick, etc."
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t border-purple-500/20 mt-2">
                        <label className="flex items-center gap-2.5 text-xs font-bold text-purple-700 dark:text-purple-400 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={item.weaponDetails.isPactWeapon || false}
                                onChange={e => updateItem(item.id, "weaponDetails", { ...item.weaponDetails, isPactWeapon: e.target.checked })}
                                className="w-4 h-4 rounded border-purple-300 dark:border-purple-900 text-purple-600 focus:ring-purple-500 bg-background accent-purple-600 cursor-pointer"
                            />
                            Pact Weapon (Uses Charisma)
                        </label>
                    </div>
                    {item.weaponDetails.isPactWeapon && (
                        <div className="flex flex-col gap-2 pt-2 animate-in fade-in duration-200">
                            <div className="flex items-center gap-2">
                                <label className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase whitespace-nowrap tracking-wider">Pact Form:</label>
                                <Select
                                    value={item.weaponDetails.baseWeapon || ""}
                                    onValueChange={(val) => {
                                        const baseWeapon = WEAPON_DATA[val];
                                        if (baseWeapon) {
                                            updateItem(item.id, "name", `Pact Weapon (${baseWeapon.name})`);
                                            updateItem(item.id, "weight", baseWeapon.weight);
                                            updateItem(item.id, "weaponDetails", {
                                                ...item.weaponDetails,
                                                baseWeapon: baseWeapon.name,
                                                category: baseWeapon.category,
                                                rangeType: baseWeapon.rangeType,
                                                damageDice: baseWeapon.damageDice,
                                                damageType: baseWeapon.damageType,
                                                properties: [...baseWeapon.properties],
                                                mastery: baseWeapon.mastery
                                            });
                                        }
                                    }}
                                    options={[
                                        { label: "-- Select Form --", value: "" },
                                        ...Object.keys(WEAPON_DATA).sort().map(name => ({ label: name, value: name }))
                                    ]}
                                    className="min-w-[160px] border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">Pact Damage Type:</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {(() => {
                                        const baseName = item.weaponDetails.baseWeapon || "Custom";
                                        const normalType = (baseName !== "Custom" && WEAPON_DATA[baseName]) 
                                            ? WEAPON_DATA[baseName].damageType 
                                            : (item.weaponDetails.damageType || "slashing");
                                        const capitalizedNormal = normalType.charAt(0).toUpperCase() + normalType.slice(1).toLowerCase();
                                        
                                        const options = [
                                            { label: `Normal (${capitalizedNormal})`, value: capitalizedNormal },
                                            { label: "Necrotic", value: "Necrotic" },
                                            { label: "Psychic", value: "Psychic" },
                                            { label: "Radiant", value: "Radiant" }
                                        ];
                                        
                                        const currentType = item.weaponDetails.damageType || capitalizedNormal;
                                        const normalizedCurrent = currentType.charAt(0).toUpperCase() + currentType.slice(1).toLowerCase();

                                        return options.map(opt => {
                                            const isActive = normalizedCurrent === opt.value;
                                            return (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => updateItem(item.id, "weaponDetails", { ...item.weaponDetails, damageType: opt.value })}
                                                    className={`text-[11px] font-bold px-2.5 py-1 rounded transition-all border ${isActive 
                                                        ? "bg-purple-600 text-white border-purple-600 shadow-sm" 
                                                        : "bg-background text-muted-foreground border-border hover:bg-secondary/50"
                                                    }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {(item.itemType === "armor" || item.itemType === "shield") && item.armorDetails && (
                <div className="md:col-span-2 mt-2 p-3 bg-primary/5 rounded border border-primary/20 space-y-3">
                    <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-1">Armor Stats</label>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-1">AC</label>
                            <input
                                type="number"
                                value={item.armorDetails.ac}
                                onChange={e => updateItem(item.id, "armorDetails", { ...item.armorDetails, ac: parseInt(e.target.value) || 0 })}
                                className="w-full p-2 border border-border rounded text-xs bg-background focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-1">Category</label>
                            <Select
                                value={item.armorDetails.category}
                                onValueChange={val => updateItem(item.id, "armorDetails", { ...item.armorDetails, category: val as any })}
                                options={[
                                    { label: "Light", value: "Light" },
                                    { label: "Medium", value: "Medium" },
                                    { label: "Heavy", value: "Heavy" },
                                    { label: "Shield", value: "Shield" },
                                ]}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-1">STR Req</label>
                            <input
                                type="number"
                                value={item.armorDetails.strengthRequirement ?? ""}
                                onChange={e => updateItem(item.id, "armorDetails", { ...item.armorDetails, strengthRequirement: parseInt(e.target.value) || undefined })}
                                className="w-full p-2 border border-border rounded text-xs bg-background focus:ring-1 focus:ring-primary outline-none"
                                placeholder="None"
                            />
                        </div>
                        <div className="flex flex-col items-center">
                            <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-1">Stealth</label>
                            <input
                                type="checkbox"
                                checked={item.armorDetails.stealthDisadvantage}
                                onChange={e => updateItem(item.id, "armorDetails", { ...item.armorDetails, stealthDisadvantage: e.target.checked })}
                                className="w-4 h-4 mt-1 accent-primary"
                            />
                        </div>
                        <div className="flex flex-col items-center">
                            <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-1">DEX Bonus</label>
                            <input
                                type="checkbox"
                                checked={item.armorDetails.dexBonus}
                                onChange={e => updateItem(item.id, "armorDetails", { ...item.armorDetails, dexBonus: e.target.checked })}
                                className="w-4 h-4 mt-1 accent-primary"
                            />
                        </div>
                        {item.armorDetails.dexBonus && (
                            <div className="col-span-full md:col-start-5">
                                <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-1">DEX Cap</label>
                                <input
                                    type="number"
                                    value={item.armorDetails.dexCap ?? ""}
                                    onChange={e => updateItem(item.id, "armorDetails", { ...item.armorDetails, dexCap: parseInt(e.target.value) || undefined })}
                                    className="w-full p-2 border border-border rounded text-xs bg-background focus:ring-1 focus:ring-primary outline-none"
                                    placeholder="No Cap"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {item.itemType === "tool" && item.toolDetails && (
                <div className="md:col-span-2 mt-2 p-3 bg-primary/5 rounded border border-primary/20 space-y-3">
                    <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-1">Tool Details</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-1">Category</label>
                                <Select
                                    value={item.toolDetails.category}
                                    onValueChange={val => updateItem(item.id, "toolDetails", { ...item.toolDetails, category: val as any })}
                                    options={[
                                        { label: "Artisan Tool", value: "Artisan Tool" },
                                        { label: "Other Tool", value: "Other Tool" },
                                        { label: "Gaming Set", value: "Gaming Set" },
                                        { label: "Musical Instrument", value: "Musical Instrument" },
                                    ]}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-1">Ability</label>
                                <ThemedAutocomplete
                                    value={item.toolDetails.ability}
                                    onChange={val => updateItem(item.id, "toolDetails", { ...item.toolDetails, ability: val })}
                                    options={ABILITY_NAMES}
                                    placeholder="Dexterity"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-1">Utilize (2024 Rule)</label>
                                <textarea
                                    value={item.toolDetails.utilize}
                                    onChange={e => updateItem(item.id, "toolDetails", { ...item.toolDetails, utilize: e.target.value })}
                                    className="w-full p-2 border border-border rounded text-xs bg-background focus:ring-1 focus:ring-primary outline-none"
                                    rows={2}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-1">Craft (2024 Rule)</label>
                                <textarea
                                    value={item.toolDetails.craft}
                                    onChange={e => updateItem(item.id, "toolDetails", { ...item.toolDetails, craft: e.target.value })}
                                    className="w-full p-2 border border-border rounded text-xs bg-background focus:ring-1 focus:ring-primary outline-none"
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {item.itemType === "ammunition" && item.ammunitionDetails && (
                <div className="md:col-span-2 mt-2 p-3 bg-primary/5 rounded border border-primary/20 space-y-3">
                    <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-1">Ammunition Stats</label>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-1">Category</label>
                            <ThemedAutocomplete
                                value={item.ammunitionDetails.category}
                                onChange={val => updateItem(item.id, "ammunitionDetails", { ...item.ammunitionDetails, category: val })}
                                options={["Arrows", "Bolts", "Bullets", "Needles", "Sling Bullets"]}
                                placeholder="Arrows"
                            />
                        </div>
                    </div>
                </div>
            )}

            <ItemFeaturesEditor
                itemName={item.name}
                features={item.features || []}
                onUpdate={features => updateItem(item.id, "features", features)}
            />

            {itemResources.length > 0 && (
                <div className="md:col-span-2 space-y-3 mt-2 border-t pt-4">
                    <label className="block text-xs font-bold text-blue-800 uppercase">Item Resources</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {itemResources.map(resource => (
                            <ResourcePipTracker
                                key={resource.id}
                                resource={resource}
                                onUpdate={(val) => handleUpdateResourceValue(resource.id, val)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItemDetailView;
