import React from "react";
import FeatureNavigationBadge from "./FeatureNavigationBadge";

interface FeatureItemPillProps {
    isFromFeature?: boolean;
    featureId?: string;
    onNavigateToFeature?: (featureId: string) => void;
    className?: string;
    children: React.ReactNode;
    colorClass?: string;
}

const FeatureItemPill: React.FC<FeatureItemPillProps> = ({
    isFromFeature,
    featureId,
    onNavigateToFeature,
    className = "",
    children,
    colorClass,
}) => {
    // If it's a feature and we have navigation handled, make it clickable
    const isClickable = isFromFeature && featureId && onNavigateToFeature;

    const baseClasses = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold transition-all";

    // Support either providing a specific colorClass (like DefensesSection) or fallback to the blue theme (like ProficienciesSection)
    let appliedColorClass = colorClass;

    if (!appliedColorClass) {
        appliedColorClass = isFromFeature
            ? "bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 border"
            : "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 border";
    }

    const featureClasses = isFromFeature
        ? "opacity-90 border-dashed cursor-pointer hover:ring-2 hover:ring-current hover:ring-opacity-30 hover:opacity-100 group"
        : "";

    return (
        <span
            onClick={(e) => {
                if (isClickable) {
                    e.stopPropagation();
                    onNavigateToFeature(featureId);
                }
            }}
            className={`${baseClasses} ${appliedColorClass} ${featureClasses} ${className}`}
            title={isFromFeature ? "Granted by Feature - Click to view" : ""}
        >
            {children}
            {isFromFeature && (
                <FeatureNavigationBadge featureId={featureId} onNavigateToFeature={onNavigateToFeature} variant="default" />
            )}
        </span>
    );
};

export default FeatureItemPill;
