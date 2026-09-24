import * as THREE from "three";
import type { RoomObjectShape } from "./room-objects";

export type BuiltPrimitive = {
    group: THREE.Group;
    /** Meshes that should answer raycasts for this object. */
    meshes: THREE.Mesh[];
};

function standardMaterial(color: number, options?: Partial<THREE.MeshStandardMaterialParameters>) {
    return new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.05, ...options });
}

function add(
    group: THREE.Group,
    meshes: THREE.Mesh[],
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    position: [number, number, number],
    rotation?: [number, number, number],
) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    if (rotation) mesh.rotation.set(...rotation);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    meshes.push(mesh);
}

/** Desktop calendar standing on the desk, KBU-orange header band. */
function buildCalendar(position: [number, number, number]): BuiltPrimitive {
    const group = new THREE.Group();
    const meshes: THREE.Mesh[] = [];

    add(group, meshes, new THREE.BoxGeometry(0.86, 1.1, 0.035), standardMaterial(0xfaf7f2), [0, 0.55, 0]);
    add(
        group,
        meshes,
        new THREE.BoxGeometry(0.86, 0.18, 0.04),
        standardMaterial(0xea580c, { roughness: 0.45 }),
        [0, 1.0, 0.004],
    );
    for (const y of [0.32, 0.1]) {
        add(group, meshes, new THREE.BoxGeometry(0.72, 0.012, 0.042), standardMaterial(0xd4d4d8), [0, y, 0.004]);
    }

    group.position.set(...position);
    group.rotation.x = -0.14;
    return { group, meshes };
}

/** Team board leaning at the back of the desk with a few sticky notes. */
function buildBoard(position: [number, number, number]): BuiltPrimitive {
    const group = new THREE.Group();
    const meshes: THREE.Mesh[] = [];

    add(group, meshes, new THREE.BoxGeometry(1.26, 0.9, 0.045), standardMaterial(0x3f3f46), [0, 0.45, 0]);
    add(group, meshes, new THREE.BoxGeometry(1.12, 0.76, 0.02), standardMaterial(0x52525b), [0, 0.45, 0.014]);

    const notes: Array<[number, number, number]> = [
        [-0.36, 0.58, 0xea580c],
        [0.02, 0.34, 0xfdba74],
        [0.38, 0.6, 0xfafafa],
        [-0.1, 0.66, 0xfcd34d],
    ];
    for (const [x, y, color] of notes) {
        add(
            group,
            meshes,
            new THREE.PlaneGeometry(0.26, 0.26),
            standardMaterial(color, { roughness: 0.8 }),
            [x, y, 0.028],
            [0, 0, (x + y) * 0.12],
        );
    }

    group.position.set(...position);
    group.rotation.x = -0.1;
    return { group, meshes };
}

/** Small trophy displayed on top of the shelf unit. */
function buildTrophy(position: [number, number, number]): BuiltPrimitive {
    const group = new THREE.Group();
    const meshes: THREE.Mesh[] = [];
    const gold = standardMaterial(0xd4a017, { metalness: 0.85, roughness: 0.22 });
    const darkGold = standardMaterial(0xb8860b, { metalness: 0.8, roughness: 0.3 });

    add(group, meshes, new THREE.CylinderGeometry(0.15, 0.21, 0.42, 18), gold, [0, 0.62, 0]);
    for (const side of [-1, 1]) {
        add(
            group,
            meshes,
            new THREE.TorusGeometry(0.09, 0.024, 8, 16),
            gold,
            [side * 0.2, 0.68, 0],
            [0, 0, (side * Math.PI) / 2],
        );
    }
    add(group, meshes, new THREE.CylinderGeometry(0.045, 0.06, 0.16, 12), gold, [0, 0.34, 0]);
    add(group, meshes, new THREE.BoxGeometry(0.5, 0.05, 0.22), darkGold, [0, 0.24, 0]);

    group.position.set(...position);
    return { group, meshes };
}

export function buildPrimitive(shape: RoomObjectShape, position: [number, number, number]): BuiltPrimitive {
    switch (shape) {
        case "calendar":
            return buildCalendar(position);
        case "board":
            return buildBoard(position);
        case "trophy":
            return buildTrophy(position);
    }
}
