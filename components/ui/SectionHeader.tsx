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
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-3 md:gap-0 w-full">
            <h2 className="text-2xl font-bold">{title}</h2>
            <div className={`flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-4 ${hasChildren ? "w-full md:w-auto justify-between md:justify-start" : "w-auto md:justify-start"}`}>
                {children}
                {onAdd && !isAdding && (
                    <Button onClick={onAdd} className="flex items-center gap-1.5 md:gap-2 whitespace-nowrap text-xs md:text-sm px-2.5 py-1.5 md:px-4 md:py-2">
                        <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> {buttonLabel || "Add"}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default SectionHeader;
