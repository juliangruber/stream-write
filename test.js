import write from './index.js'
import { Writable } from 'node:stream'
import test from 'test'
import assert from 'node:assert'

test('write', async () => {
  let lastChunk

  const writable = new Writable({
    highWaterMark: 0 // force immediate backpressure
  })

  writable._write = (chunk, _, done) => {
    setTimeout(() => {
      lastChunk = chunk.toString()
      done()
    }, 10)
  }

  await write(writable, 'foo')
  assert.strictEqual(lastChunk, 'foo')

  await write(writable, 'bar')
  assert.strictEqual(lastChunk, 'bar')
})

test('error', async () => {
  const writable = new Writable()
  writable._write = (_, __, done) => {
    done(new Error())
  }

  await assert.rejects(write(writable, '*ducks*'))
})

test('end', async () => {
  const writable = new Writable({
    highWaterMark: 0 // no queuing
  })
  let writeTime = 0
  writable._write = (_, __, done) => {
    setImmediate(() => {
      done()
      writeTime++
      if (writeTime === 2) {
        writable.writable = false
        writable.end()
      }
    })
  }

  let more = await write(writable, 'foo')
  assert.strictEqual(more, true)
  more = await write(writable, 'bar')
  assert.strictEqual(more, false)
  await assert.rejects(write(writable, 'bar'))
})

test('socket closed', async () => {
  const writable = new Writable()
  writable.socket = { writable: false }

  await assert.rejects(write(writable, 'foo'))
})

test('listener cleanup', async () => {
  const writable = new Writable()
  writable._write = (_, __, done) => done()
  const listeners = () => {
    return {
      error: writable.listeners('error'),
      drain: writable.listeners('drain'),
      finish: writable.listeners('finish')
    }
  }

  const before = listeners()
  await write(writable, 'foo')
  assert.deepEqual(listeners(), before)
})
