export type UserRole = "team" | "organizer" | "admin";
export type ManagementRole = Extract<UserRole, "organizer" | "admin">;

export function getUserRole(role: string | null | undefined): UserRole | null {
    if (role === "team" || role === "organizer" || role === "admin") {
        return role;
    }
    return null;
}
