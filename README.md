# Worker + Drizzle + PostgreSQL using Hyperdrive

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/drizzle-workers-template)

<!-- dash-content-start -->

[Hyperdrive](https://developers.cloudflare.com/hyperdrive/) makes connecting to your regional SQL database from Cloudflare Workers fast by:

- Pooling database connections globally 🌎
- Eliminating roundtrips with edge connection setup 🔗
- Caching query results for speed and scale (optional) ⚡️

Check out the [demo](https://hyperdrive-demo.pages.dev/) to see how Hyperdrive can provide up to 4x faster queries. Learn more about [how Hyperdrive works](https://developers.cloudflare.com/hyperdrive/configuration/how-hyperdrive-works/) to speed up your database access.

This project demonstrates a Worker connecting to a PostgreSQL database using Hyperdrive and [Drizzle ORM](https://orm.drizzle.team/) - a TypeScript-first ORM that provides a seamless, type-safe database access experience. Upon loading your Worker, you will see an administrative dashboard that showcases simple create, read, update, delete commands to your PostgreSQL database with Hyperdrive and Drizzle.

> [!IMPORTANT]
> When creating a Hyperdrive configuration as part of this template, disable caching from your Hyperdrive configuration to ensure your administrative dashboard shows updated values. Learn more about [Hyperdrive's built-in query caching](https://developers.cloudflare.com/hyperdrive/configuration/query-caching/) and when to use it.
>
> When using C3 to create this project, select "no" when it asks if you want to deploy. You need to follow this project's [setup steps](https://github.com/cloudflare/templates/tree/main/hyperdrive-template#setup-steps) before deploying.

<!-- dash-content-end -->

## Getting Started

Outside of this repo, you can start a new project with this template using [C3](https://developers.cloudflare.com/pages/get-started/c3/) (the `create-cloudflare` CLI):

```
npm create cloudflare@latest -- --template=cloudflare/templates/postgres-hyperdrive-template
```

A live public deployment of this template is available at [https://postgres-hyperdrive-template.templates.workers.dev](https://postgres-hyperdrive-template.templates.workers.dev)

## Setup Steps

1. Install the project dependencies with a package manager of your choice:
   ```bash
   npm install
   ```

2. Create a [Hyperdrive configuration](https://developers.cloudflare.com/hyperdrive/get-started/) with the name "hyperdrive-configuration":

   ```bash
   npx wrangler hyperdrive create hyperdrive-configuration --connection-string="postgres://<DB_USER>:<DB_PASSWORD>@<DB_HOSTNAME_OR_IP_ADDRESS>:5432/<DATABASE_NAME>" --caching-disabled
   ```

   ...and update the `hyperdrive` `id` field in `wrangler.jsonc` with the new Hyperdrive ID. You can also specify a connection string for a local PostgreSQL database used for development using the `hyperdrive` `localConnectionString` field.

3. Generate SQL migrations from your Drizzle schema:
   ```bash
   npx drizzle-kit generate
   ```
   This will create SQL migration files in the `drizzle` directory based on your schema definition in `src/schema.ts`.

4. Apply the migrations to your database:
   ```bash
   npx drizzle-kit push
   ```
   This command will push the schema changes to your database. You can use `--dry-run` flag to preview changes without applying them.

5. Run the project locally with remote database access:
   ```bash
   npx wrangler dev --remote
   ```
   The `--remote` flag ensures your Worker runs in Cloudflare's environment so that it can access your remote database through Hyperdrive.

6. Deploy the project to production:
   ```bash
   npx wrangler deploy
   ```

## Drizzle ORM Usage

The template is structured with the following key files for database operations:

- `src/schema.ts` - Database schema definitions
- `src/db.ts` - Database connection configuration
- `src/index.ts` - API routes and business logic

### Schema Definition

The schema is defined with Drizzle's schema builder in `src/schema.ts`. Example:

```typescript
import { pgTable, serial, varchar, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define tables
export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Define relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users)
}));

// More table definitions...
```

### Schema Changes

When you modify the schema in `src/schema.ts`:

1. Generate new migrations:
   ```bash
   npx drizzle-kit generate
   ```

2. Apply the migrations:
   ```bash
   npx drizzle-kit push
   ```

## Development and Production

- **Development**: Use `npx wrangler dev --remote` to test with your remote database
- **Production**: Deploy with `npx wrangler deploy`

## Learn More

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Cloudflare Hyperdrive Documentation](https://developers.cloudflare.com/hyperdrive/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
