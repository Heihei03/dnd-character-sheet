"use client";

import { useEffect, useState } from "react";

interface ModalScrollLockProps {
    isOpen: boolean;
}

const ModalScrollLock: React.FC<ModalScrollLockProps> = ({ isOpen }) => {
    useEffect(() => {
        if (!isOpen) return;

        // Save original overflow
        const originalStyle = window.getComputedStyle(document.body).overflow;
        
        // Prevent scroll
        document.body.style.overflow = "hidden";

        // Re-enable scroll when component unmounts
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, [isOpen]);

    return null;
};

export default ModalScrollLock;
