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
      // + should setCore(null, core close)?
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
    if (!core || core.closed) return

    const listener = (a, b, c) => fn.current(a, b, c)
    core.on(event, listener)

    return () => core.off(event, listener)
  }, [core, event])
}

export const useCoreWatch = (events = EVENTS) => {
  const { core } = useCore()
  const [onwatch, setUpdated] = useState(0)

  useEffect(() => {
    if (!core || core.closed) return

    const onchange = () => setUpdated(i => i + 1)
    events.forEach(event => core.on(event, onchange))
    onchange()

    return () => events.forEach(event => core.off(event, onchange))
  }, [core, events])

  return { onwatch }
}
