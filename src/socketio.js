const socketIO = require('socket.io');

function socketio(httpServer) {
  const io = socketIO(httpServer);

  io.on('connection', (socket) => {
    console.log('Un nuovo client si è connesso');

    socket.on('message', (data) => {
      console.log(`Messaggio ricevuto dal client: ${data}`);
      socket.emit('message', `Hai detto: ${data}`);
    });

    socket.on('disconnect', () => {
      console.log('Il client si è disconnesso');
    });
  });

  return io;
}

module.exports = socketio;