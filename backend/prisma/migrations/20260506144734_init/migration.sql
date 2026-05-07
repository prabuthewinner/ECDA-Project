-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('OPERATOR', 'OFFICER');

-- CreateEnum
CREATE TYPE "public"."ApplicationStatus" AS ENUM ('APPLICATION_RECEIVED', 'UNDER_REVIEW', 'PENDING_PRE_SITE_RESUBMISSION', 'PRE_SITE_RESUBMITTED', 'SITE_VISIT_SCHEDULED', 'SITE_VISIT_DONE', 'AWAITING_POST_SITE_CLARIFICATION', 'PENDING_POST_SITE_RESUBMISSION', 'POST_SITE_CLARIFICATION_RESUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."DocumentVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('STATUS_CHANGED', 'FEEDBACK_ADDED', 'RESUBMISSION_RECEIVED', 'CHECKLIST_SUBMITTED');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."applications" (
    "id" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "status" "public"."ApplicationStatus" NOT NULL DEFAULT 'APPLICATION_RECEIVED',
    "round" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."application_sections" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "isUpdated" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "application_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."documents" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "verificationStatus" "public"."DocumentVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verificationNote" TEXT,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."officer_feedbacks" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "officerId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "sectionKey" TEXT,
    "documentId" TEXT,
    "comment" TEXT NOT NULL,
    "templateId" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "officer_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."comment_templates" (
    "id" TEXT NOT NULL,
    "sectionKey" TEXT,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comment_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."submission_rounds" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "applicationId" TEXT,
    "type" "public"."NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."checklist_items" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "itemKey" TEXT NOT NULL,
    "itemLabel" TEXT NOT NULL,
    "officerComment" TEXT,
    "needsClarification" BOOLEAN NOT NULL DEFAULT false,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."checklist_responses" (
    "id" TEXT NOT NULL,
    "checklistItemId" TEXT NOT NULL,
    "round" INTEGER NOT NULL DEFAULT 1,
    "operatorComment" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checklist_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."checklist_response_documents" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checklist_response_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "application_sections_applicationId_sectionKey_key" ON "public"."application_sections"("applicationId", "sectionKey");

-- CreateIndex
CREATE UNIQUE INDEX "submission_rounds_applicationId_round_key" ON "public"."submission_rounds"("applicationId", "round");

-- CreateIndex
CREATE UNIQUE INDEX "checklist_items_applicationId_itemKey_key" ON "public"."checklist_items"("applicationId", "itemKey");

-- AddForeignKey
ALTER TABLE "public"."applications" ADD CONSTRAINT "applications_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."application_sections" ADD CONSTRAINT "application_sections_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."officer_feedbacks" ADD CONSTRAINT "officer_feedbacks_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."officer_feedbacks" ADD CONSTRAINT "officer_feedbacks_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."officer_feedbacks" ADD CONSTRAINT "officer_feedbacks_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."officer_feedbacks" ADD CONSTRAINT "officer_feedbacks_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."comment_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submission_rounds" ADD CONSTRAINT "submission_rounds_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."checklist_items" ADD CONSTRAINT "checklist_items_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."checklist_responses" ADD CONSTRAINT "checklist_responses_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES "public"."checklist_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."checklist_response_documents" ADD CONSTRAINT "checklist_response_documents_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "public"."checklist_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
