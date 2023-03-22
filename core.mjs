import { useEffect, useState } from 'react'
import Hypercore from 'hypercore'
// import b4a from 'b4a'

export default useCore

export function useCore (storage, key) {
  const [core, setCore] = useState(null)
  const [options, setOptions] = useState({})

  useEffect(() => {
    // const opts = (isOptions(args[0]) ? args[0] : args[1]) || {}

    const hypercore = new Hypercore(storage, key, options)
    setCore(hypercore)

    return () => {
      hypercore.close().catch(noop) // Run on background

      setCore(null)
    }
  }, [storage, key, options])

  return [core, setOptions]
}

export function useCoreWatch (core, cb) {
  const [coreChange, setCoreChange] = useState(0)

  useEffect(() => {
    if (core === null) return

    core.on('ready', onchange)
    core.on('close', onchange)
    core.on('append', onchange)
    core.on('peer-add', onchange)
    core.on('peer-remove', onchange)
    core.on('truncate', onchange)

    if (core.opened) onchange()

    return () => {
      core.off('ready', onchange)
      core.off('close', onchange)
      core.off('append', onchange)
      core.off('peer-add', onchange)
      core.off('peer-remove', onchange)
      core.off('truncate', onchange)
    }

    function onchange () {
      setCoreChange(count => count + 1)

      if (cb) cb()
    }
  }, [core])

  return coreChange
}

export function useCoreEvent (core, eventName, cb) {
  // + if all events are the same then it can easily be more generic
  if (eventName === 'ready') return onCoreReady(core, cb)
  if (eventName === 'close') return onCoreClose(core, cb)
  if (eventName === 'append') return onCoreAppend(core, cb)

  throw new Error('Event not supported yet: ' + eventName)
}

function onCoreReady (core, cb) {
  const [coreUpdated, setCoreUpdated] = useState(0)

  useEffect(() => {
    if (core === null || core.closed) return

    if (core.opened) {
      onready()
      return
    }

    core.on('ready', onready)
    return () => core.off('ready', onready)

    function onready () {
      setCoreUpdated(count => count + 1)

      if (cb) cb()
    }
  }, [core])

  return coreUpdated
}

function onCoreClose (core, cb) {
  const [coreUpdated, setCoreUpdated] = useState(0)

  useEffect(() => {
    if (core === null) return

    if (core.closed) {
      onclose()
      return
    }

    core.on('close', onclose)
    return () => core.off('close', onclose)

    function onclose () {
      setCoreUpdated(count => count + 1)

      if (cb) cb()
    }
  }, [core])

  return coreUpdated
}

function onCoreAppend (core, cb) {
  const [coreUpdated, setCoreUpdated] = useState(0)

  useEffect(() => {
    if (core === null) return

    core.on('append', oncallback)
    return () => core.off('append', oncallback)

    function oncallback () {
      setCoreUpdated(count => count + 1)

      if (cb) cb()
    }
  }, [core])

  return coreUpdated
}

function noop () {}

/* function isOptions (value) {
  return value && typeof value === 'object' && !b4a.isBuffer(value)
} */
