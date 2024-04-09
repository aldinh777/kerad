export default function BlogPage(_props, context) {
    return (
        <>
            <h3>{context.data.params['slug']}</h3>
        </>
    )
}
