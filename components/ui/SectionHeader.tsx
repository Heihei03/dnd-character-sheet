import React from "react";
import Button from "./button";
import { Plus } from "lucide-react";

interface SectionHeaderProps {
    title: string;
    buttonLabel?: string;
    onAdd?: () => void;
    isAdding?: boolean;
    children?: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
    title, 
    buttonLabel, 
    onAdd, 
    isAdding, 
    children 
}) => {
    const hasChildren = !!children;
    return (
        <div className="flex flex-wrap justify-between items-center gap-3 w-full">
            <h2 className="text-2xl font-bold">{title}</h2>
            <div className={`flex flex-wrap items-center gap-2 sm:gap-4 ${hasChildren ? "w-full sm:w-auto justify-between sm:justify-end" : "w-auto justify-end"}`}>
                {children}
                {onAdd && !isAdding && (
                    <Button onClick={onAdd} className="flex items-center gap-1.5 whitespace-nowrap text-xs sm:text-sm px-2.5 py-1.5 sm:px-4 sm:py-2">
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {buttonLabel || "Add"}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default SectionHeader;
