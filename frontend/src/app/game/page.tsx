"use client"
import { useEffect, useRef, useState } from "react";
import { Socket } from 'socket.io';
import { io } from 'socket.io-client';
import '../globals.css';

const socket:Socket = io("http://localhost:3001");

const PongGame: React.FC = () => {
  const currentuser = JSON.parse(sessionStorage.getItem("user-store"));
  const user = currentuser.state.user
  console.log(currentuser.state.user);
  const cvsRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [players, setStr2] = useState<any>({
    user1: {
      x : 0,
      y : 0,
      score : 0
    },
    user2: {
        x : 0,
        y : 0,
        score : 0
    },
    ball : {
        x: 0,
        y: 0
    },
    delay: 0
  });
  const net = {
    x: 0,
    y: 0,
    width: 2,
    height: 10,
    color: "WHITE",
  };
  
  let [string, setstr] = useState<any>("haha");
  useEffect(() => {
    const cvs = cvsRef.current;
    const ctx = cvs?.getContext("2d");
    
    ctxRef.current = ctx;
    
    if (!cvs || !ctx) return;
    const drawNet = () => {
      for (let i = 0; i <= cvs.height; i += 15) {
        drawrect(cvs.width / 2 - 1, net.y + i, net.width, net.height, net.color);
      }
    };
    
    const drawrect = (x: number, y: number, w: number, h: number, color: string) => {
      if (ctx) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
      }
    };
    
    const drawcircle = (x: number, y: number, r: number, color: string) => {
      if (ctx) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
      }
    };
    
    const drawtext = (text: any, x: number, y: number, color: string, font: string) => {
      if (ctx) {
        ctx.fillStyle = color;
        ctx.font = font;
        ctx.fillText(text.toString(), x, y);
      }
    };
    if (string != "you can play"){
      socket.emit('AddUserToRoom', user);
      const queuehundler = (str: string) => {
        setstr(str);
      }
      socket.on('wait', queuehundler);
      drawrect(0, 0, cvs.width, cvs.height, "BLACK");
      drawtext("WAIT FOR OTHER PLAYER", cvs.width / 3, cvs.height / 2, "WHITE", "50px fantasy");
    }
    if (string == "you can play"){
      const hundler = (init : any) => {
        setStr2(init);
      };
      
      socket.on('userposition', hundler);
      const move = (evt: any) => {
        let rect = cvs.getBoundingClientRect();
        
        let pos = evt.clientY - rect.top - 100;
        socket.emit('dataofmouse', pos);
      }

      cvs.addEventListener("mousemove", move);
      
      drawrect(0, 0, cvs.width, cvs.height, "BLACK");
      drawNet();
      
      drawtext(players.user1.score, cvs.width / 4, cvs.height / 5, "WHITE", "50px fantasy");
      drawtext(players.user2.score, (3 * cvs.width) / 4, cvs.height / 5, "WHITE", "50px fantasy");
      
      drawrect(players.user1.x, players.user1.y, 10, 200, "WHITE");
      drawrect(players.user2.x, players.user2.y, 10, 200, "WHITE");
      
      drawcircle(players.ball.x, players.ball.y, 15, "WHITE");
      if (players.delay)
        drawtext(players.delay, cvs.width / 2.5 , 2 * cvs.height / 3, "WHITE", "500px fantasy");
      if (players.user1.status || players.user2.status){
        let user;
        if (players.user1.socket == socket.id)
          user = players.user1;
        else
          user = players.user2;
        if (user.status)
          drawtext("YOU WON", cvs.width / 3 , cvs.height / 2, "WHITE", "100px fantasy");
        else
          drawtext("YOU LOST", cvs.width / 3 , cvs.height / 2, "WHITE", "100px fantasy");
      }

      return () => {
        socket.off('userposition', hundler);
        cvs.removeEventListener("mousemove", move);
        };
    }
    else
      string += 'a';
  }, [players, string]);

  return (
    <canvas className="canvas-container" width="1400" height="800" ref={cvsRef} ></canvas>
  );
};

export default PongGame;
