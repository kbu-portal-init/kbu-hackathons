/**
 * Object-to-route mapping for the immersive room experience.
 *
 * Anchor coordinates are derived from the measured bounds of
 * `public/models/office-desk.glb` (desk surface y=4.28, shelf top y=3.98,
 * desk x∈[-4.30,4.21], desk z∈[1.67,5.86]).
 * ponytail: hand-tuned constants, not runtime-fit to the model; adjust here if
 * the GLB is ever replaced.
 */

export type RoomObjectShape = "calendar" | "board" | "trophy";

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
        anchor: { kind: "primitive", shape: "trophy", position: [-2.6, 4.0, 4.4] },
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
        anchor: { kind: "model", nodeNames: ["Cube.001_103"] },
    },
    {
        id: "lamp",
        label: "Desk lamp",
        description: "Toggles the warm desk light.",
        action: "toggle-lamp",
        anchor: { kind: "model", nodeNames: ["lamp_95"] },
    },
];

export const roomObjectById = new Map(roomObjects.map((object) => [object.id, object]));
