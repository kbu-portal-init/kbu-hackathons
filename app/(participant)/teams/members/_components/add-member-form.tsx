"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { createTeamMember } from "@/actions/participant/team-workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addTeamMemberSchema } from "@/lib/contracts/team-workspace";
import { applyActionFieldErrors } from "@/lib/validation/react-hook-form";

type AddMemberFormValues = z.infer<typeof addTeamMemberSchema>;

export function AddTeamMemberForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors },
    } = useForm<AddMemberFormValues>({ resolver: zodResolver(addTeamMemberSchema) });

    async function onSubmit(values: AddMemberFormValues) {
        setIsSubmitting(true);
        const result = await createTeamMember(values);
        setIsSubmitting(false);

        if (!result.ok) {
            applyActionFieldErrors(result.error.fieldErrors, setError);
            toast.error(result.error.message);
            return;
        }

        toast.success("Team member added.");
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
                <Label htmlFor="studentEmail">Student email</Label>
                <Input
                    id="studentEmail"
                    type="email"
                    placeholder="jane@kbu.edu"
                    required
                    disabled={isSubmitting}
                    {...register("studentEmail")}
                />
                {errors.studentEmail && <p className="text-sm text-red-600">{errors.studentEmail.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Adding…" : "Add member"}
            </Button>
        </form>
    );
}
