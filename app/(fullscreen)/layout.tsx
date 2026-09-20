import type { ReactNode } from "react";

/**
 * Bare chrome for immersive routes: no site header/footer, no scroll. The page
 * owns the whole viewport.
 */
export default function FullscreenLayout({ children }: Readonly<{ children: ReactNode }>) {
    return <div className="h-dvh w-full overflow-hidden bg-background text-foreground">{children}</div>;
}
