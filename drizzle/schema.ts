import { pgTable, foreignKey, uuid, integer, varchar, timestamp, unique, boolean, index, doublePrecision, jsonb, text, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const categoryType = pgEnum("category_type", ['payment', 'campaign'])
export const driverCampaignStatusType = pgEnum("driver_campaign_status_type", ['completed', 'pending_approval', 'due_soon', 'approved'])
export const maintenanceType = pgEnum("maintenance_type", ['basic', 'standard', 'premium'])
export const notificationStatusType = pgEnum("notification_status_type", ['read', 'unread'])
export const packageType = pgEnum("package_type", ['starter', 'basic', 'premium', 'custom'])
export const paymentStatus = pgEnum("payment_status", ['spent', 'pending'])
export const statusType = pgEnum("status_type", ['draft', 'active', 'pending', 'completed'])
export const variantType = pgEnum("variant_type", ['info', 'success', 'warning', 'danger'])
export const weeklyProofStatusType = pgEnum("weekly_proof_status_type", ['approved', 'pending_review', 'rejected'])


export const packages = pgTable("packages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	adminId: uuid().notNull(),
	duration: integer().notNull(),
	revisions: varchar().notNull(),
	price: integer().notNull(),
	lgaCoverage: varchar("lga_coverage", { length: 10 }).notNull(),
	noOfDrivers: integer("no_of_drivers").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	packageType: packageType("package_type").notNull(),
	maintenanceType: maintenanceType("maintenance_type").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.adminId],
			foreignColumns: [users.id],
			name: "packages_adminId_users_id_fk"
		}).onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	phone: varchar({ length: 50 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	isEmailVerified: boolean("is_email_Verified").default(false).notNull(),
	refreshToken: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	role: varchar({ length: 50 }).array().default(["businessOwner"]).notNull(),
}, (table) => [
	unique("users_phone_unique").on(table.phone),
	unique("users_email_unique").on(table.email),
]);

export const passwordResets = pgTable("password_resets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	email: varchar({ length: 255 }).notNull(),
	passwordResetCode: varchar("password_reset_code").notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	attempts: integer().default(0).notNull(),
	used: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("email_code_expires_at_idx").using("btree", table.expiresAt.asc().nullsLast().op("timestamp_ops")),
	index("email_verification_code_epxps").using("btree", table.email.asc().nullsLast().op("timestamp_ops"), table.expiresAt.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "password_resets_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("password_resets_user_id_unique").on(table.userId),
	unique("password_resets_email_unique").on(table.email),
]);

export const drivers = pgTable("drivers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	dp: varchar({ length: 255 }),
	balance: doublePrecision().default(0).notNull(),
	pending: doublePrecision().default(0).notNull(),
	fullName: varchar("full_name", { length: 255 }).default('Null Driver').notNull(),
	nin: varchar({ length: 12 }).notNull(),
	state: varchar({ length: 50 }).notNull(),
	lga: varchar({ length: 50 }).notNull(),
	frontview: jsonb().notNull(),
	backview: jsonb().notNull(),
	sideview: jsonb().notNull(),
	driverLicense: jsonb("driver_license"),
	ownershipDocument: jsonb("ownership_document"),
	approvedStatus: boolean("approved_status").default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "drivers_userId_users_id_fk"
		}).onDelete("cascade"),
	unique("drivers_nin_unique").on(table.nin),
]);

export const campaigns = pgTable("campaigns", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	packageType: packageType("package_type"),
	statusType: statusType("status_type"),
	revisions: varchar(),
	price: integer(),
	noOfDrivers: integer("no_of_drivers"),
	campaignName: varchar("campaign_name", { length: 255 }),
	campaignDescriptions: text("campaign_descriptions"),
	startDate: timestamp("start_date", { mode: 'string' }),
	endDate: timestamp("end_date", { mode: 'string' }),
	companyLogo: jsonb("company_logo"),
	colorPallete: varchar("color_pallete").array(),
	callToAction: text("call_to_action"),
	mainMessage: text("main_message"),
	responseOnSeeingBanner: text("response_on_seeing_banner"),
	uploadedImages: jsonb("uploaded_images").default([]),
	slogan: varchar({ length: 500 }),
	userId: uuid().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	paymentStatus: paymentStatus("payment_status"),
	spentAt: timestamp("spent_at", { mode: 'string' }),
	duration: integer().default(30).notNull(),
	maintenanceType: maintenanceType("maintenance_type"),
	lgaCoverage: varchar("lga_coverage", { length: 10 }),
	availability: integer(),
	state: varchar({ length: 100 }),
	bannerDetails: jsonb("banner_details"),
	earningPerDriver: integer("earning_per_driver"),
	requirements: text(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "campaigns_userId_users_id_fk"
		}).onDelete("cascade"),
]);

