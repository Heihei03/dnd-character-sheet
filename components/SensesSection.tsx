"use client";

import React, { useState } from "react";
import { Sense } from "../types/character";
import { SENSES_LIST } from "../utils/constants";
import { Trash2, Plus } from "lucide-react";
import ConfirmationModal from "./ui/ConfirmationModal";
import Button from "./ui/button";
import { Card, CardContent } from "./ui/card";
import FeatureNavigationBadge from "./features/FeatureNavigationBadge";

interface SensesSectionProps {
    senses: Sense[];
    onUpdateSenses: (senses: Sense[]) => void;
    onNavigateToFeature?: (featureId: string) => void;
}

const SensesSection: React.FC<SensesSectionProps> = ({
    senses = [],
    onUpdateSenses,
    onNavigateToFeature,
}) => {
    const [newSense, setNewSense] = useState({ name: "", value: "" });
    const [senseToDelete, setSenseToDelete] = useState<Sense | null>(null);

    const addSense = () => {
        if (newSense.name && newSense.value) {
            const manualSenses = senses.filter(s => !s.fromFeature);
            onUpdateSenses([...manualSenses, newSense]);
            setNewSense({ name: "", value: "" });
        }
    };

    const removeSense = (sense: Sense) => {
        if (sense.fromFeature) return;
        const manualSenses = senses.filter(s => !s.fromFeature);
        onUpdateSenses(manualSenses.filter(s => s.name !== sense.name));
    };

    return (
        <Card className="w-full">
            <CardContent className="p-6">
                <div className="flex justify-between items-center border-b border-border pb-3 mb-4">
                    <h2 className="text-2xl font-bold">Senses</h2>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-2">
                        {senses.length === 0 && <span className="text-sm text-muted-foreground/60 italic p-2">No special senses.</span>}
                        {senses.map((sense, idx) => (
                            <div key={idx} className={`flex justify-between items-center bg-secondary/30 px-3 py-2.5 rounded-lg border border-border text-sm transition-all ${sense.fromFeature ? 'border-primary/20 bg-primary/5' : 'hover:bg-secondary/50'}`}>
                                <div className="flex items-center gap-2 truncate mr-2">
                                    <span className="font-bold text-foreground truncate">{sense.name}</span>
                                    {sense.fromFeature && (
                                        <FeatureNavigationBadge 
                                            featureId={sense.fromFeatureId} 
                                            onNavigateToFeature={onNavigateToFeature} 
                                            variant="compact" 
                                        />
                                    )}
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="font-black text-primary font-mono">{sense.value}</span>
                                    {!sense.fromFeature && (
                                        <button
                                            onClick={() => setSenseToDelete(sense)}
                                            className="p-1 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2 items-center pt-2">
                        <div className="flex-[2] relative">
                            <input
                                type="text"
                                list="senses-list"
                                value={newSense.name}
                                onChange={(e) => setNewSense({ ...newSense, name: e.target.value })}
                                placeholder="Sense name..."
                                className="w-full text-sm p-2 bg-background border border-border rounded-lg outline-none focus:ring-1 focus:ring-primary transition-all shadow-inner"
                            />
                            <datalist id="senses-list">
                                {SENSES_LIST.map(sense => <option key={sense} value={sense} />)}
                            </datalist>
                        </div>
                        <input
                            type="text"
                            value={newSense.value}
                            onChange={(e) => setNewSense({ ...newSense, value: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && addSense()}
                            placeholder="Range..."
                            className="flex-1 text-sm p-2 bg-background border border-border rounded-lg outline-none focus:ring-1 focus:ring-primary transition-all shadow-inner"
                        />
                        <Button
                            onClick={addSense}
                            className="px-4 py-2 bg-primary text-white hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/20"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>

            <ConfirmationModal
                isOpen={senseToDelete !== null}
                onClose={() => setSenseToDelete(null)}
                onConfirm={() => {
                    if (senseToDelete) {
                        removeSense(senseToDelete);
                        setSenseToDelete(null);
                    }
                }}
                title="Remove Sense"
                message={`Are you sure you want to remove "${senseToDelete?.name}"?`}
                confirmText="Remove"
            />
        </Card>
    );
};

export default SensesSection;
