import { v4 as uuidv4 } from 'uuid';
import Player from './Player.js';
import Role from './Role.js';
import Room from './Room.js';

class Game {

    constructor(users) {
        this.gameId = uuidv4();
        this.users = users;

        //create array of players
        this.players = [];
        this.initialisePlayers(users);

        //create array of rooms
        this.rooms = [];
        this.initialiseRooms();

        this.status = "pregame";
        this.gameState = 'Day';
        //create timer
    }


    initialisePlayers(users) {
        const roles = this.randomiseRoles(users.length);
        if (roles) {
            for (let i = 0; i < users.length; i++) {
                let player = new Player(i, users[i], users[i].name, new Role(roles[i]));
                this.players.push(player);
            }
            // console.log("players: ", this.players);
            console.log(`${users.length} given roles`);

        } else {
            console.log("Not enough players");
        }

    }

    randomiseRoles(numOfPlayers) {

        if (numOfPlayers < 5) return false;

        const result = [];

        const alignments = {
            bad: 1,
            good: 2,
        }

        alignments.bad = parseInt(numOfPlayers / (alignments.bad + alignments.good));
        alignments.good = numOfPlayers - alignments.bad;


        const goodRoles = {
            doctor: 1,
            cop: 1,
            civilian: 0,
        }

        goodRoles.civilian = alignments.good - goodRoles.doctor - goodRoles.cop;

        const badRoles = {
            mafia: alignments.bad,
        }

        for (const key in goodRoles) {
            let i = 0;
            let n = goodRoles[key];
            for (i = 0; i < n; i++) {
                result.push(key);
            }
        }

        for (const key in badRoles) {
            let i = 0;
            let n = badRoles[key];
            for (i = 0; i < n; i++) {
                result.push(key);
            }
        }

        result.sort(() => .5 - Math.random());

        return result;

    }

    initialiseRooms() {
        //create the mafia room
        this.rooms.push(new Room("mafia room"));

        //create the townhall
        this.rooms.push(new Room("town hall"));

        //get all players in the townhall
        for (const player of this.players) {
            this.joinRoom(player, "town hall");
        }

        //tell all users to navigate to game
        for (const user of this.users) {
            user.joinGame(this.gameId);
            //console.log("user trying to join a game");
        }


    }

    getData() {
        let jsonUsers = [];
        for (let user of this.users) {
            jsonUsers.push(user.getData());
        }

        let jsonPlayers = [];
        for (let player of this.players) {
            jsonPlayers.push(player.getPlayer())
        }
        return {
            gameId: this.gameId,
            users: jsonUsers,
            players: jsonPlayers,
            rooms: this.rooms,
            status: this.status,
            gameState: this.gameState
        }
    }

    joinRoom(player, room) {
        //get the room
        for (let rm of this.rooms) {
            if (rm.roomName == room) {
                //add user to socket channel
                rm.add(player);
            }
        }
    }


}

export default Game;