export const businessOwners = pgTable("businessOwners", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessAddress: varchar({ length: 255 }),
	refreshToken: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	businessName: varchar({ length: 255 }).notNull(),
	businessLogo: varchar({ length: 255 }),
	userId: uuid().notNull(),
	balance: doublePrecision().default(0).notNull(),
	pending: doublePrecision().default(0).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "businessOwners_userId_users_id_fk"
		}).onDelete("cascade"),
	unique("businessOwners_userId_unique").on(table.userId),
]);

export const notifications = pgTable("notifications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid().notNull(),
	title: text().notNull(),
	message: text().notNull(),
	status: notificationStatusType().default('unread').notNull(),
	category: categoryType().notNull(),
	priority: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	variant: variantType().default('info').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notifications_userId_users_id_fk"
		}).onDelete("cascade"),
]);

export const emailVerifications = pgTable("email_verifications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	emailVerificationCode: varchar("email_verification_code").notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	attempts: integer().default(0).notNull(),
	used: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	phone: varchar({ length: 255 }).notNull(),
	nin: varchar({ length: 255 }),
}, (table) => [
	index("email_expires_idx").using("btree", table.email.asc().nullsLast().op("text_ops"), table.expiresAt.asc().nullsLast().op("timestamp_ops")),
	index("expires_at_idx").using("btree", table.expiresAt.asc().nullsLast().op("timestamp_ops")),
	unique("email_verifications_email_unique").on(table.email),
	unique("email_verifications_phone_unique").on(table.phone),
]);

export const weeklyProofs = pgTable("weekly_proofs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	campaignId: uuid().notNull(),
	frontview: jsonb().notNull(),
	backview: jsonb().notNull(),
	sideview: jsonb().notNull(),
	comment: text(),
	weeklyProofStatus: weeklyProofStatusType("weekly_proof_status").default('pending_review'),
	rejectionReason: text("rejection_reason"),
	month: integer(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	userId: uuid().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.campaignId],
			foreignColumns: [campaigns.id],
			name: "weekly_proofs_campaignId_campaigns_id_fk"
		}).onDelete("cascade"),
]);

export const payments = pgTable("payments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid().notNull(),
	invoiceId: text("invoice_id"),
	reference: text(),
	campaignId: uuid("campaign_id").notNull(),
	dateInitiated: text("date_initiated"),
	amount: doublePrecision().notNull(),
	paymentMethod: text("payment_method").notNull(),
	paymentStatus: text("payment_status").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "payments_userId_users_id_fk"
		}),
	foreignKey({
			columns: [table.campaignId],
			foreignColumns: [campaigns.id],
			name: "payments_campaign_id_campaigns_id_fk"
		}).onDelete("cascade"),
]);

export const bankDetails = pgTable("bank_details", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid().notNull(),
	accountNumber: varchar("account_number", { length: 10 }).notNull(),
	accountName: varchar("account_name", { length: 255 }).notNull(),
	bankId: integer().notNull(),
	bankCode: integer("bank_code").notNull(),
	transferRecipientCode: varchar("transfer_recipient_code", { length: 255 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "bank_details_userId_users_id_fk"
		}),
]);

export const earnings = pgTable("earnings", {
	campaignId: uuid(),
	amount: doublePrecision().notNull(),
	reference: text(),
	dateInitiated: text("date_initiated"),
	paymentMethod: text("payment_method").notNull(),
	recipientCode: varchar("recipient_code", { length: 255 }).notNull(),
	paymentStatus: text("payment_status").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.campaignId],
			foreignColumns: [campaigns.id],
			name: "earnings_campaignId_campaigns_id_fk"
		}).onDelete("cascade"),
]);

export const driverCampaigns = pgTable("driver_campaigns", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid().notNull(),
	campaignId: uuid().notNull(),
	campaignStatus: driverCampaignStatusType("campaign_status").default('pending_approval'),
	activeStatus: boolean("active_status").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "driver_campaigns_userId_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.campaignId],
			foreignColumns: [campaigns.id],
			name: "driver_campaigns_campaignId_campaigns_id_fk"
		}).onDelete("cascade"),
]);
