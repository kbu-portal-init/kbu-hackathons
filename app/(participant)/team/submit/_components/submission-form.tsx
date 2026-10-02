"use client";

import { useState, useTransition } from "react";
import { saveSubmission } from "@/actions/participant/submissions";
import type { SubmissionDTO } from "@/lib/contracts/submissions";

const fields = [
    ["title", "Project title", "text"],
    ["summary", "Project summary", "textarea"],
    ["problem", "Problem statement", "textarea"],
    ["targetUsers", "Target users", "text"],
    ["solution", "Solution description", "textarea"],
    ["technologyStack", "Technology stack", "text"],
    ["repositoryUrl", "Repository URL", "url"],
    ["demoUrl", "Working demo URL", "url"],
    ["presentationUrl", "Presentation URL", "url"],
    ["demoVideoUrl", "Demo video URL", "url"],
    ["additionalNotes", "Additional notes", "textarea"],
] as const;

type FormValues = Record<(typeof fields)[number][0], string>;

function initialValues(submission: SubmissionDTO | null): FormValues {
    return Object.fromEntries(
        fields.map(([name]) => [name, submission?.[name as keyof SubmissionDTO] ?? ""]),
    ) as FormValues;
}

export function SubmissionForm({ submission }: { submission: SubmissionDTO | null }) {
    const [values, setValues] = useState(() => initialValues(submission));
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [isPending, startTransition] = useTransition();
    const locked = submission?.status === "SUBMITTED";

    function submit(finalize: boolean) {
        setError("");
        setMessage("");
        startTransition(async () => {
            const result = await saveSubmission(values, finalize);
            if (!result.ok) {
                setError(result.error.message);
                return;
            }
            setMessage(finalize ? "Submission finalized." : "Draft saved.");
        });
    }

    return (
        <div className="mt-8 space-y-5">
            {locked && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                    This submission is finalized and is currently read-only.
                </div>
            )}
            {error && (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                    {error}
                </div>
            )}
            {message && (
                <div
                    role="status"
                    className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
                >
                    {message}
                </div>
            )}
            <form
                className="space-y-5"
                onSubmit={(event) => {
                    event.preventDefault();
                    submit(false);
                }}
            >
                {fields.map(([name, label, type]) => (
                    <label className="block space-y-2" htmlFor={`submission-${name}`} key={name}>
                        <span className="text-sm font-semibold text-foreground">
                            {label}
                            {[
                                "title",
                                "summary",
                                "problem",
                                "targetUsers",
                                "solution",
                                "technologyStack",
                                "repositoryUrl",
                            ].includes(name)
                                ? " *"
                                : ""}
                        </span>
                        {type === "textarea" ? (
                            <textarea
                                id={`submission-${name}`}
                                className="min-h-28 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-60"
                                disabled={locked || isPending}
                                value={values[name]}
                                onChange={(event) =>
                                    setValues((current) => ({ ...current, [name]: event.target.value }))
                                }
                            />
                        ) : (
                            <input
                                id={`submission-${name}`}
                                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-60"
                                disabled={locked || isPending}
                                type={type}
                                value={values[name]}
                                onChange={(event) =>
                                    setValues((current) => ({ ...current, [name]: event.target.value }))
                                }
                            />
                        )}
                    </label>
                ))}
                <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row">
                    <button
                        className="rounded-lg border border-orange-600 px-5 py-3 font-semibold text-orange-700 disabled:opacity-50"
                        disabled={locked || isPending}
                        type="submit"
                    >
                        {isPending ? "Saving..." : "Save draft"}
                    </button>
                    <button
                        className="rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
                        disabled={locked || isPending}
                        type="button"
                        onClick={() => submit(true)}
                    >
                        Finalize submission
                    </button>
                </div>
            </form>
        </div>
    );
}
