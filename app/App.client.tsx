import type { Context } from '@aldinh777/kerad';
import { state, computed } from '@aldinh777/reactive';
import Counter from './components/Counter.tsx';

function randomItem<T>(arr: T[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}
const randomName = () => randomItem(['mom', 'father', 'mama', 'bunda', 'world']);
const randomColor = () => randomItem(['red', 'green', 'blue', 'yellow']);

export default function App(_: any, context: Context) {
    const who = state(randomName());
    const color = state(randomColor());
    const styleColor = computed(() => `color: ${color()}`);

    context.onMount(() => {
        const interval = setInterval(() => {
            who(randomName());
            color(randomColor());
        }, 1000);
        return () => clearInterval(interval);
    });

    return (
        <h3>
            Hello, <span style={styleColor}>{who}</span>
            <Counter counter={state(0)} title="Client Side Counter" />
        </h3>
    );
}
