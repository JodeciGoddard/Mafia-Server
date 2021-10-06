const app = require("express")();
const server = require('http').createServer(app);
const cors = require("cors");
const { json } = require("express");
const { v4: uuidV4 } = require('uuid');

const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let rooms = [];

app.use(cors());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send('Server is running on PORT: ' + PORT);
});

app.get("/getGames", (req, res) => {
    res.send(rooms);
})

io.on('connection', (socket) => {
    console.log(`${socket.id} has connected`);

    socket.on('disconnect', () => {
        console.log(`${socket.id} has disconnected`)

    })

    socket.on('join-room', (id, name) => {
        //once a new user connects
        socket.join(id);

        // socket.to(roomId).emit('user-connected', user);

        for (room of rooms) {

            if (room.id == id) {

                if (addPlayerToRoom(room, name)) {
                    socket.emit('enter-room', room);
                    break;
                }


            }


        }


    })

    socket.on('createRoom', data => {
        let room = { host: data.username, id: uuidV4(), players: [], log: [] }
        rooms.push(room);
        console.log("rooms: ", rooms);
        socket.emit('room-created', room);

    })

    socket.on('log', data => {
        let room = addToLog(data.roomId, data.msg);
        io.to(data.roomId).emit('room-update', room);
        console.log("new room", room);
    })

});



server.listen(PORT, () => {
    console.log(`Server listening on PORT: ${PORT}`);
});

function addToLog(roomId, msg) {
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].id === roomId) {
            rooms[i].log.push(msg);
            return rooms[i];
        }
    }
}

function addPlayerToRoom(room, name) {

    if (room.players.length == 0) {
        room.players.push({ id: 0, name: name, image: '' });
    } else {

        for (player of room.players) {
            if (player.name == name) false;
        }

        room.players.push({ id: room.players.length + 1, name: name, image: '' });

    }

    console.log("adding...... ", room.players);

    return true;

}

