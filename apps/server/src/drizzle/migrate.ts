import { migrate } from "drizzle-orm/postgres-js/migrator";

import { db } from "./db";

await migrate(db, { migrationsFolder: "./src/drizzle/migrations" });
process.exit(0);
