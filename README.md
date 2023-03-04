
# stream-write

  Write to streams, respecting backpressure.

## Example

  Write random numbers to an http response until it ends:

```js
import write from 'stream-write'
import http from 'node:http'

http.createServer((req, res) => {
  (async () => {
    while (true) {
      const isOpen = await write(res, String(Math.random()))
      if (!isOpen) break
    }
  })().catch(console.error)
}).listen(8000)
```

## write(stream, chunk)

  Write `chunk` to `stream` and returns a `Promise` that is resolved once `stream` is writable again, or rejects if an error happened.

  The promise's resolved value is false when `stream` ended and you should stop writing to it.

## HTTP special casing

  When an HTTP request ended, the HTTP response stays writable, only it's
  underlying socket closes. To stay consistent with other streams' behavior,
  in that case `write()` will throw an error itself.

## Installation

```bash
$ npm install stream-write
```

## License

  MIT

