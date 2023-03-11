import { useEffect, useState } from 'react'
import Hyperswarm from 'hyperswarm'

export default function useSwarm (dht) {
  const [swarm, setSwarm] = useState(null)

  useEffect(() => {
    if (dht === null) return

    const swarm = new Hyperswarm({ dht, keyPair: dht.defaultKeyPair })

    setSwarm(swarm)

    return () => {
      swarm.destroy()
      for (const socket of swarm.connections) socket.destroy()
    }
  }, [dht])

  return [swarm]
}
