import type { ServerContext } from '@aldinh777/kerad-core';

export default function (context: ServerContext) {
    if (context.session.userState() === null) {
        return context.connection.redirect('/auth');
    }
    context.connection.set('status', 'Authorized');
}
