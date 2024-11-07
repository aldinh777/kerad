import { state, computed } from '@aldinh777/reactive';
import { list } from '@aldinh777/reactive/list';

export default function TestPage() {
    const rawHTML = state('<h1 style="color: orange;">this is raw html</h1>');
    const rawProp = state('" onClick="alert(\'xss injection\')"');
    const isOpen = state(true);
    const isRoven = state(true);
    const allIn = computed(() =>
        isOpen() ? (
            <div>
                Partisan {computed(() => (isRoven() ? <div>{rawHTML}</div> : <div>Falso</div>))}
                <button on:click={() => isRoven(!isRoven())}>Togel Roven</button>
            </div>
        ) : (
            <div>Non Partisan {rawHTML}</div>
        )
    );
    const ll = list(['a', 'b', 'c', 'd', 'e']);
    const elem = ll.map((i) => <li>{i}</li>);
    return (
        <div>
            <ol>{elem}</ol>
            {allIn}
            <div>
                <button on:click={() => isOpen(!isOpen())}>Toggle Layout</button>
            </div>
            {allIn}
            {rawHTML}
            <ul>{elem}</ul>
            <button on:click={() => ll.pop()}>pop</button>
            <div class={rawProp}>Sample Element</div>
            <input type="text" value={rawHTML} on:change={(val: string) => rawHTML(val)} />
            <input type="text" value={rawProp} on:change={(val: string) => rawProp(val)} />
        </div>
    );
}
