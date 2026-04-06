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
            ? "bg-primary/10 border-primary/20 text-primary border"
            : "bg-secondary/30 border-border text-muted-foreground border";
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
