"use client";

import React from "react";
import "./gameHistory.css";
import GameItem from "./gameItem/gameItem";

const GameHistory = () => {
  return (
    <section id="gameHistory">
      <h2 className="section-title">Game History</h2>
      <div className="gameHistory-items">
        <GameItem boxShadow="0px 0px 8px 0px #E04F5F" icon={"/assets/lost-icon.svg"}/>
        <GameItem boxShadow="0px 0px 8px 0px #4BAE4F" icon={"/assets/win-icon.svg"}/>
        <GameItem boxShadow="0px 0px 8px 0px #E04F5F" icon={"/assets/lost-icon.svg"}/>
        <GameItem boxShadow="0px 0px 8px 0px #4BAE4F" icon={"/assets/win-icon.svg"}/>

      </div>
    </section>
  );
};

export default GameHistory;
