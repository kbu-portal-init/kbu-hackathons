"use client";

import { useState } from "react";
import { sendManualNotificationAction } from "@/actions/management/notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { TeamListItem } from "@/lib/contracts/teams";
import { submitNotification } from "./notification-submission";

export function NotificationComposer({ teams }: { teams: TeamListItem[] }) {
    const [mode, setMode] = useState<"TEAM" | "ALL_TEAMS" | "EMAIL">("TEAM");
    const [channel, setChannel] = useState<"EMAIL" | "IN_APP" | "BOTH">("BOTH");
    const [teamId, setTeamId] = useState(teams[0]?.id ?? "");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    async function submit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setMessage(null);
        if (pending) return;
        const target = mode === "TEAM" ? { mode, teamId } : mode === "EMAIL" ? { mode, email } : { mode };
        const result = await submitNotification(
            sendManualNotificationAction,
            { channel, subject, body, target },
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
                <p className="text-sm text-muted-foreground">Send a notification by email, in-app message, or both.</p>
            </div>
            <form
                onSubmit={submit}
                className="flex flex-col gap-4 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm"
            >
                <div className="flex flex-col gap-2 text-sm font-medium">
                    <span>Recipient</span>
                    <Select value={mode} onValueChange={(value) => setMode(value as typeof mode)}>
                        <SelectTrigger className="w-full">
                            <SelectValue>
                                {mode === "TEAM"
                                    ? "Specific team"
                                    : mode === "ALL_TEAMS"
                                      ? "All approved teams"
                                      : "Specific email"}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="TEAM">Specific team</SelectItem>
                                <SelectItem value="ALL_TEAMS">All approved teams</SelectItem>
                                <SelectItem value="EMAIL">Specific email</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col gap-2 text-sm font-medium">
                    <span>Delivery channel</span>
                    <Select value={channel} onValueChange={(value) => value && setChannel(value as typeof channel)}>
                        <SelectTrigger className="w-full">
                            <SelectValue>
                                {channel === "EMAIL"
                                    ? "Email only"
                                    : channel === "IN_APP"
                                      ? "In-app only"
                                      : "Email and in-app"}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="EMAIL">Email only</SelectItem>
                                <SelectItem value="IN_APP">In-app only</SelectItem>
                                <SelectItem value="BOTH">Email and in-app</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                {mode === "TEAM" && (
                    <Select
                        required
                        value={teamId}
                        onValueChange={(value) => {
                            if (value !== null) setTeamId(value);
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choose a team">
                                {teams.find((team) => team.id === teamId)?.displayName ?? "Choose a team"}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {teams.map((team) => (
                                    <SelectItem key={team.id} value={team.id}>
                                        <span className="flex flex-col">
                                            <span>{team.displayName}</span>
                                            <span className="text-xs text-muted-foreground">@{team.loginName}</span>
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
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
