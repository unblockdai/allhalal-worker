# Database Schema: halalbites

## Table: addresses

Table size: 8192 bytes
Index size: 16 kB
Total size: 24 kB

**Columns:**
- `id` integer NOT NULL DEFAULT nextval('addresses_id_seq'::regclass)
- `street` character varying NOT NULL
- `city` character varying NOT NULL
- `state` character varying NOT NULL
- `zip_code` character varying NOT NULL
- `country` character varying NOT NULL DEFAULT 'USA'::character varying
- `lat` double precision NULL
- `lng` double precision NULL
- `created_at` timestamp without time zone NOT NULL DEFAULT now()
- `updated_at` timestamp without time zone NOT NULL DEFAULT now()

**Indexes:**
- `addresses_pkey` (16 kB)
  ```sql
  CREATE UNIQUE INDEX addresses_pkey ON public.addresses USING btree (id)
  ```

**Constraints:**
- `addresses_pkey` (PRIMARY KEY)
  ```sql
  PRIMARY KEY (id)
  ```

---

## Table: certifiers

Table size: 8192 bytes
Index size: 24 kB
Total size: 32 kB

**Columns:**
- `id` integer NOT NULL DEFAULT nextval('certifiers_id_seq'::regclass)
- `name` character varying NOT NULL
- `website` character varying NULL
- `logo_url` character varying NULL
- `contact_email` character varying NULL
- `contact_phone` character varying NULL
- `certification_type` USER-DEFINED NOT NULL
- `certification_since` timestamp without time zone NULL
- `last_inspection_date` timestamp without time zone NULL
- `certification_expiry` timestamp without time zone NULL
- `created_at` timestamp without time zone NOT NULL DEFAULT now()
- `updated_at` timestamp without time zone NOT NULL DEFAULT now()

**Indexes:**
- `certifiers_pkey` (16 kB)
  ```sql
  CREATE UNIQUE INDEX certifiers_pkey ON public.certifiers USING btree (id)
  ```

**Constraints:**
- `certifiers_pkey` (PRIMARY KEY)
  ```sql
  PRIMARY KEY (id)
  ```

---

## Table: entity_certifications

Table size: 8192 bytes
Index size: 32 kB
Total size: 40 kB

**Columns:**
- `id` integer NOT NULL DEFAULT nextval('entity_certifications_id_seq'::regclass)
- `entity_type` character varying NOT NULL
- `entity_id` integer NOT NULL
- `certifier_id` integer NOT NULL
- `certification_status` USER-DEFINED NOT NULL DEFAULT 'CERTIFIED'::certification_status
- `certified_since` timestamp without time zone NULL
- `expires_at` timestamp without time zone NULL
- `created_at` timestamp without time zone NOT NULL DEFAULT now()
- `updated_at` timestamp without time zone NOT NULL DEFAULT now()

**Indexes:**
- `entity_certifications_pkey` (16 kB)
  ```sql
  CREATE UNIQUE INDEX entity_certifications_pkey ON public.entity_certifications USING btree (id)
  ```
- `entity_certifications_entity_type_entity_id_certifier_id_key` (16 kB)
  ```sql
  CREATE UNIQUE INDEX entity_certifications_entity_type_entity_id_certifier_id_key ON public.entity_certifications USING btree (entity_type, entity_id, certifier_id)
  ```

**Constraints:**
- `entity_certifications_pkey` (PRIMARY KEY)
  ```sql
  PRIMARY KEY (id)
  ```
- `entity_certifications_entity_type_entity_id_certifier_id_key` (UNIQUE)
  ```sql
  UNIQUE (entity_type, entity_id, certifier_id)
  ```
- `entity_certifications_certifier_id_fkey` (FOREIGN KEY)
  ```sql
  FOREIGN KEY (certifier_id) REFERENCES certifiers(id)
  ```
- `entity_type_check` (CHECK)
  ```sql
  CHECK (((entity_type)::text = ANY (ARRAY[('restaurant'::character varying)::text, ('store'::character varying)::text, ('meat_house'::character varying)::text])))
  ```

---

## Table: meat_houses

Table size: 8192 bytes
Index size: 24 kB
Total size: 32 kB

