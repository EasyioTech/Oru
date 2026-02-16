import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), "..", ".env") });

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined in environment variables. Looked in " + path.join(process.cwd(), "..", ".env"));
}

export default defineConfig({
    schema: "./dist/infrastructure/database/schemas/*.js",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
    verbose: true,
    strict: true,
});
