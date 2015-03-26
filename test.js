var write = require('.');
var Writable = require('stream').Writable;
var test = require('tape');

test('write', function(t){
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

  write(writable, 'foo', function(err){
    t.error(err);
    t.equal(lastChunk, 'foo');
  
    write(writable, 'bar', function(err){
      t.error(err);
      t.equal(lastChunk, 'bar');
      t.end();
    });
  });
});

test('error', function(t){
  var writable = new Writable();
  writable._write = function(chunk, _, done){
    done(new Error);
  };

  write(writable, '*ducks*', function(err){
    t.ok(err);
    t.end();
  });
});

test('end', function(t){
  var writable = new Writable({
    highWaterMark: 0 // no queuing
  });
  writable._write = function(chunk, _, done){
    setTimeout(function(){
      done();
      writable.writable = false;
      writable.end();
    }, 10);
  };

  write(writable, 'foo', function(err, more){
    t.error(err);
    t.ok(more);
    write(writable, 'bar', function(err, more){
      t.error(err);
      t.notOk(more);

      write(writable, 'bar', function(err){
        t.ok(err);
        t.end();
      });
    });
  });
});

test('socket closed', function(t){
  var writable = new Writable();
  writable.socket = { writable: false };

  write(writable, 'foo', function(err){
    t.ok(err);
    t.end();
  });
});

test('listener cleanup', function(t){
  var writable = new Writable();
  writable._write = function(_, _, done){ done() };
  var before = listeners();

  write(writable, 'foo', function(err){
    t.error(err);
    t.deepEqual(listeners(), before);
    t.end();
  });

  function listeners(){
    return {
      error: writable.listeners('error'),
      drain: writable.listeners('drain'),
      finish: writable.listeners('finish')
    };
  }
});

