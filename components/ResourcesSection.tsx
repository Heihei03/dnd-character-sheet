"use client";

import React from "react";
import { Resource } from "../types/character";
import { Card, CardContent } from "./ui/card";
import ResourcePipTracker from "./ResourcePipTracker";

interface ResourcesSectionProps {
    resources: Resource[];
    onUpdateResources: (resources: Resource[]) => void;
}

const ResourcesSection: React.FC<ResourcesSectionProps> = ({ resources = [], onUpdateResources }) => {
    const handleUpdateValue = (id: string, newValue: number) => {
        const newResources = resources.map(r => r.id === id ? { ...r, value: newValue } : r);
        onUpdateResources(newResources);
    };

    if (resources.length === 0) {
        return null;
    }

    return (
        <Card className="overflow-hidden border-border shadow-sm">
            <div className="p-4 bg-secondary/30 border-b border-border flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <div className="w-2 h-5 bg-primary rounded-full" />
                    Resources
                </h3>
            </div>
            <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resources.map((resource) => (
                        <ResourcePipTracker
                            key={resource.id}
                            resource={resource}
                            onUpdate={(val) => handleUpdateValue(resource.id, val)}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default ResourcesSection;
