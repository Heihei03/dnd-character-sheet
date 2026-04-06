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
                                    ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20 dark:bg-primary/20 dark:border-primary/50 dark:ring-0"
                                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-primary/30 dark:hover:border-primary/40"
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
                                        ? "bg-primary/20 text-primary"
                                        : action.type === "Reaction"
                                        ? "bg-secondary text-secondary-foreground"
                                        : "bg-muted text-muted-foreground"
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
                            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 leading-snug border-t border-primary/20 pt-2 animate-in fade-in slide-in-from-top-1">
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
