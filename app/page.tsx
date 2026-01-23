"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Character, loadAllCharacters, deleteCharacter, saveCharacter } from "../utils/db"; // Import saveCharacter and deleteCharacter functions

const HomePage = () => {
  // Specify the type of characters as an array of Character objects
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    // Load the characters from IndexedDB when the component mounts
    const loadData = async () => {
      try {
        const characterList = await loadAllCharacters();
        setCharacters(characterList); // Now it's type-safe
      } catch (error) {
        console.error("Error loading characters:", error);
      }
    };
    loadData();
  }, []); // The empty dependency array ensures this runs only once when the component mounts

  // Delete character by ID
  const handleDeleteCharacter = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this character?")) {
      try {
        await deleteCharacter(id); // Delete the character from IndexedDB
        setCharacters(characters.filter((character) => character.id !== id)); // Update the character list
      } catch (error) {
        console.error("Error deleting character:", error);
      }
    }
  };

  // Create a new character
  const createNewCharacter = () => {
    const newCharacter: Character = {
      id: Date.now(), // Unique ID based on timestamp
      name: "New Character", // Default name
      hp: 100, // Default HP
      abilityScores: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      },
    };

    // Save new character to IndexedDB
    saveCharacter(newCharacter).then(() => {
      setCharacters([...characters, newCharacter]); // Add the new character to the list
    }).catch((error) => {
      console.error("Error saving new character:", error);
    });
  };

  return (
    <div className="flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-6">Character Selection</h1>
      <div className="mb-4">
        <button
          onClick={createNewCharacter}
          className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Create New Character
        </button>
      </div>
      {characters.length > 0 ? (
        <div className="space-y-4">
          {characters.map((character) => (
            <div key={character.id} className="flex justify-between items-center w-full max-w-md">
              <Link
                href={`/characters/${character.id}`}
                className="w-full py-2 px-4 bg-gray-200 rounded-lg text-left hover:bg-gray-300"
              >
                {character.name}
              </Link>
              <button
                onClick={() => handleDeleteCharacter(character.id)}
                className="ml-4 py-1 px-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No characters found. Please create a character.</p>
      )}
    </div>
  );
};

export default HomePage;
