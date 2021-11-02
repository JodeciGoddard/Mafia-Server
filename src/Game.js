import { v4 as uuidv4 } from 'uuid';

class Game {

    constructor(users) {
        this.gameId = uuidv4();

        //create array of players
        this.players = [];
        this.initialisePlayers(users);

        //create array of rooms
        this.status = "pregame";
        this.gameState = 'Day';
        //create timer
    }


    initialisePlayers(users) {
        const roles = this.randomiseRoles(users.length);
        if (roles) {
            for (role of roles) {
                // const player = new Player(user.id, user.username, role);
                // this.players.push(player);
            }
            console.log("Roles: ", roles);
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


}

export default Game;