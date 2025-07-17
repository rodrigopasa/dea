import { defineConfig } from "drizzle-kit";

export default defineConfig(() => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("Missing DATABASE_URL. Make sure the database is provisioned.");
  }

  return {
    out: "./migrations",
    schema: "./shared/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
      url: databaseUrl,
    },
  };
});
