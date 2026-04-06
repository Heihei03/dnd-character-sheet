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
        <Card className={`border-primary/20 bg-primary/5 dark:bg-primary/10 shadow-lg ${className}`}>
            <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-primary/10 pb-3 mb-2">
                    <h3 className="font-black text-xs uppercase tracking-widest text-primary">{title}</h3>
                    <button 
                        onClick={onCancel}
                        className="p-1.5 hover:bg-primary/20 rounded-full transition-all text-muted-foreground hover:text-primary active:scale-95"
                        title="Cancel"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="space-y-6">
                    {children}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-primary/10">
                    <Button variant="ghost" onClick={onCancel} className="text-xs font-black uppercase tracking-widest px-6 py-2 hover:bg-secondary/80">
                        {cancelLabel}
                    </Button>
                    <Button onClick={onSave} className="text-xs font-black uppercase tracking-widest px-8 py-2 bg-primary text-white hover:scale-105 shadow-xl shadow-primary/20">
                        {finalSaveLabel}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default EntityForm;
