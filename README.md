# use-hyper

React hooks for the hypercore-protocol stack

![](https://img.shields.io/npm/v/use-hyper.svg) ![](https://img.shields.io/npm/dt/use-hyper.svg) ![](https://img.shields.io/github/license/LuKks/use-hyper.svg)

```
npm i use-hyper
```

Warning: this is experimental, and API might unexpectedly change until v1.

## Usage

Every hook requires the related library installed:

- `useCore` depends on `hypercore`.
- `useDHT` depends on `@hyperswarm/dht-relay`.
- `useSwarm` depends on `hyperswarm`.

If you import `useSwarm` then install this specific branch:\
`npm i holepunchto/hyperswarm#add-swarm-session`

```jsx
import { useCore, useCoreWatch, useCoreEvent } from 'use-hyper/core'
import { DHT } from 'use-hyper/dht'
import { Swarm, useReplicate } from 'use-hyper/swarm'
import RAM from 'random-access-memory'

const Child = () => {
  const { core } = useCore() // Gets core from context

  const { onwatch } = useCoreWatch() // Triggers re-render when core changes
  const { onwatch: onappend } = useCoreWatch(['append']) // Same as above

  useCoreEvent('append', () => console.log('on event', core.length))

  useReplicate(core)

  const DHT = useDHT() // Gets DHT from the context
  const swarm = useSwarm() // Same, from context

  return (
    <div>
      ID {core.id}<br />
      Length {core.length}<br />
      Peers {core.peers.length}
    </div>
  )
}

const App = () => {
  return (
    <Core storage={RAM} publicKey={key}>
      <Child />
    </Core>
  )
}

export default () => {
  return (
    <DHT>
      <Swarm>
        <App />
      </Swarm>
    </DHT>
  )
}
```

Every state like `core`, `dht`, or `swarm` starts being `null` but then gets updated with the corresponding object.

## License

MIT
