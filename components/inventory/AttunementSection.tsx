import React from "react";
import { InventoryItem } from "../../types/character";
import ExpandableSection from "../ui/ExpandableSection";

interface AttunementSectionProps {
    attunedItems: InventoryItem[];
    attunableItems: InventoryItem[];
    updateItem: (id: string, field: keyof InventoryItem, value: any) => void;
}

const AttunementSection: React.FC<AttunementSectionProps> = ({
    attunedItems,
    attunableItems,
    updateItem
}) => {
    return (
        <div className="space-y-4">
            <h3 className="font-bold text-purple-600 border-b pb-2 uppercase tracking-wider text-xs">
                Attunement ({attunedItems.length}/3)
            </h3>
            <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map(i => (
                    <div
                        key={i}
                        className={`p-2 rounded border text-[10px] text-center h-10 flex items-center justify-center ${attunedItems[i]
                            ? "bg-purple-50 border-purple-200 font-bold"
                            : "bg-gray-50 border-gray-200 text-gray-400 border-dashed"
                            }`}
                    >
                        {attunedItems[i]?.name || "Empty"}
                    </div>
                ))}
            </div>
            <ExpandableSection title="Manage Attunement">
                <div className="space-y-1">
                    {attunableItems.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-1 border-b text-xs">
                            <span className="font-medium">{item.name}</span>
                            <button
                                onClick={() => updateItem(item.id, "attuned", !item.attuned)}
                                className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${item.attuned
                                    ? "bg-purple-600 text-white"
                                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                    }`}
                            >
                                {item.attuned ? "ATTUNED" : "NOT ATTUNED"}
                            </button>
                        </div>
                    ))}
                    {attunableItems.length === 0 && (
                        <div className="text-gray-400 italic text-[10px] text-center p-2">
                            No attunable items in inventory
                        </div>
                    )}
                </div>
            </ExpandableSection>
        </div>
    );
};

export default AttunementSection;
