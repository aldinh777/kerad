import { state } from '@aldinh777/reactive'
import { stateFrom } from '@aldinh777/reactive/utils'
import { list } from '@aldinh777/reactive/collection/list'
import { maplist } from '@aldinh777/reactive/collection/list/map'
import { randomItem } from '@aldinh777/toolbox/random'

const randomName = () => randomItem(['mom', 'father', 'mama', 'bunda', 'world'])
const randomColor = () => randomItem(['red', 'green', 'blue', 'yellow'])
const globalCounter = state(0)
const nested = state(1)

export default function Page(_props, context) {
    const who = state(randomName())
    const color = state(randomColor())
    const styleColor = stateFrom(color)((color) => `color: ${color}`)
    const counter = state(0)
    const nums = list([list([nested])])

    context.onMount(() => {
        // setTimeout(() => st(1254), 2000)
        // setTimeout(() => nums(0).shift(), 4000)
        // setTimeout(() => st(7777), 6000)
        // setTimeout(() => nums(0).unshift(st), 8000)
        // setTimeout(() => st(1998), 10000)
    })

    return (
        <>
            <div>
                <h3>
                    Hello, <span style={styleColor}>{who}</span>!
                </h3>
            </div>
            <div>
                <h5>Global Counter: {globalCounter}</h5>
                <button on:click={() => globalCounter(globalCounter() - 1)}>-</button>
                <button on:click={() => globalCounter(globalCounter() + 1)}>+</button>
            </div>
            <div>
                <h5>Local Counter: {counter}</h5>
                <button on:click={() => counter(counter() - 1)}>-</button>
                <button on:click={() => counter(counter() + 1)}>+</button>
            </div>
            <h4>List Test</h4>
            <div>[{maplist(nums, (numnum) => maplist(numnum, (num) => num))}]</div>
        </>
    )
}
