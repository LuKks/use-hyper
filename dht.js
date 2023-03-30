import React, { useEffect, useState, useContext, createContext } from 'react'
import DHTRelay from '@hyperswarm/dht-relay'
import Stream from '@hyperswarm/dht-relay/ws'
import safetyCatch from 'safety-catch'
import { primaryKey } from './key.js'

// + add more relays
// + should detect WebSocket errors, etc to retry a different relay

const DHT_RELAY_ADDRESS = 'wss://dht1-relay.leet.ar:49443'

const DHTContext = createContext()

export const DHT = ({ children, url, stream, keyPair, ...options }) => {
  const [dht, setDHT] = useState(null)

  useEffect(() => {
    let ws

    if (!stream) {
      ws = new window.WebSocket(url || DHT_RELAY_ADDRESS)
      stream = new Stream(true, ws)
    }

    keyPair = keyPair || DHTRelay.keyPair(primaryKey)
    const dht = new DHTRelay(stream, { keyPair, ...options })
    setDHT(dht)

    return () => dht.destroy().catch(safetyCatch)
  }, [stream, keyPair])

  return React.createElement(
    DHTContext.Provider,
    {
      value: { dht }
    },
    children
  )
}

export const useDHT = () => {
  const context = useContext(DHTContext)

  if (context === undefined) {
    throw new Error('useDHT must be used within a DHT component')
  }

  return context
}
