import React from "react";
import { InventoryItem } from "../../types/character";
import ItemDetailView from "./ItemDetailView";
import { ChevronDown, ChevronRight, Trash2, CornerDownRight } from "lucide-react";

interface InventoryRowProps {
    item: InventoryItem;
    allInventory: InventoryItem[];
    section: "equipment" | "inventory";
    updateItem: (id: string, field: keyof InventoryItem, value: any) => void;
    removeItem: (id: string) => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

const InventoryRow: React.FC<InventoryRowProps> = ({
    item,
    allInventory,
    section,
    updateItem,
    removeItem,
    isExpanded,
    onToggleExpand
}) => {
    const isNested = !!item.parentId;
    const containers = allInventory.filter(i => i.isContainer && i.itemType === "container");

    return (
        <React.Fragment>
            <tr className={`border-b hover:bg-gray-50 transition-colors ${isNested ? "bg-gray-50/30" : ""}`}>
                <td className="p-2">
                    <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                        className="w-10 p-1 border rounded text-xs text-center"
                        min="0"
                    />
                </td>
                <td className="p-2">
                    <div className="flex items-center gap-1">
                        {isNested && <CornerDownRight className="w-3 h-3 text-gray-300 ml-2" />}
                        <button
                            onClick={onToggleExpand}
                            className="text-gray-400 hover:text-gray-600 w-4 flex items-center justify-center"
                        >
                            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                        <div className="flex-1">
                            <input
                                type="text"
                                value={item.name}
                                onChange={(e) => updateItem(item.id, "name", e.target.value)}
                                className="w-full p-1 border border-transparent hover:border-gray-200 rounded text-sm font-medium focus:bg-white"
                            />
                            {/* Item Metadata Summary */}
                            <div className="px-1 text-[10px] text-gray-500 flex flex-wrap gap-x-2 gap-y-0.5">
                                {item.itemType === "weapon" && item.weaponDetails && (
                                    <React.Fragment>
                                        <span className="font-semibold text-red-700/70">{item.weaponDetails.damageDice} {item.weaponDetails.damageType}</span>
                                        {item.weaponDetails.properties.length > 0 && (
                                            <span className="italic">{item.weaponDetails.properties.join(", ")}</span>
                                        )}
                                        {item.weaponDetails.mastery && (
                                            <span className="bg-red-50 text-red-600 px-1 rounded border border-red-100 font-bold uppercase text-[8px]">{item.weaponDetails.mastery}</span>
                                        )}
                                    </React.Fragment>
                                )}
                                {(item.itemType === "armor" || item.itemType === "shield") && item.armorDetails && (
                                    <React.Fragment>
                                        <span className="font-semibold text-blue-700/70">{item.itemType === "armor" ? item.armorDetails.category : "Shield"} • AC {item.armorDetails.ac}</span>
                                        {item.armorDetails.strengthRequirement && (
                                            <span className="text-orange-600">Str {item.armorDetails.strengthRequirement}</span>
                                        )}
                                        {item.armorDetails.stealthDisadvantage && (
                                            <span className="text-gray-400 italic">Stealth Disadv.</span>
                                        )}
                                    </React.Fragment>
                                )}
                                {item.isContainer && item.containerDetails && (
                                    <span className="text-green-600 font-medium">
                                        {(item.containerDetails.capacityWeight ?? 0) > 0 ? `Cap: ${item.containerDetails.capacityWeight} lbs` : "Unlimited"}
                                        {item.containerDetails.contentsWeightMultiplier !== 1 && ` • x${item.containerDetails.contentsWeightMultiplier} Wt`}
                                    </span>
                                )}
                                {item.itemType === "tool" && item.toolDetails && (
                                    <React.Fragment>
                                        <span className="font-semibold text-purple-700/70">{item.toolDetails.category}</span>
                                        <span className="text-gray-400 italic">• {item.toolDetails.ability}</span>
                                    </React.Fragment>
                                )}
                            </div>
                        </div>
                    </div>
                </td>
                <td className="p-2">
                    <input
                        type="number"
                        value={item.costGP ?? 0}
                        onChange={(e) => updateItem(item.id, "costGP", Number(e.target.value))}
                        className="w-14 p-1 border rounded text-xs text-center"
                        min="0"
                    />
                </td>
                <td className="p-2">
                    <input
                        type="number"
                        value={item.weight}
                        onChange={(e) => updateItem(item.id, "weight", Number(e.target.value))}
                        className="w-14 p-1 border rounded text-xs text-center"
                        min="0"
                    />
                </td>
                {section === "equipment" && (
                    <td className="p-2 text-center">
                        <input
                            type="checkbox"
                            checked={item.equipped ?? false}
                            onChange={(e) => updateItem(item.id, "equipped", e.target.checked)}
                            className="w-4 h-4 cursor-pointer"
                        />
                    </td>
                )}
                <td className="p-2">
                    <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors flex items-center justify-center w-full"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </td>
            </tr>
            {isExpanded && (
                <tr className="bg-gray-50/50">
                    <td colSpan={section === "equipment" ? 6 : 5} className="p-4 pt-2">
                        <ItemDetailView
                            item={item}
                            containers={containers}
                            updateItem={updateItem}
                        />
                    </td>
                </tr>
            )}
        </React.Fragment>
    );
};

export default InventoryRow;
