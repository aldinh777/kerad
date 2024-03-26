import { state } from '@aldinh777/reactive'
import { randomItem } from '@aldinh777/toolbox/random'


export default function () {
    const randomName = () => randomItem(['mom', 'father', 'mama', 'bunda', 'world'])
    const who = state(randomName())
    setInterval(() => who(randomName()), 2000)
    const booba = [<div>one</div>, <div>two</div>, <div>three</div>]
    return [
        <div class={who}>
            <h3>{who}</h3>
            Hello, {who}!{...booba}
        </div>
    ]
}
