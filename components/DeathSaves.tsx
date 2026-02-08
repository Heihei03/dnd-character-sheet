import React from "react";
import { DeathSaves as DeathSavesType } from "../types/character";

interface DeathSavesProps {
    deathSaves: DeathSavesType;
    onUpdate: (deathSaves: DeathSavesType) => void;
}

const DeathSaves: React.FC<DeathSavesProps> = ({ deathSaves, onUpdate }) => {
    const toggleSuccess = (index: number) => {
        const newSuccesses = deathSaves.successes === index + 1 ? index : index + 1;
        onUpdate({ ...deathSaves, successes: newSuccesses });
    };

    const toggleFailure = (index: number) => {
        const newFailures = deathSaves.failures === index + 1 ? index : index + 1;
        onUpdate({ ...deathSaves, failures: newFailures });
    };

    const Circle = ({ filled, colorClass, onClick }: { filled: boolean; colorClass: string; onClick: () => void }) => (
        <button
            onClick={onClick}
            className={`w-6 h-6 rounded-full border-2 ${filled ? colorClass : "border-gray-300"
                } flex items-center justify-center transition-all hover:scale-110 active:scale-95`}
        >
            {filled && <div className={`w-3 h-3 rounded-full ${colorClass.replace("border-", "bg-")}`} />}
        </button>
    );

    return (
        <div className="flex flex-col gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-center uppercase tracking-wider text-gray-700 border-b pb-2">Death Saves</h3>
            <div className="flex flex-col gap-3 mt-1">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase text-green-700">Successes</label>
                    <div className="flex gap-2">
                        {[0, 1, 2].map((i) => (
                            <Circle
                                key={`success-${i}`}
                                filled={deathSaves.successes > i}
                                colorClass="border-green-500"
                                onClick={() => toggleSuccess(i)}
                            />
                        ))}
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase text-red-700">Failures</label>
                    <div className="flex gap-2">
                        {[0, 1, 2].map((i) => (
                            <Circle
                                key={`failure-${i}`}
                                filled={deathSaves.failures > i}
                                colorClass="border-red-500"
                                onClick={() => toggleFailure(i)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeathSaves;
