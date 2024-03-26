const cid = document.body.getAttribute('rekt-cid')
const socket = new WebSocket(`ws://localhost:3100/${cid}`)
socket.addEventListener('message', ({ data }) => {
    const [code] = data.split(':', 1)
    if (code === 'u') {
        const [stateId] = data.slice(2).split(':', 1)
        const value = data.slice(stateId.length + 3)
        const dynamicValues = document.querySelectorAll('rekt[s]')
        const dynamicProps = document.querySelectorAll('[rektp]')
        for (const elem of dynamicValues) {
            elem.textContent = value
        }
        for (const elem of dynamicProps) {
            const attribs = elem.getAttribute('rektp')
            for (const propPair of attribs.split(' ')) {
                const [prop, targetId] = propPair.split(':')
                if (targetId === stateId) {
                    elem.setAttribute(prop, value)
                }
            }
        }
    }
})
