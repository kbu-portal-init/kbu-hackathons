"use client";

import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type Props = {
    isPending: boolean;
    isDirty: boolean;
    isEditing: boolean;
};

export function FormSubmitButton({ isPending, isDirty, isEditing }: Props) {
    return (
        <>
            <Separator />
            <div className="flex items-center gap-3">
                <Button type="submit" disabled={isPending}>
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 size-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 size-4" />
                            {isEditing ? "Save changes" : "Create event settings"}
                        </>
                    )}
                </Button>
                {isDirty && <p className="text-sm text-zinc-500">You have unsaved changes.</p>}
            </div>
        </>
    );
}
