import { Action } from "../types/character";

export const STANDARD_ACTIONS: Action[] = [
    {
        id: "std-dash",
        name: "Dash",
        type: "Action",
        activation: "1 Action",
        description: "When you take the Dash action, you gain extra movement for the current turn. The increase equals your speed, after applying any modifiers.",
        fromFeature: true // Mark as feature/automatic to prevent editing/deleting
    },
    {
        id: "std-disengage",
        name: "Disengage",
        type: "Action",
        activation: "1 Action",
        description: "If you take the Disengage action, your movement doesn't provoke opportunity attacks for the rest of the turn.",
        fromFeature: true
    },
    {
        id: "std-dodge",
        name: "Dodge",
        type: "Action",
        activation: "1 Action",
        description: "When you take the Dodge action, you focus entirely on avoiding attacks. Until the start of your next turn, any attack roll made against you has disadvantage if you can see the attacker, and you make Dexterity saving throws with advantage. You lose this benefit if you are incapacitated or if your speed drops to 0.",
        fromFeature: true
    },
    {
        id: "std-help",
        name: "Help",
        type: "Action",
        activation: "1 Action",
        description: "You can lend your aid to another creature in the completion of a task. When you take the Help action, the creature you aid gains advantage on the next ability check it makes to perform the task you are helping with, provided that it makes the check before the start of your next turn.\n\nAlternatively, you can aid a friendly creature in attacking a creature within 5 feet of you. You feint, distract the target, or in some other way team up to make your ally's attack more effective. If your ally attacks the target before your next turn, the first attack roll is made with advantage.",
        fromFeature: true
    },
    {
        id: "std-hide",
        name: "Hide",
        type: "Action",
        activation: "1 Action",
        description: "When you take the Hide action, you make a Dexterity (Stealth) check in an attempt to hide, following the rules for hiding. If you succeed, you gain certain benefits, as described in the 'Unseen Attackers and Targets' section.",
        fromFeature: true
    },
    {
        id: "std-ready",
        name: "Ready",
        type: "Action",
        activation: "1 Action",
        description: "Sometimes you want to get the jump on a foe or wait for a particular circumstance before you act. To do so, you can take the Ready action on your turn, which lets you act using your reaction before the start of your next turn.\n\nFirst, you decide what perceivable circumstance will trigger your reaction. Then, you choose the action you will take in response to that trigger, or you choose to move up to your speed in response to it. When the trigger occurs, you can either take your reaction immediately after the trigger finishes or ignore the trigger.",
        fromFeature: true
    },
    {
        id: "std-search",
        name: "Search",
        type: "Action",
        activation: "1 Action",
        description: "When you take the Search action, you devote your attention to finding something. Depending on the nature of your search, the DM might have you make a Wisdom (Perception) check or an Intelligence (Investigation) check.",
        fromFeature: true
    },
    {
        id: "std-use-object",
        name: "Use an Object",
        type: "Action",
        activation: "1 Action",
        description: "You normally interact with an object while doing something else, such as when you draw a sword as part of an attack. When an object requires your action for its use, you take the Use an Object action. This action is also useful when you want to interact with more than one object on your turn.",
        fromFeature: true
    },
    {
        id: "std-opportunity-attack",
        name: "Opportunity Attack",
        type: "Reaction",
        activation: "1 Reaction",
        description: "You can make an opportunity attack when a hostile creature that you can see moves out of your reach. To make the opportunity attack, you use your reaction to make one melee attack against the provoking creature. The attack occurs right before the creature leaves your reach.",
        fromFeature: true
    },
    {
        id: "std-grapple",
        name: "Grapple",
        type: "Action",
        activation: "1 Action",
        description: "When you want to grab a creature or wrestle with it, you can use the Attack action to make a special melee attack, a grapple. If you're able to make multiple attacks with the Attack action, this attack replaces one of them.\n\nThe target of your grapple must be no more than one size larger than you and must be within your reach. Using at least one free hand, you try to seize the target by making a grapple check instead of an attack roll: a Strength (Athletics) check contested by the target's Strength (Athletics) or Dexterity (Acrobatics) check (the target chooses the ability to use).\n\nIf you succeed, you subject the target to the grappled condition. The condition specifies the things that end it, and you can release the target whenever you like (no action required).",
        fromFeature: true
    },
    {
        id: "std-shove",
        name: "Shove",
        type: "Action",
        activation: "1 Action",
        description: "Using the Attack action, you can make a special melee attack to shove a creature, either to knock it prone or push it away from you. If you're able to make multiple attacks with the Attack action, this attack replaces one of them.\n\nThe target must be no more than one size larger than you and must be within your reach. Instead of making an attack roll, you make a Strength (Athletics) check contested by the target's Strength (Athletics) or Dexterity (Acrobatics) check (the target chooses the ability to use). If you win the contest, you either knock the target prone or push it 5 feet away from you.",
        fromFeature: true
    }
];
