import { useEffect, useState } from 'react'
import DHT from '@hyperswarm/dht-relay'
import Stream from '@hyperswarm/dht-relay/ws'
import b4a from 'b4a'
import primaryKey from './key.mjs'

const keyPair = DHT.keyPair(primaryKey)

// + add more relays
// + should detect WebSocket errors, etc to retry a different relay

const ws = new window.WebSocket('wss://dht1-relay.leet.ar:49443')
const stream = new Stream(true, ws)

const hyperdht = new DHT(stream, { keyPair })

export default function useDHT () {
  const [dht, setDHT] = useState(null)

  useEffect(() => {
    setDHT(hyperdht)

    return () => {
      setDHT(null)
    }
  }, [])

  return [dht]
}
