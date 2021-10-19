var write = require('.');
var Writable = require('stream').Writable;
var test = require('baretest')(require('./package.json').name);
var assert = require('assert')

test('write', async function(){
  var lastChunk;

  var writable = new Writable({
    highWaterMark: 0 // force immediate backpressure
  });

  writable._write = function(chunk, _, done){
    setTimeout(function(){
      lastChunk = chunk.toString();
      done();
    }, 10);
  };

  await write(writable, 'foo')
  assert.equal(lastChunk, 'foo');
  
  await write(writable, 'bar')
  assert.equal(lastChunk, 'bar');
});

test('error', async function(){
  var writable = new Writable();
  writable._write = function(chunk, _, done){
    done(new Error);
  };

  await assert.rejects(write(writable, '*ducks*'))
});

test('end', async function(){
  var writable = new Writable({
    highWaterMark: 0 // no queuing
  });
  var writeTime = 0
  writable._write = function(chunk, _, done){
    setImmediate(function(){
      done();
      writeTime++
      if (writeTime === 2) {
        writable.writable = false;
        writable.end();
      }
    });
  };

  var more = await write(writable, 'foo')
  assert.equal(more, true)
  var more = await write(writable, 'bar')
  assert.equal(more, false);
  await assert.rejects(write(writable, 'bar'))
});

test('socket closed', async function(){
  var writable = new Writable();
  writable.socket = { writable: false };

  await assert.rejects(write(writable, 'foo'))
});

test('listener cleanup', async function(){
  var writable = new Writable();
  writable._write = function(_, _, done){ done() };
  var before = listeners();

  await write(writable, 'foo')
  assert.deepEqual(listeners(), before);

  function listeners(){
    return {
      error: writable.listeners('error'),
      drain: writable.listeners('drain'),
      finish: writable.listeners('finish')
    };
  }
});

!(async function() {
  await test.run()
})()
