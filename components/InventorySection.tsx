
import React, { useState } from "react";
import { InventoryItem } from "../types/character";
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
    };

    const removeItem = (id: string) => {
        setInventory(inventory.filter((item) => item.id !== id));
    };

    const updateItem = (id: string, field: keyof InventoryItem, value: string | number | boolean) => {
        setInventory(
            inventory.map((item) => {
                if (item.id !== id) return item;

                const updatedItem = { ...item, [field]: value };

                // If item is no longer attunable, it cannot be attuned
                if (field === "attunable" && value === false) {
                    updatedItem.attuned = false;
                }

                // If item is no longer equippable, it cannot be equipped
                if (field === "equippable" && value === false) {
                    updatedItem.equipped = false;
                }

                return updatedItem;
            })
        );
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
                    {inventory.filter(item => item.equippable).length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-semibold mb-2">Equipment</h3>
                            <div className="space-y-2">
                                <InventoryTable
                                    items={inventory.filter(item => item.equippable)}
                                    section="equipment"
                                    updateItem={updateItem}
                                    removeItem={removeItem}
                                    toggleExpand={toggleExpand}
                                    expandedItemIds={expandedItemIds}
                                />
                            </div>
                        </div>
                    )}

                    {/* Attunement Section */}
                    {(attunedItems.length > 0 || attunableItems.length > 0) && (
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
                    )}

                    {/* Inventory Section */}
                    <div>
                        <h3 className="font-semibold mb-2">Carried Items</h3>
                        <div className="space-y-2">
                            <InventoryTable
                                items={inventory.filter(item => !item.equippable)}
                                section="inventory"
                                updateItem={updateItem}
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
                                <select
                                    value={newItemType}
                                    onChange={(e) => setNewItemType(e.target.value as any)}
                                    className="text-xs border border-gray-300 rounded p-0.5"
                                >
                                    <option value="other">Other</option>
                                    <option value="weapon">Weapon</option>
                                    <option value="armor">Armor</option>
                                    <option value="shield">Shield</option>
                                </select>
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
    updateItem: (id: string, field: keyof InventoryItem, value: string | number | boolean) => void;
    removeItem: (id: string) => void;
    toggleExpand: (id: string) => void;
    expandedItemIds: string[];
}> = ({ items, section, updateItem, removeItem, toggleExpand, expandedItemIds }) => {
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
