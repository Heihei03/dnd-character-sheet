"use client";

import React, { useState } from "react";
import EntityForm from "../ui/EntityForm";
import FeatureModifierEditor from "./FeatureModifierEditor";
import Select from "../ui/Select";
import { FeatureModifier } from "../../types/modifiers";
import { Feature, CharacterClass } from "../../types/character";

interface FeatureFormProps {
    initialData: Partial<Feature>;
    onSave: (data: Partial<Feature>) => void;
    onCancel: () => void;
    isEditing: boolean;
    classes: CharacterClass[];
    species: string;
    subSpecies?: string;
    background: string;
}

const ORIGIN_OPTIONS = ["Class", "Species", "Background", "Feat", "Item", "Other"];

const FeatureForm: React.FC<FeatureFormProps> = ({
    initialData,
    onSave,
    onCancel,
    isEditing,
    classes = [],
    species = "",
    subSpecies = "",
    background = "",
}) => {
    const [formData, setFormData] = useState<Partial<Feature>>(initialData);

    const handleSave = () => {
        onSave(formData);
    };

    return (
        <EntityForm
            title={isEditing ? "Edit Feature" : "New Feature"}
            onSave={handleSave}
            onCancel={onCancel}
            saveLabel={isEditing ? "Save Changes" : "Create Feature"}
            isEditing={isEditing}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-gray-500">Name</label>
                    <input
                        type="text"
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-2 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none font-medium"
                        placeholder="Feature name..."
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-gray-500">Origin</label>
                    <div className="flex gap-2">
                        <Select
                            value={formData.origin || "Class"}
                            onValueChange={(val) => setFormData({ ...formData, origin: val })}
                            options={ORIGIN_OPTIONS.map(opt => ({ label: opt, value: opt }))}
                        />

                        {formData.origin === "Class" && classes.length > 0 && (
                            <div className="flex flex-col gap-2 w-full">
                                <Select
                                    value={formData.subOrigin || (classes.length > 0 ? classes[0].name : "")}
                                    onValueChange={(val) => setFormData({ ...formData, subOrigin: val, subclass: "" })}
                                    options={classes.map(cls => ({ label: cls.name, value: cls.name }))}
                                    className="animate-in fade-in slide-in-from-left-2 duration-200"
                                />

                                {/* Subclass Selection */}
                                {classes.find(c => c.name === (formData.subOrigin || classes[0].name))?.subclass && (
                                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <label className="text-xs font-bold uppercase text-gray-400 whitespace-nowrap">Subclass Feature?</label>
                                        <Select
                                            value={formData.subclass || ""}
                                            onValueChange={(val) => setFormData({ ...formData, subclass: val })}
                                            options={[
                                                { label: "None (Base Class)", value: "" },
                                                { 
                                                    label: classes.find(c => c.name === (formData.subOrigin || classes[0].name))?.subclass || "", 
                                                    value: classes.find(c => c.name === (formData.subOrigin || classes[0].name))?.subclass || "" 
                                                }
                                            ]}
                                            className="flex-1"
                                        />
                                    </div>
                                )}

                                {/* Level Selection */}
                                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200 mt-1">
                                    <label className="text-xs font-bold uppercase text-gray-400 whitespace-nowrap">Level Gained</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={formData.level || ""}
                                        onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || undefined })}
                                        className="w-16 p-1 text-xs border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none"
                                        placeholder="Lvl..."
                                    />
                                </div>
                            </div>
                        )}
                        {formData.origin === "Species" && (
                            <Select
                                value={formData.subOrigin || (subSpecies || species || "")}
                                onValueChange={(val) => setFormData({ ...formData, subOrigin: val })}
                                options={[
                                    { label: species, value: species },
                                    ...(subSpecies ? [{ label: subSpecies, value: subSpecies }] : []),
                                    { label: "Other...", value: "" }
                                ]}
                                className="animate-in fade-in slide-in-from-left-2 duration-200"
                            />
                        )}
                        {formData.origin === "Background" && (
                            <input
                                type="text"
                                value={formData.subOrigin || background || ""}
                                onChange={(e) => setFormData({ ...formData, subOrigin: e.target.value })}
                                className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700 animate-in fade-in slide-in-from-left-2 duration-200"
                                placeholder="Background name..."
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500">Description</label>
                <textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none h-48"
                    placeholder="Describe the feature..."
                />
            </div>

            <FeatureModifierEditor
                modifiers={formData.modifiers || []}
                onUpdate={(modifiers: FeatureModifier[]) => setFormData({ ...formData, modifiers })}
                parentName={formData.name || ""}
            />
        </EntityForm>
    );
};

export default FeatureForm;
