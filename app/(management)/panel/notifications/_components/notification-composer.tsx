"use client";

import { useState } from "react";
import { sendManualNotificationAction } from "@/actions/management/notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { TeamListItem } from "@/lib/contracts/teams";
import { submitNotification } from "./notification-submission";

export function NotificationComposer({ teams }: { teams: TeamListItem[] }) {
    const [mode, setMode] = useState<"TEAM" | "ALL_TEAMS" | "EMAIL">("TEAM");
    const [teamId, setTeamId] = useState(teams[0]?.id ?? "");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setMessage(null);
        if (pending) return;
        const target = mode === "TEAM" ? { mode, teamId } : mode === "EMAIL" ? { mode, email } : { mode };
        const result = await submitNotification(
            sendManualNotificationAction,
            { subject, body, target },
            setMessage,
            setPending,
        );
        if (result?.ok) {
            setSubject("");
            setBody("");
        }
    }

    return (
        <div className="flex max-w-2xl flex-col gap-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
                <p className="text-sm text-muted-foreground">Send an email and in-app message to teams.</p>
            </div>
            <form
                onSubmit={submit}
                className="flex flex-col gap-4 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm"
            >
                <label className="flex flex-col gap-2 text-sm font-medium">
                    Recipient
                    <select
                        className="h-9 rounded-lg border bg-background px-2"
                        value={mode}
                        onChange={(event) => setMode(event.target.value as typeof mode)}
                    >
                        <option value="TEAM">Specific team</option>
                        <option value="ALL_TEAMS">All approved teams</option>
                        <option value="EMAIL">Specific email</option>
                    </select>
                </label>
                {mode === "TEAM" && (
                    <select
                        required
                        className="h-9 rounded-lg border bg-background px-2"
                        value={teamId}
                        onChange={(event) => setTeamId(event.target.value)}
                    >
                        <option value="">Choose a team</option>
                        {teams.map((team) => (
                            <option key={team.id} value={team.id}>
                                {team.displayName} (@{team.loginName})
                            </option>
                        ))}
                    </select>
                )}
                {mode === "EMAIL" && (
                    <Input
                        required
                        type="email"
                        placeholder="recipient@example.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                )}
                <label htmlFor="notification-subject" className="flex flex-col gap-2 text-sm font-medium">
                    Subject
                    <Input
                        id="notification-subject"
                        required
                        maxLength={200}
                        value={subject}
                        onChange={(event) => setSubject(event.target.value)}
                    />
                </label>
                <label htmlFor="notification-body" className="flex flex-col gap-2 text-sm font-medium">
                    Message
                    <Textarea
                        id="notification-body"
                        required
                        maxLength={10000}
                        rows={8}
                        value={body}
                        onChange={(event) => setBody(event.target.value)}
                    />
                </label>
                {message && (
                    <p className="text-sm text-muted-foreground" role="status">
                        {message}
                    </p>
                )}
                <Button type="submit" disabled={pending}>
                    {pending ? "Sending..." : "Send notification"}
                </Button>
            </form>
        </div>
    );
}
