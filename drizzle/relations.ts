import { relations } from "drizzle-orm/relations";
import { users, packages, campaigns, passwordResets, businessOwners, notifications, drivers, vehicleDetails, admin, payments, bankDetails, driverCampaigns, earnings, weeklyProofs, campaignDesigns } from "./schema";

export const packagesRelations = relations(packages, ({one}) => ({
	user: one(users, {
		fields: [packages.adminId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	packages: many(packages),
	campaigns: many(campaigns),
	passwordResets: many(passwordResets),
	businessOwners: many(businessOwners),
	notifications: many(notifications),
	admins: many(admin),
	payments: many(payments),
	bankDetails: many(bankDetails),
	driverCampaigns: many(driverCampaigns),
	drivers: many(drivers),
}));

export const campaignsRelations = relations(campaigns, ({one, many}) => ({
	user: one(users, {
		fields: [campaigns.userId],
		references: [users.id]
	}),
	driverCampaigns: many(driverCampaigns),
	earnings: many(earnings),
	weeklyProofs: many(weeklyProofs),
	campaignDesigns: many(campaignDesigns),
}));

export const passwordResetsRelations = relations(passwordResets, ({one}) => ({
	user: one(users, {
		fields: [passwordResets.userId],
		references: [users.id]
	}),
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

export const vehicleDetailsRelations = relations(vehicleDetails, ({one}) => ({
	driver: one(drivers, {
		fields: [vehicleDetails.userId],
		references: [drivers.userId]
	}),
}));

export const driversRelations = relations(drivers, ({one, many}) => ({
	vehicleDetails: many(vehicleDetails),
	earnings: many(earnings),
	weeklyProofs: many(weeklyProofs),
	user: one(users, {
		fields: [drivers.userId],
		references: [users.id]
	}),
}));

export const adminRelations = relations(admin, ({one}) => ({
	user: one(users, {
		fields: [admin.userId],
		references: [users.id]
	}),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	user: one(users, {
		fields: [payments.userId],
		references: [users.id]
	}),
}));

export const bankDetailsRelations = relations(bankDetails, ({one}) => ({
	user: one(users, {
		fields: [bankDetails.userId],
		references: [users.id]
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

export const earningsRelations = relations(earnings, ({one}) => ({
	campaign: one(campaigns, {
		fields: [earnings.campaignId],
		references: [campaigns.id]
	}),
	driver: one(drivers, {
		fields: [earnings.userId],
		references: [drivers.userId]
	}),
}));

export const weeklyProofsRelations = relations(weeklyProofs, ({one}) => ({
	campaign: one(campaigns, {
		fields: [weeklyProofs.campaignId],
		references: [campaigns.id]
	}),
	driver: one(drivers, {
		fields: [weeklyProofs.userId],
		references: [drivers.userId]
	}),
}));

export const campaignDesignsRelations = relations(campaignDesigns, ({one}) => ({
	campaign: one(campaigns, {
		fields: [campaignDesigns.campaignId],
		references: [campaigns.id]
	}),
}));