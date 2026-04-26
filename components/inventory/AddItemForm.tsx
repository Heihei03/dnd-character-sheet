import React, { useState } from "react";

// UI Components
import Button from "../ui/button";
import { CardContent } from "../ui/card";
import EntityForm from "../ui/EntityForm";
import Select from "../ui/Select";
import NumericInput from "../ui/NumericInput";

// Components
import ItemFeaturesEditor from "./ItemFeaturesEditor";

// Data
import { ARMOR_DATA } from "../../data/armor";
import { CONTAINER_DATA } from "../../data/containers";
import { TOOL_DATA } from "../../data/tools";
import { WEAPON_DATA } from "../../data/weapons";
import { 
    DAMAGE_TYPES, 
    WEAPON_PROPERTIES, 
    WEAPON_MASTERY_TYPES 
} from "../../utils/constants";
import { ABILITY_NAMES } from "../../utils/character-utils";
import ThemedAutocomplete from "../ui/ThemedAutocomplete";

// Types
import { 
  ArmorDetails, 
  ContainerDetails, 
  Feature, 
  InventoryItem, 
  ToolDetails, 
  WeaponDetails,
  AmmunitionDetails
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
    const [newItemType, setNewItemType] = useState<"weapon" | "armor" | "shield" | "container" | "tool" | "ammunition" | "other">("other");
    const [newItemWondrous, setNewItemWondrous] = useState(false);
    const [newItemWeaponDetails, setNewItemWeaponDetails] = useState<WeaponDetails | undefined>(undefined);
    const [newItemArmorDetails, setNewItemArmorDetails] = useState<ArmorDetails | undefined>(undefined);
    const [newItemContainerDetails, setNewItemContainerDetails] = useState<ContainerDetails | undefined>(undefined);
    const [newItemToolDetails, setNewItemToolDetails] = useState<ToolDetails | undefined>(undefined);
    const [newItemAmmunitionDetails, setNewItemAmmunitionDetails] = useState<AmmunitionDetails | undefined>(undefined);
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

    const handleBaseAmmunitionSelect = (baseName: string) => {
        if (baseName === "Custom") {
            setNewItemName("Custom Ammunition");
            setNewItemAmmunitionDetails({
                baseAmmunition: "Custom",
                category: "Arrows"
            });
        }
        // Add predefined ammunition data here if available in the future
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
            ammunitionDetails: newItemAmmunitionDetails,
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
        setNewItemAmmunitionDetails(undefined);
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
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-[10px] text-muted-foreground font-black mb-1 uppercase tracking-widest">Item Name</label>
                        <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Item name..." className="w-full p-2 border border-border bg-background rounded focus:ring-1 focus:ring-primary outline-none transition-all" />
                    </div>
                    <div className="w-24">
                        <label className="block text-[10px] text-muted-foreground font-black mb-1 uppercase tracking-widest">Cost (GP)</label>
                        <NumericInput value={newItemCost} onChange={(val) => setNewItemCost(val)} variant="horizontal" className="w-full" inputClassName="p-2 h-9 text-center" min={0} />
                    </div>
                    <div className="w-24">
                        <label className="block text-[10px] text-muted-foreground font-black mb-1 uppercase tracking-widest">Wt (lbs)</label>
                        <NumericInput value={newItemWeight} onChange={(val) => setNewItemWeight(val)} variant="horizontal" className="w-full" inputClassName="p-2 h-9 text-center" min={0} />
                    </div>
                    <div className="w-20">
                        <label className="block text-[10px] text-muted-foreground font-black mb-1 uppercase tracking-widest">Qty</label>
                        <NumericInput value={newItemQuantity} onChange={(val) => setNewItemQuantity(val)} variant="horizontal" className="w-full" inputClassName="p-2 h-9 text-center" min={1} />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] text-muted-foreground font-black mb-1 uppercase tracking-widest">Description</label>
                    <textarea 
                        value={newItemDescription} 
                        onChange={(e) => setNewItemDescription(e.target.value)} 
                        placeholder="Item description..." 
                        className="w-full p-3 border border-border bg-background rounded text-sm min-h-[120px] focus:ring-1 focus:ring-primary outline-none transition-all" 
                    />
                </div>
                <div className="flex flex-wrap gap-4 items-center bg-secondary/30 p-3 rounded-lg border border-border">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-tight cursor-pointer hover:text-primary transition-colors">
                        <input type="checkbox" checked={newItemEquippable} onChange={(e) => setNewItemEquippable(e.target.checked)} className="w-4 h-4 accent-primary" />
                        Equippable
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-tight cursor-pointer hover:text-primary transition-colors">
                        <input type="checkbox" checked={newItemAttunable} onChange={(e) => setNewItemAttunable(e.target.checked)} className="w-4 h-4 accent-primary" />
                        Attunable
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-tight cursor-pointer hover:text-primary transition-colors">
                        <input type="checkbox" checked={newItemWondrous} onChange={(e) => setNewItemWondrous(e.target.checked)} className="w-4 h-4 accent-primary" />
                        Wondrous
                    </label>
                    <div className="flex-1 min-w-[20px]"></div>
                    <div className="flex items-center gap-2">
                        <label className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Type:</label>
                        <Select 
                            value={newItemType} 
                            onValueChange={(val) => {
                                const type = val as any;
                                setNewItemType(type);
                                if (type === "weapon") handleBaseWeaponSelect("Custom");
                                else if (type === "armor" || type === "shield") handleBaseArmorSelect("Custom", type);
                                else if (type === "container") handleBaseContainerSelect("Custom");
                                else if (type === "tool") handleBaseToolSelect("Custom");
                                else if (type === "ammunition") handleBaseAmmunitionSelect("Custom");
                            }}
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

                {newItemType !== "other" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {newItemType === "armor" && (
                            <div className="flex flex-col gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
                                <label className="text-[10px] font-black text-primary uppercase tracking-widest">Armor Selection</label>
                                <Select
                                    value={newItemArmorDetails?.baseArmor || "Custom"}
                                    onValueChange={(val) => handleBaseArmorSelect(val)}
                                    options={[
                                        { label: "Custom Armor", value: "Custom" },
                                        ...Object.keys(ARMOR_DATA)
                                            .filter(name => ARMOR_DATA[name].category !== "Shield")
                                            .sort()
                                            .map(name => ({ label: name, value: name }))
                                    ]}
                                />

                                {newItemArmorDetails && (
                                    <div className="grid grid-cols-2 gap-3 mt-1">
                                        <div>
                                            <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-tight mb-1">AC</label>
                                            <NumericInput
                                                value={newItemArmorDetails.ac}
                                                onChange={(val) => setNewItemArmorDetails({ ...newItemArmorDetails, ac: val })}
                                                variant="horizontal"
                                                className="w-full"
                                                inputClassName="text-xs p-2 h-8 text-center"
                                                min={0}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-tight mb-1">Category</label>
                                            <Select
                                                value={newItemArmorDetails.category}
                                                onValueChange={(val) => setNewItemArmorDetails({ ...newItemArmorDetails, category: val as any })}
                                                options={[
                                                    { label: "Light", value: "Light" },
                                                    { label: "Medium", value: "Medium" },
                                                    { label: "Heavy", value: "Heavy" },
                                                ]}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-tight mb-1">STR Req</label>
                                            <NumericInput
                                                value={newItemArmorDetails.strengthRequirement || ""}
                                                onChange={(val) => setNewItemArmorDetails({ ...newItemArmorDetails, strengthRequirement: val || undefined })}
                                                placeholder="None"
                                                variant="horizontal"
                                                className="w-full"
                                                inputClassName="text-xs p-2 h-8 text-center"
                                                min={0}
                                            />
                                        </div>
                                        <div className="flex flex-col justify-end">
                                            <div className="flex items-center gap-2 mb-2">
                                                <input
                                                    type="checkbox"
                                                    checked={newItemArmorDetails.stealthDisadvantage}
                                                    onChange={(e) => setNewItemArmorDetails({ ...newItemArmorDetails, stealthDisadvantage: e.target.checked })}
                                                    className="w-4 h-4 accent-primary"
                                                />
                                                <label className="text-[10px] text-muted-foreground font-black uppercase tracking-tight">Stealth Disadv</label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={newItemArmorDetails.dexBonus}
                                                    onChange={(e) => setNewItemArmorDetails({ ...newItemArmorDetails, dexBonus: e.target.checked })}
                                                    className="w-4 h-4 accent-primary"
                                                />
                                                <label className="text-[10px] text-muted-foreground font-black uppercase tracking-tight">DEX Bonus</label>
                                            </div>
                                        </div>
                                        {newItemArmorDetails.dexBonus && (
                                            <div className="col-span-2">
                                                <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-tight mb-1">DEX Cap</label>
                                                <NumericInput
                                                    value={newItemArmorDetails.dexCap || ""}
                                                    onChange={(val) => setNewItemArmorDetails({ ...newItemArmorDetails, dexCap: val || undefined })}
                                                    placeholder="None"
                                                    variant="horizontal"
                                                    className="w-full"
                                                    inputClassName="text-xs p-2 h-8 text-center"
                                                    min={0}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {newItemType === "shield" && (
                            <div className="flex flex-col gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
                                <label className="text-[10px] font-black text-primary uppercase tracking-widest">Shield Selection</label>
                                <Select
                                    value={newItemArmorDetails?.baseArmor || "Shield"}
                                    onValueChange={(val) => handleBaseArmorSelect(val)}
                                    options={Object.keys(ARMOR_DATA)
                                        .filter(name => ARMOR_DATA[name].category === "Shield")
                                        .sort()
                                        .map(name => ({ label: name, value: name }))}
                                />
                                {newItemArmorDetails && (
                                    <div>
                                        <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-tight mb-1">Shield AC Bonus</label>
                                        <NumericInput
                                            value={newItemArmorDetails.ac}
                                            onChange={(val) => setNewItemArmorDetails({ ...newItemArmorDetails, ac: val })}
                                            variant="horizontal"
                                            className="w-full"
                                            inputClassName="text-xs p-2 h-8 text-center"
                                            min={0}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {newItemType === "container" && (
                            <div className="flex flex-col gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
                                <label className="text-[10px] font-black text-primary uppercase tracking-widest">Container Selection</label>
                                <Select
                                    value={newItemContainerDetails?.capacityWeight ? newItemName : "Custom"}
                                    onValueChange={(val) => handleBaseContainerSelect(val)}
                                    options={[
                                        { label: "Custom", value: "Custom" },
                                        ...Object.keys(CONTAINER_DATA).sort().map(name => ({ label: name, value: name }))
                                    ]}
                                />

                                {newItemContainerDetails && (
                                    <div className="grid grid-cols-2 gap-3 mt-1">
                                        <div>
                                            <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-tight mb-1">Capacity (lbs)</label>
                                            <NumericInput
                                                value={newItemContainerDetails.capacityWeight ?? ""}
                                                onChange={(val) => setNewItemContainerDetails({ ...newItemContainerDetails, capacityWeight: val || undefined })}
                                                placeholder="Unlimited"
                                                variant="horizontal"
                                                className="w-full"
                                                inputClassName="text-xs p-2 h-8 text-center"
                                                min={0}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-tight mb-1">Wt Multiplier</label>
                                            <NumericInput
                                                step={0.1}
                                                value={newItemContainerDetails.contentsWeightMultiplier}
                                                onChange={(val) => setNewItemContainerDetails({ ...newItemContainerDetails, contentsWeightMultiplier: val })}
                                                variant="horizontal"
                                                className="w-full"
                                                inputClassName="text-xs p-2 h-8 text-center"
                                                min={0}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {newItemType === "weapon" && newItemWeaponDetails && (
                            <div className="flex flex-col gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
                                <label className="text-[10px] font-black text-primary uppercase tracking-widest">Weapon Selection</label>
                                <Select
                                    value={newItemWeaponDetails.baseWeapon || "Custom"}
                                    onValueChange={(val) => handleBaseWeaponSelect(val)}
                                    options={[
                                        { label: "Custom Weapon", value: "Custom" },
                                        ...Object.keys(WEAPON_DATA).sort().map(name => ({ label: name, value: name }))
                                    ]}
                                />
                                <div className="grid grid-cols-2 gap-3 mt-1">
                                    <div className="col-span-2 grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-tight mb-1">Category</label>
                                            <Select
                                                value={newItemWeaponDetails.category}
                                                onValueChange={(val) => setNewItemWeaponDetails({ ...newItemWeaponDetails, category: val as any })}
                                                options={[
                                                    { label: "Simple", value: "Simple" },
                                                    { label: "Martial", value: "Martial" },
                                                ]}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-tight mb-1">Range</label>
                                            <Select
                                                value={newItemWeaponDetails.rangeType}
                                                onValueChange={(val) => setNewItemWeaponDetails({ ...newItemWeaponDetails, rangeType: val as any })}
                                                options={[
                                                    { label: "Melee", value: "Melee" },
                                                    { label: "Ranged", value: "Ranged" },
                                                ]}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-tight mb-1">Damage</label>
                                        <input
                                            type="text"
                                            value={newItemWeaponDetails.damageDice}
                                            onChange={(e) => setNewItemWeaponDetails({ ...newItemWeaponDetails, damageDice: e.target.value })}
                                            placeholder="1d6"
                                            className="text-xs border border-border bg-background rounded-md p-2 w-full focus:ring-1 focus:ring-primary outline-none font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-tight mb-1">Type</label>
                                        <ThemedAutocomplete
                                            value={newItemWeaponDetails.damageType || ""}
                                            onChange={(val: string) => setNewItemWeaponDetails({ ...newItemWeaponDetails, damageType: val })}
                                            options={Array.from(DAMAGE_TYPES)}
                                            placeholder="slashing"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-tight mb-1">Properties</label>
                                        <ThemedAutocomplete
                                            value={newItemWeaponDetails.properties.join(", ")}
                                            onChange={(val: string) => setNewItemWeaponDetails({
                                                ...newItemWeaponDetails,
                                                properties: val.split(",").map(p => p.trim()).filter(p => p !== "")
                                            })}
                                            options={WEAPON_PROPERTIES}
                                            placeholder="Finesse, Light, etc."
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-tight mb-1">Mastery</label>
                                        <ThemedAutocomplete
                                            value={newItemWeaponDetails.mastery || ""}
                                            onChange={(val: string) => setNewItemWeaponDetails({ ...newItemWeaponDetails, mastery: val })}
                                            options={WEAPON_MASTERY_TYPES}
                                            placeholder="Vex, Nick, etc."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {newItemType === "tool" && newItemToolDetails && (
                            <div className="flex flex-col gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
                                <label className="text-[10px] font-black text-primary uppercase tracking-widest">Tool Selection</label>
                                <Select
                                    value={newItemToolDetails.baseTool || "Custom"}
                                    onValueChange={(val) => handleBaseToolSelect(val)}
                                    options={[
                                        { label: "Custom Tool", value: "Custom" },
                                        ...Object.keys(TOOL_DATA).sort().map(name => ({ label: name, value: name }))
                                    ]}
                                />
                                <div className="grid grid-cols-1 gap-3 mt-1">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] text-muted-foreground font-black uppercase tracking-tight mb-1">Category</label>
                                            <Select
                                                value={newItemToolDetails.category}
                                                onValueChange={(val) => setNewItemToolDetails({ ...newItemToolDetails, category: val as any })}
                                                options={[
                                                    { label: "Artisan Tool", value: "Artisan Tool" },
                                                    { label: "Other Tool", value: "Other Tool" },
                                                    { label: "Gaming Set", value: "Gaming Set" },
                                                    { label: "Musical Instrument", value: "Musical Instrument" },
                                                ]}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-muted-foreground font-black uppercase tracking-tight mb-1">Ability</label>
                                            <ThemedAutocomplete
                                                value={newItemToolDetails.ability}
                                                onChange={(val: string) => setNewItemToolDetails({ ...newItemToolDetails, ability: val })}
                                                options={ABILITY_NAMES}
                                                placeholder="Dexterity"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-muted-foreground font-black uppercase tracking-tight mb-1">Utilize (2024 Rule)</label>
                                        <textarea
                                            value={newItemToolDetails.utilize}
                                            onChange={(e) => setNewItemToolDetails({ ...newItemToolDetails, utilize: e.target.value })}
                                            placeholder="Utilize action details..."
                                            className="text-xs border border-border bg-background rounded-md p-2 w-full focus:ring-1 focus:ring-primary outline-none min-h-[60px]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-muted-foreground font-black uppercase tracking-tight mb-1">Craft (2024 Rule)</label>
                                        <textarea
                                            value={newItemToolDetails.craft}
                                            onChange={(e) => setNewItemToolDetails({ ...newItemToolDetails, craft: e.target.value })}
                                            placeholder="Crafting details..."
                                            className="text-xs border border-border bg-background rounded-md p-2 w-full focus:ring-1 focus:ring-primary outline-none min-h-[60px]"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        {newItemType === "ammunition" && newItemAmmunitionDetails && (
                            <div className="flex flex-col gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
                                <label className="text-[10px] font-black text-primary uppercase tracking-widest">Ammunition Selection</label>
                                <Select
                                    value={newItemAmmunitionDetails.baseAmmunition || "Custom"}
                                    onValueChange={(val) => handleBaseAmmunitionSelect(val)}
                                    options={[
                                        { label: "Custom Ammunition", value: "Custom" },
                                    ]}
                                />
                                <div className="grid grid-cols-1 gap-3 mt-1">
                                    <div>
                                        <label className="text-[10px] text-muted-foreground font-black uppercase tracking-tight mb-1">Category</label>
                                        <ThemedAutocomplete
                                            value={newItemAmmunitionDetails.category}
                                            onChange={(val: string) => setNewItemAmmunitionDetails({ ...newItemAmmunitionDetails, category: val })}
                                            options={["Arrows", "Bolts", "Bullets", "Needles", "Sling Bullets"]}
                                            placeholder="Arrows"
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
