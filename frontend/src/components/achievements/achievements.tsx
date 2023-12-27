"use client";
import React from "react";
import "./achievements.css";
import Image from "next/image";

const AchievementsItem = () => {
  return (
    <div className="achievements-item">
      <Image src={"/assets/achievement.svg"} width={60} height={60} alt="" />
      <div className="achievements-info">
        <h3 className="achievements-name">Bronz Standard</h3>
        <p className="achievements-description">Score 90% or above on 100 quizzes.</p>
      </div>
    </div>
  );
};
const Achievements = () => {
  return (
    <section id="achievements" className="container">
      <h2 className="section-title">Achievements</h2>
      <div className="achievements-items">
        <AchievementsItem />
        <AchievementsItem />
        <AchievementsItem />
        <AchievementsItem />
      </div>
    </section>
  );
};

export default Achievements;
