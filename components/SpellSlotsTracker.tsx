"use client";

import React, { useState } from "react";
import { Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

// UI Components
import { Card, CardContent } from "./ui/card";
import NumericInput from "./ui/NumericInput";

// Components
import ResourcePipTracker from "./ResourcePipTracker";

// Types
import { CharacterClass, Resource, SpellSlot } from "../types/character";

// Utils
import { calculateSpellSlots } from "../utils/spell-utils";

interface SpellSlotsTrackerProps {
    classes: CharacterClass[];
    spellSlots: SpellSlot[];
    onUpdateSpellSlots: (slots: SpellSlot[]) => void;
}

const SpellSlotsTracker: React.FC<SpellSlotsTrackerProps> = ({
    classes,
    spellSlots,
    onUpdateSpellSlots,
}) => {
    const [autoCalculateSlots, setAutoCalculateSlots] = useState(true);

    const calculatedSlots = calculateSpellSlots(classes);

    // Initialize Slots (1-9) if missing
    const slots = Array.from({ length: 9 }, (_, i) => i + 1).map(level => {
        if (autoCalculateSlots) {
            const calculated = calculatedSlots[level - 1];
            return spellSlots.find(s => s.level === level) || { level, max: calculated ? calculated.max : 0, expended: 0 };
        }
        return spellSlots.find(s => s.level === level) || { level, max: 0, expended: 0 };
    });

    const handleUpdateSlot = (level: number, field: keyof SpellSlot, value: number) => {
        const newSlots = [...slots];
        const index = newSlots.findIndex(s => s.level === level);
        if (index !== -1) {
            newSlots[index] = { ...newSlots[index], [field]: value };
        }
        // Filter out only those with max > 0 or expended > 0
        onUpdateSpellSlots(newSlots.filter(s => s.max > 0 || s.expended > 0));
    };

    return (
        <Card className="overflow-hidden border-border shadow-sm">
            <div className="p-4 bg-secondary/30 border-b border-border flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <div className="w-2 h-5 bg-primary rounded-full" />
                    Spell Slots
                </h3>
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={autoCalculateSlots}
                        onChange={(e) => {
                            setAutoCalculateSlots(e.target.checked);
                            if (e.target.checked) {
                                // Update max slots based on calculation
                                const updatedSlots = slots.map(slot => {
                                    const calc = calculatedSlots[slot.level - 1];
                                    return { ...slot, max: calc ? calc.max : 0 };
                                });
                                onUpdateSpellSlots(updatedSlots.filter(s => s.max > 0 || s.expended > 0));
                            }
                        }}
                        className="w-4 h-4 cursor-pointer accent-primary"
                        id="auto-calc-slots"
                    />
                    <label htmlFor="auto-calc-slots" className="text-sm font-medium cursor-pointer flex items-center text-muted-foreground hover:text-foreground transition-colors">
                        <Calculator className="w-4 h-4 mr-1" />
                        Auto-calculate
                    </label>
                </div>
            </div>
            <CardContent className="p-4 bg-background/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {slots.filter(s => s.max > 0 || !autoCalculateSlots).map((slot) => {
                        // Map SpellSlot to Resource for the tracker
                        // Tracking "Available" slots (Max - Expended)
                        const availableValue = Math.max(0, slot.max - slot.expended);
                        const resourceProxy: Resource = {
                            id: `spell-slot-lvl-${slot.level}`,
                            name: `Level ${slot.level}`,
                            max: slot.max,
                            value: availableValue,
                            regain: "Long Rest"
                        };

                        return (
                            <div key={slot.level} className="space-y-2">
                                <ResourcePipTracker
                                    resource={resourceProxy}
                                    compact={true}
                                    onUpdate={(newAvailable) => {
                                        // newAvailable is current count (Available)
                                        // expended = max - available
                                        handleUpdateSlot(slot.level, "expended", slot.max - newAvailable);
                                    }}
                                />
                                <div className="flex items-center justify-end gap-2 px-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Total Max:</label>
                                     <NumericInput
                                        min={0}
                                        value={autoCalculateSlots ? (calculatedSlots[slot.level - 1]?.max || 0) : (slot.max || "")}
                                        onChange={(val) => {
                                            if (!autoCalculateSlots) {
                                                handleUpdateSlot(slot.level, "max", val);
                                            }
                                        }}
                                        disabled={autoCalculateSlots}
                                        variant="horizontal"
                                        className={cn(
                                            "w-14 h-6",
                                            autoCalculateSlots && "opacity-50 cursor-not-allowed pointer-events-none"
                                        )}
                                        inputClassName="text-center text-[11px] p-0 h-5 font-bold"
                                    />
                                </div>
                            </div>
                        );
                    })}
                    {slots.every(s => s.max === 0) && autoCalculateSlots && (
                        <div className="col-span-full py-8 text-center text-muted-foreground italic text-sm">
                            No spell slots available for your current classes.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default SpellSlotsTracker;
