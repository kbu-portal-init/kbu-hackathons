"use client";

import { useEffect, useRef } from "react";
import { heroParallax } from "./_3d/hero-parallax";

/**
 * Lazily loads GSAP + ScrollTrigger (code-split out of the initial bundle) and
 * wires the homepage scroll effects once they are available:
 *
 * - fade + translateY(24px → 0) reveals on every `[data-reveal]`
 * - per-group staggering (80–100ms) via `[data-reveal-group]`
 * - scroll-linked parallax for the 3D hero, read from a ScrollTrigger and
 *   consumed inside the existing three.js render loop
 *
 * `prefers-reduced-motion` skips all of it: the page is served in its final
 * state instead. Reveal elements stay visible until this module adds
 * `.fx-armed` to <html>, so no-JS visitors never get invisible content.
 */

type ScrollFxOptions = {
    /** Set false on pages that only want the 3D parallax (default true). */
    reveals?: boolean;
};

export default function ScrollFx({ reveals = true }: ScrollFxOptions) {
    // Static flags are read through refs so the effect runs once per mount.
    const revealsRef = useRef(reveals);
    revealsRef.current = reveals;

    useEffect(() => {
        const heroSection = document.querySelector<HTMLElement>("[data-hero-parallax]");
        const revealTargets = revealsRef.current
            ? document.querySelectorAll<HTMLElement>("[data-reveal]")
            : ([] as unknown as NodeListOf<HTMLElement>);
        if (revealTargets.length === 0 && !heroSection) return;

        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        // Reduced motion: serve the static final state and touch nothing else.
        if (reducedMotion) {
            for (const target of revealTargets) target.style.opacity = "1";
            return;
        }

        let killed = false;
        let cleanup = () => {};

        // Client-only import keeps GSAP out of the server bundle.
        import("gsap")
            .then(({ gsap }) => {
                if (killed) return;
                return import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
                    if (killed) return;

                    gsap.registerPlugin(ScrollTrigger);

                    // Arm the hidden initial state only now that JS can reveal it.
                    document.documentElement.classList.add("fx-armed");

                    const triggers: ScrollTrigger[] = [];

                    // --- Section reveals -------------------------------------
                    // Skip elements inside a group: they animate as one
                    // staggered set below instead of individually.
                    for (const target of revealTargets) {
                        if (target.closest("[data-reveal-group]")) continue;

                        const tween = gsap.fromTo(
                            target,
                            { opacity: 0, y: 24 },
                            {
                                opacity: 1,
                                y: 0,
                                duration: 0.6,
                                ease: "power2.out",
                                scrollTrigger: {
                                    trigger: target,
                                    start: "top 85%",
                                    toggleActions: "play none none none",
                                },
                            },
                        );
                        if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
                    }

                    // --- Staggered card groups -------------------------------
                    const groups = document.querySelectorAll<HTMLElement>("[data-reveal-group]");
                    for (const group of groups) {
                        const children = Array.from(group.querySelectorAll<HTMLElement>("[data-reveal]"));
                        if (children.length === 0) continue;

                        const tween = gsap.fromTo(
                            children,
                            { opacity: 0, y: 24 },
                            {
                                opacity: 1,
                                y: 0,
                                duration: 0.6,
                                ease: "power2.out",
                                stagger: 0.08,
                                scrollTrigger: {
                                    trigger: group,
                                    start: "top 85%",
                                    toggleActions: "play none none none",
                                },
                            },
                        );
                        if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
                    }

                    // --- 3D hero parallax -------------------------------------
                    // Writes scroll progress into the shared singleton; the
                    // three.js render loop consumes it so the parallax stays
                    // in sync with the frame budget instead of running
                    // per-scroll event.
                    if (heroSection) {
                        const st = ScrollTrigger.create({
                            trigger: heroSection,
                            start: "top top",
                            end: "bottom top",
                            onUpdate: (self) => {
                                heroParallax.current = self.progress;
                            },
                        });
                        triggers.push(st);
                    }

                    cleanup = () => {
                        for (const trigger of triggers) trigger.kill();
                        gsap.killTweensOf(revealTargets);
                        document.documentElement.classList.remove("fx-armed");
                    };
                });
            })
            .catch(() => {
                // GSAP failed to load: fall back to the visible final state.
                for (const target of revealTargets) target.style.opacity = "1";
            });

        return () => {
            killed = true;
            cleanup();
        };
    }, []);

    return null;
}
