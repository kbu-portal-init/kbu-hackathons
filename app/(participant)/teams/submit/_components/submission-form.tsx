"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { saveSubmission } from "@/actions/participant/team-workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TeamSubmission } from "@/lib/contracts/team-workspace";
import { upsertSubmissionSchema } from "@/lib/contracts/team-workspace";
import { applyActionFieldErrors } from "@/lib/validation/react-hook-form";

type SubmissionFormValues = z.infer<typeof upsertSubmissionSchema>;

export function SubmissionForm({ submission }: { submission: TeamSubmission | null }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<SubmissionFormValues>({
        resolver: zodResolver(upsertSubmissionSchema),
        defaultValues: {
            title: submission?.title ?? "",
            description: submission?.description ?? "",
            repositoryUrl: submission?.repositoryUrl ?? "",
            demoUrl: submission?.demoUrl ?? "",
            presentationUrl: submission?.presentationUrl ?? "",
        },
    });

    async function onSubmit(values: SubmissionFormValues) {
        setIsSubmitting(true);
        const result = await saveSubmission(values);
        setIsSubmitting(false);

        if (!result.ok) {
            applyActionFieldErrors(result.error.fieldErrors, setError);
            toast.error(result.error.message);
            return;
        }

        toast.success(submission ? "Submission updated." : "Project submitted.");
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="title">Project title</Label>
                <Input
                    id="title"
                    placeholder="Our hackathon project"
                    required
                    disabled={isSubmitting}
                    {...register("title")}
                />
                {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    rows={5}
                    placeholder="What does your project do, and what makes it special?"
                    disabled={isSubmitting}
                    {...register("description")}
                />
                {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="repositoryUrl">Repository URL</Label>
                    <Input
                        id="repositoryUrl"
                        placeholder="https://github.com/team/project"
                        disabled={isSubmitting}
                        {...register("repositoryUrl")}
                    />
                    {errors.repositoryUrl && <p className="text-sm text-red-600">{errors.repositoryUrl.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="demoUrl">Demo URL</Label>
                    <Input
                        id="demoUrl"
                        placeholder="https://demo.example.com"
                        disabled={isSubmitting}
                        {...register("demoUrl")}
                    />
                    {errors.demoUrl && <p className="text-sm text-red-600">{errors.demoUrl.message}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="presentationUrl">Presentation URL</Label>
                <Input
                    id="presentationUrl"
                    placeholder="https://docs.google.com/presentation/…"
                    disabled={isSubmitting}
                    {...register("presentationUrl")}
                />
                {errors.presentationUrl && <p className="text-sm text-red-600">{errors.presentationUrl.message}</p>}
            </div>

            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : submission ? "Update submission" : "Submit project"}
            </Button>
        </form>
    );
}
