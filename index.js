
module.exports = function write(stream, chunk, cb){
  var errored = false;

  stream.once('error', error);
  function error(err){
    errored = true;
    cb(err);
  }

  if (stream.socket && !stream.socket.writable) {
    var err = new Error('write after end');
    err.status = 200;
    setImmediate(cb.bind(null, err));
    return;
  }

  if (stream.write(chunk)) {
    stream.removeListener('error', error);
    if (errored) return;
    setImmediate(cb.bind(null, null, stream.writable));
  } else {
    stream.once('drain', next);
    stream.once('finish', next);

    function next(){
      stream.removeListener('error', error);
      stream.removeListener('drain', next);
      stream.removeListener('finish', next);
      cb(null, stream.writable);
    }
  }
};

