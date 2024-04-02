import { state } from '@aldinh777/reactive'
import { list } from '@aldinh777/reactive/collection/list'
import { maplist } from '@aldinh777/reactive/collection/list/map'

const globalCounter = state(0)
const nums = list([1, 2, 3, 4])

export default function Page(_props, context) {
    const counter = state(0)

    return (
        <>
            <div>
                <rekt type="client" src="./App"></rekt>
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
            <div>[{maplist(nums, (num) => num + ', ')}]</div>
            <div>
                <button on:click={() => nums.push(counter())}>Push {counter}</button>
                <button on:click={() => nums.pop()}>Pop</button>
            </div>
        </>
    )
}
