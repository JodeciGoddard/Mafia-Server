import Lobby from "./Lobby.js";

class User {

    constructor(socket, name) {
        this.name = name;
        this.socket = socket;
        this.userId = socket.id;

    }

    createLobby(lobbyName = 'default') {
        return new Lobby(this, lobbyName);
    }

    getData() {
        return {
            name: this.name,
            userId: this.userId,
        }
    }

    joinGame(gameId) {
        this.socket.emit("join-game", gameId);
    }
}

export default User;