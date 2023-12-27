import { Socket } from 'socket.io';

export type userdata = {
    socket: Socket;
    score: number;
    x: number;
    y: number;
    status: boolean;
  };

export type BallData = {
    x: number;
    y: number;
    speed: number;
    velocityX: number;
    velocityY: number;
  };

export type Room = {
    user1: userdata;
    user2: userdata;
    ball: BallData;
    delay: number;
    timer: number;
    interval: any;
    width: number;
    height: number;
};
