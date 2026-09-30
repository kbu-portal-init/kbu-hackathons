import { Box, Boxes, Clock, Cpu, Trophy } from "lucide-react";

type SceneVariant = "scene-hero" | "scene-sprint" | "scene-lab" | "scene-challenge";

type ScenePlaceholderProps = {
    variant: SceneVariant;
    className?: string;
};

/**
 * A static, WebGL-free stand-in for the 3D room renders that will eventually
 * sit on the homepage. Each variant is a different isometric-ish composition
 * drawn purely in markup so it renders before JS and in any browser.
 */
export function ScenePlaceholder({ variant, className }: ScenePlaceholderProps) {
    if (variant === "scene-hero") {
        return <HeroScene className={className} />;
    }
    if (variant === "scene-sprint") {
        return <SprintScene className={className} />;
    }
    if (variant === "scene-lab") {
        return <LabScene className={className} />;
    }
    return <ChallengeScene className={className} />;
}

/* Shared pieces */

function Floor({ className = "" }: { className?: string }) {
    return (
        <div aria-hidden className={`absolute inset-x-0 bottom-0 h-1/2 [perspective:600px] ${className}`}>
            <div className="absolute inset-0 origin-bottom [transform:rotateX(62deg)] bg-[linear-gradient(to_right,rgba(234,88,12,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(234,88,12,0.10)_1px,transparent_1px)] [background-size:26px_26px]" />
        </div>
    );
}

function Cube({ className, label, Icon }: { className: string; label: string; Icon: typeof Box }) {
    return (
        <div className={`group absolute ${className}`} aria-hidden>
            <div className="relative size-full rounded-lg bg-gradient-to-br from-white to-orange-100 shadow-md ring-1 ring-orange-200 transition group-hover:from-orange-100 group-hover:to-orange-200">
                <Icon className="absolute inset-0 m-auto size-1/2 text-orange-600" />
            </div>
            <span className="sr-only">{label}</span>
        </div>
    );
}

/* Variants */

function HeroScene({ className }: { className?: string }) {
    return (
        <div className={`absolute inset-0 ${className ?? ""}`} aria-hidden>
            <Floor />
            {/* back wall glow */}
            <div className="absolute left-1/2 top-1/4 size-64 -translate-x-1/2 rounded-full bg-orange-400/15 blur-3xl" />
            {/* floating room blocks */}
            <Cube className="left-[14%] top-[20%] size-16 sm:size-20" Icon={Boxes} label="workspace" />
            <Cube className="left-[42%] top-[12%] size-12 sm:size-14" Icon={Cpu} label="tooling" />
            <Cube className="right-[16%] top-[26%] size-14 sm:size-16" Icon={Trophy} label="prizes" />
            <Cube className="left-[26%] bottom-[14%] size-12 sm:size-14" Icon={Clock} label="countdown" />
            <Cube className="right-[28%] bottom-[20%] size-16 sm:size-20" Icon={Box} label="team" />
        </div>
    );
}

function SprintScene({ className }: { className?: string }) {
    return (
        <div className={`absolute inset-0 ${className ?? ""}`} aria-hidden>
            <Floor />
            <div className="absolute left-1/2 top-1/3 size-48 -translate-x-1/2 rounded-full bg-orange-400/15 blur-3xl" />
            <Cube className="left-[22%] top-[26%] size-14 sm:size-16" Icon={Box} label="sprint kit" />
            <Cube className="right-[22%] top-[36%] size-12 sm:size-14" Icon={Cpu} label="starter repo" />
        </div>
    );
}

function LabScene({ className }: { className?: string }) {
    return (
        <div className={`absolute inset-0 ${className ?? ""}`} aria-hidden>
            <Floor />
            <div className="absolute left-1/2 top-1/3 size-48 -translate-x-1/2 rounded-full bg-teal-400/15 blur-3xl" />
            <Cube className="left-[18%] top-[30%] size-12 sm:size-14" Icon={Boxes} label="open lab" />
            <Cube className="right-[20%] top-[22%] size-14 sm:size-16" Icon={Cpu} label="mentors" />
        </div>
    );
}

function ChallengeScene({ className }: { className?: string }) {
    return (
        <div className={`absolute inset-0 ${className ?? ""}`} aria-hidden>
            <Floor />
            <div className="absolute left-1/2 top-1/4 size-48 -translate-x-1/2 rounded-full bg-orange-400/15 blur-3xl" />
            <Cube
                className="left-1/2 top-[18%] size-16 -translate-x-1/2 sm:size-20"
                Icon={Trophy}
                label="challenge trophy"
            />
        </div>
    );
}
