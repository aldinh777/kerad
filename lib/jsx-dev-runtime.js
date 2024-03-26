const wrapChildren = (children) => {
    if (!children) {
        return []
    }
    if (!(children instanceof Array)) {
        return [children]
    }
    return children
}
export const jsxDEV = (tag, { children, ...props }) => [tag, props, wrapChildren(children)]
