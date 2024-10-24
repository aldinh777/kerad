import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './db/schema.ts',
    dialect: 'mysql',
    out: './db/migrations',
    dbCredentials: {
        url: process.env['DATABASE_URL']!
    },
    migrations: {
        table: '_migrations'
    }
});
