"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { changeAdminPassword, updateAdminProfile } from "@/actions/admin/profile";
import { FileUpload } from "@/components/file-upload";
import { PasswordChangeForm } from "@/components/password-change-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminProfileDTO } from "@/lib/contracts/admin-profile";

export function AdminProfileSettings({ profile }: { profile: AdminProfileDTO }) {
    const [name, setName] = useState(profile.name);
    const [email, setEmail] = useState(profile.email);
    const [image, setImage] = useState(profile.image);
    const [saving, setSaving] = useState(false);

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

    return (
        <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-zinc-200 bg-white p-6">
                <h2 className="text-lg font-semibold">Profile information</h2>
                <form onSubmit={saveProfile} className="mt-5 space-y-5">
                    <div className="flex min-w-0 flex-col items-center gap-4 sm:flex-row sm:items-center">
                        <div className="relative size-20 min-w-20 max-w-20 shrink-0 rounded-full bg-orange-100 text-2xl font-bold text-orange-700">
                            <div className="absolute inset-0 overflow-hidden rounded-full">
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
                            <FileUpload
                                category="admin-profile-image"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                currentFile={image}
                                iconOverlay
                                onRemove={async () => {
                                    setImage(null);
                                    const result = await updateAdminProfile({ name, email, image: null });
                                    if (!result.ok) toast.error(result.error.message);
                                }}
                                onUploadComplete={(url) => setImage(url)}
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
            <section className="rounded-2xl border border-zinc-200 bg-white p-6">
                <h2 className="text-lg font-semibold">Change password</h2>
                <PasswordChangeForm
                    idPrefix="admin"
                    forgotPasswordEmail={email}
                    onSubmit={async (values) => {
                        const result = await changeAdminPassword(values);
                        return result.ok ? { ok: true } : { ok: false, error: result.error };
                    }}
                />
            </section>
        </div>
    );
}
