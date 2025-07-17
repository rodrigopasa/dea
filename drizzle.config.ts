import { defineConfig } from "drizzle-kit";

// Verifique se a variável de ambiente está definida.
if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL. Make sure the database is provisioned.");
}

// Exporte o objeto de configuração diretamente.
export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
