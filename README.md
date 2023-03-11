# use-hyper

React hooks for the hypercore-protocol stack

![](https://img.shields.io/npm/v/use-hyper.svg) ![](https://img.shields.io/npm/dt/use-hyper.svg) ![](https://img.shields.io/github/license/LuKks/use-hyper.svg)

```
npm i use-hyper
```

Warning: this is very experimental, and API might change until v1.

## Usage
First you need to have `react` installed.

Every hook requires the related library installed:
- `useCore` depends on `hypercore`.
- `useDHT` depends on `@hyperswarm/dht-relay`.
- `useSwarm` depends on `hyperswarm`.

```javascript
import useKey from 'use-hyper/key'
import useCore from 'use-hyper/core'
import useDHT from 'use-hyper/dht'
import useSwarm from 'use-hyper/swarm'
```

## License
MIT
