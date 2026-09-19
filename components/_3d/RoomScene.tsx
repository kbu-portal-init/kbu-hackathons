"use client";

import { type ForwardedRef, forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { RoomObject } from "./room-objects";
import { buildPrimitive } from "./room-primitives";

export type RoomSceneHandle = {
    /** Trigger the same focus/activation flow as clicking the object in-scene. */
    activate: (id: string | null) => void;
};

type RoomSceneProps = {
    objects: RoomObject[];
    /** Interaction (hover/click) is only enabled while active. */
    active: boolean;
    onHover?: (id: string | null) => void;
    /** Raised for route objects; the overlay answers with a focus card. */
    onSelect?: (id: string | null) => void;
    /** Raised when a non-navigation action runs (e.g. the lamp toggled). */
    onAction?: (id: string, on: boolean) => void;
    onProgress?: (loaded: number, total: number) => void;
    onReady?: () => void;
    onError?: () => void;
    className?: string;
};

const MODEL_URL = "/models/office-desk.glb";

const DEFAULT_CAMERA = new THREE.Vector3(5.0, 6.4, 10.6);
const DEFAULT_TARGET = new THREE.Vector3(0, 4.4, 3.6);
const HOVER_EMISSIVE = new THREE.Color(0x22d3ee);
const COLOR_BLACK = new THREE.Color(0x000000);
const HOVER_INTENSITY = 0.45;
const LAMP_HEAD = new THREE.Vector3(2.7, 8.0, 4.5);

const RoomScene = forwardRef<RoomSceneHandle, RoomSceneProps>(function RoomScene(
    { objects, active, onHover, onSelect, onAction, onProgress, onReady, onError, className }: RoomSceneProps,
    ref: ForwardedRef<RoomSceneHandle>,
) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const activateRef = useRef<(id: string | null) => void>(() => {});

    useImperativeHandle(ref, () => ({
        activate: (id: string | null) => activateRef.current(id),
    }));

    // Latest props are read inside the animation loop through refs so the loop
    // never closes over stale callbacks.
    const activeRef = useRef(active);
    const onHoverRef = useRef(onHover);
    const onSelectRef = useRef(onSelect);
    const onActionRef = useRef(onAction);
    const onProgressRef = useRef(onProgress);
    const onReadyRef = useRef(onReady);
    const onErrorRef = useRef(onError);
    activeRef.current = active;
    onHoverRef.current = onHover;
    onSelectRef.current = onSelect;
    onActionRef.current = onAction;
    onProgressRef.current = onProgress;
    onReadyRef.current = onReady;
    onErrorRef.current = onError;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const container = canvas.parentElement;
        if (!container) return;

        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const isMobile = window.matchMedia("(max-width: 768px)").matches;

        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        } catch {
            onErrorRef.current?.();
            return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        renderer.shadowMap.enabled = !isMobile;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        camera.position.copy(DEFAULT_CAMERA);

        const controls = new OrbitControls(camera, canvas);
        controls.target.copy(DEFAULT_TARGET);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.enablePan = false;
        controls.minDistance = 5;
        controls.maxDistance = 16;
        controls.minPolarAngle = 0.25;
        controls.maxPolarAngle = Math.PI * 0.52;
        controls.rotateSpeed = 0.55;

        // Cool "developer studio" lighting: a daylight key with soft shadows,
        // a cyan-tinted fill, and a dim hemispherical bounce. The desk lamp
        // below stays warm amber as an intentional accent.
        const hemisphere = new THREE.HemisphereLight(0xd6ecf7, 0x0b1220, 0.55);
        scene.add(hemisphere);

        const keyLight = new THREE.DirectionalLight(0xeaf4ff, 1.5);
        keyLight.position.set(6, 9.5, 7.5);
        if (renderer.shadowMap.enabled) {
            keyLight.castShadow = true;
            keyLight.shadow.mapSize.set(2048, 2048);
            keyLight.shadow.bias = -0.0004;
            keyLight.shadow.radius = 4;
            const shadowCamera = keyLight.shadow.camera;
            shadowCamera.left = -8;
            shadowCamera.right = 8;
            shadowCamera.top = 8;
            shadowCamera.bottom = -8;
            shadowCamera.near = 0.5;
            shadowCamera.far = 30;
        }
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0x7dd3fc, 0.4);
        fillLight.position.set(-7, 5, -4);
        scene.add(fillLight);

        // Desk lamp light, off until the lamp object is toggled.
        const lampLight = new THREE.PointLight(0xffb45e, 0, 9, 2);
        lampLight.position.copy(LAMP_HEAD);
        scene.add(lampLight);
        let lampOn = false;

        // --- Interactive object registry -------------------------------------
        const interactiveMeshes: THREE.Mesh[] = [];
        const focusPoints = new Map<string, THREE.Vector3>();
        const emissiveTargets = new Map<THREE.Mesh, { color: THREE.Color; intensity: number }>();
        const hoveredState = { id: null as string | null };

        function tagMesh(mesh: THREE.Mesh, id: string) {
            if (mesh.userData.roomObjectId) return;
            mesh.userData.roomObjectId = id;
            // Clone so the hover emissive never bleeds into shared GLB materials.
            const source = mesh.material;
            mesh.material = Array.isArray(source) ? source.map((material) => material.clone()) : source.clone();
            interactiveMeshes.push(mesh);
        }

        function registerObject(id: string, meshes: THREE.Mesh[]) {
            const box = new THREE.Box3();
            for (const mesh of meshes) box.expandByObject(mesh);
            const center = box.getCenter(new THREE.Vector3());
            focusPoints.set(id, center);
            for (const mesh of meshes) {
                tagMesh(mesh, id);
                mesh.traverse((child) => {
                    if (child instanceof THREE.Mesh) tagMesh(child, id);
                });
            }
        }

        // --- Model loading ---------------------------------------------------
        const manager = new THREE.LoadingManager();
        manager.onProgress = (_url, loaded, total) => onProgressRef.current?.(loaded, total);
        const loader = new GLTFLoader(manager);

        let mixer: THREE.AnimationMixer | null = null;
        const disposables: { dispose: () => void }[] = [];

        loader.load(
            MODEL_URL,
            (gltf) => {
                const model = gltf.scene;
                model.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                scene.add(model);
                disposables.push(model);

                if (gltf.animations.length > 0) {
                    mixer = new THREE.AnimationMixer(model);
                    mixer.clipAction(gltf.animations[0]).play();
                }

                for (const object of objects) {
                    if (object.anchor.kind === "model") {
                        const meshes: THREE.Mesh[] = [];
                        for (const name of object.anchor.nodeNames) {
                            const node = model.getObjectByName(name);
                            if (!node) continue;
                            node.traverse((child) => {
                                if (child instanceof THREE.Mesh) meshes.push(child);
                            });
                        }
                        if (meshes.length > 0) registerObject(object.id, meshes);
                    } else {
                        const built = buildPrimitive(object.anchor.shape, object.anchor.position);
                        model.add(built.group);
                        disposables.push(built.group);
                        registerObject(object.id, built.meshes);
                    }
                }

                onReadyRef.current?.();
            },
            undefined,
            () => onErrorRef.current?.(),
        );

        // --- Interaction (raycasting against registered meshes) --------------
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        const downPosition = new THREE.Vector2();
        const DRAG_THRESHOLD = 6;

        const setPointer = (event: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        };

        function hitTest(): string | null {
            raycaster.setFromCamera(pointer, camera);
            const hits = raycaster.intersectObjects(interactiveMeshes, false);
            return hits.length > 0 ? (hits[0].object.userData.roomObjectId as string) : null;
        }

        const setHovered = (id: string | null) => {
            if (id === hoveredState.id) return;
            hoveredState.id = id;
            for (const mesh of interactiveMeshes) {
                const material = mesh.material;
                if (material instanceof THREE.MeshStandardMaterial) {
                    emissiveTargets.set(mesh, {
                        color: mesh.userData.roomObjectId === id ? HOVER_EMISSIVE : COLOR_BLACK,
                        intensity: mesh.userData.roomObjectId === id ? HOVER_INTENSITY : 0,
                    });
                }
            }
            canvas.style.cursor = id ? "pointer" : activeRef.current ? "grab" : "default";
            onHoverRef.current?.(id);
        };

        function focusObject(id: string) {
            const center = focusPoints.get(id);
            if (!center) return;
            if (reducedMotion) {
                controls.target.copy(center);
                return;
            }
            focusAnimation.targetPoint = center.clone();
            // Frame from the current viewpoint, keeping the distance inside the
            // orbit range so re-enabling controls does not snap the camera.
            const distance = THREE.MathUtils.clamp(
                camera.position.distanceTo(center),
                controls.minDistance + 0.5,
                controls.maxDistance,
            );
            const direction = camera.position.clone().sub(center).normalize();
            focusAnimation.cameraPoint = center.clone().add(direction.multiplyScalar(distance));
            focusAnimation.cameraPoint.y = Math.max(2.6, focusAnimation.cameraPoint.y);
            focusAnimation.active = true;
            controls.enabled = false;
        }

        const focusAnimation = { active: false, targetPoint: new THREE.Vector3(), cameraPoint: new THREE.Vector3() };

        function selectObject(id: string | null) {
            if (!id) {
                setHovered(null);
                onSelectRef.current?.(null);
                return;
            }
            const object = objects.find((candidate) => candidate.id === id);
            if (!object) return;
            focusObject(id);
            if (object.action === "toggle-lamp") {
                lampOn = !lampOn;
                lampLight.intensity = lampOn ? 1.6 : 0;
                onActionRef.current?.(object.id, lampOn);
            } else {
                onSelectRef.current?.(object.id);
            }
        }

        function onPointerMove(event: PointerEvent) {
            if (!activeRef.current) return;
            setPointer(event);
            setHovered(hitTest());
        }

        function onPointerDown(event: PointerEvent) {
            downPosition.set(event.clientX, event.clientY);
        }

        function onPointerUp(event: PointerEvent) {
            if (!activeRef.current) return;
            const moved = Math.hypot(event.clientX - downPosition.x, event.clientY - downPosition.y);
            if (moved > DRAG_THRESHOLD) return;
            setPointer(event);
            selectObject(hitTest());
        }

        function onPointerLeave() {
            setHovered(null);
        }

        canvas.addEventListener("pointermove", onPointerMove);
        canvas.addEventListener("pointerdown", onPointerDown);
        canvas.addEventListener("pointerup", onPointerUp);
        canvas.addEventListener("pointerleave", onPointerLeave);

        activateRef.current = selectObject;

        // --- Sizing ----------------------------------------------------------
        const resize = () => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            if (width === 0 || height === 0) return;
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };
        resize();
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(container);

        // --- Render loop -----------------------------------------------------
        // Timer replaces the deprecated THREE.Clock (deprecated in r183).
        // update() must run once per frame before getDelta(); the first delta
        // is 0, which matches the old Clock's auto-start behaviour.
        const timer = new THREE.Timer();
        let frame = 0;
        let visible = true;

        // Route every visibility change through one helper. Resetting on the
        // false -> true transition keeps the mixer from receiving one huge
        // "away" delta when the tab or the canvas scrolls back into view.
        const setVisible = (next: boolean) => {
            if (next && !visible) timer.reset();
            visible = next;
        };

        const onVisibilityChange = () => {
            setVisible(document.visibilityState === "visible");
        };
        document.addEventListener("visibilitychange", onVisibilityChange);

        const intersectionObserver = new IntersectionObserver((entries) => {
            setVisible(entries[0]?.isIntersecting ?? true);
        });
        intersectionObserver.observe(canvas);

        function animate() {
            frame = requestAnimationFrame(animate);
            if (!visible) return;

            timer.update();
            const delta = timer.getDelta();
            mixer?.update(delta);

            // Slow drift while the visitor decides to enter; stops on entry.
            controls.autoRotate = !activeRef.current && !reducedMotion;
            controls.autoRotateSpeed = 0.45;

            if (focusAnimation.active) {
                controls.target.lerp(focusAnimation.targetPoint, 0.09);
                camera.position.lerp(focusAnimation.cameraPoint, 0.09);
                if (camera.position.distanceTo(focusAnimation.cameraPoint) < 0.05) {
                    focusAnimation.active = false;
                    controls.enabled = true;
                }
            }

            // Smooth emissive transitions toward the hover target.
            for (const [mesh, target] of emissiveTargets) {
                const material = mesh.material;
                if (material instanceof THREE.MeshStandardMaterial) {
                    material.emissive.lerp(target.color, 0.15);
                    material.emissiveIntensity = THREE.MathUtils.lerp(
                        material.emissiveIntensity,
                        target.intensity,
                        0.15,
                    );
                }
            }

            controls.update();
            renderer.render(scene, camera);
        }
        animate();

        // --- Cleanup ---------------------------------------------------------
        return () => {
            cancelAnimationFrame(frame);
            activateRef.current = () => {};
            canvas.removeEventListener("pointermove", onPointerMove);
            canvas.removeEventListener("pointerdown", onPointerDown);
            canvas.removeEventListener("pointerup", onPointerUp);
            canvas.removeEventListener("pointerleave", onPointerLeave);
            document.removeEventListener("visibilitychange", onVisibilityChange);
            resizeObserver.disconnect();
            intersectionObserver.disconnect();
            controls.dispose();
            for (const disposable of disposables) disposable.dispose();
            for (const mesh of interactiveMeshes) {
                const material = mesh.material;
                if (Array.isArray(material)) {
                    for (const entry of material) entry.dispose();
                } else {
                    material.dispose();
                }
            }
            renderer.dispose();
        };
        // Runs once: every other prop is read through refs, and `objects` is the
        // module-level roomObjects array whose identity never changes. Rebuilding
        // on a parent render would reload the GLB and reset the camera.
    }, [objects]);

    return <canvas ref={canvasRef} className={className} aria-label="Interactive 3D KBU hackathon workspace" />;
});

export default RoomScene;
