import React, { useEffect, useState, useContext, createContext } from 'react'
import safetyCatch from 'safety-catch'
import Hyperswarm from 'hyperswarm'
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

export const useReplicate = (core, enable = true, deps = []) => {
  const [ready, setReady] = useState(false)
  const { swarm } = useSwarm()

  useEffect(() => {
    if (core) core.ready().then(() => setReady(true))
    return () => setReady(false)
  }, [core])

  useEffect(() => {
    if (!enable || !swarm || !ready || core?.closed) return

    const session = swarm.session({ keyPair: swarm.keyPair })

    const onConnection = socket => {
      core.replicate(socket)
    }

    const done = core.findingPeers()
    session.on('connection', onConnection)
    session.join(core.discoveryKey, { server: false, client: true })
    session.flush().then(done, done)

    return () => {
      session.off('connection', onConnection)
      session.leave(core.discoveryKey)
      session.destroy().catch(safetyCatch) // Run on background
    }
  }, [swarm, core, ready, enable, ...deps])

  return { swarm, core }
}
