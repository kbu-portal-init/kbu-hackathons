"use client";

import { GripVertical, ImageIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import { ReactSortable } from "react-sortablejs";
import { FileUpload } from "@/components/file-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = {
    imageUrls: string[];
    onAdd: (url: string) => void;
    onRemove: (index: number) => void;
    onReorder: (imageUrls: string[]) => void;
};

type SortableImage = {
    id: string;
    url: string;
};

export function EventImagesSection({ imageUrls, onAdd, onRemove, onReorder }: Props) {
    const sortableImages: SortableImage[] = imageUrls.map((url) => ({ id: url, url }));

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
                Upload images to display on the event page. Drag the handle in the corner to reorder them. The first
                image is used as the primary banner.
            </p>

            {imageUrls.length > 0 && (
                <ReactSortable
                    list={sortableImages}
                    setList={(nextImages) => onReorder(nextImages.map((image) => image.url))}
                    handle=".event-image-drag-handle"
                    animation={150}
                    className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {sortableImages.map(({ id, url }, index) => (
                        <div
                            key={id}
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
                                <button
                                    type="button"
                                    className="event-image-drag-handle absolute right-12 top-2 z-10 flex size-8 touch-none cursor-grab items-center justify-center rounded-md bg-black/60 text-white opacity-100 transition-opacity active:cursor-grabbing sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                    aria-label={`Reorder event image ${index + 1}`}
                                    title="Drag to reorder"
                                >
                                    <GripVertical className="size-4" aria-hidden="true" />
                                </button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute right-2 top-2 size-8 bg-destructive text-destructive-foreground opacity-100 transition-opacity hover:bg-destructive/90 sm:opacity-0 sm:group-hover:opacity-100"
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
                </ReactSortable>
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
