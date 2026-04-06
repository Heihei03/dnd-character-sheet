import React from "react";

interface LoadSummaryProps {
    totalWeight: number;
}

const LoadSummary: React.FC<LoadSummaryProps> = ({ totalWeight }) => {
    return (
        <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Weight</span>
            <div className="flex items-baseline gap-1">
                <span className="text-primary text-xl font-black leading-none">{totalWeight.toFixed(1)}</span>
                <span className="text-[10px] font-bold uppercase">lbs</span>
            </div>
        </div>
    );
};

export default LoadSummary;
