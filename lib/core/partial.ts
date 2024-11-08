interface PartialData {
    content: string | Promise<string>;
    connectionSet: Set<string>;
}

const partialMap = new Map<string, PartialData>();

export function registerPartial(partialId: string, output: string | Promise<string>, connectionSet: Set<string>) {
    partialMap.set(partialId, { content: output, connectionSet });
}

export function unregisterPartial(partialId: string) {
    partialMap.delete(partialId);
}

export function renderPartial(partialId: string, connectionId: string | null) {
    if (!partialMap.has(partialId)) {
        return { result: 'not found' };
    }
    const { connectionSet, content } = partialMap.get(partialId)!;
    if (connectionId && connectionSet.has(connectionId)) {
        return { result: 'partial', content };
    } else {
        return { result: 'unauthorized' };
    }
}
