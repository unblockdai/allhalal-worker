import {  pgTable, serial, varchar, timestamp, integer, text, boolean, jsonb, doublePrecision, pgEnum } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';

// Enums
export const certificationTypeEnum = pgEnum('certification_type', ['HALAL', 'ZABIHAH']);
export const certificationStatusEnum = pgEnum('certification_status', ['CERTIFIED', 'PENDING', 'EXPIRED', 'REVOKED']);
export const restaurantTypeEnum = pgEnum('restaurant_type', ['CASUAL', 'FINE_DINING', 'FAST_FOOD', 'CAFE']);
export const storeTypeEnum = pgEnum('store_type', ['GROCERY', 'BUTCHER', 'SUPERMARKET', 'SPECIALTY']);

// Tables

export const addresses = pgTable('addresses', {
  id: serial('id').primaryKey(),
  street: varchar('street').notNull(),
  city: varchar('city').notNull(),
  state: varchar('state').notNull(),
  zipCode: varchar('zip_code').notNull(),
  country: varchar('country').notNull().default('USA'),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const certifiers = pgTable('certifiers', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  website: varchar('website'),
  logoUrl: varchar('logo_url'),
  contactEmail: varchar('contact_email'),
  contactPhone: varchar('contact_phone'),
  certificationType: certificationTypeEnum('certification_type').notNull(),
  certificationSince: timestamp('certification_since'),
  lastInspectionDate: timestamp('last_inspection_date'),
  certificationExpiry: timestamp('certification_expiry'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const entityCertifications = pgTable('entity_certifications', {
  id: serial('id').primaryKey(),
  entityType: varchar('entity_type').notNull(),
  entityId: integer('entity_id').notNull(),
  certifierId: integer('certifier_id').references(() => certifiers.id),
  certificationStatus: certificationStatusEnum('certification_status').notNull().default('CERTIFIED'),
  certifiedSince: timestamp('certified_since'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const meatHouses = pgTable('meat_houses', {
  id: serial('id').primaryKey(),
  externalId: varchar('external_id'),
  name: varchar('name').notNull(),
  description: text('description'),
  addressId: integer('address_id').references(() => addresses.id),
  phone: varchar('phone'),
  email: varchar('email'),
  meatTypes: text('meat_types').array().notNull()
    .default(sql`'{}'::text[]`),
  slaughterMethods: text('slaughter_methods').array().notNull()
    .default(sql`'{}'::text[]`),
  businessHours: jsonb('business_hours'),
  socialMedia: jsonb('social_media'),
  wholesaleAvailable: boolean('wholesale_available'),
  retailAvailable: boolean('retail_available'),
  ratings: jsonb('ratings'),
  reviews: jsonb('reviews'),
  images: text('images').array().notNull()
    .default(sql`'{}'::text[]`),
  lastUpdated: timestamp('last_updated'),
  additionalNotes: text('additional_notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const restaurants = pgTable('restaurants', {
  id: serial('id').primaryKey(),
  externalId: varchar('external_id'),
  name: varchar('name').notNull(),
  description: text('description'),
  addressId: integer('address_id').references(() => addresses.id),
  phone: varchar('phone'),
  email: varchar('email'),
  cuisineTypes: text('cuisine_types').array().notNull()
    .default(sql`'{}'::text[]`),
  specialties: text('specialties').array().notNull()
    .default(sql`'{}'::text[]`),
  priceRange: varchar('price_range'),
  restaurantType: restaurantTypeEnum('restaurant_type'),
  businessHours: jsonb('business_hours'),
  socialMedia: jsonb('social_media'),
  menu: jsonb('menu'),
  ratings: jsonb('ratings'),
  reviews: jsonb('reviews'),
  deliveryOptions: text('delivery_options').array().notNull()
    .default(sql`'{}'::text[]`),
  takeoutAvailable: boolean('takeout_available'),
  reservationsAvailable: boolean('reservations_available'),
  hasAlcohol: boolean('has_alcohol').notNull().default(false),
  images: text('images').array().notNull()
    .default(sql`'{}'::text[]`),
  lastUpdated: timestamp('last_updated'),
  additionalNotes: text('additional_notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const stores = pgTable('stores', {
  id: serial('id').primaryKey(),
  externalId: varchar('external_id'),
  name: varchar('name').notNull(),
  description: text('description'),
  addressId: integer('address_id').references(() => addresses.id),
  phone: varchar('phone'),
  email: varchar('email'),
  storeType: storeTypeEnum('store_type').notNull(),
  businessHours: jsonb('business_hours'),
  socialMedia: jsonb('social_media'),
  productCategories: text('product_categories').array().notNull()
    .default(sql`'{}'::text[]`),
  ratings: jsonb('ratings'),
  reviews: jsonb('reviews'),
  deliveryAvailable: boolean('delivery_available'),
  onlineOrdering: boolean('online_ordering'),
  images: text('images').array().notNull()
    .default(sql`'{}'::text[]`),
  lastUpdated: timestamp('last_updated'),
  additionalNotes: text('additional_notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Relations

export const addressesRelations = relations(addresses, ({ many }) => ({
  restaurants: many(restaurants),
  stores: many(stores),
  meatHouses: many(meatHouses),
}));

export const certifiersRelations = relations(certifiers, ({ many }) => ({
  entityCertifications: many(entityCertifications),
}));

export const entityCertificationsRelations = relations(entityCertifications, ({ one }) => ({
  certifier: one(certifiers, {
    fields: [entityCertifications.certifierId],
    references: [certifiers.id],
  }),
}));
