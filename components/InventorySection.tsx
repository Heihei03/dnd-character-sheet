
import React, { useState } from "react";
import { InventoryItem, WeaponDetails, ArmorDetails } from "../types/character";
import { WEAPON_DATA } from "../data/weapons";
import { ARMOR_DATA } from "../data/armor";
import { Card, CardContent } from "./ui/card";
import Button from "./ui/button";
import ExpandableSection from "./ui/ExpandableSection";

interface InventorySectionProps {
    inventory: InventoryItem[];
    setInventory: (inventory: InventoryItem[]) => void;
}

const InventorySection: React.FC<InventorySectionProps> = ({
    inventory,
    setInventory,
}) => {
    const [newItemName, setNewItemName] = useState("");
    const [newItemWeight, setNewItemWeight] = useState(0);
    const [newItemCost, setNewItemCost] = useState(0);
    const [newItemQuantity, setNewItemQuantity] = useState(1);
    const [newItemEquippable, setNewItemEquippable] = useState(false);
    const [newItemAttunable, setNewItemAttunable] = useState(false);
    const [newItemType, setNewItemType] = useState<"weapon" | "armor" | "shield" | "other">("other");
    const [newItemWeaponDetails, setNewItemWeaponDetails] = useState<WeaponDetails | undefined>(undefined);
    const [newItemArmorDetails, setNewItemArmorDetails] = useState<ArmorDetails | undefined>(undefined);
    const [expandedItemIds, setExpandedItemIds] = useState<string[]>([]);

    const addItem = () => {
        if (newItemName.trim() === "") return;

        const newItem: InventoryItem = {
            id: Date.now().toString(),
            name: newItemName,
            weight: newItemWeight,
            quantity: newItemQuantity,
            costGP: newItemCost,
            equipped: false,
            attuned: false,
            equippable: newItemEquippable,

            attunable: newItemAttunable,
            itemType: newItemType,
            weaponDetails: newItemWeaponDetails,
            armorDetails: newItemArmorDetails,
            description: "",
        };

        setInventory([...inventory, newItem]);
        setNewItemName("");
        setNewItemWeight(0);
        setNewItemCost(0);
        setNewItemQuantity(1);
        setNewItemEquippable(false);

        setNewItemAttunable(false);
        setNewItemType("other");
        setNewItemWeaponDetails(undefined);
        setNewItemArmorDetails(undefined);
    };

    const handleBaseWeaponSelect = (baseName: string) => {
        if (baseName === "Custom") {
            setNewItemName("Custom Weapon");
            setNewItemWeaponDetails({
                baseWeapon: "Custom",
                category: "Simple",
                rangeType: "Melee",
                damageDice: "1d4",
                damageType: "slashing",
                properties: [],
                mastery: ""
            });
            setNewItemEquippable(true);
        } else if (WEAPON_DATA[baseName]) {
            const data = WEAPON_DATA[baseName];
            setNewItemName(data.name);
            setNewItemWeight(data.weight);
            setNewItemCost(data.costGP);
            setNewItemEquippable(true);
            setNewItemWeaponDetails({
                baseWeapon: baseName,
                category: data.category,
                rangeType: data.rangeType,
                damageDice: data.damageDice,
                damageType: data.damageType,
                properties: [...data.properties],
                mastery: data.mastery
            });
        }
    };
    const handleBaseArmorSelect = (baseName: string, typeOverride?: string) => {
        if (baseName === "Custom") {
            const isShield = (typeOverride || newItemType) === "shield";
            setNewItemName(isShield ? "Custom Shield" : "Custom Armor");
            setNewItemArmorDetails({
                baseArmor: "Custom",
                category: isShield ? "Shield" : "Light",
                ac: isShield ? 2 : 10,
                dexBonus: !isShield,
                stealthDisadvantage: false
            });
            setNewItemEquippable(true);
        } else if (ARMOR_DATA[baseName]) {
            const data = ARMOR_DATA[baseName];
            setNewItemName(data.name);
            setNewItemWeight(data.weight);
            setNewItemCost(data.costGP);
            setNewItemEquippable(true);
            setNewItemArmorDetails({
                baseArmor: baseName,
                category: data.category,
                ac: data.ac,
                dexBonus: data.dexBonus,
                dexCap: data.dexCap,
                strengthRequirement: data.strengthRequirement,
                stealthDisadvantage: data.stealthDisadvantage
            });
        }
    };

    const removeItem = (id: string) => {
        setInventory(inventory.filter((item) => item.id !== id));
    };

    const updateItemBatch = (id: string, updates: Partial<InventoryItem>) => {
        setInventory(
            inventory.map((item) => {
                if (item.id !== id) return item;

                let updatedItem = { ...item, ...updates };

                // Maintain consistency
                if (updates.attunable === false) {
                    updatedItem.attuned = false;
                }
                if (updates.equippable === false) {
                    updatedItem.equipped = false;
                }

                // Initialize weapon details if switching to weapon type
                if (updates.itemType === "weapon" && !item.weaponDetails && !updates.weaponDetails) {
                    updatedItem.weaponDetails = {
                        baseWeapon: "Custom",
                        category: "Simple",
                        rangeType: "Melee",
                        damageDice: "1d4",
                        damageType: "slashing",
                        properties: [],
                        mastery: ""
                    };
                }

                // Initialize/Reset armor details if switching to armor or shield type
                if (updates.itemType === "armor" || updates.itemType === "shield") {
                    const isShield = updates.itemType === "shield";
                    const needsInitialization = !item.armorDetails && !updates.armorDetails;
                    const categorySwitch = item.armorDetails && (
                        (isShield && item.armorDetails.category !== "Shield") ||
                        (!isShield && item.armorDetails.category === "Shield")
                    );

                    if (needsInitialization || categorySwitch) {
                        updatedItem.armorDetails = {
                            baseArmor: "Custom",
                            category: isShield ? "Shield" : "Light",
                            ac: isShield ? 2 : 10,
                            dexBonus: !isShield,
                            stealthDisadvantage: false
                        };
                        updatedItem.equippable = true;
                    }
                }

                return updatedItem;
            })
        );
    };

    const updateItem = (id: string, field: keyof InventoryItem, value: any) => {
        updateItemBatch(id, { [field]: value });
    };

    const toggleExpand = (id: string) => {
        setExpandedItemIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const totalWeight = inventory.reduce((total, item) => total + item.weight * item.quantity, 0);

    const attunedItems = inventory.filter(item => item.attuned);
    const attunableItems = inventory.filter(item => item.attunable);

    return (
        <div className="space-y-6">
            {/* Inventory List */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Inventory</h2>
                        <span className="text-gray-600">Total Weight: {totalWeight.toFixed(1)} lbs</span>
                    </div>

                    {/* Equipment Section */}
                    <div className="mb-6">
                        <h3 className="font-semibold mb-2">Equipment</h3>
                        <div className="space-y-2">
                            <InventoryTable
                                items={inventory.filter(item => item.equippable)}
                                section="equipment"
                                updateItem={updateItem}
                                updateItemBatch={updateItemBatch}
                                removeItem={removeItem}
                                toggleExpand={toggleExpand}
                                expandedItemIds={expandedItemIds}
                            />
                        </div>
                    </div>

                    {/* Attunement Section */}
                    <div className="mb-6">
                        <h3 className="font-semibold mb-2">Attunement ({attunedItems.length}/3)</h3>

                        {/* Currently Attuned List */}
                        {/* Attunement Slots */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            {[0, 1, 2].map((index) => {
                                const item = attunedItems[index];
                                return (
                                    <div
                                        key={index}
                                        className={`p-2 rounded border text-sm flex flex-col justify-center items-center h-10 ${item
                                            ? "bg-purple-50 border-purple-200"
                                            : "bg-gray-50 border-gray-200 text-gray-400 border-dashed"
                                            }`}
                                    >
                                        {item ? (
                                            <span className="font-medium text-center line-clamp-3 leading-tight">
                                                {item.name}
                                            </span>
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <span className="italic text-xs">Empty Slot</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Attunable Items Management */}
                        <ExpandableSection title="Manage Attunement">
                            <div className="space-y-2">
                                {attunableItems.map(item => (
                                    <div key={item.id} className="flex justify-between items-center p-2 border-b last:border-0 hover:bg-gray-50">
                                        <span>{item.name}</span>
                                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={item.attuned ?? false}
                                                onChange={(e) => updateItem(item.id, "attuned", e.target.checked)}
                                                className="w-4 h-4 cursor-pointer"
                                            />
                                            {item.attuned ? "Attuned" : "Attune"}
                                        </label>
                                    </div>
                                ))}
                                {attunableItems.length === 0 && (
                                    <p className="text-gray-500 italic text-sm">No attunable items found.</p>
                                )}
                            </div>
                        </ExpandableSection>
                    </div>

                    {/* Inventory Section */}
                    <div>
                        <h3 className="font-semibold mb-2">Carried Items</h3>
                        <div className="space-y-2">
                            <InventoryTable
                                items={inventory.filter(item => !item.equippable)}
                                section="inventory"
                                updateItem={updateItem}
                                updateItemBatch={updateItemBatch}
                                removeItem={removeItem}
                                toggleExpand={toggleExpand}
                                expandedItemIds={expandedItemIds}
                            />
                        </div>
                    </div>

                    {/* Add Item Form */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-2">Add New Item</h3>
                        <div className="flex gap-2 items-end">
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500">Name</label>
                                <input
                                    type="text"
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    placeholder="Item Name"
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                            </div>
                            <div className="w-20">
                                <label className="block text-xs text-gray-500">Cost (gp)</label>
                                <input
                                    type="number"
                                    value={newItemCost}
                                    onChange={(e) => setNewItemCost(Number(e.target.value))}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    min="0"
                                />
                            </div>
                            <div className="w-16">
                                <label className="block text-xs text-gray-500">Weight</label>
                                <input
                                    type="number"
                                    value={newItemWeight}
                                    onChange={(e) => setNewItemWeight(Number(e.target.value))}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    min="0"
                                />
                            </div>
                        </div>
                        <div className="pb-3 px-2 flex flex-col gap-1">
                            <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newItemEquippable}
                                    onChange={(e) => setNewItemEquippable(e.target.checked)}
                                    className="w-3 h-3"
                                />
                                Equippable
                            </label>
                            {newItemEquippable && (
                                <div className="space-y-2">
                                    <select
                                        value={newItemType}
                                        onChange={(e) => {
                                            const type = e.target.value as any;
                                            setNewItemType(type);
                                            if (type === "weapon" && !newItemWeaponDetails) {
                                                // Default to custom if switching to weapon
                                                handleBaseWeaponSelect("Custom");
                                            } else if (type === "armor" || type === "shield") {
                                                handleBaseArmorSelect("Custom", type);
                                                setNewItemWeaponDetails(undefined);
                                            } else {
                                                setNewItemWeaponDetails(undefined);
                                                setNewItemArmorDetails(undefined);
                                            }
                                        }}
                                        className="text-xs border border-gray-300 rounded p-0.5 w-full"
                                    >
                                        <option value="other">Other</option>
                                        <option value="weapon">Weapon</option>
                                        <option value="armor">Armor</option>
                                        <option value="shield">Shield</option>
                                    </select>

                                    {newItemType === "armor" && (
                                        <div className="flex flex-col gap-1 p-2 bg-gray-50 rounded border border-gray-200">
                                            <select
                                                value={newItemArmorDetails?.baseArmor || "Custom"}
                                                onChange={(e) => handleBaseArmorSelect(e.target.value)}
                                                className="text-xs border border-gray-300 rounded p-1 w-full"
                                            >
                                                <option value="Custom">Custom</option>
                                                {Object.keys(ARMOR_DATA)
                                                    .filter(name => ARMOR_DATA[name].category !== "Shield")
                                                    .sort()
                                                    .map(name => (
                                                        <option key={name} value={name}>{name}</option>
                                                    ))}
                                            </select>

                                            {newItemArmorDetails && (
                                                <div className="space-y-2 mt-2 pt-2 border-t border-gray-200">
                                                    <div className="grid grid-cols-2 gap-1">
                                                        <div>
                                                            <label className="block text-[10px] text-gray-400 font-semibold">AC</label>
                                                            <input
                                                                type="number"
                                                                value={newItemArmorDetails.ac}
                                                                onChange={(e) => setNewItemArmorDetails({ ...newItemArmorDetails, ac: parseInt(e.target.value) || 0 })}
                                                                className="text-xs border border-gray-300 rounded p-1 w-full"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] text-gray-400 font-semibold">Category</label>
                                                            <select
                                                                value={newItemArmorDetails.category}
                                                                onChange={(e) => setNewItemArmorDetails({ ...newItemArmorDetails, category: e.target.value as any })}
                                                                className="text-xs border border-gray-300 rounded p-1 w-full"
                                                            >
                                                                <option value="Light">Light</option>
                                                                <option value="Medium">Medium</option>
                                                                <option value="Heavy">Heavy</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <label className="flex items-center gap-1 text-[10px] text-gray-500 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={newItemArmorDetails.dexBonus}
                                                                onChange={(e) => setNewItemArmorDetails({ ...newItemArmorDetails, dexBonus: e.target.checked })}
                                                                className="w-3 h-3"
                                                            />
                                                            DEX Bonus
                                                        </label>
                                                        <label className="flex items-center gap-1 text-[10px] text-gray-500 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={newItemArmorDetails.stealthDisadvantage}
                                                                onChange={(e) => setNewItemArmorDetails({ ...newItemArmorDetails, stealthDisadvantage: e.target.checked })}
                                                                className="w-3 h-3"
                                                            />
                                                            Stealth Disadv.
                                                        </label>
                                                    </div>
                                                    {newItemArmorDetails.dexBonus && (
                                                        <div>
                                                            <label className="block text-[10px] text-gray-400 font-semibold">DEX Cap</label>
                                                            <input
                                                                type="number"
                                                                value={newItemArmorDetails.dexCap ?? ""}
                                                                onChange={(e) => setNewItemArmorDetails({ ...newItemArmorDetails, dexCap: e.target.value === "" ? undefined : parseInt(e.target.value) })}
                                                                placeholder="None"
                                                                className="text-xs border border-gray-300 rounded p-1 w-full"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {newItemType === "shield" && (
                                        <div className="flex flex-col gap-1 p-2 bg-gray-50 rounded border border-gray-200">
                                            <select
                                                value={newItemArmorDetails?.baseArmor || "Shield"}
                                                onChange={(e) => handleBaseArmorSelect(e.target.value)}
                                                className="text-xs border border-gray-300 rounded p-1 w-full"
                                            >
                                                {Object.keys(ARMOR_DATA)
                                                    .filter(name => ARMOR_DATA[name].category === "Shield")
                                                    .sort()
                                                    .map(name => (
                                                        <option key={name} value={name}>{name}</option>
                                                    ))}
                                            </select>

                                            {newItemArmorDetails && (
                                                <div className="space-y-2 mt-2 pt-2 border-t border-gray-200">
                                                    <div>
                                                        <label className="block text-[10px] text-gray-400 font-semibold">Shield AC Bonus</label>
                                                        <input
                                                            type="number"
                                                            value={newItemArmorDetails.ac}
                                                            onChange={(e) => setNewItemArmorDetails({ ...newItemArmorDetails, ac: parseInt(e.target.value) || 0 })}
                                                            className="text-xs border border-gray-300 rounded p-1 w-full"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {newItemType === "weapon" && newItemWeaponDetails && (
                                        <div className="flex flex-col gap-1 p-2 bg-gray-50 rounded border border-gray-200">
                                            <select
                                                value={newItemWeaponDetails.baseWeapon || "Custom"}
                                                onChange={(e) => handleBaseWeaponSelect(e.target.value)}
                                                className="text-xs border border-gray-300 rounded p-1 w-full"
                                            >
                                                <option value="Custom">Custom</option>
                                                {Object.keys(WEAPON_DATA).sort().map(name => (
                                                    <option key={name} value={name}>{name}</option>
                                                ))}
                                            </select>

                                            <div className="flex gap-1">
                                                <select
                                                    value={newItemWeaponDetails.category}
                                                    onChange={(e) => setNewItemWeaponDetails({ ...newItemWeaponDetails, category: e.target.value as any })}
                                                    className="text-xs border border-gray-300 rounded p-1 flex-1"
                                                >
                                                    <option value="Simple">Simple</option>
                                                    <option value="Martial">Martial</option>
                                                </select>
                                                <select
                                                    value={newItemWeaponDetails.rangeType}
                                                    onChange={(e) => setNewItemWeaponDetails({ ...newItemWeaponDetails, rangeType: e.target.value as any })}
                                                    className="text-xs border border-gray-300 rounded p-1 flex-1"
                                                >
                                                    <option value="Melee">Melee</option>
                                                    <option value="Ranged">Ranged</option>
                                                </select>
                                            </div>

                                            <div className="flex gap-1">
                                                <input
                                                    type="text"
                                                    value={newItemWeaponDetails.damageDice}
                                                    onChange={(e) => setNewItemWeaponDetails({ ...newItemWeaponDetails, damageDice: e.target.value })}
                                                    placeholder="Dmg (1d6)"
                                                    className="text-xs border border-gray-300 rounded p-1 w-1/3"
                                                />
                                                <input
                                                    type="text"
                                                    value={newItemWeaponDetails.damageType}
                                                    onChange={(e) => setNewItemWeaponDetails({ ...newItemWeaponDetails, damageType: e.target.value })}
                                                    placeholder="Type (piercing)"
                                                    className="text-xs border border-gray-300 rounded p-1 w-2/3"
                                                />
                                            </div>

                                            <input
                                                type="text"
                                                value={newItemWeaponDetails.mastery || ""}
                                                onChange={(e) => setNewItemWeaponDetails({ ...newItemWeaponDetails, mastery: e.target.value })}
                                                placeholder="Mastery (Nick, Vex...)"
                                                className="text-xs border border-gray-300 rounded p-1 w-full"
                                            />

                                            <input
                                                type="text"
                                                value={newItemWeaponDetails.properties.join(", ")}
                                                onChange={(e) => setNewItemWeaponDetails({ ...newItemWeaponDetails, properties: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                                                placeholder="Properties (Light, Finesse...)"
                                                className="text-xs border border-gray-300 rounded p-1 w-full"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                            <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newItemAttunable}
                                    onChange={(e) => setNewItemAttunable(e.target.checked)}
                                    className="w-3 h-3"
                                />
                                Attunable
                            </label>
                        </div>
                        <div className="w-16">
                            <label className="block text-xs text-gray-500">Qty</label>
                            <input
                                type="number"
                                value={newItemQuantity}
                                onChange={(e) => setNewItemQuantity(Number(e.target.value))}
                                className="w-full p-2 border border-gray-300 rounded"
                                min="1"
                            />
                        </div>
                        <Button onClick={addItem} className="bg-blue-600 text-white hover:bg-blue-700 h-[42px]">
                            Add
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div >
    );
};

const InventoryTable: React.FC<{
    items: InventoryItem[];
    section: "equipment" | "inventory";
    updateItem: (id: string, field: keyof InventoryItem, value: any) => void;
    updateItemBatch: (id: string, updates: Partial<InventoryItem>) => void;
    removeItem: (id: string) => void;
    toggleExpand: (id: string) => void;
    expandedItemIds: string[];
}> = ({ items, section, updateItem, updateItemBatch, removeItem, toggleExpand, expandedItemIds }) => {
    if (items.length === 0) return <div className="text-gray-500 italic text-sm p-2">No items</div>;

    return (
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="border-b">
                    <th className="p-2 w-12">Qty</th>
                    <th className="p-2">Name</th>
                    <th className="p-2 w-20">Cost (gp)</th>
                    <th className="p-2 w-20">Wt (lbs)</th>
                    {section === "equipment" && (
                        <>
                            <th className="p-2 w-25">Type</th>
                            <th className="p-2 w-10 text-center">Equipped</th>
                        </>
                    )}
                    <th className="p-2 w-10"></th>
                </tr>
            </thead>
            <tbody>
                {items.map((item) => (
                    <React.Fragment key={item.id}>
                        <tr className="border-b hover:bg-gray-50">
                            <td className="p-2">
                                <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                                    className="w-12 p-1 border rounded text-center"
                                    min="0"
                                />
                            </td>
                            <td className="p-2">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleExpand(item.id)}
                                        className="text-gray-500 hover:text-gray-700 text-xs w-4"
                                    >
                                        {expandedItemIds.includes(item.id) ? "▼" : "▶"}
                                    </button>
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => updateItem(item.id, "name", e.target.value)}
                                        className="w-full p-1 border border-transparent hover:border-gray-300 rounded"
                                    />
                                </div>
                            </td>
                            <td className="p-2">
                                <input
                                    type="number"
                                    value={item.costGP ?? 0}
                                    onChange={(e) => updateItem(item.id, "costGP", Number(e.target.value))}
                                    className="w-20 p-1 border rounded text-center"
                                    min="0"
                                />
                            </td>
                            <td className="p-2">
                                <input
                                    type="number"
                                    value={item.weight}
                                    onChange={(e) => updateItem(item.id, "weight", Number(e.target.value))}
                                    className="w-16 p-1 border rounded text-center"
                                    min="0"
                                />
                            </td>
                            {section === "equipment" && (
                                <>
                                    <td className="p-2">
                                        <select
                                            value={item.itemType ?? "other"}
                                            onChange={(e) => updateItem(item.id, "itemType", e.target.value)}
                                            className="w-full p-1 border border-gray-200 rounded text-xs"
                                        >
                                            <option value="other">Other</option>
                                            <option value="weapon">Weapon</option>
                                            <option value="armor">Armor</option>
                                            <option value="shield">Shield</option>
                                        </select>
                                    </td>
                                    <td className="p-2 text-center">
                                        <input
                                            type="checkbox"
                                            checked={item.equipped ?? false}
                                            onChange={(e) => updateItem(item.id, "equipped", e.target.checked)}
                                            className="w-4 h-4 cursor-pointer"
                                        />
                                    </td>
                                </>
                            )}
                            <td className="p-2 text-right">
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="text-red-500 hover:text-red-700 font-bold"
                                    title="Remove Item"
                                >
                                    ×
                                </button>
                            </td>
                        </tr>
                        {expandedItemIds.includes(item.id) && (
                            <tr className="bg-gray-50 border-b">
                                <td colSpan={section === "equipment" ? 7 : 5} className="p-2 pl-12 pr-4 pb-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="block text-xs font-semibold text-gray-500">Description</label>
                                        <textarea
                                            value={item.description ?? ""}
                                            onChange={(e) => updateItem(item.id, "description", e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded text-sm bg-white"
                                            rows={2}
                                            placeholder="Item description..."
                                        />
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id={`equippable-${item.id}`}
                                                checked={item.equippable ?? false}
                                                onChange={(e) => updateItem(item.id, "equippable", e.target.checked)}
                                                className="w-4 h-4 cursor-pointer"
                                            />
                                            <label htmlFor={`equippable-${item.id}`} className="text-sm text-gray-600 cursor-pointer">
                                                Equippable
                                            </label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id={`attunable-${item.id}`}
                                                checked={item.attunable ?? false}
                                                onChange={(e) => updateItem(item.id, "attunable", e.target.checked)}
                                                className="w-4 h-4 cursor-pointer"
                                            />
                                            <label htmlFor={`attunable-${item.id}`} className="text-sm text-gray-600 cursor-pointer">
                                                Attunable
                                            </label>
                                        </div>
                                        {item.equippable && section !== "equipment" && (
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm text-gray-600">Type:</label>
                                                <select
                                                    value={item.itemType ?? "other"}
                                                    onChange={(e) => updateItem(item.id, "itemType", e.target.value)}
                                                    className="p-1 border border-gray-300 rounded text-xs"
                                                >
                                                    <option value="other">Other</option>
                                                    <option value="weapon">Weapon</option>
                                                    <option value="armor">Armor</option>
                                                    <option value="shield">Shield</option>
                                                </select>
                                            </div>
                                        )}

                                        {/* Weapon Details Editor */}
                                        {item.itemType === "weapon" && item.weaponDetails && (
                                            <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                                                <label className="block text-xs font-semibold text-gray-500 mb-1">Weapon Details</label>
                                                <div className="mb-2">
                                                    <label className="block text-[10px] text-gray-400">Base Weapon</label>
                                                    <select
                                                        value={item.weaponDetails.baseWeapon || "Custom"}
                                                        onChange={(e) => {
                                                            const baseName = e.target.value;
                                                            if (baseName === "Custom") {
                                                                // keep existing details but switch base to custom
                                                                updateItemBatch(item.id, {
                                                                    weaponDetails: {
                                                                        ...item.weaponDetails!,
                                                                        baseWeapon: "Custom",
                                                                    }
                                                                });
                                                            } else if (WEAPON_DATA[baseName]) {
                                                                const data = WEAPON_DATA[baseName];
                                                                // Batch update all fields
                                                                updateItemBatch(item.id, {
                                                                    weaponDetails: {
                                                                        baseWeapon: baseName,
                                                                        category: data.category,
                                                                        rangeType: data.rangeType,
                                                                        damageDice: data.damageDice,
                                                                        damageType: data.damageType,
                                                                        properties: [...data.properties],
                                                                        mastery: data.mastery
                                                                    },
                                                                    weight: data.weight,
                                                                    costGP: data.costGP
                                                                });
                                                            }
                                                        }}
                                                        className="text-xs border border-gray-300 rounded p-1 w-full"
                                                    >
                                                        <option value="Custom">Custom</option>
                                                        {Object.keys(WEAPON_DATA).sort().map(name => (
                                                            <option key={name} value={name}>{name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mb-2">
                                                    <div>
                                                        <label className="block text-[10px] text-gray-400">Category</label>
                                                        <select
                                                            value={item.weaponDetails.category}
                                                            onChange={(e) => updateItem(item.id, "weaponDetails", { ...item.weaponDetails, category: e.target.value as any })}
                                                            className="text-xs border border-gray-300 rounded p-1 w-full"
                                                        >
                                                            <option value="Simple">Simple</option>
                                                            <option value="Martial">Martial</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] text-gray-400">Range</label>
                                                        <select
                                                            value={item.weaponDetails.rangeType}
                                                            onChange={(e) => updateItem(item.id, "weaponDetails", { ...item.weaponDetails, rangeType: e.target.value as any })}
                                                            className="text-xs border border-gray-300 rounded p-1 w-full"
                                                        >
                                                            <option value="Melee">Melee</option>
                                                            <option value="Ranged">Ranged</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 mb-2">
                                                    <div>
                                                        <label className="block text-[10px] text-gray-400">Damage</label>
                                                        <input
                                                            type="text"
                                                            value={item.weaponDetails.damageDice || ""}
                                                            onChange={(e) => updateItem(item.id, "weaponDetails", { ...item.weaponDetails, damageDice: e.target.value })}
                                                            className="text-xs border border-gray-300 rounded p-1 w-full"
                                                            placeholder="1d6"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] text-gray-400">Type</label>
                                                        <input
                                                            type="text"
                                                            value={item.weaponDetails.damageType || ""}
                                                            onChange={(e) => updateItem(item.id, "weaponDetails", { ...item.weaponDetails, damageType: e.target.value })}
                                                            className="text-xs border border-gray-300 rounded p-1 w-full"
                                                            placeholder="slashing"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mb-2">
                                                    <label className="block text-[10px] text-gray-400">Mastery</label>
                                                    <input
                                                        type="text"
                                                        value={item.weaponDetails.mastery || ""}
                                                        onChange={(e) => updateItem(item.id, "weaponDetails", { ...item.weaponDetails, mastery: e.target.value })}
                                                        className="text-xs border border-gray-300 rounded p-1 w-full"
                                                        placeholder="Vex, Nick..."
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] text-gray-400">Properties</label>
                                                    <input
                                                        type="text"
                                                        value={item.weaponDetails.properties.join(", ")}
                                                        onChange={(e) => updateItem(item.id, "weaponDetails", { ...item.weaponDetails, properties: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                                                        className="text-xs border border-gray-300 rounded p-1 w-full"
                                                        placeholder="Light, Finesse..."
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {/* Armor/Shield Details Editor */}
                                        {(item.itemType === "armor" || item.itemType === "shield") && item.armorDetails && (
                                            <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                                                <label className="block text-xs font-semibold text-gray-500 mb-1">Armor Details</label>
                                                <div className="mb-2">
                                                    <label className="block text-[10px] text-gray-400">Base Armor</label>
                                                    <select
                                                        value={item.armorDetails.baseArmor || "Custom"}
                                                        onChange={(e) => {
                                                            const baseName = e.target.value;
                                                            if (baseName === "Custom") {
                                                                updateItemBatch(item.id, {
                                                                    armorDetails: {
                                                                        ...item.armorDetails!,
                                                                        baseArmor: "Custom",
                                                                    }
                                                                });
                                                            } else if (ARMOR_DATA[baseName]) {
                                                                const data = ARMOR_DATA[baseName];
                                                                updateItemBatch(item.id, {
                                                                    armorDetails: {
                                                                        baseArmor: baseName,
                                                                        category: data.category,
                                                                        ac: data.ac,
                                                                        dexBonus: data.dexBonus,
                                                                        dexCap: data.dexCap,
                                                                        strengthRequirement: data.strengthRequirement,
                                                                        stealthDisadvantage: data.stealthDisadvantage
                                                                    },
                                                                    weight: data.weight,
                                                                    costGP: data.costGP
                                                                });
                                                            }
                                                        }}
                                                        className="text-xs border border-gray-300 rounded p-1 w-full"
                                                    >
                                                        <option value="Custom">Custom</option>
                                                        {Object.keys(ARMOR_DATA)
                                                            .filter(name => (item.itemType === "shield") ? ARMOR_DATA[name].category === "Shield" : ARMOR_DATA[name].category !== "Shield")
                                                            .sort()
                                                            .map(name => (
                                                                <option key={name} value={name}>{name}</option>
                                                            ))}
                                                    </select>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mb-2">
                                                    <div>
                                                        <label className="block text-[10px] text-gray-400">AC</label>
                                                        <input
                                                            type="number"
                                                            value={item.armorDetails.ac}
                                                            onChange={(e) => updateItem(item.id, "armorDetails", { ...item.armorDetails, ac: parseInt(e.target.value) || 0 })}
                                                            className="text-xs border border-gray-300 rounded p-1 w-full"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] text-gray-400">Category</label>
                                                        <select
                                                            value={item.armorDetails.category}
                                                            onChange={(e) => updateItem(item.id, "armorDetails", { ...item.armorDetails, category: e.target.value as any })}
                                                            className="text-xs border border-gray-300 rounded p-1 w-full"
                                                        >
                                                            <option value="Light">Light</option>
                                                            <option value="Medium">Medium</option>
                                                            <option value="Heavy">Heavy</option>
                                                            <option value="Shield">Shield</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 mb-2">
                                                    <label className="flex items-center gap-1 text-[10px] text-gray-500 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.armorDetails.dexBonus}
                                                            onChange={(e) => updateItem(item.id, "armorDetails", { ...item.armorDetails, dexBonus: e.target.checked })}
                                                            className="w-3 h-3"
                                                        />
                                                        DEX Bonus
                                                    </label>
                                                    <label className="flex items-center gap-1 text-[10px] text-gray-500 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.armorDetails.stealthDisadvantage}
                                                            onChange={(e) => updateItem(item.id, "armorDetails", { ...item.armorDetails, stealthDisadvantage: e.target.checked })}
                                                            className="w-3 h-3"
                                                        />
                                                        Stealth Disadv.
                                                    </label>
                                                </div>
                                                {item.armorDetails.dexBonus && (
                                                    <div className="mb-2">
                                                        <label className="block text-[10px] text-gray-400">DEX Cap</label>
                                                        <input
                                                            type="number"
                                                            value={item.armorDetails.dexCap ?? ""}
                                                            onChange={(e) => updateItem(item.id, "armorDetails", { ...item.armorDetails, dexCap: e.target.value === "" ? undefined : parseInt(e.target.value) })}
                                                            placeholder="None"
                                                            className="text-xs border border-gray-300 rounded p-1 w-full"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                ))}
            </tbody>
        </table>
    );
};

export default InventorySection;
