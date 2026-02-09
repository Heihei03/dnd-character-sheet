import React from "react";
import { InventoryItem } from "../../types/character";

interface ItemDetailViewProps {
    item: InventoryItem;
    containers: InventoryItem[];
    updateItem: (id: string, field: keyof InventoryItem, value: any) => void;
}

const ItemDetailView: React.FC<ItemDetailViewProps> = ({ item, containers, updateItem }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="grid grid-cols-3 gap-2">
                        <input
                            type="text"
                            value={item.weaponDetails.damageDice}
                            onChange={e => updateItem(item.id, "weaponDetails", { ...item.weaponDetails, damageDice: e.target.value })}
                            className="p-1 border rounded text-xs"
                            placeholder="Damage Dice"
                        />
                        <input
                            type="text"
                            value={item.weaponDetails.damageType}
                            onChange={e => updateItem(item.id, "weaponDetails", { ...item.weaponDetails, damageType: e.target.value })}
                            className="p-1 border rounded text-xs"
                            placeholder="Damage Type"
                        />
                        <input
                            type="text"
                            value={item.weaponDetails.mastery || ""}
                            onChange={e => updateItem(item.id, "weaponDetails", { ...item.weaponDetails, mastery: e.target.value })}
                            placeholder="Mastery"
                            className="p-1 border rounded text-xs"
                        />
                    </div>
                </div>
            )}

            {(item.itemType === "armor" || item.itemType === "shield") && item.armorDetails && (
                <div className="md:col-span-2 mt-2 p-3 bg-blue-50/30 rounded border border-blue-100">
                    <label className="block text-[10px] font-bold text-blue-800 uppercase mb-2">Armor Stats</label>
                    <div className="grid grid-cols-3 gap-2">
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
                            <label className="block text-[9px] text-gray-500">DEX Bonus</label>
                            <input
                                type="checkbox"
                                checked={item.armorDetails.dexBonus}
                                onChange={e => updateItem(item.id, "armorDetails", { ...item.armorDetails, dexBonus: e.target.checked })}
                                className="w-4 h-4 ml-1 mt-1"
                            />
                        </div>
                        {item.armorDetails.dexBonus && (
                            <div>
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
        </div>
    );
};

export default ItemDetailView;
