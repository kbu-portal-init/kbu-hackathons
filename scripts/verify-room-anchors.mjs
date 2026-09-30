// Verify the hand-tuned anchors in room-objects.ts against the real GLB bounds.
// Reads the source of truth (room-objects.ts) rather than a hardcoded list, so
// it actually catches a regression. Run: node scripts/verify-room-anchors.mjs
import { readFileSync } from "node:fs";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const OBJECTS_FILE = "components/_3d/room-objects.ts";
const MODEL = "public/models/office-desk.glb";
const DESK_SURFACE_Y = 4.28;
const DESK_X = [-4.3, 4.21];
const DESK_Z = [1.67, 5.86];

// GLTFLoader.parse() touches a few browser globals; stub the ones it needs.
globalThis.self = globalThis;
globalThis.URL ||= { createObjectURL: () => "blob:stub", revokeObjectURL: () => {} };
globalThis.createImageBitmap ||= async () => ({});
globalThis.document ||= { createElement: () => ({ style: {} }) };

// --- Parse room-objects.ts so this checks the real source of truth ---------
const source = readFileSync(OBJECTS_FILE, "utf8");

/** Pull `anchor: { kind: "primitive", shape: "x", position: [a,b,c] }` etc. out of the source. */
function parseAnchors(text) {
    const anchors = [];
    const objectRe = /\{\s*id:\s*"([^"]+)"[\s\S]*?anchor:\s*(\{[^}]*\})/g;
    let match = objectRe.exec(text);
    while (match) {
        const id = match[1];
        const anchorText = match[2];
        const kind = /kind:\s*"([^"]+)"/.exec(anchorText)?.[1];
        if (kind === "primitive") {
            const shape = /shape:\s*"([^"]+)"/.exec(anchorText)?.[1];
            const position = JSON.parse(/\[[^\]]*\]/.exec(anchorText)?.[0] ?? "[]");
            anchors.push({ id, kind, shape, position });
        } else if (kind === "model") {
            const names = [...anchorText.matchAll(/"([^"]+)"/g)].map((m) => m[1]).filter((n) => n !== "model");
            anchors.push({ id, kind, nodeNames: names });
        }
        match = objectRe.exec(text);
    }
    return anchors;
}

const anchors = parseAnchors(source);
if (anchors.length === 0) {
    console.log(`FAIL could not parse any anchors from ${OBJECTS_FILE}`);
    console.log("     check the regex against the current room-objects.ts format");
    process.exit(1);
}

// --- Load the model --------------------------------------------------------
const buffer = readFileSync(MODEL);
// readFileSync returns a Node Buffer whose .buffer can be a larger pooled
// region; GLTFLoader.parse() wants the exact ArrayBuffer, so slice it out.
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

let failures = 0;

// --- Check primitive anchors sit on the desk -------------------------------
for (const anchor of anchors) {
    if (anchor.kind !== "primitive") continue;
    const [x, y, z] = anchor.position;
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
        console.log(`FAIL ${anchor.id} (${anchor.shape}) @ ${anchor.position}`);
        for (const problem of problems) console.log(`       ${problem}`);
    } else {
        console.log(`ok   ${anchor.id} (${anchor.shape}) @ ${anchor.position}`);
    }
}

// --- Check model anchor nodes actually exist -------------------------------
// RoomScene does `if (!node) continue`, so a wrong name silently drops the
// object: no highlight, no hover label, no route, and no error anywhere.
for (const anchor of anchors) {
    if (anchor.kind !== "model") continue;
    const missing = anchor.nodeNames.filter((name) => !modelNames.has(name));
    if (missing.length) {
        failures += 1;
        console.log(`FAIL ${anchor.id} node(s) not found: ${missing.join(", ")}`);
        console.log("       RoomScene would silently drop this object");
    } else {
        console.log(`ok   ${anchor.id} node(s) present: ${anchor.nodeNames.join(", ")}`);
    }
}

console.log(failures === 0 ? "\nALL ANCHORS OK" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
