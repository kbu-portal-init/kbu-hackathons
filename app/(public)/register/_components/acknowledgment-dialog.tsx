"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Field, FieldLabel, FieldSet } from "@/components/ui/field";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

export function AcknowledgmentDialog({
    open,
    onOpenChange,
    acknowledged,
    onAcknowledgedChange,
    locale,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    acknowledged: boolean;
    onAcknowledgedChange: (value: boolean) => void;
    locale: Locale;
}) {
    const t = getMessages(locale).register;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="font-display">{t.beforeSubmit}</AlertDialogTitle>
                    <AlertDialogDescription render={<div />}>
                        <ol className="list-decimal space-y-2 pl-5">
                            {t.submitSteps.map((step) => (
                                <li className="text-start" key={step}>
                                    {step}
                                </li>
                            ))}
                        </ol>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <FieldSet className="border-t-2 border-border/15 pt-4">
                    <Field orientation="horizontal" className="items-start">
                        <input
                            id="registration-acknowledgment"
                            type="checkbox"
                            checked={acknowledged}
                            onChange={(event) => onAcknowledgedChange(event.target.checked)}
                            className="mt-1 size-4 accent-primary"
                        />
                        <FieldLabel htmlFor="registration-acknowledgment" className="text-sm leading-5">
                            {t.acknowledgment}
                        </FieldLabel>
                    </Field>
                </FieldSet>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t.close}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onOpenChange(false)} disabled={!acknowledged}>
                        {t.understand}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
