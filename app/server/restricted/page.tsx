import type { ServerContext } from '@aldinh777/kerad-core';

export const metadata = {
    title: 'Congratulations!'
};

export default function Restricted(_: any, context: ServerContext) {
    return <div>Status: {context.connection.get('status')}</div>;
}
