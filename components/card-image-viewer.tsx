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

export function CardImageViewer({ src, alt, width = 1600, height = 960, className }: CardImageViewerProps) {
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

    function handleImageClick() {
        if (window.matchMedia("(max-width: 639px)").matches) {
            void toggleFullscreen();
        }
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
                        : `${className ?? ""} block cursor-pointer sm:cursor-default`
                }
                height={height}
                priority
                src={src}
                unoptimized
                width={width}
                onClick={handleImageClick}
            />
            <button
                aria-label={isFullscreen ? "Exit full-screen card view" : "Open full-screen card view"}
                className={`absolute right-3 top-3 inline-flex size-10 cursor-pointer items-center justify-center rounded-full backdrop-blur transition sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100 ${
                    isFullscreen
                        ? "border border-white/25 bg-black/80 text-white shadow-md hover:bg-black"
                        : "border border-white/25 bg-black/60 text-white hover:border-white/40 hover:bg-black/80"
                }`}
                onClick={toggleFullscreen}
                type="button"
            >
                {isFullscreen ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
            </button>
        </div>
    );
}
