-- CreateTable
CREATE TABLE "event_schedule_item" (
    "id" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "time" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "event_schedule_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_schedule_item_day_sortOrder_idx" ON "event_schedule_item"("day", "sortOrder");
