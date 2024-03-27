import { state } from '@aldinh777/reactive'
import { stateFrom } from '@aldinh777/reactive/utils'
import { randomItem } from '@aldinh777/toolbox/random'

const randomName = () => randomItem(['mom', 'father', 'mama', 'bunda', 'world'])
const randomColor = () => randomItem(['red', 'green', 'blue', 'yellow'])

export default function Page(_props, context) {
    const who = state(randomName())
    const color = state(randomColor())
    const styleColor = stateFrom(color)((color) => `color: ${color}`)
    const counter = state(0)

    context.onMount(() => {
        const interval = setInterval(() => {
            who(randomName())
            color(randomColor())
        }, 1000)
        return () => clearInterval(interval)
    })

    return (
        <>
            <div>
                <h3>
                    Hello, <span style={styleColor}>{who}</span>!
                </h3>
            </div>
            <div>
                <h5>Counter: {counter}</h5>
                <button on:click={() => counter(counter() - 1)}>-</button>
                <button on:click={() => counter(counter() + 1)}>+</button>
            </div>
        </>
    )
}
