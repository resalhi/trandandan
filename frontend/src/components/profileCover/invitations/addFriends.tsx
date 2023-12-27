"use client";
import socket from "@/services/socket";
import { useParams } from "next/navigation";
import { use, useEffect, useState } from "react";
import useUsernameStore from "@/store/usernameStore";

export default function AddFriends() {
  const { username, setUsername } = useUsernameStore();
  const [receiver, setceiverId] = useState("");
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  
  // Get the id of the user from the URL
  const params = useParams();
  const userId = params.id;
  
  const fetchUser = async () => {
    // Fetch the username from session storage
    const storedUserData = sessionStorage.getItem("user-store");
  
    if (storedUserData) {
      // Parse the stored data as JSON
      const userData = await JSON.parse(storedUserData);
  
      // Access the username property
      const savedUsername = userData.state.user?.username;
      
      // Set the username
      setUsername(savedUsername);
      const id = userId;
      socket.emit("getUserById", {
        id: id,
      }); // as sender
      socket.on("getUserById", (data) => {
      const receiver = data.username;
      setceiverId(receiver);
    });
  }
};

  useEffect(() => {  
  fetchUser();
}, []);



  const sendFriendRequest = async () => {
    try {
        // Send friend request
        socket.emit("sendFriendRequest", {
          receiverInvite: userId,
          senderInvite: username,
        });


        // get name of user
        socket.on("sendFriendRequest", (data) => {
          const receiverId = data.receiverId;
          const senderId = data.senderId;
          setceiverId(receiverId);
          
        });

        // Emit notification
        socket.emit("notification", {
          username: username,
        });

        // Update the UI to show that the request has been sent
        setFriendRequestSent(true);
        console.log("Friend request sent successfully.", username, userId);
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };



  return (
    <>
      {receiver !== username ? (
        !friendRequestSent ? (
          <button
            className="p-2 px-4 text-xs text-white font-bold w-32 bg-gray-500 border rounded-full shadow-lg"
            onClick={() => {
              sendFriendRequest();
            }}
          >
            Add Friend
          </button>
        ) : (
         null
        )
      ) : null}
    </>
  );
}