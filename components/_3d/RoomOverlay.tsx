"use client";

import { ArrowRight, Lightbulb, Loader2, Move3d, X } from "lucide-react";
import { useState } from "react";
import type { RoomObject } from "./room-objects";

export type RoomPhase = "loading" | "ready" | "active" | "error";

type RoomOverlayProps = {
    phase: RoomPhase;
    progress: number;
    hovered: string | null;
    selected: string | null;
    objects: RoomObject[];
    onEnter: () => void;
    onActivate: (id: string) => void;
    onOpen: (route: string) => void;
    onDismiss: () => void;
};

export default function RoomOverlay({
    phase,
    progress,
    hovered,
    selected,
    objects,
    onEnter,
    onActivate,
    onOpen,
    onDismiss,
}: RoomOverlayProps) {
    const [listOpen, setListOpen] = useState(false);
    const selectedObject = selected ? objects.find((object) => object.id === selected) : null;
    const hoveredObject = hovered ? objects.find((object) => object.id === hovered) : null;

    if (phase === "loading") {
        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/70 backdrop-blur-sm dark:bg-zinc-950/70">
                <Loader2 className="size-7 animate-spin text-orange-600" aria-hidden />
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                    Preparing the workspace… {Math.round(progress * 100)}%
                </p>
                <div className="h-1.5 w-44 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                        className="h-full rounded-full bg-orange-600 transition-[width] duration-200"
                        style={{ width: `${Math.max(4, progress * 100)}%` }}
                    />
                </div>
            </div>
        );
    }

    if (phase === "error") {
        return (
            <div className="absolute inset-0 flex flex-col gap-3 bg-white/85 p-6 backdrop-blur-sm dark:bg-zinc-950/85">
                <p className="text-sm font-semibold">3D preview unavailable</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    Your browser or device doesn’t support WebGL, so here’s the workspace as a list.
                </p>
                <ObjectList objects={objects} onActivate={onActivate} />
            </div>
        );
    }

    return (
        <>
            {phase === "ready" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/55 backdrop-blur-[2px] dark:bg-zinc-950/55">
                    <p className="max-w-xs text-center text-sm text-zinc-600 dark:text-zinc-300">
                        A digital KBU hackathon workspace. Look around, then step in to explore.
                    </p>
                    <button
                        type="button"
                        onClick={onEnter}
                        className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-700"
                    >
                        Enter the workspace <ArrowRight className="size-4" />
                    </button>
                </div>
            )}

            {phase === "active" && (
                <>
                    <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2">
                        {hoveredObject ? (
                            <p className="rounded-full bg-zinc-900/85 px-4 py-1.5 text-sm font-medium text-white shadow-md">
                                {hoveredObject.label}
                            </p>
                        ) : null}
                    </div>

                    <div className="pointer-events-none absolute bottom-3 left-3 hidden items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-zinc-600 backdrop-blur-sm dark:bg-zinc-900/80 dark:text-zinc-300 sm:flex">
                        <Move3d className="size-3.5" /> Drag to look · tap an object to explore
                    </div>

                    <div className="absolute right-3 top-3 flex flex-col items-end gap-2">
                        <button
                            type="button"
                            onClick={() => setListOpen((open) => !open)}
                            aria-expanded={listOpen}
                            className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/90 px-3.5 py-1.5 text-sm font-semibold text-orange-700 shadow-sm backdrop-blur-sm transition hover:bg-white dark:border-orange-900 dark:bg-zinc-900/90 dark:text-orange-300"
                        >
                            {listOpen ? <X className="size-4" /> : <Lightbulb className="size-4" />}
                            {listOpen ? "Hide" : "Explore"}
                        </button>
                        {listOpen ? (
                            <div className="max-h-64 overflow-y-auto rounded-2xl border border-orange-200 bg-white/95 p-2 shadow-xl backdrop-blur-sm dark:border-orange-900 dark:bg-zinc-900/95">
                                <ObjectList objects={objects} onActivate={onActivate} />
                            </div>
                        ) : null}
                    </div>
                </>
            )}

            {selectedObject ? (
                <div className="absolute bottom-4 left-1/2 w-[min(20rem,calc(100%-2rem))] -translate-x-1/2">
                    <div className="rounded-2xl border border-orange-200 bg-white/95 p-4 shadow-xl shadow-orange-200/40 backdrop-blur-sm dark:border-orange-900 dark:bg-zinc-900/95 dark:shadow-none">
                        <div className="flex items-start justify-between gap-3">
                            <h2 className="font-bold tracking-tight">{selectedObject.label}</h2>
                            <button
                                type="button"
                                onClick={onDismiss}
                                aria-label="Dismiss"
                                className="rounded-full p-1 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                        <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-300">{selectedObject.description}</p>
                        {selectedObject.route ? (
                            <button
                                type="button"
                                onClick={() => onOpen(selectedObject.route as string)}
                                className="mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
                            >
                                Open {selectedObject.label} <ArrowRight className="size-4" />
                            </button>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </>
    );
}

function ObjectList({ objects, onActivate }: { objects: RoomObject[]; onActivate: (id: string) => void }) {
    return (
        <ul className="flex flex-col gap-1">
            {objects.map((object) => (
                <li key={object.id}>
                    <button
                        type="button"
                        onClick={() => onActivate(object.id)}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-700 transition hover:bg-orange-50 hover:text-orange-700 dark:text-zinc-200 dark:hover:bg-orange-950/30 dark:hover:text-orange-300"
                    >
                        {object.label}
                    </button>
                </li>
            ))}
        </ul>
    );
}
