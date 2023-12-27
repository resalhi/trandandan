import { Socket } from 'socket.io';
import { Room } from './infos.dto';
import { update } from './gamealgo'

export default class GameRoom  {
    private rooms: Room[];

    constructor() {
        this.rooms = [];
    }
    setdata(room: Room): any{
        let data = {
            user1: {
                socket: room.user1.socket.id,
                x: room.user1.x,
                y: room.user1.y,
                score: room.user1.score,
                status: room.user1.status
            },
            user2: {
                socket: room.user2.socket.id,
                x: room.user2.x,
                y: room.user2.y,
                score: room.user2.score,
                status: room.user2.status
            },
            ball: {
                x: room.ball.x,
                y: room.ball.y
            },
            delay: room.delay
        };
        return data;
    }
    startgame(players: Socket[]): void{
        let room: Room = this.addroom(players);
        
        const gameloop = () => {
            let data = this.setdata(room);
            if (room.timer <= 120) {
                if (!(room.timer % 40)) {
                  if (room.delay) {
                    room.delay -= 1;
                  }
                }
                room.timer += 1;
                room.user1.socket.emit('userposition', data);
                room.user2.socket.emit('userposition', data);
                return;
            }
            room = this.getroom(room.user1.socket);
            room = update(room);
            data = this.setdata(room);
            room.user1.socket.emit('userposition', data);
            room.user2.socket.emit('userposition', data);
            this.setroom(room);
            if (room.user1.status || room.user2.status){
                room.user1.socket.disconnect();
                room.user2.socket.disconnect();
                clearInterval(room.interval);
            }
        }
        room.interval = setInterval(gameloop, 1000/60);
    }
    addroom(players: Socket[]): Room{
        const room: Room = { 
            user1: {
                socket: players[0],
                score : 0,
                x : 0,
                y : 400,
                status: false
            },
            user2: {
                socket: players[1],
                score : 0,
                x : 1390,
                y : 400,
                status: false
            },
            ball : {
                x: 700,
                y: 400,
                speed: 10,
                velocityX: -5,
                velocityY: -5,
            },
            delay: 3,
            timer: 0,
            interval: 0,
            width: 1400,
            height: 800
        };
        this.rooms.push(room);
        return room;
    }
    getroom(client: Socket): Room | null{
        let i=0;
        while (i<this.rooms.length){
            if (this.rooms[i].user1.socket.id == client.id || this.rooms[i].user2.socket.id == client.id )
                return this.rooms[i];
            i++;
        }
        return null;
    }
    setroom(room: Room): void{
        let i=0;
        while (i<this.rooms.length){
            if (this.rooms[i].user1.socket.id == room.user1.socket.id && this.rooms[i].user2.socket.id == room.user2.socket.id ){
                this.rooms[i] = room;
                return;
            }
            i++;
        }
    }
    setmouseposition(client: Socket, position: number): void{
        let i=0;
        while (i<this.rooms.length){
            if (this.rooms[i].user1.socket.id == client.id){
                this.rooms[i].user1.y = position;
                return ;
            }
            else if (this.rooms[i].user2.socket.id == client.id){
                this.rooms[i].user2.y = position;
                return ;
            }
            i++;
        }
    }
    userdisconnect(client: Socket): void{
        let room = this.getroom(client);
        if (room){
            if (room.user1.score != 5 && room.user2.score != 5){
                if (room.user1.socket.id == client.id)
                    room.user2.status=true;
                else if (room.user2.socket.id == client.id)
                    room.user1.status=true;
                let data = this.setdata(room);
                if (room.user1.status)
                    room.user1.socket.emit('userposition', data);
                if (room.user2.status)
                    room.user2.socket.emit('userposition', data);
                
                room.user1.socket.disconnect();
                room.user2.socket.disconnect();
            }
            clearInterval(room.interval);
            this.rooms = this.rooms.filter(item => item !== room);
        }
    }
}
