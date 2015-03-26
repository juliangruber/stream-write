
# stream-write

  Write to streams, respecting backpressure.

  [![build status](https://secure.travis-ci.org/juliangruber/stream-write.png)](http://travis-ci.org/juliangruber/stream-write)

## Example

  Write random numbers to an http response until it ends:

```js
var write = require('stream-write');
var http = require('http');

http.createServer(function(req, res){
  (function next(){
    write(res, ''+Math.random(), function(err, open){
      if (err) throw err;
      if (open) next();
    });
  })();
}).listen(8000);
```

## write(stream, chunk, fn)

  Write `chunk` to `stream` and call `fn` once `stream` is writable again, or an error happened.

  The second parameter to `fn` is false when `stream` ended and you should stop writing to it.

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

