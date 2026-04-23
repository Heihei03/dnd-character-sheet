import React from "react";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

interface LoadSummaryProps {
    totalWeight: number;
    strength: number;
    enabled: boolean;
    rule: 'standard' | 'variant';
}

const LoadSummary: React.FC<LoadSummaryProps> = ({ totalWeight, strength, enabled, rule }) => {
    if (!enabled) {
        return (
            <div className="flex items-center gap-3 px-4 py-2 bg-secondary/20 rounded-xl border border-border/50 group transition-all hover:bg-secondary/30">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-none mb-1">Total Weight</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-primary text-2xl font-black tabular-nums leading-none">{totalWeight.toFixed(1)}</span>
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">lbs</span>
                    </div>
                </div>
            </div>
        );
    }

    const capacity = strength * 15;
    const encumbered = strength * 5;
    const heavilyEncumbered = strength * 10;
    
    let status = "Unencumbered";
    let statusColor = "text-green-500";
    let progressColor = "bg-green-500";
    let percentage = (totalWeight / capacity) * 100;

    if (rule === 'variant') {
        if (totalWeight > capacity) {
            status = "Over Capacity";
            statusColor = "text-red-600";
            progressColor = "bg-red-600";
        } else if (totalWeight > heavilyEncumbered) {
            status = "Heavily Encumbered";
            statusColor = "text-orange-500";
            progressColor = "bg-orange-500";
        } else if (totalWeight > encumbered) {
            status = "Encumbered";
            statusColor = "text-yellow-500";
            progressColor = "bg-yellow-500";
        }
    } else {
        if (totalWeight > capacity) {
            status = "Over Capacity";
            statusColor = "text-red-600";
            progressColor = "bg-red-600";
        }
    }

    // Clamp percentage for display
    const displayPercentage = Math.min(percentage, 100);

    return (
        <div className="flex flex-col gap-2 min-w-[240px] p-3 bg-secondary/20 rounded-xl border border-border/50 shadow-sm transition-all hover:bg-secondary/30">
            <div className="flex justify-between items-end">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-none mb-1">Carrying Capacity</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-primary text-2xl font-black tabular-nums leading-none">{totalWeight.toFixed(1)}</span>
                        <span className="text-muted-foreground/40 font-bold text-sm mx-1">/</span>
                        <span className="text-muted-foreground text-lg font-black tabular-nums leading-none">{capacity}</span>
                        <span className="text-[10px] font-bold uppercase text-muted-foreground ml-1">lbs</span>
                    </div>
                </div>
                <div className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-background/50 border border-border/50", statusColor)}>
                    {status}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2.5 w-full bg-background/50 rounded-full overflow-hidden border border-border/30">
                {/* Threshold Markers for Variant Rule */}
                {rule === 'variant' && (
                    <>
                        <div 
                            className="absolute top-0 bottom-0 w-px bg-border/50 z-10" 
                            style={{ left: `${(encumbered / capacity) * 100}%` }}
                        />
                        <div 
                            className="absolute top-0 bottom-0 w-px bg-border/50 z-10" 
                            style={{ left: `${(heavilyEncumbered / capacity) * 100}%` }}
                        />
                    </>
                )}
                <div 
                    className={cn("h-full transition-all duration-500 ease-out shadow-sm", progressColor)}
                    style={{ width: `${displayPercentage}%` }}
                />
            </div>

            {/* Footer Info */}
            {rule === 'variant' && totalWeight > encumbered && (
                <div className="flex items-start gap-1.5 mt-0.5 animate-in fade-in slide-in-from-top-1">
                    <Info size={10} className={cn("mt-0.5 shrink-0", statusColor)} />
                    <p className="text-[9px] font-bold text-muted-foreground/80 leading-tight uppercase tracking-tight">
                        {totalWeight > heavilyEncumbered 
                            ? "Speed -20ft, Disadvantage on STR/DEX/CON checks, saves, and attacks" 
                            : "Speed reduced by 10ft"}
                    </p>
                </div>
            )}
        </div>
    );
};

export default LoadSummary;
