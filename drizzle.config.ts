import { defineConfig, type Config } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
const drizzleCommand = process.argv.slice(2).find((arg) => !arg.startsWith("-"));
const commandsRequiringDatabase = new Set([
  "migrate",
  "push",
  "pull",
  "introspect",
  "studio",
]);

if (!connectionString && drizzleCommand && commandsRequiringDatabase.has(drizzleCommand)) {
  throw new Error("DATABASE_URL is required to run this drizzle command");
}

const config = {
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  ...(connectionString ? { dbCredentials: { url: connectionString } } : {}),
} satisfies Config;

export default defineConfig(config);
