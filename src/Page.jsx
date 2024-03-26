import { state } from '@aldinh777/reactive'
import { randomItem } from '@aldinh777/toolbox/random'

export default function (_props, _children, context) {
    const randomName = () => randomItem(['mom', 'father', 'mama', 'bunda', 'world'])
    const who = state(randomName())
    const booba = [<div>one</div>, <div>two</div>, <div>three</div>]
    context.onMount(() => {
        const interval = setInterval(() => who(randomName()), 1000)
        return () => clearInterval(interval)
    })
    return [
        <div class={who}>
            <h3>{who}</h3>
            Hello, {who}!{...booba}
        </div>
    ]
}
