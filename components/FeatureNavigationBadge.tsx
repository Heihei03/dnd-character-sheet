import React from "react";

interface FeatureNavigationBadgeProps {
    featureId?: string;
    onNavigateToFeature?: (featureId: string) => void;
    variant?: "default" | "compact" | "badge";
}

const FeatureNavigationBadge: React.FC<FeatureNavigationBadgeProps> = ({
    featureId,
    onNavigateToFeature,
    variant = "default",
}) => {
    if (!featureId || !onNavigateToFeature) return null;

    if (variant === "compact") {
        return (
            <span
                className="text-xs font-bold uppercase px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800 tracking-wider cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors shrink-0"
                title="Granted by Feature - Click to view"
                onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToFeature(featureId);
                }}
            >
                Feature
            </span>
        );
    }

    if (variant === "badge") {
        return (
            <span
                className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 font-bold uppercase tracking-tight cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                title="Granted by Feature - Click to view"
                onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToFeature(featureId);
                }}
            >
                From Feature
            </span>
        );
    }

    // Default variant
    return (
        <span
            className="text-[11px] font-bold uppercase px-1 bg-current/10 rounded tracking-tighter"
        >
            Feature
        </span>
    );
};

export default FeatureNavigationBadge;
