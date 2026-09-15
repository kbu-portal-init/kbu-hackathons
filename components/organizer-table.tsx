"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateOrganizerForm } from "@/components/create-organizer-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Organizer = {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
};

type OrganizerTableProps = {
    organizers: Organizer[];
};

export function OrganizerTable({ organizers }: OrganizerTableProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Organizer accounts</h2>
                    <p className="text-sm text-muted-foreground">
                        {organizers.length} organizer{organizers.length !== 1 ? "s" : ""} total
                    </p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger render={<Button />}>
                        <Plus className="mr-2 size-4" />
                        Add organizer
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <CreateOrganizerForm
                            onSuccess={() => {
                                setOpen(false);
                                router.refresh();
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Created</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {organizers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                    No organizers yet. Create one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            organizers.map((org) => (
                                <TableRow key={org.id}>
                                    <TableCell>{org.name}</TableCell>
                                    <TableCell>{org.email}</TableCell>
                                    <TableCell>{new Date(org.createdAt).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
