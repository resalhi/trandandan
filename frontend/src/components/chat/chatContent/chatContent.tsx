"use client";
import "./chatContent.css";

import TopBar from "./topbar/topbar";

import { use, useEffect } from "react";
import { useState } from "react";
import socket from "@services/socket";
import { useIsDirectMessage } from "@/store/userStore";
import { useChannleTypeStore } from "@/store/channelStore";
import useRecieverStore from "@/store/recieverStore";
import useMessageStore from "@/store/messagesStore";
import useUsernameStore from "@/store/usernameStore";


type User = {
  username: string;
  avatarUrl: string;
};

export default function ChatContent({ user, channel, channelId }: { user: any, channel: any, channelId: any }) {
  const [messageInput, setMessageInput] = useState(""); // State for input field
  const [recieverMessages, setRecieverMessages] = useState<{ user: User; sender: string; channel: string; message: string }[]>([]);
  const [senderMessages, setSenderMessages] = useState<{ user: User; sender: string; channel: string; message: string }[]>([]);
  const [avaterUser, setAvaterUser] = useState("");
  const [NameUser, setNameUser] = useState("");
  const [avaterReciever, setAvaterReciever] = useState("");
  const {username, setUsername} =  useUsernameStore();
  const { isDirectMessage, setIsDirectMessage } = useIsDirectMessage();
  const { reciever, setReciever } = useRecieverStore();
  const [arrayMessages, setArrayMessages] = useState<any>([]);
  const [isBlockUser, setBlockUser] = useState(false);
  const [serverChannel, setServerChannel] = useState("");
  const [password, setPassword] = useState("");
  const [isProtected, setIsProtected] = useState(false);
  const [isCorrectPassword, setIsCorrectPassword] = useState(false);
  const [showWrongPassword, setShowWrongPassword] = useState(false);
  const [youAreBaned, setYouAreBaned] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  async function fetchUsername() {
    const storedUserData = sessionStorage.getItem("user-store");
    if (storedUserData) {
      try {
        const userData = await JSON.parse(storedUserData);
        if (!userData) return;
        const saveusername = userData.state.user?.username;
        setUsername(saveusername);
      } catch (error) {
        console.error("Error parsing stored data:", error);
      }
    } else {
      console.warn("User data not found in session storage.");
    }
  }
  

  useEffect(() => {
    // Search for the username and set it in the state
    fetchUsername(); // Fetch the username
  }, []); 

  //----------- handle key down ----------------
  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevents the default behavior (e.g., new line) for the Enter key
      sendMessage();
    }
  };
  
  
  //----------- send message ----------------

  const sendMessage =  () => {
    // Send the message input to the serv   
    if (messageInput === "") return;
    
    if (!isDirectMessage) {
      socket.emit("channelMessage", {
        sender: username,
        channel: channel,
        channelId: channelId,
        message: messageInput,
      });
      socket.on("channelMessage", (data :any) => {
        if (data || !isProtected) {
          handlelistChannelMessages();
        }
      });
    } else {
      socket.emit("directMessage", {
        sender: username,
        reciever: reciever,
        message: messageInput,
      });
      socket.on("directMessage", (data) => {
        
        if (data) {
          handlelistDirectMessages();
        }
      });
    }
    
    setMessageInput("");
  };

  // ----------- check if channel is protected ----------------
  const checkIfChannelIsProtected = () => {

    console.log("checkIfChannelIsProtected")
      socket.emit("checkPassword", {
          channelId: channelId,
          sender: username,
          password: password
         });
      socket.on("checkPassword", (data) => {
        if (data)
        {
          setIsProtected(false);
          setIsCorrectPassword(true);
          return;
        }
        else{
          console.log("channel is protected and password is wrong1")
          setIsCorrectPassword(false);
          setShowWrongPassword(true);
          return () => {
            socket.off("checkPassword");
          }
        }
      });
  };

   //----------- handle block user ----------------

   const handleBlockUser = () => {
    socket.emit("getblockUser",  {username: username});
    socket.on("getblockUser", (data) => {
      if (data.length === 0) {
        setBlockUser(false);
        return;
      }else{
      const getblockedid = data[0]?.getblockedid;
      socket.emit("getUserById", {id: getblockedid});
      socket.on("getUserById", (data) => {
        const getblockedname = data.username;
        if (getblockedname === reciever){
          setBlockUser(true);
          setArrayMessages([]);
          return () => {
            socket.off("getUserById");
          }
        }
        else
        {
          setBlockUser(false);
        }
      });
    }
    });
  };

  

  //----------- handle list channel messages ----------------

  const handlelistChannelMessages = () => {
      // Join the channel
    socket.emit("joinChannel", { channel: channel });
    
    // Send event to get all messages from the channel
    socket.emit("listChannelMessages", {
      sender: username,
      channel: channel,
      channelId: channelId,
    });
    // List all messages from the channel
    socket.on("listChannelMessages", (data : any) => {

      handleBlockUser();
      
        if (data.msg[0]?.channel?.visibility === "protected" && !isCorrectPassword){        
          setIsProtected(true);
          return;
        }
        else if (data.msg[0]?.channel?.visibility !== "protected" || isCorrectPassword){
          setIsProtected(false);
        // Check if data.msg is an array before mapping
          const serverChannel = data.msg[0]?.channel?.name;
          const staticChannelName = channel;
          const usernameFromServer = data.msg[0]?.user?.username;
          const usernameFromSession = username;

            if (data.msg.length === 0 || serverChannel !== staticChannelName) {
              //todo i stoped here
              setSenderMessages([]);
              setRecieverMessages([]);
              setArrayMessages([]);
              return
            }
            else if (youAreBaned && channel !== "general"){
              // set a default message to show that you are baned
              let banedMessage = {
                user: {
                  username: "banned user",
                  avatarUrl: "https://static.vecteezy.com/system/resources/previews/011/912/911/non_2x/banned-poster-red-sign-locked-warning-about-blocking-online-content-deleting-user-from-social-network-account-restricting-information-web-channel-banning-use-negative-materials-vector.jpg"
                },
                message: "",
                channel: "baned",
                sender: "banned user"
              }
              // setSenderMessages([banedMessage]);
              setRecieverMessages([banedMessage]);
              return
            }else if (isMuted && channel !== "general"){
              // set a default message to show that you are muted
              let muteMessage = {
                user: {
                  username: "muted user",
                  avatarUrl: "https://static.vecteezy.com/system/resources/previews/011/912/911/non_2x/banned-poster-red-sign-locked-warning-about-blocking-online-content-deleting-user-from-social-network-account-restricting-information-web-channel-banning-use-negative-materials-vector.jpg"
                },
                message: "",
                channel: "muted",
                sender: "you have been muted"
              }
              setSenderMessages([]);
              setRecieverMessages([muteMessage]);
              return
            } else if (serverChannel === staticChannelName){
              
              if (usernameFromServer !== usernameFromSession) {
                // i return 2 arrays one for the sender and the other for the reciever and i check if the username is the sender or the reciever to set the messages
                setSenderMessages(data.msg);
                setAvaterUser(data.msg[0]?.user.avatarUrl);
                setNameUser(user?.username);
                // clear the reciever messages
                setRecieverMessages([]);
              } else {
                if (isBlockUser && isDirectMessage){
                  let emptyMessage = {
                    user: {
                      username: "no messages",
                      avatarUrl: "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png"
                    },
                    message: "blocked user, no messages",
                    channel: "blocked user, no messages",
                    sender: "blocked user, no messages"
                  }
                  // setSenderMessages([emptyMessage]);
                  setRecieverMessages([emptyMessage]);
          
                  return;
                }else{
                  setRecieverMessages(data.msg);
                  setAvaterReciever(data.msg[0]?.user.avatarUrl);
                  setNameUser(user?.username);
                  // clear the sender messages
                  setSenderMessages([]);
                }
              }
          }
        
    }
    });
  };

 

  //----------- handle list direct messages ----------------

  const handlelistDirectMessages = () => {
    handleBlockUser();
    if (!isBlockUser){
      socket.emit("listDirectMessages", {
        sender: username,
        reciever: reciever,
      });
      socket.on("listDirectMessages", (data) => {
        console.log("username: ", username)
        console.log("reciever: ", reciever)
        console.log("data.msg[0]?.receiver.username", data.msg[0]?.receiver.username)
        console.log("data.msg[0]?.sender.username", data.msg[0]?.sender.username)
        if (Array.isArray(data.msg)
        && username === data.msg[0]?.receiver.username ||
        username === data.msg[0]?.sender.username 
        // i did this becuase data that comes from the server it may has name of the sender or the reciever
        // and i check if the username is the sender or the reciever to set the messages
        // to avoid deplucation of messages to other users
        ) { // Array.isArray to handdle an error ecured in browser console
          setArrayMessages(data.msg);
        }
      });
    }
    else
    {
      setArrayMessages([]);
      return;
    }
  };

  //----------- check if the user is baned ----------------
  const checkIfTheUserIsBaned = () => {
    socket.emit("checkIfTheUserIsBaned", {sender: username, channelId: channelId});
    socket.on("checkIfTheUserIsBaned", (data) => {
      
      if (data && data?.user?.username === username
        && data?.channel?.name === channel
        && data?.isBanned === true){
        setYouAreBaned(true);
      }
      else{
        setYouAreBaned(false);
      }
    });
  }

  //----------- check if the user is muted ----------------
  const checkIfTheUserIsMuted = () => {
    socket.emit("checkIfTheUserIsMuted", {sender: username, channelId: channelId});
    console.log("channelId", channelId)
    socket.on("checkIfTheUserIsMuted", (data : any) => {
      if (data?.isMuted)
      {
        setIsMuted(true);
      }
      else{
        setIsMuted(false);
      }
    });
  }
  

  useEffect(() => {
    // handle online/offline status
    socket.emit("onlineStatus", { username: username, status: "online" });
    // if user click on close tab or change the url set the status to offline
    window.addEventListener('beforeunload', () => {
      socket.emit("onlineStatus", { username: username, status: "offline" });
    });

    if (isDirectMessage) {
      handlelistDirectMessages();
    }else{
      checkIfTheUserIsBaned();
      checkIfTheUserIsMuted();
      handlelistChannelMessages();
    }
    return () => {
      socket.off("listDirectMessages");
      socket.off("listChannelMessages");
      socket.off("onlineStatus");
      socket.off("checkIfTheUserIsBaned");
      socket.off("checkIfTheUserIsMuted");
      socket.off("checkPassword");
      socket.off("getUserById");
      socket.off("getblockUser");
      setArrayMessages([]);
      setSenderMessages([]);
      setRecieverMessages([]);
    }
  } , [
    isDirectMessage,
    // channel,
    channelId,
    username,
    reciever,
    isCorrectPassword,
    youAreBaned,
    ]);




  return (
    <div className="chat-content flex-1 flex flex-col overflow-hidden rounded-3xl shadow border border-gray-800 ">
      <TopBar user={user} username={username} channel={channel} />

      {/* <!-- Chat direct messages --> */}
      {isDirectMessage ? (
        <div className=" p-14 flex-1 overflow-auto">
          {
            <div>
              {arrayMessages.map((message: any, index: number) => (
                <div key={index} className="flex flex-col mb-4 text-sm">
                  <div className="flex items-center">
                    <img
                      src={message.sender.avatarUrl} // Assuming sender has an avatarUrl property
                      className="w-10 h-10 rounded-full mr-3"
                      alt={`Avatar of ${message.sender.username}`}
                    />
                    <span className="font-bold text-white">
                      {message.sender.username}
                    </span>
                  </div>
                  <p className="text-white font-sans px-14">
                    <span className="text-white font-sans">
                      {message.message}
                    </span>
                  </p>
                </div>
              ))}
              <div>
                {/* you are blocked */}
                {isBlockUser && (
                  <div className="flex items-center justify-center my-60">
                    <div className="flex items-center">
                      <img
                        src="https://static.vecteezy.com/system/resources/previews/021/432/993/original/blocked-rubber-stamp-free-png.png"
                        className="w-40 h-40 rounded-full mr-3"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
          }
          {/* <!-- A response message --> */}
        </div>
      ) : (
        // channel messages
        <div className=" p-14 flex-1 overflow-auto">
          <div className="flex flex-col mb-4 text-sm">
            {
              isProtected && !isCorrectPassword &&
              (
                 // input to enter the password

                <div className="flex items-center justify-center my-60">
                  <div className="flex items-center">
                    <div className="flex items-center justify-between">
                    <input type="text" 
                      name="password" 
                      placeholder="Enter password ..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      // onKeyDown={checkIfChannelIsProtected}
                      className="bg-slate-900 w-full my-5 rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 focus:ring-offset-gray-800"
                      />
                      <button className="bg-blue-500 hover:bg-blue-700 ml-2 text-white font-bold py-2 px-4 rounded"
                      onClick={checkIfChannelIsProtected}
                      >
                        Enter
                      </button>
                      </div>
                      { showWrongPassword &&
                      <div>
                        <span className="text-red-500 font-bold ml-5 mr-5">wrong password</span>
                      </div>
                      }
                  </div>
                </div>
              )
            }
            { !isProtected && 
            senderMessages.map((message, index) => (
              <div key={index} >
                <div className="flex items-center">
                  <img
                    src={message.user?.avatarUrl}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <span className="font-bold text-white">
                    {message.user?.username}
                  </span>
                </div>
                <p className="text-white font-sans px-14">
                  <span className="text-white font-sans ">
                    {message.message}
                  </span>
                </p>
              </div>
            ))}
            { !isProtected &&
            recieverMessages.map((message, index) => (
              <div key={index}>
                <div className="flex items-center">
                  <img
                    src={message.user?.avatarUrl}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <span className="font-bold text-white">
                    {message.user?.username}
                  </span>
                </div>
                <p className="text-white font-sans px-14">
                  <span className="text-white font-sans ">
                    {message.message}
                  </span>
                </p>
              </div>
            ))}
            
          </div>
        </div>
      )}

      {/* <!-- Chat input --> */}
      {  !isProtected && 
        <div className="pb-6 px-4 flex-none">
        <div className="flex rounded-3xl  overflow-hidden 
        ">
            <input
            type="text"
            spellCheck="false"
            className="w-full border-none px-4 bg-slate-800  "
            placeholder="Write your Message "
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyDown}
            />
          <span className="text-3xl text-grey p-2 bg-slate-800"
          onClick={sendMessage}
          >
            <svg
              width="21"
              height="20"
              viewBox="0 0 21 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="fill-current h-6 w-6 block bg-slate-800 cursor-pointer hover:text-white"
              values={messageInput}
              >
              <path
                d="M11.361 9.94977L3.82898 11.2058C3.74238 11.2202 3.66112 11.2572 3.59336 11.313C3.5256 11.3689 3.47374 11.4415 3.44298 11.5238L0.845978 18.4808C0.597978 19.1208 1.26698 19.7308 1.88098 19.4238L19.881 10.4238C20.0057 10.3615 20.1105 10.2658 20.1838 10.1472C20.2571 10.0287 20.2959 9.89212 20.2959 9.75277C20.2959 9.61342 20.2571 9.47682 20.1838 9.3583C20.1105 9.23978 20.0057 9.14402 19.881 9.08177L1.88098 0.0817693C1.26698 -0.225231 0.597978 0.385769 0.845978 1.02477L3.44398 7.98177C3.47459 8.06418 3.5264 8.13707 3.59417 8.19307C3.66193 8.24908 3.74327 8.28623 3.82998 8.30077L11.362 9.55577C11.4083 9.56389 11.4503 9.58809 11.4806 9.62413C11.5109 9.66016 11.5275 9.70571 11.5275 9.75277C11.5275 9.79983 11.5109 9.84538 11.4806 9.88141C11.4503 9.91745 11.4083 9.94165 11.362 9.94977H11.361Z"
                fill="#8BABD8"
                />
            </svg>
          </span>
        </div>
      </div>
      }
      
    </div>
  );
}
