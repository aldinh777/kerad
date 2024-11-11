import { computed, state } from '@aldinh777/reactive';
import { ClassList } from '@aldinh777/kerad-core';

export default function Style() {
    const size = state(8);
    const elementStyle = {
        backgroundColor: 'orange',
        fontSize: computed(() => size() + 'px')
    };
    const x = new ClassList(['pink', 'red']);
    return (
        <div>
            <div class={x}>This is classed</div>
            <div style={elementStyle}>This is styled</div>
            <div>
                <button on:click={() => size(size() + 1)}>UP SIZE: {size}px</button>
            </div>
        </div>
    );
}
