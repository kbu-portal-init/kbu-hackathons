import RoomExperience from "@/components/_3d/RoomExperience";

export default function ThreeDemoPage() {
    return (
        <section className="mx-auto max-w-7xl px-6 py-12">
            <h1 className="mb-2 text-3xl font-semibold">3D Workspace Demo</h1>
            <p className="mb-8 text-sm text-zinc-600 dark:text-zinc-300">
                Playground for the KBU Hub immersive room — the same experience as the homepage, full width.
            </p>
            <RoomExperience />
        </section>
    );
}
