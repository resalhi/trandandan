import { Socket } from 'socket.io';

export default class GameQueue {
    private players: Socket[];

    constructor() {
        this.players = [];
    }

    addPlayerToQueue(client: Socket): Socket[] | null {
        // client.emit('wait', "Wait for other player...");
        if (this.players.length > 0){
            if (this.players[0].id == client.id)
                return null;
        }
        this.players.push(client);
        if (this.players.length != 2){
            return null;
        }
        this.players[0].emit('wait', "you can play");
        this.players[1].emit('wait', "you can play");
        return this.players;
    }
    emptyplayers(){
        if (this.players.length == 2)
            this.players = [];
    }
    userquit(clinet: Socket): void{
        this.players = this.players.filter(item => item !== clinet);
    }
}