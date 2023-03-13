import { useEffect, useState } from 'react'
import b4a from 'b4a'
import sodium from 'sodium-universal'

export default function useKey () {
  const [key, setKey] = useState(null)

  useEffect(() => {
    let primaryKey = window.localStorage.getItem('primary-key')

    if (primaryKey === null) {
      primaryKey = b4a.toString(randomBytes(32), 'hex')
      window.localStorage.setItem('primary-key', primaryKey)
    }

    const formatedKey = b4a.from(primaryKey, 'hex') // converts the primary key to Uint8Array

    setKey(formatedKey)
  }, [])

  return [key]
}

function randomBytes (n) {
  const buf = b4a.allocUnsafe(n)
  sodium.randombytes_buf(buf)
  return buf
}
