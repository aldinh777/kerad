import type { ServerContext } from '@aldinh777/kerad-core';
import { createIdGenerator } from '@aldinh777/kerad-core';

const sessionIdGenerator = createIdGenerator();
const cookieSessions = new Map<string, SessionData>();

class SessionData extends Map {
    getOrDefault<T>(key: any, defaultValue: T): T {
        if (this.has(key)) {
            return this.get(key);
        }
        this.set(key, defaultValue);
        return defaultValue;
    }
}

const COOKIE_NAME = 'KERAD_SESSION_ID';

export function sessionByCookie(context: ServerContext) {
    const cookiesText = context.connection.req.header('Cookie');
    if (cookiesText) {
        const cookies = cookiesText
            .split(';')
            .map((s) => s.trimStart())
            .map((pair) => pair.split('='));
        for (const [cookie, value] of cookies) {
            if (cookie === COOKIE_NAME) {
                if (cookieSessions.has(value)) {
                    return cookieSessions.get(value)!;
                }
            }
        }
    }
    const sessionId = sessionIdGenerator.next();
    context.connection.header('Set-Cookie', `${COOKIE_NAME}=${sessionId}`);
    const sessionData = new SessionData();
    cookieSessions.set(sessionId, sessionData);
    return sessionData;
}

export function destroySession(context: ServerContext) {
    const cookiesText = context.connection.req.header('Cookie');
    if (cookiesText) {
        const cookies = cookiesText
            .split(';')
            .map((s) => s.trimStart())
            .map((pair) => pair.split('='));
        for (const [cookie, value] of cookies) {
            if (cookie === COOKIE_NAME) {
                if (cookieSessions.has(value)) {
                    return cookieSessions.delete(value)!;
                }
            }
        }
    }
}
