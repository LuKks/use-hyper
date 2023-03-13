import { useEffect, useState } from 'react'
import DHT from '@hyperswarm/dht-relay'
import Stream from '@hyperswarm/dht-relay/ws'
import b4a from 'b4a'
import useKey from './key.mjs'

// + probably a global WebSocket instance?

export default function useDHT () {
  const [primaryKey] = useKey()
  const [dht, setDHT] = useState(null)

  useEffect(() => {
    if (primaryKey === null) return

    const seed = b4a.from(primaryKey, 'hex')
    const keyPair = DHT.keyPair(seed)

    const ws = new window.WebSocket('wss://dht1-relay.leet.ar:49443') // + add more relays
    const dht = new DHT(new Stream(true, ws), {
      keyPair
    })

    setDHT(dht)

    return () => {
      dht.destroy()
      setDHT(null)
    }
  }, [primaryKey])

  return [dht]
}
