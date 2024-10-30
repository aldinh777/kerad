import { state } from '@aldinh777/reactive';

export default function TestPage() {
    const rawHTML = state('<h1 style="color: orange;">this is raw html</h1>');
    const rawProp = state('" onClick="alert(\'xss injection\')"');
    return (
        <div>
            {rawHTML}
            <div class={rawProp}>Sample Element</div>
            <input type="text" value={rawHTML} on:change={(val: string) => rawHTML(val)} />
            <input type="text" value={rawProp} on:change={(val: string) => rawProp(val)} />
        </div>
    );
}
