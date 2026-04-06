"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "./card";
import Button from "./button";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    confirmVariant?: "danger" | "blue";
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed? This action cannot be undone.",
    confirmText = "Confirm",
    confirmVariant = "danger",
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <Card className="w-full max-w-md shadow-2xl border-none overflow-hidden animate-in zoom-in-95 duration-200">
                <CardContent className="p-0">
                    <div className="flex justify-between items-center p-4 border-b border-border">
                        <div className="flex items-center gap-2">
                            {confirmVariant === "danger" && <AlertTriangle className="w-5 h-5 text-red-500" />}
                            <h3 className="font-bold text-gray-900 dark:text-gray-100">{title}</h3>
                        </div>
                        <button
                            onClick={onClose}
                        className="p-1 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                            {message}
                        </p>
                    </div>
                    <div className="flex justify-end gap-3 p-4 bg-secondary/30 border-t border-border">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="border border-gray-200 dark:border-gray-700 font-semibold"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={confirmVariant === "danger" ? "danger" : "primary"}
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="font-semibold shadow-sm transition-all active:scale-95"
                        >
                            {confirmText}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default ConfirmationModal;
