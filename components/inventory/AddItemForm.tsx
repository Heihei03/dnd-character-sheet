import React, { useState } from "react";

// UI Components
import Button from "../ui/button";
import { CardContent } from "../ui/card";
import EntityForm from "../ui/EntityForm";

// Components
import ItemFeaturesEditor from "./ItemFeaturesEditor";

// Data
import { ARMOR_DATA } from "../../data/armor";
import { CONTAINER_DATA } from "../../data/containers";
import { TOOL_DATA } from "../../data/tools";
import { WEAPON_DATA } from "../../data/weapons";

// Types
import { 
  ArmorDetails, 
  ContainerDetails, 
  Feature, 
  InventoryItem, 
  ToolDetails, 
  WeaponDetails 
} from "../../types/character";

interface AddItemFormProps {
    onAdd: (item: InventoryItem) => void;
    onCancel?: () => void;
}

const AddItemForm: React.FC<AddItemFormProps> = ({ onAdd, onCancel }) => {
    const [newItemName, setNewItemName] = useState("");
    const [newItemWeight, setNewItemWeight] = useState(0);
    const [newItemCost, setNewItemCost] = useState(0);
    const [newItemQuantity, setNewItemQuantity] = useState(1);
    const [newItemEquippable, setNewItemEquippable] = useState(false);
    const [newItemAttunable, setNewItemAttunable] = useState(false);
    const [newItemType, setNewItemType] = useState<"weapon" | "armor" | "shield" | "container" | "tool" | "other">("other");
    const [newItemWondrous, setNewItemWondrous] = useState(false);
    const [newItemWeaponDetails, setNewItemWeaponDetails] = useState<WeaponDetails | undefined>(undefined);
    const [newItemArmorDetails, setNewItemArmorDetails] = useState<ArmorDetails | undefined>(undefined);
    const [newItemContainerDetails, setNewItemContainerDetails] = useState<ContainerDetails | undefined>(undefined);
    const [newItemToolDetails, setNewItemToolDetails] = useState<ToolDetails | undefined>(undefined);
    const [newItemFeatures, setNewItemFeatures] = useState<Feature[]>([]);
    const [newItemDescription, setNewItemDescription] = useState("");

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

    const handleBaseContainerSelect = (baseName: string) => {
        if (baseName === "Custom") {
            setNewItemName("Custom Container");
            setNewItemContainerDetails({
                capacityWeight: 30,
                contentsWeightMultiplier: 1
            });
        } else if (CONTAINER_DATA[baseName]) {
            const data = CONTAINER_DATA[baseName];
            setNewItemName(data.name);
            setNewItemWeight(data.weight);
            setNewItemCost(data.costGP);
            setNewItemContainerDetails({
                capacityWeight: data.details.capacityWeight,
                contentsWeightMultiplier: data.details.contentsWeightMultiplier
            });
        }
    };

    const handleBaseToolSelect = (baseName: string) => {
        if (baseName === "Custom") {
            setNewItemName("Custom Tool");
            setNewItemToolDetails({
                baseTool: "Custom",
                category: "Artisan Tool",
                ability: "Dexterity",
                utilize: "",
                craft: ""
            });
        } else if (TOOL_DATA[baseName]) {
            const data = TOOL_DATA[baseName];
            setNewItemName(data.name);
            setNewItemWeight(data.weight);
            setNewItemCost(data.costGP);
            setNewItemToolDetails({
                baseTool: baseName,
                category: data.category,
                ability: data.ability,
                utilize: data.utilize,
                craft: data.craft
            });
        }
    };

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
            containerDetails: newItemContainerDetails,
            toolDetails: newItemToolDetails,
            isContainer: newItemType === "container",
            isWondrous: newItemWondrous,
            description: newItemDescription,
            features: newItemFeatures,
        };

        onAdd(newItem);
        if (onCancel) onCancel(); // Hide form after adding
        setNewItemName("");
        setNewItemWeight(0);
        setNewItemCost(0);
        setNewItemQuantity(1);
        setNewItemEquippable(false);
        setNewItemAttunable(false);
        setNewItemType("other");
        setNewItemWeaponDetails(undefined);
        setNewItemArmorDetails(undefined);
        setNewItemContainerDetails(undefined);
        setNewItemToolDetails(undefined);
        setNewItemDescription("");
        setNewItemFeatures([]);
        setNewItemWondrous(false);
    };

    return (
        <EntityForm
            title="Inventory Management"
            onSave={addItem}
            onCancel={onCancel || (() => {})}
            saveLabel="Add"
            className="w-full"
        >
            <div className="space-y-4">
                <div className="flex gap-2 items-end">
                    <div className="flex-1">
                        <label className="block text-xs text-gray-400 font-semibold mb-1 uppercase">Item Name</label>
                        <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Item name..." className="w-full p-2 border rounded" />
                    </div>
                    <div className="w-20">
                        <label className="block text-xs text-gray-400 font-semibold mb-1 uppercase">Cost</label>
                        <input type="number" value={newItemCost} onChange={(e) => setNewItemCost(Number(e.target.value))} className="w-full p-2 border rounded" min="0" />
                    </div>
                    <div className="w-20">
                        <label className="block text-xs text-gray-400 font-semibold mb-1 uppercase">Wt</label>
                        <input type="number" value={newItemWeight} onChange={(e) => setNewItemWeight(Number(e.target.value))} className="w-full p-2 border rounded" min="0" />
                    </div>
                    <div className="w-16">
                        <label className="block text-xs text-gray-400 font-semibold mb-1 uppercase">Qty</label>
                        <input type="number" value={newItemQuantity} onChange={(e) => setNewItemQuantity(Number(e.target.value))} className="w-full p-2 border rounded" min="1" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs text-gray-400 font-semibold mb-1 uppercase">Description</label>
                    <textarea 
                        value={newItemDescription} 
                        onChange={(e) => setNewItemDescription(e.target.value)} 
                        placeholder="Item description..." 
                        className="w-full p-2 border rounded text-sm min-h-[160px]" 
                    />
                </div>
                <div className="flex gap-4 items-center bg-gray-50 p-2 rounded border">
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                        <input type="checkbox" checked={newItemEquippable} onChange={(e) => setNewItemEquippable(e.target.checked)} className="w-4 h-4" />
                        Equippable
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                        <input type="checkbox" checked={newItemAttunable} onChange={(e) => setNewItemAttunable(e.target.checked)} className="w-4 h-4" />
                        Attunable
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                        <input type="checkbox" checked={newItemWondrous} onChange={(e) => setNewItemWondrous(e.target.checked)} className="w-4 h-4" />
                        Wondrous
                    </label>
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-400 font-bold uppercase">Type:</label>
                        <select value={newItemType} onChange={(e) => {
                            const type = e.target.value as any;
                            setNewItemType(type);
                            if (type === "weapon") handleBaseWeaponSelect("Custom");
                            else if (type === "armor" || type === "shield") handleBaseArmorSelect("Custom", type);
                            else if (type === "container") handleBaseContainerSelect("Custom");
                            else if (type === "tool") handleBaseToolSelect("Custom");
                        }} className="text-xs border rounded p-1 min-w-[100px]">
                            <option value="other">Other</option>
                            <option value="weapon">Weapon</option>
                            <option value="armor">Armor</option>
                            <option value="shield">Shield</option>
                            <option value="container">Container</option>
                            <option value="tool">Tool</option>
                        </select>
                    </div>
                </div>

                {newItemType !== "other" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {newItemType === "armor" && (
                            <div className="flex flex-col gap-2 p-3 bg-blue-50/30 rounded border border-blue-100">
                                <label className="text-xs font-bold text-blue-800 uppercase">Armor Selection</label>
                                <select
                                    value={newItemArmorDetails?.baseArmor || "Custom"}
                                    onChange={(e) => handleBaseArmorSelect(e.target.value)}
                                    className="text-xs border border-blue-200 rounded p-2 w-full bg-white"
                                >
                                    <option value="Custom">Custom Armor</option>
                                    {Object.keys(ARMOR_DATA)
                                        .filter(name => ARMOR_DATA[name].category !== "Shield")
                                        .sort()
                                        .map(name => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                </select>

                                {newItemArmorDetails && (
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                        <div>
                                            <label className="block text-xs text-gray-500 font-semibold uppercase">AC</label>
                                            <input
                                                type="number"
                                                value={newItemArmorDetails.ac}
                                                onChange={(e) => setNewItemArmorDetails({ ...newItemArmorDetails, ac: parseInt(e.target.value) || 0 })}
                                                className="text-xs border border-gray-300 rounded p-1.5 w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 font-semibold uppercase">Category</label>
                                            <select
                                                value={newItemArmorDetails.category}
                                                onChange={(e) => setNewItemArmorDetails({ ...newItemArmorDetails, category: e.target.value as any })}
                                                className="text-xs border border-gray-300 rounded p-1.5 w-full"
                                            >
                                                <option value="Light">Light</option>
                                                <option value="Medium">Medium</option>
                                                <option value="Heavy">Heavy</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 font-semibold uppercase">STR Req</label>
                                            <input
                                                type="number"
                                                value={newItemArmorDetails.strengthRequirement || ""}
                                                onChange={(e) => setNewItemArmorDetails({ ...newItemArmorDetails, strengthRequirement: parseInt(e.target.value) || undefined })}
                                                placeholder="None"
                                                className="text-xs border border-gray-300 rounded p-1.5 w-full"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 pt-4">
                                            <input
                                                type="checkbox"
                                                checked={newItemArmorDetails.stealthDisadvantage}
                                                onChange={(e) => setNewItemArmorDetails({ ...newItemArmorDetails, stealthDisadvantage: e.target.checked })}
                                                className="w-4 h-4"
                                            />
                                            <label className="text-xs text-gray-500 font-semibold uppercase">Stealth Disadv</label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={newItemArmorDetails.dexBonus}
                                                onChange={(e) => setNewItemArmorDetails({ ...newItemArmorDetails, dexBonus: e.target.checked })}
                                                className="w-4 h-4"
                                            />
                                            <label className="text-xs text-gray-500 font-semibold uppercase">DEX Bonus</label>
                                        </div>
                                        {newItemArmorDetails.dexBonus && (
                                            <div>
                                                <label className="block text-xs text-gray-500 font-semibold uppercase">DEX Cap</label>
                                                <input
                                                    type="number"
                                                    value={newItemArmorDetails.dexCap || ""}
                                                    onChange={(e) => setNewItemArmorDetails({ ...newItemArmorDetails, dexCap: parseInt(e.target.value) || undefined })}
                                                    placeholder="None"
                                                    className="text-xs border border-gray-300 rounded p-1.5 w-full"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {newItemType === "shield" && (
                            <div className="flex flex-col gap-2 p-3 bg-blue-50/30 rounded border border-blue-100">
                                <label className="text-xs font-bold text-blue-800 uppercase">Shield Selection</label>
                                <select
                                    value={newItemArmorDetails?.baseArmor || "Shield"}
                                    onChange={(e) => handleBaseArmorSelect(e.target.value)}
                                    className="text-xs border border-blue-200 rounded p-2 w-full bg-white"
                                >
                                    {Object.keys(ARMOR_DATA)
                                        .filter(name => ARMOR_DATA[name].category === "Shield")
                                        .sort()
                                        .map(name => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                </select>
                                {newItemArmorDetails && (
                                    <div>
                                        <label className="block text-xs text-gray-500 font-semibold uppercase">Shield AC Bonus</label>
                                        <input
                                            type="number"
                                            value={newItemArmorDetails.ac}
                                            onChange={(e) => setNewItemArmorDetails({ ...newItemArmorDetails, ac: parseInt(e.target.value) || 0 })}
                                            className="text-xs border border-gray-300 rounded p-1.5 w-full"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {newItemType === "container" && (
                            <div className="flex flex-col gap-2 p-3 bg-green-50/30 rounded border border-green-100">
                                <label className="text-xs font-bold text-green-800 uppercase">Container Selection</label>
                                <select
                                    value={newItemContainerDetails?.capacityWeight ? newItemName : "Custom"}
                                    onChange={(e) => handleBaseContainerSelect(e.target.value)}
                                    className="text-xs border border-green-200 rounded p-2 w-full bg-white"
                                >
                                    <option value="Custom">Custom</option>
                                    {Object.keys(CONTAINER_DATA).sort().map(name => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>

                                {newItemContainerDetails && (
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                        <div>
                                            <label className="block text-xs text-gray-500 font-semibold uppercase">Capacity (lbs)</label>
                                            <input
                                                type="number"
                                                value={newItemContainerDetails.capacityWeight ?? ""}
                                                onChange={(e) => setNewItemContainerDetails({ ...newItemContainerDetails, capacityWeight: parseInt(e.target.value) || undefined })}
                                                placeholder="Unlimited"
                                                className="text-xs border border-gray-300 rounded p-1.5 w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 font-semibold uppercase">Wt Multiplier</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={newItemContainerDetails.contentsWeightMultiplier}
                                                onChange={(e) => setNewItemContainerDetails({ ...newItemContainerDetails, contentsWeightMultiplier: parseFloat(e.target.value) || 0 })}
                                                className="text-xs border border-gray-300 rounded p-1.5 w-full"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {newItemType === "weapon" && newItemWeaponDetails && (
                            <div className="flex flex-col gap-2 p-3 bg-red-50/30 rounded border border-red-100">
                                <label className="text-xs font-bold text-red-800 uppercase">Weapon Selection</label>
                                <select
                                    value={newItemWeaponDetails.baseWeapon || "Custom"}
                                    onChange={(e) => handleBaseWeaponSelect(e.target.value)}
                                    className="text-xs border border-red-200 rounded p-2 w-full bg-white"
                                >
                                    <option value="Custom">Custom Weapon</option>
                                    {Object.keys(WEAPON_DATA).sort().map(name => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <div className="col-span-2 grid grid-cols-2 gap-2">
                                        <select
                                            value={newItemWeaponDetails.category}
                                            onChange={(e) => setNewItemWeaponDetails({ ...newItemWeaponDetails, category: e.target.value as any })}
                                            className="text-xs border border-gray-300 rounded p-1.5 w-full bg-white"
                                        >
                                            <option value="Simple">Simple</option>
                                            <option value="Martial">Martial</option>
                                        </select>
                                        <select
                                            value={newItemWeaponDetails.rangeType}
                                            onChange={(e) => setNewItemWeaponDetails({ ...newItemWeaponDetails, rangeType: e.target.value as any })}
                                            className="text-xs border border-gray-300 rounded p-1.5 w-full bg-white"
                                        >
                                            <option value="Melee">Melee</option>
                                            <option value="Ranged">Ranged</option>
                                        </select>
                                    </div>
                                    <input
                                        type="text"
                                        value={newItemWeaponDetails.damageDice}
                                        onChange={(e) => setNewItemWeaponDetails({ ...newItemWeaponDetails, damageDice: e.target.value })}
                                        placeholder="Damage (e.g. 1d6)"
                                        className="text-xs border border-gray-300 rounded p-1.5"
                                    />
                                    <input
                                        type="text"
                                        value={newItemWeaponDetails.damageType}
                                        onChange={(e) => setNewItemWeaponDetails({ ...newItemWeaponDetails, damageType: e.target.value })}
                                        placeholder="Type (e.g. slashing)"
                                        className="text-xs border border-gray-300 rounded p-1.5"
                                    />
                                    <input
                                        type="text"
                                        value={newItemWeaponDetails.properties.join(", ")}
                                        onChange={(e) => setNewItemWeaponDetails({
                                            ...newItemWeaponDetails,
                                            properties: e.target.value.split(",").map(p => p.trim()).filter(p => p !== "")
                                        })}
                                        placeholder="Properties (comma separated)"
                                        className="text-xs border border-gray-300 rounded p-1.5 col-span-2"
                                    />
                                    <input
                                        type="text"
                                        value={newItemWeaponDetails.mastery || ""}
                                        onChange={(e) => setNewItemWeaponDetails({ ...newItemWeaponDetails, mastery: e.target.value })}
                                        placeholder="Mastery (e.g. Vex)"
                                        className="text-xs border border-gray-300 rounded p-1.5 col-span-2"
                                    />
                                </div>
                            </div>
                        )}

                        {newItemType === "tool" && newItemToolDetails && (
                            <div className="flex flex-col gap-2 p-3 bg-purple-50/30 rounded border border-purple-100">
                                <label className="text-xs font-bold text-purple-800 uppercase">Tool Selection</label>
                                <select
                                    value={newItemToolDetails.baseTool || "Custom"}
                                    onChange={(e) => handleBaseToolSelect(e.target.value)}
                                    className="text-xs border border-purple-200 rounded p-2 w-full bg-white"
                                >
                                    <option value="Custom">Custom Tool</option>
                                    {Object.keys(TOOL_DATA).sort().map(name => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>
                                <div className="grid grid-cols-1 gap-2 mt-1">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                                            <select
                                                value={newItemToolDetails.category}
                                                onChange={(e) => setNewItemToolDetails({ ...newItemToolDetails, category: e.target.value as any })}
                                                className="text-xs border border-gray-300 rounded p-1.5 w-full bg-white"
                                            >
                                                <option value="Artisan Tool">Artisan Tool</option>
                                                <option value="Other Tool">Other Tool</option>
                                                <option value="Gaming Set">Gaming Set</option>
                                                <option value="Musical Instrument">Musical Instrument</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Ability</label>
                                            <input
                                                type="text"
                                                value={newItemToolDetails.ability}
                                                onChange={(e) => setNewItemToolDetails({ ...newItemToolDetails, ability: e.target.value })}
                                                placeholder="e.g. Dexterity"
                                                className="text-xs border border-gray-300 rounded p-1.5"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Utilize (2024 Rule)</label>
                                        <textarea
                                            value={newItemToolDetails.utilize}
                                            onChange={(e) => setNewItemToolDetails({ ...newItemToolDetails, utilize: e.target.value })}
                                            placeholder="Utilize action details..."
                                            className="text-xs border border-gray-300 rounded p-1.5 min-h-[60px]"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Craft (2024 Rule)</label>
                                        <textarea
                                            value={newItemToolDetails.craft}
                                            onChange={(e) => setNewItemToolDetails({ ...newItemToolDetails, craft: e.target.value })}
                                            placeholder="Crafting details..."
                                            className="text-xs border border-gray-300 rounded p-1.5 min-h-[60px]"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <ItemFeaturesEditor
                    itemName={newItemName}
                    features={newItemFeatures}
                    onUpdate={setNewItemFeatures}
                />
            </div>
        </EntityForm>
    );
};

export default AddItemForm;
