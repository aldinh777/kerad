import { state } from '@aldinh777/reactive'
import { stateFrom } from '@aldinh777/reactive/utils'
import { list } from '@aldinh777/reactive/collection/list'
import { maplist } from '@aldinh777/reactive/collection/list/map'
import { randomItem } from '@aldinh777/toolbox/random'

const randomName = () => randomItem(['mom', 'father', 'mama', 'bunda', 'world'])
const randomColor = () => randomItem(['red', 'green', 'blue', 'yellow'])
const globalCounter = state(0)

export default function Page(_props, context) {
    const who = state(randomName())
    const color = state(randomColor())
    const styleColor = stateFrom(color)((color) => `color: ${color}`)
    const counter = state(0)
    const nums = list([1, 2, 3, 4])

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
            <ul>
                <div>
                    {maplist(nums, (num) => (
                        <li>{num}</li>
                    ))}
                </div>
            </ul>
            <div>
                <div>
                    <button on:click={() => nums.push(globalCounter())}>Push {globalCounter}</button>
                    <button on:click={() => nums.unshift(globalCounter())}>Unshift {globalCounter}</button>
                    <button on:click={() => nums.pop()}>Pop</button>
                    <button on:click={() => nums.shift()}>Shift</button>
                </div>
                <div>
                    <button on:click={() => nums(counter(), globalCounter())}>
                        Update at {counter} into {globalCounter}
                    </button>
                <div>
                    <button on:click={() => nums.splice(counter(), 0, globalCounter())}>
                        Insert {globalCounter} at {counter}
                    </button>
                </div>
                <div>
                    <button on:click={() => nums.splice(counter(), 1)}>Delete at {counter}</button>
                </div>
                </div>
            </div>
        </>
    )
}
