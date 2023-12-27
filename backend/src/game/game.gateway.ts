import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayDisconnect } from '@nestjs/websockets';
// import { Socket, Server } from 'socket.io';
import { Room } from './infos.dto';
import  GameQueue  from './gamequeue';
import  GameRoom  from './gameroom';
import { Socket } from 'socket.io';

// @WebSocketGateway({ cors : true, namespace : '/game' })
// export class GameGateway implements OnGatewayDisconnect{
//   private queue: GameQueue;
//   private room: GameRoom;

//   constructor() {
//     this.queue = new GameQueue();
//     this.room = new GameRoom();
//   }

//   @SubscribeMessage('AddUserToRoom')
//   handlequeue(client: Socket): void {
//     const match = this.queue.addPlayerToQueue(client);
//     if (match){
//       this.queue.emptyplayers();
//       this.room.startgame(match);
//     }
//   }

//   @SubscribeMessage('dataofmouse')
//   handlemouse(client: Socket, position: number): void {
//     this.room.setmouseposition(client, position);
//   }

//   handleDisconnect(clinet: Socket){
//     this.queue.userquit(clinet);
//     this.room.userdisconnect(clinet);
//   }
// }
