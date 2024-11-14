import type { ServerContext } from '@aldinh777/kerad-core';
import { createIdGenerator } from '@aldinh777/kerad-core';
import { login } from '@aldinh777/kerad-db/repositories/user.ts';

const sessionIdGenerator = createIdGenerator();
const cookieSessions = new Map<string, SessionData>();

export class SessionData extends Map {
    getOrDefault<T>(key: any, defaultValue: T): T {
        if (this.has(key)) {
            return this.get(key);
        }
        this.set(key, defaultValue);
        return defaultValue;
    }
    getCurrentUser() {
        return this.getOrDefault<Awaited<ReturnType<typeof login>> | undefined>('_user', undefined);
    }
    async login(username: string, password: string) {
        const user = await login(username, password);
        if (user) {
            this.set('_user', user);
        }
        return user;
    }
    logout() {
        this.delete('_user');
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
