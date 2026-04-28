"use client";

import React from "react";
import { InventoryItem } from "../types/character";
import { Card, CardContent } from "./ui/card";
import NumericInput from "./ui/NumericInput";

interface AmmunitionSectionProps {
    ammunitionItems: InventoryItem[];
    onUpdateInventory?: (inventory: InventoryItem[]) => void;
    allInventory: InventoryItem[];
}

const AmmunitionSection: React.FC<AmmunitionSectionProps> = ({ 
    ammunitionItems = [], 
    onUpdateInventory,
    allInventory = []
}) => {
    const handleUpdateQuantity = (id: string, newQuantity: number) => {
        if (!onUpdateInventory) return;
        const newInventory = allInventory.map(item => 
            item.id === id ? { ...item, quantity: Math.max(0, newQuantity) } : item
        );
        onUpdateInventory(newInventory);
    };

    if (ammunitionItems.length === 0) {
        return null;
    }

    return (
        <Card className="overflow-hidden border-border shadow-sm">
            <div className="p-4 bg-secondary/30 border-b border-border flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <div className="w-2 h-5 bg-primary rounded-full" />
                    Ammunition
                </h3>
            </div>
            <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ammunitionItems.map((item) => (
                        <div 
                            key={item.id} 
                            className="relative group p-3 bg-background border border-border rounded-xl shadow-sm hover:shadow-md transition-all w-full flex items-center justify-between gap-3"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-sm font-bold text-foreground truncate">
                                        {item.name}
                                    </h4>
                                    {item.ammunitionDetails?.category && (
                                        <span className="text-[11px] bg-primary/10 text-primary px-1 py-0.5 rounded font-bold uppercase tracking-tighter whitespace-nowrap">
                                            {item.ammunitionDetails.category}
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                    Quantity
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <NumericInput
                                    value={item.quantity}
                                    onChange={(val) => handleUpdateQuantity(item.id, val)}
                                    variant="horizontal"
                                    className="w-24 h-9"
                                    inputClassName="text-sm font-mono text-center p-0"
                                    showArrows="always"
                                    min={0}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default AmmunitionSection;
