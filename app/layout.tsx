import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
    variable: "--font-plus-jakarta-sans",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "KBU Hub | Hackathons that move ideas forward",
    description: "Discover hackathons, join a team, and keep up with the KBU community.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html lang="en" className={`${plusJakartaSans.variable} h-full antialiased dark`} suppressHydrationWarning>
            <body className="min-h-full bg-background text-foreground">
                <TooltipProvider>
                    {children}
                    <Toaster />
                </TooltipProvider>
            </body>
        </html>
    );
}
