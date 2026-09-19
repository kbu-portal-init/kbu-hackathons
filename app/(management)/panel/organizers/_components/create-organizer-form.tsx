"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { createOrganizer } from "@/actions/admin/organizers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createOrganizerSchema } from "@/lib/contracts/organizers";
import { applyActionFieldErrors } from "@/lib/validation/react-hook-form";

type OrganizerFormValues = z.infer<typeof createOrganizerSchema>;

export function CreateOrganizerForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors },
    } = useForm<OrganizerFormValues>({ resolver: zodResolver(createOrganizerSchema) });

    async function onSubmit(values: OrganizerFormValues) {
        setIsSubmitting(true);
        const result = await createOrganizer(values);
        setIsSubmitting(false);

        if (!result.ok) {
            applyActionFieldErrors(result.error.fieldErrors, setError);
            toast.error(result.error.message);
            return;
        }

        toast.success("Organizer account created.");
        reset();
        router.refresh();
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
        >
            <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" placeholder="Jane Doe" required disabled={isSubmitting} {...register("name")} />
                {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="jane@kbu.edu"
                    required
                    disabled={isSubmitting}
                    {...register("email")}
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Temporary password</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="At least 8 characters"
                    required
                    disabled={isSubmitting}
                    {...register("password")}
                />
                {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating…" : "Create organizer"}
            </Button>
        </form>
    );
}
