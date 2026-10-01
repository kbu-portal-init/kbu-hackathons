/**
 * Object-to-route mapping for the immersive room experience.
 *
 * Anchor coordinates are hand-tuned against the measured bounds of
 * `public/models/office-desk.glb` (desk surface y=4.28, desk x∈[-4.30,4.21],
 * desk z∈[1.67,5.86], shelf top y=3.98). Verified by
 * `scripts/verify-room-anchors.mjs`, which reads this file and checks every
 * anchor against the loaded model — run it if the GLB is ever replaced.
 */

export type RoomObjectShape =
    | "calendar"
    | "board"
    | "trophy"
    | "keyboard"
    | "clock"
    | "poster"
    | "duck"
    | "plant"
    | "mug"
    | "backpack";

export type RoomObjectAnchor =
    /** One or more named nodes inside the loaded GLB model. */
    | { kind: "model"; nodeNames: string[] }
    /** A simple shape built from three.js primitives at a fixed world position. */
    | { kind: "primitive"; shape: RoomObjectShape; position: [number, number, number] };

export type RoomObjectAction = "toggle-lamp";

export type RoomObject = {
    id: string;
    label: string;
    description: string;
    /** Route navigated to when the object is activated. */
    route?: string;
    /** Non-navigation action performed on activation. */
    action?: RoomObjectAction;
    anchor: RoomObjectAnchor;
};

export const roomObjects: RoomObject[] = [
    {
        id: "laptop",
        label: "Hackathon overview",
        description: "Browse upcoming events, challenges, and registration deadlines.",
        route: "/events",
        anchor: { kind: "model", nodeNames: ["laptop_8"] },
    },
    {
        id: "calendar",
        label: "Announcements",
        description: "News, schedule changes, and updates from the organizers.",
        route: "/announcements",
        anchor: { kind: "primitive", shape: "calendar", position: [0.2, 4.3, 5.35] },
    },
    {
        id: "board",
        label: "Find your team",
        description: "Register a team or join an existing one for the next challenge.",
        route: "/register",
        anchor: { kind: "primitive", shape: "board", position: [-2.2, 4.3, 5.45] },
    },
    {
        id: "books",
        label: "Resources",
        description: "Guides, references, and tooling for building during the hackathon.",
        route: "/resources",
        anchor: { kind: "model", nodeNames: ["book_5", "book2_6"] },
    },
    {
        id: "trophy",
        label: "About KBU Hub",
        description: "What the KBU hackathon community is and how it runs.",
        route: "/about",
        anchor: { kind: "primitive", shape: "trophy", position: [-2.6, 4.28, 4.4] },
    },
    {
        id: "phone",
        label: "Sign in",
        description: "Log in as a team, organizer, or administrator.",
        route: "/login",
        anchor: { kind: "model", nodeNames: ["phone_98"] },
    },
    {
        id: "shelf",
        label: "Management & admin",
        description: "Staff entrance to the management panel and admin tools.",
        route: "/login/management",
        anchor: { kind: "model", nodeNames: ["Cube001_103"] },
    },
    {
        id: "lamp",
        label: "Desk lamp",
        description: "Toggles the warm desk light.",
        action: "toggle-lamp",
        anchor: { kind: "model", nodeNames: ["lamp_95"] },
    },
    {
        id: "keyboard",
        label: "Team workspace",
        description: "Your team dashboard: roster, references, and the build you submit.",
        route: "/teams",
        anchor: { kind: "primitive", shape: "keyboard", position: [1.5, 4.28, 4.5] },
    },
    {
        id: "clock",
        label: "Sprint schedule",
        description: "Kickoff, checkpoints, and demo day — every date on the calendar.",
        route: "/events",
        anchor: { kind: "primitive", shape: "clock", position: [-3.5, 4.28, 4.9] },
    },
    {
        id: "poster",
        label: "Hackathon poster",
        description: "KBU Innovation Sprint — one weekend, one working demo.",
        anchor: { kind: "primitive", shape: "poster", position: [1.4, 4.28, 5.65] },
    },
    {
        id: "duck",
        label: "Debugging duck",
        description: "Explain the bug out loud. Every hackathon desk has one.",
        anchor: { kind: "primitive", shape: "duck", position: [-1.5, 4.28, 4.65] },
    },
    {
        id: "mug",
        label: "Coffee refuel",
        description: "Third cup of the night. Still compiling.",
        anchor: { kind: "primitive", shape: "mug", position: [-0.3, 4.28, 4.35] },
    },
    {
        id: "plant",
        label: "Desk plant",
        description: "The only thing on this desk that grows without a commit.",
        anchor: { kind: "primitive", shape: "plant", position: [-3.9, 4.28, 5.5] },
    },
    {
        id: "backpack",
        label: "Builder's backpack",
        description: "Charger, adapters, and a hoodie for the 3am stretch.",
        anchor: { kind: "primitive", shape: "backpack", position: [2.8, 4.28, 5.3] },
    },
];

export const roomObjectById = new Map(roomObjects.map((object) => [object.id, object]));
