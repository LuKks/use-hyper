import React, { useEffect, useState, useContext, createContext } from 'react'
import Hyperswarm from 'hyperswarm'
import safetyCatch from 'safety-catch'
import { useDHT } from './dht.js'

const SwarmContext = createContext()

export const Swarm = ({ children, ...options }) => {
  const { dht } = useDHT()
  const [swarm, setSwarm] = useState(null)

  useEffect(() => {
    if (!dht) return

    const swarm = new Hyperswarm({
      keyPair: dht.defaultKeyPair,
      ...options,
      dht
    })

    setSwarm(swarm)

    return () => {
      swarm.destroy().catch(safetyCatch) // Run on background
    }
  }, [dht])

  return React.createElement(
    SwarmContext.Provider,
    { value: { swarm } },
    children
  )
}

export const useSwarm = () => {
  const context = useContext(SwarmContext)

  if (context === undefined) {
    throw new Error('useSwarm must be used within a Swarm component')
  }

  return context
}

export const useReplicate = (core, deps = []) => {
  const { swarm } = useSwarm()
  const [replicate, setReplicate] = useState(false)

  useEffect(() => {
    if (!swarm || !core || core.closed) return

    let cleanup = false
    let session = null

    const onsocket = socket => core.replicate(socket)
    const ready = core.ready().catch(safetyCatch)

    ready.then(() => {
      if (cleanup) return

      session = swarm.session({ keyPair: swarm.keyPair })

      // + done could be outside of ready
      const done = core.findingPeers()
      session.on('connection', onsocket)
      session.join(core.discoveryKey, { server: false, client: true })
      session.flush().then(done, done)

      setReplicate(true)
    })

    return () => {
      cleanup = true

      if (!session) return

      session.destroy().catch(safetyCatch) // Run on background

      // + should setReplicate(false, swarm destroy) first?
      setReplicate(false)
    }
  }, [swarm, core, ...deps])

  return { replicate }
}
