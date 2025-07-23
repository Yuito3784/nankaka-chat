-- CreateTable
CREATE TABLE "History" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symptom" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "urgency" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "homeCare" TEXT NOT NULL,
    "warningSymptoms" TEXT NOT NULL,
    "additionalDepartments" TEXT NOT NULL,
    "helpfulToTellDoctor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "History_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "History_userId_idx" ON "History"("userId");

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
