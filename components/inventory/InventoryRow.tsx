import React from "react";
import { InventoryItem, Resource } from "../../types/character";
import ItemDetailView from "./ItemDetailView";
import { ChevronDown, ChevronRight, Trash2, CornerDownRight, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface InventoryRowProps {
    item: InventoryItem;
    allInventory: InventoryItem[];
    section: "equipment" | "inventory";
    updateItem: (id: string, field: keyof InventoryItem, value: any) => void;
    removeItem: (id: string) => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
    resources?: Resource[];
    onUpdateResources?: (resources: Resource[]) => void;
    isReorderMode?: boolean;
}

const InventoryRow: React.FC<InventoryRowProps> = ({
    item,
    allInventory,
    section,
    updateItem,
    removeItem,
    isExpanded,
    onToggleExpand,
    resources = [],
    onUpdateResources,
    isReorderMode = false
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : "auto",
        position: (isDragging ? "relative" : "static") as any,
    };

    const isParentValidContainer = item.parentId ? allInventory.some(i => i.id === item.parentId && Boolean(i.isContainer)) : false;
    const isNested = !!item.parentId && isParentValidContainer;
    const containers = allInventory.filter(i => i.isContainer && i.itemType === "container");

    return (
        <React.Fragment>
            <tr 
                ref={setNodeRef}
                style={style}
                className={`border-b border-border hover:bg-secondary/50 transition-colors ${isNested ? "bg-secondary/20" : ""} ${isDragging ? "bg-primary/10 shadow-inner" : ""}`}
            >
                {isReorderMode && (
                    <td className="p-2 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-primary transition-colors" {...attributes} {...listeners}>
                        <div className="flex items-center justify-center w-full">
                            <GripVertical className="w-4 h-4" />
                        </div>
                    </td>
                )}
                <td className="p-2">
                    <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                        className="w-10 p-1 border border-border bg-background rounded text-xs text-center focus:ring-1 focus:ring-primary outline-none"
                        min="0"
                    />
                </td>
                <td className="p-2">
                    <div className="flex items-center gap-1">
                        {isNested && <CornerDownRight className="w-3.5 h-3.5 text-muted-foreground/30 ml-2" />}
                        <div className="flex-1">
                            <input
                                type="text"
                                value={item.name}
                                onChange={(e) => updateItem(item.id, "name", e.target.value)}
                                className="w-full p-1 border border-transparent hover:border-border rounded text-sm font-medium focus:bg-background focus:ring-1 focus:ring-primary outline-none"
                            />
                            {/* Item Metadata Summary */}
                            <div className="px-1 text-[10px] text-muted-foreground font-medium uppercase tracking-tight flex flex-wrap gap-x-2 gap-y-0.5">
                                {item.itemType === "weapon" && item.weaponDetails && (
                                    <React.Fragment>
                                        <span className="text-primary/70">{item.weaponDetails.damageDice} {item.weaponDetails.damageType}</span>
                                        {item.weaponDetails.properties.length > 0 && (
                                            <span className="italic">{item.weaponDetails.properties.join(", ")}</span>
                                        )}
                                        {item.weaponDetails.mastery && (
                                            <span className="bg-primary/10 text-primary px-1 rounded border border-primary/20 font-bold uppercase">{item.weaponDetails.mastery}</span>
                                        )}
                                    </React.Fragment>
                                )}
                                {(item.itemType === "armor" || item.itemType === "shield") && item.armorDetails && (
                                    <React.Fragment>
                                        <span className="text-primary/70">{item.itemType === "armor" ? item.armorDetails.category : "Shield"} • AC {item.armorDetails.ac}</span>
                                        {item.armorDetails.strengthRequirement && (
                                            <span className="text-primary/70">Str {item.armorDetails.strengthRequirement}</span>
                                        )}
                                        {item.armorDetails.stealthDisadvantage && (
                                            <span className="text-muted-foreground italic">Stealth Disadv.</span>
                                        )}
                                    </React.Fragment>
                                )}
                                {item.isContainer && item.containerDetails && (
                                    <span className="text-primary/80 font-bold">
                                        {(item.containerDetails.capacityWeight ?? 0) > 0 ? `Cap: ${item.containerDetails.capacityWeight} lbs` : "Unlimited"}
                                        {item.containerDetails.contentsWeightMultiplier !== 1 && ` • x${item.containerDetails.contentsWeightMultiplier} Wt`}
                                    </span>
                                )}
                                {item.itemType === "tool" && item.toolDetails && (
                                    <React.Fragment>
                                        <span className="text-primary/70">{item.toolDetails.category}</span>
                                        <span className="text-muted-foreground italic">• {item.toolDetails.ability}</span>
                                    </React.Fragment>
                                )}
                                {item.isWondrous && (
                                    <span className="bg-primary/10 text-primary px-1.5 rounded border border-primary/20 font-bold uppercase">Wondrous</span>
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
                        className="w-14 p-1 border border-border bg-background rounded text-xs text-center focus:ring-1 focus:ring-primary outline-none"
                        min="0"
                    />
                </td>
                <td className="p-2">
                    <input
                        type="number"
                        value={item.weight}
                        onChange={(e) => updateItem(item.id, "weight", Number(e.target.value))}
                        className="w-14 p-1 border border-border bg-background rounded text-xs text-center focus:ring-1 focus:ring-primary outline-none"
                        min="0"
                    />
                </td>
                {section === "equipment" && (
                    <td className="p-2 text-center">
                        <input
                            type="checkbox"
                            checked={item.equipped ?? false}
                            onChange={(e) => updateItem(item.id, "equipped", e.target.checked)}
                            className="w-4 h-4 cursor-pointer accent-primary"
                        />
                    </td>
                )}
                <td className="p-2">
                    <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground/30 hover:text-red-500 transition-colors flex items-center justify-center w-full"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </td>
                <td className="p-2">
                    <button
                        onClick={onToggleExpand}
                        className="text-muted-foreground/40 hover:text-primary transition-colors w-full flex items-center justify-center"
                    >
                        <ChevronDown className={`w-4 h-4 transform transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                </td>
            </tr>
            {isExpanded && (
                <tr className="bg-secondary/10">
                    <td colSpan={(section === "equipment" ? 7 : 6) + (isReorderMode ? 1 : 0)} className="p-4 pt-2">
                        <ItemDetailView
                            item={item}
                            containers={containers}
                            updateItem={updateItem}
                            resources={resources}
                            onUpdateResources={onUpdateResources}
                        />
                    </td>
                </tr>
            )}
        </React.Fragment>
    );
};

export default InventoryRow;
