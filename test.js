import write from './index.js'
import { Writable } from 'node:stream'
import test from 'test'
import assert from 'node:assert'

test('write', async function () {
  let lastChunk

  const writable = new Writable({
    highWaterMark: 0 // force immediate backpressure
  })

  writable._write = function (chunk, _, done) {
    setTimeout(function () {
      lastChunk = chunk.toString()
      done()
    }, 10)
  }

  await write(writable, 'foo')
  assert.equal(lastChunk, 'foo')

  await write(writable, 'bar')
  assert.equal(lastChunk, 'bar')
})

test('error', async function () {
  const writable = new Writable()
  writable._write = function (chunk, _, done) {
    done(new Error())
  }

  await assert.rejects(write(writable, '*ducks*'))
})

test('end', async function () {
  const writable = new Writable({
    highWaterMark: 0 // no queuing
  })
  let writeTime = 0
  writable._write = function (chunk, _, done) {
    setImmediate(function () {
      done()
      writeTime++
      if (writeTime === 2) {
        writable.writable = false
        writable.end()
      }
    })
  }

  let more = await write(writable, 'foo')
  assert.equal(more, true)
  more = await write(writable, 'bar')
  assert.equal(more, false)
  await assert.rejects(write(writable, 'bar'))
})

test('socket closed', async function () {
  const writable = new Writable()
  writable.socket = { writable: false }

  await assert.rejects(write(writable, 'foo'))
})

test('listener cleanup', async function () {
  const writable = new Writable()
  writable._write = function (_, __, done) { done() }
  const before = listeners()

  await write(writable, 'foo')
  assert.deepEqual(listeners(), before)

  function listeners () {
    return {
      error: writable.listeners('error'),
      drain: writable.listeners('drain'),
      finish: writable.listeners('finish')
    }
  }
})
