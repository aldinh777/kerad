import type { ServerContext } from '@aldinh777/kerad-core';
import { createIdGenerator } from '@aldinh777/kerad-core';

const sessionIdGenerator = createIdGenerator();
const cookieSessions = new Map<string, Map<string, any>>();

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
    sessionData = new Map();
    cookieSessions.set(sessionId, sessionData);
    return sessionData;
}

export function destroySession(context: ServerContext) {
    findSessionCookie(context, (cookie) => cookieSessions.delete(cookie));
}
