"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";
import { createOrganizer } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type CreateOrganizerFormProps = {
    onSuccess: () => void;
};

export function CreateOrganizerForm({ onSuccess }: CreateOrganizerFormProps) {
    const form = useForm({
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
        onSubmit: async ({ value }) => {
            const result = await createOrganizer(value);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Organizer account created successfully");
                form.reset();
                onSuccess();
            }
        },
        validators: {
            onSubmit: z.object({
                name: z.string().min(1, "Name is required"),
                email: z.string().email("Invalid email address"),
                password: z.string().min(8, "Password must be at least 8 characters"),
            }),
        },
    });

    return (
        <>
            <DialogHeader>
                <DialogTitle>Create organizer account</DialogTitle>
                <DialogDescription>This will create a new user with the organizer role.</DialogDescription>
            </DialogHeader>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
                className="space-y-4"
            >
                <form.Field name="name">
                    {(field) => (
                        <div className="space-y-2">
                            <label htmlFor={field.name} className="text-sm font-medium">
                                Name
                            </label>
                            <Input
                                id={field.name}
                                name={field.name}
                                type="text"
                                autoComplete="name"
                                placeholder="Enter organizer name"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                required
                            />
                            {field.state.meta.errors.map((error) => (
                                <p key={error?.message} className="text-sm text-red-500">
                                    {error?.message}
                                </p>
                            ))}
                        </div>
                    )}
                </form.Field>

                <form.Field name="email">
                    {(field) => (
                        <div className="space-y-2">
                            <label htmlFor={field.name} className="text-sm font-medium">
                                Email address
                            </label>
                            <Input
                                id={field.name}
                                name={field.name}
                                type="email"
                                autoComplete="email"
                                placeholder="organizer@example.com"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                required
                            />
                            {field.state.meta.errors.map((error) => (
                                <p key={error?.message} className="text-sm text-red-500">
                                    {error?.message}
                                </p>
                            ))}
                        </div>
                    )}
                </form.Field>

                <form.Field name="password">
                    {(field) => (
                        <div className="space-y-2">
                            <label htmlFor={field.name} className="text-sm font-medium">
                                Password
                            </label>
                            <Input
                                id={field.name}
                                name={field.name}
                                type="password"
                                autoComplete="new-password"
                                placeholder="At least 8 characters"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                required
                            />
                            {field.state.meta.errors.map((error) => (
                                <p key={error?.message} className="text-sm text-red-500">
                                    {error?.message}
                                </p>
                            ))}
                        </div>
                    )}
                </form.Field>

                <DialogFooter>
                    <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
                    <form.Subscribe
                        selector={(state) => ({
                            canSubmit: state.canSubmit,
                            isSubmitting: state.isSubmitting,
                        })}
                    >
                        {({ canSubmit, isSubmitting }) => (
                            <Button type="submit" disabled={!canSubmit || isSubmitting}>
                                {isSubmitting ? "Creating..." : "Create organizer"}
                            </Button>
                        )}
                    </form.Subscribe>
                </DialogFooter>
            </form>
        </>
    );
}
