import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getEventSettings } from "@/lib/data/event-settings";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
    variable: "--font-plus-jakarta-sans",
    subsets: ["latin"],
});

const DESCRIPTION = "Discover hackathons, join a team, and keep up with the KBU community.";

export async function generateMetadata(): Promise<Metadata> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    let ogImageUrl = "/images/kbu.webp";
    try {
        const event = await getEventSettings();
        ogImageUrl = event?.imageUrls[0] ?? ogImageUrl;
    } catch {
        // Metadata must never break rendering; keep the static fallback image.
    }

    return {
        metadataBase: new URL(appUrl),
        title: "KBU Hackathon 2026",
        description: DESCRIPTION,
        openGraph: {
            type: "website",
            siteName: "KBU Hackathon 2026",
            url: appUrl,
            title: "KBU Hackathon 2026",
            description: DESCRIPTION,
            images: [{ url: ogImageUrl }],
        },
        twitter: {
            card: "summary_large_image",
            title: "KBU Hackathon 2026",
            description: DESCRIPTION,
            images: [ogImageUrl],
        },
    };
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html lang="en" className={`${plusJakartaSans.variable} h-full antialiased`} suppressHydrationWarning>
            <body className="min-h-full bg-white text-zinc-950">
                <TooltipProvider>
                    <NextTopLoader color="#f97316" height={3} showSpinner={false} crawl crawlSpeed={200} speed={200} />
                    {children}
                    <Toaster />
                </TooltipProvider>
            </body>
        </html>
    );
}
