import { state } from '@aldinh777/reactive';
import { list } from '@aldinh777/reactive/list';
import { map } from '@aldinh777/reactive/list/utils';
import Counter from './components/Counter';

const globalCounter = state(0);
const todos = list(['one', 'two', 'three']);
const todosItems = map(todos, (item) => (
    <li>
        <button on:click={() => todos.splice(todos().indexOf(item), 1)}>x</button> {item}
    </li>
));

export const metadata = {
    title: 'Rekt Main Page'
};

export default function MainPage() {
    const counter = state(0);
    return (
        <>
            <div>
                <rekt-client src="./App">
                    <h3>Hello, world!</h3>
                </rekt-client>
            </div>
            <Counter counter={globalCounter} title="Global Counter" />
            <Counter counter={counter} title="Local Counter" />
            <h4>List Test</h4>
            <div>
                <h4>Todos</h4>
                <ul>{todosItems}</ul>
            </div>
            <form
                on:submit={(formData: FormData) => {
                    const next = formData.get('todo');
                    if (next && !todos().includes(next as string)) {
                        todos.push(next as string);
                    }
                }}
                afterSubmit="reset"
            >
                <input type="text" name="todo" />
                <button type="submit">submit</button>
            </form>
        </>
    );
}
