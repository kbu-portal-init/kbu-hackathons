"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { changeAdminPassword, updateAdminProfile } from "@/actions/admin/profile";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminProfileDTO } from "@/lib/contracts/admin-profile";

export function AdminProfileSettings({ profile }: { profile: AdminProfileDTO }) {
    const [name, setName] = useState(profile.name);
    const [email, setEmail] = useState(profile.email);
    const [image, setImage] = useState(profile.image);
    const [saving, setSaving] = useState(false);
    const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

    async function saveProfile(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        const result = await updateAdminProfile({ name, email, image });
        setSaving(false);
        if (!result.ok) {
            toast.error(result.error.message);
            return;
        }
        toast.success("Profile updated");
    }

    async function savePassword(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        const result = await changeAdminPassword(passwords);
        if (!result.ok) {
            toast.error(result.error.message);
            return;
        }
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        toast.success("Password changed");
    }

    return (
        <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="text-lg font-semibold">Profile information</h2>
                <form onSubmit={saveProfile} className="mt-5 space-y-5">
                    <div className="flex min-w-0 flex-col items-center gap-4 sm:flex-row sm:items-center">
                        <div className="relative size-20 min-w-20 max-w-20 shrink-0 overflow-hidden rounded-full bg-orange-100 text-2xl font-bold text-orange-700">
                            {image ? (
                                <Image
                                    src={image}
                                    alt="Profile"
                                    width={80}
                                    height={80}
                                    className="absolute inset-0 size-full object-cover"
                                    unoptimized
                                />
                            ) : (
                                <span className="absolute inset-0 flex items-center justify-center">
                                    {profile.name.slice(0, 1).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <FileUpload
                                category="admin-profile-image"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                currentFile={image}
                                onUploadComplete={(url) => setImage(url)}
                                onRemove={() => setImage(null)}
                                label="Select profile image"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={(event) => setName(event.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Input value={profile.role} readOnly />
                    </div>
                    <Button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save profile"}
                    </Button>
                </form>
            </section>
            <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="text-lg font-semibold">Change password</h2>
                <form onSubmit={savePassword} className="mt-5 space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Current password</Label>
                        <Input
                            id="current-password"
                            type="password"
                            value={passwords.currentPassword}
                            onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">New password</Label>
                        <Input
                            id="new-password"
                            type="password"
                            value={passwords.newPassword}
                            onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })}
                            minLength={8}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm new password</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            value={passwords.confirmPassword}
                            onChange={(event) => setPasswords({ ...passwords, confirmPassword: event.target.value })}
                            minLength={8}
                            required
                        />
                    </div>
                    <Button type="submit">Change password</Button>
                </form>
            </section>
        </div>
    );
}
