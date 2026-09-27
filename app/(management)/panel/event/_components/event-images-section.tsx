"use client";

import { ImageIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import { FileUpload } from "@/components/file-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = {
    imageUrls: string[];
    onAdd: (url: string) => void;
    onRemove: (index: number) => void;
};

export function EventImagesSection({ imageUrls, onAdd, onRemove }: Props) {
    return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2">
                <ImageIcon className="size-5 text-orange-500" />
                <h2 className="text-lg font-semibold">Event images</h2>
                {imageUrls.length > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                        {imageUrls.length}
                    </Badge>
                )}
            </div>
            <p className="mt-1 text-sm text-zinc-500">
                Upload images to display on the event page. The first image is used as the primary banner.
            </p>

            {imageUrls.length > 0 && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {imageUrls.map((url, index) => (
                        <div
                            key={url}
                            className="group relative overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800"
                        >
                            <Image
                                src={url}
                                alt={`Event banner ${index + 1}`}
                                width={400}
                                height={225}
                                className="aspect-video w-full object-cover"
                                unoptimized
                            />
                            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/40">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute right-2 top-2 size-8 opacity-0 transition-opacity group-hover:opacity-100"
                                    onClick={() => onRemove(index)}
                                >
                                    <Trash2 />
                                </Button>
                            </div>
                            {index === 0 && (
                                <Badge className="absolute left-2 top-2" variant="default">
                                    Primary
                                </Badge>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4">
                <FileUpload
                    category="event-image"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onUploadComplete={(url) => onAdd(url)}
                    label="Add event image"
                />
            </div>
        </section>
    );
}
