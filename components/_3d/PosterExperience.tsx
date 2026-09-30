"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Poster = { title: string; kicker: string; body: string; href: string; color: string };

const posters: Poster[] = [
    {
        title: "Register Your Team",
        kicker: "01 / BUILD TOGETHER",
        body: "Bring your idea to life with ambitious builders.",
        href: "/register",
        color: "#ff6b2c",
    },
    {
        title: "See Benefits",
        kicker: "02 / POWER YOUR BUILD",
        body: "Unlock tools, cloud credits, and student perks.",
        href: "/resources",
        color: "#7c3aed",
    },
    {
        title: "Announcements",
        kicker: "03 / STAY IN THE LOOP",
        body: "Deadlines, news, and updates from KBU Hub.",
        href: "/announcements",
        color: "#0ea5e9",
    },
    {
        title: "Login",
        kicker: "04 / ENTER YOUR HUB",
        body: "Return to your team workspace and keep building.",
        href: "/login",
        color: "#eab308",
    },
];

function posterTexture(poster: Poster) {
    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 1200;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.CanvasTexture(canvas);
    const gradient = ctx.createLinearGradient(0, 0, 900, 1200);
    gradient.addColorStop(0, "#fffdf7");
    gradient.addColorStop(1, "#e9eef7");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 900, 1200);
    ctx.strokeStyle = poster.color;
    ctx.lineWidth = 12;
    ctx.strokeRect(34, 34, 832, 1132);
    ctx.fillStyle = poster.color;
    ctx.font = "600 28px Arial";
    ctx.fillText(poster.kicker, 90, 130);
    ctx.fillStyle = "#172033";
    ctx.font = "900 76px Arial";
    const words = poster.title.split(" ");
    let line = "";
    let y = 430;
    for (const word of words) {
        const next = `${line} ${word}`.trim();
        if (ctx.measureText(next).width > 710) {
            ctx.fillText(line, 90, y);
            y += 94;
            line = word;
        } else line = next;
    }
    ctx.fillText(line, 90, y);
    ctx.fillStyle = "#526071";
    ctx.font = "32px Arial";
    ctx.fillText(poster.body, 90, 760, 700);
    ctx.fillStyle = poster.color;
    ctx.font = "700 30px Arial";
    ctx.fillText("STEP INSIDE  →", 90, 1040);
    return new THREE.CanvasTexture(canvas);
}

