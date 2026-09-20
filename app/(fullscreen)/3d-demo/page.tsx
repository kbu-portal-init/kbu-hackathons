import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import RoomExperience from "@/components/_3d/RoomExperience";

/**
 * Immersive 3D workspace as a standalone, full-viewport page. No site chrome —
 * the room owns the screen, the overlay drives the interaction.
 */
export default function ThreeDemoPage() {
    return (
        <main className="relative h-full w-full">
            <RoomExperience className="h-full w-full" />
            <div className="pointer-events-none absolute left-4 top-4 sm:left-6 sm:top-6">
                <Link
                    href="/"
                    className="pointer-events-auto inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium text-foreground transition hover:text-cyan-400"
                >
                    <ArrowLeft className="size-4" /> Back to KBU Hub
                </Link>
            </div>
        </main>
    );
}
