import type { RektContext, RektProps } from '@aldinh777/rekt-jsx/jsx-runtime'
import { computed } from '@aldinh777/reactive/utils'
import { randomItem } from '@aldinh777/toolbox/random'
import { state } from '@aldinh777/reactive'

const randomName = () => randomItem(['mom', 'father', 'mama', 'bunda', 'world'])
const randomColor = () => randomItem(['red', 'green', 'blue', 'yellow'])

export default function (_: RektProps, context: RektContext) {
    const who = state(randomName())
    const color = state(randomColor())
    const styleColor = computed(() => `color: ${color()}`)

    context.setInterval(1000, () => {
        who(randomName())
        color(randomColor())
    })

    return (
        <h3>
            Hello, <span style={styleColor}>{who}</span>
        </h3>
    )
}
