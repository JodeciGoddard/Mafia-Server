import express from 'express';
import cors from 'cors';
import { json } from 'express';
//import { emit } from 'process';
import { v4 as uuidv4 } from 'uuid';
import { createServer } from 'http';
import { Server } from 'socket.io';

import User from "./src/User.js";

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
const lobbies = {}

app.get("/", (req, res) => {
    res.send('Server is running on PORT: ' + PORT);
});

io.on('connection', socket => {

    //create the user object
    const u = new User(socket, "default");

    //add user to list of users
    if (!allUsers[u.userId]) {
        allUsers[u.userId] = u;
        console.log(`user connected: ${u.userId}`);
    }

    //send the user a list of lobbies on request
    socket.on("get-lobbies", data => {
        socket.emit("sending-lobbies", lobbies);
    })

    socket.on('create-lobby', data => {
        //creates the room in memory on the server
        const u = allUsers[socket.id];
        u.name = data.username;
        const lobby = u.createLobby(data.roomName);
        lobbies[lobby.lobbyId] = lobby;


        //Broadcast the event to ALL connected users
        io.emit('lobby-created', lobbies);

        //send an event to the user that created the room
        // socket.emit("you-created-a-room", roomId);

        //console.log("you create a lobby: ", lobby);
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

    socket.on('join-lobby', data => {

        //get user and lobby
        const u = allUsers[socket.id];
        u.name = data.username;
        const lobby = lobbies[data.lobbyId];

        if (u && lobby) {
            lobby.addUser(u);
            console.log(lobby);
        }

        socket.broadcast.emit('lobbies-updated', lobbies);
        socket.emit('you-joined-lobby', lobby);
    })

    socket.on('remove-from-lobby', lobbyId => {
        //get user and lobby
        const u = allUsers[socket.id];
        const lobby = lobbies[lobbyId];

        if (u && lobby) {
            lobby.removeUser(u);
        }

        socket.broadcast.emit('lobbies-updated', lobbies);
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

    socket.on('start-game', (lobbyId) => {
        const lobby = lobbies[lobbyId];
        const u = allUsers[socket.id];

        if (lobby.hostname == u.name) {
            lobby.createGame();
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