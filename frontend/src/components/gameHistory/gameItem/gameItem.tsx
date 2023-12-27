"use client";

import React from "react";
import "./gameItem.css";
import Image from "next/image";

interface GameItemProps {
    boxShadow: string;
    icon: string;
}
const GameHistory = ({boxShadow, icon}:GameItemProps) => {
    return <div className="gameHistory-item flex flex-col justify-center items-center w-full max-w-sm rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
    <div className="gameHistory-content flex flex-col items-center justify-center p-5"
        style={{boxShadow: boxShadow}}
        >
      <img
        className="w-24 h-24 mb-3 rounded-full shadow-lg"
        src="https://st2.depositphotos.com/17620692/43225/v/450/depositphotos_432259324-stock-illustration-abstract-stripe-blue-background-dynamic.jpg"
        alt="Bonnie image"
      />
      <h5 className="mb-1 text-base font-medium text-gray-900 dark:text-white">Bonnie Green</h5>
      <span className="font-bold text-lg pt-5  text-gray-500 dark:text-gray-400">5 : 9</span>
    </div>
    <Image src={icon} width={40} height={40} alt=""/>
  </div>

}

export default GameHistory;