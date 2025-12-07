import { relations } from "drizzle-orm/relations";
import { users, packages, passwordResets, drivers, campaigns, businessOwners, notifications, weeklyProofs, payments, bankDetails, earnings, driverCampaigns } from "./schema";

export const packagesRelations = relations(packages, ({one}) => ({
	user: one(users, {
		fields: [packages.adminId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	packages: many(packages),
	passwordResets: many(passwordResets),
	drivers: many(drivers),
	campaigns: many(campaigns),
	businessOwners: many(businessOwners),
	notifications: many(notifications),
	payments: many(payments),
	bankDetails: many(bankDetails),
	driverCampaigns: many(driverCampaigns),
}));

export const passwordResetsRelations = relations(passwordResets, ({one}) => ({
	user: one(users, {
		fields: [passwordResets.userId],
		references: [users.id]
	}),
}));

export const driversRelations = relations(drivers, ({one}) => ({
	user: one(users, {
		fields: [drivers.userId],
		references: [users.id]
	}),
}));

export const campaignsRelations = relations(campaigns, ({one, many}) => ({
	user: one(users, {
		fields: [campaigns.userId],
		references: [users.id]
	}),
	weeklyProofs: many(weeklyProofs),
	payments: many(payments),
	earnings: many(earnings),
	driverCampaigns: many(driverCampaigns),
}));

export const businessOwnersRelations = relations(businessOwners, ({one}) => ({
	user: one(users, {
		fields: [businessOwners.userId],
		references: [users.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
}));

export const weeklyProofsRelations = relations(weeklyProofs, ({one}) => ({
	campaign: one(campaigns, {
		fields: [weeklyProofs.campaignId],
		references: [campaigns.id]
	}),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	user: one(users, {
		fields: [payments.userId],
		references: [users.id]
	}),
	campaign: one(campaigns, {
		fields: [payments.campaignId],
		references: [campaigns.id]
	}),
}));

export const bankDetailsRelations = relations(bankDetails, ({one}) => ({
	user: one(users, {
		fields: [bankDetails.userId],
		references: [users.id]
	}),
}));

export const earningsRelations = relations(earnings, ({one}) => ({
	campaign: one(campaigns, {
		fields: [earnings.campaignId],
		references: [campaigns.id]
	}),
}));

export const driverCampaignsRelations = relations(driverCampaigns, ({one}) => ({
	user: one(users, {
		fields: [driverCampaigns.userId],
		references: [users.id]
	}),
	campaign: one(campaigns, {
		fields: [driverCampaigns.campaignId],
		references: [campaigns.id]
	}),
}));