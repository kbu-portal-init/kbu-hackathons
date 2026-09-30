import type { Metadata } from "next";
import PosterExperience from "@/components/_3d/PosterExperience";

export const metadata: Metadata = {
    title: "KBU Hub Experience",
    description: "Explore the KBU Hub through an immersive four-poster room.",
};

export default function ExperiencePage() {
    return (
        <main className="h-full w-full">
            <PosterExperience />
        </main>
    );
}
