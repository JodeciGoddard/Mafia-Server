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
    res.send('Server is running');
});

app.get("/getGames", (req, res) => {
    res.send(rooms);
})

io.on('connection', (socket) => {
    console.log(`${socket.id} has connected`);

    socket.on('disconnect', () => {
        console.log(`${socket.id} has disconnected`)
    })

    socket.on('join-room', (roomId, user) => {
        //once a new user connects
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', user);
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].id === roomId) {
                rooms[i]['players'] = [...rooms[i]['players'], user];
            }
        }
        socket.emit('enter-room', roomId);
    })

    socket.on('createRoom', data => {
        let room = { host: data.username, id: uuidV4(), players: [] }
        rooms.push(room);
        console.log("rooms: ", rooms);
        socket.emit('room-created', room);

    })



});



server.listen(PORT, () => {
    console.log(`Server listening on PORT: ${PORT}`);
});

