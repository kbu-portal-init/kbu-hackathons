"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type CardImageViewerProps = {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
};

export function CardImageViewer({ src, alt, width = 1200, height = 630, className }: CardImageViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    async function toggleFullscreen() {
        if (!containerRef.current) return;
        if (document.fullscreenElement) {
            await document.exitFullscreen();
            return;
        }
        await containerRef.current.requestFullscreen();
    }

    return (
        <div
            className={`group relative overflow-hidden bg-zinc-950 ${
                isFullscreen ? "flex min-h-screen w-screen items-center justify-center p-4" : ""
            }`}
            ref={containerRef}
        >
            <Image
                alt={alt}
                className={
                    isFullscreen
                        ? "block h-auto max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] w-auto object-contain"
                        : `${className ?? ""} block`
                }
                height={height}
                priority
                src={src}
                unoptimized
                width={width}
            />
            <button
                aria-label={isFullscreen ? "Exit full-screen card view" : "Open full-screen card view"}
                className="absolute right-3 top-3 inline-flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                onClick={toggleFullscreen}
                type="button"
            >
                {isFullscreen ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
            </button>
        </div>
    );
}
