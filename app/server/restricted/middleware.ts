import type { ServerContext } from '@aldinh777/kerad-core';

export default function (context: ServerContext) {
    const user = context.connection.req.query('user');
    const pass = context.connection.req.query('pass');
    const status = user === 'user' && pass === 'pass' ? 'Authorized' : 'Unauthorized';
    context.connection.set('status', status);
}
