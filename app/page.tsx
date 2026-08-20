"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Character } from "../types/character";
import {
    loadAllCharacters,
    deleteCharacter,
    saveCharacter,
    saveCharactersOrder,
    exportAllCharacters,
    importCharacters,
} from "../utils/db";
import {
    Plus,
    Download,
    Upload,
    User,
    ArrowUpDown,
    Check,
    ChevronDown,
    Sparkles,
} from "lucide-react";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import ThemeSettings from "../components/ThemeSettings";
import SettingsButton from "../components/ui/SettingsButton";
import SortableCharacterCard from "../components/vault/SortableCharacterCard";
import CharacterCardPreview from "../components/vault/CharacterCardPreview";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from "@dnd-kit/sortable";

type SortOption =
    | "custom"
    | "name-asc"
    | "name-desc"
    | "level-desc"
    | "level-asc"
    | "newest"
    | "oldest";

const CUSTOM_ORDER_KEY = "vault_custom_character_order";

const HomePage = () => {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null);
    const [showThemeSettings, setShowThemeSettings] = useState(false);
    const [isReorderMode, setIsReorderMode] = useState(false);
    const [activeId, setActiveId] = useState<number | null>(null);
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [currentSort, setCurrentSort] = useState<SortOption>("custom");

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 6, // 6px movement required to distinguish drag from click
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const getSavedCustomOrderIds = (): number[] => {
        try {
            const stored = localStorage.getItem(CUSTOM_ORDER_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            console.error("Error reading saved custom order:", e);
        }
        return [];
    };

    const sortCharactersByCustomMemory = (list: Character[]): Character[] => {
        const customIds = getSavedCustomOrderIds();
        if (customIds.length === 0) {
            return [...list].sort((a, b) => {
                const orderA = typeof a.order === "number" ? a.order : Infinity;
                const orderB = typeof b.order === "number" ? b.order : Infinity;
                if (orderA !== orderB) return orderA - orderB;
                return (a.id || 0) - (b.id || 0);
            });
        }

        return [...list].sort((a, b) => {
            const indexA = customIds.indexOf(a.id);
            const indexB = customIds.indexOf(b.id);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            const orderA = typeof a.order === "number" ? a.order : Infinity;
            const orderB = typeof b.order === "number" ? b.order : Infinity;
            if (orderA !== orderB) return orderA - orderB;
            return (a.id || 0) - (b.id || 0);
        });
    };

    const saveCustomOrderMemory = async (list: Character[]) => {
        try {
            localStorage.setItem(CUSTOM_ORDER_KEY, JSON.stringify(list.map((c) => c.id)));
        } catch (e) {
            console.error("Error saving custom order snapshot:", e);
        }
        await saveCharactersOrder(list);
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const characterList = await loadAllCharacters();
                const sorted = sortCharactersByCustomMemory(characterList);
                setCharacters(sorted);
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
            const remaining = characters.filter((c) => c.id !== characterToDelete.id);
            setCharacters(remaining);
            await saveCustomOrderMemory(remaining);
            setCharacterToDelete(null);
        } catch (error) {
            console.error("Error deleting character:", error);
        }
    };

    const createNewCharacter = () => {
        const newCharacter: Character = {
            id: Date.now(),
            order: characters.length,
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

        saveCharacter(newCharacter)
            .then(() => {
                const updated = [...characters, newCharacter];
                setCharacters(updated);
                saveCustomOrderMemory(updated);
            })
            .catch((error) => {
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
            link.download = `dnd-characters-backup-${new Date().toISOString().split("T")[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error exporting data:", error);
        }
    };

    const handleExportSingleCharacter = (character: Character) => {
        try {
            const data = JSON.stringify(character, null, 2);
            const blob = new Blob([data], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${character.name.toLowerCase().replace(/\s+/g, "-")}-sheet.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error exporting character:", error);
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
                    const sorted = sortCharactersByCustomMemory(updatedList);
                    setCharacters(sorted);
                    saveCustomOrderMemory(sorted);
                } catch (error) {
                    console.error("Error importing data:", error);
                    alert("Failed to import character data.");
                }
            }
        };
        reader.readAsText(file);
        event.target.value = "";
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(Number(event.active.id));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            const oldIndex = characters.findIndex((c) => c.id === active.id);
            const newIndex = characters.findIndex((c) => c.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newOrder = arrayMove(characters, oldIndex, newIndex);
                setCharacters(newOrder);
                setCurrentSort("custom");
                saveCustomOrderMemory(newOrder).catch((err) => {
                    console.error("Error saving character order:", err);
                });
            }
        }
    };

    const handleMoveCharacter = (fromIndex: number, toIndex: number) => {
        if (
            fromIndex < 0 ||
            fromIndex >= characters.length ||
            toIndex < 0 ||
            toIndex >= characters.length
        ) {
            return;
        }
        const newOrder = arrayMove(characters, fromIndex, toIndex);
        setCharacters(newOrder);
        setCurrentSort("custom");
        saveCustomOrderMemory(newOrder).catch((err) => {
            console.error("Error saving character order:", err);
        });
    };

    const getTotalLevel = (character: Character) => {
        return character.classes?.reduce((acc, c) => acc + c.level, 0) || 1;
    };

    const handleSortPreset = (option: SortOption) => {
        setCurrentSort(option);
        setShowSortMenu(false);

        if (option === "custom") {
            const customSorted = sortCharactersByCustomMemory(characters);
            setCharacters(customSorted);
            saveCharactersOrder(customSorted).catch((err) => {
                console.error("Error restoring custom sort order:", err);
            });
            return;
        }

        const sorted = [...characters];
        switch (option) {
            case "name-asc":
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "name-desc":
                sorted.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case "level-desc":
                sorted.sort((a, b) => getTotalLevel(b) - getTotalLevel(a));
                break;
            case "level-asc":
                sorted.sort((a, b) => getTotalLevel(a) - getTotalLevel(b));
                break;
            case "newest":
                sorted.sort((a, b) => (b.id || 0) - (a.id || 0));
                break;
            case "oldest":
                sorted.sort((a, b) => (a.id || 0) - (b.id || 0));
                break;
        }

        setCharacters(sorted);
    };

    const toggleReorderMode = () => {
        if (!isReorderMode && currentSort !== "custom") {
            // Restore custom manual order when activating Reorder Mode
            const customSorted = sortCharactersByCustomMemory(characters);
            setCharacters(customSorted);
            setCurrentSort("custom");
        }
        setIsReorderMode(!isReorderMode);
    };

    const activeCharacter = activeId
        ? characters.find((c) => c.id === activeId)
        : null;

    return (
        <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
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

                {/* Vault Subheader / Reorder Controls */}
                {!isLoading && characters.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-secondary/15 border border-border/60 rounded-2xl px-5 py-3.5 backdrop-blur-sm relative z-30">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted-foreground">
                            <Sparkles size={14} className="text-primary" />
                            <span>
                                {characters.length} {characters.length === 1 ? "Character" : "Characters"}
                            </span>
                            {isReorderMode && (
                                <span className="text-[10px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/30 animate-pulse ml-2">
                                    Reorder Active
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2.5">
                            {/* Sort Presets Dropdown */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowSortMenu(!showSortMenu);
                                    }}
                                    className="flex items-center gap-2 px-3.5 py-2 text-xs font-black uppercase tracking-wider bg-background hover:bg-secondary border border-border rounded-xl transition-all shadow-sm"
                                    title="Sort Presets"
                                >
                                    <span>Sort By</span>
                                    <ChevronDown size={14} className={`transition-transform duration-200 ${showSortMenu ? "rotate-180" : ""}`} />
                                </button>

                                {showSortMenu && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setShowSortMenu(false);
                                            }}
                                        />
                                        <div className="absolute right-0 mt-2 w-56 bg-background border border-border shadow-2xl rounded-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 ring-1 ring-border/50">
                                            <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/50 mb-1">
                                                Preset Orders
                                            </div>
                                            {[
                                                { id: "custom", label: "Custom / Manual" },
                                                { id: "name-asc", label: "Name (A → Z)" },
                                                { id: "name-desc", label: "Name (Z → A)" },
                                                { id: "level-desc", label: "Level (High → Low)" },
                                                { id: "level-asc", label: "Level (Low → High)" },
                                                { id: "newest", label: "Recently Created" },
                                                { id: "oldest", label: "Oldest Created" },
                                            ].map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleSortPreset(opt.id as SortOption);
                                                    }}
                                                    className={`w-full text-left px-3 py-2 text-xs font-bold flex items-center justify-between hover:bg-primary/10 hover:text-primary transition-colors ${
                                                        currentSort === opt.id
                                                            ? "text-primary font-black bg-primary/5"
                                                            : "text-foreground"
                                                    }`}
                                                >
                                                    <span>{opt.label}</span>
                                                    {currentSort === opt.id && <Check size={14} />}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Reorder Mode Toggle Button */}
                            <button
                                type="button"
                                onClick={toggleReorderMode}
                                className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl border transition-all ${
                                    isReorderMode
                                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                                        : "bg-background hover:bg-secondary text-foreground border-border shadow-sm"
                                }`}
                                title={
                                    isReorderMode
                                        ? "Done Reordering"
                                        : "Toggle Reorder Mode"
                                }
                            >
                                <ArrowUpDown size={14} />
                                {isReorderMode ? "Done Reordering" : "Reorder"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                            Loading characters...
                        </span>
                    </div>
                ) : characters.length > 0 ? (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={characters.map((c) => c.id)}
                            strategy={rectSortingStrategy}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {characters.map((character, index) => (
                                    <SortableCharacterCard
                                        key={character.id}
                                        character={character}
                                        index={index}
                                        totalCount={characters.length}
                                        isReorderMode={isReorderMode}
                                        onExport={handleExportSingleCharacter}
                                        onDelete={setCharacterToDelete}
                                        onMove={handleMoveCharacter}
                                    />
                                ))}
                            </div>
                        </SortableContext>

                        <DragOverlay adjustScale={false}>
                            {activeCharacter ? (
                                <CharacterCardPreview character={activeCharacter} />
                            ) : null}
                        </DragOverlay>
                    </DndContext>
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
