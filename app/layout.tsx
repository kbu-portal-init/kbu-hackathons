import type { Metadata } from "next";
import { Chakra_Petch, Fira_Code, IBM_Plex_Sans_Thai } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { resolveOgImageUrl } from "@/lib/data/og-image";
import { getLocale } from "@/lib/i18n/server";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import SmoothScroll from "@/components/smooth-scroll";

const chakraPetch = Chakra_Petch({
    variable: "--font-chakra-petch",
    subsets: ["latin", "thai"],
    weight: ["500", "600", "700"],
    display: "swap",
});

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
    variable: "--font-ibm-plex-sans-thai",
    subsets: ["latin", "thai"],
    weight: ["400", "500", "600", "700"],
    display: "swap",
});

const firaCode = Fira_Code({
    variable: "--font-fira-code",
    subsets: ["latin"],
    weight: ["400", "500", "600"],
    display: "swap",
});

const DESCRIPTION = "Discover hackathons, join a team, and keep up with the KBU community.";
export async function generateMetadata(): Promise<Metadata> {
    // biome-ignore lint/style/noNonNullAssertion: < we alredy validated this>
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

    const ogImageUrl = await resolveOgImageUrl();

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

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
    const locale = await getLocale();
    return (
        <html
            lang={locale}
            className={`${chakraPetch.variable} ${ibmPlexSansThai.variable} ${firaCode.variable} h-full antialiased`}
            suppressHydrationWarning
        >
            <body className="min-h-full bg-background text-foreground">
                <TooltipProvider>
                    <NextTopLoader
                        color="var(--primary)"
                        height={3}
                        showSpinner={false}
                        crawl
                        crawlSpeed={200}
                        speed={200}
                    />
                    {children}
                    <Toaster richColors />
                    <SmoothScroll />
                    {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
                </TooltipProvider>
            </body>
        </html>
    );
}
