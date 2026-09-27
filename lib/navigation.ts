import {
    Bell,
    CalendarDays,
    ClipboardList,
    FileText,
    LayoutDashboard,
    Settings,
    ShieldCheck,
    Upload,
    Users,
} from "lucide-react";

export const publicLinks = [
    { href: "/events", label: "Events" },
    { href: "/register", label: "Register" },
    { href: "/announcements", label: "Announcements" },
    { href: "/resources", label: "Resources" },
    { href: "/about", label: "About" },
] as const;

export const participantDashboardLinks = [
    { href: "/team", label: "Our Team", icon: Users },
    { href: "/team/references", label: "References", icon: FileText },
    { href: "/team/submit", label: "Submit", icon: Upload },
    { href: "/team/settings", label: "Settings", icon: Settings },
] as const;

export const managementDashboardLinks = [
    { href: "/panel", label: "Overview", icon: LayoutDashboard },
    { href: "/panel/announcements", label: "Announcements", icon: Bell },
    {
        href: "/panel/registrations",
        label: "Registrations",
        icon: ClipboardList,
    },
    { href: "/panel/teams", label: "All Teams", icon: Users },
    { href: "/panel/event", label: "Event", icon: CalendarDays },
    { href: "/panel/settings", label: "Settings", icon: Settings },
] as const;

export const adminDashboardLinks = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/audits", label: "Audit logs", icon: ClipboardList },
    { href: "/admin/organizers", label: "Organizers", icon: Users },
    { href: "/admin/settings", label: "Settings", icon: Settings },
    { href: "/panel", label: "Management panel", icon: ShieldCheck },
] as const;
