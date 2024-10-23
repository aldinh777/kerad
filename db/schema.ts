import { relations } from 'drizzle-orm';
import { int, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
    id: int('id', { unsigned: true }).autoincrement().primaryKey(),
    username: varchar('username', { length: 255 }),
    password: varchar('password', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').onUpdateNow()
});

export const usersRelations = relations(users, ({ many }) => ({
    userRoles: many(userRoles)
}));

export const roles = mysqlTable('roles', {
    id: int('id', { unsigned: true }).autoincrement().primaryKey(),
    name: varchar('name', { length: 255 })
});

export const rolesRelations = relations(users, ({ many }) => ({
    userRoles: many(userRoles)
}));

export const userRoles = mysqlTable('user_roles', {
    userId: int('user_id', { unsigned: true }).references(() => users.id),
    roleId: int('role_id', { unsigned: true }).references(() => roles.id)
});

export const userRolesRelations = relations(userRoles, ({ one }) => ({
    user: one(users, {
        fields: [userRoles.userId],
        references: [users.id]
    }),
    role: one(roles, {
        fields: [userRoles.roleId],
        references: [roles.id]
    })
}));
