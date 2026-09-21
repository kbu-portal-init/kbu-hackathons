// Verify the hand-tuned primitive anchors in room-objects.ts against the real
// GLB bounds: every anchor must sit on or above the desk surface and inside the
// desk footprint. Run: node scripts/verify-room-anchors.mjs
import { readFileSync } from "node:fs";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const MODEL = "public/models/office-desk.glb";
const DESK_SURFACE_Y = 4.28;
const DESK_X = [-4.3, 4.21];
const DESK_Z = [1.67, 5.86];

// GLTFLoader.parse() touches a few browser globals; stub the ones it needs.
globalThis.self = globalThis;
globalThis.URL ||= { createObjectURL: () => "blob:stub", revokeObjectURL: () => {} };
globalThis.createImageBitmap ||= async () => ({});
globalThis.document ||= { createElement: () => ({ style: {} }) };

const primitives = [
    ["calendar", [0.2, 4.3, 5.35]],
    ["board", [-2.2, 4.3, 5.45]],
    ["trophy", [-2.6, 4.28, 4.4]],
    ["keyboard", [1.5, 4.28, 4.5]],
    ["clock", [-3.5, 4.28, 4.9]],
    ["poster", [1.4, 4.28, 5.65]],
    ["duck", [-1.5, 4.28, 4.65]],
    ["mug", [-0.3, 4.28, 4.35]],
    ["plant", [-3.9, 4.28, 5.5]],
    ["backpack", [2.8, 4.28, 5.3]],
];

const expectedNodes = new Set(["laptop_8", "book_5", "book2_6", "phone_98", "Cube001_103", "lamp_95"]);

// GLTFLoader.parse() expects an ArrayBuffer; readFileSync returns a Node Buffer
// whose .buffer can be a larger pooled region, so slice out the exact bytes.
const buffer = readFileSync(MODEL);
const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
const loader = new GLTFLoader();

const gltf = await new Promise((resolve, reject) => {
    loader.parse(arrayBuffer, "", resolve, reject);
});

const model = gltf.scene;
const modelNames = new Set();
model.traverse((child) => {
    if (child.name) modelNames.add(child.name);
});

// Ground plane: the lowest point of the model, used as a sanity reference.
const modelBox = new THREE.Box3().setFromObject(model);
console.log(
    "model bounds:",
    [
        modelBox.min.x.toFixed(2),
        modelBox.min.y.toFixed(2),
        modelBox.min.z.toFixed(2),
        "->",
        modelBox.max.x.toFixed(2),
        modelBox.max.y.toFixed(2),
        modelBox.max.z.toFixed(2),
    ].join(" "),
);

// List every named node with its world-space bounds, so anchor names and shelf
// heights can be measured rather than guessed.
const named = [];
model.traverse((child) => {
    if (!child.name) return;
    const box = new THREE.Box3().setFromObject(child);
    if (!Number.isFinite(box.min.x)) return;
    named.push({
        name: child.name,
        type: child.type,
        min: [box.min.x, box.min.y, box.min.z].map((v) => v.toFixed(2)).join(","),
        max: [box.max.x, box.max.y, box.max.z].map((v) => v.toFixed(2)).join(","),
        size: [box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z].map((v) => v.toFixed(2)).join("x"),
    });
});
console.log(`\nnamed nodes (${named.length}):`);
for (const node of named) {
    console.log(
        `  ${node.name.padEnd(18)} ${node.type.padEnd(6)} min[${node.min}] max[${node.max}] size[${node.size}]`,
    );
}
console.log();

let failures = 0;
for (const [name, pos] of primitives) {
    const [x, y, z] = pos;
    const problems = [];
    if (y < DESK_SURFACE_Y - 0.001) {
        problems.push(`y=${y} is below the desk surface (${DESK_SURFACE_Y}) — object sinks`);
    }
    if (x < DESK_X[0] || x > DESK_X[1]) {
        problems.push(`x=${x} is outside the desk footprint ${DESK_X.join("..")}`);
    }
    if (z < DESK_Z[0] || z > DESK_Z[1]) {
        problems.push(`z=${z} is outside the desk footprint ${DESK_Z.join("..")}`);
    }
    if (problems.length) {
        failures += 1;
        console.log(`FAIL ${name} @ ${pos}`);
        for (const problem of problems) console.log(`       ${problem}`);
    } else {
        console.log(`ok   ${name} @ ${pos}`);
    }
}

const missingNodes = [...expectedNodes].filter((name) => !modelNames.has(name));
if (missingNodes.length) {
    failures += 1;
    console.log(`FAIL model anchors not found: ${missingNodes.join(", ")}`);
    console.log("       room-objects.ts would silently drop these objects (RoomScene uses `if (!node) continue`)");
} else {
    console.log("ok   all 6 model anchor nodes present");
}

console.log(failures === 0 ? "\nALL ANCHORS OK" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
