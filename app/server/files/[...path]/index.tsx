import type { ServerContext } from '@aldinh777/kerad-jsx';

export default function (_: any, context: ServerContext) {
    const path = context.params['path'];
    return (
        <>
            <h2>The Path is :</h2>
            <h4>{path}</h4>
        </>
    );
}
