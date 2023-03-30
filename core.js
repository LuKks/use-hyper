import React, { useEffect, useState, useRef, useContext, createContext } from 'react'
import Hypercore from 'hypercore'
import safetyCatch from 'safety-catch'

const CoreContext = createContext()

const EVENTS = [
  'ready',
  'append',
  'close',
  'peer-add',
  'peer-remove',
  'truncate'
]

export const Core = ({ children, storage, publicKey, ...options }) => {
  const [core, setCore] = useState(null)
  const deps = Object.values(options)

  useEffect(() => {
    if (!storage) return

    const core = new Hypercore(storage, publicKey, options)
    const onready = () => setCore(core)
    core.once('ready', onready)

    return () => {
      core.off('ready', onready)
      core.close().catch(safetyCatch)
    }
  }, [storage, publicKey, ...deps])

  if (!core) return null

  return React.createElement(
    CoreContext.Provider,
    { value: { core } },
    children
  )
}

export const useCore = () => {
  const context = useContext(CoreContext)

  if (context === undefined) {
    throw new Error('useCore must be used within a Core component')
  }

  return context
}

export const useCoreEvent = (event, cb) => {
  const { core } = useCore()
  const fn = useRef(cb)

  useEffect(() => {
    fn.current = cb
  }, [cb])

  useEffect(() => {
    if (!core) return

    const listener = (a, b, c) => fn.current(a, b, c)
    core.on(event, listener)

    return () => core.off(event, listener)
  }, [core, event])
}

export const useCoreWatch = (events = EVENTS) => {
  const { core } = useCore()
  const [onwatch, setUpdated] = useState(0)

  const length = useRef(0)
  const peers = useRef(0)

  useEffect(() => {
    length.current = 0
    peers.current = 0
  }, [core])

  useEffect(() => {
    if (!core) return

    const onchange = () => {
      length.current = core.length
      peers.current = core.peers.length

      setUpdated(i => i + 1)
    }

    for (const event of events) core.on(event, onchange)

    // Try to trigger the initial change
    if (events.includes('ready') && core.opened) onchange()
    else if (events.includes('close') && core.closed) onchange()
    else if (events.includes('append') && length < core.length) onchange()
    else if (events.includes('peer-add') && peers < core.peers.length) onchange()
    else if (events.includes('peer-remove') && peers > core.peers.length) onchange()

    return () => {
      for (const event of events) core.off(event, onchange)
    }
  }, [core, ...events])

  return { onwatch }
}
