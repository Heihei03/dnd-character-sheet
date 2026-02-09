import React from "react";
import { CardContent } from "../ui/card";

interface LoadSummaryProps {
    totalWeight: number;
}

const LoadSummary: React.FC<LoadSummaryProps> = ({ totalWeight }) => {
    return (
        <CardContent className="p-4 space-y-4">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-2">
                Load Summary
            </h3>
            <div className="flex justify-between items-baseline">
                <span className="text-gray-400 text-xs">Total Weight</span>
                <span className="text-3xl font-black text-blue-400">
                    {totalWeight.toFixed(1)} <span className="text-xs font-normal">lbs</span>
                </span>
            </div>
        </CardContent>
    );
};

export default LoadSummary;
