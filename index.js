import { once } from 'node:events'
import assert from 'node:assert'

export default async function write (stream, chunk) {
  assert(stream.writable, 'Stream is not writable')

  if (!stream.write(chunk)) {
    const controller = new AbortController()
    await Promise.race([
      once(stream, 'drain', controller.signal),
      once(stream, 'finish', controller.signal)
    ])
    controller.abort()
  }
  return stream.writable
}
