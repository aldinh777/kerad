import type { Context } from '@aldinh777/kerad-core';
import type { Props } from '@aldinh777/kerad-jsx';
import { state, computed } from '@aldinh777/reactive';

function randomItem<T>(arr: T[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}
const randomName = () => randomItem(['mom', 'father', 'mama', 'bunda', 'world']);
const randomColor = () => randomItem(['red', 'green', 'blue', 'yellow']);

export default function (_: Props, context: Context) {
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
        </h3>
    );
}
