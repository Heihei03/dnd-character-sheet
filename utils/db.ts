// utils/db.ts
import { Character } from "../types/character";


// Open the IndexedDB database
export const openDatabase = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("CharacterSheetDB", 1);

        request.onerror = (event) => {
            const target = event.target as IDBRequest | null;
            if (target) {
                console.error("Database error:", target.error);
                reject(target.error);
            } else {
                console.error("Unknown error, target is null");
                reject(new Error("Unknown error, target is null"));
            }
        };

        request.onsuccess = (event) => {
            const target = event.target as IDBRequest | null;
            if (target) {
                console.log("Database opened successfully");
                resolve(target.result as IDBDatabase);
            } else {
                console.error("Unknown error, target is null");
                reject(new Error("Unknown error, target is null"));
            }
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBRequest | null)?.result as IDBDatabase | null;
            if (db) {
                if (!db.objectStoreNames.contains("characters")) {
                    const objectStore = db.createObjectStore("characters", { keyPath: "id", autoIncrement: true });
                    objectStore.createIndex("name", "name", { unique: false });
                }
            } else {
                console.error("Database upgrade failed, db is null");
            }
        };
    });
};

// Save character data to IndexedDB
// utils/db.ts
export const saveCharacter = (characterData: Character): Promise<void> => {
    return new Promise((resolve, reject) => {
        openDatabase().then((db) => {
            const transaction = db.transaction(["characters"], "readwrite");
            const objectStore = transaction.objectStore("characters");
            const saveRequest = objectStore.put(characterData); // `put` will insert or update

            saveRequest.onsuccess = () => {
                resolve();
            };

            saveRequest.onerror = (event) => {
                const target = event.target as IDBRequest;
                console.error("Error saving character data:", target.error);
                reject(target.error);
            };
        });
    });
};


// Load character data from IndexedDB by ID
export const loadCharacter = (characterId: number): Promise<Character | null> => {
    return new Promise((resolve, reject) => {
        openDatabase().then((db) => {
            const transaction = db.transaction(["characters"], "readonly");
            const objectStore = transaction.objectStore("characters");
            const getRequest = objectStore.get(characterId);

            getRequest.onsuccess = () => {
                if (getRequest.result) {
                    resolve(getRequest.result as Character);
                } else {
                    resolve(null); // Return null if no data found
                }
            };

            getRequest.onerror = (event) => {
                const target = event.target as IDBRequest;
                console.error("Error loading character data:", target.error);
                reject(target.error);
            };
        });
    });
};

// Load all characters from IndexedDB
export const loadAllCharacters = (): Promise<Character[]> => {
    return new Promise((resolve, reject) => {
        openDatabase().then((db) => {
            const transaction = db.transaction(["characters"], "readonly");
            const objectStore = transaction.objectStore("characters");
            const getAllRequest = objectStore.getAll();

            getAllRequest.onsuccess = () => {
                resolve(getAllRequest.result as Character[]);
            };

            getAllRequest.onerror = (event) => {
                const target = event.target as IDBRequest;
                console.error("Error loading characters:", target.error);
                reject(target.error);
            };
        });
    });
};


// Delete a character from IndexedDB by ID
export const deleteCharacter = (characterId: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        openDatabase().then((db) => {
            const transaction = db.transaction(["characters"], "readwrite");
            const objectStore = transaction.objectStore("characters");
            const deleteRequest = objectStore.delete(characterId);

            deleteRequest.onsuccess = () => {
                console.log("Character deleted successfully");
                resolve();
            };

            deleteRequest.onerror = (event) => {
                const target = event.target as IDBRequest;
                console.error("Error deleting character:", target.error);
                reject(target.error);
            };
        });
    });
};
