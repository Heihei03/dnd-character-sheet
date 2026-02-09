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
    }
};
