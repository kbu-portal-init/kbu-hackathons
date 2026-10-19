"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ForgotPasswordButton } from "@/components/forgot-password-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PasswordValues = { currentPassword: string; newPassword: string; confirmPassword: string };
type PasswordResult = { ok: true } | { ok: false; error: { message: string } };

export function PasswordChangeForm({
    idPrefix,
    onSubmit,
    forgotPasswordEmail,
}: {
    idPrefix: string;
    onSubmit: (values: PasswordValues) => Promise<PasswordResult>;
    forgotPasswordEmail?: string;
}) {
    const [values, setValues] = useState<PasswordValues>({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [saving, setSaving] = useState(false);
    const [visible, setVisible] = useState<Record<keyof PasswordValues, boolean>>({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

    async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        const result = await onSubmit(values);
        setSaving(false);
        if (!result.ok) return toast.error(result.error.message);
        setValues({ currentPassword: "", newPassword: "", confirmPassword: "" });
        toast.success("Password changed");
    }

    return (
        <>
            {forgotPasswordEmail && (
                <div className="flex justify-end">
                    <ForgotPasswordButton email={forgotPasswordEmail} />
                </div>
            )}
            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
                {(
                    [
                        ["current-password", "Current password", "currentPassword"],
                        ["new-password", "New password", "newPassword"],
                        ["confirm-password", "Confirm new password", "confirmPassword"],
                    ] as const
                ).map(([suffix, label, key]) => (
                    <div className="space-y-2" key={suffix}>
                        <Label
                            className="font-display text-sm font-semibold text-foreground"
                            htmlFor={`${idPrefix}-${suffix}`}
                        >
                            {label}
                        </Label>
                        <Input
                            id={`${idPrefix}-${suffix}`}
                            type={visible[key] ? "text" : "password"}
                            className="h-11 border-2 border-border/25 bg-card pr-10 text-base focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                            value={values[key]}
                            onChange={(event) => setValues({ ...values, [key]: event.target.value })}
                            minLength={key === "currentPassword" ? undefined : 8}
                            required
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="relative float-right -mt-9 mr-1"
                            aria-label={visible[key] ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
                            onClick={() => setVisible((current) => ({ ...current, [key]: !current[key] }))}
                        >
                            {visible[key] ? <EyeOff /> : <Eye />}
                        </Button>
                    </div>
                ))}
                <Button
                    type="submit"
                    disabled={saving}
                    className="border-2 border-border bg-foreground font-display text-sm font-semibold text-background hover:bg-accent hover:text-accent-foreground"
                >
                    {saving ? "Saving..." : "Change password"}
                </Button>
            </form>
        </>
    );
}
