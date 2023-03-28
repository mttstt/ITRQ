module.exports = function(socket,db) {
  //io.on("connection", (socket) => {
    //console.log("a user connected", socket.id);
    socket.on("myEvent", (data) => {
      // gestione dell'evento "myEvent"
      const response = "User connected: " + data.user_id  + " ("+ data.name +") - socket.id: " + socket.id;
      socket.emit("myResponse", response);
      //socket.emit("myResponse", socket.id);
      const query = 'UPDATE users SET status = \'connected\', socket_id = ?, connected_at = CURRENT_TIMESTAMP WHERE id = ?';
      var params = [socket.id, data.user_id];
      //console.log (query);

      db.query(query, params, (err, data) => {
        if (err) {
          console.error(err);
        }
        else {
          console.log(response);
        }
      });
    });

    socket.on("disconnect", (reason) => {
      const query = 'UPDATE users SET status = \'disconnected\', disconnected_at = CURRENT_TIMESTAMP WHERE socket_id = ?';
      var params = [socket.id];
      db.query(query, params, (err, data) => {
        if (err) {
          console.error(err);
        }
        else {
          console.log("a user disconnect", reason);
        }
      });
    });
}