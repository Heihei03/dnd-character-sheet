import React from "react";

interface LoadSummaryProps {
    totalWeight: number;
}

const LoadSummary: React.FC<LoadSummaryProps> = ({ totalWeight }) => {
    return (
        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Total Weight:</span>
            <span className="text-blue-600 dark:text-blue-400 text-lg font-black leading-none">{totalWeight.toFixed(1)}</span>
            <span className="text-xs font-medium">lbs</span>
        </div>
    );
};

export default LoadSummary;
