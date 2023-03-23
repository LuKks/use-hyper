# use-hyper

React hooks for the hypercore-protocol stack

![](https://img.shields.io/npm/v/use-hyper.svg) ![](https://img.shields.io/npm/dt/use-hyper.svg) ![](https://img.shields.io/github/license/LuKks/use-hyper.svg)

```
npm i use-hyper
```

Warning: this is experimental, and API might change until v1.

## Usage

Every hook requires the related library installed:

- `useCore` depends on `hypercore`.
- `useDHT` depends on `@hyperswarm/dht-relay`.
- `useSwarm` depends on `hyperswarm`.

If you import `useSwarm` then install this specific branch:
`npm i holepunchto/hyperswarm#add-swarm-session`

```javascript
import { useCore, useCoreEvent, useCoreWatch } from 'use-hyper'
import useDHT from 'use-hyper/dht'
import useSwarm from 'use-hyper/swarm'

const Child = () => {
  const { core } = useCore()

  const { core } = useCoreWatch(['append', 'close']) // updates on append and close events

  const { core } = useCoreEvent('append', () => {
    console.log(core) // do something
  })
}

const App = () => {
  return (
    <Core storage={RAM} coreKey={key}>
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
