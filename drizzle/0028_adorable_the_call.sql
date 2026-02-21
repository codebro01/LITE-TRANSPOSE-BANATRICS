CREATE INDEX "bank_details_user_id_idx" ON "bank_details" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "campaign_designs_campaign_id_idx" ON "campaign_designs" USING btree ("campaignId");--> statement-breakpoint
CREATE INDEX "campaign_user_id_idx" ON "campaigns" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "campaign_id_user_id_idx" ON "campaigns" USING btree ("userId","id");--> statement-breakpoint
CREATE INDEX "campaign_drafts_by_id_idx" ON "campaigns" USING btree ("userId","status_type");--> statement-breakpoint
CREATE INDEX "campaigns_status_idx" ON "campaigns" USING btree ("status_type");--> statement-breakpoint
CREATE INDEX "campaigns_payment_status_active_idx" ON "campaigns" USING btree ("id","status_type","active");--> statement-breakpoint
CREATE INDEX "campaigns_status_active_idx" ON "campaigns" USING btree ("status_type","active");--> statement-breakpoint
CREATE INDEX "idx_campaign_status_payment" ON "campaigns" USING btree ("status_type","payment_status");--> statement-breakpoint
CREATE INDEX "idx_campaign_status_payment_userId" ON "campaigns" USING btree ("userId","status_type","payment_status");--> statement-breakpoint
CREATE INDEX "idx_campaign_userId_paymentStatus_spentAt" ON "campaigns" USING btree ("userId","payment_status","spent_at");--> statement-breakpoint
CREATE INDEX "idx_campaign_active_payment " ON "campaigns" USING btree ("active","payment_status");--> statement-breakpoint
CREATE INDEX "idx_campaign_id_userId " ON "campaigns" USING btree ("id","userId");--> statement-breakpoint
CREATE INDEX "idx_driver_campaign_userId_campaignId " ON "driver_campaigns" USING btree ("campaignId","userId");--> statement-breakpoint
CREATE INDEX "idx_driver_campaign_userId " ON "driver_campaigns" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_driver_campaign_campaignId " ON "driver_campaigns" USING btree ("campaignId");--> statement-breakpoint
CREATE INDEX "idx_driver_campaign_status" ON "driver_campaigns" USING btree ("campaign_status","userId");--> statement-breakpoint
CREATE INDEX "idx_driver_campaign_userId_active_campaign_status" ON "driver_campaigns" USING btree ("campaign_status","userId","active_status");--> statement-breakpoint
CREATE INDEX "idx_driver_campaign_userId_active_campaign_status_campaignId" ON "driver_campaigns" USING btree ("campaign_status","userId","active_status","campaignId");--> statement-breakpoint
CREATE INDEX "idx_earnings_userId_approved" ON "earnings" USING btree ("userId","approved");--> statement-breakpoint
CREATE INDEX "idx_earnings_approved" ON "earnings" USING btree ("approved");--> statement-breakpoint
CREATE INDEX "idx_earnings_userId" ON "earnings" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_earnings_userId_updatedAt_approved" ON "earnings" USING btree ("userId","updated_at","approved");--> statement-breakpoint
CREATE INDEX "idx_earnings_userId_approved_recipientCode" ON "earnings" USING btree ("userId","recipient_code","approved");--> statement-breakpoint
CREATE INDEX "idx_emailVerification_email" ON "email_verifications" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_emailVerification_email_used" ON "email_verifications" USING btree ("email","used");--> statement-breakpoint
CREATE INDEX "idx_businessOwners_userId" ON "businessOwners" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_businessOwners_userId_balance" ON "businessOwners" USING btree ("userId","balance");--> statement-breakpoint
CREATE INDEX "idx_drivers_userId" ON "drivers" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_phone" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_users_phone_email" ON "users" USING btree ("email","phone");--> statement-breakpoint
CREATE INDEX "idx_payments_reference_userId" ON "payments" USING btree ("userId","reference");--> statement-breakpoint
CREATE INDEX "idx_payments_userId" ON "payments" USING btree ("userId","userId");--> statement-breakpoint
CREATE INDEX "idx_payments_reference" ON "payments" USING btree ("reference");--> statement-breakpoint
CREATE INDEX "idx_passwordReset_email" ON "password_resets" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_passwordReset_email_used" ON "password_resets" USING btree ("email","used");--> statement-breakpoint
CREATE INDEX "idx_passwordReset_userId" ON "password_resets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_weeklyProofs_userId" ON "weekly_proofs" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_weeklyProofs_userId_id" ON "weekly_proofs" USING btree ("id","userId");--> statement-breakpoint
CREATE INDEX "idx_weeklyProofs_userId_campaignId_year_weekNumber" ON "weekly_proofs" USING btree ("userId","campaignId","week_number","year");--> statement-breakpoint
CREATE INDEX "idx_vehicleDetails_userId" ON "vehicle_details" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_vehicleDetails_userId_id" ON "vehicle_details" USING btree ("userId","id");--> statement-breakpoint
CREATE INDEX "idx_invoices_campaignId_userId" ON "invoices" USING btree ("campaignId","userId");--> statement-breakpoint
CREATE INDEX "idx_installmentProofs_userId_campaignId" ON "installment_proofs" USING btree ("userId","campaignId");--> statement-breakpoint
CREATE INDEX "idx_installmentProofs_userId_campaignId_statusType" ON "installment_proofs" USING btree ("userId","campaignId","installment_proof_status");--> statement-breakpoint
CREATE INDEX "idx_notifications_role_userId" ON "notifications" USING btree ("userId","role");--> statement-breakpoint
CREATE INDEX "idx_notifications_id_userId" ON "notifications" USING btree ("userId","id");--> statement-breakpoint
CREATE INDEX "idx_notifications_userId" ON "notifications" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_notifications_userId_status_category" ON "notifications" USING btree ("userId","category","status");--> statement-breakpoint
CREATE INDEX "idx_notifications_userId_status" ON "notifications" USING btree ("userId","status");--> statement-breakpoint
CREATE INDEX "idx_notifications_userId_category" ON "notifications" USING btree ("userId","category");