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
                className="text-[11px] font-bold uppercase px-1 py-0.5 bg-primary/10 text-primary rounded border border-primary/20 tracking-tighter cursor-pointer hover:bg-primary/20 transition-colors shrink-0"
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
                className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 font-bold uppercase tracking-tight cursor-pointer hover:bg-primary/20 transition-colors"
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
            className="text-[11px] font-bold uppercase px-1 bg-primary/10 text-primary border border-primary/20 rounded tracking-tighter cursor-pointer hover:bg-primary/20 transition-colors"
            onClick={(e) => {
                e.stopPropagation();
                onNavigateToFeature(featureId);
            }}
        >
            Feature
        </span>
    );
};

export default FeatureNavigationBadge;
