import { password } from 'bun';
import { db } from './index.ts';
import { roles, userRoles, users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function seed() {
    await db.insert(users).values([{ username: 'superuser', password: password.hashSync('superuser') }]);
    await db.insert(roles).values([{ name: 'superuser' }, { name: 'admin' }]);
    const [superuser] = await db.select().from(users).where(eq(users.username, 'superuser')).limit(1);
    const [superrole] = await db.select().from(roles).where(eq(roles.name, 'superuser')).limit(1);
    const [adminrole] = await db.select().from(roles).where(eq(roles.name, 'admin')).limit(1);
    await db.insert(userRoles).values([
        { userId: superuser.id, roleId: superrole.id },
        { userId: superuser.id, roleId: adminrole.id }
    ]);
}