export default function PosterExperience() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selected, setSelected] = useState<number | null>(null);
    const [fallback, setFallback] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        if (
            window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
            window.matchMedia("(max-width: 768px)").matches
        ) {
            setFallback(true);
            return;
        }
        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        } catch {
            setFallback(true);
            return;
        }
        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#dce7f2");
        const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 100);
        camera.position.set(0, 2.2, 10);
        const controls = new OrbitControls(camera, canvas);
        controls.target.set(0, 2.2, 0);
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.minDistance = 5;
        controls.maxDistance = 12;
        controls.minPolarAngle = Math.PI * 0.36;
        controls.maxPolarAngle = Math.PI * 0.62;
        controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
        controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
        canvas.addEventListener("contextmenu", (event) => event.preventDefault());
        scene.add(new THREE.HemisphereLight(0xffffff, 0x9aa8b8, 2.2));
        const overhead = new THREE.DirectionalLight(0xffffff, 3.2);
        overhead.position.set(-4, 10, 6);
        scene.add(overhead);
        const fill = new THREE.PointLight(0xffc46b, 5, 12);
        fill.position.set(0, 4, 0);
        scene.add(fill);
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(22, 22),
            new THREE.MeshStandardMaterial({ color: 0xc7d2df, roughness: 0.72, metalness: 0.05 }),
        );
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);
        const trim = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.15 });
        const wood = new THREE.MeshStandardMaterial({ color: 0x9a6b43, roughness: 0.7 });
        const addBox = (
            size: [number, number, number],
            position: [number, number, number],
            material: THREE.Material,
            rotationY = 0,
        ) => {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
            mesh.position.set(...position);
            mesh.rotation.y = rotationY;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            scene.add(mesh);
            return mesh;
        };
        // Open campus courtyard: lawn, paths, a distant faculty building, and outdoor seating.
        floor.material = new THREE.MeshStandardMaterial({ color: 0x79a95b, roughness: 0.95 });
        addBox([12, 0.08, 2.5], [0, 0.04, 0], new THREE.MeshStandardMaterial({ color: 0xd9c39a, roughness: 0.9 }));
        addBox([2.5, 0.08, 12], [0, 0.05, 0], new THREE.MeshStandardMaterial({ color: 0xd9c39a, roughness: 0.9 }));
        addBox([18, 4.8, 0.5], [0, 2.4, -10], new THREE.MeshStandardMaterial({ color: 0xe9edf2, roughness: 0.8 }));
        addBox([18.5, 0.35, 1.5], [0, 4.95, -10], new THREE.MeshStandardMaterial({ color: 0xc9783e, roughness: 0.7 }));
        addBox([5, 1.4, 0.15], [0, 2.7, -9.7], new THREE.MeshBasicMaterial({ color: 0x24415e }));
        for (const x of [-6, -3, 3, 6])
            addBox([1.5, 2.2, 0.08], [x, 2.2, -9.7], new THREE.MeshBasicMaterial({ color: 0x9fd4e2 }));
        for (const x of [-6.5, 0, 6.5]) {
            addBox([0.12, 3.1, 0.12], [x, 1.55, -2.2], trim);
            const lamp = new THREE.Mesh(
                new THREE.SphereGeometry(0.26, 16, 16),
                new THREE.MeshBasicMaterial({ color: 0xfff0b0 }),
            );
            lamp.position.set(x, 3.2, -2.2);
            scene.add(lamp);
        }
        for (const [x, z] of [
            [-6.5, 3],
            [6.5, 3],
            [-7.5, -7.8],
            [7.5, -7.8],
        ] as const) {
            addBox([2.3, 0.18, 0.65], [x, 0.8, z], wood);
            addBox([0.12, 0.8, 0.12], [x - 0.85, 0.4, z], trim);
            addBox([0.12, 0.8, 0.12], [x + 0.85, 0.4, z], trim);
        }
        // Trees and planters establish the scale of a real university quad.
        for (const [x, z] of [
            [7.6, -7.8],
            [-7.6, -7.8],
            [7.6, 7.4],
            [-7.6, 7.4],
        ] as const) {
            addBox([0.7, 0.55, 0.7], [x, 0.28, z], new THREE.MeshStandardMaterial({ color: 0xc47745, roughness: 0.8 }));
            const leaves = new THREE.Mesh(
                new THREE.DodecahedronGeometry(0.85),
                new THREE.MeshStandardMaterial({ color: 0x2e8b57, roughness: 0.9 }),
            );
            leaves.position.set(x, 1.15, z);
            leaves.scale.set(1, 1.35, 1);
            scene.add(leaves);
        }
        const clickable: THREE.Mesh[] = [];
        const walls = [
            [0, 3.35, -6, 0],
            [6, 3.35, 0, -Math.PI / 2],
            [0, 3.35, 6, Math.PI],
            [-6, 3.35, 0, Math.PI / 2],
        ] as const;
        posters.forEach((poster, index) => {
            const [x, y, z, rotation] = walls[index];
            const frame = new THREE.Mesh(
                new THREE.BoxGeometry(4.15, 5.45, 0.22),
                new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    emissive: poster.color,
                    emissiveIntensity: 0.08,
                    metalness: 0.8,
                    roughness: 0.25,
                }),
            );
            frame.position.set(x, y, z);
            frame.rotation.y = rotation;
            scene.add(frame);
            const art = new THREE.Mesh(
                new THREE.PlaneGeometry(3.6, 5.4),
                new THREE.MeshBasicMaterial({ map: posterTexture(poster) }),
            );
            art.position.set(x, y, z + (index === 0 ? 0.13 : index === 2 ? -0.13 : 0));
            art.rotation.y = rotation;
            scene.add(art);
            clickable.push(frame, art);
            const glow = new THREE.PointLight(new THREE.Color(poster.color), 4, 7);
            glow.position.set(x, y, z);
            scene.add(glow);
        });
        const resize = () => {
            const box = canvas.getBoundingClientRect();
            renderer.setSize(box.width, box.height, false);
            camera.aspect = box.width / box.height;
            camera.updateProjectionMatrix();
        };
        resize();
        window.addEventListener("resize", resize);
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        const click = (event: PointerEvent) => {
            const box = canvas.getBoundingClientRect();
            pointer.x = ((event.clientX - box.left) / box.width) * 2 - 1;
            pointer.y = -((event.clientY - box.top) / box.height) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);
            const hit = raycaster.intersectObjects(clickable)[0];
            if (!hit) return;
            let nearest = 0;
            let distance = Infinity;
            walls.forEach(([x, , z], index) => {
                const next = Math.hypot(hit.object.position.x - x, hit.object.position.z - z);
                if (next < distance) {
                    distance = next;
                    nearest = index;
                }
            });
            setSelected(nearest);
        };
        canvas.addEventListener("pointerup", click);
        let animation = 0;
        const render = () => {
            controls.update();
            renderer.render(scene, camera);
            animation = requestAnimationFrame(render);
        };
        render();
        return () => {
            cancelAnimationFrame(animation);
            window.removeEventListener("resize", resize);
            canvas.removeEventListener("pointerup", click);
            controls.dispose();
            renderer.dispose();
        };
    }, []);

    useEffect(() => {
        const move = (delta: number) => setSelected((current) => Math.max(0, Math.min(3, (current ?? 0) + delta)));
        const wheel = (event: WheelEvent) => {
            event.preventDefault();
            if (Math.abs(event.deltaY) > 8) move(event.deltaY > 0 ? 1 : -1);
        };
        const key = (event: KeyboardEvent) => {
            if (["ArrowDown", "ArrowRight", "PageDown"].includes(event.key)) {
                event.preventDefault();
                move(1);
            } else if (["ArrowUp", "ArrowLeft", "PageUp"].includes(event.key)) {
                event.preventDefault();
                move(-1);
            } else if (event.key === "Escape") {
                setSelected(null);
            }
        };
        const node = canvasRef.current?.parentElement;
        node?.addEventListener("wheel", wheel, { passive: false });
        window.addEventListener("keydown", key);
        return () => {
            node?.removeEventListener("wheel", wheel);
            window.removeEventListener("keydown", key);
        };
    }, []);

    if (fallback) return <Fallback />;
    return (
        <div className="relative h-full w-full overflow-hidden bg-[#dce7f2]">
            <canvas
                ref={canvasRef}
                className="absolute inset-0 h-full w-full"
                aria-label="First-person 3D room surrounded by four interactive posters"
            />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(5,5,9,.7)_100%)]" />
            <header className="absolute left-1/2 top-8 z-10 -translate-x-1/2 text-center text-slate-900">
                <p className="font-mono text-[10px] tracking-[.32em] text-orange-600">KBU HUB / 2026</p>
                <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Find your way in.</h1>
                <p className="mt-2 text-sm text-slate-600">
                    Right-click and drag to look around · click a poster to enter
                </p>
            </header>
            <div className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/10 bg-black/45 px-4 py-2 font-mono text-[10px] tracking-widest text-zinc-400 backdrop-blur">
                RIGHT-CLICK + DRAG TO ROTATE
            </div>
            {selected !== null && (
                <div className="absolute bottom-20 left-1/2 z-20 w-[min(25rem,calc(100%-2rem))] -translate-x-1/2 rounded-2xl border border-orange-500/40 bg-zinc-950/90 p-5 text-white shadow-2xl backdrop-blur-xl">
                    <p className="font-mono text-xs tracking-widest" style={{ color: posters[selected].color }}>
                        {posters[selected].kicker}
                    </p>
                    <h2 className="mt-2 text-2xl font-black">{posters[selected].title}</h2>
                    <p className="mt-2 text-sm text-zinc-400">{posters[selected].body}</p>
                    <Link
                        href={posters[selected].href}
                        className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-orange-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-500 focus-visible:outline-2 focus-visible:outline-white"
                    >
                        Enter {posters[selected].title} →
                    </Link>
                </div>
            )}
        </div>
    );
}

function Fallback() {
    return (
        <main className="h-full overflow-auto bg-[#050509] p-6 text-white sm:p-12">
            <div className="mx-auto max-w-5xl">
                <p className="font-mono text-xs tracking-[.32em] text-orange-400">KBU HUB / ACCESS</p>
                <h1 className="mt-4 text-4xl font-black">Find your way in.</h1>
                <p className="mt-3 text-zinc-400">Choose a destination to continue.</p>
                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                    {posters.map((poster) => (
                        <Link
                            key={poster.title}
                            href={poster.href}
                            className="rounded-2xl border bg-zinc-950 p-6 transition hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-white"
                            style={{ borderColor: `${poster.color}99` }}
                        >
                            <p className="font-mono text-xs" style={{ color: poster.color }}>
                                {poster.kicker}
                            </p>
                            <h2 className="mt-3 text-2xl font-black">{poster.title}</h2>
                            <p className="mt-2 text-sm text-zinc-400">{poster.body}</p>
                            <span className="mt-7 inline-block font-bold" style={{ color: poster.color }}>
                                Enter →
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
