"use client";

import CreateChannal from "../modelCreateChannal/createChannal";
import { use, useEffect, useState } from "react";
import socket from "@/services/socket";
import ListUsersFriends from "./listUsersFriends/listUsersFriends";
import { useIsDirectMessage } from "@/store/userStore";
import { useChannleIdStore, useChannleTypeStore } from "@/store/channelStore";
import useUsernameStore from "@/store/usernameStore";
import React from "react";
import { exit } from "process";

export default function ChannalAndDirectMessage({ user, switchChannelName, setChannalPageAndSavedefaultName }:
  { user: any, switchChannelName: any, setChannalPageAndSavedefaultName: any }) {

  const { isDirectMessage, setIsDirectMessage } = useIsDirectMessage();

  const { channel, setChannel } = useChannleTypeStore(); // channel name
  const { channelId, setChannelId } = useChannleIdStore(); // channel id
  const [channels, setChannels] = useState<string[]>([]); // list of channels
  const { username, setUsername } = useUsernameStore();
  const [invite, setInvite] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [inviteToChannel, setInviteToChannel] = useState([]);
  const [channelWithIdAndName, setChannelWithIdAndName] = useState<any[]>([]); // list of channelsId
  const [acceptedChannels, setAcceptedChannels] = useState<any[]>([]); // list of channelsId
  const [publicChannels, setPublicChannels] = useState<any[]>([]); // list of channelsId
  const [protectedChannel, setProtectedChannel] = useState<any[]>([]); // list of channelsId
  const [password, setPassword] = useState(''); // list of channelsId
  const [Islogout, setIslogout] = useState(false); // list of channelsId
  const [privateChannels, setPrivateChannels] = useState<any[]>([]); // list of channelsId
  // TODO: add this to costum hook
  async function fetchUsername() {
    const storedUserData = sessionStorage.getItem("user-store");
    if (storedUserData) {
      try {
        // Parse the stored data as JSON
        const userData = await JSON.parse(storedUserData);

        // Access the username property
        const saveusername = userData.state.user.username;

        setUsername(saveusername);
      } catch (error) {
        console.error("Error parsing stored data:", error);
      }
    } else {
      console.warn("User data not found in session storage.");
    }
  }

  useEffect(() => {
    fetchUsername();
  }, []);


  // This function will be passed as a prop to Child1
  const addChannel = (channelName: any, password: any) => {
    // Add the new channel name to the existing list of channels
    // setChannels([...channelWithIdAndName, channelName]);
    // encrypt password using nestjs bcrypt
    setPassword(password);
    if (username !== "") {
      socket.emit("saveChannelName", {
        channel: channelName,
        channelType: channel,
        sender: username,
        channelId: channelId,
        password: password,
      });
      socket.on("saveChannelName", (data: any) => {
        // save data to state as array
        if (channel === "private") {
          setPrivateChannels([...privateChannels, data]);
        } else if (channel === "public") {
          setPublicChannels([...publicChannels, data]);
        }
      });
    }
  };

 

  const listAcceptedChannels = () => {
    // list all accepted channels
    socket.emit("listAcceptedChannels", {
      sender: username,
    });

    socket.on("listAcceptedChannels", (data: any) => {
      const dataInfo = data;
      const Id = data?.userId;
      let isSameUser = true;
      socket.emit("getUserById", {Id});
      socket.on("getUserById", (data: any) => {
        if (data?.username !== username) {
          isSameUser = false;
          return;
        }else{
          for (let i = 0; i < dataInfo.length; i++) {
            socket.emit("getChannelById", {
              sender: username,
              id: dataInfo[i]?.idOfChannel,
            })
            socket.on("getChannelById", (data: any) => {
              setAcceptedChannels((acceptedChannels) => [...acceptedChannels, data].filter((v, i, a) => a.findIndex(t => (t?.id === v?.id)) === i));
            })
          }
        }
      })
      if (!isSameUser) {
        return;
      }
    });
  };

  const listPublicChannels = () => {
    // list all public channels
    socket.emit("listPublicChannels", {
      sender: username,
    });
    socket.on("listPublicChannels", (data: any) => {
      // if (data[0]?.user?.username !== username) return;
      setPublicChannels(data.filter((channel: any) => channel.name !== "general"));
    });


  };

  const listProtectedChannels = () => {

    // list all protected channels
    socket.emit("listProtectedChannels", {
      sender: username,
    });
    socket.on("listProtectedChannels", (data: any) => {
      if (data[0]?.user?.username !== username) return;
      setProtectedChannel(data.filter((channel: any) => channel.name !== "general"));
    });

  };

  const listPrivateChannels = () => {
    // list all private channels
    socket.emit("listPrivateChannels", {
      sender: username,
    });
    socket.on("listPrivateChannels", (data: any) => {
      if (data[0]?.user?.username !== username) return;
      setPrivateChannels(data.filter((channel: any) => channel.name !== "general"));
    });
  };


  const InviteToChannel = (channelName: any, friend: string) => {
    setIsDirectMessage(false);
    if (channelName === "general") return;
    socket.emit("sendInviteToChannel", {
      sender: username,
      friend: friend,
      channel: channelName,
      status: "pending",
    });
    socket.on("sendInviteToChannel", (data) => {
      // save data to state as array
      setInviteToChannel([...inviteToChannel, data] as any);
    });
    setInvite(!invite);
  }

  const listFriends = () => {
    setInvite(!invite);
    setIsDirectMessage(false);
    socket.emit("getAllUsers", {
      sender: username,
    });
    socket.on("getAllUsers", (data: any) => {
      // save data to state as array
      const usersArry = [];
      for (let i = 0; i < data.length; i++) {
        usersArry.push(data[i]);
      }
      // filter out the user who send the invite
      const filterOutUser = usersArry.filter((user) => user.username !== username);
      setUsers(filterOutUser);
    });
  }

  const saveCurrentChannel = (channelName: string, id: string) => {
    if (channelName === "" || id === "") return;
    setChannel(channelName);
    setChannelId(id);
    switchChannelName(channelName);
  };


  // leave channel
  const leaveChannel = (channelId: string, username: string) => {

    socket.emit("leaveChannel", {
      channelId: channelId,
      sender: username,
    });
    socket.on("leaveChannel", (data: any) => {
      setIslogout(!Islogout);
      alert("you are logged out");
    });
  };


  
  useEffect(() => {
    if (username === "") return;
    listAcceptedChannels();
    listProtectedChannels();
    listPublicChannels();
    listPrivateChannels();
    return () => { // when we use socket.off() it helps to remove the event listener when the component unmounts.
      // this is important because if we don't remove the event listener, it will continue to listen for events even after the component unmounts.
      // this can lead to memory leaks and other bugs.
      socket.off("listChannels");
      socket.off("listAcceptedChannels");
      socket.off("listPublicChannels");
      socket.off("listProtectedChannels");
      socket.off("getChannelById");
    };
  },[username, Islogout])


  return (
    <div className="list-div bg-slate-900 mr-10 ml-10 text-purple-lighter rounded-2xl overflow-hidden border border-gray-800 ">
      {/* <!-- Sidebar Header --> */}
      <div className="text-white mb-2 mt-3 px-4  lg:block flex justify-between">
        <div className="flex-auto ">
          <div className="flex items-center justify-between">
            <hr />
            <span>
              <svg
                className="w-6 h-6 text-whote opacity-75 dark:text-white cursor-pointer lg:hidden"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                channels
                <path d="M1 5h1.424a3.228 3.228 0 0 0 6.152 0H19a1 1 0 1 0 0-2H8.576a3.228 3.228 0 0 0-6.152 0H1a1 1 0 1 0 0 2Zm18 4h-1.424a3.228 3.228 0 0 0-6.152 0H1a1 1 0 1 0 0 2h10.424a3.228 3.228 0 0 0 6.152 0H19a1 1 0 0 0 0-2Zm0 6H8.576a3.228 3.228 0 0 0-6.152 0H1a1 1 0 0 0 0 2h1.424a3.228 3.228 0 0 0 6.152 0H19a1 1 0 0 0 0-2Z" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* channels  */}
      <div className="mb-8">
        <div className="px-4 mb-2 text-white flex justify-between items-center">
          <div className="opacity-40 text-white font-thin shadow-lg ">
            Channels
          </div>
          <div>
            <CreateChannal addChannel={addChannel} />
          </div>
        </div>
        <div
          className="bg-teal-dark py-4 px-4 text-gray-400 font-bold  hover:bg-slate-700 hover:text-white hover:opacity-100 rounded-2xl cursor-pointer "
          onClick={() => setChannalPageAndSavedefaultName()}
        >
          <div className="flex justify-between"
            key={"general"}
          >
            <p>
              # general
            </p>
          </div>

        </div>
        <ul className="overflow-y-auto h-[120px]">

          {
            privateChannels && privateChannels.map((channel, index) => (
              <React.Fragment key={channel?.id}>

                {
                  channel?.name && (
                    <li
                      className="bg-teal-dark py-4 px-4 text-gray-400 font-bold  hover:bg-slate-700 hover:text-white hover:opacity-100 rounded-2xl cursor-pointer"
                      key={channel?.id}
                      onClick={() => saveCurrentChannel(channel?.name, channel?.id)}
                    >
                      <div className="flex justify-between">
                        <p>

                          <span className="mr-2">
                            # {channel?.name}
                          </span>
                        </p>
                      </div>
                    </li>
                  )
                }
              </React.Fragment>
            ))
          }

         
          {
            acceptedChannels && acceptedChannels.map((channel, index) => (
              <React.Fragment key={channel?.id}>

                {
                  channel?.name && (
                    <li
                      className="bg-teal-dark py-4 px-4 text-gray-400 font-bold  hover:bg-slate-700 hover:text-white hover:opacity-100 rounded-2xl cursor-pointer"
                      key={channel?.id}
                      onClick={() => saveCurrentChannel(channel?.name, channel?.id)}
                    >
                      <div className="flex justify-between">
                        <p>

                          <span className="mr-2">
                            # {channel?.name}
                          </span>


                        </p>
                      </div>
                    </li>
                  )
                }
              </React.Fragment>
            ))
          }
          {
            publicChannels
            && publicChannels.map((channel, index) => (
              <React.Fragment key={channel?.id}>

                {
                  channel?.name && (
                    <li
                      className="bg-teal-dark py-4 px-4 text-gray-400 font-bold  hover:bg-slate-700 hover:text-white hover:opacity-100 rounded-2xl cursor-pointer"
                      key={channel?.id}
                      onClick={() => saveCurrentChannel(channel?.name, channel?.id)}
                    >
                      <div className="flex justify-between">
                        <p>

                          <span className="mr-2">
                            # {channel?.name}
                          </span>
                        </p>
                        <span
                        onClick={() => listFriends()}>
                        <svg className="w-4 h-4 text-gray-500 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                          <path d="M6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Zm11-3h-2V5a1 1 0 0 0-2 0v2h-2a1 1 0 1 0 0 2h2v2a1 1 0 0 0 2 0V9h2a1 1 0 1 0 0-2Z" />
                        </svg>
                      </span>
                      </div>
                    </li>
                  )
                }
              </React.Fragment>
            ))
          }
          {
            protectedChannel
            && protectedChannel.map((channel, index) => (
              <React.Fragment key={channel?.id}>

                {
                  channel?.name && (
                    <li
                      className="bg-teal-dark py-4 px-4 text-gray-400 font-bold  hover:bg-slate-700 hover:text-white hover:opacity-100 rounded-2xl cursor-pointer"
                      key={channel?.id}
                      onClick={() => saveCurrentChannel(channel?.name, channel?.id)}
                    >
                      <div className="flex justify-between">
                        <p>

                          <span className="mr-2">
                            # {channel?.name}
                          </span>
                        </p>
                      </div>
                    </li>
                  )
                }
              </React.Fragment>
            ))
          }
        </ul>
        {
          invite && users.length > 0 && (
            // add menu card to list all users to invite
            <>

              <div className="rounded-xl border border-gray-600 m-2">
                {
                  users.map((user, index) => {
                    return (
                      <div key={index} className="flex justify-between items-center m-2">
                        <div className="flex items-center">
                          <img
                            className="object-cover w-8 h-8 rounded-full"
                            src={user.avatarUrl}
                            alt="avatar"
                          />
                          <p className="mx-2 text-base text-gray-200  dark:text-gray-200">
                            {user.username}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <button className="px-2 py-1 mr-2 text-xs text-green-600 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-green-400"
                            onClick={() => { InviteToChannel(channel, user.username) }}
                          >
                            Invite
                          </button>
                          <button className="px-2 py-1 text-xs text-red-600 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-red-400"
                            onClick={() => { setInvite(!invite) }}
                          >
                            ignore
                          </button>
                        </div>
                      </div>
                    )
                  }
                  )
                }

              </div>
            </>
          )
        }
        {
          invite && users.length === 0 && (
            <div className="absolute top-1/4 left-1/1 z-10 w-72   bg-gray-800 rounded-xl shadow-xl flex flex-col justify-center items-center
              ">
              <p className="text-white my-5 mb-1">
                no friends to invite
              </p>
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-thin pl-4 pr-4 mb-2 py-0 rounded-full"
                onClick={() => setInvite(!invite)}
              >
                close
              </button>
            </div>
          )
        }
      </div>

      {/* direct messages */}

      <div className="mb-[420px] overflow-y-auto h-[400px]">
        <div className="px-4 mb-2 text-white flex justify-between items-center">
          <span
            className="opacity-40 text-white font-thin shadow-lg 
          "
          >
            Direct Messages
          </span>
        </div>
        <ListUsersFriends username={username} />
        {
          !isDirectMessage && (
            <div className="absolute bottom-0 left-0 z-10 ml-5">

              <button className="bg-red-500 hover:bg-red-700 text-white text-xs font-thin pl-5 pr-5 ml-5 mb-1 py-0 rounded-full "
                onClick={() => leaveChannel(channelId, username)
                }
              >
                logout
              </button>
            </div>
          )
        }
      </div>
    </div>
  );
}
