import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import AddItemForm from "./inventory/AddItemForm";
import InventoryTable from "./inventory/InventoryTable";
import AttunementSection from "./inventory/AttunementSection";
import SectionHeader from "./ui/SectionHeader";
import LoadSummary from "./inventory/LoadSummary";
import SearchFilterBar from "./ui/SearchFilterBar";
import { Lock, Unlock, GripVertical, Settings, Scale, AlertCircle, X } from "lucide-react";
import SettingsButton from "./ui/SettingsButton";
import ModalScrollLock from "./ui/ModalScrollLock";
import { calculateTotalWeight } from "../utils/character-utils";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { InventoryItem, Resource, NormalizedCharacter } from "../types/character";

interface InventorySectionProps {
    character: NormalizedCharacter;
    setInventory: (inventory: InventoryItem[]) => void;
    resources?: Resource[];
    onUpdateResources?: (resources: Resource[]) => void;
    onChange: (field: keyof NormalizedCharacter, value: any) => void;
    summonStatblocks?: any[];
    onSummonFromStatblock?: (statblockId: string) => void;
}

const INVENTORY_ITEM_TYPES = ["weapon", "armor", "shield", "container", "tool", "other"] as const;

const InventorySection: React.FC<InventorySectionProps> = ({
    character,
    setInventory,
    resources = [],
    onUpdateResources,
    onChange,
    summonStatblocks = [],
    onSummonFromStatblock
}) => {
    const inventory = character.inventory || [];
    const [expandedItemIds, setExpandedItemIds] = useState<string[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [isEquipmentReorderMode, setIsEquipmentReorderMode] = useState(false);
    const [isInventoryReorderMode, setIsInventoryReorderMode] = useState(false);
    const [showEncumbranceSettings, setShowEncumbranceSettings] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

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

    const handleDragEnd = (event: DragEndEvent, itemsInTable: InventoryItem[]) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = inventory.findIndex((i) => i.id === active.id);
            const newIndex = inventory.findIndex((i) => i.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                setInventory(arrayMove(inventory, oldIndex, newIndex));
            }
        }
    };

    const totalWeight = calculateTotalWeight(character);

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

    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (item.description || "").toLowerCase().includes(searchQuery.toLowerCase());
        const itemType = item.itemType || "other";
        const matchesType = selectedCategory === "All" || 
                           (selectedCategory === "Wondrous" ? item.isWondrous : itemType === selectedCategory);
        return matchesSearch && matchesType;
    });

    const equipment = sortItemsHierarchically(filteredInventory.filter((item) => item.equippable));
    const otherItems = sortItemsHierarchically(filteredInventory.filter((item) => !item.equippable));
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
                <div className="flex items-center gap-2">
                    <LoadSummary 
                        totalWeight={totalWeight} 
                        strength={character.abilityScores.strength}
                        enabled={character.encumbranceEnabled}
                        rule={character.encumbranceRule}
                    />
                    <SettingsButton 
                        onClick={() => setShowEncumbranceSettings(true)}
                        title="Encumbrance Settings"
                        className="ml-2"
                    />
                </div>
            </SectionHeader>

            {/* Encumbrance Settings Modal */}
            {showEncumbranceSettings && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
                    <ModalScrollLock isOpen={showEncumbranceSettings} />
                    <div className="bg-background w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-border bg-secondary/30 flex justify-between items-center">
                            <h3 className="font-black uppercase tracking-wider flex items-center gap-2">
                                <Scale size={18} className="text-primary" />
                                Encumbrance Rules
                            </h3>
                            <button onClick={() => setShowEncumbranceSettings(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-sm font-bold uppercase tracking-tight">Enable Tracking</label>
                                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Toggle encumbrance calculations</p>
                                </div>
                                <button
                                    onClick={() => onChange("encumbranceEnabled", !character.encumbranceEnabled)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${character.encumbranceEnabled ? 'bg-primary' : 'bg-secondary'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${character.encumbranceEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            {character.encumbranceEnabled && (
                                <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Rule Variation</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { id: 'standard', label: 'Standard', desc: 'STR × 15' },
                                                { id: 'variant', label: 'Variant', desc: 'Thresholds at 5x/10x/15x' }
                                            ].map((r) => (
                                                <button
                                                    key={r.id}
                                                    onClick={() => onChange("encumbranceRule", r.id)}
                                                    className={`p-3 rounded-xl border-2 text-left transition-all ${character.encumbranceRule === r.id ? 'border-primary bg-primary/5' : 'border-border bg-secondary/20 hover:border-primary/30'}`}
                                                >
                                                    <div className="font-black uppercase text-xs tracking-tighter mb-0.5">{r.label}</div>
                                                    <div className="text-[10px] text-muted-foreground font-bold">{r.desc}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex gap-3 italic">
                                        <AlertCircle size={16} className="text-primary shrink-0 mt-0.5" />
                                        <div className="text-[10px] text-muted-foreground leading-relaxed">
                                            {character.encumbranceRule === 'variant' 
                                                ? "Variant rules apply speed penalties at different weight thresholds and disadvantage on physical rolls when heavily encumbered."
                                                : "Standard rules only track your maximum carrying capacity (STR × 15 lbs)."}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 bg-secondary/30 border-t border-border flex justify-end">
                            <button
                                onClick={() => setShowEncumbranceSettings(false)}
                                className="px-8 py-2 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest rounded-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <SearchFilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search inventory..."
                filterValue={selectedCategory}
                onFilterChange={setSelectedCategory}
                filterOptions={[
                    { label: "All Types", value: "All" },
                    ...INVENTORY_ITEM_TYPES.map(type => ({ 
                        label: type.charAt(0).toUpperCase() + type.slice(1), 
                        value: type 
                    })),
                    { label: "Wondrous", value: "Wondrous" }
                ]}
            />

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
                        <div className="flex items-center gap-2">
                            <span>Equipment</span>
                            <button
                                onClick={() => setIsEquipmentReorderMode(!isEquipmentReorderMode)}
                                className={`p-1 rounded hover:bg-secondary/50 transition-all ${isEquipmentReorderMode ? "text-primary bg-primary/10" : "text-muted-foreground/40"}`}
                                title={isEquipmentReorderMode ? "Lock Order" : "Unlock Order (Drag to Reorder)"}
                            >
                                {isEquipmentReorderMode ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            </button>
                        </div>
                        <span className="text-xs font-normal text-muted-foreground/60">{equipment.length} items</span>
                    </h3>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => handleDragEnd(event, equipment)}
                    >
                        <SortableContext
                            items={equipment.map(i => i.id)}
                            strategy={verticalListSortingStrategy}
                        >
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
                                isReorderMode={isEquipmentReorderMode}
                                summonStatblocks={summonStatblocks}
                                onSummonFromStatblock={onSummonFromStatblock}
                            />
                        </SortableContext>
                    </DndContext>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 space-y-4">
                    <h3 className="font-bold border-b pb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span>Other Inventory</span>
                            <button
                                onClick={() => setIsInventoryReorderMode(!isInventoryReorderMode)}
                                className={`p-1 rounded hover:bg-secondary/50 transition-all ${isInventoryReorderMode ? "text-primary bg-primary/10" : "text-muted-foreground/40"}`}
                                title={isInventoryReorderMode ? "Lock Order" : "Unlock Order (Drag to Reorder)"}
                            >
                                {isInventoryReorderMode ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            </button>
                        </div>
                        <span className="text-xs font-normal text-muted-foreground/60">{otherItems.length} items</span>
                    </h3>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => handleDragEnd(event, otherItems)}
                    >
                        <SortableContext
                            items={otherItems.map(i => i.id)}
                            strategy={verticalListSortingStrategy}
                        >
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
                                isReorderMode={isInventoryReorderMode}
                                summonStatblocks={summonStatblocks}
                                onSummonFromStatblock={onSummonFromStatblock}
                            />
                        </SortableContext>
                    </DndContext>
                </CardContent>
            </Card>
        </div>
    );
};

export default InventorySection;
