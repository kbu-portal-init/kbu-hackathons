"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * A minimal Three.js demo that renders a rotating cube.
 *
 * The component is a client‑side only component ("use client") because
 * Three.js requires a browser environment. It sets up a basic scene,
 * camera, renderer, and animation loop, and cleans up on unmount.
 */
export default function RotatingCube() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // --- Scene -----------------------------------------------------------
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x222222);

        // --- Camera ----------------------------------------------------------
        const camera = new THREE.PerspectiveCamera(
            75,
            canvasRef.current.clientWidth / canvasRef.current.clientHeight,
            0.1,
            1000,
        );
        camera.position.z = 2;

        // --- Renderer --------------------------------------------------------
        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            antialias: true,
        });
        renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        // --- Geometry & Material --------------------------------------------
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        // --- Light -----------------------------------------------------------
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);

        // --- Animation loop -----------------------------------------------
        let req: number;
        const animate = () => {
            req = requestAnimationFrame(animate);
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            renderer.render(scene, camera);
        };
        animate();

        // --- Resize handling -----------------------------------------------
        const onResize = () => {
            const width = canvasRef.current?.clientWidth ?? 0;
            const height = canvasRef.current?.clientHeight ?? 0;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };
        window.addEventListener("resize", onResize);

        // --- Cleanup --------------------------------------------------------
        return () => {
            cancelAnimationFrame(req);
            window.removeEventListener("resize", onResize);
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, []);

    return <canvas ref={canvasRef} className="w-full h-96 rounded-md shadow-md" aria-label="Rotating 3D cube" />;
}
