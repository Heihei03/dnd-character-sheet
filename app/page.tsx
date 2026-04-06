"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Character } from "../types/character";
import { loadAllCharacters, deleteCharacter, saveCharacter, exportAllCharacters, importCharacters } from "../utils/db";
import { Plus, Download, Upload, Trash2, User, ChevronRight, UserCircle2 } from "lucide-react";
import Image from "next/image";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import ThemeSettings from "../components/ThemeSettings";
import SettingsButton from "../components/ui/SettingsButton";

const HomePage = () => {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null);
    const [showThemeSettings, setShowThemeSettings] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const characterList = await loadAllCharacters();
                setCharacters(characterList);
            } catch (error) {
                console.error("Error loading characters:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const handleDeleteCharacter = async () => {
        if (!characterToDelete) return;

        try {
            await deleteCharacter(characterToDelete.id);
            setCharacters(characters.filter((character) => character.id !== characterToDelete.id));
            setCharacterToDelete(null);
        } catch (error) {
            console.error("Error deleting character:", error);
        }
    };

    const createNewCharacter = () => {
        const newCharacter: Character = {
            id: Date.now(),
            name: "New Character",
            maxHp: 10,
            hp: 10,
            tempHp: 0,
            classes: [{ name: "Fighter", level: 1 }],
            abilityScores: {
                strength: 10,
                dexterity: 10,
                constitution: 10,
                intelligence: 10,
                wisdom: 10,
                charisma: 10,
            },
            weaponProficiencies: [],
            armorProficiencies: [],
            toolProficiencies: [],
            languages: ["Common"],
            species: "Human",
            background: "Soldier",
        };

        saveCharacter(newCharacter).then(() => {
            setCharacters([...characters, newCharacter]);
        }).catch((error) => {
            console.error("Error saving new character:", error);
        });
    };

    const handleExportData = async () => {
        try {
            const data = await exportAllCharacters();
            const blob = new Blob([data], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `dnd-characters-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error exporting data:", error);
        }
    };

    const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target?.result;
            if (typeof content === "string") {
                try {
                    await importCharacters(content);
                    const updatedList = await loadAllCharacters();
                    setCharacters(updatedList);
                } catch (error) {
                    console.error("Error importing data:", error);
                    alert("Failed to import character data.");
                }
            }
        };
        reader.readAsText(file);
        event.target.value = "";
    };

    const getClassSummary = (character: Character) => {
        if (!character.classes || character.classes.length === 0) return "Classless";
        return character.classes.map(c => `${c.name} ${c.level}`).join(" / ");
    };

    const getTotalLevel = (character: Character) => {
        return character.classes?.reduce((acc, c) => acc + c.level, 0) || 1;
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-border pb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-foreground">
                            Character <span className="text-primary italic">Vault</span>
                        </h1>
                        <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs mt-2">
                            Manage your characters
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <SettingsButton onClick={() => setShowThemeSettings(true)} />
                        
                        <button
                            onClick={handleExportData}
                            className="p-2.5 bg-secondary/10 hover:bg-secondary/30 text-foreground border border-border rounded-xl transition-all group"
                            title="Export Backup"
                        >
                            <Download size={20} className="group-hover:scale-110 transition-transform" />
                        </button>

                        <div className="relative group">
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImportData}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                id="import-input"
                            />
                            <button
                                className="p-2.5 bg-secondary/10 hover:bg-secondary/30 text-foreground border border-border rounded-xl transition-all"
                                title="Import Backup"
                            >
                                <Upload size={20} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        <button
                            onClick={createNewCharacter}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            <Plus size={18} />
                            New Character
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Loading characters...</span>
                    </div>
                ) : characters.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {characters.map((character) => (
                            <div
                                key={character.id}
                                className="group relative bg-secondary/20 hover:bg-secondary/30 border border-border hover:border-primary/50 rounded-2xl p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 cursor-pointer flex flex-col"
                            >
                                <Link href={`/characters/${character.id}`} className="absolute inset-0 z-10" />

                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-20 h-20 rounded-xl bg-background border-2 border-border group-hover:border-primary/30 transition-colors overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                                        {character.imageUrl ? (
                                            <img src={character.imageUrl} alt={character.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <UserCircle2 size={40} className="text-muted-foreground/30" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 py-1">
                                        <h2 className="text-xl font-black truncate group-hover:text-primary transition-colors">
                                            {character.name}
                                        </h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 uppercase tracking-tighter">
                                                Lv {getTotalLevel(character)}
                                            </span>
                                            <span className="text-xs font-bold text-muted-foreground truncate uppercase border-l border-border pl-2">
                                                {character.species || "Unknown"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 flex-1 flex flex-col">
                                    <div className="bg-background/40 rounded-xl p-3 border border-border/40">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Class Path</label>
                                        <p className="text-xs font-black italic text-foreground tracking-tight line-clamp-1">
                                            {getClassSummary(character)}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                                        <div className="flex items-center gap-1.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity font-black text-[10px] uppercase tracking-widest">
                                            Character Sheet <ChevronRight size={14} className="animate-pulse" />
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setCharacterToDelete(character);
                                            }}
                                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all relative z-20"
                                            title="Delete Hero"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-secondary/10 border-2 border-dashed border-border rounded-3xl p-12 text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <User className="text-muted-foreground w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black text-foreground">No Characters Found</h2>
                        <p className="text-muted-foreground mt-2 mb-8 max-w-sm mx-auto font-medium text-sm">
                            Create a new character or import an existing backup to get started with your sheet.
                        </p>
                        <button
                            onClick={createNewCharacter}
                            className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all"
                        >
                            Create Character
                        </button>
                    </div>
                )}

                {/* Confirmation Modal */}
                <ConfirmationModal
                    isOpen={!!characterToDelete}
                    onClose={() => setCharacterToDelete(null)}
                    onConfirm={handleDeleteCharacter}
                    title="Delete Character"
                    message={`Are you sure you want to delete ${characterToDelete?.name}? This action is final and all character data will be lost forever.`}
                    confirmText="Delete"
                />

                {/* Theme Settings Modal */}
                {showThemeSettings && (
                    <ThemeSettings onClose={() => setShowThemeSettings(false)} />
                )}
            </div>
        </div>
    );
};

export default HomePage;
