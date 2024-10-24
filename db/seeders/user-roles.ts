import { password } from 'bun';
import { db } from '../index.ts';
import { roles, userRoles, users } from '../schema.ts';

await db.insert(users).values({
    username: 'superadmin',
    password: password.hashSync('superadmin')
});

await db.insert(roles).values({
    name: 'superadmin'
});

await db.insert(userRoles).values({
    userId: 1,
    roleId: 1
});
