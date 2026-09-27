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

/** Mechanical keyboard with an accent space bar — the desk's main tool. */
function buildKeyboard(position: [number, number, number]): BuiltPrimitive {
    const group = new THREE.Group();
    const meshes: THREE.Mesh[] = [];
    const keyMaterial = standardMaterial(0xe2e8f0, { roughness: 0.5 });

    add(group, meshes, new THREE.BoxGeometry(1.34, 0.02, 0.5), standardMaterial(0x0f172a), [0, 0.008, 0]);
    add(group, meshes, new THREE.BoxGeometry(1.3, 0.07, 0.46), standardMaterial(0x1e293b), [0, 0.04, 0]);

    for (let row = 0; row < 3; row += 1) {
        for (let column = 0; column < 8; column += 1) {
            add(group, meshes, new THREE.BoxGeometry(0.125, 0.035, 0.1), keyMaterial, [
                -0.55 + column * 0.157,
                0.078,
                -0.13 + row * 0.13,
            ]);
        }
    }
    add(
        group,
        meshes,
        new THREE.BoxGeometry(0.5, 0.04, 0.09),
        standardMaterial(0x6d28d9, { roughness: 0.35 }),
        [0.15, 0.08, 0.19],
    );

    group.position.set(...position);
    return { group, meshes };
}

/** Desk clock counting down to demo day. */
function buildClock(position: [number, number, number]): BuiltPrimitive {
    const group = new THREE.Group();
    const meshes: THREE.Mesh[] = [];
    const metal = standardMaterial(0x334155, { roughness: 0.4, metalness: 0.2 });

    add(
        group,
        meshes,
        new THREE.CylinderGeometry(0.4, 0.4, 0.07, 28),
        standardMaterial(0xf8fafc, { roughness: 0.5 }),
        [0, 0.5, 0],
        [Math.PI / 2, 0, 0],
    );
    add(group, meshes, new THREE.TorusGeometry(0.4, 0.04, 10, 30), metal, [0, 0.5, 0]);
    // Hour and minute hands: one dark, one violet so the face reads at a glance.
    add(
        group,
        meshes,
        new THREE.BoxGeometry(0.22, 0.035, 0.02),
        standardMaterial(0x0f172a),
        [0.08, 0.53, 0.05],
        [0, 0, -0.6],
    );
    add(group, meshes, new THREE.BoxGeometry(0.03, 0.16, 0.02), standardMaterial(0x6d28d9), [0, 0.58, 0.05]);

    for (const side of [-1, 1]) {
        add(
            group,
            meshes,
            new THREE.CylinderGeometry(0.04, 0.05, 0.18, 10),
            metal,
            [side * 0.22, 0.08, 0.1],
            [0.5, 0, 0],
        );
    }

    group.position.set(...position);
    return { group, meshes };
}

/** A-frame hackathon poster standing at the back of the desk. */
function buildPoster(position: [number, number, number]): BuiltPrimitive {
    const group = new THREE.Group();
    const meshes: THREE.Mesh[] = [];
    const rule = standardMaterial(0x94a3b8, { roughness: 0.6 });

    add(group, meshes, new THREE.BoxGeometry(1.08, 1.5, 0.05), standardMaterial(0xfaf7f2), [0, 0.78, 0]);
    add(
        group,
        meshes,
        new THREE.BoxGeometry(1.08, 0.34, 0.055),
        standardMaterial(0x6d28d9, { roughness: 0.4 }),
        [0, 1.36, 0.005],
    );
    for (const y of [1.02, 0.86, 0.7]) {
        add(group, meshes, new THREE.BoxGeometry(0.78, 0.06, 0.06), rule, [0, y, 0.008]);
    }
    add(group, meshes, new THREE.BoxGeometry(1.0, 0.5, 0.05), standardMaterial(0x1e293b), [0, 0.32, 0.008]);
    add(
        group,
        meshes,
        new THREE.BoxGeometry(0.9, 1.2, 0.04),
        standardMaterial(0xd6d3d1),
        [0, 0.6, -0.22],
        [-0.34, 0, 0],
    );

    group.position.set(...position);
    group.rotation.y = -0.22;
    return { group, meshes };
}

/** Rubber duck — the classic debugging companion. */
function buildDuck(position: [number, number, number]): BuiltPrimitive {
    const group = new THREE.Group();
    const meshes: THREE.Mesh[] = [];
    const yellow = standardMaterial(0xfacc15, { roughness: 0.45 });
    const eye = standardMaterial(0x0f172a);

    add(group, meshes, new THREE.SphereGeometry(0.2, 18, 16), yellow, [0, 0.19, 0]);
    add(group, meshes, new THREE.SphereGeometry(0.12, 16, 14), yellow, [0.06, 0.37, 0]);
    add(
        group,
        meshes,
        new THREE.ConeGeometry(0.06, 0.12, 12),
        standardMaterial(0xea580c, { roughness: 0.5 }),
        [0.19, 0.36, 0],
        [0, 0, -Math.PI / 2],
    );
    for (const side of [-1, 1]) {
        add(group, meshes, new THREE.SphereGeometry(0.018, 8, 8), eye, [0.11, 0.41, side * 0.055]);
    }

    group.position.set(...position);
    group.rotation.y = -0.5;
    return { group, meshes };
}

