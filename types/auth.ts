export type UserRole = "user" | "organizer" | "admin";

export function getUserRole(role: string | null | undefined): UserRole | null {
    if (role === "user" || role === "organizer" || role === "admin") {
        return role;
    }
    return null;
}
