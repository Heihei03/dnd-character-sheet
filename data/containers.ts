import { ContainerDetails } from "../types/character";

export interface ContainerBaseData {
    name: string;
    weight: number;
    costGP: number;
    details: ContainerDetails;
}

export const CONTAINER_DATA: Record<string, ContainerBaseData> = {
    "Backpack": {
        name: "Backpack",
        weight: 5,
        costGP: 2,
        details: {
            capacityWeight: 30,
            contentsWeightMultiplier: 1
        }
    },
    "Bag of Holding": {
        name: "Bag of Holding",
        weight: 15,
        costGP: 500, // This is just an example, DM might set a different price
        details: {
            capacityWeight: 500,
            contentsWeightMultiplier: 0
        }
    },
    "Pouch": {
        name: "Pouch",
        weight: 1,
        costGP: 0.5,
        details: {
            capacityWeight: 6,
            contentsWeightMultiplier: 1
        }
    },
    "Chest": {
        name: "Chest",
        weight: 25,
        costGP: 5,
        details: {
            capacityWeight: 300,
            contentsWeightMultiplier: 1
        }
    },
    "Sack": {
        name: "Sack",
        weight: 0.5,
        costGP: 0.01,
        details: {
            capacityWeight: 30,
            contentsWeightMultiplier: 1
        }
    },
    "Basket": {
        name: "Basket",
        weight: 2,
        costGP: 0.4,
        details: {
            capacityWeight: 40,
            contentsWeightMultiplier: 1
        }
    },
    "Barrel": {
        name: "Barrel",
        weight: 70,
        costGP: 2,
        details: {
            capacityWeight: 500,
            contentsWeightMultiplier: 1
        }
    },
    "Quiver": {
        name: "Quiver",
        weight: 1,
        costGP: 1,
        details: {
            capacityWeight: 5,
            contentsWeightMultiplier: 1
        }
    },
    "Case, Bolt": {
        name: "Case, Bolt",
        weight: 1,
        costGP: 1,
        details: {
            capacityWeight: 5,
            contentsWeightMultiplier: 1
        }
    },
    "Case, Map/Scroll": {
        name: "Case, Map/Scroll",
        weight: 1,
        costGP: 1,
        details: {
            capacityWeight: 5,
            contentsWeightMultiplier: 1
        }
    },
    "Waterskin": {
        name: "Waterskin",
        weight: 5,
        costGP: 0.2,
        details: {
            capacityWeight: 4,
            contentsWeightMultiplier: 1
        }
    },
    "Handy Haversack": {
        name: "Handy Haversack",
        weight: 5,
        costGP: 2000,
        details: {
            capacityWeight: 120,
            contentsWeightMultiplier: 0
        }
    },
    "Portable Hole": {
        name: "Portable Hole",
        weight: 0,
        costGP: 20000,
        details: {
            capacityWeight: 1000, // Roughly, DM choice
            contentsWeightMultiplier: 0
        }
    }
};
