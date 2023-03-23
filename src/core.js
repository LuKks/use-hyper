import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  createContext
} from 'react'
import safetyCatch from 'safety-catch'
import Hypercore from 'hypercore'

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
  const [ready, setReady] = useState(false)
  const deps = Object.values(options)

  useEffect(() => {
    if (!storage) return

    const core = new Hypercore(storage, publicKey, options)
    setCore(core)

    core.ready().then(() => setReady(true))

    return () => {
      core.close().catch(safetyCatch)
      setCore(null)
      setReady(false)
    }
  }, [storage, publicKey, ...deps])

  if (!core || !ready) return null

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
  const { core, ready } = useCore()
  const fn = useRef(cb)

  useEffect(() => {
    fn.current = cb
  }, [cb])

  useEffect(() => {
    if (!ready || core?.closed) return

    const listener = event => fn.current(event)
    core.on(event, listener)

    return () => {
      core.off(event, listener)
    }
  }, [ready, event, core])

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
