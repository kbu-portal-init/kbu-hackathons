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
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 glass">
                <Loader2 className="size-7 animate-spin text-cyan-700" aria-hidden />
                <p className="text-sm font-medium text-foreground">
                    Preparing the workspace… {Math.round(progress * 100)}%
                </p>
                <div className="h-1.5 w-44 overflow-hidden rounded-full bg-slate-200">
                    <div
                        className="h-full rounded-full bg-gradient-accent transition-[width] duration-200"
                        style={{ width: `${Math.max(4, progress * 100)}%` }}
                    />
                </div>
            </div>
        );
    }

    if (phase === "error") {
        return (
            <div className="absolute inset-0 flex flex-col gap-3 glass p-6">
                <p className="text-sm font-semibold text-foreground">3D preview unavailable</p>
                <p className="text-sm text-muted-foreground">
                    Your browser or device doesn’t support WebGL, so here’s the workspace as a list.
                </p>
                <ObjectList objects={objects} onActivate={onActivate} />
            </div>
        );
    }

    return (
        <>
            {phase === "ready" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 glass">
                    <p className="max-w-xs text-center text-sm text-muted-foreground">
                        A digital KBU hackathon workspace. Look around, then step in to explore.
                    </p>
                    <button
                        type="button"
                        onClick={onEnter}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-accent px-6 py-3 font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:shadow-violet-500/50"
                    >
                        Enter the workspace <ArrowRight className="size-4" />
                    </button>
                </div>
            )}

            {phase === "active" && (
                <>
                    <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2">
                        {hoveredObject ? (
                            <p className="rounded-full bg-secondary/90 px-4 py-1.5 text-sm font-medium text-foreground shadow-md">
                                {hoveredObject.label}
                            </p>
                        ) : null}
                    </div>

                    <div className="pointer-events-none absolute bottom-3 left-3 hidden items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-medium text-muted-foreground sm:flex">
                        <Move3d className="size-3.5" /> Drag to look · tap an object to explore
                    </div>

                    <div className="absolute right-3 top-3 flex flex-col items-end gap-2">
                        <button
                            type="button"
                            onClick={() => setListOpen((open) => !open)}
                            aria-expanded={listOpen}
                            className="inline-flex items-center gap-2 rounded-full glass-violet px-3.5 py-1.5 text-sm font-semibold text-foreground transition hover:border-violet-500"
                        >
                            {listOpen ? <X className="size-4" /> : <Lightbulb className="size-4" />}
                            {listOpen ? "Hide" : "Explore"}
                        </button>
                        {listOpen ? (
                            <div className="max-h-64 overflow-y-auto rounded-2xl glass-violet p-2 shadow-xl">
                                <ObjectList objects={objects} onActivate={onActivate} />
                            </div>
                        ) : null}
                    </div>
                </>
            )}

            {selectedObject ? (
                <div className="absolute bottom-4 left-1/2 w-[min(20rem,calc(100%-2rem))] -translate-x-1/2">
                    <div className="rounded-2xl glass-violet p-4 shadow-xl shadow-violet-500/20">
                        <div className="flex items-start justify-between gap-3">
                            <h2 className="font-bold tracking-tight text-foreground">{selectedObject.label}</h2>
                            <button
                                type="button"
                                onClick={onDismiss}
                                aria-label="Dismiss"
                                className="rounded-full p-1 text-muted-foreground transition hover:bg-slate-200 hover:text-foreground"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                        <p className="mt-1.5 text-sm text-muted-foreground">{selectedObject.description}</p>
                        {selectedObject.route ? (
                            <button
                                type="button"
                                onClick={() => onOpen(selectedObject.route as string)}
                                className="mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-violet-500/30"
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
                        className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground transition hover:bg-slate-100 hover:text-cyan-700"
                    >
                        {object.label}
                    </button>
                </li>
            ))}
        </ul>
    );
}
