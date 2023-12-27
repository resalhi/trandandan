import socket from "@/services/socket";
import { useRef, useEffect, useState, use } from "react";
import { useIsDirectMessage } from "@/store/userStore";
import useRecieverStore from "@/store/recieverStore";
import useMessageStore from "@/store/messagesStore";
import { tree } from "next/dist/build/templates/app-page";
import { arrayBuffer } from "stream/consumers";

export default function ListUsersFriends({ username }: { username: any }) {
  // request to get all users
  const [users, setUsers] = useState<any[]>([]);
  const { isDirectMessage, setIsDirectMessage } = useIsDirectMessage();
  const { reciever, setReciever } = useRecieverStore();
  const [friendsId, setFriendsId] = useState([]);
  const [UserName, setUserName] = useState("");
  const [showBlock, setShowBlock] = useState(false);
  const [noFriends, setNoFriends] = useState(false);
  const [color, setColor] = useState("bg-green-400");

  // fetch username from session storage
  const fetchUserName = async () => {
    const storedUserData = sessionStorage.getItem("user-store");
    if (storedUserData) {
      try {
        // Parse the stored data as JSON
        const userData = await JSON.parse(storedUserData);

        // Access the username property
        const savedUsername = userData.state.user.username;

        setUserName(savedUsername);
        console.log("savedUsername", savedUsername);
      } catch (error) {
        console.error("Error parsing stored data:", error);
      }
    } else {
      console.warn("User data not found in session storage.");
    }
  };

  useEffect(() => {
    fetchUserName();
  }, []);

  const getFriends = () => {
    socket.emit("getAllUsersFriends", { sender: username });

    socket.on("getAllUsersFriends", (data) => {
      if (data.length === 0) {
        setNoFriends(true);
      } else {
        setNoFriends(false);
      }

      const arr = [];
      for (let items of data) {
        if (items.MefriendOf?.username === UserName) {
          arr.push(items.friend);
          setUsers(arr);
        }
      }
    });
  };

  // Use useEffect with users as a dependency to trigger the copy operation
  useEffect(() => {
    getFriends();
    return () => {
      socket.off("getAllUsersFriends");
    };
  }, [UserName]);

  // save the reciever name
  const saveReceiverName = (username: string) => {
    setReciever(username);
    setIsDirectMessage(true);
  };

  const blockUser = (username: string) => {
    // UserName is the username of the user who blocked which is saved in session storage // todo ana
    socket.emit("blockUser", { willbocked: username, whoblocked: UserName });
    setShowBlock(!showBlock);
  };

  return (
    <>
      {users &&
        (Array.isArray(users) ? users : Object.keys(users)).map(
          (user: any, index) => (
            <div
              className="flex items-center justify-between py-2  hover:bg-slate-700 rounded-2xl"
              key={index}
            >
              <div
                className="flex flex-col items-center  w-16 h-16"
                onClick={() => saveReceiverName(user?.username)}
              >
                <div
                  className="flex items-center justify-between space-x-2  cursor-pointer rounded-xl"
                  key={index}
                >
                  <img
                    className="w-14 h-14 rounded-full object-cover ml-20"
                    src={user?.avatarUrl}
                    alt="avatar"
                  />
                  <div className="flex">
                    <div className="flex flex-col">
                      <span className="font-semibold text-md">
                        {user?.username}
                      </span>
                      {user?.status === "online" ? (
                        <span className="text-sm text-green-400 font-bold">
                          {user?.status}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">
                          {user?.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {showBlock && (
                    // add menu card to allow user to block or mute
                    <>
                      <div className="absolute top-[270px] left-[60px] w-56 rounded-md shadow-lg py-2 bg-white ring-1 ring-black ring-opacity-5">
                        <a
                          href="#"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          view profile
                        </a>
                        <a
                          href="#"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => blockUser(user.username)}
                        >
                          Block
                        </a>
                        <a
                          href="#"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowBlock(!showBlock)}
                        >
                          cancel
                        </a>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <span
                className="cursor-pointer pr-5"
                onClick={() => setShowBlock(!showBlock)}
              >
                <svg
                  width="31"
                  height="37"
                  viewBox="0 0 21 37"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.8457 11.3281C16.8812 11.3281 17.7207 10.3138 17.7207 9.06251C17.7207 7.81124 16.8812 6.79688 15.8457 6.79688C14.8102 6.79688 13.9707 7.81124 13.9707 9.06251C13.9707 10.3138 14.8102 11.3281 15.8457 11.3281Z"
                    fill="#FFFEFE"
                  />
                  <path
                    d="M15.8457 20.3906C16.8812 20.3906 17.7207 19.3763 17.7207 18.125C17.7207 16.8737 16.8812 15.8594 15.8457 15.8594C14.8102 15.8594 13.9707 16.8737 13.9707 18.125C13.9707 19.3763 14.8102 20.3906 15.8457 20.3906Z"
                    fill="#FFFEFE"
                  />
                  <path
                    d="M15.8457 29.4531C16.8812 29.4531 17.7207 28.4388 17.7207 27.1875C17.7207 25.9362 16.8812 24.9219 15.8457 24.9219C14.8102 24.9219 13.9707 25.9362 13.9707 27.1875C13.9707 28.4388 14.8102 29.4531 15.8457 29.4531Z"
                    fill="#FFFEFE"
                  />
                </svg>
              </span>
            </div>
          )
        )}
    </>
  );
}
