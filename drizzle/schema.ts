import { pgTable, uuid, varchar, boolean, timestamp, foreignKey, text, doublePrecision, integer, jsonb, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const packageType = pgEnum("package_type", ['starter', 'basic', 'premium', 'custom'])
export const paymentStatus = pgEnum("payment_status", ['spent', 'pending', 'Null'])
export const statusType = pgEnum("status_type", ['draft', 'active', 'pending', 'completed'])


export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	phone: varchar({ length: 50 }).notNull(),
	role: varchar({ length: 50 }).default('driver').notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	isEmailVerified: boolean("is_email_Verified").default(false).notNull(),
	refreshToken: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const payments = pgTable("payments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid().notNull(),
	invoiceId: text("invoice_id"),
	reference: text(),
	campaignName: text("campaign_name").notNull(),
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
]);

export const businessOwners = pgTable("businessOwners", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	businessAddress: varchar({ length: 255 }),
	refreshToken: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	businessName: varchar({ length: 255 }).notNull(),
	businessLogo: varchar({ length: 255 }),
	userId: uuid(),
	balance: doublePrecision().default(0).notNull(),
	pending: doublePrecision().default(0).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "businessOwners_userId_users_id_fk"
		}),
]);

export const drivers = pgTable("drivers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid(),
	role: varchar({ length: 10 }).default('user').notNull(),
	fullName: varchar({ length: 255 }).notNull(),
	refreshToken: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	dp: varchar({ length: 255 }),
	balance: doublePrecision().default(0).notNull(),
	pending: doublePrecision().default(0).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "drivers_userId_users_id_fk"
		}),
]);

export const campaigns = pgTable("campaigns", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	packageType: packageType("package_type"),
	statusType: statusType("status_type"),
	duration: varchar(),
	revisions: varchar(),
	price: integer(),
	noOfDrivers: integer("no_of_drivers"),
	campaignName: varchar("campaign_name", { length: 255 }),
	campaignDescriptions: text("campaign_descriptions"),
	startDate: timestamp("start_date", { mode: 'string' }),
	endDate: timestamp("end_date", { mode: 'string' }),
	companyLogo: jsonb("company_logo"),
	colorPallete: varchar("color_pallete").array(),
	callToAction: varchar("call_to_action"),
	mainMessage: text("main_message"),
	responseOnSeeingBanner: text("response_on_seeing_banner"),
	uploadMediaFiles: jsonb("upload_media_files").default([]),
	slogan: varchar({ length: 500 }),
	userId: uuid().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	paymentAmount: doublePrecision(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "campaigns_userId_users_id_fk"
		}),
]);
