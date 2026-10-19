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
            <section className="border-2 border-border bg-card p-6">
                <h2 className="font-display text-lg font-bold tracking-tight text-foreground">Profile information</h2>
                <form onSubmit={saveProfile} className="mt-5 space-y-5">
                    <div className="flex min-w-0 flex-col items-center gap-4 sm:flex-row sm:items-center">
                        <div className="relative size-20 min-w-20 max-w-20 shrink-0 bg-accent font-display text-2xl font-bold text-accent-foreground">
                            <div className="absolute inset-0 overflow-hidden">
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
                        <Label htmlFor="name" className="font-display text-sm font-semibold text-foreground">
                            Name
                        </Label>
                        <Input
                            id="name"
                            className="border-2 border-border/25 bg-card focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="font-display text-sm font-semibold text-foreground">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            className="border-2 border-border/25 bg-card focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-display text-sm font-semibold text-foreground">Role</Label>
                        <Input
                            value={profile.role}
                            readOnly
                            className="border-2 border-border/25 bg-card focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={saving}
                        className="border-2 border-border bg-foreground font-display text-sm font-semibold text-background hover:bg-accent hover:text-accent-foreground"
                    >
                        {saving ? "Saving..." : "Save profile"}
                    </Button>
                </form>
            </section>
            <section className="border-2 border-border bg-card p-6">
                <h2 className="font-display text-lg font-bold tracking-tight text-foreground">Change password</h2>
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
