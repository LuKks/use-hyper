import b4a from 'b4a'
import sodium from 'sodium-universal'

let primaryKey = window.localStorage.getItem('primary-key')

if (primaryKey === null) {
  primaryKey = b4a.toString(randomBytes(32), 'hex')
  window.localStorage.setItem('primary-key', primaryKey)
}

primaryKey = b4a.from(primaryKey, 'hex')

export { primaryKey }

function randomBytes (n) {
  const buf = b4a.allocUnsafe(n)
  sodium.randombytes_buf(buf)
  return buf
}
