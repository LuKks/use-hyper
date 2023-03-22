import { useEffect, useState } from 'react'
import Hyperswarm from 'hyperswarm'

let hyperswarm = null

export default function useSwarm (dht) {
  const [swarm, setSwarm] = useState(null)

  useEffect(() => {
    if (dht === null) return

    if (hyperswarm === null) hyperswarm = new Hyperswarm({ dht, keyPair: dht.defaultKeyPair })

    const session = hyperswarm.session({ keyPair: dht.defaultKeyPair })
    setSwarm(session)

    return () => {
      session.destroy() // Run on background
      for (const socket of session.connections) socket.destroy()

      setSwarm(null)
    }
  }, [dht])

  return [swarm]
}
