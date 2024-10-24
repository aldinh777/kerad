import { relations } from 'drizzle-orm';
import { users, userRoles, roles } from './schema';

export const usersRelations = relations(users, ({ many }) => ({
    userRoles: many(userRoles)
}));

export const rolesRelations = relations(users, ({ many }) => ({
    userRoles: many(userRoles)
}));

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
