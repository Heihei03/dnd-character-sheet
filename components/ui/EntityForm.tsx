import React from "react";
import Button from "./button";
import { Card, CardContent } from "./card";
import { X } from "lucide-react";

interface EntityFormProps {
    title: string;
    onSave: () => void;
    onCancel: () => void;
    saveLabel?: string;
    cancelLabel?: string;
    isEditing?: boolean;
    children: React.ReactNode;
    className?: string;
}

const EntityForm: React.FC<EntityFormProps> = ({
    title,
    onSave,
    onCancel,
    saveLabel,
    cancelLabel = "Cancel",
    isEditing = false,
    children,
    className = ""
}) => {
    const defaultSaveLabel = isEditing ? "Save Changes" : "Add";
    const finalSaveLabel = saveLabel || defaultSaveLabel;

    return (
        <Card className={`border-blue-200 bg-blue-50/30 dark:bg-blue-900/10 dark:border-blue-800 ${className}`}>
            <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-blue-100 dark:border-blue-800 pb-2">
                    <h3 className="font-bold text-lg">{title}</h3>
                    <button 
                        onClick={onCancel}
                        className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full transition-colors text-gray-500"
                        title="Cancel"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="space-y-4">
                    {children}
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-blue-100 dark:border-blue-800">
                    <Button variant="ghost" onClick={onCancel}>
                        {cancelLabel}
                    </Button>
                    <Button onClick={onSave}>
                        {finalSaveLabel}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default EntityForm;
