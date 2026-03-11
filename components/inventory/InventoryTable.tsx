import React from "react";
import { InventoryItem, Resource } from "../../types/character";
import InventoryRow from "./InventoryRow";
import { useState } from "react";
import ConfirmationModal from "../ui/ConfirmationModal";

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
    isReorderMode?: boolean;
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
    onUpdateResources,
    isReorderMode = false
}) => {
    const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

    if (items.length === 0) return <div className="text-gray-500 italic text-sm p-2">No items</div>;

    return (
        <>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b text-[10px] text-gray-400 uppercase tracking-tighter">
                        <th className="p-2 w-10">Qty</th>
                        <th className="p-2">Name</th>
                        <th className="p-2 w-16">Cost</th>
                        <th className="p-2 w-16">Wt</th>
                        {section === "equipment" && <th className="p-2 w-10 text-center">Eq</th>}
                        <th className="p-2 w-6"></th>
                        <th className="p-2 w-6"></th>
                        {isReorderMode && <th className="p-1 w-6"></th>}
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
                            removeItem={(id: string) => {
                                const item = items.find(i => i.id === id);
                                if (item) setItemToDelete(item);
                            }}
                            isExpanded={expandedItemIds.includes(item.id)}
                            onToggleExpand={() => toggleExpand(item.id)}
                            resources={resources}
                            onUpdateResources={onUpdateResources}
                            isReorderMode={isReorderMode}
                        />
                    ))}
                </tbody>
            </table>

            <ConfirmationModal
                isOpen={itemToDelete !== null}
                onClose={() => setItemToDelete(null)}
                onConfirm={() => {
                    if (itemToDelete) {
                        removeItem(itemToDelete.id);
                        setItemToDelete(null);
                    }
                }}
                title="Remove Item"
                message={`Are you sure you want to remove "${itemToDelete?.name}" from your inventory?`}
                confirmText="Remove"
            />
        </>
    );
};

export default InventoryTable;
