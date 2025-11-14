import { relations } from "drizzle-orm/relations";
import { users, payments, businessOwners, drivers, campaigns } from "./schema";

export const paymentsRelations = relations(payments, ({one}) => ({
	user: one(users, {
		fields: [payments.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	payments: many(payments),
	businessOwners: many(businessOwners),
	drivers: many(drivers),
	campaigns: many(campaigns),
}));

export const businessOwnersRelations = relations(businessOwners, ({one}) => ({
	user: one(users, {
		fields: [businessOwners.userId],
		references: [users.id]
	}),
}));

export const driversRelations = relations(drivers, ({one}) => ({
	user: one(users, {
		fields: [drivers.userId],
		references: [users.id]
	}),
}));

export const campaignsRelations = relations(campaigns, ({one}) => ({
	user: one(users, {
		fields: [campaigns.userId],
		references: [users.id]
	}),
}));