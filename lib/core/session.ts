import type { ServerContext } from '@aldinh777/kerad-core';
import { createIdGenerator } from '@aldinh777/kerad-core';
import { password } from 'bun';
import { state } from '@aldinh777/reactive';
import { db } from '@aldinh777/kerad-db';

const sessionIdGenerator = createIdGenerator();
const cookieSessions = new Map<string, SessionData>();

type UserData = Awaited<ReturnType<typeof login>>;

async function login(name: string, pass: string) {
    const user = await db.query.users.findFirst({
        columns: { id: true, username: true, password: true },
        where: (users, { eq }) => eq(users.username, name),
        with: { userRoles: { with: { role: true } } }
    });
    if (!user) {
        return null;
    }
    if (password.verifySync(pass, user.password || '')) {
        return {
            id: user.id,
            username: user.username,
            roles: user.userRoles.map((userRole) => userRole.role!.name!)
        };
    }
    return null;
}

export class SessionData extends Map {
    userState = state<UserData>(null);
    getOrDefault<T>(key: any, defaultValue: T): T {
        if (this.has(key)) {
            return this.get(key);
        }
        this.set(key, defaultValue);
        return defaultValue;
    }
    async login(username: string, password: string) {
        const user = await login(username, password);
        if (user) {
            this.userState(user);
        }
        return user;
    }
    logout() {
        this.userState(null);
    }
}

const COOKIE_NAME = 'KERAD_SESSION_ID';

function findSessionCookie<T>(context: ServerContext, handler: (cookie: string) => T) {
    const cookiesText = context.connection.req.header('Cookie');
    if (cookiesText) {
        const cookies = cookiesText
            .split(';')
            .map((s) => s.trimStart())
            .map((pair) => pair.split('='));
        for (const [key, cookie] of cookies) {
            if (key === COOKIE_NAME) {
                if (cookieSessions.has(cookie)) {
                    return handler(cookie);
                }
            }
        }
    }
}

export function sessionByCookie(context: ServerContext) {
    let sessionData = findSessionCookie(context, (cookie) => cookieSessions.get(cookie));
    if (sessionData) {
        return sessionData;
    }
    const sessionId = sessionIdGenerator.next();
    context.connection.header('Set-Cookie', `${COOKIE_NAME}=${sessionId}`);
    sessionData = new SessionData();
    cookieSessions.set(sessionId, sessionData);
    return sessionData;
}

export function destroySession(context: ServerContext) {
    findSessionCookie(context, (cookie) => cookieSessions.delete(cookie));
}
