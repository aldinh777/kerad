import { mysqlTable, int, varchar } from 'drizzle-orm/mysql-core';

export const roles = mysqlTable('roles', {
    id: int('id', { unsigned: true }).autoincrement().primaryKey(),
    name: varchar('name', { length: 255 })
});
