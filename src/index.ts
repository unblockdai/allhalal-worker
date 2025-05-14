import { createDbClient } from './db';
import { eq, sql as drizzleSql, count, and, isNull, inArray } from 'drizzle-orm';
import { 
  addresses,
  certifiers,
  entityCertifications,
  meatHouses,
  restaurants,
  stores,
  certificationTypeEnum,
  certificationStatusEnum,
  restaurantTypeEnum,
  storeTypeEnum
} from './schema';

interface Env {
  HYPERDRIVE: Hyperdrive;
  ASSETS: Fetcher;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    // Handle API requests
    if (url.pathname.startsWith("/api/")) {
      return handleApiRequest(request, env, ctx);
    }

    // Serve static assets for everything else
    return env.ASSETS.fetch(request);
  },
};

async function handleApiRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const url = new URL(request.url);
  console.log(env.HYPERDRIVE.connectionString);
  
  // Create database client using the Hyperdrive connection string from env bindings
  const db = createDbClient(env.HYPERDRIVE.connectionString);
  
  try {
    // API endpoint to check if tables exist
    if (url.pathname === "/api/check-tables" && request.method === "GET") {
      const result = await db.execute(drizzleSql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN (
          'addresses',
          'certifiers',
          'entity_certifications',
          'meat_houses',
          'restaurants',
          'stores',
          'users'
        )
      `);
      
      console.log("tables", result);
      const existingTables = result.map((t) => t.table_name);

      return Response.json({
        addresses: existingTables.includes("addresses"),
        certifiers: existingTables.includes("certifiers"),
        entityCertifications: existingTables.includes("entity_certifications"),
        meatHouses: existingTables.includes("meat_houses"),
        restaurants: existingTables.includes("restaurants"),
        stores: existingTables.includes("stores"),
        users: existingTables.includes("users"),
      });
    }

    // Addresses API endpoints
    if (url.pathname === "/api/addresses" && request.method === "GET") {
      const rows = await db.query.addresses.findMany({
        orderBy: addresses.id
      });
      return Response.json(rows);
    }

    if (url.pathname === "/api/addresses" && request.method === "POST") {
      const body: any = await request.json();

      // Validate required fields
      if (!body.street || !body.city || !body.state || !body.zipCode || !body.country) {
        return Response.json(
          { error: "All address fields are required" },
          { status: 400 },
        );
      }

      const result = await db.insert(addresses)
        .values({
          street: body.street,
          city: body.city,
          state: body.state,
          zipCode: body.zipCode,
          country: body.country,
          lat: body.lat,
          lng: body.lng,
        })
        .returning({ id: addresses.id });

      return Response.json({
        success: true,
        message: "Address created successfully",
        id: result[0].id,
      });
    }
    // TODO: Add endpoints for:
    // - /api/certifiers
    // - /api/entity-certifications
    // - /api/meat-houses
    // - /api/restaurants
    // - /api/stores

    return Response.json({ error: "Not Found" }, { status: 404 });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
