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
  const { swarm } = useSwarm()

  useEffect(() => {
    if (!enable || !swarm || core?.closed) return

    let session = null
    let mounted = true

    const onConnection = socket => {
      core.replicate(socket)
    }

    core.ready().then(() => {
      if (!mounted) return
      session = swarm.session({ keyPair: swarm.keyPair })
      const done = core.findingPeers()
      session.on('connection', onConnection)
      session.join(core.discoveryKey, { server: false, client: true })
      session.flush().then(done, done)
    })

    return () => {
      mounted = false
      if (!session) return
      session.off('connection', onConnection)
      session.leave(core.discoveryKey)
      session.destroy().catch(safetyCatch) // Run on background
    }
  }, [swarm, core, enable, ...deps])

  return { swarm, core }
}
