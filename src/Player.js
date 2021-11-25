
class Player {

    constructor(id, user, name, role) {
        this.playerId = id;
        this.user = user;
        this.name = name;
        this.role = role;

        this.status = "alive";
    }

    getPlayer() {
        return {
            playerId: this.playerId,
            user: this.user,
            name: this.name,
            status: this.status,
        }
    }


}

export default Player;