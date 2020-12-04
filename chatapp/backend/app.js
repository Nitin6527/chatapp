const express = require('express');
const bodyParser = require('body-parser');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');
const port = process.env.PORT || 5000;
const router = require('./router');
const { addUser, removeUser, getUser, getUsersInRoom} = require('./users');

const app = express();

app.use(cors())

app.use(bodyParser.urlencoded({ extended: false }));

const server = http.createServer(app);
const io = socketio(server);
app.use(router);


io.on('connection', (socket) => {
    console.log('We have a new conneciton!!');

    socket.on('join',({name, room}, cb) => {
        const {error, user } = addUser({id:socket.id, name, room});
        console.log(user);


        if(error) return cb(error);

        socket.emit('message', {user:'admin', text: `${user.name}, welcome to the room ${user.room}`});
        socket.broadcast.to(user.room).emit('message', {user: 'admin', text: `${user.name}, has joined!`});

        socket.join(user.room);

        cb();
    });

    socket.on('sendMessage', (message, cb) => {
       const user = getUser(socket.id);
       io.to(user.room).emit('message', {user: user.name, text: message});
       cb();
    })

    socket.on('disconnect', () => {
        console.log('user left!');
    })
});




server.listen(port,()=>{
    console.log(`server started at port ${port}`)
})