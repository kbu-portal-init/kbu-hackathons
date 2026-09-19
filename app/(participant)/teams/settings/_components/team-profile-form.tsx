"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { saveTeamProfile } from "@/actions/participant/team-workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateTeamProfileSchema } from "@/lib/contracts/team-workspace";
import { applyActionFieldErrors } from "@/lib/validation/react-hook-form";

type ProfileFormValues = z.infer<typeof updateTeamProfileSchema>;

export function TeamProfileForm({ defaultDisplayName }: { defaultDisplayName: string }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(updateTeamProfileSchema),
        defaultValues: { displayName: defaultDisplayName },
    });

    async function onSubmit(values: ProfileFormValues) {
        setIsSubmitting(true);
        const result = await saveTeamProfile(values);
        setIsSubmitting(false);

        if (!result.ok) {
            applyActionFieldErrors(result.error.fieldErrors, setError);
            toast.error(result.error.message);
            return;
        }

        toast.success("Team profile updated.");
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="displayName">Team name</Label>
                <Input id="displayName" required disabled={isSubmitting} {...register("displayName")} />
                {errors.displayName && <p className="text-sm text-red-600">{errors.displayName.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
        </form>
    );
}
