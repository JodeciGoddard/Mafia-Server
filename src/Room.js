import { v4 as uuidv4 } from 'uuid';

class Room {
    constructor(name) {
        this.roomName = name;
        this.roomId = uuidv4();
        this.members = [];
    }

    getMembers() {
        return this.members;
    }

    add(player) {
        if (player) {
            this.members.push(player);
            player.user.socket.emit('joined-channel', this.roomId);
        }
    }
}

export default Room;