import type { State } from '@aldinh777/reactive'

export default function ({ counter, title }: { counter: State<number>; title: string }) {
    return (
        <div>
            <h5>
                {title}: {counter}
            </h5>
            <button on:click={() => counter(counter() - 1)}>-</button>
            <button on:click={() => counter(counter() + 1)}>+</button>
        </div>
    )
}
