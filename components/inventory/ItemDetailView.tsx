import { InventoryItem, Resource } from "../../types/character";
import ItemFeaturesEditor from "./ItemFeaturesEditor";
import ResourcePipTracker from "../ResourcePipTracker";

interface ItemDetailViewProps {
    item: InventoryItem;
    containers: InventoryItem[];
    updateItem: (id: string, field: keyof InventoryItem, value: any) => void;
    resources?: Resource[];
    onUpdateResources?: (resources: Resource[]) => void;
}

const ItemDetailView: React.FC<ItemDetailViewProps> = ({
    item,
    containers,
    updateItem,
    resources = [],
    onUpdateResources
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
                return resources.find(r => r.name === name);
            })
            .filter((r): r is Resource => !!r)
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 flex items-center gap-4 bg-gray-50 dark:bg-gray-900/50 p-2 rounded border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase whitespace-nowrap">Item Type:</label>
                    <select
                        value={item.itemType || "other"}
                        onChange={(e) => updateItem(item.id, "itemType", e.target.value)}
                        className="text-xs border rounded p-1 bg-white dark:bg-gray-950 min-w-[120px]"
                    >
                        <option value="other">Other</option>
                        <option value="weapon">Weapon</option>
                        <option value="armor">Armor</option>
                        <option value="shield">Shield</option>
                        <option value="container">Container</option>
                        <option value="tool">Tool</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase">Description</label>
                <textarea
                    value={item.description || ""}
                    onChange={e => updateItem(item.id, "description", e.target.value)}
                    className="w-full p-2 border rounded text-xs bg-white"
                    rows={2}
                    placeholder="No description..."
                />
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                        <input
                            type="checkbox"
                            checked={item.equippable || false}
                            onChange={e => updateItem(item.id, "equippable", e.target.checked)}
                            className="w-3 h-3"
                        />
                        Equippable
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                        <input
                            type="checkbox"
                            checked={item.attunable || false}
                            onChange={e => updateItem(item.id, "attunable", e.target.checked)}
                            className="w-3 h-3"
                        />
                        Attunable
                    </label>
                </div>
            </div>
            <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase">Location / Container</label>
                <select
                    value={item.parentId || ""}
                    onChange={(e) => updateItem(item.id, "parentId", e.target.value || undefined)}
                    className="w-full p-2 border rounded text-xs bg-white"
                >
                    <option value="">Carried (Root)</option>
                    {containers
                        .filter(c => c.id !== item.id) // Can't put inside self
                        .map(c => (
                            <option key={c.id} value={c.id}>Inside: {c.name}</option>
                        ))
                    }
                </select>

                {item.isContainer && item.containerDetails && (
                    <div className="p-2 bg-green-50 rounded border border-green-100 space-y-2 mt-2">
                        <label className="block text-[10px] font-bold text-green-800 uppercase">Container Settings</label>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[9px] text-gray-500">Capacity (lbs)</label>
                                <input
                                    type="number"
                                    value={item.containerDetails.capacityWeight ?? ""}
                                    onChange={e => updateItem(item.id, "containerDetails", { ...item.containerDetails, capacityWeight: parseInt(e.target.value) || undefined })}
                                    className="w-full p-1 border rounded text-[10px]"
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] text-gray-500">Wt Mult</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={item.containerDetails.contentsWeightMultiplier}
                                    onChange={e => updateItem(item.id, "containerDetails", { ...item.containerDetails, contentsWeightMultiplier: parseFloat(e.target.value) || 0 })}
                                    className="w-full p-1 border rounded text-[10px]"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Nested Specific Detail Editors */}
            {item.itemType === "weapon" && item.weaponDetails && (
                <div className="md:col-span-2 mt-2 p-3 bg-red-50/30 rounded border border-red-100">
                    <label className="block text-[10px] font-bold text-red-800 uppercase mb-2">Weapon Stats</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                        <div>
                            <label className="block text-[9px] text-gray-500">Category</label>
                            <select
                                value={item.weaponDetails.category}
                                onChange={e => updateItem(item.id, "weaponDetails", { ...item.weaponDetails, category: e.target.value as any })}
                                className="w-full p-1 border rounded text-xs bg-white"
                            >
                                <option value="Simple">Simple</option>
                                <option value="Martial">Martial</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[9px] text-gray-500">Range</label>
                            <select
                                value={item.weaponDetails.rangeType}
                                onChange={e => updateItem(item.id, "weaponDetails", { ...item.weaponDetails, rangeType: e.target.value as any })}
                                className="w-full p-1 border rounded text-xs bg-white"
                            >
                                <option value="Melee">Melee</option>
                                <option value="Ranged">Ranged</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[9px] text-gray-500">Damage</label>
                            <input
                                type="text"
                                value={item.weaponDetails.damageDice}
                                onChange={e => updateItem(item.id, "weaponDetails", { ...item.weaponDetails, damageDice: e.target.value })}
                                className="w-full p-1 border rounded text-xs"
                                placeholder="1d6"
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] text-gray-500">Type</label>
                            <input
                                type="text"
                                value={item.weaponDetails.damageType}
                                onChange={e => updateItem(item.id, "weaponDetails", { ...item.weaponDetails, damageType: e.target.value })}
                                className="w-full p-1 border rounded text-xs"
                                placeholder="slashing"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                            <label className="block text-[9px] text-gray-500">Properties</label>
                            <input
                                type="text"
                                value={item.weaponDetails.properties.join(", ")}
                                onChange={e => updateItem(item.id, "weaponDetails", {
                                    ...item.weaponDetails,
                                    properties: e.target.value.split(",").map(p => p.trim()).filter(p => p !== "")
                                })}
                                className="w-full p-1 border rounded text-xs"
                                placeholder="Finesse, Light, etc."
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] text-gray-500">Mastery</label>
                            <input
                                type="text"
                                value={item.weaponDetails.mastery || ""}
                                onChange={e => updateItem(item.id, "weaponDetails", { ...item.weaponDetails, mastery: e.target.value })}
                                placeholder="Vex, Nick, etc."
                                className="w-full p-1 border rounded text-xs"
                            />
                        </div>
                    </div>
                </div>
            )}

            {(item.itemType === "armor" || item.itemType === "shield") && item.armorDetails && (
                <div className="md:col-span-2 mt-2 p-3 bg-blue-50/30 rounded border border-blue-100">
                    <label className="block text-[10px] font-bold text-blue-800 uppercase mb-2">Armor Stats</label>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                        {/* ... armor inputs ... */}
                        <div>
                            <label className="block text-[9px] text-gray-500">AC</label>
                            <input
                                type="number"
                                value={item.armorDetails.ac}
                                onChange={e => updateItem(item.id, "armorDetails", { ...item.armorDetails, ac: parseInt(e.target.value) || 0 })}
                                className="w-full p-1 border rounded text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] text-gray-500">Category</label>
                            <select
                                value={item.armorDetails.category}
                                onChange={e => updateItem(item.id, "armorDetails", { ...item.armorDetails, category: e.target.value as any })}
                                className="w-full p-1 border rounded text-xs bg-white"
                            >
                                <option value="Light">Light</option>
                                <option value="Medium">Medium</option>
                                <option value="Heavy">Heavy</option>
                                <option value="Shield">Shield</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[9px] text-gray-500">STR Req</label>
                            <input
                                type="number"
                                value={item.armorDetails.strengthRequirement ?? ""}
                                onChange={e => updateItem(item.id, "armorDetails", { ...item.armorDetails, strengthRequirement: parseInt(e.target.value) || undefined })}
                                className="w-full p-1 border rounded text-xs"
                                placeholder="None"
                            />
                        </div>
                        <div className="flex flex-col items-center">
                            <label className="block text-[9px] text-gray-500">Stealth Dis</label>
                            <input
                                type="checkbox"
                                checked={item.armorDetails.stealthDisadvantage}
                                onChange={e => updateItem(item.id, "armorDetails", { ...item.armorDetails, stealthDisadvantage: e.target.checked })}
                                className="w-4 h-4 mt-1"
                            />
                        </div>
                        <div className="flex flex-col items-center">
                            <label className="block text-[9px] text-gray-500">DEX Bonus</label>
                            <input
                                type="checkbox"
                                checked={item.armorDetails.dexBonus}
                                onChange={e => updateItem(item.id, "armorDetails", { ...item.armorDetails, dexBonus: e.target.checked })}
                                className="w-4 h-4 mt-1"
                            />
                        </div>
                        {item.armorDetails.dexBonus && (
                            <div className="col-span-full md:col-start-5">
                                <label className="block text-[9px] text-gray-500">DEX Cap</label>
                                <input
                                    type="number"
                                    value={item.armorDetails.dexCap ?? ""}
                                    onChange={e => updateItem(item.id, "armorDetails", { ...item.armorDetails, dexCap: parseInt(e.target.value) || undefined })}
                                    className="w-full p-1 border rounded text-xs"
                                    placeholder="No Cap"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {item.itemType === "tool" && item.toolDetails && (
                <div className="md:col-span-2 mt-2 p-3 bg-purple-50/30 rounded border border-purple-100">
                    <label className="block text-[10px] font-bold text-purple-800 uppercase mb-2">Tool Details</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[9px] text-gray-500">Category</label>
                                <select
                                    value={item.toolDetails.category}
                                    onChange={e => updateItem(item.id, "toolDetails", { ...item.toolDetails, category: e.target.value as any })}
                                    className="w-full p-1 border rounded text-xs bg-white"
                                >
                                    <option value="Artisan Tool">Artisan Tool</option>
                                    <option value="Other Tool">Other Tool</option>
                                    <option value="Gaming Set">Gaming Set</option>
                                    <option value="Musical Instrument">Musical Instrument</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[9px] text-gray-500">Ability</label>
                                <input
                                    type="text"
                                    value={item.toolDetails.ability}
                                    onChange={e => updateItem(item.id, "toolDetails", { ...item.toolDetails, ability: e.target.value })}
                                    className="w-full p-1 border rounded text-xs"
                                    placeholder="Dexterity"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[9px] text-gray-500">Utilize (2024 Rule)</label>
                                <textarea
                                    value={item.toolDetails.utilize}
                                    onChange={e => updateItem(item.id, "toolDetails", { ...item.toolDetails, utilize: e.target.value })}
                                    className="w-full p-1 border rounded text-xs bg-white"
                                    rows={2}
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] text-gray-500">Craft (2024 Rule)</label>
                                <textarea
                                    value={item.toolDetails.craft}
                                    onChange={e => updateItem(item.id, "toolDetails", { ...item.toolDetails, craft: e.target.value })}
                                    className="w-full p-1 border rounded text-xs bg-white"
                                    rows={2}
                                />
                            </div>
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
                    <label className="block text-[10px] font-bold text-blue-800 uppercase">Item Resources</label>
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
