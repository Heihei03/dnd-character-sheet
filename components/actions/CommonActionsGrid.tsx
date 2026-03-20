import React from "react";
import { Action } from "../../types/character";

interface CommonActionsGridProps {
    actions: Action[];
    expandedIds: Set<string>;
    toggleExpand: (id: string) => void;
}

const CommonActionsGrid: React.FC<CommonActionsGridProps> = ({
    actions,
    expandedIds,
    toggleExpand,
}) => {
    if (!actions || actions.length === 0) return null;

    return (
        <div className="space-y-2">
            <h3 className="text-[11px] font-bold uppercase text-gray-400 tracking-wider flex items-center gap-2">
                Common Actions
                <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {actions.map((action) => (
                    <div
                        key={action.id}
                        className={`group p-2 rounded-lg border transition-all cursor-pointer flex flex-col justify-between min-h-[44px]
                            ${
                                expandedIds.has(action.id)
                                    ? "bg-blue-50 border-blue-200 ring-1 ring-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:ring-0"
                                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700"
                            }`}
                        onClick={() => toggleExpand(action.id)}
                    >
                        <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[11px] truncate leading-none">
                                {action.name}
                            </span>
                            <span
                                className={`text-[11px] px-1 py-0.5 rounded uppercase font-black shrink-0
                                ${
                                    action.type === "Action"
                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                                        : action.type === "Reaction"
                                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                }
                            `}
                            >
                                {action.type === "Action"
                                    ? "Act"
                                    : action.type === "Reaction"
                                    ? "Re"
                                    : "•"}
                            </span>
                        </div>
                        {expandedIds.has(action.id) && (
                            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 leading-snug border-t border-blue-100 dark:border-blue-900/40 pt-2 animate-in fade-in slide-in-from-top-1">
                                {action.description}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommonActionsGrid;
