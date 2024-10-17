import type { Context, Props } from '@aldinh777/kerad-jsx';
import { asyncUtils } from '@aldinh777/kerad-jsx/context-utils';
import { state, computed } from '@aldinh777/reactive';

function randomItem<T>(arr: T[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}
const randomName = () => randomItem(['mom', 'father', 'mama', 'bunda', 'world']);
const randomColor = () => randomItem(['red', 'green', 'blue', 'yellow']);

export default function (_: Props, context: Context) {
    const { setInterval } = asyncUtils(context);

    const who = state(randomName());
    const color = state(randomColor());
    const styleColor = computed(() => `color: ${color()}`);

    setInterval(() => {
        who(randomName());
        color(randomColor());
    }, 1000);

    return (
        <h3>
            Hello, <span style={styleColor}>{who}</span>
        </h3>
    );
}
