import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from './schema.ts';

export const db = drizzle({ schema, connection: { uri: process.env['DATABASE_URL']! }, mode: 'default' });
