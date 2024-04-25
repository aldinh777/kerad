import type { State } from '@aldinh777/reactive'

interface CounterProps {
    counter: State<number>
    title: string
}

export default function Counter({ counter, title }: CounterProps) {
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
