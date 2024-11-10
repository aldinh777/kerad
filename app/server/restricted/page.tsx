import type { ServerContext } from '@aldinh777/kerad-core';

export const metadata = {
    title: 'Congratulations!'
};

export default function Restricted(_: any, context: ServerContext) {
    const status = context.connection.get('status');
    if (status === 'Unauthorized') {
        return context.connection.redirect('/test');
    }
    return <div>Status: {status}</div>;
}
