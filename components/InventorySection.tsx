import React, { useState } from "react";
import { InventoryItem } from "../types/character";
import { Card, CardContent } from "./ui/card";
import AddItemForm from "./inventory/AddItemForm";
import InventoryTable from "./inventory/InventoryTable";
import AttunementSection from "./inventory/AttunementSection";
import LoadSummary from "./inventory/LoadSummary";

interface InventorySectionProps {
    inventory: InventoryItem[];
    setInventory: (inventory: InventoryItem[]) => void;
}

const InventorySection: React.FC<InventorySectionProps> = ({
    inventory,
    setInventory,
}) => {
    const [expandedItemIds, setExpandedItemIds] = useState<string[]>([]);

    const onAddItem = (newItem: InventoryItem) => {
        setInventory([...inventory, newItem]);
    };

    const updateItemBatch = (id: string, updates: Partial<InventoryItem>) => {
        setInventory(
            inventory.map((item) => {
                if (item.id !== id) return item;
                let updatedItem = { ...item, ...updates };
                if (updates.attunable === false) updatedItem.attuned = false;
                if (updates.equippable === false) updatedItem.equipped = false;

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

                if (updates.itemType === "armor" || updates.itemType === "shield") {
                    const isShield = updates.itemType === "shield";
                    const needsInitialization = !item.armorDetails && !updates.armorDetails;
                    if (needsInitialization) {
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

                if (updates.itemType === "container" && !item.containerDetails && !updates.containerDetails) {
                    updatedItem.containerDetails = {
                        capacityWeight: 30,
                        contentsWeightMultiplier: 1
                    };
                    updatedItem.isContainer = true;
                }
                if (updates.itemType !== "container" && updates.itemType !== undefined) {
                    updatedItem.isContainer = false;
                }

                return updatedItem;
            })
        );
    };

    const updateItem = (id: string, field: keyof InventoryItem, value: any) => {
        updateItemBatch(id, { [field]: value });
    };

    const toggleExpand = (id: string) => {
        setExpandedItemIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const removeItem = (id: string) => {
        setInventory(inventory.filter((item) => item.id !== id));
    };

    const calculateItemTotalWeight = (item: InventoryItem): number => {
        let total = item.weight * item.quantity;
        if (item.isContainer && item.containerDetails) {
            const contents = inventory.filter(i => i.parentId === item.id);
            const contentsWeight = contents.reduce((acc, curr) => acc + calculateItemTotalWeight(curr), 0);
            total += contentsWeight * item.containerDetails.contentsWeightMultiplier;
        }
        return total;
    };

    const totalWeight = inventory
        .filter(item => !item.parentId)
        .reduce((acc, item) => acc + calculateItemTotalWeight(item), 0);

    const sortItemsHierarchically = (items: InventoryItem[]): InventoryItem[] => {
        const result: InventoryItem[] = [];
        const addChildren = (parentId: string) => {
            items.filter(i => i.parentId === parentId).forEach(child => {
                result.push({ ...child });
                addChildren(child.id);
            });
        };
        items.filter(i => !i.parentId).forEach(root => {
            result.push({ ...root });
            addChildren(root.id);
        });
        return result;
    };

    const equipment = sortItemsHierarchically(inventory.filter((item) => item.equippable));
    const otherItems = sortItemsHierarchically(inventory.filter((item) => !item.equippable));
    const attunedItems = inventory.filter(item => item.attuned);
    const attunableItems = inventory.filter(item => item.attunable);

    return (
        <div className="space-y-6">
            <Card>
                <AddItemForm onAdd={onAddItem} />
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <AttunementSection
                            attunedItems={attunedItems}
                            attunableItems={attunableItems}
                            updateItem={updateItem}
                        />
                    </CardContent>
                </Card>
                <Card className="bg-gray-900 text-white">
                    <LoadSummary totalWeight={totalWeight} />
                </Card>
            </div>

            <Card>
                <CardContent className="p-4 space-y-4">
                    <h3 className="font-bold border-b pb-2 flex items-center justify-between">
                        <span>Equipment</span>
                        <span className="text-xs font-normal text-gray-400">{equipment.length} items</span>
                    </h3>
                    <InventoryTable
                        items={equipment}
                        allInventory={inventory}
                        section="equipment"
                        updateItem={updateItem}
                        removeItem={removeItem}
                        toggleExpand={toggleExpand}
                        expandedItemIds={expandedItemIds}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 space-y-4">
                    <h3 className="font-bold border-b pb-2 flex items-center justify-between">
                        <span>Other Inventory</span>
                        <span className="text-xs font-normal text-gray-400">{otherItems.length} items</span>
                    </h3>
                    <InventoryTable
                        items={otherItems}
                        allInventory={inventory}
                        section="inventory"
                        updateItem={updateItem}
                        removeItem={removeItem}
                        toggleExpand={toggleExpand}
                        expandedItemIds={expandedItemIds}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default InventorySection;
