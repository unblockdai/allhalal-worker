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

    // Certifiers API endpoints
    if (url.pathname === "/api/certifiers" && request.method === "GET") {
      const rows = await db.query.certifiers.findMany({
        orderBy: certifiers.id
      });
      return Response.json(rows);
    }

    if (url.pathname === "/api/certifiers" && request.method === "POST") {
      const body: any = await request.json();

      // Validate required fields
      if (!body.name || !body.certificationType) {
        return Response.json(
          { error: "Name and certification type are required" },
          { status: 400 },
        );
      }

      const result = await db.insert(certifiers)
        .values({
          name: body.name,
          website: body.website,
          logoUrl: body.logoUrl,
          contactEmail: body.contactEmail,
          contactPhone: body.contactPhone,
          certificationType: body.certificationType,
          certificationSince: body.certificationSince,
          lastInspectionDate: body.lastInspectionDate,
          certificationExpiry: body.certificationExpiry,
        })
        .returning({ id: certifiers.id });

      return Response.json({
        success: true,
        message: "Certifier created successfully",
        id: result[0].id,
      });
    }

    // Entity Certifications API endpoints
    if (url.pathname === "/api/entity-certifications" && request.method === "GET") {
      const rows = await db.query.entityCertifications.findMany({
        orderBy: entityCertifications.id
      });
      return Response.json(rows);
    }

    if (url.pathname === "/api/entity-certifications" && request.method === "POST") {
      const body: any = await request.json();

      // Validate required fields
      if (!body.entityType || !body.entityId || !body.certifierId) {
        return Response.json(
          { error: "Entity type, entity ID, and certifier ID are required" },
          { status: 400 },
        );
      }

      const result = await db.insert(entityCertifications)
        .values({
          entityType: body.entityType,
          entityId: body.entityId,
          certifierId: body.certifierId,
          certificationStatus: body.certificationStatus || 'CERTIFIED',
          certifiedSince: body.certifiedSince,
          expiresAt: body.expiresAt,
        })
        .returning({ id: entityCertifications.id });

      return Response.json({
        success: true,
        message: "Entity certification created successfully",
        id: result[0].id,
      });
    }

    // Meat Houses API endpoints
    if (url.pathname === "/api/meat-houses" && request.method === "GET") {
      const rows = await db.query.meatHouses.findMany({
        orderBy: meatHouses.id
      });
      return Response.json(rows);
    }

    if (url.pathname === "/api/meat-houses" && request.method === "POST") {
      const body: any = await request.json();

      // Validate required fields
      if (!body.name || !body.meatTypes) {
        return Response.json(
          { error: "Name and meat types are required" },
          { status: 400 },
        );
      }

      const result = await db.insert(meatHouses)
        .values({
          name: body.name,
          description: body.description,
          addressId: body.addressId,
          phone: body.phone,
          email: body.email,
          meatTypes: body.meatTypes,
          slaughterMethods: body.slaughterMethods || [],
          businessHours: body.businessHours,
          socialMedia: body.socialMedia,
          wholesaleAvailable: body.wholesaleAvailable,
          retailAvailable: body.retailAvailable,
          ratings: body.ratings,
          reviews: body.reviews,
          images: body.images || [],
          lastUpdated: new Date(),
          additionalNotes: body.additionalNotes,
        })
        .returning({ id: meatHouses.id });

      return Response.json({
        success: true,
        message: "Meat house created successfully",
        id: result[0].id,
      });
    }

    // Restaurants API endpoints
    if (url.pathname === "/api/restaurants" && request.method === "GET") {
      const rows = await db.query.restaurants.findMany({
        orderBy: restaurants.id
      });
      return Response.json(rows);
    }

    if (url.pathname === "/api/restaurants" && request.method === "POST") {
      const body: any = await request.json();

      // Validate required fields
      if (!body.name) {
        return Response.json(
          { error: "Name is required" },
          { status: 400 },
        );
      }

      const result = await db.insert(restaurants)
        .values({
          name: body.name,
          description: body.description,
          addressId: body.addressId,
          phone: body.phone,
          email: body.email,
          cuisineTypes: body.cuisineTypes || [],
          specialties: body.specialties || [],
          priceRange: body.priceRange,
          restaurantType: body.restaurantType,
          businessHours: body.businessHours,
          socialMedia: body.socialMedia,
          menu: body.menu,
          ratings: body.ratings,
          reviews: body.reviews,
          deliveryOptions: body.deliveryOptions || [],
          takeoutAvailable: body.takeoutAvailable,
          reservationsAvailable: body.reservationsAvailable,
          hasAlcohol: body.hasAlcohol || false,
          images: body.images || [],
          lastUpdated: new Date(),
          additionalNotes: body.additionalNotes,
        })
        .returning({ id: restaurants.id });

      return Response.json({
        success: true,
        message: "Restaurant created successfully",
        id: result[0].id,
      });
    }

    // Stores API endpoints
    if (url.pathname === "/api/stores" && request.method === "GET") {
      const rows = await db.query.stores.findMany({
        orderBy: stores.id
      });
      return Response.json(rows);
    }

    if (url.pathname === "/api/stores" && request.method === "POST") {
      const body: any = await request.json();

      // Validate required fields
      if (!body.name || !body.storeType) {
        return Response.json(
          { error: "Name and store type are required" },
          { status: 400 },
        );
      }

      const result = await db.insert(stores)
        .values({
          name: body.name,
          description: body.description,
          addressId: body.addressId,
          phone: body.phone,
          email: body.email,
          storeType: body.storeType,
          businessHours: body.businessHours,
          socialMedia: body.socialMedia,
          productCategories: body.productCategories || [],
          ratings: body.ratings,
          reviews: body.reviews,
          deliveryAvailable: body.deliveryAvailable,
          onlineOrdering: body.onlineOrdering,
          images: body.images || [],
          lastUpdated: new Date(),
          additionalNotes: body.additionalNotes,
        })
        .returning({ id: stores.id });

      return Response.json({
        success: true,
        message: "Store created successfully",
        id: result[0].id,
      });
    }

    return Response.json({ error: "Not Found" }, { status: 404 });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
