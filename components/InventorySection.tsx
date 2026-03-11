import React, { useState } from "react";
import { InventoryItem, Resource } from "../types/character";
import { Card, CardContent } from "./ui/card";
import AddItemForm from "./inventory/AddItemForm";
import InventoryTable from "./inventory/InventoryTable";
import AttunementSection from "./inventory/AttunementSection";
import SectionHeader from "./ui/SectionHeader";
import LoadSummary from "./inventory/LoadSummary";

interface InventorySectionProps {
    inventory: InventoryItem[];
    setInventory: (inventory: InventoryItem[]) => void;
    resources?: Resource[];
    onUpdateResources?: (resources: Resource[]) => void;
}

const InventorySection: React.FC<InventorySectionProps> = ({
    inventory,
    setInventory,
    resources = [],
    onUpdateResources
}) => {
    const [expandedItemIds, setExpandedItemIds] = useState<string[]>([]);
    const [isAdding, setIsAdding] = useState(false);

    const onAddItem = (newItem: InventoryItem) => {
        setInventory([...inventory, newItem]);
    };

    const updateItemBatch = (id: string, updates: Partial<InventoryItem>) => {
        // Find if the item being updated was a container and is now changing type
        const targetItem = inventory.find((i: InventoryItem) => i.id === id);
        const isChangingFromContainer = Boolean(targetItem?.isContainer) && updates.itemType !== undefined && updates.itemType !== "container";

        const newInventory = inventory.map((item: InventoryItem) => {
            // If this is the item being updated
            if (item.id === id) {
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
                if (updates.itemType === "tool" && !item.toolDetails && !updates.toolDetails) {
                    updatedItem.toolDetails = {
                        baseTool: "Custom",
                        category: "Artisan Tool",
                        ability: "Dexterity",
                        utilize: "",
                        craft: ""
                    };
                }
                if (updates.itemType !== "container" && updates.itemType !== undefined) {
                    updatedItem.isContainer = false;
                }

                return updatedItem;
            }

            // If this is a child item and its parent just stopped being a container
            if (isChangingFromContainer && item.parentId === id) {
                return { ...item, parentId: undefined };
            }

            return item;
        });
        setInventory(newInventory);
    };

    const updateItem = (id: string, field: keyof InventoryItem, value: any) => {
        updateItemBatch(id, { [field]: value });
    };

    const toggleExpand = (id: string) => {
        setExpandedItemIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const removeItem = (id: string) => {
        setInventory(inventory.filter((item) => item.id !== id).map((item) => item.parentId === id ? { ...item, parentId: undefined } : item));
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
        const itemsById = new Set(items.map(i => i.id));
        const addChildren = (parentId: string) => {
            items.filter(i => i.parentId === parentId).forEach(child => {
                result.push({ ...child });
                addChildren(child.id);
            });
        };
        items.filter(i => !i.parentId || !itemsById.has(i.parentId)).forEach(root => {
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
            <SectionHeader 
                title="Inventory" 
                buttonLabel="Add Item" 
                onAdd={() => setIsAdding(true)} 
                isAdding={isAdding}
            >
                <LoadSummary totalWeight={totalWeight} />
            </SectionHeader>

            {isAdding && (
                <Card>
                    <AddItemForm 
                        onAdd={onAddItem} 
                        onCancel={() => setIsAdding(false)} 
                    />
                </Card>
            )}

            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <AttunementSection
                            attunedItems={attunedItems}
                            attunableItems={attunableItems}
                            updateItem={updateItem}
                        />
                    </CardContent>
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
                        resources={resources}
                        onUpdateResources={onUpdateResources}
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
                        resources={resources}
                        onUpdateResources={onUpdateResources}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default InventorySection;
