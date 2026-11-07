-- CreateTable
CREATE TABLE "BirthdayPage" (
    "id" TEXT NOT NULL,
    "editToken" TEXT,
    "recipientName" TEXT NOT NULL,
    "birthdayDate" TIMESTAMP(3),
    "message" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'elegant',
    "audioEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "reminderEmail" TEXT,
    "reminderPhone" TEXT,
    "reminderSentFor" INTEGER,
    "reminderOptOutAt" TIMESTAMP(3),
    "age" INTEGER,
    "senderName" TEXT,
    "relationship" TEXT,
    "music" TEXT DEFAULT 'classic',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "loves" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT,
    "isVip" BOOLEAN NOT NULL DEFAULT false,
    "isVipPro" BOOLEAN NOT NULL DEFAULT false,
    "isGroup" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BirthdayPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "pageId" TEXT NOT NULL,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportEvent" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "amount" INTEGER,
    "path" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PremiumOrder" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'razorpay',
    "orderId" TEXT NOT NULL,
    "paymentId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'created',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "pageId" TEXT,
    "tier" TEXT DEFAULT 'universe',
    "unlockToken" TEXT,
    "snapshotUrl" TEXT,
    "buyerContact" TEXT,
    "receiptSentAt" TIMESTAMP(3),
    "failureCode" TEXT,
    "failureReason" TEXT,
    "failureMethod" TEXT,
    "failedAt" TIMESTAMP(3),
    "recoverySentAt" TIMESTAMP(3),

    CONSTRAINT "PremiumOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardDelivery" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "recipientEmail" TEXT,
    "recipientName" TEXT,
    "creatorEmail" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'email',
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupWish" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "emoji" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupWish_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareEvent" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'card_footer',
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BirthdayPage_editToken_key" ON "BirthdayPage"("editToken");

-- CreateIndex
CREATE INDEX "Photo_pageId_idx" ON "Photo"("pageId");

-- CreateIndex
CREATE INDEX "SupportEvent_event_createdAt_idx" ON "SupportEvent"("event", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PremiumOrder_orderId_key" ON "PremiumOrder"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "PremiumOrder_unlockToken_key" ON "PremiumOrder"("unlockToken");

-- CreateIndex
CREATE INDEX "PremiumOrder_status_createdAt_idx" ON "PremiumOrder"("status", "createdAt");

-- CreateIndex
CREATE INDEX "PremiumOrder_pageId_idx" ON "PremiumOrder"("pageId");

-- CreateIndex
CREATE INDEX "PremiumOrder_status_recoverySentAt_createdAt_idx" ON "PremiumOrder"("status", "recoverySentAt", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CardDelivery_pageId_key" ON "CardDelivery"("pageId");

-- CreateIndex
CREATE INDEX "CardDelivery_status_scheduledAt_idx" ON "CardDelivery"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "GroupWish_pageId_createdAt_idx" ON "GroupWish"("pageId", "createdAt");

-- CreateIndex
CREATE INDEX "ShareEvent_createdAt_idx" ON "ShareEvent"("createdAt");

-- CreateIndex
CREATE INDEX "ShareEvent_pageId_channel_sessionId_createdAt_idx" ON "ShareEvent"("pageId", "channel", "sessionId", "createdAt");

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "BirthdayPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardDelivery" ADD CONSTRAINT "CardDelivery_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "BirthdayPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupWish" ADD CONSTRAINT "GroupWish_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "BirthdayPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

