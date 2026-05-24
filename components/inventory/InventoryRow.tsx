import React from "react";
import { InventoryItem, Resource } from "../../types/character";
import ItemDetailView from "./ItemDetailView";
import { ChevronDown, ChevronRight, Trash2, CornerDownRight, GripVertical, Users } from "lucide-react";
import NumericInput from "../ui/NumericInput";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "../../lib/utils";

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
    summonStatblocks?: any[];
    onSummonFromStatblock?: (statblockId: string) => void;
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
    isReorderMode = false,
    summonStatblocks = [],
    onSummonFromStatblock
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
                className={cn(
                    "border-b border-border hover:bg-secondary/50 transition-colors md:table-row flex flex-wrap gap-y-2 p-3 pb-4 relative md:p-0",
                    isNested ? "bg-secondary/20 pl-6 md:pl-0" : "",
                    isDragging ? "bg-primary/10 shadow-inner" : ""
                )}
            >
                {isReorderMode && (
                    <td className="p-0 md:p-2 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-primary transition-colors block md:table-cell self-center" {...attributes} {...listeners}>
                        <div className="flex items-center justify-center h-8 w-8">
                            <GripVertical className="w-4 h-4" />
                        </div>
                    </td>
                )}
                <td className="p-0 md:p-2 block md:table-cell flex-1 min-w-[45px] max-w-[60px] md:min-w-0 md:max-w-none">
                    <span className="block md:hidden text-[9px] font-black uppercase text-muted-foreground mb-1 ml-1">Qty</span>
                     <NumericInput
                        value={item.quantity}
                        onChange={(val) => updateItem(item.id, "quantity", val)}
                        variant="horizontal"
                        className="w-full md:w-20 h-8"
                        inputClassName="text-xs text-center p-0"
                        showArrows="hover"
                        min={0}
                    />
                </td>
                <td className="p-0 md:p-2 block md:table-cell flex-1 min-w-[200px] md:w-auto pr-24 md:pr-0">
                    <div className="flex items-center gap-1">
                        {isNested && <CornerDownRight className="w-3.5 h-3.5 text-muted-foreground/30 ml-2" />}
                        <div className="flex-1">
                            <input
                                type="text"
                                value={item.name}
                                onChange={(e) => updateItem(item.id, "name", e.target.value)}
                                className="w-full p-1 border border-transparent hover:border-border rounded text-base md:text-sm font-bold md:font-medium focus:bg-background focus:ring-1 focus:ring-primary outline-none text-foreground"
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
                                {item.itemType === "ammunition" && item.ammunitionDetails && (
                                    <span className="text-primary/70">{item.ammunitionDetails.category}</span>
                                )}
                                {item.isWondrous && (
                                    <span className="bg-primary/10 text-primary px-1.5 rounded border border-primary/20 font-bold uppercase">Wondrous</span>
                                )}
                            </div>
                        </div>
                    </div>
                </td>
                <td className="p-0 md:p-2 block md:table-cell flex-1 min-w-[60px] max-w-[75px] md:min-w-0 md:max-w-none">
                    <span className="block md:hidden text-[9px] font-black uppercase text-muted-foreground mb-1 ml-1">Cost (gp)</span>
                     <NumericInput
                        value={item.costGP ?? 0}
                        onChange={(val) => updateItem(item.id, "costGP", val)}
                        variant="horizontal"
                        className="w-full md:w-24 h-8"
                        inputClassName="text-xs text-center p-0"
                        showArrows="hover"
                        min={0}
                    />
                </td>
                <td className="p-0 md:p-2 block md:table-cell flex-1 min-w-[60px] max-w-[75px] md:min-w-0 md:max-w-none">
                    <span className="block md:hidden text-[9px] font-black uppercase text-muted-foreground mb-1 ml-1">Weight (lbs)</span>
                     <NumericInput
                        value={item.weight}
                        onChange={(val) => updateItem(item.id, "weight", val)}
                        variant="horizontal"
                        className="w-full md:w-24 h-8"
                        inputClassName="text-xs text-center p-0"
                        showArrows="hover"
                        min={0}
                    />
                </td>
                {section === "equipment" && (
                    <td className="p-0 md:p-2 block md:table-cell flex-1 min-w-[50px] max-w-[65px] md:min-w-0 md:max-w-none text-center flex flex-col items-center">
                        <span className="block md:hidden text-[9px] font-black uppercase text-muted-foreground mb-1">Equipped</span>
                        <div className="flex items-center justify-center h-8 w-full">
                            <input
                                type="checkbox"
                                checked={item.equipped ?? false}
                                onChange={(e) => updateItem(item.id, "equipped", e.target.checked)}
                                className="w-4 h-4 cursor-pointer accent-primary"
                            />
                        </div>
                    </td>
                )}
                <td className="p-0 md:p-2 block md:table-cell absolute top-3.5 right-11 w-8 h-8 md:static md:w-auto md:h-auto">
                    <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground/30 hover:text-red-500 transition-colors flex items-center justify-center h-8 w-8"
                        title="Delete Item"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </td>
                <td className="p-0 md:p-2 block md:table-cell absolute top-3.5 right-19 w-8 h-8 md:static md:w-auto md:h-auto">
                    {item.linkedSummonStatblockId && onSummonFromStatblock && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onSummonFromStatblock(item.linkedSummonStatblockId!);
                            }}
                            className="text-primary/40 hover:text-primary transition-colors flex items-center justify-center h-8 w-8"
                            title="Summon Creature"
                        >
                            <Users className="w-4 h-4" />
                        </button>
                    )}
                </td>
                <td className="p-0 md:p-2 block md:table-cell absolute top-3.5 right-3 w-8 h-8 md:static md:w-auto md:h-auto">
                    <button
                        onClick={onToggleExpand}
                        className="text-muted-foreground/40 hover:text-primary transition-colors w-8 h-8 flex items-center justify-center"
                        title="Expand details"
                    >
                        <ChevronDown className={`w-4 h-4 transform transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                </td>
            </tr>
            {isExpanded && (
                <tr className="bg-secondary/10 block md:table-row w-full">
                    <td colSpan={(section === "equipment" ? 7 : 6) + (isReorderMode ? 1 : 0)} className="p-4 pt-2 block md:table-cell w-full">
                        <ItemDetailView
                            item={item}
                            containers={containers}
                            updateItem={updateItem}
                            resources={resources}
                            onUpdateResources={onUpdateResources}
                            summonStatblocks={summonStatblocks}
                        />
                    </td>
                </tr>
            )}
        </React.Fragment>
    );
};

export default InventoryRow;
