-- CreateTable
CREATE TABLE "BirthdayPage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipientName" TEXT NOT NULL,
    "birthdayDate" DATETIME,
    "message" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'elegant',
    "audioEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "pageId" TEXT NOT NULL,
    CONSTRAINT "Photo_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "BirthdayPage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
