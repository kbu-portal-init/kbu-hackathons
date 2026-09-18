"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import RoomOverlay, { type RoomPhase } from "./RoomOverlay";
import RoomScene, { type RoomSceneHandle } from "./RoomScene";
import { roomObjects } from "./room-objects";

type Toast = { id: string; message: string };

export default function RoomExperience() {
    const router = useRouter();
    const sceneRef = useRef<RoomSceneHandle>(null);
    const [phase, setPhase] = useState<RoomPhase>("loading");
    const [progress, setProgress] = useState(0);
    const [hovered, setHovered] = useState<string | null>(null);
    const [selected, setSelected] = useState<string | null>(null);
    const [toast, setToast] = useState<Toast | null>(null);

    const handleAction = useCallback((id: string, on: boolean) => {
        const object = roomObjects.find((candidate) => candidate.id === id);
        if (object) setToast({ id, message: `${object.label} ${on ? "on" : "off"}` });
    }, []);

    // Toasts for non-navigation actions auto-dismiss.
    useEffect(() => {
        if (!toast) return;
        const timeout = setTimeout(() => setToast(null), 2200);
        return () => clearTimeout(timeout);
    }, [toast]);

    // Keyboard users can dismiss the focus card without touching the canvas.
    useEffect(() => {
        if (!selected) return;
        const onKeyUp = (event: KeyboardEvent) => {
            if (event.key === "Escape") setSelected(null);
        };
        window.addEventListener("keyup", onKeyUp);
        return () => window.removeEventListener("keyup", onKeyUp);
    }, [selected]);

    return (
        <div className="relative h-72 w-full overflow-hidden rounded-3xl border border-orange-200 bg-gradient-to-b from-orange-50 to-white shadow-xl shadow-orange-200/40 sm:h-80 lg:h-[30rem] dark:border-orange-900 dark:from-orange-950/30 dark:to-zinc-950 dark:shadow-none">
            <RoomScene
                ref={sceneRef}
                objects={roomObjects}
                active={phase === "active"}
                onHover={setHovered}
                onSelect={setSelected}
                onAction={handleAction}
                onProgress={(_loaded, total) => setProgress(total ? _loaded / total : 0)}
                onReady={() => setPhase("ready")}
                onError={() => setPhase("error")}
                className="absolute inset-0 h-full w-full"
            />
            <RoomOverlay
                phase={phase}
                progress={progress}
                hovered={hovered}
                selected={selected}
                objects={roomObjects}
                onEnter={() => setPhase("active")}
                onActivate={(id) => {
                    setSelected(null);
                    sceneRef.current?.activate(id);
                }}
                onOpen={(route) => router.push(route)}
                onDismiss={() => setSelected(null)}
            />
            {toast ? (
                <p
                    role="status"
                    className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-zinc-900/90 px-4 py-1.5 text-sm font-medium text-white shadow-md"
                >
                    {toast.message}
                </p>
            ) : null}
        </div>
    );
}
