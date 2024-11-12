import type { ServerContext } from '@aldinh777/kerad-core';
import { state, computed } from '@aldinh777/reactive';
import { list } from '@aldinh777/reactive/list';

export default function TestPage(_: any, context: ServerContext) {
    const { error } = context.connection.req.query();
    if (error === 'true') {
        throw new Error('Rendering Error');
    }
    const rawHTML = state('<h1 style="color: orange;">this is raw html</h1>');
    const rawProp = state('" onClick="alert(\'xss injection\')"');
    const isOpen = state(true);
    const isRoven = state(true);
    const ll = list(['a', 'b', 'c', 'd', 'e']);
    const elem = ll.map((i) => <li>{i}</li>);
    const allIn = computed(() =>
        isOpen() ? (
            <>
                <div style="background-color: red">
                    <h4>List</h4>
                    <ol>{elem}</ol>
                </div>
                Partisan :
                <div style="background-color: gray">
                    <h5>Roven</h5>
                    <div>{computed(() => (isRoven() ? <div>{rawHTML}</div> : <div>Falso</div>))}</div>
                </div>
                <button on:click={() => isRoven(!isRoven())}>Togel Roven</button>
            </>
        ) : (
            <>Non Partisan</>
        )
    );
    return (
        <div>
            <div style="background-color: green">
                <h3>First All In</h3>
                <div>{allIn}</div>
            </div>
            <div style="background-color: orange">
                <h3>Second All In</h3>
                <div>{allIn}</div>
            </div>
            <div style="background-color: blue">
                <h3>Duped List</h3>
                <ul>{elem}</ul>
            </div>
            <div>
                <button on:click={() => isOpen(!isOpen())}>Toggle Layout</button>
                <button
                    on:click={() => {
                        throw new Error('Click Error');
                    }}
                >
                    Cause Error
                </button>
            </div>
            {rawHTML}
            <button on:click={() => ll.pop()}>pop</button>
            <button on:click={() => ll.push(rawProp())}>push</button>
            <div class={rawProp}>Sample Element</div>
            <input type="text" value={rawHTML} on:change={(val: string) => rawHTML(val)} />
            <input type="text" value={rawProp} on:change={(val: string) => rawProp(val)} />
        </div>
    );
}
