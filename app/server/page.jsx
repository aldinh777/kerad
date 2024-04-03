import { state } from '@aldinh777/reactive'
import { list } from '@aldinh777/reactive/collection/list'
import { maplist } from '@aldinh777/reactive/collection/list/map'

const globalCounter = state(0)
const todos = list(['one', 'two', 'three'])

export default function Page(_props, context) {
    const counter = state(0)

    return (
        <>
            <div>
                <rekt type="client" src="./App"></rekt>
            </div>
            <div>
                <input type="number" name="number" bind:value={counter} />
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
            <div>
                <h4>Todos</h4>
                <ul>
                    {maplist(todos, (item) => (
                        <li>
                            <button on:click={() => todos.splice(todos().indexOf(item), 1)}>x</button> {item}
                        </li>
                    ))}
                </ul>
            </div>
            <form on:submit={(formData) => todos.push(formData.get('todo'))}>
                <input type="text" name="todo" value="" />
                <button type="submit">submit</button>
            </form>
        </>
    )
}
