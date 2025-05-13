import { createDbClient } from './db';
import { eq, sql as drizzleSql, count, and, isNull, inArray } from 'drizzle-orm';
import { organizations, users } from './schema';

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
  // Workers cannot access process.env - only use env bindings at runtime
  const db = createDbClient(env.HYPERDRIVE.connectionString);
  
  try {
    // API endpoint to check if tables exist
    if (url.pathname === "/api/check-tables" && request.method === "GET") {
      const result = await db.execute(drizzleSql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND (table_name = 'organizations' OR table_name = 'users')
      `);
      
      console.log("tables", result);
      const existingTables = result.map((t) => t.table_name);

      return Response.json({
        organizations: existingTables.includes("organizations"),
        users: existingTables.includes("users"),
      });
    }

    // API endpoint for Organizations GET operation
    if (url.pathname === "/api/organizations" && request.method === "GET") {
      const rows = await db.query.organizations.findMany({
        orderBy: organizations.id
      });
      return Response.json(rows);
    }

    // API endpoint for Organizations POST operation
    if (url.pathname === "/api/organizations" && request.method === "POST") {
      const body: any = await request.json();

      if (!body.name || typeof body.name !== "string") {
        return Response.json(
          { error: "Organization name is required" },
          { status: 400 },
        );
      }

      const result = await db.insert(organizations)
        .values({ name: body.name })
        .returning({ id: organizations.id });

      return Response.json({
        success: true,
        message: "Organization created successfully",
        id: result[0].id,
      });
    }

    // API endpoint for Organizations DELETE operation
    if (
      url.pathname.startsWith("/api/organizations/") &&
      request.method === "DELETE"
    ) {
      const orgId = Number(url.pathname.split("/").pop());

      // First check if there are any users associated with this organization
      const userCheck = await db.select({ count: count() })
        .from(users)
        .where(eq(users.organizationId, orgId));

      if (Number(userCheck[0].count) > 0) {
        return Response.json(
          {
            error: "Cannot delete organization with associated users",
          },
          { status: 400 },
        );
      }

      await db.delete(organizations).where(eq(organizations.id, orgId));
      
      return Response.json({
        success: true,
        message: "Organization deleted successfully",
      });
    }

    // API endpoint for Users GET operation
    if (url.pathname === "/api/users" && request.method === "GET") {
      const orgFilter = url.searchParams.get("organization_id");

      if (orgFilter) {
        const rows = await db.query.users.findMany({
          with: {
            organization: true
          },
          where: eq(users.organizationId, Number(orgFilter)),
          orderBy: users.id
        });
        
        // Convert to expected response format
        const formattedRows = rows.map(row => ({
          ...row,
          organization_name: row.organization?.name || null,
          organization: undefined // Remove nested organization object
        }));
        
        return Response.json(formattedRows);
      } else {
        const rows = await db.query.users.findMany({
          with: {
            organization: true
          },
          orderBy: users.id
        });
        
        // Convert to expected response format
        const formattedRows = rows.map(row => ({
          ...row,
          organization_name: row.organization?.name || null,
          organization: undefined // Remove nested organization object
        }));
        
        return Response.json(formattedRows);
      }
    }

    // API endpoint for Users POST operation
    if (url.pathname === "/api/users" && request.method === "POST") {
      const body: any = await request.json();

      if (!body.username || typeof body.username !== "string") {
        return Response.json(
          { error: "Username is required" },
          { status: 400 },
        );
      }

      // Organization ID is optional (can be null)
      const orgId = body.organization_id ? Number(body.organization_id) : null;

      // If organization_id is provided, verify it exists
      if (orgId !== null) {
        const orgCheck = await db.query.organizations.findFirst({
          where: eq(organizations.id, orgId),
          columns: { id: true }
        });

        if (!orgCheck) {
          return Response.json(
            { error: "Organization not found" },
            { status: 400 },
          );
        }
      }

      const result = await db.insert(users)
        .values({ 
          username: body.username, 
          organizationId: orgId 
        })
        .returning({ id: users.id });

      return Response.json({
        success: true,
        message: "User created successfully",
        id: result[0].id,
      });
    }

    // API endpoint for Users PUT operation
    if (url.pathname.startsWith("/api/users/") && request.method === "PUT") {
      const userId = Number(url.pathname.split("/").pop());
      const body: any = await request.json();

      if (!body.username || typeof body.username !== "string") {
        return Response.json(
          { error: "Username is required" },
          { status: 400 },
        );
      }

      // Organization ID is optional (can be null)
      const orgId =
        body.organization_id !== undefined
          ? body.organization_id
            ? Number(body.organization_id)
            : null
          : undefined;

      // If organization_id is provided, verify it exists
      if (orgId !== undefined && orgId !== null) {
        const orgCheck = await db.query.organizations.findFirst({
          where: eq(organizations.id, orgId),
          columns: { id: true }
        });

        if (!orgCheck) {
          return Response.json(
            { error: "Organization not found" },
            { status: 400 },
          );
        }
      }

      const updateValues: any = { username: body.username };
      if (orgId !== undefined) {
        updateValues.organizationId = orgId;
      }

      await db.update(users)
        .set(updateValues)
        .where(eq(users.id, userId));

      return Response.json({
        success: true,
        message: "User updated successfully",
      });
    }

    // API endpoint for Users DELETE operation
    if (url.pathname.startsWith("/api/users/") && request.method === "DELETE") {
      const userId = Number(url.pathname.split("/").pop());
      
      await db.delete(users).where(eq(users.id, userId));

      return Response.json({
        success: true,
        message: "User deleted successfully",
      });
    }

    return Response.json({ error: "Not Found" }, { status: 404 });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  } finally {
    // Clean up any database connections if needed
    // Note: For Postgres.js with simple connections, closing might not be necessary
    // as the Worker will terminate anyway, but it's good practice
    // if (db.end) {
    //   await db.end();
    // }
  }
}
