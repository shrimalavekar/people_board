import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createClient } from "@supabase/supabase-js";
import * as kv from "./kv_store";

const app = new Hono();

// Enable logger
app.use("*", logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// Health check endpoint
app.get("/make-server-f328fde2/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint (creates user with role)
app.post("/make-server-f328fde2/signup", async (c) => {
  try {
    const {
      email,
      password,
      name,
      role = "user",
    } = await c.req.json();

    const { data, error } =
      await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: { name, role },
        // Automatically confirm the user's email since an email server hasn't been configured.
        email_confirm: true,
      });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log("Signup error:", error);
    return c.json({ error: "Signup failed" }, 500);
  }
});

// Save user entry
app.post("/make-server-f328fde2/user-entries", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError || !user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const entry = await c.req.json();

    // Store in key-value store with user-specific key
    const entryKey = `user_entry:${user.id}:${entry.id}`;
    await kv.set(entryKey, entry);

    return c.json({ success: true });
  } catch (error) {
    console.log("Save entry error:", error);
    return c.json({ error: "Failed to save entry" }, 500);
  }
});

// Update user entry (Super Admin only)
app.put("/make-server-f328fde2/user-entries/:entryId", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    
    console.log("PUT request received for entry:", c.req.param("entryId"));
    console.log("Access token present:", !!accessToken);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    console.log("Auth check - User ID:", user?.id, "Auth error:", authError);

    if (authError || !user?.id) {
      console.log("Authorization failed:", authError);
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check if user is super admin
    const isSuperAdmin = user.user_metadata?.role === "super_admin";
    console.log("User role:", user.user_metadata?.role, "Is super admin:", isSuperAdmin);
    
    if (!isSuperAdmin) {
      console.log("User is not super admin, access denied");
      return c.json({ error: "Forbidden: Super Admin access required" }, 403);
    }

    const entryId = c.req.param("entryId");
    const updatedEntry = await c.req.json();
    
    console.log("Entry ID:", entryId);
    console.log("Update data:", updatedEntry);

    // Find the existing entry by searching all entries
    console.log("Searching for existing entry...");
    const allEntries = await kv.getByPrefix("user_entry:");
    console.log("Total entries found:", allEntries.length);
    
    const existingEntry = allEntries.find(entry => entry.id === entryId);
    console.log("Existing entry found:", !!existingEntry);
    
    if (!existingEntry) {
      console.log("Entry not found with ID:", entryId);
      return c.json({ error: "Entry not found" }, 404);
    }

    console.log("Existing entry:", existingEntry);

    // Extract the original user ID from the entry to maintain the correct key structure
    const originalUserId = existingEntry.userId;
    const entryKey = `user_entry:${originalUserId}:${entryId}`;
    
    console.log("Original user ID:", originalUserId);
    console.log("Entry key:", entryKey);

    // Update the entry while preserving the original structure
    const updatedEntryData = {
      ...existingEntry,
      ...updatedEntry,
      id: entryId, // Ensure ID remains the same
      userId: originalUserId, // Ensure userId remains the same
      dateModified: new Date().toISOString(),
    };

    console.log("Updated entry data:", updatedEntryData);

    await kv.set(entryKey, updatedEntryData);
    
    console.log("Entry updated successfully");

    return c.json({ success: true, entry: updatedEntryData });
  } catch (error) {
    console.log("Update entry error:", error);
    return c.json({ error: `Failed to update entry: ${error.message}` }, 500);
  }
});

// Delete user entry (Super Admin only)
app.delete("/make-server-f328fde2/user-entries/:entryId", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError || !user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check if user is super admin
    const isSuperAdmin = user.user_metadata?.role === "super_admin";
    if (!isSuperAdmin) {
      return c.json({ error: "Forbidden: Super Admin access required" }, 403);
    }

    const entryId = c.req.param("entryId");

    // Find the existing entry by searching all entries
    const allEntries = await kv.getByPrefix("user_entry:");
    const existingEntry = allEntries.find(entry => entry.id === entryId);
    
    if (!existingEntry) {
      return c.json({ error: "Entry not found" }, 404);
    }

    // Extract the original user ID from the entry to get the correct key
    const originalUserId = existingEntry.userId;
    const entryKey = `user_entry:${originalUserId}:${entryId}`;

    await kv.del(entryKey);

    return c.json({ success: true });
  } catch (error) {
    console.log("Delete entry error:", error);
    return c.json({ error: "Failed to delete entry" }, 500);
  }
});

// Get user entries
app.get("/make-server-f328fde2/user-entries", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError || !user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const isSuperAdmin =
      user.user_metadata?.role === "super_admin";

    let entries = [];

    if (isSuperAdmin) {
      // Super admin sees all entries
      entries = await kv.getByPrefix("user_entry:");
    } else {
      // Regular user sees only their entries
      entries = await kv.getByPrefix(`user_entry:${user.id}:`);
    }

    // Sort by date added (newest first)
    entries.sort(
      (a, b) =>
        new Date(b.dateAdded).getTime() -
        new Date(a.dateAdded).getTime(),
    );

    return c.json(entries);
  } catch (error) {
    console.log("Fetch entries error:", error);
    return c.json({ error: "Failed to fetch entries" }, 500);
  }
});

Deno.serve(app.fetch);