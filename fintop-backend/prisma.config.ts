import { defineConfig } from "prisma/config";
import * as fs from "fs";
import * as path from "path";

// Read DATABASE_URL from process.env, or parse .env manually if process.env is not set
let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  try {
    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      const match = envContent.match(/^DATABASE_URL\s*=\s*["']?(.*?)["']?\s*$/m);
      if (match && match[1]) {
        databaseUrl = match[1];
      }
    }
  } catch (e) {
    // Ignore any reading errors
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
