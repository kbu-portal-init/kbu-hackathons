import type { ReactNode } from "react";

/**
 * Bare chrome for immersive routes: no site header/footer, no scroll. The page
 * owns the whole viewport. A soft gradient keeps the room from floating on a
 * flat white field.
 */
export default function FullscreenLayout({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <div className="h-dvh w-full overflow-hidden bg-gradient-to-b from-indigo-50 via-background to-cyan-50 text-foreground">
            {children}
        </div>
    );
}