**Columns:**
- `id` integer NOT NULL DEFAULT nextval('meat_houses_id_seq'::regclass)
- `external_id` character varying NULL
- `name` character varying NOT NULL
- `description` text NULL
- `address_id` integer NOT NULL
- `phone` character varying NULL
- `email` character varying NULL
- `meat_types` ARRAY NOT NULL
- `slaughter_methods` ARRAY NOT NULL
- `business_hours` jsonb NULL
- `social_media` jsonb NULL
- `wholesale_available` boolean NULL
- `retail_available` boolean NULL
- `ratings` jsonb NULL
- `reviews` jsonb NULL
- `images` ARRAY NULL
- `last_updated` timestamp without time zone NULL
- `additional_notes` text NULL
- `created_at` timestamp without time zone NOT NULL DEFAULT now()
- `updated_at` timestamp without time zone NOT NULL DEFAULT now()

**Indexes:**
- `meat_houses_pkey` (16 kB)
  ```sql
  CREATE UNIQUE INDEX meat_houses_pkey ON public.meat_houses USING btree (id)
  ```

**Constraints:**
- `meat_houses_pkey` (PRIMARY KEY)
  ```sql
  PRIMARY KEY (id)
  ```
- `meat_houses_address_id_fkey` (FOREIGN KEY)
  ```sql
  FOREIGN KEY (address_id) REFERENCES addresses(id)
  ```

---

## Table: restaurants

Table size: 8192 bytes
Index size: 24 kB
Total size: 32 kB

**Columns:**
- `id` integer NOT NULL DEFAULT nextval('restaurants_id_seq'::regclass)
- `external_id` character varying NULL
- `name` character varying NOT NULL
- `description` text NULL
- `address_id` integer NOT NULL
- `phone` character varying NULL
- `email` character varying NULL
- `cuisine_types` ARRAY NULL
- `specialties` ARRAY NULL
- `price_range` character varying NULL
- `restaurant_type` USER-DEFINED NULL
- `business_hours` jsonb NULL
- `social_media` jsonb NULL
- `menu` jsonb NULL
- `ratings` jsonb NULL
- `reviews` jsonb NULL
- `delivery_options` ARRAY NULL
- `takeout_available` boolean NULL
- `reservations_available` boolean NULL
- `has_alcohol` boolean NOT NULL DEFAULT false
- `images` ARRAY NULL
- `last_updated` timestamp without time zone NULL
- `additional_notes` text NULL
- `created_at` timestamp without time zone NOT NULL DEFAULT now()
- `updated_at` timestamp without time zone NOT NULL DEFAULT now()

**Indexes:**
- `restaurants_pkey` (16 kB)
  ```sql
  CREATE UNIQUE INDEX restaurants_pkey ON public.restaurants USING btree (id)
  ```

**Constraints:**
- `restaurants_pkey` (PRIMARY KEY)
  ```sql
  PRIMARY KEY (id)
  ```
- `restaurants_address_id_fkey` (FOREIGN KEY)
  ```sql
  FOREIGN KEY (address_id) REFERENCES addresses(id)
  ```

---

## Table: stores

Table size: 8192 bytes
Index size: 24 kB
Total size: 32 kB

**Columns:**
- `id` integer NOT NULL DEFAULT nextval('stores_id_seq'::regclass)
- `external_id` character varying NULL
- `name` character varying NOT NULL
- `description` text NULL
- `address_id` integer NOT NULL
- `phone` character varying NULL
- `email` character varying NULL
- `store_type` USER-DEFINED NOT NULL
- `business_hours` jsonb NULL
- `social_media` jsonb NULL
- `product_categories` ARRAY NULL
- `ratings` jsonb NULL
- `reviews` jsonb NULL
- `delivery_available` boolean NULL
- `online_ordering` boolean NULL
- `images` ARRAY NULL
- `last_updated` timestamp without time zone NULL
- `additional_notes` text NULL
- `created_at` timestamp without time zone NOT NULL DEFAULT now()
- `updated_at` timestamp without time zone NOT NULL DEFAULT now()

**Indexes:**
- `stores_pkey` (16 kB)
  ```sql
  CREATE UNIQUE INDEX stores_pkey ON public.stores USING btree (id)
  ```

**Constraints:**
- `stores_pkey` (PRIMARY KEY)
  ```sql
  PRIMARY KEY (id)
  ```
- `stores_address_id_fkey` (FOREIGN KEY)
  ```sql
  FOREIGN KEY (address_id) REFERENCES addresses(id)
