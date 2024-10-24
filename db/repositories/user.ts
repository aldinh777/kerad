import { password } from 'bun';
import { db } from '../index.ts';

export async function login(name: string, pass: string) {
    const user = await db.query.users.findFirst({
        where: (user, { eq }) => eq(user.username, name),
        with: { userRoles: { with: { role: true } } }
    });
    if (!user) {
        return;
    }
    if (password.verifySync(pass, user.password || '')) {
        return user;
    }
}
