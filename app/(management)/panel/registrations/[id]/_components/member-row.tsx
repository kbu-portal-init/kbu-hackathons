"use client";

import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { manuallyVerifyStudentEmail, resendStudentEmailVerification } from "@/actions/management/registrations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";

type Member = {
    id: string;
    name: string;
    role: string;
    email: string;
    verifiedAt: string | null;
};

type MemberRowProps = {
    member: Member;
};

export function MemberRow({ member }: MemberRowProps) {
    const [isPending, startTransition] = useTransition();
    const [isVerified, setIsVerified] = useState(member.verifiedAt !== null);

    const handleResend = () => {
        startTransition(async () => {
            const result = await resendStudentEmailVerification({ teamMemberId: member.id });
            if (!result.ok) {
                toast.error(result.error.message);
                return;
            }
            toast.success("Verification email sent");
        });
    };

    const handleManualVerify = () => {
        startTransition(async () => {
            const result = await manuallyVerifyStudentEmail({ teamMemberId: member.id });
            if (!result.ok) {
                toast.error(result.error.message);
                return;
            }
            setIsVerified(true);
            toast.success("Email manually verified");
        });
    };

    return (
        <TableRow>
            <TableCell className="font-medium">{member.name}</TableCell>
            <TableCell>{member.role}</TableCell>
            <TableCell className="break-all">{member.email}</TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    {isVerified ? (
                        <Badge variant="outline" className="gap-1">
                            <CheckCircle2 className="size-3" />
                            Verified
                        </Badge>
                    ) : (
                        <>
                            <Badge variant="secondary" className="gap-1">
                                <Mail className="size-3" />
                                Pending
                            </Badge>
                            <Button variant="outline" size="sm" onClick={handleResend} disabled={isPending}>
                                {isPending ? <Loader2 className="size-4 animate-spin" /> : "Resend"}
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleManualVerify} disabled={isPending}>
                                {isPending ? <Loader2 className="size-4 animate-spin" /> : "Manually Verify"}
                            </Button>
                        </>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
}
