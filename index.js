import { once } from 'node:events'

export default async function write(stream, chunk){
  if (!stream.writable) throw new Error('Stream is not writable');

  if (!stream.write(chunk)) {
    await Promise.race([once(stream, 'drain'), once(stream, 'finish')])
  }
  return stream.writable
};

