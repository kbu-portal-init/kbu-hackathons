"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { upsertEventSchedule } from "@/actions/management/event-schedule";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EventScheduleDTO } from "@/lib/contracts/event-schedule";

export function EventScheduleSection({ schedule }: { schedule: EventScheduleDTO }) {
    const router = useRouter();
    const [items, setItems] = useState(schedule.items);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function add(day: number) {
        setItems((prev) => [...prev, { id: crypto.randomUUID(), day, time: "", activity: "" }]);
    }
    function remove(id: string) {
        setItems((prev) => prev.filter((i) => i.id !== id));
    }
    function update(id: string, field: "time" | "activity" | "day", value: string | number) {
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
    }

    async function save() {
        setSaving(true);
        setError(null);
        const result = await upsertEventSchedule({
            items: items.map(({ day, time, activity }) => ({ day, time, activity })),
        });
        setSaving(false);
        if (!result.ok) {
            setError(result.error.message);
            return;
        }
        router.refresh();
    }

    return (
        <div className="space-y-6">
            {[1, 2].map((day) => (
                <div key={day} className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="font-display text-lg font-bold">Day {day}</h3>
                        <Button type="button" variant="secondary" onClick={() => add(day)}>
                            Add row
                        </Button>
                    </div>
                    {items
                        .filter((i) => i.day === day)
                        .map((item) => (
                            <div key={item.id} className="flex gap-2">
                                <Input
                                    value={item.time}
                                    onChange={(e) => update(item.id, "time", e.target.value)}
                                    placeholder="7:00 PM - 8:00 AM"
                                    className="w-48"
                                />
                                <Input
                                    value={item.activity}
                                    onChange={(e) => update(item.id, "activity", e.target.value)}
                                    placeholder="Registration"
                                />
                                <Button type="button" variant="destructive" onClick={() => remove(item.id)}>
                                    Remove
                                </Button>
                            </div>
                        ))}
                </div>
            ))}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="button" onClick={save} disabled={saving}>
                {saving ? "Saving..." : "Save schedule"}
            </Button>
        </div>
    );
}
