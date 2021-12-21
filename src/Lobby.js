import { v4 as uuidv4 } from 'uuid';
import Game from './Game.js';

class Lobby {

    constructor(user, name) {
        this.lobbyId = uuidv4();
        this.hostname = user.name;
        this.lobbyName = name;
        this.users = [];
        this.game = null;
    }

    addUser(user) {

        //check if the user is already in there
        for (const u of this.users) {
            if (u.userId == user.userId) return false;
        }

        this.users.push(user);
        console.log(`${user.name} has been added to lobby ${this.lobbyId}`);
        return true;
    }

    removeUser(user) {

        this.users = this.users.filter(u => u.userId != user.userId);
        console.log(`${user.name} has been removed from ${this.lobbyId}`);
        return true;
    }

    destroyLobby() {
        console.log(`${this.lobbyId} has been destroyed`);
        return true;
    }

    createGame() {
        this.game = new Game(this.users);
        console.log('Game created');
    }

    getData() {
        const jsonUsers = [];
        for (let user of this.users) {
            jsonUsers.push(user.getData());
        }
        return {
            lobbyId: this.lobbyId,
            hostname: this.hostname,
            lobbyName: this.lobbyName,
            users: jsonUsers,
            game: this.game,
        }
    }

    isUserInLobby(userId) {
        for (let user of this.users) {
            if (user.userId == userId) {
                return true;
            }
        }

        return false;
    }


}

export default Lobby;