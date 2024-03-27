function wrapChildren(children: any) {
    if (!children) {
        return []
    }
    if (!(children instanceof Array)) {
        return [children]
    }
    return children
}

export function jsxDEV(tag: any, { children, ...props }: any) {
    return [tag, props, wrapChildren(children)]
}
