const { once } = require('events')

module.exports = async function write(stream, chunk){
  if (!stream.writable) {
    var err = new Error('Stream is not writable');
    err.status = 200;
    throw err
  }

  if (!stream.write(chunk)) {
    await Promise.race([once(stream, 'drain'), once(stream, 'finish')])
  }
  return stream.writable
};

