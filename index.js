import express from 'express';
import cors from 'cors';
import { json } from 'express';
//import { emit } from 'process';
import { v4 as uuidv4 } from 'uuid';
import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 5000;

const app = express();
app.set('port', PORT);

const httpServer = createServer(app);
const io = new Server(httpServer,
    {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    }
);



const allUsers = {}
const rooms = {}

app.get("/", (req, res) => {
    res.send('Server is running on PORT: ' + PORT);
});

io.on('connection', socket => {

    //add user to list of users
    if (!allUsers[socket.id]) {
        allUsers[socket.id] = { id: socket.id };
        console.log(`user connected: ${socket.id}`);
    }

    //send the user a list of rooms on request
    socket.on("get-rooms", data => {
        socket.emit("sending-rooms", rooms);
    })

    socket.on('create-room', data => {
        //creates the room in memory on the server
        const roomId = createRoom(data.hostname);
        allUsers[socket.id].room = roomId;

        //Broadcast the event to ALL connected users
        io.emit('room-created', rooms);

        //send an event to the user that created the room
        socket.emit("you-created-a-room", roomId);

        console.log("new room created:", rooms);
    });

    socket.on('join-room', data => {
        //put user in a channel with id=roomid
        socket.join(data.roomId);

        //update user info
        allUsers[socket.id].room = data.roomId;
        allUsers[socket.id].username = data.username;

        //update room info
        rooms[data.roomId].users.push(allUsers[socket.id]);

        //broadcast to the room that new user joined
        socket.broadcast.emit('user-joined-room', { id: socket.id, username: data.username });

        //  console.log('joining..', data);
    })

    //handle request for the room
    socket.on('get-room', roomId => {
        //console.log("requested: ", roomId);
        const room = rooms[roomId];

        //check if the user is in the room it is requesting
        if (allUsers[socket.id].room == roomId) {
            socket.emit('sending-room', room);
            console.log('correct room request');
        } else {
            console.log('illegal room request');
        }

    })

    socket.on("sending signal", payload => {
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerId: payload.callerId });
    });

    socket.on("returning signal", payload => {
        io.to(payload.callerId).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    })


    socket.on('disconnect', () => {
        //remove user from current room
        let roomId = allUsers[socket.id].room;
        if (roomId) {
            let users = rooms[roomId].users.filter(user => user.id !== socket.id);
            rooms[roomId].users = users;
        }


        //remove user from 'allUsers'
        delete allUsers[socket.id];

        console.log(`disconnected: ${socket.id}`);
    })



})


httpServer.listen(PORT, () => {
    console.log(`Server listening on PORT: ${PORT}`);
});


function createRoom(host = 'default') {
    const newRoomId = uuidv4();
    rooms[newRoomId] = { host: host, id: newRoomId, users: [] };
    return newRoomId;
}