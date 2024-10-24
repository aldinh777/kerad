import { mysqlTable, int } from 'drizzle-orm/mysql-core';
import { roles } from './roles.ts';
import { users } from './users.ts';

export const userRoles = mysqlTable('user_roles', {
    userId: int('user_id', { unsigned: true }).references(() => users.id),
    roleId: int('role_id', { unsigned: true }).references(() => roles.id)
});
