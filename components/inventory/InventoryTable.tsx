import React from "react";
import { InventoryItem, Resource } from "../../types/character";
import InventoryRow from "./InventoryRow";

interface InventoryTableProps {
    items: InventoryItem[];
    allInventory: InventoryItem[];
    section: "equipment" | "inventory";
    updateItem: (id: string, field: keyof InventoryItem, value: any) => void;
    removeItem: (id: string) => void;
    toggleExpand: (id: string) => void;
    expandedItemIds: string[];
    resources?: Resource[];
    onUpdateResources?: (resources: Resource[]) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({
    items,
    allInventory,
    section,
    updateItem,
    removeItem,
    toggleExpand,
    expandedItemIds,
    resources = [],
    onUpdateResources
}) => {
    if (items.length === 0) return <div className="text-gray-500 italic text-sm p-2">No items</div>;

    return (
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="border-b text-[10px] text-gray-400 uppercase tracking-tighter">
                    <th className="p-2 w-10">Qty</th>
                    <th className="p-2">Name</th>
                    <th className="p-2 w-16">Cost</th>
                    <th className="p-2 w-16">Wt</th>
                    {section === "equipment" && <th className="p-2 w-10 text-center">Eq</th>}
                    <th className="p-2 w-6"></th>
                </tr>
            </thead>
            <tbody>
                {items.map((item) => (
                    <InventoryRow
                        key={item.id}
                        item={item}
                        allInventory={allInventory}
                        section={section}
                        updateItem={updateItem}
                        removeItem={removeItem}
                        isExpanded={expandedItemIds.includes(item.id)}
                        onToggleExpand={() => toggleExpand(item.id)}
                        resources={resources}
                        onUpdateResources={onUpdateResources}
                    />
                ))}
            </tbody>
        </table>
    );
};

export default InventoryTable;
