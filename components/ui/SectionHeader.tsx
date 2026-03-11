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
    return (
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{title}</h2>
            <div className="flex items-center gap-4">
                {children}
                {onAdd && !isAdding && (
                    <Button onClick={onAdd} className="flex items-center gap-2 whitespace-nowrap">
                        <Plus className="w-4 h-4" /> {buttonLabel || "Add"}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default SectionHeader;
