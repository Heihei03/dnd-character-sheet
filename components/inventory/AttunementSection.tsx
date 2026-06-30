import React from "react";
import { InventoryItem } from "../../types/character";
import ExpandableSection from "../ui/ExpandableSection";

interface AttunementSectionProps {
    attunedItems: InventoryItem[];
    attunableItems: InventoryItem[];
    updateItem: (id: string, field: keyof InventoryItem | Partial<InventoryItem>, value?: any) => void;
}

const AttunementSection: React.FC<AttunementSectionProps> = ({
    attunedItems,
    attunableItems,
    updateItem
}) => {
    return (
        <div className="space-y-4">
            <h3 className="font-black text-primary border-b border-border pb-2 uppercase tracking-widest text-[10px]">
                Attunement ({attunedItems.length}/3)
            </h3>
            <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map(i => (
                    <div
                        key={i}
                        className={`p-2 rounded-lg border text-xs text-center h-10 flex items-center justify-center transition-all ${attunedItems[i]
                            ? "bg-primary/10 border-primary/30 text-primary font-bold shadow-sm"
                            : "bg-secondary/30 border-border border-dashed text-muted-foreground/40"
                            }`}
                    >
                        {attunedItems[i]?.name || "Empty slot"}
                    </div>
                ))}
            </div>
            <ExpandableSection title="Manage Attunement">
                <div className="space-y-1 py-1">
                    {attunableItems.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-2 rounded-md hover:bg-secondary/20 transition-colors border-b border-border/50 last:border-0">
                            <span className="font-medium text-xs">{item.name}</span>
                            <button
                                onClick={() => updateItem(item.id, "attuned", !item.attuned)}
                                className={`px-3 py-1 rounded-md text-[10px] font-black tracking-wider uppercase transition-all ${item.attuned
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                                    }`}
                            >
                                {item.attuned ? "Attuned" : "Not Attuned"}
                            </button>
                        </div>
                    ))}
                    {attunableItems.length === 0 && (
                        <div className="text-muted-foreground/60 italic text-[11px] text-center p-4 bg-secondary/20 rounded-lg border border-dashed border-border/50">
                            No attunable items in inventory
                        </div>
                    )}
                </div>
            </ExpandableSection>
        </div>
    );
};

export default AttunementSection;
