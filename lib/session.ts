import type { ServerContext } from '@aldinh777/kerad-core';

const randomString = (length: number = 1) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

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

function createSessionId() {
    let id = randomString(8);
    while (cookieSessions.has(id)) {
        id += randomString();
    }
    return id;
}

const COOKIE_NAME = 'REKT_SESSION_ID';

export function sessionByCookie(context: ServerContext) {
    const cookiesText = context.request.headers.get('cookie');
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
    const sessionId = createSessionId();
    context.responseData.headers['Set-Cookie'] = `${COOKIE_NAME}=${sessionId}`;
    const sessionData = new SessionData();
    cookieSessions.set(sessionId, sessionData);
    return sessionData;
}

export function destroySession(context: ServerContext) {
    const cookiesText = context.request.headers.get('cookie');
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