/** Desk plant: the only thing here that grows without a commit. */
function buildPlant(position: [number, number, number]): BuiltPrimitive {
    const group = new THREE.Group();
    const meshes: THREE.Mesh[] = [];
    const leaf = standardMaterial(0x3f7d3f, { roughness: 0.7 });

    add(
        group,
        meshes,
        new THREE.CylinderGeometry(0.22, 0.16, 0.36, 16),
        standardMaterial(0xc2703f, { roughness: 0.8 }),
        [0, 0.18, 0],
    );
    add(
        group,
        meshes,
        new THREE.CylinderGeometry(0.19, 0.19, 0.04, 16),
        standardMaterial(0x4a3728, { roughness: 0.95 }),
        [0, 0.37, 0],
    );

    const leaves: Array<[number, number, number, number]> = [
        [0, 0.62, 0, 0],
        [0.16, 0.55, 0.1, 0.7],
        [-0.17, 0.53, -0.06, -0.7],
        [0.08, 0.5, -0.16, 0.5],
        [-0.1, 0.48, 0.16, -0.5],
    ];
    for (const [x, y, z, tilt] of leaves) {
        add(group, meshes, new THREE.SphereGeometry(0.14, 12, 10), leaf, [x, y, z], [0.35, 0, tilt]);
    }

    group.position.set(...position);
    return { group, meshes };
}

/** Coffee mug: the actual fuel of the sprint. */
function buildMug(position: [number, number, number]): BuiltPrimitive {
    const group = new THREE.Group();
    const meshes: THREE.Mesh[] = [];
    const ceramic = standardMaterial(0xf8fafc, { roughness: 0.4 });

    add(group, meshes, new THREE.CylinderGeometry(0.16, 0.14, 0.34, 18), ceramic, [0, 0.17, 0]);
    add(
        group,
        meshes,
        new THREE.CylinderGeometry(0.13, 0.13, 0.02, 18),
        standardMaterial(0x3b2416, { roughness: 0.9 }),
        [0, 0.335, 0],
    );
    add(
        group,
        meshes,
        new THREE.CylinderGeometry(0.155, 0.155, 0.05, 18),
        standardMaterial(0x6d28d9, { roughness: 0.4 }),
        [0, 0.28, 0],
    );
    add(group, meshes, new THREE.TorusGeometry(0.07, 0.022, 10, 20), ceramic, [0.16, 0.19, 0], [0, Math.PI / 2, 0]);

    group.position.set(...position);
    return { group, meshes };
}

/** Backpack parked on the desk corner. */
function buildBackpack(position: [number, number, number]): BuiltPrimitive {
    const group = new THREE.Group();
    const meshes: THREE.Mesh[] = [];
    const strap = standardMaterial(0x0f172a, { roughness: 0.8 });

    add(
        group,
        meshes,
        new THREE.BoxGeometry(0.78, 0.98, 0.42),
        standardMaterial(0x1e293b, { roughness: 0.75 }),
        [0, 0.49, 0],
    );
    add(
        group,
        meshes,
        new THREE.BoxGeometry(0.6, 0.42, 0.12),
        standardMaterial(0x334155, { roughness: 0.7 }),
        [0, 0.3, 0.26],
    );
    add(
        group,
        meshes,
        new THREE.BoxGeometry(0.5, 0.06, 0.1),
        standardMaterial(0x6d28d9, { roughness: 0.4 }),
        [0, 0.55, 0.26],
    );
    for (const side of [-1, 1]) {
        add(group, meshes, new THREE.BoxGeometry(0.1, 0.7, 0.1), strap, [side * 0.2, 0.7, -0.24], [0.12, 0, 0]);
    }
    add(group, meshes, new THREE.TorusGeometry(0.09, 0.028, 8, 18), strap, [0, 1.02, -0.02]);

    group.position.set(...position);
    group.rotation.y = 0.4;
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
        case "keyboard":
            return buildKeyboard(position);
        case "clock":
            return buildClock(position);
        case "poster":
            return buildPoster(position);
        case "duck":
            return buildDuck(position);
        case "plant":
            return buildPlant(position);
        case "mug":
            return buildMug(position);
        case "backpack":
            return buildBackpack(position);
    }
}
