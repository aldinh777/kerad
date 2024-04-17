import { state } from '@aldinh777/reactive'
import { list } from '@aldinh777/reactive/list'
import { map } from '@aldinh777/reactive/list/utils'

const globalCounter = state(0)
const todos = list(['one', 'two', 'three'])
const todosItems = map(todos, (item) => (
    <li>
        <button on:click={() => todos.splice(todos().indexOf(item), 1)}>x</button> {item}
    </li>
))

export const metadata = {
    title: 'Rekt Main Page'
}

export default function MainPage() {
    const counter = state(0)

    return (
        <>
            <div>
                <rekt type="client" src="./App">
                    <h3>Hello, world!</h3>
                </rekt>
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
            <div>
                <h4>Todos</h4>
                <ul>{todosItems}</ul>
            </div>
            <form
                on:submit={(formData: FormData) => {
                    const next = formData.get('todo')
                    if (next) {
                        todos.push(next as string)
                    }
                }}
                afterSubmit="reset"
            >
                <input type="text" name="todo" />
                <button type="submit">submit</button>
            </form>
        </>
    )
}
