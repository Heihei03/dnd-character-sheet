"use client";

import { useState } from "react";
import { ArmorClass, AbilityScores } from "../types/character";
import { calculateAC } from "../utils/acUtils";
import { ChevronUp, ChevronDown } from "lucide-react";
import Select from "./ui/Select";
import NumericInput from "./ui/NumericInput";

interface ArmorClassSectionProps {
    armorClass: ArmorClass;
    setArmorClass: (ac: ArmorClass) => void;
    abilityScores: AbilityScores;
}

const ArmorClassSection: React.FC<ArmorClassSectionProps> = ({
    armorClass,
    setArmorClass,
    abilityScores,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const currentAC = calculateAC(armorClass, abilityScores);

    const handleChange = (field: keyof ArmorClass, value: any) => {
        setArmorClass({
            ...armorClass,
            [field]: value,
        });
    };

    const abilityOptions: (keyof AbilityScores)[] = [
        "strength",
        "dexterity",
        "constitution",
        "intelligence",
        "wisdom",
        "charisma",
    ];

    return (
        <div className="border border-gray-200 dark:border-gray-800 p-3 rounded bg-white dark:bg-gray-950 shadow-sm transition-colors">
            <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span className="font-bold text-lg">Armor Class</span>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-primary bg-primary/5 px-3 py-1 rounded-lg border-2 border-primary/20 transition-all">
                        {currentAC}
                    </span>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
            </div>

            {isExpanded && (
                <div className="mt-4 space-y-4 border-t border-border pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Base AC</label>
                             <NumericInput
                                value={armorClass.baseAC}
                                onChange={(val) => handleChange("baseAC", val)}
                                variant="horizontal"
                                className="w-full"
                                inputClassName="text-center font-bold text-sm h-9"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Manual Override</label>
                             <NumericInput
                                placeholder="Auto"
                                value={armorClass.manualOverride ?? ""}
                                onChange={(val) => handleChange("manualOverride", val === 0 ? undefined : val)}
                                variant="horizontal"
                                className="w-full bg-secondary/30"
                                inputClassName="text-center font-bold text-sm h-9"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 bg-secondary/20 p-4 rounded-xl border border-border/50">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold uppercase tracking-tight text-foreground">Add DEX Bonus</label>
                            <input
                                type="checkbox"
                                checked={armorClass.hasDexBonus}
                                onChange={(e) => handleChange("hasDexBonus", e.target.checked)}
                                className="w-5 h-5 accent-primary cursor-pointer rounded"
                            />
                        </div>

                        {armorClass.hasDexBonus && (
                            <div className="flex items-center justify-between pl-4 border-l-2 border-primary/30">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">DEX Cap</label>
                                 <NumericInput
                                    placeholder="None"
                                    value={armorClass.dexCap ?? ""}
                                    onChange={(val) => handleChange("dexCap", val === 0 ? undefined : val)}
                                    variant="horizontal"
                                    className="w-20"
                                    inputClassName="text-center text-xs font-bold h-7"
                                />
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Secondary Ability Bonus</label>
                            <Select
                                value={(armorClass.secondaryAbility as string) || ""}
                                onValueChange={(val) => handleChange("secondaryAbility", (val === "" ? undefined : val) as any)}
                                options={[
                                    { label: "None", value: "" },
                                    ...abilityOptions.map((ability) => ({
                                        label: (ability as string).charAt(0).toUpperCase() + (ability as string).slice(1),
                                        value: (ability as string)
                                    }))
                                ]}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Shield</label>
                             <NumericInput
                                value={armorClass.shieldBonus}
                                onChange={(val) => handleChange("shieldBonus", val)}
                                variant="horizontal"
                                className="w-full"
                                inputClassName="text-center font-bold text-sm h-9"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Misc Bonus</label>
                             <NumericInput
                                value={armorClass.miscBonus}
                                onChange={(val) => handleChange("miscBonus", val)}
                                variant="horizontal"
                                className="w-full"
                                inputClassName="text-center font-bold text-sm h-9"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArmorClassSection;
