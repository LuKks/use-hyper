import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  createContext
} from 'react'
import Hypercore from 'hypercore'

const CoreContext = createContext()

const noop = () => {}
const EVENTS = [
  'ready',
  'append',
  'close',
  'peer-add',
  'peer-remove',
  'truncate'
]

export const Core = ({ children, storage, coreKey, ...options }) => {
  const [core, setCore] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!storage) return
    const core = new Hypercore(storage, coreKey, options)
    setCore(core)

    core.ready().then(() => setReady(true))

    return () => {
      core.close().catch(noop)
    }
  }, [storage, coreKey])

  return React.createElement(
    CoreContext.Provider,
    { value: { core, ready } },
    children
  )
}

export const useCore = () => {
  const context = useContext(CoreContext)

  if (context === undefined) {
    throw new Error('useCore must be used within a Core component llll')
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
    if (!core?.opened || core?.closed) return

    const listener = event => fn.current(event)
    core.on(event, listener)

    return () => {
      core.off(event, listener)
    }
  }, [event, core])

  return { core }
}

export const useCoreWatch = (events = EVENTS) => {
  const { core, ready } = useCore()
  const [, update] = useState(0)

  useEffect(() => {
    if (!ready || core?.closed) return

    const onchange = () => update(i => i + 1)
    events.forEach(event => core.on(event, onchange))
    onchange()
    return () => events.forEach(event => core.off(event, onchange))
  }, [core, ready, events])

  return { core }
}
