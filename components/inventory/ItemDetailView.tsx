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
                return resources.find(r => r.id === m.id) || resources.find(r => r.name === name);
            })
            .filter((r): r is Resource => !!r)
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 flex items-center gap-4 bg-secondary/30 p-2 rounded border border-border">
                <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase whitespace-nowrap">Item Type:</label>
                    <select
                        value={item.itemType || "other"}
                        onChange={(e) => updateItem(item.id, "itemType", e.target.value)}
                        className="text-xs border border-border rounded p-1 bg-background min-w-[120px] focus:ring-1 focus:ring-primary outline-none"
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
                <select
                    value={item.parentId || ""}
                    onChange={(e) => updateItem(item.id, "parentId", e.target.value || undefined)}
                    className="w-full p-2 border border-border rounded text-xs bg-background focus:ring-1 focus:ring-primary outline-none"
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

            {/* Nested Specific Detail Editors */}
            {item.itemType === "weapon" && item.weaponDetails && (
                <div className="md:col-span-2 mt-2 p-3 bg-primary/5 rounded border border-primary/20 space-y-3">
                    <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-1">Weapon Stats</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                        <div>
                            <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-1">Category</label>
                            <select
                                value={item.weaponDetails.category}
                                onChange={e => updateItem(item.id, "weaponDetails", { ...item.weaponDetails, category: e.target.value as any })}
                                className="w-full p-2 border border-border rounded text-xs bg-background focus:ring-1 focus:ring-primary outline-none"
                            >
                                <option value="Simple">Simple</option>
                                <option value="Martial">Martial</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-1">Range</label>
                            <select
                                value={item.weaponDetails.rangeType}
                                onChange={e => updateItem(item.id, "weaponDetails", { ...item.weaponDetails, rangeType: e.target.value as any })}
                                className="w-full p-2 border border-border rounded text-xs bg-background focus:ring-1 focus:ring-primary outline-none"
                            >
                                <option value="Melee">Melee</option>
                                <option value="Ranged">Ranged</option>
                            </select>
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
                            <input
                                type="text"
                                value={item.weaponDetails.damageType}
                                onChange={e => updateItem(item.id, "weaponDetails", { ...item.weaponDetails, damageType: e.target.value })}
                                className="w-full p-2 border border-border rounded text-xs bg-background focus:ring-1 focus:ring-primary outline-none"
                                placeholder="slashing"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-1">Properties</label>
                            <input
                                type="text"
                                value={item.weaponDetails.properties.join(", ")}
                                onChange={e => updateItem(item.id, "weaponDetails", {
                                    ...item.weaponDetails,
                                    properties: e.target.value.split(",").map(p => p.trim()).filter(p => p !== "")
                                })}
                                className="w-full p-2 border border-border rounded text-xs bg-background focus:ring-1 focus:ring-primary outline-none"
                                placeholder="Finesse, Light, etc."
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-1">Mastery</label>
                            <input
                                type="text"
                                value={item.weaponDetails.mastery || ""}
                                onChange={e => updateItem(item.id, "weaponDetails", { ...item.weaponDetails, mastery: e.target.value })}
                                placeholder="Vex, Nick, etc."
                                className="w-full p-2 border border-border rounded text-xs bg-background focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>
                    </div>
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
                            <select
                                value={item.armorDetails.category}
                                onChange={e => updateItem(item.id, "armorDetails", { ...item.armorDetails, category: e.target.value as any })}
                                className="w-full p-2 border border-border rounded text-xs bg-background focus:ring-1 focus:ring-primary outline-none"
                            >
                                <option value="Light">Light</option>
                                <option value="Medium">Medium</option>
                                <option value="Heavy">Heavy</option>
                                <option value="Shield">Shield</option>
                            </select>
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
                                <select
                                    value={item.toolDetails.category}
                                    onChange={e => updateItem(item.id, "toolDetails", { ...item.toolDetails, category: e.target.value as any })}
                                    className="w-full p-2 border border-border rounded text-xs bg-background focus:ring-1 focus:ring-primary outline-none"
                                >
                                    <option value="Artisan Tool">Artisan Tool</option>
                                    <option value="Other Tool">Other Tool</option>
                                    <option value="Gaming Set">Gaming Set</option>
                                    <option value="Musical Instrument">Musical Instrument</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-1">Ability</label>
                                <input
                                    type="text"
                                    value={item.toolDetails.ability}
                                    onChange={e => updateItem(item.id, "toolDetails", { ...item.toolDetails, ability: e.target.value })}
                                    className="w-full p-2 border border-border rounded text-xs bg-background focus:ring-1 focus:ring-primary outline-none"
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
