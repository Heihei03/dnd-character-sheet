import React from "react";

interface LoadSummaryProps {
    totalWeight: number;
}

const LoadSummary: React.FC<LoadSummaryProps> = ({ totalWeight }) => {
    return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-900 text-white text-[10px] font-bold tracking-tight shadow-sm border border-gray-700">
            <span className="text-gray-400 font-medium uppercase text-[8px] tracking-widest">Weight:</span>
            <span className="text-blue-400">{totalWeight.toFixed(1)}</span>
            <span className="text-gray-500 font-normal">lbs</span>
        </span>
    );
};

export default LoadSummary;
