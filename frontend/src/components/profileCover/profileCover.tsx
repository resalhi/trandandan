import React from "react";
import "./profileCover.css";

import Image from "next/image";
import AddFriends from "./invitations/addFriends";

interface ProfileCoverProps {
  user: any;
}

const ProfileCover = ({ user }: ProfileCoverProps) => {
  return (
    <section className="profileCover shadow-lg rounded-2xl w-100">
      <img
        alt="profil"
        src="https://st2.depositphotos.com/17620692/43225/v/450/depositphotos_432259324-stock-illustration-abstract-stripe-blue-background-dynamic.jpg"
        className="w-full mb-4 rounded-t-lg h-28"
      />
      <div className="profile-items flex flex-col items-center justify-center p-4 -mt-16">
        <div className="profile-avatar">
          <a href="#" className="relative block">
            <img
              alt="profil"
              src={user.avatarUrl}
              className="mx-auto object-cover rounded-full h-16 w-16  border-2 border-white dark:border-gray-800"
            />
          </a>
          <p className="mt-2 text-xl font-medium text-gray-800 dark:text-white">{user.username}</p>
        </div>

        <div className=" w-full p-2 mt-4 rounded-lg">
          <div className="profile-scors flex items-center justify-between text-sm text-gray-600 dark:text-gray-200">
            <p className="profile-scores_item flex flex-col">
              <Image src="/assets/level-icon.svg" alt="" width={21} height={21} />
              Level
              <span className="font-bold text-black dark:text-white">34</span>
            </p>
            <p className="profile-scores_item flex flex-col">
              <Image src="/assets/win-icon.svg" alt="" width={25} height={25} />
              Wons
              <span className="font-bold text-black dark:text-white">455</span>
            </p>
            <p className="profile-scores_item flex flex-col">
              <Image src="/assets/lost-icon.svg" alt="" width={25} height={25} />
              Lost
              <span className="font-bold text-black dark:text-white">9.3</span>
            </p>
          </div>
        </div>
        <AddFriends/>
      </div>
    </section>
  );
};

export default ProfileCover;
