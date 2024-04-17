import type { RektProps, ServerContext } from '@aldinh777/rekt-jsx/jsx-runtime'

export default function BlogPage(_props: RektProps, context: ServerContext) {
    return (
        <>
            <h3>{context.data.params['slug']}</h3>
        </>
    )
}
