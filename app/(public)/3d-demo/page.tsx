import RoomExperience from "@/components/_3d/RoomExperience";
import ScrollFx from "@/components/scroll-fx";

export default function ThreeDemoPage() {
    return (
        <section className="mx-auto max-w-7xl px-6 py-12">
            <h1 className="mb-2 text-3xl font-semibold text-foreground">3D Workspace Demo</h1>
            <p className="mb-8 text-sm text-muted-foreground">
                Playground for the KBU Hub immersive room — the same experience as the homepage, full width.
            </p>
            <div data-hero-parallax>
                <RoomExperience />
            </div>
            <ScrollFx reveals={false} />
        </section>
    );
}
