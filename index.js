import { once } from 'node:events'
import assert from 'node:assert'

export default async function write (stream, chunk) {
  assert(stream.writable, 'Stream is not writable')

  if (!stream.write(chunk)) {
    await Promise.race([once(stream, 'drain'), once(stream, 'finish')])
  }
  return stream.writable
}
