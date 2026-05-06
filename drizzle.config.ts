import { defineConfig } from "drizzle-kit";

const command = process.argv.slice(2).join(" ");
const connectionString = process.env.DATABASE_URL?.trim();
const requiresDatabaseUrl = ["migrate", "push", "up", "studio", "introspect"].some(
  keyword => command.includes(keyword)
);
const fallbackConnectionString =
  "mysql://root:password@127.0.0.1:3306/drizzle_placeholder";

if (!connectionString && requiresDatabaseUrl) {
  throw new Error(
    "DATABASE_URL is required for drizzle commands that connect to the database"
  );
}

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: connectionString ?? fallbackConnectionString,
  },
});
