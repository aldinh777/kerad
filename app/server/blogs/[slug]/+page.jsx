export default function BlogPage(_props, context) {
    return (
        <>
            <h3>{context.params['slug']}</h3>
        </>
    )
}
