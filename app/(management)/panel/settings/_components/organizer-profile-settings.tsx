"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { changeOrganizerPassword, updateOrganizerProfile } from "@/actions/management/organizer-profile";
import { FileUpload } from "@/components/file-upload";
import { PasswordChangeForm } from "@/components/password-change-form";
import { PosterPanel } from "@/components/poster-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OrganizerProfileDTO } from "@/lib/contracts/organizer-profile";

export function OrganizerProfileSettings({ profile }: { profile: OrganizerProfileDTO }) {
    const [name, setName] = useState(profile.name);
    const [email, setEmail] = useState(profile.email);
    const [image, setImage] = useState(profile.image);
    const [saving, setSaving] = useState(false);

    async function saveProfile(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        const result = await updateOrganizerProfile({ name, email, image });
        setSaving(false);
        if (!result.ok) return toast.error(result.error.message);
        toast.success("Profile updated");
    }

    return (
        <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
            <PosterPanel className="p-6">
                <h2 className="font-display text-lg font-bold tracking-tight text-foreground">Profile information</h2>
                <form onSubmit={saveProfile} className="mt-5 space-y-5">
                    <div className="flex min-w-0 flex-col items-center gap-4 sm:flex-row">
                        <div className="relative flex size-20 shrink-0 items-center justify-center overflow-visible bg-accent font-display text-2xl font-bold text-accent-foreground">
                            {image ? (
                                <Image src={image} alt="Profile" fill className="object-cover" unoptimized />
                            ) : (
                                profile.name.slice(0, 1).toUpperCase()
                            )}
                            <FileUpload
                                category="organizer-profile-image"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                currentFile={image}
                                iconOverlay
                                label="Select profile image"
                                onRemove={async () => {
                                    const result = await updateOrganizerProfile({ name, email, image: null });
                                    if (!result.ok) {
                                        toast.error(result.error.message);
                                        return;
                                    }
                                    setImage(null);
                                }}
                                onUploadComplete={(url) => setImage(url)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="organizer-name" className="font-display text-sm font-semibold text-foreground">
                            Name
                        </Label>
                        <Input
                            id="organizer-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="organizer-email" className="font-display text-sm font-semibold text-foreground">
                            Email
                        </Label>
                        <Input
                            id="organizer-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>
                    <Button
                        variant="default"
                        type="submit"
                        disabled={saving}
                        className="border-2 border-border bg-foreground font-display text-sm font-semibold text-background hover:bg-accent hover:text-accent-foreground"
                    >
                        {saving ? "Saving..." : "Save profile"}
                    </Button>
                </form>
            </PosterPanel>
            <PosterPanel className="p-6">
                <h2 className="font-display text-lg font-bold tracking-tight text-foreground">Change password</h2>
                <PasswordChangeForm
                    idPrefix="organizer"
                    forgotPasswordEmail={email}
                    onSubmit={async (values) => {
                        const result = await changeOrganizerPassword(values);
                        return result.ok ? { ok: true } : { ok: false, error: result.error };
                    }}
                />
            </PosterPanel>
        </div>
    );
}
